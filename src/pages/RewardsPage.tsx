import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { contactTranslations } from '@/utils/translations';
import { StandardPageLayout } from '@/components/layout';
import GeographicalFilters from '@/components/common/GeographicalFilters';
import {
  Gift,
  Trophy,
  ShoppingBag,
  Coffee,
  Utensils,
  MapPin,
  Clock,
  Star,
  Ticket,
  QrCode,
  Sparkles,
  Navigation,
  Calendar,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_required: number | null;
  value_chf: number | null;
  type: string | null;
  image_url: string | null;
  max_redemptions: number | null;
  max_redemptions_per_user: number | null;
  validity_days: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  terms_conditions: string | null;
  partner_id: string | null;
  partner: {
    id: string;
    name: string;
    category: string | null;
    logo_url: string | null;
    address?: string;
    latitude?: number;
    longitude?: number;
    city_id?: string;
    email?: string;
    city?: {
      id: string;
      name: string;
      country_id: string;
    };
  };
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

interface RewardStats {
  total_redemptions: number;
  max_redemptions?: number;
  user_redemptions: number;
  max_redemptions_per_user?: number;
  can_redeem: boolean;
}

interface RewardRedemption {
  id: string;
  redemption_code: string;
  points_spent: number;
  created_at: string;
  expires_at?: string;
  status: 'pending' | 'used' | 'expired';
  reward: Reward;
  used_at?: string; // Added for validated redemptions
}

const RewardsPage = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [pendingRewardsCount, setPendingRewardsCount] = useState(0);
  const [rewardStats, setRewardStats] = useState<Map<string, RewardStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('store');
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();

  // Helper function for rewards translations
  const getRewardTranslation = (key: string, params: Record<string, any> = {}) => {
    const translation = contactTranslations.rewards[key]?.[currentLanguage] || contactTranslations.rewards[key]?.fr || key;
    
    // Simple parameter replacement
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), value);
    }, translation);
  };

  // Function to get color for city badges
  const getCityBadgeColor = (cityName: string) => {
    const colors = {
      'Lausanne': 'bg-blue-100 text-blue-800 border-blue-300',
      'Montreux': 'bg-purple-100 text-purple-800 border-purple-300',
      'Sion': 'bg-orange-100 text-orange-800 border-orange-300',
      'Carcassonne': 'bg-red-100 text-red-800 border-red-300',
      'Collioure': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Narbonne': 'bg-green-100 text-green-800 border-green-300'
    };
    
    return colors[cityName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Dedicated function to count pending rewards - simple and reliable
  const getPendingRewardsCount = async () => {
    if (!profile) {
      setPendingRewardsCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('reward_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      const pendingCount = count || 0;
      setPendingRewardsCount(pendingCount);
      
    } catch (error) {
      setPendingRewardsCount(0);
    }
  };

  // Fetch redemptions by status
  const fetchRedemptionsByStatus = async (status: 'pending' | 'validated' | 'expired') => {
    if (!profile) return [];

    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          reward:rewards(
            *,
            partner:partners(
              id, 
              name, 
              category, 
              email, 
              city_id,
              logo_url,
              address,
              latitude,
              longitude,
              cities(id, name, country_id)
            )
          )
        `)
        .eq('user_id', profile.user_id)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching redemptions by status:', error);
      return [];
    }
  };

  // Get redemptions for each status
  const pendingRedemptions = useMemo(() => 
    redemptions.filter(r => r.status === 'pending'), [redemptions]
  );
  
  const usedRedemptions = useMemo(() => 
    redemptions.filter(r => r.status === 'used'), [redemptions]
  );
  
  const expiredRedemptions = useMemo(() => 
    redemptions.filter(r => r.status === 'expired'), [redemptions]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRewards(),
          fetchRedemptions(),
          getPendingRewardsCount(),
          fetchCountries(),
          fetchCities()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [profile]);

  // Rafraîchir les récompenses quand l'utilisateur revient sur la page pour maintenir le badge
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profile) {
        getPendingRewardsCount();
      }
    };

    const handleFocus = () => {
      if (profile) {
        getPendingRewardsCount();
      }
    };

    // Écouter quand l'utilisateur revient sur cette page/onglet
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [profile]);

  const fetchRewardStats = async (rewardIds: string[]) => {
    if (!profile || rewardIds.length === 0) return;

    try {
      const statsPromises = rewardIds.map(async (rewardId) => {
        const { data, error } = await supabase
          .rpc('get_reward_redemption_stats', { p_reward_id: rewardId });

        if (error) throw error;
        return { rewardId, stats: data[0] };
      });

      const results = await Promise.all(statsPromises);
      const newStats = new Map();
      
      results.forEach(({ rewardId, stats }) => {
        if (stats) {
          newStats.set(rewardId, stats);
        }
      });

      setRewardStats(newStats);
    } catch (error) {
    }
  };

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
        .select(`
          id, 
          name, 
          country_id,
          countries!inner(id, is_active)
        `)
        .eq('is_archived', false)
        .eq('is_visible_on_homepage', true)
        .eq('countries.is_active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
    }
  };

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select(`
          *,
          partners!inner(
            id,
            name,
            category,
            logo_url,
            address,
            latitude,
            longitude,
            city_id,
            cities(id, name, country_id)
          )
        `)
        .eq('is_active', true)
        .order('points_required');

      if (error) throw error;

      const transformedRewards = data.map(reward => ({
        ...reward,
        partner: {
          ...reward.partners,
          city: reward.partners.cities
        }
      }));

      setRewards(transformedRewards);
      
      // Fetch stats for all rewards
      if (transformedRewards.length > 0) {
        const rewardIds = transformedRewards.map(r => r.id);
        await fetchRewardStats(rewardIds);
      }
    } catch (error) {
      toast({
        title: t('toast.error.title'),
        description: t('rewards.error.loading'),
        variant: 'destructive',
      });
      setRewards([]); // Set empty array on error
    }
  };

  const fetchRedemptions = async () => {
    if (!profile) {
      return;
    }

    try {
      console.log('🔍 Fetching redemptions for user:', profile.user_id);
      
      // Récupérer TOUS les redemptions de l'utilisateur avec les données complètes
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          reward:rewards(
            *,
            partner:partners(
              id, 
              name, 
              category, 
              email, 
              city_id,
              logo_url,
              address,
              latitude,
              longitude,
              cities(id, name, country_id)
            )
          )
        `)
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (redemptionsError) {
        console.error('❌ Error fetching redemptions:', redemptionsError);
        throw redemptionsError;
      }

      console.log('📊 Found redemptions:', redemptionsData?.length || 0);

      if (!redemptionsData || redemptionsData.length === 0) {
        console.log('📭 No redemptions found');
        setRedemptions([]);
        return;
      }

      // Transformer les données pour correspondre à l'interface
      const transformedRedemptions = redemptionsData.map(redemption => {
        const rewardData = redemption.reward ? {
          ...redemption.reward,
          partner: {
            ...redemption.reward.partner,
            city: redemption.reward.partner.cities
          }
        } : null;
        
        return {
          ...redemption,
          status: (redemption.status as 'pending' | 'used' | 'expired') || 'pending',
          reward: rewardData
        };
      }).filter(redemption => redemption.reward !== null); // Garder seulement ceux avec des données de reward

      console.log('✅ Transformed redemptions:', transformedRedemptions.length);
      console.log('📋 Redemptions by status:', {
        pending: transformedRedemptions.filter(r => r.status === 'pending').length,
        used: transformedRedemptions.filter(r => r.status === 'used').length,
        expired: transformedRedemptions.filter(r => r.status === 'expired').length
      });

      setRedemptions(transformedRedemptions);
      
    } catch (error) {
      console.error('🚨 Error in fetchRedemptions:', error);
      
      // Set empty array and show user-friendly error
      setRedemptions([]);
      
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger vos récompenses. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  const refreshDataAfterRedemption = async () => {
    try {
      // Refresh pending count first (for the badge)
      await getPendingRewardsCount();
      
      // Refresh redemptions history for the detailed view
      await fetchRedemptions();
      
      // Refresh reward stats
      const rewardIds = rewards.map(r => r.id);
      await fetchRewardStats(rewardIds);
      
      } catch (error) {
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!profile) {
      toast({
        title: t('toast.error.title'),
        description: getRewardTranslation('login_required'),
        variant: 'destructive',
      });
      return;
    }

    setRedeeming(reward.id);

    try {
      // Check if user can redeem this reward using database function
      const { data: canRedeemData, error: canRedeemError } = await supabase
        .rpc('can_user_redeem_reward', { p_reward_id: reward.id });

      if (canRedeemError) throw canRedeemError;

      if (!canRedeemData) {
        toast({
          title: t('toast.error.title'),
          description: getRewardTranslation('redemption_limit_reached'),
          variant: 'destructive',
        });
        return;
      }

      if (profile.total_points < reward.points_required) {
        toast({
          title: t('toast.error.title'),
          description: t('rewards.insufficient_points'),
          variant: 'destructive',
        });
        return;
      }

      // Generate redemption code
      const redemptionCode = `CIARA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Calculate expiration date using validity_days
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (reward.validity_days || 30));

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: profile.user_id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          redemption_code: redemptionCode,
          expires_at: expirationDate.toISOString()
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Update user points in database
      const newTotalPoints = profile.total_points - reward.points_required;
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ 
          total_points: newTotalPoints 
        })
        .eq('user_id', profile.user_id);

      if (pointsError) throw pointsError;

      // Update profile locally immediately (before real-time update kicks in)
      const updatedProfile = { ...profile, total_points: newTotalPoints };
      // Use a timeout to ensure the local update happens immediately
      setTimeout(() => {
        // This will trigger a re-render with the updated points
        window.dispatchEvent(new CustomEvent('profile-updated', { 
          detail: updatedProfile 
        }));
      }, 100);

      toast({
        title: t('toast.success.title'),
        description: t('rewards.exchanged_success'),
      });

      // Refresh all data after successful redemption (this maintains the badge count)
      await refreshDataAfterRedemption();

    } catch (error) {
      toast({
        title: t('toast.error.title'),
        description: t('rewards.exchange_error'),
        variant: 'destructive',
      });
    } finally {
      setRedeeming(null);
    }
  };

  const handleUseReward = async (redemption: RewardRedemption) => {
    if (!profile) {
      toast({
        title: t('toast.error.title'),
        description: getRewardTranslation('login_required'),
        variant: 'destructive',
      });
      return;
    }

    setRedeeming(redemption.id);

    try {
      console.log('🎯 Using reward:', redemption.id);

      // 1. Mettre à jour le statut du voucher à 'used'
      const { error: useRedemptionError } = await supabase
        .from('reward_redemptions')
        .update({ 
          status: 'used', 
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', redemption.id);

      if (useRedemptionError) {
        console.error('❌ Error updating redemption status:', useRedemptionError);
        throw useRedemptionError;
      }

      console.log('✅ Redemption status updated to used');

      // 2. Envoyer l'email de confirmation au partenaire
      try {
        const { error: emailError } = await supabase.functions.invoke('send-reward-redemption', {
          body: {
            voucherId: redemption.id,
            redemptionCode: redemption.redemption_code,
            partnerEmail: redemption.reward.partner.email,
            partnerName: redemption.reward.partner.name,
            partnerAddress: redemption.reward.partner.address,
            rewardTitle: redemption.reward.title,
            rewardDescription: redemption.reward.description,
            pointsSpent: redemption.points_spent,
            userEmail: profile.email,
            language: currentLanguage
          }
        });

        if (emailError) {
          console.error('⚠️ Email error (non-blocking):', emailError);
          // Ne pas bloquer le processus si l'email échoue
        } else {
          console.log('✅ Confirmation email sent to partner');
        }
      } catch (emailError) {
        console.error('⚠️ Email error (non-blocking):', emailError);
        // Ne pas bloquer le processus si l'email échoue
      }

      // 3. Remettre les points à l'utilisateur (optionnel selon la logique métier)
      // const newTotalPoints = profile.total_points + redemption.points_spent;
      // const { error: pointsError } = await supabase
      //   .from('profiles')
      //   .update({ 
      //     total_points: newTotalPoints 
      //   })
      //   .eq('user_id', profile.user_id);

      // if (pointsError) throw pointsError;

      // Update profile locally immediately (before real-time update kicks in)
      // const updatedProfile = { ...profile, total_points: newTotalPoints };
      // setTimeout(() => {
      //   window.dispatchEvent(new CustomEvent('profile-updated', { 
      //     detail: updatedProfile 
      //   }));
      // }, 100);

      toast({
        title: t('toast.success.title'),
        description: t('rewards.used_success'),
      });

      console.log('✅ Reward used successfully');

      // 4. Rafraîchir toutes les données
      await refreshDataAfterRedemption();

    } catch (error) {
      console.error('🚨 Error using reward:', error);
      toast({
        title: t('toast.error.title'),
        description: t('rewards.use_error'),
        variant: 'destructive',
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: string, category: string) => {
    switch (type) {
      case 'discount':
        return <Ticket className="h-5 w-5" />;
      case 'free_item':
        return <Gift className="h-5 w-5" />;
      case 'upgrade':
        return <Star className="h-5 w-5" />;
      case 'experience':
        return <Sparkles className="h-5 w-5" />;
      default:
        if (category === 'restaurant') return <Utensils className="h-5 w-5" />;
        if (category === 'cafe') return <Coffee className="h-5 w-5" />;
        return <ShoppingBag className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discount':
        return getRewardTranslation('type_discount');
      case 'free_item':
        return getRewardTranslation('type_free_item');
      case 'upgrade':
        return getRewardTranslation('type_upgrade');
      case 'experience':
        return getRewardTranslation('type_experience');
      case 'freebie':
        return getRewardTranslation('type_freebie');
      default:
        return type || getRewardTranslation('type_default');
    }
  };

  const canRedeem = (reward: Reward) => {
    if (!profile) return false;
    if (!reward.points_required || (profile.total_points || 0) < reward.points_required) return false;
    
    // Check stats if available
    const stats = rewardStats.get(reward.id);
    if (stats) {
      return stats.can_redeem;
    }
    
    return true;
  };

  // Filter rewards based on geographical selection and search
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = !searchTerm || 
      reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.partner.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = selectedCountry === 'all' || 
      reward.partner.city?.country_id === selectedCountry;
    
    const matchesCity = selectedCity === 'all' || 
      reward.partner.city_id === selectedCity;

    return matchesSearch && matchesCountry && matchesCity;
  });

  const handleClearFilters = () => {
    setSelectedCountry('all');
    setSelectedCity('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <StandardPageLayout
        title={t('rewards.title')}
        showBackButton={true}
        containerClassName="space-y-6"
      >
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={t('rewards.title')}
      showBackButton={true}
      containerClassName="space-y-8"
    >
      {/* Header avec points */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('rewards.title')}</h1>
        <p className="text-xl text-muted-foreground mb-6">
          {t('rewards.subtitle')}
        </p>
        {profile && (
          <div className="space-y-4">
            <Card className="w-fit mx-auto">
              <CardContent className="flex items-center gap-4 p-6">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{profile.total_points}</div>
                  <div className="text-sm text-muted-foreground">{t('rewards.points_available')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="store">
            {currentLanguage === 'en' ? 'Rewards Store' : currentLanguage === 'de' ? 'Belohnungsshop' : 'Boutique de Récompenses'}
          </TabsTrigger>
          <TabsTrigger value="earned">
            {currentLanguage === 'en' ? 'My Earned Rewards' : currentLanguage === 'de' ? 'Meine Verdienten Belohnungen' : 'Mes Récompenses Gagnées'}
          </TabsTrigger>
        </TabsList>

        {/* Onglet Rewards Store */}
        <TabsContent value="store" className="space-y-6">
          {/* Geographical Filters */}
          <GeographicalFilters
            countries={countries}
            cities={cities}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            searchTerm={searchTerm}
            onCountryChange={setSelectedCountry}
            onCityChange={setSelectedCity}
            onSearchChange={setSearchTerm}
            onClearFilters={handleClearFilters}
            language={currentLanguage}
            className="mb-8"
          />

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const isAvailable = canRedeem(reward);
              const hasGPSLocation = reward.partner.latitude && reward.partner.longitude;
              
              const openGoogleMaps = () => {
                if (reward.partner.latitude && reward.partner.longitude) {
                  // Use GPS coordinates if available
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${reward.partner.latitude},${reward.partner.longitude}&travelmode=walking`;
                  window.open(url, '_blank');
                } else if (reward.partner.address) {
                  // Fallback to address
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reward.partner.address)}&travelmode=walking`;
                  window.open(url, '_blank');
                } else {
                  toast({
                    title: t('toast.error.title'),
                    description: t('partner.location_unavailable'),
                    variant: 'destructive',
                  });
                }
              };
              
              return (
                <Card key={reward.id} className={`overflow-hidden max-w-sm ${
                  !isAvailable ? 'opacity-60' : 'hover:shadow-lg'
                } transition-all duration-200`}>
                  <CardContent className="p-6">
                    {/* Partner Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          {reward.partner.logo_url ? (
                            <img 
                              src={reward.partner.logo_url} 
                              alt={reward.partner.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{reward.partner.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.partner.category}</p>
                        </div>
                      </div>
                      {hasGPSLocation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openGoogleMaps}
                          className="text-xs"
                        >
                          <Navigation className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm">{reward.description}</p>
                    
                    {/* Address and City Tag */}
                    <div className="space-y-2">
                      {reward.partner.address && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{reward.partner.address}</span>
                        </div>
                      )}
                      {reward.partner.city && (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${getCityBadgeColor(reward.partner.city.name)}`}
                          >
                            {reward.partner.city.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{reward.points_required} points</span>
                      </div>
                      {reward.value_chf && (
                        <span className="text-green-600 font-medium">
                          {reward.value_chf} CHF
                        </span>
                      )}
                    </div>
                    
                                         <Button
                       className="w-full mt-4"
                       disabled={!isAvailable || redeeming === reward.id}
                       onClick={() => redeemReward(reward)}
                     >
                      {redeeming === reward.id ? (
                        t('rewards.exchanging')
                      ) : isAvailable ? (
                        t('rewards.exchange')
                      ) : profile && reward.points_required && (profile.total_points || 0) < reward.points_required ? (
                        t('rewards.points_missing', { missing: reward.points_required - (profile.total_points || 0) })
                      ) : (
                        t('rewards.not_available')
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Onglet My Earned Rewards */}
        <TabsContent value="earned" className="space-y-6">
          {/* Sous-onglets pour My Earned Rewards */}
          <Tabs defaultValue="to-validate" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="to-validate">
                {currentLanguage === 'en' ? 'To Validate' : currentLanguage === 'de' ? 'Zu Validieren' : 'À valider'}
              </TabsTrigger>
              <TabsTrigger value="transformed">
                {currentLanguage === 'en' ? 'Transformed' : currentLanguage === 'de' ? 'Transformiert' : 'Transformés'}
              </TabsTrigger>
            </TabsList>

            {/* Sous-onglet 1: À valider (vouchers à utiliser) */}
            <TabsContent value="to-validate" className="space-y-4">
              {pendingRedemptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRedemptions.map((redemption) => (
                    <Card key={redemption.id} className="border-blue-200 bg-blue-50/30 max-w-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Gift className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{redemption.reward.title}</h3>
                              <p className="text-xs text-muted-foreground">{redemption.reward.partner.name}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {currentLanguage === 'en' ? 'Pending' : currentLanguage === 'de' ? 'Ausstehend' : 'En attente'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {currentLanguage === 'en' ? 'Type' : currentLanguage === 'de' ? 'Typ' : 'Type'}
                            </p>
                            <p className="text-sm font-medium">{getRewardTranslation(`type_${redemption.reward.type || 'default'}`)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {currentLanguage === 'en' ? 'Value' : currentLanguage === 'de' ? 'Wert' : 'Valeur'}
                            </p>
                            <p className="text-sm font-medium text-green-600">{redemption.reward.value_chf} CHF</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {currentLanguage === 'en' ? 'Points spent' : currentLanguage === 'de' ? 'Punkte ausgegeben' : 'Points dépensés'}
                            </p>
                            <p className="text-sm font-medium text-red-600">-{redemption.points_spent} pts</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {currentLanguage === 'en' ? 'Code' : currentLanguage === 'de' ? 'Code' : 'Code'}
                            </p>
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {redemption.redemption_code}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {currentLanguage === 'en' ? 'Expires on' : currentLanguage === 'de' ? 'Läuft ab am' : 'Expire le'}: {redemption.expires_at ? new Date(redemption.expires_at).toLocaleDateString(currentLanguage) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {currentLanguage === 'en' ? 'Redeemed on' : currentLanguage === 'de' ? 'Eingelöst am' : 'Échangé le'}: {new Date(redemption.created_at).toLocaleDateString(currentLanguage)}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700 text-sm"
                          onClick={() => handleUseReward(redemption)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {currentLanguage === 'en' ? 'Use now' : currentLanguage === 'de' ? 'Jetzt verwenden' : 'Utiliser maintenant'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {currentLanguage === 'en' ? 'No rewards to validate yet' : currentLanguage === 'de' ? 'Noch keine Belohnungen zu validieren' : 'Aucune récompense à valider'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {currentLanguage === 'en' ? 'Exchange rewards from the store to see them here!' : currentLanguage === 'de' ? 'Tauschen Sie Belohnungen aus dem Shop ein, um sie hier zu sehen!' : 'Échangez des récompenses depuis la boutique pour les voir ici !'}
                    </p>
                    <Button onClick={() => setActiveTab('store')}>
                      {currentLanguage === 'en' ? 'Browse Rewards Store' : currentLanguage === 'de' ? 'Belohnungsshop durchsuchen' : 'Parcourir la boutique'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

                          {/* Sous-onglet 2: Transformés (historique) */}
              <TabsContent value="transformed" className="space-y-4">
                {(usedRedemptions.length > 0 || expiredRedemptions.length > 0) ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{t('rewards.my_exchanges')}</h2>
                  
                                      {/* Récompenses utilisées */}
                    {usedRedemptions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-700">
                          {currentLanguage === 'en' ? 'Used Rewards' : currentLanguage === 'de' ? 'Verwendete Belohnungen' : 'Récompenses utilisées'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {usedRedemptions.map((redemption) => (
                          <Card key={redemption.id} className="border-green-200 bg-green-50/30 max-w-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-sm">{redemption.reward.title}</h3>
                                    <p className="text-xs text-muted-foreground">{redemption.reward.partner.name}</p>
                                  </div>
                                </div>
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {currentLanguage === 'en' ? 'Used' : currentLanguage === 'de' ? 'Verwendet' : 'Utilisé'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Type' : currentLanguage === 'de' ? 'Typ' : 'Type'}
                                  </p>
                                  <p className="text-sm font-medium">{getRewardTranslation(`type_${redemption.reward.type || 'default'}`)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Value' : currentLanguage === 'de' ? 'Wert' : 'Valeur'}
                                  </p>
                                  <p className="text-sm font-medium text-green-600">{redemption.reward.value_chf} CHF</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Points spent' : currentLanguage === 'de' ? 'Punkte ausgegeben' : 'Points dépensés'}
                                  </p>
                                  <p className="text-sm font-medium text-red-600">-{redemption.points_spent} pts</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Code' : currentLanguage === 'de' ? 'Code' : 'Code'}
                                  </p>
                                  <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                    {redemption.redemption_code}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {currentLanguage === 'en' ? 'Expires on' : currentLanguage === 'de' ? 'Läuft ab am' : 'Expire le'}: {redemption.expires_at ? new Date(redemption.expires_at).toLocaleDateString(currentLanguage) : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>
                                    {currentLanguage === 'en' ? 'Used 1/1 times' : currentLanguage === 'de' ? '1/1 mal verwendet' : 'Utilisé 1/1 fois'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {currentLanguage === 'en' ? 'Redeemed on' : currentLanguage === 'de' ? 'Eingelöst am' : 'Échangé le'}: {new Date(redemption.created_at).toLocaleDateString(currentLanguage)}
                                  </span>
                                </div>
                                {redemption.used_at && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>
                                      {currentLanguage === 'en' ? 'Used on' : currentLanguage === 'de' ? 'Verwendet am' : 'Utilisé le'}: {new Date(redemption.used_at).toLocaleDateString(currentLanguage)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Récompenses expirées */}
                  {expiredRedemptions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-700">
                        {currentLanguage === 'en' ? 'Expired Rewards' : currentLanguage === 'de' ? 'Abgelaufene Belohnungen' : 'Récompenses expirées'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {expiredRedemptions.map((redemption) => (
                          <Card key={redemption.id} className="border-red-200 bg-red-50/30 max-w-sm">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-sm">{redemption.reward.title}</h3>
                                    <p className="text-xs text-muted-foreground">{redemption.reward.partner.name}</p>
                                  </div>
                                </div>
                                <Badge variant="destructive" className="text-xs">
                                  {t(`rewards.status.${redemption.status}`)}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Type' : currentLanguage === 'de' ? 'Typ' : 'Type'}
                                  </p>
                                  <p className="text-sm font-medium">{getRewardTranslation(`type_${redemption.reward.type || 'default'}`)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Value' : currentLanguage === 'de' ? 'Wert' : 'Valeur'}
                                  </p>
                                  <p className="text-sm font-medium text-green-600">{redemption.reward.value_chf} CHF</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Points spent' : currentLanguage === 'de' ? 'Punkte ausgegeben' : 'Points dépensés'}
                                  </p>
                                  <p className="text-sm font-medium text-red-600">-{redemption.points_spent} pts</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {currentLanguage === 'en' ? 'Code' : currentLanguage === 'de' ? 'Code' : 'Code'}
                                  </p>
                                  <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                    {redemption.redemption_code}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {currentLanguage === 'en' ? 'Redeemed on' : currentLanguage === 'de' ? 'Eingelöst am' : 'Échangé le'}: {new Date(redemption.created_at).toLocaleDateString(currentLanguage)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {currentLanguage === 'en' ? 'No transformed rewards yet' : currentLanguage === 'de' ? 'Noch keine transformierten Belohnungen' : 'Aucune récompense transformée'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {currentLanguage === 'en' ? 'Your used and validated rewards will appear here!' : currentLanguage === 'de' ? 'Ihre verwendeten und validierten Belohnungen werden hier angezeigt!' : 'Vos récompenses utilisées et validées apparaîtront ici !'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
};

export default RewardsPage;
