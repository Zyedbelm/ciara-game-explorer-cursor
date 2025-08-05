import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { JourneyImageUpload } from './JourneyImageUpload';
import { useAdminTranslation } from '@/utils/adminTranslations';
import {
  MapPin,
  Plus,
  Trash2,
  Save,
  Eye,
  Clock,
  Target,
  Zap,
  Image,
  FileText,
  Trophy
} from 'lucide-react';

const journeySchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category_id: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  estimated_duration: z.number().min(15, 'Durée minimale de 15 minutes'),
  // distance_km will be automatically calculated
  image_url: z.string().optional(),
  is_active: z.boolean(),
  is_predefined: z.boolean(),
});

type JourneyFormData = z.infer<typeof journeySchema>;

interface Step {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
  points_awarded: number;
  validation_radius: number;
  address?: string;
  images?: string[];
  has_quiz: boolean;
  city_id: string; // Added the missing city_id property
}

interface JourneyCreatorProps {
  onJourneyCreated?: () => void;
  editingJourney?: any;
  onClose?: () => void;
}

const JourneyCreatorContent: React.FC<JourneyCreatorProps> = ({ 
  onJourneyCreated, 
  editingJourney, 
  onClose 
}) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const t = useAdminTranslation();
  const { withErrorBoundary } = useErrorBoundary();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableSteps, setAvailableSteps] = useState<Step[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<Step[]>([]);
  const [city, setCity] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string>('');

  const form = useForm<JourneyFormData>({
    resolver: zodResolver(journeySchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      difficulty: 'medium',
      estimated_duration: 60,
      // distance_km will be calculated automatically
      image_url: '',
      is_active: true,
      is_predefined: true,
    },
  });

  useEffect(() => {
    if (!authLoading && profile) {
      fetchInitialData();
    }
  }, [profile, authLoading]);

  // Separate useEffect for populating form after categories are loaded
  useEffect(() => {
    if (editingJourney && categories.length > 0) {
      populateFormWithJourney();
    }
  }, [editingJourney, categories]);

  // Distance is now always calculated automatically from steps

  const fetchInitialData = async () => {
    try {
      console.log('🔄 Fetching initial data for journey creator');
      console.log('👤 Profile:', { role: profile?.role, city_id: profile?.city_id });
      
      let cityData = null;
      
      if (profile?.role === 'tenant_admin' && profile?.city_id) {
        const { data: tenantCity, error: cityError } = await supabase
          .from('cities')
          .select('*')
          .eq('id', profile.city_id)
          .single();
          
        if (cityError) {
          console.error('Error fetching tenant city:', cityError);
          throw new Error('Impossible de récupérer votre ville assignée');
        }
        cityData = tenantCity;
      } else if (profile?.role === 'super_admin') {
        // For super admins, fetch all active cities and let them choose
        const { data: allCities, error: cityError } = await supabase
          .from('cities')
          .select(`
            *,
            countries!inner (
              name_fr,
              name_en, 
              name_de,
              code,
              is_active
            )
          `)
          .eq('is_archived', false)
          .eq('is_visible_on_homepage', true)
          .eq('countries.is_active', true)
          .order('name');
          
        if (cityError) {
          console.error('Error fetching cities for super admin:', cityError);
          throw cityError;
        }
        
        console.log('📍 Available cities for super admin:', allCities?.length || 0);
        setCities(allCities || []);
        
        // If editing a journey, set the city to the journey's city
        if (editingJourney?.city_id) {
          cityData = allCities?.find(c => c.id === editingJourney.city_id);
          console.log('📍 Using journey city for editing:', cityData?.name);
        } else if (allCities && allCities.length > 0) {
          // Default to first city when creating new journey
          cityData = allCities[0];
          console.log('📍 Using first available city for new journey:', cityData.name);
        }
      }
      
      if (!cityData) {
        throw new Error('Aucune ville disponible');
      }
      
      console.log('🏙️ Selected city:', cityData.name);
      setCity(cityData);

      // Load data for the selected city
      await loadDataForCity(cityData.id);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : t('admin.error.load_failed'),
        variant: "destructive",
      });
    }
  };

  const loadDataForCity = async (cityId: string) => {
    try {
      console.log('📂 Fetching categories for city:', cityId);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('journey_categories')
        .select('*')
        .eq('city_id', cityId);
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      console.log('✅ Categories loaded:', categoriesData?.length || 0);
      setCategories(categoriesData || []);

      console.log('👣 Fetching steps for city:', cityId);
      const { data: stepsData, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .eq('city_id', cityId) // Filtre obligatoire par ville
        .eq('is_active', true);
      
      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
        throw stepsError;
      }
      
      console.log('✅ Steps loaded for city:', stepsData?.length || 0);
      console.log('🔍 Sample step data:', stepsData?.[0] || 'No steps found');
      
      // Validate step data and filter out any incomplete steps
      const validSteps = (stepsData || []).filter(step => {
        // Vérification supplémentaire de sécurité : s'assurer que city_id correspond
        const isValid = step.id && step.name && step.latitude && step.longitude && step.city_id === cityId;
        if (!isValid) {
          console.warn('⚠️ Invalid or wrong city step found:', step);
        }
        return isValid;
      });
      
      console.log('✅ Valid steps after filtering for city:', validSteps.length);
      setAvailableSteps(validSteps);
    } catch (error) {
      console.error('❌ Error loading city data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la ville",
        variant: "destructive",
      });
    }
  };

  const handleCityChange = async (cityId: string) => {
    const selectedCity = cities.find(c => c.id === cityId);
    if (selectedCity) {
      console.log('🏙️ Changing city to:', selectedCity.name);
      setCity(selectedCity);
      setSelectedSteps([]); // Clear selected steps when changing city
      setAvailableSteps([]); // Clear available steps immediately
      form.setValue('category_id', ''); // Clear category selection
      await loadDataForCity(cityId);
    }
  };

  const populateFormWithJourney = () => {
    if (!editingJourney) {
      console.log('⚠️ No editing journey provided');
      return;
    }
    
    console.log('🔄 Populating form with journey data:', editingJourney.id);
    console.log('📋 Journey steps data structure:', editingJourney.journey_steps);
    console.log('🏷️ Journey category_id:', editingJourney.category_id);
    console.log('🏷️ Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
    
    form.reset({
      name: editingJourney.name,
      description: editingJourney.description || '',
      category_id: editingJourney.category_id,
      difficulty: editingJourney.difficulty,
      estimated_duration: editingJourney.estimated_duration || 60,
      // distance_km will be calculated from steps
      image_url: editingJourney.image_url || '',
      is_active: editingJourney.is_active,
      is_predefined: editingJourney.is_predefined,
    });

    // Verify the category was set correctly
    const formCategoryId = form.getValues('category_id');
    console.log('✅ Form category_id after reset:', formCategoryId);
    const categoryExists = categories.find(c => c.id === formCategoryId);
    console.log('🔍 Category exists in available list:', !!categoryExists, categoryExists?.name);

    if (editingJourney.journey_steps && Array.isArray(editingJourney.journey_steps)) {
      console.log('👣 Processing journey steps:', editingJourney.journey_steps.length);
      
      // Handle new data structure: journey_steps contains step_order and steps object
      const steps = editingJourney.journey_steps
        .filter((js: any) => {
          const isValid = js && js.steps && js.steps.id && js.steps.name;
          if (!isValid) {
            console.warn('⚠️ Invalid journey step data:', js);
          }
          return isValid;
        })
        .sort((a: any, b: any) => (a.step_order || 0) - (b.step_order || 0))
        .map((js: any) => {
          // Extract the step data from the nested structure
          const step = js.steps;
          console.log('📍 Processing step:', step.name, 'Order:', js.step_order);
          return step;
        });
      
      console.log('✅ Valid steps loaded:', steps.length);
      console.log('🔍 Sample step structure:', steps[0] || 'No valid steps');
      setSelectedSteps(steps);
    } else {
      console.log('⚠️ No valid journey_steps found in editing journey');
      setSelectedSteps([]);
    }
  };

  const addStepToJourney = withErrorBoundary(() => {
    const step = availableSteps.find(s => s.id === selectedStepId);
    if (step && !selectedSteps.find(s => s.id === step.id)) {
      setSelectedSteps([...selectedSteps, step]);
      setSelectedStepId('');
      setStepDialogOpen(false);
      toast({
        title: "Étape ajoutée",
        description: `${step.name} a été ajoutée au parcours`,
      });
    }
  });

  const removeStepFromJourney = (stepId: string) => {
    setSelectedSteps(selectedSteps.filter(s => s.id !== stepId));
    toast({
      title: "Étape supprimée",
      description: "L'étape a été retirée du parcours",
    });
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedSteps.findIndex(s => s.id === stepId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedSteps.length) return;
    
    const newSteps = [...selectedSteps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    setSelectedSteps(newSteps);
  };

  const calculateTotalPoints = () => {
    return selectedSteps.reduce((total, step) => total + (step.points_awarded || 0), 0);
  };

  const calculateDistance = () => {
    if (selectedSteps.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < selectedSteps.length - 1; i++) {
      const step1 = selectedSteps[i];
      const step2 = selectedSteps[i + 1];
      
      // Calcul de la distance "à vol d'oiseau" entre deux points géographiques
      // Note: Cette distance ne représente pas la distance réelle de marche
      // qui peut être plus longue selon les rues et chemins disponibles
      const R = 6371; // Rayon de la Terre en km
      const dLat = (step2.latitude - step1.latitude) * Math.PI / 180;
      const dLon = (step2.longitude - step1.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(step1.latitude * Math.PI / 180) * Math.cos(step2.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    return parseFloat(totalDistance.toFixed(2));
  };

  const onSubmit = async (data: JourneyFormData) => {
    console.log('🚀 Starting journey submission');
    console.log('📋 Form data:', data);
    console.log('👤 Profile:', { id: profile?.user_id, role: profile?.role });
    console.log('🏙️ City:', city);
    console.log('👣 Selected steps:', selectedSteps.length);

    // Validation checks
    if (selectedSteps.length === 0) {
      console.warn('⚠️ No steps selected');
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une étape au parcours",
        variant: "destructive",
      });
      return;
    }

    if (!city?.id) {
      console.error('❌ No city selected');
      toast({
        title: "Erreur",
        description: "Aucune ville sélectionnée",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.user_id) {
      console.error('❌ No authenticated user');
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Set up timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('⏰ Operation timeout after 30 seconds');
      setLoading(false);
      toast({
        title: "Erreur",
        description: "L'opération a expiré. Veuillez réessayer.",
        variant: "destructive",
      });
    }, 30000);

    try {
      console.log('📝 Preparing journey data');
      const journeyData = {
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        city_id: city.id,
        difficulty: data.difficulty,
        estimated_duration: data.estimated_duration,
        distance_km: calculateDistance(), // Always use calculated distance
        image_url: data.image_url,
        is_active: data.is_active,
        is_predefined: data.is_predefined,
        total_points: calculateTotalPoints(),
        created_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(), // Force update of modification date
      };

      console.log('💾 Journey data prepared:', journeyData);

      let journey;
      if (editingJourney) {
        console.log('✏️ Updating existing journey:', editingJourney.id);
        
        // Delete existing journey steps first
        console.log('🗑️ Deleting existing journey steps');
        const { error: deleteError } = await supabase
          .from('journey_steps')
          .delete()
          .eq('journey_id', editingJourney.id);

        if (deleteError) {
          console.error('❌ Error deleting journey steps:', deleteError);
          throw deleteError;
        }

        // Update journey
        console.log('🔄 Updating journey');
        const { data: updatedJourney, error: journeyError } = await supabase
          .from('journeys')
          .update(journeyData)
          .eq('id', editingJourney.id)
          .select()
          .single();

        if (journeyError) {
          console.error('❌ Error updating journey:', journeyError);
          throw journeyError;
        }
        
        console.log('✅ Journey updated successfully');
        journey = updatedJourney;
      } else {
        console.log('➕ Creating new journey');
        const { data: newJourney, error: journeyError } = await supabase
          .from('journeys')
          .insert(journeyData)
          .select()
          .single();

        if (journeyError) {
          console.error('❌ Error creating journey:', journeyError);
          throw journeyError;
        }
        
        console.log('✅ Journey created successfully:', newJourney.id);
        journey = newJourney;
      }

      // Insert journey steps
      console.log('👣 Inserting journey steps');
      const journeySteps = selectedSteps.map((step, index) => ({
        journey_id: journey.id,
        step_id: step.id,
        step_order: index + 1,
      }));

      console.log('📊 Journey steps to insert:', journeySteps);

      const { error: stepsError } = await supabase
        .from('journey_steps')
        .insert(journeySteps);

      if (stepsError) {
        console.error('❌ Error inserting journey steps:', stepsError);
        throw stepsError;
      }

      console.log('✅ Journey steps inserted successfully');
      console.log('🎉 Journey operation completed successfully');

      // Clear timeout since we succeeded
      clearTimeout(timeoutId);

      toast({
        title: editingJourney ? "Parcours modifié" : "Parcours créé",
        description: `Le parcours "${data.name}" a été ${editingJourney ? 'modifié' : 'créé'} avec succès`,
      });

      onJourneyCreated?.();
      onClose?.();
      
      if (!editingJourney) {
        form.reset();
        setSelectedSteps([]);
      }

    } catch (error) {
      console.error('❌ Error saving journey:', error);
      clearTimeout(timeoutId);
      
      // Use static error message to avoid translation issues in catch block
      let errorMessage = "Une erreur est survenue lors de la sauvegarde";
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        // Provide more specific error messages based on common issues
        if (error.message.includes('duplicate key')) {
          errorMessage = "Un parcours avec ce nom existe déjà";
        } else if (error.message.includes('foreign key')) {
          errorMessage = "Données de référence invalides";
        } else if (error.message.includes('not-null')) {
          errorMessage = "Champs obligatoires manquants";
        }
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Cleaning up journey submission');
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: t('admin.journey.form.difficulty.easy'),
      medium: t('admin.journey.form.difficulty.medium'),
      hard: t('admin.journey.form.difficulty.hard'),
      expert: t('admin.journey.form.difficulty.expert')
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('admin.status.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {editingJourney ? t('admin.journey.edit.title') : t('admin.journey.create.title')}
          </h2>
          <p className="text-muted-foreground">
            {editingJourney ? 'Modifiez les détails de votre parcours' : 'Créez un parcours interactif pour vos visiteurs'}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            {t('admin.actions.cancel')}
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('admin.journey.form.basic_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.journey.form.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.journey.form.name.placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                   control={form.control}
                   name="description"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('admin.journey.form.description')}</FormLabel>
                       <FormControl>
                         <Textarea 
                           placeholder={t('admin.journey.form.description.placeholder')}
                           className="min-h-20"
                           {...field} 
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="category_id"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('admin.journey.form.category')}</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder={t('admin.journey.form.category.placeholder')} />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           {categories.map((category) => (
                             <SelectItem key={category.id} value={category.id}>
                               {category.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       {categories.length === 0 && (
                         <p className="text-sm text-muted-foreground">
                           {city ? `Aucune catégorie disponible pour ${city.name}` : 'Sélectionnez d\'abord une ville'}
                         </p>
                       )}
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* City Selection for Super Admins */}
                 {profile?.role === 'super_admin' && (
                   <div className="space-y-2">
                     <Label>Ville</Label>
                     <Select value={city?.id || ''} onValueChange={handleCityChange}>
                       <SelectTrigger>
                         <SelectValue placeholder="Sélectionnez une ville" />
                       </SelectTrigger>
                       <SelectContent>
                         {cities.map((cityOption) => (
                           <SelectItem key={cityOption.id} value={cityOption.id}>
                             <div className="flex items-center gap-2">
                               <MapPin className="h-4 w-4" />
                               {cityOption.name}
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <p className="text-sm text-muted-foreground">
                       Choisissez la ville pour laquelle vous créez ce parcours
                     </p>
                   </div>
                 )}

                 {/* Display selected city for Tenant Admins */}
                 {profile?.role === 'tenant_admin' && city && (
                   <div className="space-y-2">
                     <Label>Ville assignée</Label>
                     <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                       <MapPin className="h-4 w-4 text-primary" />
                       <span className="font-medium">{city.name}</span>
                       <Badge variant="secondary">Assignée</Badge>
                     </div>
                   </div>
                 )}

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <JourneyImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.image_url?.message}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.journey.form.difficulty')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">{t('admin.journey.form.difficulty.easy')}</SelectItem>
                          <SelectItem value="medium">{t('admin.journey.form.difficulty.medium')}</SelectItem>
                          <SelectItem value="hard">{t('admin.journey.form.difficulty.hard')}</SelectItem>
                          <SelectItem value="expert">{t('admin.journey.form.difficulty.expert')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.journey.form.duration')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15" 
                          max="480"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Distance est maintenant calculée automatiquement et affichée dans le résumé */}

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>{t('admin.journey.form.active')}</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_predefined"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>{t('admin.journey.form.predefined')}</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('admin.journey.steps.title')} ({selectedSteps.length})
                </div>
                <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!city}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('admin.journey.steps.add')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une étape</DialogTitle>
                      <DialogDescription>
                        Choisissez une étape à ajouter à votre parcours
                      </DialogDescription>
                      {city && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <span className="text-sm font-medium">Ville sélectionnée: </span>
                          <Badge variant="secondary">{city.name}</Badge>
                        </div>
                      )}
                    </DialogHeader>
                    <div className="space-y-4">
                      {!city ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Veuillez d'abord sélectionner une ville</p>
                        </div>
                      ) : availableSteps.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Aucune étape disponible pour {city.name}</p>
                          <p className="text-sm">Créez d'abord des étapes pour cette ville</p>
                        </div>
                      ) : (
                        <>
                          <Select value={selectedStepId} onValueChange={setSelectedStepId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une étape" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSteps
                                .filter(step => {
                                  // Double filtrage de sécurité
                                  const isFromCorrectCity = step.city_id === city.id;
                                  const isNotAlreadySelected = !selectedSteps.find(s => s.id === step.id);
                                  
                                  if (!isFromCorrectCity) {
                                    console.warn('🚨 Step from wrong city detected and filtered out:', step);
                                  }
                                  
                                  return isFromCorrectCity && isNotAlreadySelected;
                                })
                                .map((step) => (
                                  <SelectItem key={step.id} value={step.id}>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{step.type || 'Non défini'}</Badge>
                                      {step.name}
                                      <span className="text-xs text-muted-foreground ml-2">
                                        ({city.name})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {availableSteps.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {availableSteps.filter(step => !selectedSteps.find(s => s.id === step.id)).length} étape(s) disponible(s) pour {city.name}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={addStepToJourney}
                        disabled={!selectedStepId || !city}
                      >
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!city ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Veuillez d'abord sélectionner une ville</p>
                  <p className="text-sm">La sélection d'une ville est obligatoire pour ajouter des étapes</p>
                </div>
              ) : selectedSteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('admin.journey.steps.empty')}</p>
                  <p className="text-sm">Ajoutez des étapes de {city.name} à votre parcours</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStep(step.id, 'down')}
                          disabled={index === selectedSteps.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Badge>{step.type || 'Non défini'}</Badge>
                          <span className="font-medium">{step.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {city.name}
                          </Badge>
                          {step.has_quiz && (
                            <Badge variant="secondary">Quiz</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>📍 {step.address || 'Adresse non définie'}</span>
                          <span>🏆 {step.points_awarded} points</span>
                          <span>📍 Rayon: {step.validation_radius}m</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStepFromJourney(step.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Résumé du Parcours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedSteps.length}</div>
                    <div className="text-sm text-muted-foreground">Étapes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{calculateTotalPoints()}</div>
                    <div className="text-sm text-muted-foreground">Points Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {form.watch('estimated_duration') || 0}min
                    </div>
                    <div className="text-sm text-muted-foreground">Durée</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {calculateDistance().toFixed(2)}km
                    </div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-center">
                  <Badge className={getDifficultyColor(form.watch('difficulty'))}>
                    {getDifficultyLabel(form.watch('difficulty'))}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                toast({
                  title: t('admin.actions.preview'),
                  description: "Fonctionnalité d'aperçu à venir",
                });
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              {t('admin.actions.preview')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>{t('admin.status.saving')}</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {editingJourney ? t('admin.actions.edit') : t('admin.actions.create')} le Parcours
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const JourneyCreator: React.FC<JourneyCreatorProps> = (props) => {
  return (
    <EnhancedErrorBoundary resetKeys={[props.editingJourney?.id]}>
      <JourneyCreatorContent {...props} />
    </EnhancedErrorBoundary>
  );
};

export default JourneyCreator;
