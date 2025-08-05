
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Play, Loader2, RotateCcw } from 'lucide-react';
import { userJourneysService } from '@/services/userJourneysService';
import { journeyDeletionService } from '@/services/journeyDeletionService';

interface SimpleJourneyButtonProps {
  journey: {
    id: string;
    name: string;
    citySlug?: string; // Ajout du citySlug optionnel
  };
  userProgress?: {
    id?: string;
    is_completed: boolean;
    current_step_order?: number;
    status?: 'saved' | 'in_progress' | 'completed' | 'abandoned';
  };
  variant?: 'start' | 'continue' | 'replay' | 'resume';
  onStatusChange?: () => void;
}

const SimpleJourneyButton: React.FC<SimpleJourneyButtonProps> = ({ 
  journey, 
  userProgress,
  variant = 'start',
  onStatusChange
}) => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 SimpleJourneyButton - Button clicked for journey:', journey.name);
    
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Authentification requise',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get city slug from journey data or fetch it
      let citySlug = journey.citySlug;
      
      if (!citySlug) {
        console.log('🔍 Fetching city slug for journey:', journey.id);
        
        const { data: journeyData, error: journeyError } = await supabase
          .from('journeys')
          .select(`
            id,
            cities!inner(slug)
          `)
          .eq('id', journey.id)
          .single();

        if (journeyError || !journeyData) {
          console.error('❌ Failed to fetch journey city:', journeyError);
          toast({
            title: 'Erreur',
            description: 'Ville invalide',
            variant: 'destructive',
          });
          return;
        }

        citySlug = journeyData.cities.slug;
      }

      if (!citySlug) {
        toast({
          title: 'Erreur',
          description: 'Ville invalide',
          variant: 'destructive',
        });
        return;
      }

      // Handle different journey actions based on variant and current status
      if (variant === 'start') {
        // Starting a new journey or resuming a saved one
        const { data: existingProgress } = await supabase
          .from('user_journey_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('journey_id', journey.id)
          .maybeSingle();

        if (!existingProgress) {
          // Create new progress entry
          const { error: createError } = await supabase
            .from('user_journey_progress')
            .insert({
              user_id: user.id,
              journey_id: journey.id,
              status: 'in_progress',
              current_step_order: 1,
              total_points_earned: 0,
              is_completed: false
            });

          if (createError) {
            throw createError;
          }

          toast({
            title: 'Succès',
            description: `${t('start_journey')} "${journey.name}"`,
          });
        } else if (existingProgress.status === 'saved') {
          // Resume a saved journey
          await userJourneysService.updateJourneyStatus(existingProgress.id, 'in_progress');
          toast({
            title: 'Succès',
            description: `${t('resume_journey')} "${journey.name}"`,
          });
        }
      } else if (variant === 'resume' && userProgress?.id) {
        // Resume a saved journey
        await userJourneysService.updateJourneyStatus(userProgress.id, 'in_progress');
        toast({
          title: 'Succès',
          description: `${t('resume_journey')} "${journey.name}"`,
        });
      } else if (variant === 'replay' && userProgress?.id) {
        // Reset completed journey for replay - use complete reset
        console.log('🔄 Resetting journey for replay:', journey.id);
        
        const resetResult = await journeyDeletionService.resetJourneyForReplay(user.id, journey.id);
        
        if (!resetResult.success) {
          throw new Error(resetResult.error || 'Failed to reset journey');
        }

        console.log('✅ Journey reset successful:', resetResult);
        
        toast({
          title: 'Succès',
          description: `${t('replay_journey')} "${journey.name}" - Clean slate!`,
        });
      }

      // Trigger refresh if callback provided
      if (onStatusChange) {
        onStatusChange();
      }

      // Navigate to journey using the citySlug
      const journeyUrl = `/destinations/${citySlug}/journey/${journey.id}`;
      console.log('🔗 Navigating to journey:', journeyUrl);
      navigate(journeyUrl);

    } catch (error) {
      console.error('❌ SimpleJourneyButton - Error:', error);
      toast({
        title: 'Erreur',
        description: 'Échec du démarrage du parcours',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button content based on variant
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Chargement...
        </>
      );
    }

    switch (variant) {
      case 'continue':
        return (
          <>
            <Play className="w-4 h-4 mr-2" />
            {t('continue_journey')}
          </>
        );
      case 'replay':
        return (
          <>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('replay_journey')}
          </>
        );
      case 'resume':
        return (
          <>
            <Play className="w-4 h-4 mr-2" />
            {t('resume_journey')}
          </>
        );
      default:
        return (
          <>
            <Play className="w-4 h-4 mr-2" />
            {t('start_journey')}
          </>
        );
    }
  };

  const buttonVariant = variant === 'replay' ? 'outline' : 'default';

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full"
      variant={buttonVariant}
    >
      {getButtonContent()}
    </Button>
  );
};

export default SimpleJourneyButton;
