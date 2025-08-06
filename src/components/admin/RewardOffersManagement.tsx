import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useCityOptional } from '@/contexts/CityContext';
import CountryFilters from '@/components/admin/CountryFilters';
import { useOptimizedTranslations } from '@/hooks/useOptimizedTranslations';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trophy,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Building2,
  Trash2
} from 'lucide-react';

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

interface Partner {
  id: string;
  name: string;
  category: string;
  email?: string;
  city_id: string;
}

interface Reward {
  id: string;
  partner_id: string;
  type: string;
  title: string;
  description?: string;
  points_required: number;
  value_chf?: number;
  max_redemptions?: number;
  max_redemptions_per_user?: number;
  validity_days?: number;
  terms_conditions?: string;
  is_active: boolean;
  image_url?: string;
  language: string;
  title_en?: string;
  title_de?: string;
  description_en?: string;
  description_de?: string;
  created_at: string;
  updated_at: string;
  partner?: Partner;
}

interface RewardFormData {
  partner_id: string;
  type: string;
  title: string;
  description: string;
  points_required: number;
  value_chf: number;
  max_redemptions: number;
  max_redemptions_per_user: number;
  terms_conditions: string;
  is_active: boolean;
  title_en: string;
  title_de: string;
  description_en: string;
  description_de: string;
}

const REWARD_TYPES = [
  'Réduction',
  'Produit gratuit',
  'Surclassement',
  'Service gratuit',
  'Accès VIP',
  'Cadeau',
  'Expérience'
];

interface RewardOffersManagementProps {
  cityId?: string;
}

