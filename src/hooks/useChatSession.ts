import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'ciara_chat_session_key';
const STORAGE_TIMESTAMP_KEY = 'ciara_chat_session_timestamp';
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useChatSession(baseKey?: string) {
  const { user } = useAuth();
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  const initialize = useCallback(() => {
    // Check if existing session is still valid
    const existingTimestamp = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_TIMESTAMP_KEY) : null;
    const now = Date.now();
    let existing = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null;
    
    // Clear expired session
    if (existing && existingTimestamp) {
      const sessionAge = now - parseInt(existingTimestamp, 10);
      if (sessionAge > SESSION_TIMEOUT_MS) {
        try { 
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        } catch {}
        existing = null;
      }
    }
    
    // Create new session if needed
    if (!existing) {
      const segments: string[] = ['chat', now.toString()]; // Add timestamp to session key
      if (user?.id) segments.push(`u_${user.id}`); else segments.push('anon');
      if (baseKey) segments.push(baseKey);
      existing = segments.join('_');
      try { 
        sessionStorage.setItem(STORAGE_KEY, existing);
        sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, now.toString());
      } catch {}
    }
    setSessionKey(existing);
  }, [user?.id, baseKey]);

  const override = useCallback((nextKey: string) => {
    try { 
      sessionStorage.setItem(STORAGE_KEY, nextKey);
      sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    } catch {}
    setSessionKey(nextKey);
  }, []);

  const clear = useCallback(() => {
    try { 
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    } catch {}
    setSessionKey(null);
  }, []);

  useEffect(() => { initialize(); }, [initialize]);

  return { sessionKey, setSessionKey: override, clearSessionKey: clear };
}


