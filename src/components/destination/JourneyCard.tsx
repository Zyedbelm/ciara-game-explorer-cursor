
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star, Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import SimpleJourneyButton from '@/components/journey/SimpleJourneyButton';
import JourneyStepsList from './JourneyStepsList';
import { useJourneySteps } from '@/hooks/useJourneySteps';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { journeyDeletionService } from '@/services/journeyDeletionService';
import { useJourneyCards } from '@/contexts/JourneyCardsContext';

interface Journey {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  estimated_duration?: number;
  distance_km?: number;
  image_url?: string;
  category?: {
    name: string;
    type: string;
    icon?: string;
    color?: string;
  };
}

interface UserProgress {
  is_completed: boolean;
  current_step_order?: number;
  total_points_earned?: number;
}

interface JourneyCardProps {
  journey: Journey;
  userProgress?: UserProgress;
  showProgress?: boolean;
  onProgressChange?: () => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ 
  journey, 
  userProgress, 
  showProgress = false,
  onProgressChange
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: steps = [], isLoading: stepsLoading } = useJourneySteps(journey.id);
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const { expandedCards, toggleCard } = useJourneyCards();
  
  // Utiliser le contexte pour gérer l'expansion des étapes
  const stepsListOpen = expandedCards.has(journey.id);

  

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getButtonVariant = () => {
    if (!showProgress || !userProgress) return 'start';
    if (userProgress.is_completed) return 'replay';
    if (userProgress.current_step_order && userProgress.current_step_order > 1) return 'continue';
    return 'start';
  };

  const handleDeleteJourney = async () => {
    if (!user || !userProgress) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer votre progression pour "${journey.name}" ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const result = await journeyDeletionService.deleteJourneyCompletely(user.id, journey.id);
      
      if (result.success) {
        toast({
          title: 'Succès',
          description: `Progression supprimée pour "${journey.name}". ${result.points_removed} points retirés.`,
        });
        
        // Trigger refresh
        if (onProgressChange) {
          onProgressChange();
        }
      } else {
        throw new Error(result.error || 'Failed to delete journey');
      }
      
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la progression',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow w-full max-w-sm min-h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="relative h-40">
          <img 
            src={journey.image_url || '/placeholder.svg'} 
            alt={journey.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">
              {journey.category?.name || 'Général'}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2">
          {journey.name}
        </h3>

        {/* Description */}
        {journey.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {journey.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Stats - Optimisé sur une seule ligne */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {journey.estimated_duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{journey.estimated_duration} min</span>
              </div>
            )}
            
            {journey.distance_km && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{journey.distance_km} km</span>
              </div>
            )}
          </div>

          {/* Difficulty badge intégré */}
          {journey.difficulty && (
            <Badge className={getDifficultyColor(journey.difficulty)}>
              {journey.difficulty}
            </Badge>
          )}
        </div>

        {/* Journey Steps List - Now integrated back into the card */}
        {!stepsLoading && steps.length > 0 && (
          <div className="mt-4">
            <JourneyStepsList
              steps={steps}
              isOpen={stepsListOpen}
              onToggle={() => toggleCard(journey.id)}
              estimatedDuration={journey.estimated_duration}
            />
          </div>
        )}

        {/* Progress Info */}
        {showProgress && userProgress && (
          <div className="mt-3 p-2 bg-muted rounded-lg">
            <div className="text-sm">
              {userProgress.is_completed ? (
                <span className="text-green-600 font-medium">
                  ✓ Parcours terminé
                </span>
              ) : userProgress.current_step_order && userProgress.current_step_order > 1 ? (
                <span className="text-blue-600">
                  En cours - Étape {userProgress.current_step_order}
                </span>
              ) : (
                <span className="text-gray-600">
                  Prêt à commencer
                </span>
              )}
              {userProgress.total_points_earned && userProgress.total_points_earned > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {userProgress.total_points_earned} points gagnés
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <div className="p-4 flex-shrink-0 mt-auto">
        <div className="flex gap-2 w-full">
          <SimpleJourneyButton
            journey={journey}
            userProgress={userProgress}
            variant={getButtonVariant()}
            onStatusChange={onProgressChange}
          />
          {showProgress && userProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteJourney}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default JourneyCard;
