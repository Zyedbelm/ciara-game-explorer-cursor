
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCountry } from '@/contexts/CountryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { MapPin, Plus, Edit, Settings, Globe, Palette, Eye, EyeOff, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const citySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères'),
  country_id: z.string().uuid('Veuillez sélectionner un pays'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().optional(),
  default_language: z.string().optional(),
  supported_languages: z.array(z.string()).optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  subscription_plan: z.enum(['starter', 'professional', 'enterprise']),
  is_visible_on_homepage: z.boolean(),
  hero_image_url: z.string().url().optional().or(z.literal('')),
  // Package fields
  annual_amount_chf: z.number().min(0),
  billing_period: z.enum(['annual', 'monthly']),
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
  auto_renewal: z.boolean(),
  contact_person_name: z.string().optional(),
  contact_person_email: z.string().email().optional().or(z.literal('')),
  contact_person_phone: z.string().optional(),
});

type CityFormData = z.infer<typeof citySchema>;

interface City {
  id: string;
  name: string;
  slug: string;
  country?: string;
  country_id: string;
  description: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  default_language?: string;
  supported_languages?: string[];
  primary_color?: string;
  secondary_color?: string;
  subscription_plan?: string;
  is_visible_on_homepage?: boolean;
  is_archived?: boolean;
  is_active?: boolean; // Nouvelle colonne pour contrôler la visibilité sur le site web
  hero_image_url?: string;
  created_at: string;
  updated_at: string;
  package?: CityPackage;
}

interface Country {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_de: string;
}

interface CityPackage {
  id: string;
  package_type: string;
  annual_amount_chf: number;
  billing_period: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  payment_status: string;
  is_active: boolean;
}

