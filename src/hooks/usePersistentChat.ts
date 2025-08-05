import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export interface PersistentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId: string;
  messageType?: 'text' | 'audio';
  audioUrl?: string;
  context?: {
    journeyId?: string;
    stepId?: string;
    location?: { lat: number; lng: number };
  };
}

interface ChatSessionData {
  id: string;
  sessionKey: string;
  isActive: boolean;
  expiresAt: Date;
  context: {
    journeyId?: string;
    currentStepId?: string;
    cityName?: string;
  };
  messageCount: number;
  lastActivity: Date;
}

interface PersistentChatOptions {
  journeyId?: string;
  currentStepId?: string;
  cityName?: string;
  sessionExpiryHours?: number;
}

export function usePersistentChat(options: PersistentChatOptions = {}) {
  const { 
    journeyId, 
    currentStepId, 
    cityName,
    sessionExpiryHours = 48 
  } = options;

  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();

  const [messages, setMessages] = useState<PersistentChatMessage[]>([]);
  const [sessionData, setSessionData] = useState<ChatSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const sessionInitialized = useRef(false);
  const lastSaveTime = useRef(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate session key based on context
  const generateSessionKey = useCallback(() => {
    const parts = ['chat'];
    if (journeyId) parts.push(`journey-${journeyId}`);
    if (currentStepId) parts.push(`step-${currentStepId}`);
    if (cityName) parts.push(`city-${cityName.toLowerCase()}`);
    
    return parts.join('-');
  }, [journeyId, currentStepId, cityName]);

  // Initialize or restore chat session
  const initializeSession = useCallback(async () => {
    if (!user || sessionInitialized.current) return;

    console.log('🔄 Initializing persistent chat session...', { 
      userId: user.id, 
      journeyId, 
      currentStepId 
    });

    setIsLoading(true);
    
    try {
      const sessionKey = generateSessionKey();
      
      // Try to get or create session
      const { data: sessionId, error: sessionError } = await supabase
        .rpc('get_or_create_chat_session', {
          p_session_key: sessionKey,
          p_context: {
            journeyId: journeyId || null,
            currentStepId: currentStepId || null,
            cityName: cityName || null,
            language: currentLanguage,
            createdAt: new Date().toISOString()
          }
        });

      if (sessionError) {
        console.error('❌ Error creating/getting session:', sessionError);
        throw sessionError;
      }

      console.log('✅ Chat session ID obtained:', sessionId);

      // Load session data
      const { data: session, error: sessionFetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionFetchError) {
        console.error('❌ Error fetching session data:', sessionFetchError);
        throw sessionFetchError;
      }

      const sessionData: ChatSessionData = {
        id: session.id,
        sessionKey: session.session_key,
        isActive: session.is_active,
        expiresAt: new Date(session.expires_at),
        context: session.context as any || {},
        messageCount: 0,
        lastActivity: new Date(session.updated_at)
      };

      setSessionData(sessionData);
      sessionInitialized.current = true;

      // Load existing messages
      await loadMessages(sessionId);

      console.log('✅ Persistent chat session initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing chat session:', error);
      toast({
        title: 'Erreur de chat',
        description: 'Impossible d\'initialiser la session de chat',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, journeyId, currentStepId, cityName, currentLanguage, generateSessionKey, toast]);

  // Load messages from database
  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMessages(true);
    
    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(50); // Load last 50 messages

      if (error) throw error;

      const loadedMessages: PersistentChatMessage[] = (messagesData || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        sessionId: msg.session_id,
        messageType: msg.message_type as 'text' | 'audio',
        audioUrl: msg.audio_url || undefined,
        context: msg.metadata as any || {}
      }));

      setMessages(loadedMessages);
      console.log('✅ Loaded chat messages:', loadedMessages.length);

    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Save message to database with throttling
  const saveMessage = useCallback(async (message: PersistentChatMessage, immediate = false) => {
    if (!sessionData) {
      console.warn('⚠️ No session data available for saving message');
      return;
    }

    const now = Date.now();
    
    // Throttle saves (except for immediate saves)
    if (!immediate && now - lastSaveTime.current < 1000) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveMessage(message, true);
      }, 1000);
      return;
    }

    lastSaveTime.current = now;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionData.id,
          role: message.role,
          content: message.content,
          message_type: message.messageType || 'text',
          audio_url: message.audioUrl || null,
          language: currentLanguage,
          metadata: message.context || {}
        });

      if (error) {
        console.error('❌ Error saving message:', error);
        throw error;
      }

      console.log('💾 Message saved to database');

    } catch (error) {
      console.error('❌ Failed to save message:', error);
      // Don't show toast for message save failures - they're not critical
    }
  }, [sessionData, currentLanguage]);

  // Add message to chat
  const addMessage = useCallback((message: Omit<PersistentChatMessage, 'id' | 'sessionId'>) => {
    const fullMessage: PersistentChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: sessionData?.id || 'temp'
    };

    setMessages(prev => [...prev, fullMessage]);
    
    // Save to database
    if (sessionData) {
      saveMessage(fullMessage);
    }

    return fullMessage;
  }, [sessionData, saveMessage]);

  // Recover session if expired but still within grace period
  const recoverSession = useCallback(async () => {
    if (!user) return false;

    console.log('🔄 Attempting to recover chat session...');
    
    try {
      const sessionKey = generateSessionKey();
      
      // Look for recently expired sessions
      const { data: expiredSessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_key', sessionKey)
        .gte('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24h
        .order('expires_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (expiredSessions && expiredSessions.length > 0) {
        const session = expiredSessions[0];
        
        // Extend session expiry
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({
            expires_at: new Date(Date.now() + sessionExpiryHours * 60 * 60 * 1000).toISOString(),
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        if (updateError) throw updateError;

        // Load recovered session
        const recoveredSession: ChatSessionData = {
          id: session.id,
          sessionKey: session.session_key,
          isActive: true,
          expiresAt: new Date(Date.now() + sessionExpiryHours * 60 * 60 * 1000),
          context: session.context as any || {},
          messageCount: 0,
          lastActivity: new Date()
        };

        setSessionData(recoveredSession);
        await loadMessages(session.id);

        console.log('✅ Chat session recovered successfully');
        
        toast({
          title: 'Session récupérée',
          description: 'Votre conversation précédente a été restaurée',
        });

        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error recovering session:', error);
      return false;
    }
  }, [user, generateSessionKey, sessionExpiryHours, loadMessages, toast]);

  // Clear current session and start fresh
  const clearSession = useCallback(async () => {
    if (sessionData) {
      try {
        await supabase
          .from('chat_sessions')
          .update({ is_active: false })
          .eq('id', sessionData.id);
      } catch (error) {
        console.error('❌ Error deactivating session:', error);
      }
    }

    setSessionData(null);
    setMessages([]);
    sessionInitialized.current = false;
    
    // Reinitialize
    await initializeSession();
  }, [sessionData, initializeSession]);

  // Auto-recovery on context change
  useEffect(() => {
    if (sessionInitialized.current) {
      sessionInitialized.current = false;
      initializeSession();
    }
  }, [journeyId, currentStepId]);

  // Initial session setup
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    sessionData,
    isLoading,
    isLoadingMessages,
    addMessage,
    loadMessages: () => sessionData ? loadMessages(sessionData.id) : Promise.resolve(),
    recoverSession,
    clearSession,
    sessionExpired: sessionData ? new Date() > sessionData.expiresAt : false,
    sessionExpiresIn: sessionData ? Math.max(0, sessionData.expiresAt.getTime() - Date.now()) : 0
  };
}