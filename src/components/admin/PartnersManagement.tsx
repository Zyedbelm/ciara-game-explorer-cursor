import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useCityOptional } from '@/contexts/CityContext';
import { useCountry } from '@/contexts/CountryContext';
import CountryFilters from '@/components/admin/CountryFilters';
import { useOptimizedTranslations } from '@/hooks/useOptimizedTranslations';
import { 
  Building2, 
  Plus, 
  Edit, 
  Archive,
  Mail,
  Phone,
  MapPin,
  Globe,
  Store,
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  category: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  city_id: string;
  created_at: string;
  updated_at: string;
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
  slug: string;
  country_id: string;
}

interface PartnerFormData {
  name: string;
  category: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  city_id: string;
}

const PARTNER_CATEGORIES = [
  'Restaurant',
  'Hôtel',
  'Commerce',
  'Activité',
  'Transport',
  'Culture',
  'Service'
];

interface PartnersManagementProps {
  cityId?: string;
}

const PartnersManagement: React.FC<PartnersManagementProps> = ({ cityId }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    category: 'Restaurant',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    latitude: '',
    longitude: '',
    is_active: true,
    city_id: ''
  });

  const { toast } = useToast();
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { city } = useCityOptional();
  const { sendPartnerWelcomeEmail } = useEmailNotifications();
  const { currentLanguage } = useOptimizedTranslations();

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      console.warn('Error fetching countries:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, country_id')
        .order('name', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
      console.warn('Error fetching cities:', err);
    }
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('partners')
        .select(`
          *,
          cities:city_id(id, name, country_id)
        `)
        .order('name', { ascending: true });

      // For tenant admins, filter by their city
      if (isTenantAdmin() && profile?.city_id) {
        query = query.eq('city_id', profile.city_id);
      }
      // For super admins with cityId prop, filter by that city
      else if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPartners(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: city_id is required
    if (!formData.city_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une ville',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Handle geocoding if address is provided but no coordinates
      let partnerData: any = {
        ...formData
      };

      // Convert latitude/longitude strings to numbers if provided
      if (formData.latitude && formData.longitude) {
        partnerData.latitude = parseFloat(formData.latitude);
        partnerData.longitude = parseFloat(formData.longitude);
      } else if (formData.address && !formData.latitude && !formData.longitude) {
        // Geocode the address
        try {
          const { data: geocodeResult, error: geocodeError } = await supabase.functions.invoke('geocode-address', {
            body: { address: formData.address }
          });

          if (geocodeError) throw geocodeError;

          if (geocodeResult?.latitude && geocodeResult?.longitude) {
            partnerData.latitude = geocodeResult.latitude;
            partnerData.longitude = geocodeResult.longitude;
            toast({
              title: 'Succès',
              description: 'Adresse géocodée automatiquement',
            });
          }
        } catch (geocodeError) {
          console.warn('Geocoding failed:', geocodeError);
          toast({
            title: 'Attention',
            description: 'Impossible de géocoder l\'adresse automatiquement. Le partenaire sera créé sans coordonnées GPS.',
            variant: 'destructive',
          });
        }
      }

      // Remove string latitude/longitude from form data
      delete partnerData.latitude;
      delete partnerData.longitude;
      
      // Add parsed coordinates if available
      if (formData.latitude && formData.longitude) {
        partnerData.latitude = parseFloat(formData.latitude);
        partnerData.longitude = parseFloat(formData.longitude);
      }

      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', editingPartner.id);

        if (error) throw error;

        setPartners(partners.map(p => 
          p.id === editingPartner.id 
            ? { ...p, ...partnerData }
            : p
        ));

        toast({
          title: 'Succès',
          description: 'Partenaire mis à jour',
        });
      } else {
        const { data, error } = await supabase
          .from('partners')
          .insert([partnerData])
          .select()
          .single();

        if (error) throw error;

        setPartners([...partners, data]);
        
        // Send welcome email to new partner if email exists
        if (data.email) {
          try {
            const { data: cityData } = await supabase
              .from('cities')
              .select('name')
              .eq('id', data.city_id)
              .single();
              
            await sendPartnerWelcomeEmail({
              partnerName: data.name,
              partnerEmail: data.email,
              cityName: cityData?.name || 'votre ville',
              contactEmail: profile?.email,
              contactName: profile?.full_name
            });
            
            toast({
              title: 'Succès',
              description: 'Partenaire créé et email de bienvenue envoyé',
            });
          } catch (emailError) {
            console.warn('Failed to send welcome email:', emailError);
            toast({
              title: 'Succès',
              description: 'Partenaire créé (email de bienvenue non envoyé)',
            });
          }
        } else {
          toast({
            title: 'Succès',
            description: 'Partenaire créé',
          });
        }
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    const defaultCityId = isTenantAdmin() ? profile?.city_id || '' : '';
    setFormData({
      name: '',
      category: 'Restaurant',
      description: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      latitude: '',
      longitude: '',
      is_active: true,
      city_id: defaultCityId
    });
    setEditingPartner(null);
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      category: partner.category,
      description: partner.description || '',
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      website: partner.website || '',
      latitude: partner.latitude?.toString() || '',
      longitude: partner.longitude?.toString() || '',
      is_active: partner.is_active,
      city_id: partner.city_id
    });
    setEditingPartner(partner);
    setDialogOpen(true);
  };

  const togglePartnerStatus = async (partnerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: isActive })
        .eq('id', partnerId);

      if (error) throw error;

      setPartners(partners.map(partner => 
        partner.id === partnerId 
          ? { ...partner, is_active: isActive }
          : partner
      ));

      toast({
        title: 'Succès',
        description: `Partenaire ${isActive ? 'activé' : 'archivé'}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!editingPartner) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', editingPartner.id);

      if (error) throw error;

      setPartners(partners.filter(partner => partner.id !== editingPartner.id));

      toast({
        title: 'Succès',
        description: 'Partenaire supprimé',
      });

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de suppression';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleNewPartner = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || 'Ville inconnue';
  };

  // Initialize filters for tenant admins
  useEffect(() => {
    if (isTenantAdmin() && profile?.city_id && cities.length > 0) {
      const userCity = cities.find(c => c.id === profile.city_id);
      if (userCity) {
        setSelectedCountry(userCity.country_id);
        setSelectedCity(userCity.id);
      }
    }
  }, [isTenantAdmin, profile?.city_id, cities]);

  // Filter partners based on selections
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchTerm || 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const partnerCity = cities.find(c => c.id === partner.city_id);
    const matchesCountry = selectedCountry === 'all' || 
      (partnerCity && partnerCity.country_id === selectedCountry);
    
    const matchesCity = selectedCity === 'all' || partner.city_id === selectedCity;

    return matchesSearch && matchesCountry && matchesCity;
  });

  const handleClearFilters = () => {
    if (!isTenantAdmin()) {
      setSelectedCountry('all');
      setSelectedCity('all');
    }
    setSearchTerm('');
  };

  useEffect(() => {
    fetchPartners();
    fetchCities();
    fetchCountries();
  }, [cityId, profile?.city_id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestion des Partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Gestion des Partenaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activePartners = filteredPartners.filter(p => p.is_active);
  const archivedPartners = filteredPartners.filter(p => !p.is_active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gestion des Partenaires
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchPartners}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleNewPartner}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Partenaire
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* City Selection Field */}
                    <div>
                      <Label htmlFor="city_id">Ville *</Label>
                      {isSuperAdmin() ? (
                        <Select
                          value={formData.city_id}
                          onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une ville" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={getCityName(formData.city_id)}
                          disabled
                          className="bg-gray-100"
                        />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {isSuperAdmin() 
                          ? "Sélectionnez la ville d'association du partenaire"
                          : "Ville assignée à votre compte admin"
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Catégorie *</Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          {PARTNER_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Adresse complète pour localisation GPS"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        L'adresse est requise pour la localisation sur Google Maps
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    {/* GPS Coordinates Section */}
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium mb-2 block">Coordonnées GPS (optionnel)</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Si vous connaissez les coordonnées GPS exactes, vous pouvez les saisir. Sinon, l'adresse sera géocodée automatiquement.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            placeholder="46.5197"
                            type="number"
                            step="any"
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            placeholder="6.6323"
                            type="number"
                            step="any"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Actif</Label>
                    </div>

                    <div className="flex justify-between">
                      {editingPartner && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={handleDelete}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      )}
                      
                      <div className="flex gap-2 ml-auto">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          {editingPartner ? 'Mettre à jour' : 'Créer'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Country and City Filters */}
          <CountryFilters
            countries={countries}
            cities={cities}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            searchTerm={searchTerm}
            onCountryChange={isTenantAdmin() ? () => {} : setSelectedCountry}
            onCityChange={isTenantAdmin() ? () => {} : setSelectedCity}
            onSearchChange={setSearchTerm}
            onClearFilters={handleClearFilters}
            language={currentLanguage}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activePartners.length}</div>
              <div className="text-sm text-green-600">Partenaires actifs</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{archivedPartners.length}</div>
              <div className="text-sm text-gray-600">Partenaires archivés</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{partners.length}</div>
              <div className="text-sm text-blue-600">Total partenaires</div>
            </div>
          </div>

          {/* Active Partners */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-green-500" />
              Partenaires Actifs ({activePartners.length})
            </h3>
            
            {activePartners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun partenaire actif
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePartners.map((partner) => (
                  <Card key={partner.id} className="border-green-200">
                    <CardContent className="p-3">
                      {/* Titre sur la première ligne */}
                      <div className="mb-2">
                        <h4 className="font-medium text-sm">{partner.name}</h4>
                      </div>
                      
                      {/* Boutons sur la deuxième ligne */}
                      <div className="flex items-center justify-end gap-1 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(partner)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Switch
                          checked={partner.is_active}
                          onCheckedChange={(checked) => togglePartnerStatus(partner.id, checked)}
                          className="scale-75"
                        />
                      </div>
                      
                      {/* Badge sur la troisième ligne */}
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {partner.category}
                        </Badge>
                      </div>
                      
                      {partner.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {partner.description}
                        </p>
                      )}
                      
                      <div className="space-y-1">
                        {partner.email && (
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{partner.email}</span>
                          </div>
                        )}
                        {partner.phone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{partner.phone}</span>
                          </div>
                        )}
                        {partner.address && (
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{partner.address}</span>
                          </div>
                        )}
                        {partner.website && (
                          <div className="flex items-center gap-1 text-xs">
                            <Globe className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{partner.website}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Archived Partners */}
          {archivedPartners.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Archive className="h-5 w-5 text-gray-500" />
                Partenaires Archivés ({archivedPartners.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {archivedPartners.map((partner) => (
                  <Card key={partner.id} className="border-gray-200 opacity-60">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm truncate">{partner.name}</h4>
                        <Switch
                          checked={partner.is_active}
                          onCheckedChange={(checked) => togglePartnerStatus(partner.id, checked)}
                        />
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {partner.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnersManagement;
