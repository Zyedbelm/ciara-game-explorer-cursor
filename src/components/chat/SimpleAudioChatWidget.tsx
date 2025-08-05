import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimpleAudioChat } from '@/hooks/useSimpleAudioChat';
import { getLanguageSpecificSuggestions } from '@/utils/languageDetection';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { AudioErrorBoundary } from '@/components/audio/AudioErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useCityOptional } from '@/contexts/CityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Mic,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SimpleAudioChatWidgetProps {
  currentJourney?: any;
  currentStep?: any;
  userLocation?: { lat: number; lng: number };
  isInJourney?: boolean;
}

const SimpleAudioChatWidget: React.FC<SimpleAudioChatWidgetProps> = ({ 
  currentJourney, 
  currentStep,
  userLocation, 
  isInJourney = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { city } = useCityOptional();
  const { currentLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  
  // Simple audio chat hook
  const {
    messages,
    isLoading,
    messagesEndRef,
    sendTextMessage,
    sendAudioMessage,
    clearChat
  } = useSimpleAudioChat({
    cityName: city?.name || 'destination',
    currentJourney,
    currentStep,
    userLocation,
    isInJourney
  });

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || inputMessage.trim();
    if (!messageToSend) return;
    
    setInputMessage('');
    setShowSuggestions(false); // Fermer les suggestions après envoi
    await sendTextMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get contextual suggestions based on current context and language
  const getSuggestions = () => {
    const baseSuggestions = getLanguageSpecificSuggestions(currentLanguage);
    
    if (currentStep) {
      const stepSuggestions = {
        fr: [
          `Raconte-moi l'histoire de ${currentStep.name}`,
          "Que puis-je voir d'intéressant ici ?",
          "Aide-moi avec le quiz de cette étape",
          "Quels sont les détails architecturaux ?"
        ],
        en: [
          `Tell me about the history of ${currentStep.name}`,
          "What interesting things can I see here?",
          "Help me with the quiz for this step",
          "What are the architectural details?"
        ],
        de: [
          `Erzähl mir die Geschichte von ${currentStep.name}`,
          "Was kann ich hier Interessantes sehen?",
          "Hilf mir mit dem Quiz für diesen Schritt",
          "Was sind die architektonischen Details?"
        ]
      };
      return stepSuggestions[currentLanguage] || stepSuggestions.fr;
    } else if (currentJourney) {
      const journeySuggestions = {
        fr: [
          "Quelle est la prochaine étape ?",
          "Combien de temps pour finir ce parcours ?",
          "Conseils pour optimiser mes points",
          "Y a-t-il des variantes plus faciles ?"
        ],
        en: [
          "What's the next step?",
          "How long to finish this journey?",
          "Tips to optimize my points",
          "Are there easier alternatives?"
        ],
        de: [
          "Was ist der nächste Schritt?",
          "Wie lange dauert diese Reise?",
          "Tipps zur Optimierung meiner Punkte",
          "Gibt es einfachere Alternativen?"
        ]
      };
      return journeySuggestions[currentLanguage] || journeySuggestions.fr;
    } else if (city?.name) {
      const citySuggestions = {
        fr: [
          `Que visiter à ${city.name} ?`,
          `Restaurants recommandés à ${city.name}`,
          "Quels parcours pour débutants ?",
          "Comment gagner plus de points ?"
        ],
        en: [
          `What to visit in ${city.name}?`,
          `Recommended restaurants in ${city.name}`,
          "What journeys for beginners?",
          "How can I earn more points?"
        ],
        de: [
          `Was kann man in ${city.name} besuchen?`,
          `Empfohlene Restaurants in ${city.name}`,
          "Welche Reisen für Anfänger?",
          "Wie kann ich mehr Punkte verdienen?"
        ]
      };
      return citySuggestions[currentLanguage] || citySuggestions.fr;
    }
    
    return baseSuggestions;
  };

  const suggestions = getSuggestions();

  // Floating Chat Button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className={`h-16 w-16 rounded-full shadow-2xl text-white transition-all duration-300 ${
              isInJourney 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' 
                : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
            }`}
            size="icon"
          >
            <MessageCircle className="h-7 w-7" />
          </Button>
          
          {currentStep && (
            <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded-md shadow-lg ${
              isInJourney 
                ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                : 'bg-primary'
            }`}>
              <div className="text-center">
                <div className="font-medium">Guide Audio IA</div>
                <div className="text-xs opacity-90 max-w-20 truncate">{currentStep.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full Chat Interface
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`${isMobile ? 'fixed inset-x-4 bottom-4 top-20' : 'w-80'} shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? (isMobile ? 'h-16 top-auto' : 'h-16') : ''
      } ${isInJourney ? 'border-2 border-green-500' : ''}`}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-3 text-white rounded-t-lg ${
          isInJourney 
            ? 'bg-gradient-to-r from-green-500 to-blue-500' 
            : 'bg-gradient-to-r from-primary to-primary/80'
        }`}>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" />
            CIARA Guide Audio
            <Mic className="h-3 w-3" />
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className={`p-0 flex flex-col ${isMobile ? 'h-[calc(80vh-64px)]' : 'h-[calc(500px-64px)]'}`}>
            {/* Messages */}
            <ScrollArea className="flex-grow min-h-0 overflow-auto">
              <div className="p-4 space-y-4 min-h-full flex flex-col justify-end">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                      message.role === 'user' 
                        ? 'bg-primary' 
                        : isInJourney ? 'bg-green-500' : 'bg-secondary'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}>
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      isInJourney ? 'bg-green-500' : 'bg-secondary'
                    }`}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-bl-none p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions Section */}
            {suggestions && suggestions.length > 0 && (
              <div className="px-3 pb-2 border-t bg-background">
                <Button
                  variant="ghost"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full justify-between text-xs py-2 h-8"
                >
                  <span className="text-muted-foreground">
                    {currentLanguage === 'en' ? 'Suggested Questions' : 
                     currentLanguage === 'de' ? 'Vorgeschlagene Fragen' : 
                     'Questions Suggérées'}
                  </span>
                  {showSuggestions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
                
                {showSuggestions && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSendMessage(suggestion)}
                        className="w-full justify-start text-xs py-1.5 h-auto min-h-[28px] text-left whitespace-normal"
                        disabled={isLoading}
                      >
                        <span className="line-clamp-2">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input - Fixed at bottom */}
            <div className="p-3 border-t bg-background">
              <div className="flex gap-2">
                <AudioErrorBoundary>
                  <AudioRecorder
                    onRecordingComplete={sendAudioMessage}
                    onError={(error) => console.error('Audio recording error:', error)}
                    disabled={isLoading}
                    maxDuration={30}
                    className="shrink-0"
                  />
                </AudioErrorBoundary>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentLanguage === 'en' ? "Type or record a message..." :
                    currentLanguage === 'de' ? "Nachricht eingeben oder aufnehmen..." :
                    "Tapez ou enregistrez un message..."
                  }
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className={`shrink-0 ${isInJourney ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SimpleAudioChatWidget;