import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { detectLanguage, getWelcomeMessage, getLanguageSpecificSuggestions } from '@/utils/languageDetection';

export interface AudioChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: 'text' | 'audio';
  audioUrl?: string;
  audioData?: string; // base64 audio data
  audioDuration?: number;
  originalContent?: string;
  originalLanguage?: 'fr' | 'en' | 'de';
  timestamp: Date;
  isLoading?: boolean;
  context?: {
    location?: { lat: number; lng: number };
    currentJourney?: string;
    currentStep?: any;
    detectedLanguage?: 'fr' | 'en' | 'de';
  };
}

interface ChatContext {
  cityName?: string;
  currentJourney?: any;
  currentStep?: any;
  userLocation?: { lat: number; lng: number };
  isInJourney?: boolean;
}

export function useAudioChat(context: ChatContext = {}) {
  const { user, profile } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<AudioChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const translationCache = useRef<Map<string, Record<string, string>>>(new Map());

  // Create session key based on context
  const getSessionKey = useCallback(() => {
    const parts = ['chat'];
    if (context.cityName) parts.push(context.cityName);
    if (context.currentJourney?.id) parts.push(`journey_${context.currentJourney.id}`);
    if (context.currentStep?.id) parts.push(`step_${context.currentStep.id}`);
    return parts.join('_');
  }, [context]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build enhanced context for AI
  const buildEnhancedContext = useCallback(async () => {
    const enhancedContext: any = {
      cityName: context.cityName,
      currentLanguage,
      userProfile: profile ? {
        level: profile.current_level,
        points: profile.total_points,
        fitness_level: profile.fitness_level,
        role: profile.role
      } : null,
      userLocation: context.userLocation
    };

    if (context.currentJourney) {
      enhancedContext.currentJourney = {
        id: context.currentJourney.id,
        name: context.currentJourney.name,
        description: context.currentJourney.description,
        category: context.currentJourney.category?.name,
        difficulty: context.currentJourney.difficulty,
        estimated_duration: context.currentJourney.estimated_duration
      };
    }

    if (context.currentStep) {
      enhancedContext.currentStep = {
        id: context.currentStep.id,
        name: context.currentStep.name,
        description: context.currentStep.description,
        type: context.currentStep.type,
        points_awarded: context.currentStep.points_awarded
      };
    }

    return enhancedContext;
  }, [context, currentLanguage, profile]);

  // Initialize session and load message history
  const initializeSession = useCallback(async () => {
    if (sessionId) {
      console.log('Session already initialized, skipping...');
      return;
    }

    try {
      console.log('Initializing chat session...');
      
      const sessionKey = getSessionKey();
      const enhancedContext = await buildEnhancedContext();

      // Get or create session
      const { data: sessionData, error: sessionError } = await supabase.rpc('get_or_create_chat_session', {
        p_session_key: sessionKey,
        p_context: enhancedContext
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }

      const newSessionId = sessionData;
      setSessionId(newSessionId);
      console.log('Session ID:', newSessionId);

      // Load message history
      const { data: messageHistory, error: historyError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', newSessionId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (historyError) {
        console.error('History error:', historyError);
        return;
      }

      // Convert database messages to chat messages
      const chatMessages: AudioChatMessage[] = messageHistory?.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        messageType: msg.message_type as 'text' | 'audio',
        audioUrl: msg.audio_url,
        audioDuration: msg.audio_duration,
        originalContent: msg.content,
        originalLanguage: msg.language as 'fr' | 'en' | 'de',
        timestamp: new Date(msg.created_at)
      })) || [];

      // Add welcome message if no history
      if (chatMessages.length === 0) {
        const welcomeContent = getWelcomeMessage(currentLanguage, context.cityName);
        const welcomeMessage: AudioChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: welcomeContent,
          messageType: 'text',
          originalContent: welcomeContent,
          originalLanguage: currentLanguage,
          timestamp: new Date()
        };
        chatMessages.unshift(welcomeMessage);
      }

      setMessages(chatMessages);
      setSuggestions(getLanguageSpecificSuggestions(currentLanguage));

    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [sessionId, getSessionKey, currentLanguage, context, buildEnhancedContext]);

  // Initialize chat session and load history
  useEffect(() => {
    if (user && !sessionId) {
      initializeSession();
    }
  }, [user, context.cityName, context.currentJourney?.id, context.currentStep?.id, initializeSession]);

  // Send text message
  const sendTextMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !sessionId) return;

    const detectedLanguage = detectLanguage(messageContent);
    
    const userMessage: AudioChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageContent,
      messageType: 'text',
      originalContent: messageContent,
      originalLanguage: detectedLanguage,
      timestamp: new Date(),
      context: {
        location: context.userLocation,
        currentJourney: context.currentJourney?.name,
        currentStep: context.currentStep,
        detectedLanguage
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const enhancedContext = await buildEnhancedContext();

      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: messageContent,
          sessionKey: getSessionKey(),
          context: enhancedContext,
          language: detectedLanguage,
          messageType: 'text'
        }
      });

      if (error) throw error;

      const assistantMessage: AudioChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response || t('chat.error.no_response'),
        messageType: 'text',
        originalContent: data.response || t('chat.error.no_response'),
        originalLanguage: detectedLanguage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate audio response
      if (data.response) {
        generateAudioResponse(data.response, detectedLanguage, assistantMessage.id);
      }

      // Update suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

    } catch (error) {
      console.error('Error sending text message:', error);
      handleMessageError();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, context, getSessionKey, buildEnhancedContext, t]);

  // Send audio message
  const sendAudioMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (isLoading || !sessionId) return;

    console.log('Processing audio message with language:', currentLanguage);

    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Add temporary user message
    const tempUserMessage: AudioChatMessage = {
      id: `user_audio_${Date.now()}`,
      role: 'user',
      content: 'Processing audio...',
      messageType: 'audio',
      audioData: base64Audio,
      audioDuration: duration,
      originalLanguage: currentLanguage,
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      // Transcribe audio with proper language parameter
      console.log('Transcribing audio with language:', currentLanguage);
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: {
          audio: base64Audio,
          language: currentLanguage // Ensure language consistency
        }
      });

      if (transcriptionError) throw transcriptionError;

      const transcribedText = transcriptionData.text || 'Audio transcription failed';
      const detectedLanguage = detectLanguage(transcribedText);

      console.log('Transcription result:', transcribedText);

      // Update the temporary message with transcription
      const userMessage: AudioChatMessage = {
        ...tempUserMessage,
        content: transcribedText,
        originalContent: transcribedText,
        originalLanguage: detectedLanguage,
        isLoading: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id ? userMessage : msg
      ));

      // Send to AI
      const enhancedContext = await buildEnhancedContext();

      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: transcribedText,
          sessionKey: getSessionKey(),
          context: enhancedContext,
          language: detectedLanguage,
          messageType: 'audio',
          audioUrl: undefined // Could store audio file URL if needed
        }
      });

      if (error) throw error;

      const assistantMessage: AudioChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response || t('chat.error.no_response'),
        messageType: 'text',
        originalContent: data.response || t('chat.error.no_response'),
        originalLanguage: detectedLanguage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate audio response
      if (data.response) {
        generateAudioResponse(data.response, detectedLanguage, assistantMessage.id);
      }

      // Update suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

    } catch (error) {
      console.error('Error sending audio message:', error);
      
      // Update temp message with error
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id 
          ? { ...msg, content: 'Audio processing failed', isLoading: false }
          : msg
      ));
      
      handleMessageError();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, currentLanguage, getSessionKey, buildEnhancedContext, t]);

  // Generate audio response for text
  const generateAudioResponse = useCallback(async (text: string, language: string, messageId: string) => {
    try {
      console.log('Generating audio response for language:', language);
      
      // Select appropriate voice based on language
      const voiceMap: { [key: string]: string } = {
        'fr': 'shimmer', // French female voice
        'en': 'alloy',   // English female voice
        'de': 'echo',    // German voice
        'es': 'nova',    // Spanish voice
        'it': 'fable',   // Italian voice
      };
      
      const selectedVoice = voiceMap[language] || 'alloy';
      
      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: {
          text,
          voice: selectedVoice,
          language
        }
      });

      if (error) throw error;

      // Update message with audio data and enable auto-play
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              audioData: data.audioContent, 
              messageType: 'audio' as const,
              context: { ...msg.context, autoPlay: true }
            }
          : msg
      ));

      console.log('Audio response generated successfully with voice:', selectedVoice);

    } catch (error) {
      console.error('Error generating audio response:', error);
    }
  }, []);

  // Handle message errors
  const handleMessageError = useCallback(() => {
    const errorMessage: AudioChatMessage = {
      id: `error_${Date.now()}`,
      role: 'assistant',
      content: t('chat.error.technical_difficulties'),
      messageType: 'text',
      originalContent: t('chat.error.technical_difficulties'),
      originalLanguage: currentLanguage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, errorMessage]);
    
    toast({
      title: t('chat.error.title'),
      description: t('chat.error.description'),
      variant: "destructive",
    });
  }, [currentLanguage, t, toast]);

  // Convert blob to base64
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setSuggestions(getLanguageSpecificSuggestions(currentLanguage));
    initializeSession();
  }, [currentLanguage, initializeSession]);

  return {
    messages,
    isLoading,
    suggestions,
    isTranslating,
    messagesEndRef,
    sessionId,
    sendTextMessage,
    sendAudioMessage,
    clearChat,
    currentLanguage
  };
}