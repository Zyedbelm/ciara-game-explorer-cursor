import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApiKeyCache {
  key: string | null;
  timestamp: number;
  isValid: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

let globalCache: ApiKeyCache = {
  key: null,
  timestamp: 0,
  isValid: false
};

/**
 * Specialized hook for Google Maps API key management
 * Features persistent cache, intelligent retry, and global state
 */
export const useGoogleMapsApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isCacheValid = useCallback(() => {
    const now = Date.now();
    return globalCache.isValid && 
           globalCache.key && 
           (now - globalCache.timestamp) < CACHE_DURATION;
  }, []);

  const updateCache = useCallback((key: string | null, isValid: boolean) => {
    globalCache = {
      key,
      timestamp: Date.now(),
      isValid
    };
  }, []);

  const fetchApiKey = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Check cache first
    if (isCacheValid()) {
      console.log('✅ Using cached Google Maps API key');
      if (isMountedRef.current) {
        setApiKey(globalCache.key);
        setLoading(false);
        setError(null);
      }
      return;
    }

    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      console.log('🔑 Fetching Google Maps API key...');

      // Try environment variable first
      const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (envKey && envKey !== 'your_google_maps_api_key_here') {
        console.log('✅ API key found in environment variables');
        updateCache(envKey, true);
        if (isMountedRef.current) {
          setApiKey(envKey);
          setRetryCount(0);
        }
        return;
      }

      console.log('⚠️ No environment variable, trying Supabase function...');

      // Fallback to Supabase function
      const { data, error: supabaseError } = await supabase.functions.invoke('get-google-maps-key');

      if (!isMountedRef.current) return;

      if (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (data?.apiKey) {
        console.log('✅ API key retrieved from Supabase');
        updateCache(data.apiKey, true);
        if (isMountedRef.current) {
          setApiKey(data.apiKey);
          setRetryCount(0);
        }
      } else {
        console.error('❌ No API key received from Supabase');
        throw new Error('Google Maps API key not configured in Supabase secrets');
      }

    } catch (err) {
      console.error('❌ Error fetching API key:', err);
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Configuration missing: ${errorMessage}`);
      updateCache(null, false);

      // Retry logic with exponential backoff
      if (retryCount < MAX_RETRIES && isMountedRef.current) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms...`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(prev => prev + 1);
          }
        }, delay);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isCacheValid, updateCache, retryCount]);

  const refresh = useCallback(() => {
    console.log('🔄 Refreshing Google Maps API key...');
    updateCache(null, false);
    setApiKey(null);
    setError(null);
    setRetryCount(0);
    fetchApiKey();
  }, [fetchApiKey, updateCache]);

  // Auto-retry when retryCount changes
  useEffect(() => {
    if (retryCount > 0 && retryCount <= MAX_RETRIES) {
      fetchApiKey();
    }
  }, [retryCount, fetchApiKey]);

  // Initial fetch
  useEffect(() => {
    fetchApiKey();
  }, []);

  return {
    apiKey,
    loading,
    error,
    refresh,
    isReady: !!apiKey && !loading && !error
  };
};