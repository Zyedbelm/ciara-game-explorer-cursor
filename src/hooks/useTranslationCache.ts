import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CachedTranslation {
  key: string;
  language: string;
  value: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: CachedTranslation;
}

export function useTranslationCache() {
  const [cache, setCache] = useState<TranslationCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  const FETCH_THROTTLE = 5000; // 5 seconds between fetches

  // Load translations for a specific language
  const loadTranslations = async (language: string, force = false) => {
    const now = Date.now();
    
    // Throttle requests
    if (!force && now - lastFetchTime.current < FETCH_THROTTLE) {
      return;
    }

    // Check if we have recent cache
    const hasRecentCache = Object.values(cache).some(
      item => item.language === language && now - item.timestamp < CACHE_DURATION
    );

    if (!force && hasRecentCache) {
      console.log('✅ Using cached translations for:', language);
      return;
    }

    setIsLoading(true);
    lastFetchTime.current = now;

    try {
      console.log('🔄 Loading translations for language:', language);
      
      const { data, error } = await supabase
        .from('ui_translations')
        .select('key, value')
        .eq('language', language)
        .eq('is_approved', true);

      if (error) throw error;

      // Update cache
      const newCache = { ...cache };
      (data || []).forEach(translation => {
        const cacheKey = `${translation.key}-${language}`;
        newCache[cacheKey] = {
          key: translation.key,
          language,
          value: translation.value,
          timestamp: now
        };
      });

      setCache(newCache);
      console.log('✅ Loaded translations:', data?.length || 0);

    } catch (error) {
      console.error('❌ Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get translation from cache
  const getTranslation = (key: string, language: string, fallback?: string): string => {
    const cacheKey = `${key}-${language}`;
    const cached = cache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.value;
    }

    // Try fallback language (French)
    if (language !== 'fr') {
      const frCacheKey = `${key}-fr`;
      const frCached = cache[frCacheKey];
      if (frCached && Date.now() - frCached.timestamp < CACHE_DURATION) {
        return frCached.value;
      }
    }

    // Return fallback or key
    return fallback || key;
  };

  // Preload common translations
  const preloadCommonTranslations = async (language: string) => {
    try {
      const commonKeys = [
        'common.loading',
        'common.error',
        'common.save',
        'common.cancel',
        'navigation.home',
        'navigation.journeys',
        'navigation.profile',
        'journey.start',
        'journey.complete',
        'step.validate'
      ];

      const { data, error } = await supabase
        .from('ui_translations')
        .select('key, value')
        .eq('language', language)
        .in('key', commonKeys)
        .eq('is_approved', true);

      if (error) throw error;

      const now = Date.now();
      const newCache = { ...cache };
      
      (data || []).forEach(translation => {
        const cacheKey = `${translation.key}-${language}`;
        newCache[cacheKey] = {
          key: translation.key,
          language,
          value: translation.value,
          timestamp: now
        };
      });

      setCache(newCache);
      console.log('✅ Preloaded common translations:', data?.length || 0);

    } catch (error) {
      console.error('❌ Error preloading translations:', error);
    }
  };

  // Clear expired cache entries
  const clearExpiredCache = () => {
    const now = Date.now();
    const newCache: TranslationCache = {};
    
    Object.entries(cache).forEach(([key, item]) => {
      if (now - item.timestamp < CACHE_DURATION) {
        newCache[key] = item;
      }
    });

    setCache(newCache);
    console.log('🧹 Cleared expired translation cache');
  };

  // Auto-cleanup every 5 minutes
  useEffect(() => {
    const interval = setInterval(clearExpiredCache, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cache]);

  return {
    cache,
    isLoading,
    loadTranslations,
    getTranslation,
    preloadCommonTranslations,
    clearExpiredCache,
    cacheSize: Object.keys(cache).length
  };
}