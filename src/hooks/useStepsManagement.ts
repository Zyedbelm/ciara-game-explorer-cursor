import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StepFormData } from '@/components/admin/StepForm';

interface Step {
  id: string;
  name: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  points_awarded: number;
  validation_radius: number;
  has_quiz: boolean;
  images?: string[];
  is_active: boolean;
  city_id: string;
  created_at: string;
  updated_at: string;
  city_name?: string;
  journey_names?: string[];
}

interface City {
  id: string;
  name: string;
  slug: string;
  country_id: string;
}

interface Journey {
  id: string;
  name: string;
  city_id: string;
}

export const useStepsManagement = (cityId?: string) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchCities = async () => {
    try {
      // Fetch cities with country information and filter out archived countries
      const { data, error } = await supabase
        .from('cities')
        .select(`
          id, 
          name, 
          slug,
          country_id,
          countries!inner(id, is_active)
        `)
        .eq('is_archived', false)
        .eq('countries.is_active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      });
    }
  };

  const fetchJourneys = async () => {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('id, name, city_id')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setJourneys(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les parcours",
        variant: "destructive",
      });
    }
  };

  const updateJourneyMetadata = async (journeyId: string) => {
    try {
      // Récupérer toutes les étapes du parcours via la table journey_steps
      const { data: journeySteps, error: stepsError } = await supabase
        .from('journey_steps')
        .select(`
          steps!inner(
            id,
            points_awarded,
            is_active
          )
        `)
        .eq('journey_id', journeyId)
        .eq('steps.is_active', true);

      if (stepsError) throw stepsError;

      // Calculer les métadonnées
      const totalSteps = journeySteps?.length || 0;
      const totalPoints = journeySteps?.reduce((sum, item) => 
        sum + (item.steps?.points_awarded || 0), 0) || 0;

      // Mettre à jour le parcours
      const { error: updateError } = await supabase
        .from('journeys')
        .update({
          total_steps: totalSteps,
          total_points: totalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', journeyId);

      if (updateError) throw updateError;

      } catch (error) {
    }
  };

  const fetchSteps = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('steps')
        .select(`
          *,
          cities!inner(
            name,
            countries!inner(id, is_active)
          ),
          journey_steps(
            journeys(
              id,
              name
            )
          )
        `)
        .eq('cities.countries.is_active', true)
        .order('created_at', { ascending: false });

      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedSteps: Step[] = (data || []).map(step => ({
        ...step,
        city_name: step.cities?.name,
        journey_names: step.journey_steps?.map((js: any) => js.journeys?.name).filter(Boolean) || []
      }));

      setSteps(formattedSteps);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les étapes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStep = async (data: StepFormData) => {
    setSubmitting(true);
    try {
      const stepData = {
        ...data,
        journey_id: data.journey_id || null,
        images: data.images || []
      };

      const { error } = await supabase
        .from('steps')
        .insert([stepData]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Étape créée avec succès",
      });

      // Mettre à jour les métadonnées du parcours si applicable
      if (data.journey_id) {
        await updateJourneyMetadata(data.journey_id);
      }

      await fetchSteps();
      return { error: null };
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'étape",
        variant: "destructive",
      });
      return { error };
    } finally {
      setSubmitting(false);
    }
  };

  const updateStep = async (stepId: string, data: StepFormData) => {
    setSubmitting(true);
    try {
      // Préparer les données en filtrant les valeurs undefined et en gérant les types correctement
      const stepData: any = {};
      
      // Seulement inclure les champs qui ont des valeurs définies
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined) {
          if (key === 'images') {
            stepData[key] = value || [];
          } else {
            stepData[key] = value;
          }
        }
      });

      // S'assurer que les champs obligatoires sont présents
      if (!stepData.updated_at) {
        stepData.updated_at = new Date().toISOString();
      }

      const { error, data: result } = await supabase
        .from('steps')
        .update(stepData)
        .eq('id', stepId)
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Étape modifiée avec succès",
      });

      // Mettre à jour les métadonnées du parcours si applicable
      if (data.journey_id) {
        await updateJourneyMetadata(data.journey_id);
      }

      await fetchSteps();
      return { error: null };
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'étape",
        variant: "destructive",
      });
      return { error };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStep = async (stepId: string) => {
    try {
      // Vérifier si l'étape est dans des parcours
      const { data: journeySteps, error: checkError } = await supabase
        .from('journey_steps')
        .select('journey_id')
        .eq('step_id', stepId);

      if (checkError) throw checkError;

      // Si l'étape est dans des parcours, proposer suppression forcée
      if (journeySteps && journeySteps.length > 0) {
        const confirmForce = window.confirm(
          `Cette étape est utilisée dans ${journeySteps.length} parcours.\n\n` +
          `• ANNULER: Pour retirer l'étape des parcours manuellement\n` +
          `• OK: Pour supprimer l'étape ET la retirer automatiquement des parcours`
        );
        
        if (!confirmForce) {
          toast({
            title: "Suppression annulée",
            description: "Retirez d'abord l'étape des parcours si vous souhaitez la supprimer.",
            variant: "destructive",
          });
          return { error: new Error("Deletion cancelled by user") };
        }

        // Supprimer d'abord les relations journey_steps
        const { error: deleteRelationsError } = await supabase
          .from('journey_steps')
          .delete()
          .eq('step_id', stepId);

        if (deleteRelationsError) {
          console.error('Erreur suppression relations:', deleteRelationsError);
          // Continuer même si ça échoue - CASCADE devrait gérer
        }
      }

      // TOUJOURS supprimer les analytics_events (pas de CASCADE)
      console.log('🧹 Suppression analytics_events pour étape:', stepId);
      const { error: deleteAnalyticsError } = await supabase
        .from('analytics_events')
        .delete()
        .eq('step_id', stepId);

      if (deleteAnalyticsError) {
        console.error('❌ Erreur suppression analytics:', deleteAnalyticsError);
        // Continuer même si ça échoue
      } else {
        console.log('✅ Analytics_events supprimés avec succès');
      }

      // Supprimer l'étape (CASCADE devrait gérer le reste)
      const { error } = await supabase
        .from('steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        console.error('❌ Erreur suppression étape:', error);
        
        // Fallback: essayer avec la fonction RPC
        console.log('🔄 Tentative avec fonction RPC force_delete_step...');
        const { data: rpcResult, error: rpcError } = await supabase.rpc('force_delete_step', {
          step_id_param: stepId
        });
        
        if (rpcError) {
          console.error('❌ RPC force_delete_step échoué:', rpcError);
          throw new Error(`Suppression échouée: ${error.message}. RPC échoué: ${rpcError.message}`);
        }
        
        if (!rpcResult) {
          throw new Error(`Suppression échouée: ${error.message}. RPC retourné false.`);
        }
        
        console.log('✅ Suppression réussie via RPC');
      }

      toast({
        title: "Succès",
        description: "Étape supprimée avec succès",
      });

      // Pas besoin de mettre à jour les métadonnées puisque l'étape n'était dans aucun parcours

      await fetchSteps();
      return { error: null };
    } catch (error: any) {
      console.error('Erreur deleteStep:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'étape",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchCities();
    fetchJourneys();
    fetchSteps();
  }, [cityId]);

  return {
    steps,
    cities,
    journeys,
    loading,
    submitting,
    createStep,
    updateStep,
    deleteStep,
    fetchSteps
  };
}; 