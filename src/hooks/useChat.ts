import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { detectLanguage, getWelcomeMessage, getLanguageSpecificSuggestions } from '@/utils/languageDetection';
import { useChatSession } from '@/hooks/useChatSession';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  originalContent?: string;
  originalLanguage?: 'fr' | 'en' | 'de';
  timestamp: Date;
  messageType?: 'text' | 'audio';
  audioUrl?: string;
}

export interface UseChatOptions {
  cityName?: string;
  currentJourney?: any;
  currentStep?: any;
  userLocation?: { lat: number; lng: number };
  isInJourney?: boolean;
  mode?: 'text' | 'audio' | 'auto';
  persistence?: 'session' | 'ephemeral';
}

export function useChat(options: UseChatOptions = {}) {
  const { user } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  const { sessionKey } = useChatSession(
    [
      options.cityName || 'global',
      options.currentJourney?.id ? `journey_${options.currentJourney.id}` : null,
      options.currentStep?.id ? `step_${options.currentStep.id}` : null,
      options.isInJourney ? 'injourney' : 'home'
    ].filter(Boolean).join('_')
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome + suggestions
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = getWelcomeMessage(currentLanguage, options.cityName);
      setMessages([{ id: 'welcome', role: 'assistant', content: welcome, originalContent: welcome, originalLanguage: currentLanguage, timestamp: new Date() }]);
      setSuggestions(getLanguageSpecificSuggestions(currentLanguage));
    }
  }, [currentLanguage, options.cityName, messages.length]);

  const buildEnhancedContext = useCallback(async () => {
    const ctx: any = {
      cityName: options.cityName,
      currentLanguage,
      userLocation: options.userLocation,
      userProfile: null
    };

    if (options.currentJourney) {
      ctx.currentJourney = {
        id: options.currentJourney.id,
        name: options.currentJourney.name,
        description: options.currentJourney.description,
        category: options.currentJourney.category?.name,
        difficulty: options.currentJourney.difficulty,
        estimated_duration: options.currentJourney.estimated_duration
      };
    }

    if (options.currentStep) {
      ctx.currentStep = {
        id: options.currentStep.id,
        name: options.currentStep.name,
        description: options.currentStep.description,
        type: options.currentStep.type,
        points_awarded: options.currentStep.points_awarded
      };
    }

    // Grounding côté client pour la homepage
    if (!options.currentJourney && !options.currentStep) {
      try {
        const { data: visibleCities } = await supabase
          .from('cities').select('id, name, slug')
          .eq('is_active', true)
          .eq('is_visible_on_homepage', true)
          .order('name', { ascending: true });
        let cities = visibleCities || [];
        if (!cities.length) {
          const { data: activeCities } = await supabase
            .from('cities').select('id, name, slug')
            .eq('is_active', true)
            .order('name', { ascending: true });
          cities = activeCities || [];
        }
        if (cities.length) ctx.availableCities = cities.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));

        if (options.cityName && (cities?.length || 0) > 0) {
          const target = cities.find((c: any) => (c.name || '').toLowerCase() === String(options.cityName).toLowerCase());
          const cityId = target?.id;
          if (cityId) {
            const [{ data: journeys }, { data: partners }] = await Promise.all([
              supabase.from('journeys').select('id, name').eq('city_id', cityId).eq('is_active', true).order('name', { ascending: true }),
              supabase.from('partners').select('id, name').eq('city_id', cityId).eq('is_active', true).order('name', { ascending: true })
            ]);
            if (journeys) ctx.cityJourneys = journeys.map((j: any) => ({ id: j.id, name: j.name }));
            if (partners) ctx.cityPartners = partners.map((p: any) => ({ id: p.id, name: p.name }));
          }
        }
      } catch {}
    }

    return ctx;
  }, [options.cityName, options.currentJourney, options.currentStep, options.userLocation, currentLanguage]);

  const sendTextMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !sessionKey) return;

    const detected = detectLanguage(messageContent);
    const functionName = import.meta.env.VITE_CHAT_FUNCTION_NAME || 'enhanced-ai-chat';

    const userMsg: ChatMessage = {
      id: `${Date.now()}`,
      role: 'user',
      content: messageContent,
      originalContent: messageContent,
      originalLanguage: detected,
      timestamp: new Date(),
      messageType: 'text'
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const context = await buildEnhancedContext();
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          message: messageContent,
          sessionKey,
          language: detected,
          context,
          messageType: 'text'
        },
        // Include authorization header if session exists
        ...(session?.access_token && {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
      });
      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: `${Date.now()}_a`,
        role: 'assistant',
        content: data.response,
        originalContent: data.response,
        originalLanguage: detected,
        timestamp: new Date(),
        messageType: 'text'
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: `${Date.now()}_e`, role: 'assistant', content: t('chat.error.technical_difficulties'), originalContent: t('chat.error.technical_difficulties'), originalLanguage: currentLanguage, timestamp: new Date() }]);
      toast({ title: t('chat.error.title'), description: t('chat.error.description'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionKey, buildEnhancedContext, t, toast, currentLanguage]);

  const sendAudioMessage = useCallback(async (audioBlob: Blob) => {
    if (isLoading || !sessionKey) return;
    setIsLoading(true);
    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const { data: tr, error: trErr } = await supabase.functions.invoke('voice-to-text', { body: { audio: base64Audio, language: currentLanguage } });
      if (trErr) throw trErr;
      const transcribedText = tr?.text;
      if (!transcribedText?.trim()) throw new Error('No text from audio');
      await sendTextMessage(transcribedText);
    } catch (e) {
      setMessages(prev => [...prev, { id: `${Date.now()}_ae`, role: 'assistant', content: currentLanguage === 'en' ? 'Sorry, I could not process your audio message. Please try again or type your message.' : currentLanguage === 'de' ? 'Entschuldigung, ich konnte Ihre Audionachricht nicht verarbeiten. Bitte versuchen Sie es erneut oder schreiben Sie Ihre Nachricht.' : "Désolé, je n'ai pas pu traiter votre message audio. Veuillez réessayer ou taper votre message.", timestamp: new Date() }]);
      toast({ title: currentLanguage === 'en' ? 'Audio Error' : currentLanguage === 'de' ? 'Audio-Fehler' : 'Erreur Audio', description: currentLanguage === 'en' ? 'Could not process your audio message. Please try again.' : currentLanguage === 'de' ? 'Konnte Ihre Audionachricht nicht verarbeiten. Bitte versuchen Sie es erneut.' : 'Impossible de traiter votre message audio. Veuillez réessayer.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionKey, currentLanguage, sendTextMessage, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions(getLanguageSpecificSuggestions(currentLanguage));
  }, [currentLanguage]);

  return { messages, isLoading, suggestions, messagesEndRef, sendTextMessage, sendAudioMessage, clearChat, sessionKey };
}


