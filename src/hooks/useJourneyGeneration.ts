
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCitySlug } from '@/hooks/useCitySlug';
import { useAuth } from '@/hooks/useAuth';
import aiJourneyDefault from '@/assets/ai-journey-default.jpg';

interface JourneyPreferences {
  duration: string;
  interests: string[];
  difficulty: string;
  groupSize: string;
  startLocation?: string;
}

interface GeneratedJourney {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  steps: Array<{
    stepId: string;
    order: number;
    customInstructions: string;
  }>;
  totalPoints: number;
  categoryId: string;
  cityId: string;
  generatedByAi: boolean;
  generationParams: JourneyPreferences;
  generatedAt: string;
}

export const useJourneyGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJourney, setGeneratedJourney] = useState<GeneratedJourney | null>(null);
  const { toast } = useToast();
  const citySlug = useCitySlug();
  const { isAuthenticated, user } = useAuth();

  const validatePreferences = (preferences: JourneyPreferences): boolean => {
    if (!preferences.duration || !preferences.difficulty || preferences.interests.length === 0) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const checkAuthentication = (): boolean => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour générer un parcours",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const getCityId = async (): Promise<string | null> => {
    try {
      const { data: city, error } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', citySlug)
        .single();

      if (error || !city) {
        toast({
          title: "Erreur",
          description: "Impossible de trouver la ville",
          variant: "destructive"
        });
        return null;
      }

      return city.id;
    } catch (error) {
      console.error('Error fetching city:', error);
      return null;
    }
  };

  const generateJourney = async (preferences: JourneyPreferences): Promise<GeneratedJourney | null> => {
    if (!checkAuthentication() || !validatePreferences(preferences)) {
      return null;
    }

    setIsGenerating(true);
    
    try {
      const cityId = await getCityId();
      if (!cityId) {
        return null;
      }

      console.log('🚀 Generating journey with preferences:', preferences);
      console.log('🏙️ City ID:', cityId);
      console.log('👤 User authenticated:', user?.email);

      const { data, error } = await supabase.functions.invoke('generate-journey', {
        body: {
          preferences,
          cityId
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.error) {
        console.error('❌ Generation error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.journey) {
        console.error('❌ No journey data returned');
        throw new Error('Aucun parcours généré');
      }

      const journeyData = {
        ...data.journey,
        generatedAt: new Date().toISOString()
      };
      
      console.log('✅ Journey generated successfully:', journeyData);

      setGeneratedJourney(journeyData);
      
      toast({
        title: "Parcours généré !",
        description: `"${journeyData.name}" a été créé avec succès.`
      });

      return journeyData;

    } catch (error) {
      console.error('💥 Generation error:', error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Impossible de générer le parcours. Réessayez plus tard.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveJourney = async (journey: GeneratedJourney): Promise<boolean> => {
    if (!checkAuthentication()) {
      return false;
    }

    try {
      console.log('💾 Saving journey to database:', journey.name);
      console.log('👤 User ID:', user?.id);

      // Create the journey in the database with created_by set to current user
      const { data: newJourney, error: createError } = await supabase
        .from('journeys')
        .insert({
          name: journey.name,
          description: journey.description,
          category_id: journey.categoryId,
          city_id: journey.cityId,
          difficulty: journey.difficulty,
          estimated_duration: journey.estimatedDuration,
          total_points: journey.totalPoints,
          image_url: aiJourneyDefault, // Image par défaut pour les parcours IA
          is_predefined: false,
          created_by: (await supabase.auth.getUser()).data.user?.id // Set the creator to current user for RLS policy
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating journey:', createError);
        throw createError;
      }

      // Create journey steps
      if (journey.steps && journey.steps.length > 0) {
        const journeySteps = journey.steps.map((step) => ({
          journey_id: newJourney.id,
          step_id: step.stepId,
          step_order: step.order,
          custom_instructions: step.customInstructions
        }));

        const { error: stepsError } = await supabase
          .from('journey_steps')
          .insert(journeySteps);

        if (stepsError) {
          console.error('❌ Error creating journey steps:', stepsError);
          throw stepsError;
        }
      }

      // Create user journey progress entry with 'saved' status and generation criteria
      const { error: progressError } = await supabase
        .from('user_journey_progress')
        .insert({
          user_id: user.id,
          journey_id: newJourney.id,
          status: 'saved',
          current_step_order: 1,
          total_points_earned: 0,
          is_completed: false,
          generation_source: 'ai_generated',
          generation_criteria: JSON.parse(JSON.stringify(journey.generationParams)),
          generated_at: journey.generatedAt
        });

      if (progressError) {
        console.error('❌ Error creating user progress entry:', progressError);
        throw progressError;
      }

      console.log('✅ Journey saved successfully with ID:', newJourney.id);
      
      toast({
        title: "Parcours enregistré !",
        description: `Le parcours "${journey.name}" a été sauvegardé. Retrouvez-le dans "Mes parcours".`,
        duration: 5000
      });

      return true;

    } catch (error) {
      console.error('💥 Save error:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible d'enregistrer le parcours. Réessayez plus tard.",
        variant: "destructive"
      });
      return false;
    }
  };

  const resetJourney = () => {
    setGeneratedJourney(null);
  };

  return {
    isGenerating,
    generatedJourney,
    generateJourney,
    saveJourney,
    resetJourney
  };
};
