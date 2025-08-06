
import React, { useState, useEffect } from 'react';
import CountryFilters from '@/components/admin/CountryFilters';
import { useOptimizedTranslations } from '@/hooks/useOptimizedTranslations';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import JourneyCreator from './JourneyCreator';
import StepsManagement from './StepsManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit,
  Power,
  PowerOff,
  Trash2,
  MapPin,
  Clock,
  Trophy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Journey {
  id: string;
  name: string;
  description?: string;
  category?: any;
  city?: any;
  difficulty: string;
  estimated_duration?: number;
  distance_km?: number;
  total_points?: number;
  is_active: boolean;
  updated_at: string;
  journey_steps?: any[];
}

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  country_id: string;
}

interface ContentManagementProps {
  cityId?: string;
}

const ContentManagement = ({ cityId }: ContentManagementProps) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [stepsManagementOpen, setStepsManagementOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [cityId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchJourneys(),
        fetchCountries(),
        fetchCities()
      ]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneys = async () => {
    try {
      let query = supabase
        .from('journeys')
        .select(`
          *,
          category:journey_categories(name),
          city:cities(name, country_id, countries(name_fr)),
          journey_steps(
            step_order,
            steps(
              id,
              name,
              description,
              latitude,
              longitude,
              points_awarded,
              validation_radius,
              has_quiz,
              images,
              address,
              type
            )
          )
        `);

      // Filter by city if tenant admin
      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

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

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name_fr');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
    }
  };

  const handleJourneyCreated = () => {
    fetchJourneys();
    setCreateDialogOpen(false);
    setEditingJourney(null);
  };

  const handleEditJourney = (journey: Journey) => {
    setEditingJourney(journey);
    setCreateDialogOpen(true);
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce parcours ?')) return;

    try {
      const { error } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId);

      if (error) throw error;

      toast({
        title: "Parcours supprimé",
        description: "Le parcours a été supprimé avec succès",
      });

      fetchJourneys();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le parcours",
        variant: "destructive",
      });
    }
  };

  const handleToggleActiveStatus = async (journey: Journey) => {
    try {
      const { error } = await supabase
        .from('journeys')
        .update({ is_active: !journey.is_active })
        .eq('id', journey.id);

      if (error) throw error;

      toast({
        title: journey.is_active ? "Parcours désactivé" : "Parcours activé",
        description: `Le parcours a été ${journey.is_active ? 'désactivé' : 'activé'} avec succès`,
      });

      fetchJourneys();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du parcours",
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setSelectedCity('all');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Actif' : 'Inactif';
  };

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (journey.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = selectedCountry === 'all' || 
                          (journey.city?.countries?.name_fr === countries.find(c => c.id === selectedCountry)?.name_fr);
    
    const matchesCity = selectedCity === 'all' || journey.city?.name === cities.find(c => c.id === selectedCity)?.name;
    
    return matchesSearch && matchesCountry && matchesCity;
  });

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion du Contenu</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos parcours touristiques
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={stepsManagementOpen} onOpenChange={setStepsManagementOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <MapPin className="h-4 w-4" />
                Gérer les étapes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gestion des Étapes</DialogTitle>
              </DialogHeader>
              <StepsManagement cityId={cityId} />
            </DialogContent>
          </Dialog>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2" 
                onClick={() => setEditingJourney(null)}
                data-testid="new-journey-button"
              >
                <Plus className="h-4 w-4" />
                Nouveau parcours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingJourney ? 'Modifier le Parcours' : 'Créer un Nouveau Parcours'}
                </DialogTitle>
              </DialogHeader>
              <JourneyCreator
                editingJourney={editingJourney}
                onJourneyCreated={handleJourneyCreated}
                onClose={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parcours actifs</p>
                <p className="text-2xl font-bold">
                  {journeys.filter(j => j.is_active).length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold">
                  {journeys.filter(j => !j.is_active).length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Étapes total</p>
                <p className="text-2xl font-bold">
                  {journeys.reduce((sum, j) => sum + (j.journey_steps?.length || 0), 0)}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points total</p>
                <p className="text-2xl font-bold">
                  {journeys.reduce((sum, j) => sum + (j.total_points || 0), 0).toLocaleString()}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres - Masqués pour les admin villes */}
      {profile?.role !== 'tenant_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <CountryFilters
              countries={countries}
              cities={cities}
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              searchTerm={searchTerm}
              onCountryChange={setSelectedCountry}
              onCityChange={setSelectedCity}
              onSearchChange={setSearchTerm}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Table des parcours */}
      <Card>
        <CardHeader>
          <CardTitle>Parcours ({filteredJourneys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcours</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Étapes</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Modifié le</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJourneys.map((journey) => (
                <TableRow key={journey.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{journey.name}</div>
                      <div className="text-sm text-muted-foreground">{journey.category?.name || 'Non catégorisé'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{journey.city?.name || 'Non défini'}</TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(journey.difficulty)}>
                      {getDifficultyLabel(journey.difficulty)}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {journey.estimated_duration ? `${journey.estimated_duration}min` : 'Non définie'}
                  </TableCell>
                  <TableCell>{journey.journey_steps?.length || 0}</TableCell>
                  <TableCell className="font-medium">{journey.total_points || 0}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(journey.is_active)}>
                      {getStatusLabel(journey.is_active)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(journey.updated_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="12" cy="5" r="1"/>
                            <circle cx="12" cy="19" r="1"/>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleToggleActiveStatus(journey)}>
                          {journey.is_active ? (
                            <>
                              <PowerOff className="mr-2 h-4 w-4" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditJourney(journey)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteJourney(journey.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement;
