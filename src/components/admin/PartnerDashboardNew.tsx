import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, Target, Star, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardDescription } from '@/components/ui/card';

interface PartnerStats {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  totalRevenue: number;
  averageRating: number;
  partnerName: string;
  partnerCity: string;
}

interface RedemptionData {
  id: string;
  redeemed_at: string;
  points_spent: number;
  status: string;
  reward_id: string;
  user_id: string;
  rewards: {
    title: string;
    value_chf: number;
    partner_id: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface OfferData {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  value_chf: number;
  is_active: boolean;
  total_redemptions: number;
  average_rating?: number;
  validity_days?: number;
  max_redemptions_per_user?: number;
  max_redemptions?: number;
  terms_conditions?: string;
}

const PartnerDashboardNew: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PartnerStats>({
    totalOffers: 0,
    activeOffers: 0,
    totalRedemptions: 0,
    totalRevenue: 0,
    averageRating: 0,
    partnerName: '',
    partnerCity: ''
  });
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  // États pour les modales et formulaires
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_required: 0,
    value_chf: 0,
    is_active: true,
    validity_days: 30,
    max_redemptions_per_user: 5,
    max_redemptions: 100,
    terms_conditions: ''
  });

  // Récupérer les données du partenaire
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        console.log('🔍 Fetching partner data for profile:', profile);

        // Vérifier si le profil a un partner_id
        if (!(profile as any).partner_id) {
          console.log('⚠️ No partner_id in profile');
          toast({
            title: 'Partenaire non lié',
            description: 'Votre compte n\'est pas lié à un partenaire. Veuillez contacter l\'administrateur.',
            variant: 'destructive',
          });
          return;
        }

        // Récupérer les informations du partenaire via partner_id
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select(`
            id,
            name,
            email,
            cities(name)
          `)
          .eq('id', (profile as any).partner_id)
          .single();

        if (partnerError) {
          console.error('❌ Error fetching partner data:', partnerError);
          throw partnerError;
        }

        if (!partnerData) {
          console.log('⚠️ No partner found with partner_id:', (profile as any).partner_id);
          toast({
            title: 'Partenaire non trouvé',
            description: `Aucun partenaire trouvé avec l'ID ${(profile as any).partner_id}. Veuillez contacter l'administrateur.`,
            variant: 'destructive',
          });
          return;
        }

        console.log('✅ Partner data found:', partnerData);

        // Récupérer les offres du partenaire
        const { data: offersData, error: offersError } = await supabase
          .from('rewards')
          .select(`
            id,
            title,
            description,
            points_required,
            value_chf,
            is_active,
            validity_days,
            max_redemptions_per_user,
            max_redemptions,
            terms_conditions
          `)
          .eq('partner_id', partnerData.id);

        if (offersError) {
          console.error('❌ Error fetching offers:', offersError);
          throw offersError;
        }

        console.log('✅ Offers data found:', offersData);

        // Récupérer les récompenses avec les données utilisateur
        const { data: redemptionsData, error: redemptionsError } = await supabase
          .from('reward_redemptions')
          .select(`
            id,
            redeemed_at,
            points_spent,
            status,
            reward_id,
            user_id,
            rewards!inner(
              id,
              title,
              value_chf,
              partner_id
            )
          `)
          .eq('rewards.partner_id', partnerData.id)
          .order('redeemed_at', { ascending: false });

        if (redemptionsError) {
          console.error('❌ Error fetching redemptions:', redemptionsError);
          throw redemptionsError;
        }

        console.log('✅ Redemptions data found:', redemptionsData);

        // Récupérer les profils utilisateurs via la fonction SQL
        console.log('🔍 [DEBUG] Fetching user names via SQL function for partner:', partnerData.email);
        
        const { data: profilesData, error: profilesError } = await (supabase as any)
          .rpc('get_user_names_for_partner', { partner_email: partnerData.email });

        if (profilesError) {
          console.error('❌ Error fetching profiles via function:', profilesError);
          throw profilesError;
        }

        console.log('✅ [DEBUG] Profiles data found via function:', profilesData);

        // Combiner les données
        const enrichedRedemptions = redemptionsData?.map(redemption => {
          const profile = (profilesData as any)?.find((p: any) => p.user_id === redemption.user_id);
          console.log('🔍 [DEBUG] Matching profile for user_id:', redemption.user_id, '->', profile);
          return {
            ...redemption,
            profiles: {
              full_name: profile?.full_name || 'Utilisateur inconnu',
              email: profile?.email || 'email@inconnu.com'
            }
          };
        }) || [];

        // Calculer les statistiques
        const totalOffers = offersData?.length || 0;
        const activeOffers = offersData?.filter(o => o.is_active).length || 0;
        const totalRedemptions = enrichedRedemptions?.length || 0;
        const totalRevenue = enrichedRedemptions?.reduce((sum, r) => sum + (r.rewards?.value_chf || 0), 0) || 0;

        // Calculer les récompenses par offre
        const offersWithStats = offersData?.map(offer => {
          const offerRedemptions = enrichedRedemptions?.filter(r => r.reward_id === offer.id) || [];
          return {
            ...offer,
            total_redemptions: offerRedemptions.length
          };
        }) || [];

        setStats({
          totalOffers,
          activeOffers,
          totalRedemptions,
          totalRevenue,
          averageRating: 4.2, // À calculer avec de vraies données
          partnerName: partnerData?.name || '',
          partnerCity: partnerData?.cities?.name || ''
        });

        setOffers(offersWithStats || []);
        setRedemptions(enrichedRedemptions || []);

      } catch (error) {
        console.error('🚨 Error in fetchPartnerData:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les données du partenaire. Veuillez réessayer.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, [profile, toast]);

  // Données pour les graphiques - VRAIES DONNÉES
  const hourlyData = useMemo(() => {
    if (!redemptions.length) return [];
    
    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({ hour: `${hour}:00`, redemptions: 0 }));
    
    redemptions.forEach(redemption => {
      const hour = new Date(redemption.redeemed_at).getHours();
      hourlyStats[hour].redemptions++;
    });
    
    return hourlyStats;
  }, [redemptions]);

  // Jours les plus actifs - VRAIES DONNÉES
  const mostActiveDays = useMemo(() => {
    if (!redemptions.length) return [];
    
    const dayStats = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        day: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        date: date.toISOString().split('T')[0],
        redemptions: 0,
        revenue: 0
      };
    });
    
    redemptions.forEach(redemption => {
      const redemptionDate = new Date(redemption.redeemed_at);
      const daysDiff = Math.floor((Date.now() - redemptionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        dayStats[daysDiff].redemptions++;
        dayStats[daysDiff].revenue += redemption.rewards?.value_chf || 0;
      }
    });
    
    return dayStats.sort((a, b) => b.redemptions - a.redemptions).slice(0, 3);
  }, [redemptions]);

  // Heures les plus actives - VRAIES DONNÉES
  const mostActiveHours = useMemo(() => {
    if (!redemptions.length) return [];
    
    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({ 
      hour: `${hour}:00`, 
      redemptions: 0,
      revenue: 0
    }));
    
    redemptions.forEach(redemption => {
      const hour = new Date(redemption.redeemed_at).getHours();
      hourlyStats[hour].redemptions++;
      hourlyStats[hour].revenue += redemption.rewards?.value_chf || 0;
    });
    
    return hourlyStats.sort((a, b) => b.redemptions - a.redemptions).slice(0, 5);
  }, [redemptions]);

  const dailyData = useMemo(() => {
    if (!redemptions.length) return [];
    
    const dailyStats = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        redemptions: 0,
        revenue: 0
      };
    }).reverse();
    
    redemptions.forEach(redemption => {
      const redemptionDate = new Date(redemption.redeemed_at);
      const daysDiff = Math.floor((Date.now() - redemptionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        dailyStats[daysDiff].redemptions++;
        dailyStats[daysDiff].revenue += redemption.rewards?.value_chf || 0;
      }
    });
    
    return dailyStats;
  }, [redemptions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Fonctions pour gérer les offres
  const handleCreateOffer = async () => {
    try {
              const { data, error } = await supabase
          .from('rewards')
          .insert({
            title: formData.title,
            description: formData.description,
            points_required: formData.points_required,
            value_chf: formData.value_chf,
            is_active: formData.is_active,
            validity_days: formData.validity_days,
            max_redemptions_per_user: formData.max_redemptions_per_user,
            max_redemptions: formData.max_redemptions,
            terms_conditions: formData.terms_conditions,
            partner_id: (profile as any).partner_id
          })
          .select()
          .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Offre créée avec succès",
        variant: "default",
      });

      setShowCreateModal(false);
      setFormData({ 
        title: '', 
        description: '', 
        points_required: 0, 
        value_chf: 0, 
        is_active: true,
        validity_days: 30,
        max_redemptions_per_user: 5,
        max_redemptions: 100,
        terms_conditions: ''
      });
      
      // Recharger les données
      window.location.reload();
    } catch (error) {
      console.error('Erreur création offre:', error);
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
              const { data, error } = await supabase
          .from('rewards')
          .update({
            title: formData.title,
            description: formData.description,
            points_required: formData.points_required,
            value_chf: formData.value_chf,
            is_active: formData.is_active,
            validity_days: formData.validity_days,
            max_redemptions_per_user: formData.max_redemptions_per_user,
            max_redemptions: formData.max_redemptions,
            terms_conditions: formData.terms_conditions
          })
          .eq('id', editingOffer.id)
          .select()
          .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Offre modifiée avec succès",
        variant: "default",
      });

      setShowEditModal(false);
      setEditingOffer(null);
      setFormData({ 
        title: '', 
        description: '', 
        points_required: 0, 
        value_chf: 0, 
        is_active: true,
        validity_days: 30,
        max_redemptions_per_user: 5,
        max_redemptions: 100,
        terms_conditions: ''
      });
      
      // Recharger les données
      window.location.reload();
    } catch (error) {
      console.error('Erreur modification offre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'offre",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string, offerTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'offre "${offerTitle}" ?`)) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Offre "${offerTitle}" supprimée`,
        variant: "default",
      });
      
      // Recharger les données
      window.location.reload();
    } catch (error) {
      console.error('Erreur suppression offre:', error);
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
      validity_days: offer.validity_days || 30,
      max_redemptions_per_user: offer.max_redemptions_per_user || 5,
      max_redemptions: offer.max_redemptions || 100,
      terms_conditions: offer.terms_conditions || ''
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec nom du partenaire */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 h-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tableau de Bord Partenaire</h1>
            <p className="text-muted-foreground">
              {stats.partnerName} - {stats.partnerCity}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="offers">Gestion des Offres</TabsTrigger>
        </TabsList>

        {/* Onglet Tableau de Bord */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Sous-onglets pour le tableau de bord */}
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="rewards">Récompenses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPIs */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offres Actives</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeOffers}</div>
                    <p className="text-xs text-muted-foreground">
                      sur {stats.totalOffers} total
                    </p>
                    <Progress value={(stats.activeOffers / Math.max(stats.totalOffers, 1)) * 100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Récompenses</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
                    <p className="text-xs text-muted-foreground">
                      total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      total généré
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      sur 5 étoiles
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Métriques d'activité */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Jours les plus actifs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Jours les Plus Actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mostActiveDays.length > 0 ? (
                      <div className="space-y-3">
                        {mostActiveDays.map((day, index) => (
                          <div key={day.date} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{day.day}</span>
                              <Badge variant="outline">{day.redemptions} récompenses</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(day.revenue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                    )}
                  </CardContent>
                </Card>

                {/* Heures les plus actives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Heures les Plus Actives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mostActiveHours.length > 0 ? (
                      <div className="space-y-3">
                        {mostActiveHours.map((hour, index) => (
                          <div key={hour.hour} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{hour.hour}</span>
                              <Badge variant="outline">{hour.redemptions} récompenses</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(hour.revenue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Meilleures offres */}
              <Card>
                <CardHeader>
                  <CardTitle>Meilleures Offres</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offre</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Récompenses</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.slice(0, 5).map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.title}</TableCell>
                          <TableCell>{offer.points_required}</TableCell>
                          <TableCell>{formatCurrency(offer.value_chf)}</TableCell>
                          <TableCell>{offer.total_redemptions || 0}</TableCell>
                          <TableCell>
                            <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                              {offer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Récompenses */}
            <TabsContent value="rewards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des Récompenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Offre</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redemptions.slice(0, 10).map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell>
                            {new Date(redemption.redeemed_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{redemption.profiles?.full_name || 'Utilisateur inconnu'}</TableCell>
                          <TableCell>{redemption.rewards?.title || 'Offre supprimée'}</TableCell>
                          <TableCell>{redemption.points_spent}</TableCell>
                          <TableCell>{formatCurrency(redemption.rewards?.value_chf || 0)}</TableCell>
                          <TableCell>
                            <Badge variant={redemption.status === 'completed' ? 'default' : 'secondary'}>
                              {redemption.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taux d'Engagement</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalOffers > 0 ? Math.round((stats.totalRedemptions / stats.totalOffers) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      offres validées vs créées
                    </p>
                    <Progress 
                      value={stats.totalOffers > 0 ? (stats.totalRedemptions / stats.totalOffers) * 100 : 0} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenu Moyen</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalRedemptions > 0 ? formatCurrency(stats.totalRevenue / stats.totalRedemptions) : formatCurrency(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      par récompense
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalOffers > 0 ? Math.round((stats.activeOffers / stats.totalOffers) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      offres actives
                    </p>
                    <Progress 
                      value={stats.totalOffers > 0 ? (stats.activeOffers / stats.totalOffers) * 100 : 0} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.averageRating.toFixed(1)}/5
                    </div>
                    <p className="text-xs text-muted-foreground">
                      note moyenne
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activité horaire */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Horaire</CardTitle>
                    <CardDescription>Récompenses par heure sur 24h</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="redemptions" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Activité quotidienne */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité Quotidienne</CardTitle>
                    <CardDescription>Récompenses par jour de la semaine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="redemptions" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Analyse détaillée */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top des offres */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 des Offres</CardTitle>
                    <CardDescription>Offres les plus populaires</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {offers.slice(0, 5).map((offer, index) => (
                        <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{offer.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {offer.points_required} points • {formatCurrency(offer.value_chf)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{offer.total_redemptions || 0}</p>
                            <p className="text-xs text-muted-foreground">rédemptions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tendances */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendances</CardTitle>
                    <CardDescription>Évolution sur 30 jours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Rédemptions</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">+12%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Revenus</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">+8%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Nouveaux clients</span>
                        </div>
                        <span className="text-sm font-bold text-purple-600">+15%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                            </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Onglet Gestion des Offres */}
        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Offres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Vos Offres</h3>
                <Button onClick={() => setShowCreateModal(true)}>
                  Nouvelle Offre
                </Button>
              </div>
              
              <Table>
                                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Points Requis</TableHead>
                        <TableHead>Valeur CHF</TableHead>
                        <TableHead>Récompenses</TableHead>
                        <TableHead>Limites</TableHead>
                        <TableHead>Validité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.points_required}</TableCell>
                      <TableCell>{formatCurrency(offer.value_chf)}</TableCell>
                      <TableCell>{offer.total_redemptions || 0}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>Par user: {offer.max_redemptions_per_user || 5}</div>
                          <div>Total: {offer.max_redemptions || 100}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {offer.validity_days || 30} jours
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-2"
                            onClick={() => openEditModal(offer)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-2"
                            onClick={() => handleDeleteOffer(offer.id, offer.title)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de création d'offre */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle offre</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'offre"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'offre"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="points">Points requis</Label>
              <Input
                id="points"
                type="number"
                value={formData.points_required}
                onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valeur CHF</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value_chf}
                onChange={(e) => setFormData({ ...formData, value_chf: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validity">Jours de validité</Label>
              <Input
                id="validity"
                type="number"
                value={formData.validity_days}
                onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-per-user">Limite par utilisateur</Label>
              <Input
                id="max-per-user"
                type="number"
                value={formData.max_redemptions_per_user}
                onChange={(e) => setFormData({ ...formData, max_redemptions_per_user: parseInt(e.target.value) || 5 })}
                placeholder="5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-total">Limite globale</Label>
              <Input
                id="max-total"
                type="number"
                value={formData.max_redemptions}
                onChange={(e) => setFormData({ ...formData, max_redemptions: parseInt(e.target.value) || 100 })}
                placeholder="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="terms">Conditions d'utilisation</Label>
              <Textarea
                id="terms"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                placeholder="Conditions d'utilisation de l'offre"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Offre active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateOffer}>
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de modification d'offre */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'offre</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'offre"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'offre"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-points">Points requis</Label>
              <Input
                id="edit-points"
                type="number"
                value={formData.points_required}
                onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-value">Valeur CHF</Label>
              <Input
                id="edit-value"
                type="number"
                step="0.01"
                value={formData.value_chf}
                onChange={(e) => setFormData({ ...formData, value_chf: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-validity">Jours de validité</Label>
              <Input
                id="edit-validity"
                type="number"
                value={formData.validity_days}
                onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-max-per-user">Limite par utilisateur</Label>
              <Input
                id="edit-max-per-user"
                type="number"
                value={formData.max_redemptions_per_user}
                onChange={(e) => setFormData({ ...formData, max_redemptions_per_user: parseInt(e.target.value) || 5 })}
                placeholder="5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-max-total">Limite globale</Label>
              <Input
                id="edit-max-total"
                type="number"
                value={formData.max_redemptions}
                onChange={(e) => setFormData({ ...formData, max_redemptions: parseInt(e.target.value) || 100 })}
                placeholder="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-terms">Conditions d'utilisation</Label>
              <Textarea
                id="edit-terms"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                placeholder="Conditions d'utilisation de l'offre"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-active">Offre active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditOffer}>
              Modifier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerDashboardNew; 