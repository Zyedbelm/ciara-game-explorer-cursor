import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Navigation
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
  status: 'pending' | 'validated' | 'expired';
  reward: Reward;
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
      // Step 1: Get redemptions first with simpler query
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      if (redemptionsError) {
        throw redemptionsError;
      }

      if (!redemptionsData || redemptionsData.length === 0) {
        setRedemptions([]);
        return;
      }

      // Step 2: Get related rewards and partners data separately
      const rewardIds = [...new Set(redemptionsData.map(r => r.reward_id))];
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select(`
          *,
          partners (
            id, 
            name, 
            category, 
            email, 
            city_id,
            logo_url,
            address,
            latitude,
            longitude
          )
        `)
        .in('id', rewardIds);

      if (rewardsError) {
        throw rewardsError;
      }

      // Step 3: Create a map for efficient lookup
      const rewardsMap = new Map();
      (rewardsData || []).forEach(reward => {
        rewardsMap.set(reward.id, {
          ...reward,
          partner: reward.partners
        });
      });

      // Step 4: Transform redemptions with complete reward data
      const transformedRedemptions = redemptionsData.map(redemption => {
        const rewardData = rewardsMap.get(redemption.reward_id);
        
        if (!rewardData) {
        }
        
        return {
          ...redemption,
          status: (redemption.status as 'pending' | 'validated' | 'expired') || 'pending',
          reward: rewardData || null
        };
      }).filter(redemption => redemption.reward !== null); // Filter out redemptions without reward data

      // Filter out redemptions without reward data
      
      setRedemptions(transformedRedemptions);
      
    } catch (error) {
      console.error('🚨 Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
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
      {/* Header */}
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
              
            {/* Bouton pour voir ses récompenses avec notification badge */}
            <div className="flex justify-center">
              <Button 
                asChild 
                variant={pendingRewardsCount > 0 ? "default" : "outline"}
                className={`w-fit relative ${pendingRewardsCount > 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                <Link to="/my-rewards">
                  <QrCode className="h-4 w-4 mr-2" />
                  {t('common.my_rewards')}
                  {pendingRewardsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[1.25rem] bg-red-600"
                    >
                      {pendingRewardsCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Card key={reward.id} className={`overflow-hidden ${
              isAvailable ? 'hover:shadow-lg transition-shadow' : 'opacity-60'
            }`}>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRewardIcon(reward.type, reward.partner.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.partner.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isAvailable ? 'default' : 'secondary'}>
                      {getTypeLabel(reward.type)}
                    </Badge>
                    {/* Bouton localiser remonté ici */}
                    {hasGPSLocation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openGoogleMaps}
                        className="flex items-center gap-1 px-2"
                      >
                        <Navigation className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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

                 {/* Validity Period */}
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Clock className="h-4 w-4" />
                   <span>{getRewardTranslation('valid_days', { days: reward.validity_days || 30 })}</span>
                 </div>

                 {/* Personal Redemption Limit Only - UPDATED SECTION */}
                 {(() => {
                   const stats = rewardStats.get(reward.id);
                   // Always show personal limit info if it exists
                   if (reward.max_redemptions_per_user) {
                     const used = stats?.user_redemptions || 0;
                     const total = reward.max_redemptions_per_user;
                     
                     return (
                       <div className="text-sm text-muted-foreground">
                         {getRewardTranslation('usage_count', { used, total })}
                       </div>
                     );
                   }
                   
                   return null;
                 })()}

              </CardHeader>

              <CardContent>
                <Button
                  onClick={() => redeemReward(reward)}
                  disabled={!isAvailable || redeeming === reward.id}
                  className="w-full"
                  variant={isAvailable ? 'default' : 'secondary'}
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

      {/* Redemptions History */}
      {redemptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('rewards.my_exchanges')}</h2>
          <div className="grid gap-4">
            {redemptions.map((redemption) => (
              <Card key={redemption.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{redemption.reward.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('rewards.code', { code: redemption.redemption_code })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(redemption.created_at).toLocaleDateString(currentLanguage)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={
                      redemption.status === 'validated' ? 'default' :
                      redemption.status === 'expired' ? 'destructive' : 'secondary'
                    }>
                      {t(`rewards.status.${redemption.status}`)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('rewards.points_spent', { points: redemption.points_spent })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </StandardPageLayout>
  );
};

export default RewardsPage;
