
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

  // Fonction pour récupérer les étapes du parcours - VERSION SIMPLE ET EFFICACE
  const fetchSteps = async () => {
    if (!isStepsExpanded) {
      return;
    }
    
    setStepsLoading(true);
    try {
      // ÉTAPE 1: Récupérer les étapes du parcours
      const { data: journeySteps, error: journeyError } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('journey_id', journey.journeyId)
        .order('step_order');

      if (journeyError) {
        return;
      }

      if (!journeySteps || journeySteps.length === 0) {
        setSteps([]);
        return;
      }

      // ÉTAPE 2: Récupérer les détails des étapes
      const stepIds = journeySteps.map(js => js.step_id);
      const { data: stepsDetails, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .in('id', stepIds);

      if (stepsError) {
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

      setSteps(combinedSteps);

    } catch (error) {
    } finally {
      setStepsLoading(false);
    }
  };

  // Récupérer les étapes quand on expand la liste
  useEffect(() => {
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
        throw error;
      }

      // Handle HTML download if available
      if (data?.htmlData && data?.fileName) {
        // Decode the HTML content with proper UTF-8 encoding
        const htmlContent = decodeURIComponent(escape(atob(data.htmlData)));
        
        // Create a blob with the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Open in new tab for preview and print
        const newWindow = window.open(url, '_blank');
        
        // Also offer download
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        toast({
          title: "Carnet de voyage HTML généré !",
          description: "Votre carnet de voyage a été ouvert dans un nouvel onglet. Utilisez Ctrl+P pour imprimer en PDF.",
        });
      } else if (data?.pdfData && data?.fileName) {
        // Fallback for old PDF format
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
      } else {
        throw new Error('Format de réponse non reconnu');
      }
    } catch (error) {
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
        
        <div className="flex gap-2 mt-auto">
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
          
          {/* Bouton de suppression pour saved et in-progress */}
          {(variant === 'saved' || variant === 'in-progress') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {variant === 'completed' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-shrink-0"
              onClick={handleGenerateJournal}
              disabled={isGeneratingJournal}
            >
              {isGeneratingJournal ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  <span className="hidden sm:inline">Génération...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Carnet de voyage</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
