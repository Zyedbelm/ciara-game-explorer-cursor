import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAudioChat } from '@/hooks/useAudioChat';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { AudioErrorBoundary } from '@/components/audio/AudioErrorBoundary';
import { EnhancedAudioPlayer } from '@/components/audio/EnhancedAudioPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useCityOptional } from '@/contexts/CityContext';
import { useAudioCleanup } from '@/hooks/useAudioCleanup';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Navigation,
  Map,
  HelpCircle,
  Lightbulb,
  Camera,
  Star,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdaptiveChatWidgetProps {
  currentJourney?: string;
  currentStep?: any;
  userLocation?: { lat: number; lng: number };
  isInJourney?: boolean;
  onNavigationHelp?: () => void;
}

const AdaptiveChatWidget: React.FC<AdaptiveChatWidgetProps> = ({ 
  currentJourney, 
  currentStep,
  userLocation, 
  isInJourney = false,
  onNavigationHelp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { city } = useCityOptional();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  // Initialize audio cleanup
  useAudioCleanup();

  // Enhanced audio chat hook with voice messaging
  const {
    messages,
    isLoading,
    suggestions,
    sendTextMessage,
    sendAudioMessage,
    clearChat,
    messagesEndRef
  } = useAudioChat({
    cityName: city?.name || 'destination',
    currentJourney,
    currentStep: currentStep ? {
      name: currentStep.name,
      description: currentStep.description,
      points: currentStep.points_awarded
    } : null,
    userLocation,
    isInJourney
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


  // Floating Chat Button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => {
              
              setIsOpen(true);
            }}
            className={`h-16 w-16 rounded-full shadow-lg text-white transition-all duration-300 ${
              isInJourney 
                ? 'bg-nature hover:bg-nature-dark' 
                : 'bg-primary hover:bg-primary-dark'
            }`}
            size="icon"
          >
            {isInJourney ? <Navigation className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
          </Button>
          
            {currentStep && (
            <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded-md shadow-lg ${
              isInJourney 
                ? 'bg-nature text-nature-foreground' 
                : 'bg-primary text-primary-foreground'
            }`}>
              <div className="text-center">
                <div className="font-medium">IA Guide</div>
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
      } ${isInJourney ? 'border-2 border-nature' : ''}`}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-3 rounded-t-lg ${
          isInJourney 
            ? 'bg-nature text-nature-foreground' 
            : 'bg-primary text-primary-foreground'
        }`}>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isInJourney ? <Navigation className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            CIARA {isInJourney ? 'Guide' : 'Assistant'}
            <Sparkles className="h-3 w-3" />
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                isInJourney 
                  ? 'text-nature-foreground hover:bg-nature-foreground/20' 
                  : 'text-primary-foreground hover:bg-primary-foreground/20'
              }`}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                isInJourney 
                  ? 'text-nature-foreground hover:bg-nature-foreground/20' 
                  : 'text-primary-foreground hover:bg-primary-foreground/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className={`p-0 flex flex-col ${isMobile ? 'h-[calc(80vh-64px)]' : 'h-[calc(500px-64px)]'}`}>
            {/* Messages - Flexible height */}
            <ScrollArea className="flex-grow min-h-0 overflow-auto">
              <div className="p-4 space-y-4 min-h-full flex flex-col justify-end">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : isInJourney ? 'bg-nature text-nature-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-muted-foreground rounded-bl-none'
                      }`}>
                        {message.content}
                         {message.messageType === 'audio' && message.audioData && (
                           <div className="mt-2">
                              <EnhancedAudioPlayer 
                                audioData={message.audioData}
                                autoPlay={message.role === 'assistant'}
                                onError={(error) => console.error('Audio playbook error:', error)}
                              />
                           </div>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isInJourney ? 'bg-nature text-nature-foreground' : 'bg-secondary text-secondary-foreground'
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

            {/* Compact Context-Aware Action Buttons */}
            {isInJourney && currentStep && (
              <div className="border-t bg-muted/20">
                <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto text-xs hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        <span>Actions rapides</span>
                      </div>
                      {isActionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleSendMessage(`Comment trouver ${currentStep.name}?`);
                          setIsActionsOpen(false);
                        }}
                        className="text-xs h-8"
                      >
                        <Map className="h-3 w-3 mr-1" />
                        Localiser
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleSendMessage(`Raconte-moi l'histoire de ${currentStep.name}`);
                          setIsActionsOpen(false);
                        }}
                        className="text-xs h-8"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Histoire
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Compact Suggestions */}
            {suggestions.length > 0 && !isLoading && (
              <div className="border-t bg-muted/10">
                <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto text-xs hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3" />
                        <span>Suggestions ({suggestions.length})</span>
                      </div>
                      {isSuggestionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-auto py-2 px-3 text-left justify-start hover:bg-primary hover:text-white"
                          onClick={() => {
                            handleSendMessage(suggestion);
                            setIsSuggestionsOpen(false);
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Input - Fixed at bottom */}
            <div className="p-3 pt-3 pb-0 border-t bg-background">
              <div className="flex gap-2">
                <AudioErrorBoundary>
                  <AudioRecorder
                    onRecordingComplete={sendAudioMessage}
                    onError={(error) => console.error('Audio recording error:', error)}
                    disabled={isLoading}
                    maxDuration={15}
                  />
                </AudioErrorBoundary>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isInJourney ? 'Posez votre question sur cette étape...' : 'Posez votre question...'}
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className={`shrink-0 ${isInJourney ? 'bg-nature hover:bg-nature-dark text-nature-foreground' : ''}`}
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

export default AdaptiveChatWidget;