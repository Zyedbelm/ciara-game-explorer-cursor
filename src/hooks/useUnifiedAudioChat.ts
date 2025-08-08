import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { detectLanguage, getWelcomeMessage, getLanguageSpecificSuggestions } from '@/utils/languageDetection';

export interface UnifiedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  originalContent?: string;
  originalLanguage?: 'fr' | 'en' | 'de';
  timestamp: Date;
  audioUrl?: string;
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

export function useUnifiedAudioChat(context: ChatContext = {}) {
  const { user, profile } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<UnifiedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const translationCache = useRef<Map<string, Record<string, string>>>(new Map());

  // Generate a stable session key so the Edge Function can persist history
  const getSessionKey = useCallback(() => {
    const parts: string[] = ['chat'];
    if (context.cityName) parts.push(context.cityName);
    if (context.currentJourney?.id) parts.push(`journey_${context.currentJourney.id}`);
    if (context.currentStep?.id) parts.push(`step_${context.currentStep.id}`);
    return parts.join('_');
  }, [context]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update suggestions based on context - defined early to avoid hoisting issues
  const updateContextualSuggestions = useCallback(() => {
    let contextualSuggestions = [...getLanguageSpecificSuggestions(currentLanguage)];

    if (context.currentStep) {
      const stepSuggestions = {
        fr: [
          `Raconte-moi l'histoire de ${context.currentStep.name}`,
          `Que puis-je voir d'intéressant ici ?`
        ],
        en: [
          `Tell me about the history of ${context.currentStep.name}`,
          `What can I see that's interesting here?`
        ],
        de: [
          `Erzähl mir die Geschichte von ${context.currentStep.name}`,
          `Was gibt es hier Interessantes zu sehen?`
        ]
      };
      contextualSuggestions = stepSuggestions[currentLanguage] || stepSuggestions.fr;
    } else if (context.currentJourney) {
      const journeySuggestions = {
        fr: [
          `Combien de temps pour finir ce parcours ?`,
          `Quelles sont les prochaines étapes ?`
        ],
        en: [
          `How long to finish this journey?`,
          `What are the next steps?`
        ],
        de: [
          `Wie lange dauert diese Reise?`,
          `Was sind die nächsten Schritte?`
        ]
      };
      contextualSuggestions = journeySuggestions[currentLanguage] || journeySuggestions.fr;
    }

    setSuggestions(contextualSuggestions.slice(0, 2));
  }, [context.currentStep, context.currentJourney, currentLanguage]);

  // Initialize welcome message - stabilized dependencies
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeContent = getWelcomeMessage(currentLanguage, context.cityName);
      const welcomeMessage: UnifiedChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        originalContent: welcomeContent,
        originalLanguage: currentLanguage,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setSuggestions(getLanguageSpecificSuggestions(currentLanguage));
    }
  }, [currentLanguage, context.cityName, messages.length]);

  // Update suggestions when context changes - memoized to prevent loops
  const contextKey = JSON.stringify({
    cityName: context.cityName,
    journeyName: context.currentJourney?.name,
    stepName: context.currentStep?.name,
    isInJourney: context.isInJourney
  });
  
  useEffect(() => {
    updateContextualSuggestions();
  }, [contextKey, updateContextualSuggestions]);

  // Fetch step documents for enhanced context with priority
  const fetchStepDocuments = useCallback(async (stepId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .eq('step_id', stepId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  }, []);

  // Fetch quiz questions for enhanced context
  const fetchQuizQuestions = useCallback(async (stepId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('step_id', stepId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  }, []);

  // Build enriched context for AI with PRIORITY on documents
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

      // 🎯 PRIORITY: Fetch step documents FIRST - this is critical
      const documents = await fetchStepDocuments(context.currentStep.id);
      if (documents.length > 0) {
        enhancedContext.stepDocuments = documents.map(doc => ({
          title: doc.title,
          content: doc.content || '',
          description: doc.description || '',
          type: doc.document_type || 'info',
          language: doc.language || currentLanguage
        }));
        } else {
        enhancedContext.stepDocuments = [];
      }

      // Fetch quiz questions
      const quizQuestions = await fetchQuizQuestions(context.currentStep.id);
      if (quizQuestions.length > 0) {
        enhancedContext.quizQuestions = quizQuestions.map(q => ({
          question: q.question,
          question_en: q.question_en,
          question_de: q.question_de,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          explanation_en: q.explanation_en,
          explanation_de: q.explanation_de,
          options: q.options,
          points_awarded: q.points_awarded
        }));
      }
    }

    // Homepage/global grounding
    if (!context.currentJourney && !context.currentStep) {
      try {
        const { data: visibleCities } = await supabase
          .from('cities')
          .select('id, name, slug')
          .eq('is_active', true)
          .eq('is_visible_on_homepage', true)
          .order('name', { ascending: true });

        if (visibleCities && visibleCities.length > 0) {
          enhancedContext.availableCities = visibleCities.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
        }

        if (context.cityName && visibleCities) {
          const targetCity = visibleCities.find((c: any) => c.name?.toLowerCase() === context.cityName?.toLowerCase());
          const targetCityId = targetCity?.id;
          if (targetCityId) {
            const [{ data: cityJourneys }, { data: cityPartners }] = await Promise.all([
              supabase
                .from('journeys')
                .select('id, name')
                .eq('city_id', targetCityId)
                .eq('is_active', true)
                .order('name', { ascending: true }),
              supabase
                .from('partners')
                .select('id, name')
                .eq('city_id', targetCityId)
                .eq('is_active', true)
                .order('name', { ascending: true })
            ]);

            if (cityJourneys) {
              enhancedContext.cityJourneys = cityJourneys.map((j: any) => ({ id: j.id, name: j.name }));
            }
            if (cityPartners) {
              enhancedContext.cityPartners = cityPartners.map((p: any) => ({ id: p.id, name: p.name }));
            }
          }
        }
      } catch (e) {
        // silent
      }
    }

    return enhancedContext;
  }, [context, currentLanguage, profile, fetchStepDocuments, fetchQuizQuestions]);


  // Send text message (standardized on enhanced-ai-chat)
  const sendTextMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const detectedLanguage = detectLanguage(messageContent);
    
    const userMessage: UnifiedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
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
      const detectedLanguage = detectLanguage(messageContent);

      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: messageContent,
          sessionKey: getSessionKey(),
          language: detectedLanguage,
          context: enhancedContext,
          messageType: 'text'
        }
      });

      if (error) throw error;

      const assistantMessage: UnifiedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || t('chat.error.no_response'),
        originalContent: data.response || t('chat.error.no_response'),
        originalLanguage: detectedLanguage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        updateContextualSuggestions();
      }

    } catch (error) {
      
      const errorMessage: UnifiedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.error.technical_difficulties'),
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
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, context, currentLanguage, buildEnhancedContext, updateContextualSuggestions, t, toast, getSessionKey]);

  // Send audio message
  const sendAudioMessage = useCallback(async (audioBlob: Blob, duration: number) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Convert audio to base64
      const reader = new FileReader();
      const audioBase64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1]; // Remove data:audio/webm;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const audioBase64 = await audioBase64Promise;

      // Transcribe audio to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: {
          audio: audioBase64,
          language: currentLanguage
        }
      });

      if (transcriptionError) {
        throw new Error(`Transcription failed: ${transcriptionError.message}`);
      }

      const transcribedText = transcriptionData?.text;
      if (!transcribedText) {
        throw new Error('No text was transcribed from audio');
      }

      // Send the transcribed text as a regular message
      await sendTextMessage(transcribedText);

    } catch (error) {
      
      const errorMessage: UnifiedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentLanguage === 'en' 
          ? 'Sorry, I could not process your audio message. Please try again or type your message.'
          : currentLanguage === 'de'
          ? 'Entschuldigung, ich konnte Ihre Audionachricht nicht verarbeiten. Bitte versuchen Sie es erneut oder schreiben Sie Ihre Nachricht.'
          : 'Désolé, je n\'ai pas pu traiter votre message audio. Veuillez réessayer ou taper votre message.',
        originalContent: 'Audio processing error',
        originalLanguage: currentLanguage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: currentLanguage === 'en' ? 'Audio Error' : currentLanguage === 'de' ? 'Audio-Fehler' : 'Erreur Audio',
        description: currentLanguage === 'en' 
          ? 'Could not process your audio message. Please try again.'
          : currentLanguage === 'de'
          ? 'Konnte Ihre Audionachricht nicht verarbeiten. Bitte versuchen Sie es erneut.'
          : 'Impossible de traiter votre message audio. Veuillez réessayer.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentLanguage, sendTextMessage, toast]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions(getLanguageSpecificSuggestions(currentLanguage));
  }, [currentLanguage]);

  return {
    messages,
    isLoading,
    suggestions,
    isTranslating,
    messagesEndRef,
    sendTextMessage,
    sendAudioMessage,
    clearChat,
    currentLanguage
  };
}