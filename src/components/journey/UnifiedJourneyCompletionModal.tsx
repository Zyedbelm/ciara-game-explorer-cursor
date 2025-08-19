import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, 
  Star, 
  BookOpen, 
  Gift, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  PartyPopper,
  Zap,
  Download,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeHTML } from '@/utils/securityUtils';

interface UnifiedJourneyCompletionModalProps {
  isVisible: boolean;
  journeyName: string;
  totalPoints: number;
  journeyId?: string;
  userJourneyProgressId?: string; // Add progress record ID
  onComplete: (rating: number, comment: string) => void;
  onClose: () => void;
}

export const UnifiedJourneyCompletionModal: React.FC<UnifiedJourneyCompletionModalProps> = ({
  isVisible,
  journeyName,
  totalPoints,
  journeyId,
  userJourneyProgressId,
  onComplete,
  onClose
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
  const [step, setStep] = useState<'celebration' | 'rating' | 'completed'>('celebration');
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalContent, setJournalContent] = useState<string>('');
  
  const { toast } = useToast();
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleContinueToRating = () => {
    setStep('rating');
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: t('journey_completion_rating_required'),
        description: t('journey_completion_rating_required_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the rating and comment
      await onComplete(rating, comment);

      // Send celebration email in background with enhanced error handling
      if (user && profile) {
        try {
          const emailResult = await supabase.functions.invoke('send-journey-completion', {
            body: {
              email: profile.email,
              userName: profile.full_name || 'Explorateur',
              journeyName,
              pointsEarned: totalPoints,
              totalPoints: profile.total_points + totalPoints,
              language: currentLanguage,
              userRating: rating,
            }
          });

          if (emailResult.error) {
            // Don't show error to user as email is not critical for completion
          } else {
            }
        } catch (emailError) {
          // Non-blocking - continue with completion flow
        }
      }

      setStep('completed');
      
      toast({
        title: t('journey_completed'),
        description: t('journey_completion_success').replace('{rating}', rating.toString()),
      });

      // Note: Redirection is now handled by useJourneyCompletion hook to avoid duplicates

    } catch (error) {
      toast({
        title: 'Erreur',
        description: t('journey_completion_failed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateJournal = async () => {
    if (rating === 0) {
      toast({
        title: t('journey_completion_rating_required'),
        description: t('journey_completion_rate_first'),
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingJournal(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-travel-journal', {
        body: {
          journeyName,
          rating,
          comment,
          language: currentLanguage,
          journeyId: journeyId,
          userJourneyProgressId: userJourneyProgressId
        }
      });

      if (error) {
        throw error;
      }

      // Handle HTML format with PDF conversion instructions
      if (data?.content && data?.format === 'html') {
        // Display text content in modal for preview
        setJournalContent(data.generatedText || '');
        setShowJournalModal(true);
        
        // Also offer HTML download with PDF instructions
        const blob = new Blob([data.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName || `${journeyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_journal.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: t('travel_journal_generated'),
          description: t('travel_journal_html_downloaded') || 'Your travel journal HTML has been downloaded - use Ctrl+P to save as PDF!',
        });
      } else if (data && data.journal && data.journal.content) {
        // Legacy text format
        setJournalContent(data.journal.content);
        setShowJournalModal(true);
        
        toast({
          title: t('travel_journal_generated'),
          description: t('travel_journal_created_successfully'),
        });
      } else {
        toast({
          title: t('travel_journal_generated'),
          description: t('travel_journal_created_successfully'),
        });
      }

    } catch (error) {
      toast({
        title: 'Erreur',
        description: t('travel_journal_generation_error'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingJournal(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-2xl animate-scale-in">
        <CardContent className="p-0">
          {/* Celebration Step */}
          {step === 'celebration' && (
            <div className="text-center space-y-6 p-8">
              {/* Animated Header */}
              <div className="relative">
                <div className="flex justify-center mb-4">
                  <div className="relative animate-bounce">
                    <Trophy className="h-20 w-20 text-yellow-500" />
                    <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                    <PartyPopper className="h-6 w-6 text-orange-500 absolute -bottom-1 -left-1 animate-pulse" />
                  </div>
                </div>
                
                 <div className="space-y-3">
                   <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                     {t('journey_completion_congratulations')}
                   </h1>
                   <p className="text-lg text-amber-800 font-medium">
                     {t('journey_completion_finished')}
                   </p>
                  <div className="bg-white/80 rounded-xl p-4 border border-yellow-200">
                    <p className="font-bold text-amber-900 text-xl mb-2">
                      "{journeyName}"
                    </p>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 text-lg px-4 py-2">
                      <Trophy className="h-4 w-4 mr-2" />
                      +{totalPoints} points
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
               <Button 
                 onClick={handleContinueToRating}
                 size="lg"
                 className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
               >
                 <Star className="mr-3 h-5 w-5" />
                 {t('journey_completion_evaluate')}
                 <ArrowRight className="ml-3 h-5 w-5" />
               </Button>

               <p className="text-sm text-amber-700 opacity-80">
                 {t('journey_completion_feedback_help')}
               </p>
            </div>
          )}

          {/* Rating Step */}
          {step === 'rating' && (
            <div className="space-y-6 p-8">
               <div className="text-center space-y-3">
                 <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                 <h2 className="text-2xl font-bold text-amber-900">
                   {t('journey_completion_how_was_experience')}
                 </h2>
                <p className="text-amber-700">
                  "{journeyName}"
                </p>
              </div>

              {/* Rating Stars */}
               <div className="text-center space-y-4">
                 <label className="block text-lg font-semibold text-amber-900">
                   {t('journey_completion_your_rating')}
                 </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-all duration-200 focus:outline-none hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= (hoveredStar || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } transition-all duration-200 drop-shadow-sm`}
                      />
                    </button>
                  ))}
                </div>
                 {rating > 0 && (
                   <p className="text-lg font-bold text-yellow-600">
                     {rating}/5 {t('journey_completion_stars')}
                   </p>
                 )}
              </div>

              {/* Comment Section */}
               <div className="space-y-3">
                 <label className="block text-sm font-semibold text-amber-900">
                   {t('journey_completion_comment_optional')}
                 </label>
                 <Textarea
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder={t('journey_completion_comment_placeholder')}
                   className="min-h-[80px] resize-none border-amber-200 focus:border-amber-400 bg-white/80"
                   maxLength={500}
                 />
                <p className="text-xs text-amber-600">
                  {comment.length}/500 caractères
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSubmitRating}
                  disabled={isSubmitting || rating === 0}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg"
                >
                   {isSubmitting ? (
                     <div className="flex items-center space-x-2">
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                       <span>{t('journey_completion_finalizing')}</span>
                     </div>
                   ) : (
                     <>
                       <CheckCircle className="mr-2 h-5 w-5" />
                       {t('journey_completion_finish_journey')}
                     </>
                   )}
                </Button>

                 <Button
                   onClick={onClose}
                   variant="ghost"
                   className="w-full text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                 >
                   {t('journey_completion_skip_rating')}
                 </Button>
              </div>
            </div>
          )}

          {/* Completed Step */}
          {step === 'completed' && (
            <div className="text-center space-y-6 p-8">
              <div className="space-y-4">
                <div className="relative">
                  <Zap className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
                  <Sparkles className="h-6 w-6 text-yellow-400 absolute top-0 right-1/2 translate-x-8 animate-pulse" />
                </div>
                
                 <h2 className="text-2xl font-bold text-green-800">
                   {t('journey_completion_thank_you')}
                 </h2>
                 <p className="text-green-700">
                   {t('journey_completion_rating_saved')}
                 </p>
                 
                 <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                   <p className="text-green-800 font-semibold">
                     {rating}/5 {t('journey_completion_stars')} ⭐
                   </p>
                 </div>
              </div>

              {/* Additional Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGenerateJournal}
                  disabled={isGeneratingJournal}
                  variant="outline"
                  size="lg"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-4 rounded-xl"
                >
                   {isGeneratingJournal ? (
                     <div className="flex items-center space-x-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                       <span>{t('journey_completion_generating_journal')}</span>
                     </div>
                   ) : (
                     <>
                       <BookOpen className="mr-2 h-5 w-5" />
                       {t('journey_completion_create_travel_journal')}
                     </>
                   )}
                </Button>

                 <Button 
                   onClick={() => window.location.href = '/rewards'}
                   variant="outline"
                   size="lg"
                   className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 py-4 rounded-xl"
                 >
                   <Gift className="mr-2 h-5 w-5" />
                   {t('journey_completion_discover_rewards')}
                 </Button>

                 <Button 
                   onClick={onClose}
                   size="lg"
                   className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 rounded-xl"
                 >
                   {t('journey_completion_back_to_journeys')}
                 </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Travel Journal Modal */}
      <Dialog open={showJournalModal} onOpenChange={setShowJournalModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('travel_journal_modal_title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div 
              className="prose prose-sm max-w-none mt-4 p-4 bg-muted/50 rounded-lg"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHTML(journalContent || '', import.meta.env.VITE_SECURITY_DRY_RUN === 'true') 
              }} 
            />
            
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  // Create and download PDF
                  const element = document.createElement('a');
                  const file = new Blob([journalContent], { type: 'text/html' });
                  element.href = URL.createObjectURL(file);
                  element.download = `carnet-voyage-${journeyName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('travel_journal_download')}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowJournalModal(false)}
              >
                <X className="h-4 w-4 mr-2" />
                {t('travel_journal_close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};