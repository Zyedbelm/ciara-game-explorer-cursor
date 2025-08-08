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
import { getLanguageSpecificSuggestions } from '@/utils/languageDetection';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Loader2, Sparkles, ChevronDown } from 'lucide-react';
interface ChatWidgetProps {
  currentJourney?: string;
  userLocation?: {
    lat: number;
    lng: number;
  };
}
const ChatWidget: React.FC<ChatWidgetProps> = ({
  currentJourney,
  userLocation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const isMobile = useIsMobile();
  const {
    profile
  } = useAuth();
  const {
    city
  } = useCityOptional();
  const {
    t,
    currentLanguage
  } = useLanguage();

  // Enhanced chat hook with language detection and translation
  const { messages, isLoading, suggestions, sendTextMessage, clearChat, messagesEndRef } = useChat({
    cityName: city?.name || 'destination',
    currentJourney,
    userLocation,
    isInJourney: false,
    mode: 'text',
    persistence: 'session'
  });
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
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Auto-collapse sections on mobile when chat opens
  useEffect(() => {
    if (isMobile && isOpen) {
      setSuggestionsOpen(false);
    }
  }, [isMobile, isOpen]);
  if (!isOpen) {
    return <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button onClick={() => setIsOpen(true)} className="h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-white hover:scale-110 transition-all duration-300 attention-glow" size="icon">
            <MessageCircle className="h-7 w-7" />
          </Button>
          
          {currentJourney && <Badge className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs">
              Aide disponible
            </Badge>}
        </div>
      </div>;
  }
  return <div className={`fixed z-50 ${isMobile ? 'bottom-4 right-4 left-4' : 'bottom-6 right-6'}`}>
      <Card className={`${isMobile ? 'w-full' : 'w-80'} shadow-2xl border-0 transition-all duration-300 ${isMinimized ? 'h-16' : isMobile ? 'h-[70vh]' : 'h-[500px]'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-white rounded-t-lg">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" />
            CIARA Assistant
            <Sparkles className="h-3 w-3" />
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && <CardContent className={`p-0 flex flex-col ${isMobile ? 'h-[calc(70vh-64px)]' : 'h-[calc(500px-64px)]'}`}>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => <div key={message.id} className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${message.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg text-sm leading-relaxed ${message.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
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
                  </div>)}
                
                {isLoading && <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-bl-none p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* ✅ Always show suggestions when available or when chat is empty */}
            {(suggestions.length > 0 || messages.length === 0) && !isLoading && (
              <div className="px-4 pb-2 border-t">
                <Collapsible open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-xs text-muted-foreground mb-2 hover:text-foreground transition-colors">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {messages.length === 0 
                        ? (currentLanguage === 'en' ? 'Suggested Questions' : 
                           currentLanguage === 'de' ? 'Vorgeschlagene Fragen' : 
                           'Questions suggérées')
                        : `Suggestions (${suggestions.length})`
                      }
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${suggestionsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary hover:text-white text-xs py-1 transition-colors" 
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))
                      ) : (
                        // ✅ Fallback suggestions if none are loaded
                        getLanguageSpecificSuggestions(currentLanguage).map((suggestion, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary hover:text-white text-xs py-1 transition-colors" 
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Posez votre question..." disabled={isLoading} className="flex-1" />
                <Button onClick={() => handleSendMessage()} disabled={isLoading || !inputMessage.trim()} size="icon">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>}
      </Card>
    </div>;
};
export default ChatWidget;