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
      console.log('🔍 Fetching documents for step ID:', stepId);
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .eq('step_id', stepId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching step documents:', error);
        throw error;
      }
      
      console.log('📚 Document fetch result:', {
        stepId,
        documentsFound: data?.length || 0,
        documents: data?.map(d => ({ title: d.title, type: d.document_type, language: d.language }))
      });
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching step documents:', error);
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
      console.error('Error fetching quiz questions:', error);
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
        name: context.currentJourney.name,
        description: context.currentJourney.description,
        category: context.currentJourney.category?.name,
        difficulty: context.currentJourney.difficulty,
        estimated_duration: context.currentJourney.estimated_duration
      };
    }

    if (context.currentStep) {
      enhancedContext.currentStep = {
        name: context.currentStep.name,
        description: context.currentStep.description,
        type: context.currentStep.type,
        points_awarded: context.currentStep.points_awarded
      };

      // 🎯 PRIORITY: Fetch step documents FIRST - this is critical
      console.log('🔍 Fetching documents for step:', context.currentStep.id);
      const documents = await fetchStepDocuments(context.currentStep.id);
      if (documents.length > 0) {
        console.log('📚 Found documents:', documents.length, 'documents');
        enhancedContext.stepDocuments = documents.map(doc => ({
          title: doc.title,
          content: doc.content || '',
          description: doc.description || '',
          type: doc.document_type || 'info',
          language: doc.language || currentLanguage
        }));
        console.log('📋 Mapped documents for AI:', enhancedContext.stepDocuments);
      } else {
        console.log('📝 No documents found for this step');
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

    return enhancedContext;
  }, [context, currentLanguage, profile, fetchStepDocuments, fetchQuizQuestions]);


  // Send text message
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
      const conversationHistory = messages.slice(-8);

      console.log('🚀 Sending message to AI with enhanced context:', {
        hasDocuments: enhancedContext.stepDocuments?.length > 0,
        documentsCount: enhancedContext.stepDocuments?.length || 0,
        currentStep: enhancedContext.currentStep?.name,
        documentTitles: enhancedContext.stepDocuments?.map(d => d.title),
        detectedLanguage,
        currentLanguage
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageContent,
          language: detectedLanguage,
          context: enhancedContext,
          conversationHistory: conversationHistory.map(m => ({
            role: m.role,
            content: m.originalContent || m.content,
            language: m.originalLanguage
          }))
        }
      });

      console.log('🤖 AI Response received:', {
        hasResponse: !!data?.response,
        responseLength: data?.response?.length || 0,
        hasSuggestions: !!data?.suggestions,
        suggestionsCount: data?.suggestions?.length || 0
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
      console.error('Error sending message:', error);
      
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
  }, [isLoading, messages, context, currentLanguage, buildEnhancedContext, updateContextualSuggestions, t, toast]);

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

      console.log('🎤 Transcribing audio...', { language: currentLanguage });

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

      console.log('✅ Audio transcribed:', transcribedText);

      // Send the transcribed text as a regular message
      await sendTextMessage(transcribedText);

    } catch (error) {
      console.error('❌ Error processing audio message:', error);
      
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