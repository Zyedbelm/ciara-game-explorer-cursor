import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useCityOptional } from '@/contexts/CityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  ChevronDown,
  Mic
} from 'lucide-react';

interface UnifiedAudioChatWidgetProps {
  currentJourney?: any;
  currentStep?: any;
  userLocation?: {
    lat: number;
    lng: number;
  };
  isInJourney?: boolean;
  className?: string;
}

const UnifiedAudioChatWidget: React.FC<UnifiedAudioChatWidgetProps> = ({
  currentJourney,
  currentStep,
  userLocation,
  isInJourney,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const isMobile = useIsMobile();

  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { city } = useCityOptional();
  const { currentLanguage, t } = useLanguage();

  // Unified chat hook with enhanced context
  const { messages, isLoading, suggestions, messagesEndRef, sendTextMessage, sendAudioMessage, clearChat } = useChat({
    cityName: city?.name || 'destination',
    currentJourney,
    currentStep,
    userLocation,
    isInJourney: !!isInJourney,
    mode: 'auto',
    persistence: 'session'
  });

  // Debug: Log only once on mount to avoid infinite loops
  // Removed console.log to prevent infinite re-rendering

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = messageContent || inputMessage.trim();
    if (!messageToSend) return;
    setInputMessage('');
    await sendTextMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const locale = currentLanguage === 'en' ? 'en-US' : currentLanguage === 'de' ? 'de-DE' : 'fr-FR';
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-collapse sections on mobile when chat opens
  useEffect(() => {
    if (isMobile && isOpen) {
      setSuggestionsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Get context badges for better UX
  const getContextBadges = () => {
    const badges = [];
    
    if (currentStep) {
      badges.push(
        <Badge key="step" variant="secondary" className="text-xs">
          📍 {currentStep.name}
        </Badge>
      );
    } else if (currentJourney) {
      badges.push(
        <Badge key="journey" variant="outline" className="text-xs">
          🗺️ {currentJourney.name}
        </Badge>
      );
    }
    
    if (city) {
      badges.push(
        <Badge key="city" variant="outline" className="text-xs">
          🏛️ {city.name}
        </Badge>
      );
    }

    return badges;
  };

  // Floating chat button (when not embedded)
  if (!className && !isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button 
            onClick={() => setIsOpen(true)} 
            className="h-16 px-4 rounded-2xl shadow-lg bg-primary hover:bg-primary-dark transition-all duration-300 text-primary-foreground flex flex-col items-center justify-center gap-1 min-w-32" 
          >
            <div className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-semibold">GUIDE AI</span>
            </div>
            {currentStep && (
              <span className="text-xs opacity-90 text-center leading-tight max-w-28 truncate">
                {currentStep.name}
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Main chat interface
  const chatInterface = (
    <Card className={`${isMobile && !className ? 'w-full' : className ? 'w-full h-full' : 'w-80'} shadow-2xl border-0 transition-all duration-300 ${isMinimized && !className ? 'h-16' : isMobile && !className ? 'h-[70vh]' : className ? 'h-full' : 'h-[500px]'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          CIARA Assistant
          <Sparkles className="h-3 w-3" />
        </CardTitle>
        
        {!className && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>

      {(!isMinimized || className) && (
        <CardContent className={`p-0 flex flex-col ${className ? 'h-[calc(100%-64px)]' : isMobile ? 'h-[calc(70vh-64px)]' : 'h-[calc(500px-64px)]'}`}>
          {/* Context badges */}
          {getContextBadges().length > 0 && (
            <div className="p-2 border-b bg-muted/30">
              <div className="flex flex-wrap gap-1">
                {getContextBadges()}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-lg text-sm leading-relaxed ${message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none'}`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {message.content.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="mb-2 last:mb-0">
                              {paragraph.split('\n').map((line, lineIndex) => (
                                <span key={lineIndex}>
                                  {line}
                                  {lineIndex < paragraph.split('\n').length - 1 && <br />}
                                </span>
                              ))}
                            </p>
                          ))}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
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

          {/* Suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div className="px-4 pb-2 border-t">
              <Collapsible open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-xs text-muted-foreground mb-2 hover:text-foreground transition-colors">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {currentLanguage === 'en' ? 'Suggestions' : currentLanguage === 'de' ? 'Vorschläge' : 'Suggestions'} ({suggestions.length})
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${suggestionsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map((suggestion, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-white text-xs py-1 transition-colors" 
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <AudioRecorder
                onRecordingComplete={sendAudioMessage}
                disabled={isLoading}
              />
              
              <Input 
                value={inputMessage} 
                onChange={(e) => setInputMessage(e.target.value)} 
                onKeyPress={handleKeyPress} 
                placeholder={
                  currentLanguage === 'en' ? 'Ask your question...' :
                  currentLanguage === 'de' ? 'Stellen Sie Ihre Frage...' :
                  'Posez votre question...'
                }
                disabled={isLoading} 
                className="flex-1" 
              />
              
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || !inputMessage.trim()} 
                size="icon"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Return embedded or floating version
  if (className) {
    return <div className={className}>{chatInterface}</div>;
  }

  return (
    <div className={`fixed z-50 ${isMobile ? 'bottom-4 right-4 left-4' : 'bottom-6 right-6'}`}>
      {chatInterface}
    </div>
  );
};

export default UnifiedAudioChatWidget;