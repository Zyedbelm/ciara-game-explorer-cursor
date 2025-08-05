import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { StandardPageLayout } from '@/components/layout';
import RewardVoucherCard from '@/components/rewards/RewardVoucherCard';
import GeographicalFilters from '@/components/common/GeographicalFilters';
import { 
  Gift, 
  Trophy,
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Package,
  Archive,
  ArrowLeft
} from 'lucide-react';

interface RewardVoucher {
  id: string;
  reward_id: string;
  user_id: string;
  redemption_code: string;
  points_spent: number;
  status: 'pending' | 'used' | 'expired';
  redeemed_at: string;
  used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  reward: {
    id: string;
    title: string;
    title_en?: string;
    title_de?: string;
    description?: string;
    description_en?: string;
    description_de?: string;
    type: string;
    value_chf?: number;
    image_url?: string;
    partner: {
      id: string;
      name: string;
      category: string;
      email?: string;
      city_id?: string;
      city?: {
        id: string;
        name: string;
        country_id: string;
      };
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

const MyRewardsPage = () => {
  const [vouchers, setVouchers] = useState<RewardVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [retrying, setRetrying] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // Memoize filtered vouchers for performance - MUST be before any conditional returns
  const { activeVouchers, usedVouchers, expiredVouchers, totalPointsSpent, totalValueRedeemed } = useMemo(() => {
    const now = new Date();
    
    // First apply geographical and search filters
    const filteredVouchers = vouchers.filter(voucher => {
      const matchesSearch = !searchTerm || 
        voucher.reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.reward.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.reward.partner.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = selectedCountry === 'all' || 
        voucher.reward.partner.city?.country_id === selectedCountry;
      
      const matchesCity = selectedCity === 'all' || 
        voucher.reward.partner.city_id === selectedCity;

      return matchesSearch && matchesCountry && matchesCity;
    });
    
    // Then filter by status and expiration
    const active = filteredVouchers.filter(v => {
      if (v.status !== 'pending') return false;
      // Check if voucher has expired based on expires_at column
      if (v.expires_at && new Date(v.expires_at) < now) return false;
      return true;
    });
    
    const used = filteredVouchers.filter(v => v.status === 'used');
    
    // Include both explicitly expired vouchers and those that have passed their expires_at date
    const expired = filteredVouchers.filter(v => {
      if (v.status === 'expired') return true;
      if (v.status === 'pending' && v.expires_at && new Date(v.expires_at) < now) return true;
      return false;
    });

    const pointsSpent = filteredVouchers.reduce((sum, v) => sum + v.points_spent, 0);
    const valueRedeemed = filteredVouchers.reduce((sum, v) => 
      sum + (v.reward.value_chf || 0), 0
    );

    return {
      activeVouchers: active,
      usedVouchers: used,
      expiredVouchers: expired,
      totalPointsSpent: pointsSpent,
      totalValueRedeemed: valueRedeemed
    };
  }, [vouchers, searchTerm, selectedCountry, selectedCity]);

  const fetchVouchers = useCallback(async () => {
    if (!profile?.user_id) return;

    try {
      setLoading(true);
      setError(null);

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
              cities(id, name, country_id)
            )
          )
        `)
        .eq('user_id', profile.user_id)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the interface
      const transformedVouchers = (data || []).map(voucher => ({
        ...voucher,
        reward: {
          ...voucher.reward,
          partner: {
            ...voucher.reward.partner,
            city: voucher.reward.partner.cities
          }
        }
      }));

      setVouchers(transformedVouchers as RewardVoucher[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('rewards.error.loading');
      setError(errorMessage);
      toast({
        title: t('toast.error.title'),
        description: t('rewards.error.loading'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id, t, toast]);

  const handleVoucherStatusChange = useCallback((voucherId: string, newStatus: string) => {
    setVouchers(prevVouchers => prevVouchers.map(voucher => 
      voucher.id === voucherId 
        ? { ...voucher, status: newStatus as any }
        : voucher
    ));
  }, []);

  const fetchCountries = useCallback(async () => {
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
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, country_id')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
      console.warn('Error fetching cities:', err);
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCountry('all');
    setSelectedCity('all');
    setSearchTerm('');
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchVouchers(),
        fetchCountries(),
        fetchCities()
      ]);
    };
    
    loadData();
  }, [profile?.user_id, fetchVouchers, fetchCountries, fetchCities]);

  if (!profile) {
    return (
      <StandardPageLayout
        title={t('rewards.my_rewards.title')}
        showBackButton={true}
      >
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg">{t('common.login_required')}</p>
            </div>
          </CardContent>
        </Card>
      </StandardPageLayout>
    );
  }


  return (
    <StandardPageLayout
      title={t('rewards.my_rewards.title')}
      subtitle={t('rewards.my_rewards.subtitle')}
      showBackButton={true}
      containerClassName="space-y-8"
    >
      {/* Statistics */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{activeVouchers.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('rewards.stats.active')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{usedVouchers.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('rewards.stats.used')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{totalPointsSpent}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('rewards.stats.points')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Gift className="h-5 w-5 md:h-6 md:w-6 text-orange-600 mx-auto mb-1" />
            <div className="text-lg md:text-xl font-bold">{totalValueRedeemed.toFixed(0)}</div>
            <div className="text-xs md:text-sm text-muted-foreground leading-tight">{t('rewards.stats.chf')}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>{t('common.loading')}</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-lg">{error}</p>
              <Button onClick={fetchVouchers} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
            className="mb-6"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <TabsList className="grid w-full max-w-xs grid-cols-3 h-12">
              <TabsTrigger value="active" className="flex items-center justify-center p-2">
                <Clock className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="used" className="flex items-center justify-center p-2">
                <CheckCircle className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center justify-center p-2">
                <Archive className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>
            
            {/* Titres sous les onglets */}
            <div className="grid grid-cols-3 max-w-xs text-center">
              <div className={`text-xs px-2 transition-colors ${activeTab === 'active' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {t('rewards.tabs.active')} ({activeVouchers.length})
              </div>
              <div className={`text-xs px-2 transition-colors ${activeTab === 'used' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {t('rewards.tabs.used')} ({usedVouchers.length})
              </div>
              <div className={`text-xs px-2 transition-colors ${activeTab === 'expired' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {t('rewards.tabs.expired')} ({expiredVouchers.length})
              </div>
            </div>
          </div>

          <TabsContent value="active">
            {activeVouchers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{t('rewards.empty.active_title')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('rewards.empty.active_description')}
                    </p>
                    <Button asChild>
                      <a href="/rewards">
                        <Gift className="h-4 w-4 mr-2" />
                        {t('common.discover_rewards')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeVouchers.map((voucher) => (
                  <RewardVoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    onStatusChange={handleVoucherStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="used">
            {usedVouchers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{t('rewards.empty.used_title')}</h3>
                    <p className="text-muted-foreground">
                      {t('rewards.empty.used_description')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usedVouchers.map((voucher) => (
                  <RewardVoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    onStatusChange={handleVoucherStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired">
            {expiredVouchers.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">{t('rewards.empty.expired_title')}</h3>
                    <p className="text-muted-foreground">
                      {t('rewards.empty.expired_description')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredVouchers.map((voucher) => (
                  <RewardVoucherCard
                    key={voucher.id}
                    voucher={{...voucher, status: 'expired'}}
                    onStatusChange={handleVoucherStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </>
      )}
    </StandardPageLayout>
  );
};

export default MyRewardsPage;