const RewardOffersManagement: React.FC<RewardOffersManagementProps> = ({ cityId }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  
  // Filter states
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<RewardFormData>({
    partner_id: '',
    type: 'Réduction',
    title: '',
    description: '',
    points_required: 100,
    value_chf: 5,
    max_redemptions: 100,
    max_redemptions_per_user: 5,
    terms_conditions: '',
    is_active: true,
    title_en: '',
    title_de: '',
    description_en: '',
    description_de: ''
  });

  const { toast } = useToast();
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, isTenantAdmin, isPartner, signOut } = useAuth();
  const { city } = useCityOptional();
  const { sendPartnerOfferNotificationEmail } = useEmailNotifications();
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
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, country_id')
        .order('name', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch partners first
      let partnersQuery = supabase
        .from('partners')
        .select('id, name, category, email, city_id')
        .eq('is_active', true)
        .order('name', { ascending: true });

      // For tenant admins, filter by their city
      if (isTenantAdmin() && profile?.city_id) {
        partnersQuery = partnersQuery.eq('city_id', profile.city_id);
      }
      // For partners, filter by their own partner ID
      else if (isPartner() && profile?.partner_id) {
        partnersQuery = partnersQuery.eq('id', profile.partner_id);
      }
      // For super admins with cityId prop, filter by that city
      else if (cityId) {
        partnersQuery = partnersQuery.eq('city_id', cityId);
      }

      const { data: partnersData, error: partnersError } = await partnersQuery;
      if (partnersError) throw partnersError;

      setPartners(partnersData || []);

      // Fetch rewards with partner information
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select(`
          *,
          partner:partners(id, name, category, email, city_id)
        `)
        .order('created_at', { ascending: false });

      if (rewardsError) throw rewardsError;

      // Filter rewards by city - only keep rewards from partners in the allowed city
      let filteredRewards = rewardsData || [];
      if (isTenantAdmin() && profile?.city_id) {
        filteredRewards = filteredRewards.filter(reward => 
          partnersData?.some(partner => partner.id === reward.partner_id)
        );
      } else if (isPartner() && profile?.partner_id) {
        filteredRewards = filteredRewards.filter(reward => 
          reward.partner_id === profile.partner_id
        );
      } else if (cityId) {
        filteredRewards = filteredRewards.filter(reward => 
          partnersData?.some(partner => partner.id === reward.partner_id)
        );
      }

      setRewards(filteredRewards);
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
    
    if (!formData.partner_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un partenaire',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rewardData = {
        ...formData,
        value_chf: formData.value_chf || null,
        max_redemptions: formData.max_redemptions || null
      };

      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update(rewardData)
          .eq('id', editingReward.id);

        if (error) throw error;

        setRewards(rewards.map(r => 
          r.id === editingReward.id 
            ? { ...r, ...rewardData }
            : r
        ));

        toast({
          title: 'Succès',
          description: 'Récompense mise à jour',
        });
      } else {
        const { data, error } = await supabase
          .from('rewards')
          .insert([rewardData])
          .select(`
            *,
            partner:partners(id, name, category, email, city_id)
          `)
          .single();

        if (error) throw error;

        setRewards([data, ...rewards]);
        
        // Send notification email to partner if email exists
        if (data.partner_id && partners.find(p => p.id === data.partner_id)?.email) {
          try {
            const partner = partners.find(p => p.id === data.partner_id);
            const { data: cityData } = await supabase
              .from('cities')
              .select('name')
              .eq('id', profile?.city_id)
              .single();
              
            await sendPartnerOfferNotificationEmail({
              partnerName: partner!.name,
              partnerEmail: partner!.email,
              offerTitle: data.title,
              offerDescription: data.description || '',
              pointsRequired: data.points_required,
              validityDays: data.validity_days || 30,
              maxRedemptions: data.max_redemptions,
              cityName: cityData?.name || 'votre ville',
              createdBy: profile?.full_name || profile?.email
            });
            
            toast({
              title: 'Succès',
              description: 'Récompense créée et partenaire notifié',
            });
          } catch (emailError) {
            toast({
              title: 'Attention',
              description: 'Récompense créée mais notification partenaire non envoyée',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Succès',
            description: 'Récompense créée',
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
    setFormData({
      partner_id: '',
      type: 'Réduction',
      title: '',
      description: '',
      points_required: 100,
      value_chf: 5,
      max_redemptions: 100,
      max_redemptions_per_user: 5,
      terms_conditions: '',
      is_active: true,
      title_en: '',
      title_de: '',
      description_en: '',
      description_de: ''
    });
    setEditingReward(null);
  };

  const handleEdit = (reward: Reward) => {
    setFormData({
      partner_id: reward.partner_id,
      type: reward.type,
      title: reward.title,
      description: reward.description || '',
      points_required: reward.points_required,
      value_chf: reward.value_chf || 0,
      max_redemptions: reward.max_redemptions || 100,
      max_redemptions_per_user: (reward as any).max_redemptions_per_user || 5,
      terms_conditions: reward.terms_conditions || '',
      is_active: reward.is_active,
      title_en: reward.title_en || '',
      title_de: reward.title_de || '',
      description_en: reward.description_en || '',
      description_de: reward.description_de || ''
    });
    setEditingReward(reward);
    setDialogOpen(true);
  };

  const toggleRewardStatus = async (rewardId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: isActive })
        .eq('id', rewardId);

      if (error) throw error;

      setRewards(rewards.map(reward => 
        reward.id === rewardId 
          ? { ...reward, is_active: isActive }
          : reward
      ));

      toast({
        title: 'Succès',
        description: `Récompense ${isActive ? 'activée' : 'désactivée'}`,
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
    if (!editingReward) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', editingReward.id);

      if (error) throw error;

      setRewards(rewards.filter(reward => reward.id !== editingReward.id));

      toast({
        title: 'Succès',
        description: 'Récompense supprimée',
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

  // Filter rewards based on selections
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = !searchTerm || 
      reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.partner?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const rewardPartner = partners.find(p => p.id === reward.partner_id);
    const partnerCity = cities.find(c => c.id === rewardPartner?.city_id);
    const matchesCountry = selectedCountry === 'all' || 
      (partnerCity && partnerCity.country_id === selectedCountry);
    
    const matchesCity = selectedCity === 'all' || 
      (rewardPartner && rewardPartner.city_id === selectedCity);

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
    fetchData();
    fetchCities();
    fetchCountries();
  }, [cityId, profile?.city_id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gestion des Offres de Récompenses
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
            <Gift className="h-5 w-5" />
            Gestion des Offres de Récompenses
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

  const activeRewards = filteredRewards.filter(r => r.is_active);
  const inactiveRewards = filteredRewards.filter(r => !r.is_active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Gestion des Offres de Récompenses
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={partners.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Offre
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReward ? 'Modifier l\'offre' : 'Nouvelle offre de récompense'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partner_id">Partenaire *</Label>
                        <select
                          id="partner_id"
                          value={formData.partner_id}
                          onChange={(e) => setFormData({ ...formData, partner_id: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Sélectionner un partenaire</option>
                          {partners.map(partner => (
                            <option key={partner.id} value={partner.id}>
                              {partner.name} ({partner.category})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="type">Type *</Label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          {REWARD_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="points_required">Points requis *</Label>
                        <Input
                          id="points_required"
                          type="number"
                          min="1"
                          value={formData.points_required}
                          onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="value_chf">Valeur CHF</Label>
                        <Input
                          id="value_chf"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.value_chf}
                          onChange={(e) => setFormData({ ...formData, value_chf: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max_redemptions">
                          Limite globale 
                          <span className="text-xs text-muted-foreground ml-1">(total échanges)</span>
                        </Label>
                        <Input
                          id="max_redemptions"
                          type="number"
                          min="1"
                          value={formData.max_redemptions}
                          onChange={(e) => setFormData({ ...formData, max_redemptions: parseInt(e.target.value) || 0 })}
                          placeholder="Ex: 100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_redemptions_per_user">
                          Limite par utilisateur 
                          <span className="text-xs text-muted-foreground ml-1">(par personne)</span>
                        </Label>
                        <Input
                          id="max_redemptions_per_user"
                          type="number"
                          min="1"
                          value={formData.max_redemptions_per_user}
                          onChange={(e) => setFormData({ ...formData, max_redemptions_per_user: parseInt(e.target.value) || 0 })}
                          placeholder="Ex: 5"
                        />
                      </div>
                    </div>

                    {/* French */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Français</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Titre *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* English */}
                    <div className="space-y-2">
                      <h4 className="font-medium">English</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title_en">Title</Label>
                          <Input
                            id="title_en"
                            value={formData.title_en}
                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description_en">Description</Label>
                          <Textarea
                            id="description_en"
                            value={formData.description_en}
                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    {/* German */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Deutsch</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title_de">Titel</Label>
                          <Input
                            id="title_de"
                            value={formData.title_de}
                            onChange={(e) => setFormData({ ...formData, title_de: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description_de">Beschreibung</Label>
                          <Textarea
                            id="description_de"
                            value={formData.description_de}
                            onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="terms_conditions">Conditions générales</Label>
                      <Textarea
                        id="terms_conditions"
                        value={formData.terms_conditions}
                        onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                        rows={3}
                        placeholder="Conditions d'utilisation de cette récompense..."
                      />
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
                      {editingReward && (
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
                          {editingReward ? 'Mettre à jour' : 'Créer'}
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

          {partners.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun partenaire actif trouvé.</p>
              <p className="text-sm">Créez d'abord des partenaires pour pouvoir ajouter des offres.</p>
            </div>
          )}

          {partners.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{activeRewards.length}</div>
                  <div className="text-sm text-green-600">Offres actives</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{inactiveRewards.length}</div>
                  <div className="text-sm text-gray-600">Offres désactivées</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{rewards.length}</div>
                  <div className="text-sm text-blue-600">Total offres</div>
                </div>
              </div>

              {/* Active Rewards */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  Offres Actives ({activeRewards.length})
                </h3>
                
                {activeRewards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune offre active
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeRewards.map((reward) => (
                      <Card key={reward.id} className="border-green-200">
                        <CardContent className="p-3">
                          {/* Titre sur la première ligne */}
                          <div className="mb-2">
                            <h4 className="font-medium text-sm">{reward.title}</h4>
                            <p className="text-xs text-blue-600 font-medium">
                              {reward.partner?.name}
                            </p>
                          </div>
                          
                          {/* Boutons sur la deuxième ligne */}
                          <div className="flex items-center justify-end gap-1 mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(reward)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Switch
                              checked={reward.is_active}
                              onCheckedChange={(checked) => toggleRewardStatus(reward.id, checked)}
                              className="scale-75"
                            />
                          </div>
                          
                          {/* Badges sur la troisième ligne */}
                          <div className="flex items-center gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {reward.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {reward.partner?.category}
                            </Badge>
                          </div>
                          
                          {/* Points et valeur sur la quatrième ligne */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                              <span className="text-xs font-medium">{reward.points_required}</span>
                            </div>
                            
                            {reward.value_chf && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-500 flex-shrink-0" />
                                <span className="text-xs">{reward.value_chf} CHF</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Description en bas */}
                          {reward.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {reward.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Inactive Rewards */}
              {inactiveRewards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-gray-500" />
                    Offres Désactivées ({inactiveRewards.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {inactiveRewards.slice(0, 8).map((reward) => (
                      <Card key={reward.id} className="border-gray-200 opacity-60">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm truncate">{reward.title}</h4>
                            <Switch
                              checked={reward.is_active}
                              onCheckedChange={(checked) => toggleRewardStatus(reward.id, checked)}
                            />
                          </div>
                          
                          <p className="text-xs text-blue-600 mb-1 truncate">
                            {reward.partner?.name}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <Trophy className="h-3 w-3" />
                            <span>{reward.points_required}</span>
                            {reward.value_chf && (
                              <>
                                <span>•</span>
                                <span>{reward.value_chf} CHF</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {inactiveRewards.length > 8 && (
                      <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed border-gray-200 rounded-lg">
                        +{inactiveRewards.length - 8} autres offres désactivées
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardOffersManagement;