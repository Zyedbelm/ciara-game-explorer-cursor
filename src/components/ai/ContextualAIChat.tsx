import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bot,
  Send,
  MapPin,
  Clock,
  Sparkles,
  MessageCircle,
  X,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    location?: { lat: number; lng: number };
    currentJourney?: string;
    nearbySteps?: any[];
  };
}

interface ContextualAIChatProps {
  citySlug?: string;
  currentJourney?: any;
  currentStep?: any;
  className?: string;
}

const ContextualAIChat: React.FC<ContextualAIChatProps> = ({
  citySlug,
  currentJourney,
  currentStep,
  className = ''
}) => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { currentLanguage } = useLanguage();
  const { location } = useGeolocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Generate contextual suggestions when context changes
    generateSuggestions();
  }, [currentJourney, currentStep, location]);

  const generateSuggestions = () => {
    const contextualSuggestions: string[] = [];

    if (currentStep) {
      // Localized suggestions based on current step
      if (currentLanguage === 'en') {
        contextualSuggestions.push(`Tell me about the history of ${currentStep.name}`);
        contextualSuggestions.push(`What can I see that's interesting here?`);
      } else if (currentLanguage === 'de') {
        contextualSuggestions.push(`Erzähl mir die Geschichte von ${currentStep.name}`);
        contextualSuggestions.push(`Was gibt es hier Interessantes zu sehen?`);
      } else {
        contextualSuggestions.push(`Raconte-moi l'histoire de ${currentStep.name}`);
        contextualSuggestions.push(`Que puis-je voir d'intéressant ici ?`);
      }
    }

    if (currentJourney) {
      if (currentLanguage === 'en') {
        contextualSuggestions.push(`How long to finish this journey?`);
        contextualSuggestions.push(`What are the next steps?`);
      } else if (currentLanguage === 'de') {
        contextualSuggestions.push(`Wie lange dauert diese Reise?`);
        contextualSuggestions.push(`Was sind die nächsten Schritte?`);
      } else {
        contextualSuggestions.push(`Combien de temps pour finir ce parcours ?`);
        contextualSuggestions.push(`Quelles sont les prochaines étapes ?`);
      }
    }

    if (location) {
      if (currentLanguage === 'en') {
        contextualSuggestions.push("What's interesting near me?");
        contextualSuggestions.push("Recommend a nearby restaurant");
      } else if (currentLanguage === 'de') {
        contextualSuggestions.push("Was ist interessant in meiner Nähe?");
        contextualSuggestions.push("Empfiehl mir ein nahes Restaurant");
      } else {
        contextualSuggestions.push("Qu'y a-t-il d'intéressant près de moi ?");
        contextualSuggestions.push("Recommande-moi un restaurant proche");
      }
    }

    // General suggestions
    if (currentLanguage === 'en') {
      contextualSuggestions.push("Which journeys do you recommend?");
      contextualSuggestions.push("How to earn more points?");
    } else if (currentLanguage === 'de') {
      contextualSuggestions.push("Welche Reisen empfiehlst du?");
      contextualSuggestions.push("Wie kann ich mehr Punkte sammeln?");
    } else {
      contextualSuggestions.push("Quels parcours me recommandes-tu ?");
      contextualSuggestions.push("Comment gagner plus de points ?");
    }

    setSuggestions(contextualSuggestions.slice(0, 4));
  };

  const fetchStepDocuments = async (stepId: string) => {
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
  };

  const buildContext = async () => {
    const context: any = {};

    if (citySlug) {
      context.cityName = citySlug;
    }

    if (currentJourney) {
      context.currentJourney = {
        name: currentJourney.name,
        description: currentJourney.description,
        category: currentJourney.category?.name
      };
    }

    if (currentStep) {
      context.currentStep = {
        name: currentStep.name,
        description: currentStep.description,
        type: currentStep.type
      };

      // Récupérer les documents de l'étape active
      const documents = await fetchStepDocuments(currentStep.id);
      if (documents.length > 0) {
        context.stepDocuments = documents.map(doc => ({
          title: doc.title,
          description: doc.description || doc.content || '',
          type: doc.document_type,
          url: doc.file_url || ''
        }));
      }
    }

    if (location) {
      context.userLocation = {
        lat: location.latitude,
        lng: location.longitude
      };
    }

    if (profile) {
      context.userProfile = {
        level: profile.current_level,
        points: profile.total_points,
        fitness_level: profile.fitness_level
      };
    }

    return context;
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      context: {
        location: location ? { lat: location.latitude, lng: location.longitude } : undefined,
        currentJourney: currentJourney?.name,
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = await buildContext();
      const conversationHistory = messages.slice(-10); // Last 10 messages for context

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageText,
          language: currentLanguage,
          context,
          conversationHistory: conversationHistory.map(m => ({
            role: m.role,
            content: m.content
          }))
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Désolé, je n'ai pas pu traiter votre demande.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update suggestions if provided
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Vérifiez votre connexion.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
    generateSuggestions();
  };

  const getContextBadges = () => {
    const badges: { label: string; color: string }[] = [];

    if (currentJourney) {
      badges.push({ label: `📍 ${currentJourney.name}`, color: 'bg-blue-100 text-blue-800' });
    }

    if (currentStep) {
      badges.push({ label: `🎯 ${currentStep.name}`, color: 'bg-green-100 text-green-800' });
    }

    if (location) {
      badges.push({ label: '📡 Géolocalisé', color: 'bg-purple-100 text-purple-800' });
    }

    return badges;
  };

  // Floating chat button for mobile
  const FloatingChatButton = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg z-50 ${className}`}
          size="sm"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
        <ChatInterface />
      </DialogContent>
    </Dialog>
  );

  // Main chat interface component
  const ChatInterface = () => (
    <>
      <DialogHeader className="p-4 pb-2">
        <DialogTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Assistant IA CIARA
          <div className="flex items-center gap-1 ml-auto">
            {getContextBadges().map((badge, index) => (
              <Badge key={index} className={`text-xs ${badge.color}`}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bonjour ! Je suis votre assistant IA.</p>
                <p className="text-xs">Posez-moi vos questions sur votre parcours !</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">L'assistant réfléchit...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length === 0 && (
          <div className="p-4 pt-0">
            <p className="text-sm text-muted-foreground mb-2">Suggestions :</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1 px-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="w-full mt-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Effacer la conversation
            </Button>
          )}
        </div>
      </div>
    </>
  );

  // Return different layouts based on usage context
  if (className.includes('floating')) {
    return <FloatingChatButton />;
  }

  // Embedded chat interface
  return (
    <Card className={`flex flex-col h-96 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Assistant IA
          <div className="flex items-center gap-1 ml-auto">
            {getContextBadges().map((badge, index) => (
              <Badge key={index} className={`text-xs ${badge.color}`}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <ChatInterface />
      </CardContent>
    </Card>
  );
};

export default ContextualAIChat;