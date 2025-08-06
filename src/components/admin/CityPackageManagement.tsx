import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Save, X, Package } from 'lucide-react';

interface CityPackage {
  id: string;
  city_id: string;
  package_type: string;
  annual_amount_chf: number;
  billing_period: string;
  contract_start_date?: string;
  contract_end_date?: string;
  renewal_date?: string;
  auto_renewal: boolean;
  payment_status: string;
  features_included: any;
  custom_terms?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface City {
  id: string;
  name: string;
}

export default function CityPackageManagement() {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<CityPackage[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CityPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    city_id: '',
    package_type: 'starter',
    annual_amount_chf: 0,
    billing_period: 'annual',
    contract_start_date: '',
    contract_end_date: '',
    renewal_date: '',
    auto_renewal: true,
    payment_status: 'pending',
    features_included: {},
    custom_terms: '',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    notes: '',
    is_active: true
  });

  useEffect(() => {
    fetchPackages();
    fetchCities();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('city_packages')
        .select(`
          *,
          cities!inner(name)
        `)
        .order('created_at', { ascending: false });

      // Si l'utilisateur est tenant_admin, filtrer par sa ville
      if (profile?.role === 'tenant_admin' && profile?.city_id) {
        query = query.eq('city_id', profile.city_id);
      }

      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les packages',
          variant: 'destructive',
        });
        return;
      }

      setPackages(data || []);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      let query = supabase
        .from('cities')
        .select('id, name')
        .order('name');

      // Si tenant_admin, ne montrer que sa ville
      if (profile?.role === 'tenant_admin' && profile?.city_id) {
        query = query.eq('id', profile.city_id);
      }

      const { data, error } = await query;

      if (error) {
        return;
      }

      setCities(data || []);
    } catch (error) {
    }
  };

  const handleSavePackage = async () => {
    try {
      if (!formData.city_id || !formData.annual_amount_chf) {
        toast({
          title: 'Erreur',
          description: 'La ville et le montant annuel sont obligatoires',
          variant: 'destructive',
        });
        return;
      }

      const packageData = {
        ...formData,
        created_by: user?.id,
      };

      let result;
      if (selectedPackage) {
        // Update existing package
        result = await supabase
          .from('city_packages')
          .update(packageData)
          .eq('id', selectedPackage.id)
          .select()
          .single();
      } else {
        // Create new package
        result = await supabase
          .from('city_packages')
          .insert([packageData])
          .select()
          .single();
      }

      if (result.error) {
        toast({
          title: 'Erreur',
          description: result.error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Succès',
        description: selectedPackage ? 'Package mis à jour' : 'Package créé',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      city_id: '',
      package_type: 'starter',
      annual_amount_chf: 0,
      billing_period: 'annual',
      contract_start_date: '',
      contract_end_date: '',
      renewal_date: '',
      auto_renewal: true,
      payment_status: 'pending',
      features_included: {},
      custom_terms: '',
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
      notes: '',
      is_active: true
    });
    setSelectedPackage(null);
  };

  const openEditDialog = (pkg: CityPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      city_id: pkg.city_id,
      package_type: pkg.package_type,
      annual_amount_chf: pkg.annual_amount_chf,
      billing_period: pkg.billing_period,
      contract_start_date: pkg.contract_start_date || '',
      contract_end_date: pkg.contract_end_date || '',
      renewal_date: pkg.renewal_date || '',
      auto_renewal: pkg.auto_renewal,
      payment_status: pkg.payment_status,
      features_included: pkg.features_included || {},
      custom_terms: pkg.custom_terms || '',
      contact_person_name: pkg.contact_person_name || '',
      contact_person_email: pkg.contact_person_email || '',
      contact_person_phone: pkg.contact_person_phone || '',
      notes: pkg.notes || '',
      is_active: pkg.is_active
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getPackageTypeName = (type: string) => {
    const types = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPackageAmount = (type: string) => {
    const amounts = {
      starter: 15000,
      professional: 35000,
      enterprise: 65000
    };
    return amounts[type as keyof typeof amounts] || 0;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Packages Villes</h2>
        {profile?.role === 'super_admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedPackage ? 'Modifier le Package' : 'Créer un Nouveau Package'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
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
                  </div>
                  <div>
                    <Label htmlFor="package_type">Type de Package</Label>
                    <Select 
                      value={formData.package_type} 
                      onValueChange={(value) => {
                        setFormData({ 
                          ...formData, 
                          package_type: value,
                          annual_amount_chf: getPackageAmount(value)
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter (CHF 15'000)</SelectItem>
                        <SelectItem value="professional">Professional (CHF 35'000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (CHF 65'000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="annual_amount">Montant Annuel (CHF) *</Label>
                    <Input
                      id="annual_amount"
                      type="number"
                      value={formData.annual_amount_chf}
                      onChange={(e) => setFormData({ ...formData, annual_amount_chf: Number(e.target.value) })}
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_period">Période de Facturation</Label>
                    <Select value={formData.billing_period} onValueChange={(value) => setFormData({ ...formData, billing_period: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_status">Statut de Paiement</Label>
                    <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contract_start">Date de début</Label>
                    <Input
                      id="contract_start"
                      type="date"
                      value={formData.contract_start_date}
                      onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract_end">Date de fin</Label>
                    <Input
                      id="contract_end"
                      type="date"
                      value={formData.contract_end_date}
                      onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="renewal_date">Date de renouvellement</Label>
                    <Input
                      id="renewal_date"
                      type="date"
                      value={formData.renewal_date}
                      onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Nom du contact</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_person_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email du contact</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_person_email}
                      onChange={(e) => setFormData({ ...formData, contact_person_email: e.target.value })}
                      placeholder="jean.dupont@ville.ch"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Téléphone du contact</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_person_phone}
                      onChange={(e) => setFormData({ ...formData, contact_person_phone: e.target.value })}
                      placeholder="+41 79 123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom_terms">Conditions particulières</Label>
                  <Textarea
                    id="custom_terms"
                    value={formData.custom_terms}
                    onChange={(e) => setFormData({ ...formData, custom_terms: e.target.value })}
                    placeholder="Conditions spéciales pour cette ville..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes internes..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_renewal"
                      checked={formData.auto_renewal}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_renewal: checked })}
                    />
                    <Label htmlFor="auto_renewal">Renouvellement automatique</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Package actif</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button onClick={handleSavePackage}>
                    <Save className="h-4 w-4 mr-2" />
                    {selectedPackage ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {packages.map((pkg: any) => (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {pkg.cities?.name} - {getPackageTypeName(pkg.package_type)}
                    {getStatusBadge(pkg.payment_status)}
                    {!pkg.is_active && <Badge variant="outline">Inactif</Badge>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    CHF {pkg.annual_amount_chf?.toLocaleString()} / {pkg.billing_period}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(pkg)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Contrat:</strong> 
                  {pkg.contract_start_date && pkg.contract_end_date ? 
                    ` ${new Date(pkg.contract_start_date).toLocaleDateString('fr-FR')} - ${new Date(pkg.contract_end_date).toLocaleDateString('fr-FR')}` :
                    ' Non défini'
                  }
                </div>
                <div>
                  <strong>Renouvellement:</strong> 
                  {pkg.renewal_date ? 
                    ` ${new Date(pkg.renewal_date).toLocaleDateString('fr-FR')}` :
                    ' Non défini'
                  } {pkg.auto_renewal && '(Auto)'}
                </div>
                {pkg.contact_person_name && (
                  <div>
                    <strong>Contact:</strong> {pkg.contact_person_name}
                    {pkg.contact_person_email && ` (${pkg.contact_person_email})`}
                  </div>
                )}
                {pkg.notes && (
                  <div className="col-span-2">
                    <strong>Notes:</strong> {pkg.notes}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Créé le {new Date(pkg.created_at).toLocaleDateString('fr-FR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun package trouvé.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}