const CityManagement: React.FC = () => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const { countries } = useCountry();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('');

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: '',
      slug: '',
      country_id: '',
      description: '',
      latitude: 46.5197,
      longitude: 6.6323,
      timezone: 'Europe/Zurich',
      default_language: 'fr',
      supported_languages: ['fr'],
      primary_color: '#2563eb',
      secondary_color: '#7c3aed',
      subscription_plan: 'starter',
      is_visible_on_homepage: true,
          hero_image_url: '',
      // Package defaults
      annual_amount_chf: 15000,
      billing_period: 'annual',
      contract_start_date: '',
      contract_end_date: '',
      auto_renewal: true,
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
    },
  });

  useEffect(() => {
    fetchCities();
  }, [selectedCountryFilter]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      let query = supabase.from('cities').select(`
        *,
        countries(name_fr, name_en, name_de, code),
        city_packages(*)
      `);

      // Filter by city if tenant admin
      if (profile?.role === 'tenant_admin' && profile?.city_id) {
        query = query.eq('id', profile.city_id);
      }

      // Filter by country if selected
      if (selectedCountryFilter && selectedCountryFilter !== 'all') {
        query = query.eq('country_id', selectedCountryFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include package info
      const citiesWithPackages = data?.map((city: any) => ({
        ...city,
        package: city.city_packages?.[0] || null
      })) || [];
      
      setCities(citiesWithPackages);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CityFormData) => {
    try {
      const cityData = {
        name: data.name,
        slug: data.slug,
        country_id: data.country_id,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        default_language: data.default_language,
        supported_languages: data.supported_languages || ['fr'],
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        subscription_plan: data.subscription_plan,
        is_visible_on_homepage: data.is_visible_on_homepage,
        hero_image_url: data.hero_image_url || null,
      };

      const packageData = {
        package_type: data.subscription_plan,
        annual_amount_chf: data.annual_amount_chf,
        billing_period: data.billing_period,
        contract_start_date: data.contract_start_date || null,
        contract_end_date: data.contract_end_date || null,
        auto_renewal: data.auto_renewal,
        contact_person_name: data.contact_person_name || '',
        contact_person_email: data.contact_person_email || '',
        contact_person_phone: data.contact_person_phone || '',
        payment_status: 'pending',
        is_active: true,
      };

      if (editingCity) {
        // Update city
        const { error: cityError } = await supabase
          .from('cities')
          .update(cityData)
          .eq('id', editingCity.id);

        if (cityError) throw cityError;

        // Update or create package
        const { data: existingPackage } = await supabase
          .from('city_packages')
          .select('id')
          .eq('city_id', editingCity.id)
          .single();

        if (existingPackage) {
          const { error: packageError } = await supabase
            .from('city_packages')
            .update(packageData)
            .eq('city_id', editingCity.id);

          if (packageError) throw packageError;
        } else {
          const { error: packageError } = await supabase
            .from('city_packages')
            .insert({ ...packageData, city_id: editingCity.id });

          if (packageError) throw packageError;
        }

        toast({
          title: "Ville modifiée",
          description: `La ville "${data.name}" a été modifiée avec succès`,
        });
      } else {
        // Create new city
        const { data: newCity, error: cityError } = await supabase
          .from('cities')
          .insert(cityData)
          .select('id')
          .single();

        if (cityError) throw cityError;

        // Create package for new city
        const { error: packageError } = await supabase
          .from('city_packages')
          .insert({ ...packageData, city_id: newCity.id });

        if (packageError) throw packageError;

        toast({
          title: "Ville créée",
          description: `La ville "${data.name}" a été créée avec succès`,
        });
      }

      setCreateDialogOpen(false);
      setEditingCity(null);
      form.reset();
      fetchCities();
    } catch (error: any) {
      console.error('Error saving city:', error);
      
      // Message d'erreur plus détaillé
      let errorMessage = "Impossible de sauvegarder la ville.";
      
      if (error.code === '23514') {
        if (error.message.includes('valid_category_icons')) {
          errorMessage = "Erreur de contrainte : Les icônes de catégories ne sont pas autorisées. Contactez l'administrateur pour corriger la base de données.";
        } else {
          errorMessage = "Erreur de contrainte : Vérifiez que toutes les données sont valides.";
        }
      } else if (error.code === '23505') {
        errorMessage = "Une ville avec ce nom ou ce slug existe déjà.";
      } else if (error.code === '23503') {
        errorMessage = "Erreur de référence : Le pays sélectionné n'existe pas ou n'est pas actif.";
      } else if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (city: City) => {
    setEditingCity(city);
    
    // Load package data for this city
    const { data: packageData } = await supabase
      .from('city_packages')
      .select('*')
      .eq('city_id', city.id)
      .single();

    form.reset({
      name: city.name,
      slug: city.slug,
      country_id: city.country_id,
      description: city.description,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone || 'Europe/Zurich',
      default_language: city.default_language || 'fr',
      supported_languages: city.supported_languages || ['fr'],
      primary_color: city.primary_color || '#2563eb',
      secondary_color: city.secondary_color || '#7c3aed',
      subscription_plan: (city.subscription_plan as any) || 'starter',
      is_visible_on_homepage: city.is_visible_on_homepage ?? true,
      hero_image_url: city.hero_image_url || '',
      // Package data
      annual_amount_chf: packageData?.annual_amount_chf || 15000,
      billing_period: (packageData?.billing_period as any) || 'annual',
      contract_start_date: packageData?.contract_start_date || '',
      contract_end_date: packageData?.contract_end_date || '',
      auto_renewal: packageData?.auto_renewal ?? true,
      contact_person_name: packageData?.contact_person_name || '',
      contact_person_email: packageData?.contact_person_email || '',
      contact_person_phone: packageData?.contact_person_phone || '',
    });
    setCreateDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getSubscriptionPlanColor = (plan: string) => {
    const colors = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800'
    };
    return colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPackageName = (packageType: string) => {
    const packageNames = {
      starter: 'Starter',
      professional: 'Professional', 
      enterprise: 'Enterprise'
    };
    return packageNames[packageType as keyof typeof packageNames] || packageType;
  };

  const getCountryName = (city: any) => {
    if (city.countries) {
      return city.countries.name_fr || city.countries.name_en || city.countries.code;
    }
    return city.country || 'Non défini';
  };

  const handleArchiveToggle = async (city: City, isArchived: boolean) => {
    try {
      const { error } = await supabase
        .from('cities')
        .update({ is_archived: isArchived })
        .eq('id', city.id);

      if (error) throw error;

      toast({
        title: isArchived ? "Ville archivée" : "Ville restaurée",
        description: `La ville "${city.name}" a été ${isArchived ? 'archivée' : 'restaurée'} avec succès`,
      });

      fetchCities();
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut d'archivage de la ville",
        variant: "destructive",
      });
    }
  };

  const handleActiveToggle = async (city: City, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('cities')
        .update({ is_active: isActive })
        .eq('id', city.id);

      if (error) throw error;

      toast({
        title: isActive ? "Ville activée" : "Ville désactivée",
        description: `La ville "${city.name}" ${isActive ? 'apparaîtra maintenant sur le site web' : 'est maintenant masquée du site web'}`,
      });

      fetchCities();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut d'activité de la ville",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCity = async (city: City) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement la ville "${city.name}" ? Cette action supprimera également toutes les données associées (parcours, étapes, utilisateurs, etc.) et ne peut pas être annulée.`)) {
      return;
    }

    try {
      console.log('Début de la suppression de la ville:', city.id);

      // 1. Supprimer les packages de la ville
      console.log('Suppression des packages de la ville...');
      const { error: packageError } = await supabase
        .from('city_packages')
        .delete()
        .eq('city_id', city.id);

      if (packageError) {
        console.error('Erreur suppression packages:', packageError);
        throw packageError;
      }

      // 2. Supprimer les étapes de la ville (et leurs références)
      console.log('Suppression des étapes de la ville...');
      const { data: citySteps, error: stepsFetchError } = await supabase
        .from('steps')
        .select('id')
        .eq('city_id', city.id);

      if (stepsFetchError) {
        console.error('Erreur récupération des étapes:', stepsFetchError);
        throw stepsFetchError;
      }

      if (citySteps && citySteps.length > 0) {
        const stepIds = citySteps.map(step => step.id);
        
        // Supprimer les références dans journey_steps
        const { error: journeyStepsError } = await supabase
          .from('journey_steps')
          .delete()
          .in('step_id', stepIds);

        if (journeyStepsError) {
          console.error('Erreur suppression journey_steps:', journeyStepsError);
          throw journeyStepsError;
        }

        // Supprimer les références dans step_completions
        const { error: completionsError } = await supabase
          .from('step_completions')
          .delete()
          .in('step_id', stepIds);

        if (completionsError) {
          console.error('Erreur suppression step_completions:', completionsError);
          throw completionsError;
        }

        // Supprimer les références dans analytics_events
        const { error: analyticsError } = await supabase
          .from('analytics_events')
          .delete()
          .in('step_id', stepIds);

        if (analyticsError) {
          console.error('Erreur suppression analytics_events:', analyticsError);
          // Ne pas throw car cette table pourrait ne pas exister
        }

        // Supprimer les références dans quiz_questions
        const { error: quizError } = await supabase
          .from('quiz_questions')
          .delete()
          .in('step_id', stepIds);

        if (quizError) {
          console.error('Erreur suppression quiz_questions:', quizError);
          // Ne pas throw car cette table pourrait ne pas exister
        }

        // Supprimer les références dans step_content_documents
        const { error: documentsError } = await supabase
          .from('step_content_documents')
          .delete()
          .in('step_id', stepIds);

        if (documentsError) {
          console.error('Erreur suppression step_content_documents:', documentsError);
          // Ne pas throw car cette table pourrait ne pas exister
        }

        // Supprimer les étapes
        const { error: stepsDeleteError } = await supabase
          .from('steps')
          .delete()
          .in('id', stepIds);

        if (stepsDeleteError) {
          console.error('Erreur suppression des étapes:', stepsDeleteError);
          throw stepsDeleteError;
        }
      }

      // 3. Supprimer les parcours de la ville
      console.log('Suppression des parcours de la ville...');
      const { error: journeysError } = await supabase
        .from('journeys')
        .delete()
        .eq('city_id', city.id);

      if (journeysError) {
        console.error('Erreur suppression des parcours:', journeysError);
        throw journeysError;
      }

      // 4. Supprimer les catégories de parcours de la ville
      console.log('Suppression des catégories de parcours...');
      const { error: categoriesError } = await supabase
        .from('journey_categories')
        .delete()
        .eq('city_id', city.id);

      if (categoriesError) {
        console.error('Erreur suppression des catégories:', categoriesError);
        throw categoriesError;
      }

      // 5. Supprimer les utilisateurs de la ville (tenant_admin et visitor)
      console.log('Suppression des utilisateurs de la ville...');
      const { error: usersError } = await supabase
        .from('profiles')
        .delete()
        .eq('city_id', city.id);

      if (usersError) {
        console.error('Erreur suppression des utilisateurs:', usersError);
        throw usersError;
      }

      // 6. Supprimer la ville elle-même
      console.log('Suppression de la ville elle-même...');
      const { data: deleteResult, error: cityDeleteError } = await supabase
        .from('cities')
        .delete()
        .eq('id', city.id)
        .select('id');

      if (cityDeleteError) {
        console.error('Erreur suppression de la ville:', cityDeleteError);
        throw cityDeleteError;
      }

      if (!deleteResult || deleteResult.length === 0) {
        console.error('Aucune ville supprimée - aucune ligne affectée');
        throw new Error('Aucune ville supprimée - vérifiez les permissions ou les contraintes');
      }

      console.log('Résultat de la suppression:', deleteResult);

      console.log('Ville supprimée avec succès');

      // Vérifier que la ville a bien été supprimée
      const { data: checkCity, error: checkError } = await supabase
        .from('cities')
        .select('id')
        .eq('id', city.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Ville bien supprimée (PGRST116 = no rows returned)
        toast({
          title: "Ville supprimée",
          description: `La ville "${city.name}" et toutes ses données associées ont été supprimées définitivement.`,
        });
        fetchCities();
      } else if (checkCity) {
        // Ville toujours présente
        console.error('La ville existe encore après suppression:', checkCity);
        toast({
          title: "Erreur de suppression",
          description: `La ville "${city.name}" n'a pas pu être supprimée. Vérifiez les logs pour plus de détails.`,
          variant: "destructive",
        });
      } else {
        // Erreur de vérification
        console.error('Erreur lors de la vérification de suppression:', checkError);
        toast({
          title: "Erreur de vérification",
          description: `Impossible de vérifier si la ville "${city.name}" a été supprimée.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error deleting city:', error);
      
      let errorMessage = "Impossible de supprimer la ville.";
      
      if (error.code === '23503') {
        errorMessage = "Impossible de supprimer la ville car elle est encore référencée par d'autres données. Contactez l'administrateur.";
      } else if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Villes</h2>
          <p className="text-muted-foreground">
            Configurez les destinations disponibles sur la plateforme
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Country Filter */}
          <div className="w-48">
            <Select value={selectedCountryFilter} onValueChange={setSelectedCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name_fr} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profile?.role === 'super_admin' && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setEditingCity(null);
                    form.reset();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle ville
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCity ? 'Modifier la Ville' : 'Créer une Nouvelle Ville'}
                </DialogTitle>
                <DialogDescription>
                  {editingCity ? 'Modifiez les paramètres de cette ville' : 'Ajoutez une nouvelle destination touristique'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations de base */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informations de Base</h3>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la ville</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Lausanne" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (!editingCity) {
                                    form.setValue('slug', generateSlug(e.target.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug URL</FormLabel>
                            <FormControl>
                              <Input placeholder="lausanne" {...field} />
                            </FormControl>
                            <FormDescription>
                              Utilisé dans l'URL (ex: ciara.app/destinations/lausanne)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un pays" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country.id} value={country.id}>
                                    {country.name_fr} ({country.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Décrivez cette destination..."
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
                          name="is_visible_on_homepage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Visible sur la page d'accueil
                                </FormLabel>
                                <FormDescription>
                                  Contrôle l'affichage sur la page d'accueil uniquement. La ville reste toujours visible sur la page /cities selon le pays sélectionné.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                    </div>

                    {/* Localisation et paramètres */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Localisation et Paramètres</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.000001"
                                  placeholder="46.5197"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.000001"
                                  placeholder="6.6323"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primary_color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Couleur primaire</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    type="color" 
                                    className="w-16 h-10 p-0 border-0"
                                    {...field} 
                                  />
                                  <Input 
                                    placeholder="#2563eb"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="secondary_color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Couleur secondaire</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    type="color" 
                                    className="w-16 h-10 p-0 border-0"
                                    {...field} 
                                  />
                                  <Input 
                                    placeholder="#7c3aed"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="default_language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Langue par défaut</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                                <SelectItem value="it">Italiano</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuseau horaire</FormLabel>
                            <FormControl>
                              <Input placeholder="Europe/Zurich" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Images et Branding</h3>
                    
                    <FormField
                      control={form.control}
                      name="hero_image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo de couverture de la ville</FormLabel>
                          <FormControl>
                            <ImageUpload
                              bucket="cities"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Ajoutez une photo de couverture attrayante pour la ville"
                            />
                          </FormControl>
                          <FormDescription>
                            Photo utilisée dans la présentation de la ville sur la homepage et la page /cities
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   </div>

                    {/* Package Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informations Package</h3>
                      
                       <FormField
                         control={form.control}
                         name="subscription_plan"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Plan d'abonnement</FormLabel>
                             <Select 
                               onValueChange={(value) => {
                                 field.onChange(value);
                                 // Auto-set the annual amount based on the plan
                                 const amounts: { [key: string]: number } = { 
                                   starter: 15000, 
                                   professional: 35000, 
                                   enterprise: 65000 
                                 };
                                 form.setValue('annual_amount_chf', amounts[value] || 15000);
                               }} 
                               value={field.value}
                             >
                               <FormControl>
                                 <SelectTrigger>
                                   <SelectValue />
                                 </SelectTrigger>
                               </FormControl>
                               <SelectContent>
                                 <SelectItem value="starter">Starter</SelectItem>
                                 <SelectItem value="professional">Professional</SelectItem>
                                 <SelectItem value="enterprise">Enterprise</SelectItem>
                               </SelectContent>
                             </Select>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="annual_amount_chf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant annuel (CHF)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="15000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billing_period"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Période de facturation</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="annual">Annuel</SelectItem>
                                  <SelectItem value="monthly">Mensuel</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contract_start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de début du contrat</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contract_end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de fin du contrat</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="auto_renewal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Renouvellement automatique
                              </FormLabel>
                              <FormDescription>
                                Le contrat sera automatiquement renouvelé à échéance
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <h4 className="text-md font-medium">Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="contact_person_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du contact</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Jean Dupont"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contact_person_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email du contact</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="jean.dupont@ville.ch"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contact_person_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone du contact</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="+41 21 XXX XX XX"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                     </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingCity ? 'Modifier' : 'Créer'} la Ville
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Liste des villes */}
      <div className="space-y-4">
        {cities.map((city, index) => (
          <Card key={city.id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>

                  <div>
                    <CardTitle className="text-lg">{city.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getCountryName(city)}</p>
                  </div>
                </div>
                {profile?.role === 'super_admin' && (
                  <div className="flex items-center gap-4">
                    {/* Switch Site Web Actif/Inactif */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {city.is_active !== false ? 'Site Web' : 'Masqué'}
                      </span>
                      <Switch
                        checked={city.is_active !== false}
                        onCheckedChange={(checked) => {
                          handleActiveToggle(city, checked);
                        }}
                      />
                    </div>
                    
                    {/* Switch Archivé/Actif */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {!city.is_archived ? 'Admin' : 'Archivé'}
                      </span>
                      <Switch
                        checked={!city.is_archived}
                        onCheckedChange={(checked) => {
                          handleArchiveToggle(city, !checked);
                        }}
                      />
                    </div>
                    
                    {/* Bouton Edit */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(city)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Bouton Suppression */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCity(city)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Informations du Package */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Package</h4>
                  <div className="space-y-1">
                    <Badge className={getSubscriptionPlanColor(city.package?.package_type || city.subscription_plan || 'starter')}>
                      {getPackageName(city.package?.package_type || city.subscription_plan || 'starter')}
                    </Badge>
                    {city.package && (
                      <>
                        <p className="text-sm font-semibold">{city.package.annual_amount_chf.toLocaleString()} CHF</p>
                        <p className="text-xs text-muted-foreground">
                          {city.package.billing_period === 'annual' ? 'Annuel' : 'Mensuel'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Visibilité et Archivage */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Visibilité</h4>
                  
                  {/* Visibilité page d'accueil */}
                  <div className="flex items-center space-x-2">
                    {city.is_visible_on_homepage ? (
                      <>
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">Masqué</span>
                      </>
                    )}
                  </div>

                </div>

                {/* Dates de contrat */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Contrat</h4>
                  {city.package && (
                    <div className="space-y-1">
                      {city.package.contract_start_date && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Début:</span>{' '}
                          {new Date(city.package.contract_start_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {city.package.contract_end_date && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Fin:</span>{' '}
                          {new Date(city.package.contract_end_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {!city.package.contract_start_date && !city.package.contract_end_date && (
                        <p className="text-xs text-muted-foreground">Non défini</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Informations techniques */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Technique</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {city.primary_color && (
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: city.primary_color }}
                          />
                        )}
                        {city.secondary_color && (
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: city.secondary_color }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>{city.default_language || 'fr'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cities.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune ville configurée</h3>
            <p className="text-muted-foreground">
              Commencez par ajouter votre première destination touristique.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CityManagement;
