import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getWelcomeMessage } from '@/utils/languageDetection';

export interface SimpleChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: 'fr' | 'en' | 'de';
}

interface ChatContext {
  cityName?: string;
  currentJourney?: any;
  currentStep?: any;
  userLocation?: { lat: number; lng: number };
  isInJourney?: boolean;
}

export function useSimpleAudioChat(context: ChatContext = {}) {
  const { user, profile } = useAuth();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message only once
  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const welcomeContent = getWelcomeMessage(currentLanguage, context.cityName);
      const welcomeMessage: SimpleChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        language: currentLanguage
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, currentLanguage, context.cityName]);

  // Update welcome message when language changes
  React.useEffect(() => {
    if (messages.length > 0 && messages[0].id === 'welcome') {
      const updatedWelcomeContent = getWelcomeMessage(currentLanguage, context.cityName);
      setMessages(prev => prev.map(msg => 
        msg.id === 'welcome' 
          ? { ...msg, content: updatedWelcomeContent, language: currentLanguage }
          : msg
      ));
    }
  }, [currentLanguage, context.cityName]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Send text message
  const sendTextMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: SimpleChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build simple context
      const simpleContext = {
        cityName: context.cityName,
        currentLanguage,
        userProfile: profile ? {
          level: profile.current_level,
          points: profile.total_points
        } : null,
        currentJourney: context.currentJourney?.name,
        currentStep: context.currentStep?.name
      };

      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: messageContent,
          sessionKey: `simple_${context.cityName || 'home'}`,
          language: currentLanguage,
          context: simpleContext,
          messageType: 'text'
        }
      });

      if (error) throw error;

      const assistantMessage: SimpleChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || (
          currentLanguage === 'en' ? 'Sorry, I could not process your request.' :
          currentLanguage === 'de' ? 'Entschuldigung, ich konnte Ihre Anfrage nicht bearbeiten.' :
          'Désolé, je n\'ai pas pu traiter votre demande.'
        ),
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      
      const errorMessage: SimpleChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: currentLanguage === 'en' ? 'Sorry, a technical error occurred. Please try again.' :
                 currentLanguage === 'de' ? 'Entschuldigung, ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' :
                 'Désolé, une erreur technique est survenue. Veuillez réessayer.',
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: currentLanguage === 'en' ? 'Error' : currentLanguage === 'de' ? 'Fehler' : 'Erreur',
        description: currentLanguage === 'en' ? 'Unable to send message' : 
                    currentLanguage === 'de' ? 'Nachricht konnte nicht gesendet werden' :
                    'Impossible d\'envoyer le message',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [isLoading, context, currentLanguage, profile, toast, scrollToBottom]);

  // Send audio message - converts to text then processes
  const sendAudioMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      // Convert audio to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Transcribe audio to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: {
          audio: base64Audio,
          language: currentLanguage
        }
      });

      if (transcriptionError) throw transcriptionError;

      const transcribedText = transcriptionData.text;
      if (!transcribedText?.trim()) {
        throw new Error('No text could be transcribed from audio');
      }

      // Process the transcribed text as a regular message
      // Don't add the user message manually - sendTextMessage will do it
      await sendTextMessage(transcribedText);

    } catch (error) {
      
      const errorMessage: SimpleChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentLanguage === 'en' ? 'Sorry, I could not process your voice message. Please try again or type your message.' :
                 currentLanguage === 'de' ? 'Entschuldigung, ich konnte Ihre Sprachnachricht nicht verarbeiten. Bitte versuchen Sie es erneut oder schreiben Sie Ihre Nachricht.' :
                 'Désolé, je n\'ai pas pu traiter votre message vocal. Veuillez réessayer ou écrire votre message.',
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: currentLanguage === 'en' ? 'Audio Error' : currentLanguage === 'de' ? 'Audio-Fehler' : 'Erreur Audio',
        description: currentLanguage === 'en' ? 'Unable to process voice message' :
                    currentLanguage === 'de' ? 'Sprachnachricht konnte nicht verarbeitet werden' :
                    'Impossible de traiter le message vocal',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [isLoading, currentLanguage, toast, scrollToBottom, sendTextMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    initializeChat();
  }, [initializeChat]);

  // Initialize chat on mount
  React.useEffect(() => {
    initializeChat();
  }, []);

  return {
    messages,
    isLoading,
    messagesEndRef,
    sendTextMessage,
    sendAudioMessage,
    clearChat
  };
}