
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import aiJourneyDefault from '@/assets/ai-journey-default.jpg';
import SimpleJourneyButton from '@/components/journey/SimpleJourneyButton';
import { generateTravelJournalPDF } from '@/utils/travelJournalToPDF';

import GenerationCriteriaDisplay from '@/components/journey/GenerationCriteriaDisplay';
import { UserJourneyProgress } from '@/services/userJourneysService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  MapPin, 
  Clock, 
  Trophy, 
  Play,
  CheckCircle,
  Calendar,
  Route,
  Sparkles,
  Share2,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { journeyDeletionService } from '@/services/journeyDeletionService';
import { useJourneyCards } from '@/contexts/JourneyCardsContext';

interface JourneyCardProps {
  journey: UserJourneyProgress;
  variant: 'saved' | 'in-progress' | 'completed';
  onStatusChange: () => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey, variant, onStatusChange }) => {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
  const { expandedCards, toggleCard } = useJourneyCards();
  
  // Utiliser le contexte pour gérer l'expansion des étapes
  const isStepsExpanded = expandedCards.has(journey.id);

  console.log('🎴 JourneyCard variant:', variant, 'journey status:', journey.status);

  // Fonction pour récupérer les étapes du parcours - VERSION SIMPLE ET EFFICACE
  const fetchSteps = async () => {
    console.log('📄 [PDF] fetchSteps appelée - isStepsExpanded:', isStepsExpanded);
    if (!isStepsExpanded) {
      console.log('📄 [PDF] fetchSteps annulée - pas expanded');
      return;
    }
    
    setStepsLoading(true);
    try {
      console.log('📄 [PDF] Début récupération étapes pour journey:', journey.journeyId);
      
      // ÉTAPE 1: Récupérer les étapes du parcours
      const { data: journeySteps, error: journeyError } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('journey_id', journey.journeyId)
        .order('step_order');

      console.log('📄 [PDF] Journey steps récupérées:', journeySteps?.length, 'erreur:', journeyError);

      if (journeyError) {
        console.error('❌ Erreur journey_steps:', journeyError);
        return;
      }

      if (!journeySteps || journeySteps.length === 0) {
        console.log('📄 [PDF] Aucune étape trouvée pour ce parcours');
        setSteps([]);
        return;
      }

      // ÉTAPE 2: Récupérer les détails des étapes
      const stepIds = journeySteps.map(js => js.step_id);
      const { data: stepsDetails, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .in('id', stepIds);

      console.log('📄 [PDF] Détails étapes récupérés:', stepsDetails?.length, 'erreur:', stepsError);

      if (stepsError) {
        console.error('❌ Erreur steps:', stepsError);
        return;
      }

      // ÉTAPE 3: Combiner les données
      const combinedSteps = journeySteps.map(js => {
        const stepDetail = stepsDetails?.find(s => s.id === js.step_id);
        return {
          ...js,
          step_detail: stepDetail
        };
      });

      console.log('📄 [PDF] Étapes combinées:', combinedSteps);
      setSteps(combinedSteps);

    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
    } finally {
      setStepsLoading(false);
    }
  };

  // Récupérer les étapes quand on expand la liste
  useEffect(() => {
    console.log('📄 [PDF] useEffect triggered - isStepsExpanded:', isStepsExpanded, 'journeyId:', journey.journeyId);
    fetchSteps();
  }, [isStepsExpanded, journey.journeyId]);

  const handleDelete = async () => {
    if (isDeleting || !user) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer votre progression pour "${journey.title}" ? Cette action est irréversible et supprimera toutes vos validations.`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      console.log('🗑️ Complete journey deletion:', { userId: user.id, journeyId: journey.journeyId });
      
      const result = await journeyDeletionService.deleteJourneyCompletely(user.id, journey.journeyId);
      
      if (result.success) {
        toast({
          title: 'Succès',
          description: `Parcours supprimé avec succès. ${result.points_removed} points retirés.`,
        });
        
        // Trigger refresh
        onStatusChange();
      } else {
        throw new Error(result.error || 'Failed to delete journey');
      }
    } catch (error) {
      console.error('❌ Error deleting journey:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le parcours',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAcquire = async () => {
    if (isAcquiring || !user || variant !== 'completed') return;
    
    setIsAcquiring(true);
    
    try {
      console.log('🏆 Acquiring journey:', { userId: user.id, journeyId: journey.journeyId });
      
      const success = await journeyDeletionService.acquireCompletedJourney(user.id, journey.journeyId);
      
      if (success) {
        toast({
          title: 'Succès',
          description: `Parcours "${journey.title}" acquis définitivement !`,
        });
        
        // Trigger refresh
        onStatusChange();
      } else {
        throw new Error('Failed to acquire journey');
      }
    } catch (error) {
      console.error('❌ Error acquiring journey:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'acquérir le parcours',
        variant: 'destructive',
      });
    } finally {
      setIsAcquiring(false);
    }
  };

  const handleGenerateJournal = async () => {
    if (!user || variant !== 'completed') return;
    
    setIsGeneratingJournal(true);
    
    try {
      console.log('🎯 Generating travel journal with data:', {
        journeyName: journey.title,
        journeyId: journey.journeyId,
        userJourneyProgressId: journey.id, // Use the user_journey_progress.id
        rating: journey.rating,
        comment: journey.userComment
      });

      const { data, error } = await supabase.functions.invoke('generate-travel-journal', {
        body: {
          journeyName: journey.title,
          rating: journey.rating || 5,
          comment: journey.userComment || '',
          language: currentLanguage,
          journeyId: journey.journeyId,
          userJourneyProgressId: journey.id // Use the user_journey_progress.id
        }
      });

      if (error) {
        console.error('❌ Travel journal generation error:', error);
        throw error;
      }

      console.log('🎉 Travel journal generated successfully:', data);
      
      // Handle PDF download if available
      if (data?.pdfData && data?.fileName) {
        const blob = new Blob([Uint8Array.from(atob(data.pdfData), c => c.charCodeAt(0))], 
          { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Carnet de voyage PDF généré !",
          description: "Votre carnet de voyage PDF a été téléchargé avec succès.",
        });
      } else if (data?.format === 'html' || data?.content) {
        // Fallback: Generate PDF locally using the HTML content
        console.log('📄 Using local PDF generation as fallback');
        
        // Create journal data from the response with rich information
        console.log('📄 [PDF] Steps data for journal:', steps);
        
        const journalData = {
          city: data.metadata?.cityName || 'Ville inconnue',
          journey: journey.title,
          date: new Date().toLocaleDateString(currentLanguage),
          completedSteps: data.metadata?.stepCount || 0,
          totalSteps: journey.totalSteps,
          totalPoints: data.metadata?.totalPoints || journey.pointsEarned,
          steps: steps.map((stepData, index) => {
            console.log('📄 [PDF] Processing step:', stepData);
            const stepDetail = stepData.step_detail;
            
            return {
              name: stepDetail?.name || `Étape ${index + 1}`,
              description: stepDetail?.description || 'Aucune description disponible',
              completedAt: new Date().toLocaleDateString(currentLanguage),
              points: stepDetail?.points_awarded || 10,
              imageUrl: stepDetail?.images?.[0] || undefined,
              address: stepDetail?.address || 'Adresse non disponible',
              latitude: stepDetail?.latitude,
              longitude: stepDetail?.longitude
            };
          }),
          userInfo: {
            name: user.user_metadata?.full_name || 'Explorateur',
            email: user.email || ''
          },
          rating: journey.rating,
          comment: journey.userComment,
          duration: journey.duration,
          distance: undefined, // Distance non disponible dans UserJourneyProgress - pourrait être ajoutée dans le futur
          journeyImage: journey.imageUrl || undefined,
          insights: {
            bestTime: 'Après-midi (14h-18h)',
            averageRating: 4.2,
            popularSteps: steps.slice(0, 3).map(s => s.steps.name),
            completionRate: ((data.metadata?.stepCount || 0) / journey.totalSteps) * 100
          }
        };

        // Generate PDF locally
        await generateTravelJournalPDF(journalData);
        
        toast({
          title: "Carnet de voyage PDF généré !",
          description: "Votre carnet de voyage PDF a été téléchargé avec succès.",
        });
      } else {
        throw new Error('Format de réponse non reconnu');
      }
    } catch (error) {
      console.error('Error generating travel journal:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le carnet de voyage.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingJournal(false);
    }
  };

  const getBadgeContent = () => {
    switch (variant) {
      case 'saved':
        return (
          <Badge variant="default" className="bg-purple-500">
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="default" className="bg-blue-500">
            <Play className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        );
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'saved':
        return 'start';
      case 'in-progress':
        return 'resume';
      case 'completed':
        return 'replay';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow w-full max-w-sm min-h-[400px] flex flex-col">
      <div className="relative h-40">
        <img 
          src={journey.generationCriteria ? aiJourneyDefault : (journey.imageUrl || aiJourneyDefault)} 
          alt={journey.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">{journey.category}</Badge>
        </div>
        <div className="absolute top-4 right-4">
          {getBadgeContent()}
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{journey.title}</h3>
        
        {variant === 'in-progress' && (
          <div className="space-y-3 mb-4 flex-grow">
            {/* Informations de base optimisées sur une ligne */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {journey.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{journey.estimatedDuration}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Route className="h-3 w-3" />
                  <span>{journey.difficulty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{journey.totalSteps} étapes</span>
                </div>
              </div>
            </div>

            {/* Progression compacte */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{journey.progress}%</span>
              </div>
              <Progress value={journey.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Étape {journey.currentStep}/{journey.totalSteps}</span>
                <span>{journey.pointsEarned}/{journey.totalPoints} points</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="truncate">Dernière activité : {new Date(journey.lastActivity).toLocaleDateString(currentLanguage)}</span>
            </div>

            {/* Menu déroulant des étapes */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCard(journey.id)}
                className="w-full justify-between p-2 h-auto hover:bg-white/50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    Détail des étapes
                  </span>
                </div>
                {isStepsExpanded ? (
                  <ChevronUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                )}
              </Button>

              {isStepsExpanded && (
                <div className="px-2 pb-2 space-y-1 bg-white/30 dark:bg-gray-900/30 rounded-b-lg max-h-32 overflow-y-auto">
                  {stepsLoading ? (
                    <div className="text-center text-xs text-muted-foreground py-1">
                      Chargement...
                    </div>
                  ) : steps.length > 0 ? (
                    steps.map((stepData, index) => {
                      const step = stepData.steps;
                      const stepName = step?.name_en && currentLanguage === 'en' ? step.name_en :
                                     step?.name_de && currentLanguage === 'de' ? step.name_de :
                                     step?.name || `Étape ${index + 1}`;
                      
                      return (
                        <div key={step?.id || index} className="flex items-center justify-between p-1 text-xs">
                          <span className="truncate flex-1">{index + 1}. {stepName}</span>
                          <Badge variant="outline" className="ml-2 text-xs px-1 py-0">
                            {step?.points_awarded || 0} pts
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-1">
                      Aucune étape trouvée
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {variant === 'saved' && (
          <div className="space-y-3 mb-4">
            {/* Informations de base du parcours */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {journey.estimatedDuration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{journey.estimatedDuration}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Route className="h-3 w-3" />
                <span>{journey.difficulty}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>{journey.totalSteps} étapes</span>
              </div>
            </div>

            {/* Points totaux disponibles */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Trophy className="h-4 w-4" />
              <span>{journey.totalPoints} points disponibles</span>
            </div>
          </div>
        )}

        {variant === 'completed' && (
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {journey.completedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(journey.completedDate).toLocaleDateString(currentLanguage)}</span>
                  </div>
                )}
                {journey.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{journey.duration}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 font-medium text-primary">
                <Trophy className="h-3 w-3" />
                <span>+{journey.pointsEarned}</span>
              </div>
            </div>
            
            {journey.rating && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Note</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < journey.rating!
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {journey.userComment && (
              <div className="mt-2">
                <p className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded italic line-clamp-2">
                  "{journey.userComment}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Affichage des critères de génération pour les parcours IA */}
        {journey.generationCriteria && variant === 'saved' && (
          <GenerationCriteriaDisplay 
            criteria={journey.generationCriteria}
            generatedAt={journey.generatedAt}
            className="mb-4"
          />
        )}
        
        <div className="flex flex-col gap-2 sm:flex-row mt-auto">
          <SimpleJourneyButton
            journey={{ 
              id: journey.journeyId, 
              name: journey.title,
              citySlug: journey.citySlug 
            }}
            userProgress={{ 
              id: journey.id,
              is_completed: variant === 'completed', 
              current_step_order: variant === 'in-progress' ? journey.currentStep : undefined,
              status: journey.status 
            }}
            variant={getButtonVariant()}
            onStatusChange={onStatusChange}
          />
          
          {/* Boutons secondaires dans une ligne séparée sur mobile */}
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Bouton de suppression pour saved et in-progress */}
            {(variant === 'saved' || variant === 'in-progress') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            {variant === 'completed' && (
              <>
                {/* Travel journal button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={handleGenerateJournal}
                  disabled={isGeneratingJournal}
                >
                  {isGeneratingJournal ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      Génération...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Carnet de voyage
                    </div>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
