import React, { useState, useEffect } from 'react';
import CountryFilters from '@/components/admin/CountryFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gift, 
  Edit, 
  Eye, 
  EyeOff,
  Trophy,
  DollarSign,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description?: string;
  type: string;
  points_required: number;
  value_chf?: number;
  is_active: boolean;
  max_redemptions?: number;
  max_redemptions_per_user?: number;
  validity_days?: number;
  image_url?: string;
  partner_id?: string;
  partner?: {
    name: string;
    city_id?: string;
    city?: {
      name: string;
      country_id: string;
      countries?: {
        name_fr: string;
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

interface RewardStats {
  total_redemptions: number;
  max_redemptions?: number;
  user_redemptions: number;
  max_redemptions_per_user?: number;
  can_redeem: boolean;
}

const RewardsManagement = () => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [rewardStats, setRewardStats] = useState<Map<string, RewardStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const { toast } = useToast();

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('rewards')
        .select(`
          *,
          partner:partners(
            name,
            city_id,
            city:cities(
              name,
              country_id,
              countries(name_fr)
            )
          )
        `)
        .order('points_required', { ascending: true });

      if (error) throw error;

      const rewardsData = data || [];
      setRewards(rewardsData);

      // Fetch statistics for all rewards
      if (rewardsData.length > 0) {
        await fetchRewardStats(rewardsData.map(r => r.id));
      }
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

  const fetchRewardStats = async (rewardIds: string[]) => {
    try {
      const statsPromises = rewardIds.map(async (rewardId) => {
        const { data, error } = await supabase.rpc('get_reward_redemption_stats', {
          p_reward_id: rewardId
        });

        if (error) throw error;
        return { rewardId, stats: data[0] };
      });

      const results = await Promise.all(statsPromises);
      const statsMap = new Map<string, RewardStats>();
      
      results.forEach(({ rewardId, stats }) => {
        if (stats) {
          statsMap.set(rewardId, stats);
        }
      });

      setRewardStats(statsMap);
    } catch (err) {
      console.error('Error fetching reward stats:', err);
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
      console.error('Error fetching countries:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, country_id')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setSelectedCity('all');
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

  useEffect(() => {
    fetchRewards();
    fetchCountries();
    fetchCities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gestion des Récompenses
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
            Gestion des Récompenses
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

  // Logique de filtrage
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reward.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reward.partner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = selectedCountry === 'all' || 
                          (reward.partner?.city?.countries?.name_fr === countries.find(c => c.id === selectedCountry)?.name_fr);
    
    const matchesCity = selectedCity === 'all' || 
                       (reward.partner?.city?.name === cities.find(c => c.id === selectedCity)?.name);
    
    return matchesSearch && matchesCountry && matchesCity;
  });

  const activeRewards = filteredRewards.filter(r => r.is_active);
  const inactiveRewards = filteredRewards.filter(r => !r.is_active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Gestion des Récompenses
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchRewards}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{activeRewards.length}</div>
                <div className="text-sm text-green-600">Récompenses actives</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{inactiveRewards.length}</div>
                <div className="text-sm text-gray-600">Récompenses désactivées</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredRewards.length}</div>
                <div className="text-sm text-blue-600">Total récompenses</div>
              </div>
            </div>

            {/* Active Rewards */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                Récompenses Actives ({activeRewards.length})
              </h3>
              
              {activeRewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune récompense active
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeRewards.map((reward) => (
                    <Card key={reward.id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{reward.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {reward.description}
                            </p>
                            {reward.partner && (
                              <p className="text-xs text-blue-600 mt-1">
                                {reward.partner.name} {reward.partner.city?.name && `• ${reward.partner.city.name}`}
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={reward.is_active}
                            onCheckedChange={(checked) => toggleRewardStatus(reward.id, checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{reward.points_required}</span>
                          </div>
                          
                          {reward.value_chf && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{reward.value_chf} CHF</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <Badge variant="secondary" className="text-xs">
                            {reward.type}
                          </Badge>
                          
                          {/* Real-time Redemption Stats */}
                          {(() => {
                            const stats = rewardStats.get(reward.id);
                            return (
                              <div className="space-y-1">
                                {reward.max_redemptions && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="font-medium">Global:</span>
                                    <span className="font-mono">
                                      {stats?.total_redemptions || 0}/{reward.max_redemptions}
                                    </span>
                                    {stats && reward.max_redemptions && stats.total_redemptions >= reward.max_redemptions * 0.8 && (
                                      <Badge variant="destructive" className="text-xs px-1 py-0">Limite proche</Badge>
                                    )}
                                  </div>
                                )}
                                {reward.max_redemptions_per_user && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span className="font-medium">Personnel:</span>
                                    <span>{reward.max_redemptions_per_user} max par utilisateur</span>
                                  </div>
                                )}
                                {reward.validity_days && (
                                  <div className="text-xs text-muted-foreground">
                                    Validité: {reward.validity_days} jours
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Inactive Rewards */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-gray-500" />
                Récompenses Désactivées ({inactiveRewards.length})
              </h3>
              
              {inactiveRewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune récompense désactivée
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {inactiveRewards.slice(0, 12).map((reward) => (
                    <Card key={reward.id} className="border-gray-200 opacity-60">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm truncate">{reward.title}</h4>
                          <Switch
                            checked={reward.is_active}
                            onCheckedChange={(checked) => toggleRewardStatus(reward.id, checked)}
                          />
                        </div>
                        
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
                        
                        {reward.partner && (
                          <div className="text-xs text-blue-600 mt-1 truncate">
                            {reward.partner.name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {inactiveRewards.length > 12 && (
                    <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed border-gray-200 rounded-lg">
                      +{inactiveRewards.length - 12} autres récompenses désactivées
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsManagement;