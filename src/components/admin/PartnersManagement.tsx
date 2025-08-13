import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  is_active: boolean;
  city_id: string;
  city?: {
    name: string;
    country_id: string;
    countries?: {
      name_fr: string;
    };
  };
}

interface City {
  id: string;
  name: string;
  country_id: string;
  countries?: {
    name_fr?: string;
    is_active?: boolean;
  };
}

interface Country {
  id: string;
  name_fr: string;
}

const partnerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  logo_url: z.string().optional(),
  city_id: z.string().uuid('ID de ville invalide'),
  is_active: z.boolean(),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

const PartnersManagement = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    logo_url: '',
    city_id: '',
    is_active: true
  });

  const isSuperAdmin = () => profile?.role === 'super_admin';
  const isTenantAdmin = () => profile?.role === 'tenant_admin';

  useEffect(() => {
    fetchData();
  }, [selectedCountry, selectedCity]);

  // Pour les Admin Ville, sélectionner automatiquement leur ville assignée
  useEffect(() => {
    if (isTenantAdmin() && cities.length > 0 && !formData.city_id) {
      setFormData(prev => ({ ...prev, city_id: cities[0].id }));
    }
  }, [cities, isTenantAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPartners(),
        fetchCountries(),
        fetchCities()
      ]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    let query = supabase
      .from('partners')
      .select(`
        *,
        city:cities (
          name,
          country_id,
          countries (
            name_fr
          )
        )
      `)
      .order('name');

    if (isTenantAdmin() && profile?.city_id) {
      query = query.eq('city_id', profile.city_id);
    }

    if (selectedCountry !== 'all') {
      query = query.eq('cities.country_id', selectedCountry);
    }
    
    if (selectedCity !== 'all') {
      query = query.eq('city_id', selectedCity);
    }

    const { data, error } = await query;
    if (error) throw error;
    setPartners(data || []);
  };

  const fetchCountries = async () => {
    if (isTenantAdmin() && profile?.city_id) {
      const { data: cityData } = await supabase
        .from('cities')
        .select('country_id, countries(name_fr)')
        .eq('id', profile.city_id)
        .single();
      
      if (cityData?.countries) {
        setCountries([{ id: cityData.country_id, name_fr: cityData.countries.name_fr }]);
      }
    } else {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name_fr')
        .eq('is_active', true)
        .order('name_fr');
      
      if (error) throw error;
      setCountries(data || []);
    }
  };

  const fetchCities = async () => {
    if (isTenantAdmin() && profile?.city_id) {
      const { data: cityData } = await supabase
        .from('cities')
        .select(`
          id, 
          name, 
          country_id,
          countries!inner (
            is_active
          )
        `)
        .eq('id', profile.city_id)
        .eq('is_archived', false)
        .single();
      
      if (cityData) {
        setCities([cityData]);
        // Pour les Admin Ville, définir automatiquement la ville sélectionnée
        setSelectedCity(cityData.id);
      }
    } else {
      let query = supabase
        .from('cities')
        .select(`
          id, 
          name, 
          country_id,
          countries!inner (
            is_active
          )
        `)
        .eq('is_archived', false)
        .eq('countries.is_active', true)
        .order('name');
      
      if (selectedCountry !== 'all') {
        query = query.eq('country_id', selectedCountry);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setCities(data || []);
    }
  };

  const handleCreatePartner = async () => {
    try {
      const { error } = await supabase
        .from('partners')
        .insert([{
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Partenaire créé avec succès",
      });

      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le partenaire",
        variant: "destructive",
      });
    }
  };

  const handleEditPartner = async () => {
    if (!editingPartner) return;

    try {
      const { error } = await supabase
        .from('partners')
        .update({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPartner.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Partenaire modifié avec succès",
      });

      setShowEditModal(false);
      setEditingPartner(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le partenaire",
        variant: "destructive",
      });
    }
  };

  const handleDeletePartner = async (partnerId: string, partnerName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${partnerName}" ?`)) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Partenaire supprimé avec succès",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le partenaire",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      category: partner.category,
      description: partner.description || '',
      address: partner.address || '',
      phone: partner.phone || '',
      email: partner.email || '',
      website: partner.website || '',
      latitude: partner.latitude?.toString() || '',
      longitude: partner.longitude?.toString() || '',
      logo_url: partner.logo_url || '',
      city_id: partner.city_id,
      is_active: partner.is_active
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      latitude: '',
      longitude: '',
      logo_url: '',
      city_id: isTenantAdmin() && cities.length > 0 ? cities[0].id : '',
      is_active: true
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'restaurant': 'Restaurant',
      'hotel': 'Hôtel',
      'shop': 'Boutique',
      'cafe': 'Café',
      'activity': 'Activité',
      'transport': 'Transport',
      'museum': 'Musée',
      'landmark': 'Monument'
    };
    return categories[category as keyof typeof categories] || category;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres et bouton de création */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Partenaires</h2>
          <p className="text-muted-foreground">
            Créer, modifier et gérer les partenaires de la plateforme
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filtres */}
          {isSuperAdmin() && (
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name_fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isSuperAdmin() ? (
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-40 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md border">
              {cities.length > 0 ? cities[0].name : 'Ville assignée'}
            </div>
          )}

          {/* Bouton de création */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Partenaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau partenaire</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du partenaire *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Restaurant Le Gourmet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="hotel">Hôtel</SelectItem>
                      <SelectItem value="shop">Boutique</SelectItem>
                      <SelectItem value="cafe">Café</SelectItem>
                      <SelectItem value="activity">Activité</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="museum">Musée</SelectItem>
                      <SelectItem value="landmark">Monument</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  {isSuperAdmin() ? (
                    <Select value={formData.city_id} onValueChange={(value) => setFormData({...formData, city_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md border">
                      {cities.length > 0 ? cities[0].name : 'Ville assignée'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@partenaire.ch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+41 21 123 45 67"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://www.partenaire.ch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="46.5167"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="6.6333"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL du logo</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    placeholder="https://example.com/logo.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active">Statut</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="active">{formData.is_active ? 'Actif' : 'Inactif'}</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Rue du Commerce 1, 1000 Ville"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description détaillée du partenaire..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreatePartner} disabled={!formData.name || !formData.category || !formData.city_id}>
                  Créer le partenaire
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tableau des partenaires */}
      <Card>
        <CardHeader>
          <CardTitle>Partenaires ({partners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des partenaires...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            {partner.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {partner.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(partner.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{partner.city?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {partner.email && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{partner.email}</span>
                            </div>
                          )}
                          {partner.phone && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{partner.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={partner.is_active ? "default" : "secondary"}>
                          {partner.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePartner(partner.id, partner.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'édition */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le partenaire</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du partenaire *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Restaurant Le Gourmet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hôtel</SelectItem>
                  <SelectItem value="shop">Boutique</SelectItem>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="activity">Activité</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="museum">Musée</SelectItem>
                  <SelectItem value="landmark">Monument</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-city">Ville *</Label>
              <Select value={formData.city_id} onValueChange={(value) => setFormData({...formData, city_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@partenaire.ch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+41 21 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Site web</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://www.partenaire.ch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-latitude">Latitude</Label>
              <Input
                id="edit-latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                placeholder="46.5167"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-longitude">Longitude</Label>
              <Input
                id="edit-longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                placeholder="6.6333"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-logo_url">URL du logo</Label>
              <Input
                id="edit-logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                placeholder="https://example.com/logo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-active">Statut</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="edit-active">{formData.is_active ? 'Actif' : 'Inactif'}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Adresse</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Rue du Commerce 1, 1000 Ville"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description détaillée du partenaire..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPartner} disabled={!formData.name || !formData.category || !formData.city_id}>
              Modifier le partenaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManagement; 