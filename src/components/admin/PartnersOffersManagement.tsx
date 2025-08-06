import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  Building,
  ShoppingBag,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';

interface PartnerData {
  id: string;
  name: string;
  category: string;
  email: string;
  city_id: string;
  city?: {
    name: string;
    country_id: string;
    countries?: {
      name_fr: string;
    };
  };
  is_active: boolean;
}

interface OfferData {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  value_chf: number;
  is_active: boolean;
  partner_id: string;
  validity_days?: number;
  max_redemptions_per_user?: number;
  max_redemptions?: number;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
  partner?: {
    name: string;
  };
}

interface PartnersOffersManagementProps {
  partners: PartnerData[];
  countries: Array<{id: string, name_fr: string}>;
  cities: Array<{id: string, name: string, country_id: string}>;
  selectedCountry: string;
  selectedCity: string;
  selectedPartner: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPartnerChange: (value: string) => void;
}

const PartnersOffersManagement = ({
  partners,
  countries,
  cities,
  selectedCountry,
  selectedCity,
  selectedPartner,
  onCountryChange,
  onCityChange,
  onPartnerChange
}: PartnersOffersManagementProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const isSuperAdmin = () => profile?.role === 'super_admin';
  const isTenantAdmin = () => profile?.role === 'tenant_admin';
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_required: 0,
    value_chf: 0,
    is_active: true,
    partner_id: '',
    validity_days: 30,
    max_redemptions_per_user: 5,
    max_redemptions: 100,
    terms_conditions: ''
  });

  useEffect(() => {
    fetchOffers();
  }, [selectedPartner, partners]);

  // Pour les Admin Ville, auto-sélectionner le partenaire si disponible
  useEffect(() => {
    if (isTenantAdmin() && partners.length > 0 && !formData.partner_id) {
      setFormData(prev => ({ ...prev, partner_id: partners[0].id }));
    }
  }, [partners, isTenantAdmin]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      points_required: 0,
      value_chf: 0,
      is_active: true,
      partner_id: isTenantAdmin() && partners.length > 0 ? partners[0].id : '',
      validity_days: 30,
      max_redemptions_per_user: 5,
      max_redemptions: 100,
      terms_conditions: ''
    });
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      let partnerIds: string[] = [];

      // Pour Admin Ville, récupérer d'abord les partenaires de sa ville
      if (isTenantAdmin() && profile?.city_id) {
        const { data: partnersData, error: partnersError } = await supabase
          .from('partners')
          .select('id')
          .eq('city_id', profile.city_id);
        
        if (partnersError) throw partnersError;
        partnerIds = partnersData?.map(p => p.id) || [];
      } else {
        // Pour Super Admin, utiliser les partenaires filtrés
        partnerIds = partners.map(p => p.id);
        if (selectedPartner !== 'all') {
          partnerIds = [selectedPartner];
        }
      }

      // Si aucun partenaire, pas d'offres
      if (partnerIds.length === 0) {
        setOffers([]);
        return;
      }

      // Récupérer les offres pour ces partenaires
      const { data: offersData, error: offersError } = await supabase
        .from('rewards')
        .select('*')
        .in('partner_id', partnerIds)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;

      // Récupérer les noms des partenaires
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select('id, name')
        .in('id', partnerIds);

      if (partnersError) throw partnersError;

      // Combiner les données
      const offersWithPartners = offersData?.map(offer => ({
        ...offer,
        partner: partnersData?.find(p => p.id === offer.partner_id)
      })) || [];

      setOffers(offersWithPartners);
    } catch (error) {
      console.error('Erreur fetchOffers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const { error } = await supabase
        .from('rewards')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Offre créée avec succès",
      });

      setShowCreateModal(false);
      resetForm();
      fetchOffers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'offre",
        variant: "destructive",
      });
    }
  };

  const handleEditOffer = async () => {
    if (!editingOffer) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOffer.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Offre modifiée avec succès",
      });

      setShowEditModal(false);
      setEditingOffer(null);
      resetForm();
      fetchOffers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'offre",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Offre supprimée avec succès",
      });

      fetchOffers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'offre",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (offer: OfferData) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      points_required: offer.points_required,
      value_chf: offer.value_chf,
      is_active: offer.is_active,
      partner_id: offer.partner_id,
      validity_days: offer.validity_days || 30,
      max_redemptions_per_user: offer.max_redemptions_per_user || 5,
      max_redemptions: offer.max_redemptions || 100,
      terms_conditions: offer.terms_conditions || ''
    });
    setShowEditModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres et bouton de création */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Offres</h2>
          <p className="text-muted-foreground">
            Créer, modifier et supprimer les offres des partenaires
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filtres */}
          {isSuperAdmin() ? (
            <>
              <Select value={selectedCountry} onValueChange={onCountryChange}>
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

              <Select value={selectedCity} onValueChange={onCityChange}>
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

              <Select value={selectedPartner} onValueChange={onPartnerChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Partenaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les partenaires</SelectItem>
                  {partners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <div className="w-40 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md border">
                {countries.length > 0 ? countries[0].name_fr : 'Pays assigné'}
              </div>
              <div className="w-40 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md border">
                {cities.length > 0 ? cities[0].name : 'Ville assignée'}
              </div>
              <div className="w-40 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md border">
                {partners.length > 0 ? `${partners.length} partenaire(s)` : 'Aucun partenaire'}
              </div>
            </>
          )}

          {/* Bouton de création */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Offre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle offre</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle offre pour un partenaire sélectionné
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'offre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: 1 once de Fendant offerte"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner">Partenaire</Label>
                  {isSuperAdmin() ? (
                    <Select value={formData.partner_id} onValueChange={(value) => setFormData({...formData, partner_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un partenaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map(partner => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md border">
                      {partners.length > 0 ? partners[0].name : 'Aucun partenaire disponible'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points requis</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points_required}
                    onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value) || 0})}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valeur (CHF)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value_chf}
                    onChange={(e) => setFormData({...formData, value_chf: parseFloat(e.target.value) || 0})}
                    placeholder="5.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity">Jours de validité</Label>
                  <Input
                    id="validity"
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({...formData, validity_days: parseInt(e.target.value) || 30})}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPerUser">Limite par utilisateur</Label>
                  <Input
                    id="maxPerUser"
                    type="number"
                    value={formData.max_redemptions_per_user}
                    onChange={(e) => setFormData({...formData, max_redemptions_per_user: parseInt(e.target.value) || 5})}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTotal">Limite globale</Label>
                  <Input
                    id="maxTotal"
                    type="number"
                    value={formData.max_redemptions}
                    onChange={(e) => setFormData({...formData, max_redemptions: parseInt(e.target.value) || 100})}
                    placeholder="100"
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
                    <Label htmlFor="active">{formData.is_active ? 'Active' : 'Inactive'}</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description détaillée de l'offre..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Conditions d'utilisation</Label>
                <Textarea
                  id="terms"
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                  placeholder="Conditions spéciales, restrictions, etc..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateOffer}>
                  Créer l'offre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tableau des offres */}
      <Card>
        <CardHeader>
          <CardTitle>Offres existantes</CardTitle>
          <CardDescription>
            {offers.length} offre(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des offres...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offre</TableHead>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Limites</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{offer.title}</div>
                          {offer.description && (
                            <div className="text-sm text-muted-foreground">{offer.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{offer.partner?.name || 'N/A'}</TableCell>
                      <TableCell>{offer.points_required}</TableCell>
                      <TableCell>{formatCurrency(offer.value_chf)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{offer.max_redemptions_per_user || '∞'}/utilisateur</div>
                          <div>{offer.max_redemptions || '∞'} total</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {offer.validity_days || '∞'} jours
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offer.is_active ? "default" : "secondary"}>
                          {offer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(offer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOffer(offer.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'offre</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l'offre sélectionnée
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre de l'offre</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: 1 once de Fendant offerte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-partner">Partenaire</Label>
              <Select value={formData.partner_id} onValueChange={(value) => setFormData({...formData, partner_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un partenaire" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-points">Points requis</Label>
              <Input
                id="edit-points"
                type="number"
                value={formData.points_required}
                onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value) || 0})}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-value">Valeur (CHF)</Label>
              <Input
                id="edit-value"
                type="number"
                step="0.01"
                value={formData.value_chf}
                onChange={(e) => setFormData({...formData, value_chf: parseFloat(e.target.value) || 0})}
                placeholder="5.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-validity">Jours de validité</Label>
              <Input
                id="edit-validity"
                type="number"
                value={formData.validity_days}
                onChange={(e) => setFormData({...formData, validity_days: parseInt(e.target.value) || 30})}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-maxPerUser">Limite par utilisateur</Label>
              <Input
                id="edit-maxPerUser"
                type="number"
                value={formData.max_redemptions_per_user}
                onChange={(e) => setFormData({...formData, max_redemptions_per_user: parseInt(e.target.value) || 5})}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-maxTotal">Limite globale</Label>
              <Input
                id="edit-maxTotal"
                type="number"
                value={formData.max_redemptions}
                onChange={(e) => setFormData({...formData, max_redemptions: parseInt(e.target.value) || 100})}
                placeholder="100"
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
                <Label htmlFor="edit-active">{formData.is_active ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description détaillée de l'offre..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-terms">Conditions d'utilisation</Label>
            <Textarea
              id="edit-terms"
              value={formData.terms_conditions}
              onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
              placeholder="Conditions spéciales, restrictions, etc..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditOffer}>
              Modifier l'offre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersOffersManagement; 