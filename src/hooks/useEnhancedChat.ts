import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { detectLanguage, getWelcomeMessage, getLanguageSpecificSuggestions } from '@/utils/languageDetection';

export interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  originalContent?: string; // Store original content for translation
  originalLanguage?: 'fr' | 'en' | 'de';
  timestamp: Date;
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

export function useEnhancedChat(context: ChatContext = {}) {
  const { user, profile } = useAuth();
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const translationCache = useRef<Map<string, Record<string, string>>>(new Map());

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeContent = getWelcomeMessage(currentLanguage, context.cityName);
      const welcomeMessage: EnhancedChatMessage = {
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
  }, [currentLanguage, context.cityName]); // Proper dependencies

  // Translate messages when language changes
  useEffect(() => {
    if (messages.length > 0) {
      translateMessages();
    }
  }, [currentLanguage]);

  // Update contextual suggestions based on current context
  const updateContextualSuggestions = useCallback(() => {
    let contextualSuggestions: string[] = [];

    if (context.currentJourney) {
      const journeySuggestions = {
        fr: [
          `Combien de temps dure ce parcours ?`,
          `Quelles sont les prochaines étapes ?`,
          `Conseils pour optimiser mes points`
        ],
        en: [
          `How long does this journey take?`,
          `What are the next steps?`,
          `Tips to optimize my points`
        ],
        de: [
          `Wie lange dauert diese Reise?`,
          `Was sind die nächsten Schritte?`,
          `Tipps zur Optimierung meiner Punkte`
        ]
      };
      contextualSuggestions = journeySuggestions[currentLanguage] || journeySuggestions.fr;
    }

    setSuggestions(contextualSuggestions.slice(0, 4));
  }, [context.currentJourney, currentLanguage]);

  // Update suggestions when context changes
  useEffect(() => {
    updateContextualSuggestions();
  }, [updateContextualSuggestions]);

  // Fetch step documents for enhanced context
  const fetchStepDocuments = useCallback(async (stepId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .eq('step_id', stepId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching step documents:', error);
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

  // Build enriched context for AI
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

      // Fetch step documents
      const documents = await fetchStepDocuments(context.currentStep.id);
      if (documents.length > 0) {
        enhancedContext.stepDocuments = documents.map(doc => ({
          title: doc.title,
          content: doc.content,
          description: doc.description,
          type: doc.document_type,
          language: doc.language
        }));
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

  // Translate existing messages (optimized for better UX)
  const translateMessages = useCallback(async () => {
    if (messages.length === 0) return;

    console.log('🔄 Starting translation process...', { 
      messageCount: messages.length, 
      targetLanguage: currentLanguage 
    });

    setIsTranslating(true);
    const startTime = Date.now();
    
    try {
      // Process messages in batches to avoid blocking
      const batchSize = 3; // Translate max 3 messages at once
      const batches: EnhancedChatMessage[][] = [];
      
      for (let i = 0; i < messages.length; i += batchSize) {
        batches.push(messages.slice(i, i + batchSize));
      }

      let allTranslatedMessages: EnhancedChatMessage[] = [];

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length}`);

        const translatedBatch = await Promise.all(
          batch.map(async (message, index) => {
            // Skip if already in current language
            if (message.originalLanguage === currentLanguage) {
              console.log(`✅ Message ${index} already in target language`);
              return message;
            }

            // Check translation cache
            const cacheKey = `${message.id}_${message.originalLanguage}_${currentLanguage}`;
            if (translationCache.current.has(cacheKey)) {
              const cached = translationCache.current.get(cacheKey);
              console.log(`📦 Using cached translation for message ${index}`);
              return { ...message, content: cached!.content };
            }

            // Translate message
            try {
              console.log(`🌍 Translating message ${index}...`);
              const translationStart = Date.now();
              
              const { data, error } = await supabase.functions.invoke('translate-text', {
                body: {
                  text: message.originalContent || message.content,
                  targetLanguage: currentLanguage,
                  sourceLanguage: message.originalLanguage || 'fr'
                }
              });

              const translationTime = Date.now() - translationStart;
              console.log(`⏱️ Translation took ${translationTime}ms`);

              if (error) throw error;

              const translatedContent = data.translatedText || message.content;
              
              // Cache translation
              translationCache.current.set(cacheKey, { content: translatedContent });
              
              return { ...message, content: translatedContent };
            } catch (error) {
              console.error('Translation error:', error);
              return message; // Return original on error
            }
          })
        );

        allTranslatedMessages = [...allTranslatedMessages, ...translatedBatch];
        
        // Update UI progressively
        if (batchIndex < batches.length - 1) {
          setMessages(prev => {
            const updated = [...prev];
            const startIndex = batchIndex * batchSize;
            translatedBatch.forEach((msg, idx) => {
              updated[startIndex + idx] = msg;
            });
            return updated;
          });
          
          // Small delay between batches to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setMessages(allTranslatedMessages);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Translation complete! Total time: ${totalTime}ms`);
      
    } catch (error) {
      console.error('Error translating messages:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [messages, currentLanguage]);

  // Send message with enhanced context
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Detect language of user message
    const detectedLanguage = detectLanguage(messageContent);
    
    const userMessage: EnhancedChatMessage = {
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
      const conversationHistory = messages.slice(-8); // Last 8 messages for context

      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: messageContent,
          sessionKey: `user_${user?.id || 'anonymous'}_${Date.now()}`,
          language: detectedLanguage, // Use detected language
          context: enhancedContext,
          messageType: 'text'
        }
      });

      if (error) throw error;

      const assistantMessage: EnhancedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || t('chat.error.no_response'),
        originalContent: data.response || t('chat.error.no_response'),
        originalLanguage: detectedLanguage, // AI responds in detected language
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        updateContextualSuggestions();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: EnhancedChatMessage = {
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
  }, [
    isLoading, 
    messages, 
    context, 
    currentLanguage, 
    buildEnhancedContext, 
    updateContextualSuggestions, 
    t, 
    toast
  ]);

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
    sendMessage,
    clearChat,
    currentLanguage
  };
}