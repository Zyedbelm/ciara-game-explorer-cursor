import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Users, Star, MapPin, Building2, BarChart3 } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PartnerStats {
  id: string;
  name: string;
  city: string;
  country: string;
  totalOffers: number;
  totalValue: number;
  usageCount: number;
  rating: number;
  lastActivity: string;
}

interface CityStats {
  id: string;
  name: string;
  country: string;
  totalPartners: number;
  totalOffers: number;
  totalValue: number;
  averageRating: number;
  usageByDay: Record<string, number>;
}

const PartnerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [partnerStats, setPartnerStats] = useState<PartnerStats[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [topPartners, setTopPartners] = useState<PartnerStats[]>([]);

  // Mock data pour démonstration
  const mockPartnerStats: PartnerStats[] = [
    {
      id: '1',
      name: 'Hôtel Beau-Rivage',
      city: 'Genève',
      country: 'Suisse',
      totalOffers: 15,
      totalValue: 2500,
      usageCount: 89,
      rating: 4.8,
      lastActivity: '2025-01-15'
    },
    {
      id: '2',
      name: 'Restaurant Le Chat-Botté',
      city: 'Genève',
      country: 'Suisse',
      totalOffers: 8,
      totalValue: 1200,
      usageCount: 67,
      rating: 4.6,
      lastActivity: '2025-01-14'
    },
    {
      id: '3',
      name: 'Musée d\'Art et d\'Histoire',
      city: 'Genève',
      country: 'Suisse',
      totalOffers: 12,
      totalValue: 800,
      usageCount: 45,
      rating: 4.7,
      lastActivity: '2025-01-13'
    },
    {
      id: '4',
      name: 'Château de Chillon',
      city: 'Montreux',
      country: 'Suisse',
      totalOffers: 20,
      totalValue: 3200,
      usageCount: 156,
      rating: 4.9,
      lastActivity: '2025-01-15'
    },
    {
      id: '5',
      name: 'Thermes de Lavey',
      city: 'Lausanne',
      country: 'Suisse',
      totalOffers: 6,
      totalValue: 900,
      usageCount: 34,
      rating: 4.5,
      lastActivity: '2025-01-12'
    }
  ];

  const mockCityStats: CityStats[] = [
    {
      id: '1',
      name: 'Genève',
      country: 'Suisse',
      totalPartners: 25,
      totalOffers: 180,
      totalValue: 28000,
      averageRating: 4.6,
      usageByDay: {
        '2025-01-01': 12,
        '2025-01-02': 15,
        '2025-01-03': 8,
        '2025-01-04': 22,
        '2025-01-05': 18,
        '2025-01-06': 25,
        '2025-01-07': 30,
        '2025-01-08': 20,
        '2025-01-09': 16,
        '2025-01-10': 19,
        '2025-01-11': 24,
        '2025-01-12': 28,
        '2025-01-13': 32,
        '2025-01-14': 26,
        '2025-01-15': 35
      }
    },
    {
      id: '2',
      name: 'Lausanne',
      country: 'Suisse',
      totalPartners: 18,
      totalOffers: 120,
      totalValue: 18000,
      averageRating: 4.4,
      usageByDay: {
        '2025-01-01': 8,
        '2025-01-02': 12,
        '2025-01-03': 6,
        '2025-01-04': 15,
        '2025-01-05': 14,
        '2025-01-06': 20,
        '2025-01-07': 25,
        '2025-01-08': 18,
        '2025-01-09': 12,
        '2025-01-10': 16,
        '2025-01-11': 19,
        '2025-01-12': 22,
        '2025-01-13': 28,
        '2025-01-14': 24,
        '2025-01-15': 30
      }
    },
    {
      id: '3',
      name: 'Montreux',
      country: 'Suisse',
      totalPartners: 12,
      totalOffers: 85,
      totalValue: 15000,
      averageRating: 4.7,
      usageByDay: {
        '2025-01-01': 5,
        '2025-01-02': 8,
        '2025-01-03': 4,
        '2025-01-04': 12,
        '2025-01-05': 10,
        '2025-01-06': 15,
        '2025-01-07': 18,
        '2025-01-08': 14,
        '2025-01-09': 9,
        '2025-01-10': 11,
        '2025-01-11': 13,
        '2025-01-12': 16,
        '2025-01-13': 20,
        '2025-01-14': 17,
        '2025-01-15': 22
      }
    }
  ];

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extraire les pays et villes uniques
      const uniqueCountries = [...new Set(mockPartnerStats.map(p => p.country))];
      const uniqueCities = [...new Set(mockPartnerStats.map(p => p.city))];
      
      setCountries(uniqueCountries);
      setCities(uniqueCities);
      setPartnerStats(mockPartnerStats);
      setCityStats(mockCityStats);
      
      // Top 3 partenaires
      const sortedPartners = [...mockPartnerStats].sort((a, b) => b.usageCount - a.usageCount);
      setTopPartners(sortedPartners.slice(0, 3));
      
      setLoading(false);
    };

    initializeData();
  }, []);

  // Filtrer les données selon les sélections
  const filteredPartnerStats = useMemo(() => {
    return partnerStats.filter(partner => {
      const countryMatch = selectedCountry === 'all' || partner.country === selectedCountry;
      const cityMatch = selectedCity === 'all' || partner.city === selectedCity;
      const partnerMatch = selectedPartner === 'all' || partner.id === selectedPartner;
      return countryMatch && cityMatch && partnerMatch;
    });
  }, [partnerStats, selectedCountry, selectedCity, selectedPartner]);

  const filteredCityStats = useMemo(() => {
    return cityStats.filter(city => {
      const countryMatch = selectedCountry === 'all' || city.country === selectedCountry;
      return countryMatch;
    });
  }, [cityStats, selectedCountry]);

  // Calculer les statistiques globales
  const globalStats = useMemo(() => {
    const totalPartners = filteredPartnerStats.length;
    const totalOffers = filteredPartnerStats.reduce((sum, p) => sum + p.totalOffers, 0);
    const totalValue = filteredPartnerStats.reduce((sum, p) => sum + p.totalValue, 0);
    const totalUsage = filteredPartnerStats.reduce((sum, p) => sum + p.usageCount, 0);
    const avgRating = totalPartners > 0 
      ? filteredPartnerStats.reduce((sum, p) => sum + p.rating, 0) / totalPartners 
      : 0;

    return { totalPartners, totalOffers, totalValue, totalUsage, avgRating };
  }, [filteredPartnerStats]);

  // Générer les données du heatmap
  const generateHeatmapData = () => {
    const data: Array<{ date: string; count: number }> = [];
    const today = new Date();
    
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const totalCount = filteredCityStats.reduce((sum, city) => {
        return sum + (city.usageByDay[dateStr] || 0);
      }, 0);
      
      data.push({ date: dateStr, count: totalCount });
    }
    
    return data;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du tableau de bord...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground mb-4">
                Vous devez être connecté pour accéder à cette page.
              </p>
              <Button asChild>
                <a href="/auth">Se connecter</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Partenaire</h1>
          <p className="text-muted-foreground">
            Tableau de bord des partenaires et offres - {profile.full_name || user.email}
          </p>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Filtres géographiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Pays</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Ville</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Partenaire</label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un partenaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les partenaires</SelectItem>
                    {filteredPartnerStats.map(partner => (
                      <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partenaires</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalPartners}</div>
              <p className="text-xs text-muted-foreground">
                Partenaires actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offres</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalOffers}</div>
              <p className="text-xs text-muted-foreground">
                Offres disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalValue.toLocaleString()} CHF</div>
              <p className="text-xs text-muted-foreground">
                Valeur des offres
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                Utilisations totales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="partners">Partenaires</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="top-partners">Top 3 Partenaires</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Heatmap Calendrier */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Utilisation par jour (15 derniers jours)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generateHeatmapData().map(({ date, count }) => (
                      <div key={date} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(date).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 rounded"
                            style={{
                              width: `${Math.max(20, count * 3)}px`,
                              backgroundColor: count > 20 ? '#22c55e' : count > 10 ? '#eab308' : '#ef4444'
                            }}
                          />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques par ville */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Statistiques par ville
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCityStats.map(city => (
                      <div key={city.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{city.name}</h4>
                          <p className="text-sm text-muted-foreground">{city.country}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{city.totalPartners} partenaires</div>
                          <div className="text-sm text-muted-foreground">
                            {city.totalOffers} offres • {city.totalValue.toLocaleString()} CHF
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partenaires */}
          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des partenaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPartnerStats.map(partner => (
                    <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{partner.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {partner.city}, {partner.country}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="font-medium">{partner.totalOffers}</div>
                          <div className="text-xs text-muted-foreground">Offres</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{partner.totalValue.toLocaleString()} CHF</div>
                          <div className="text-xs text-muted-foreground">Valeur</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{partner.usageCount}</div>
                          <div className="text-xs text-muted-foreground">Utilisations</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{partner.rating}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Note</div>
                        </div>
                        <Badge variant="secondary">
                          {new Date(partner.lastActivity).toLocaleDateString('fr-FR')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Répartition par ville
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredCityStats.map(city => {
                      const percentage = globalStats.totalOffers > 0 
                        ? (city.totalOffers / globalStats.totalOffers * 100).toFixed(1)
                        : 0;
                      return (
                        <div key={city.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{city.name}</span>
                            <span>{city.totalOffers} offres ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance des partenaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredPartnerStats
                      .sort((a, b) => b.usageCount - a.usageCount)
                      .slice(0, 5)
                      .map((partner, index) => (
                        <div key={partner.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{partner.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{partner.usageCount}</div>
                            <div className="text-xs text-muted-foreground">utilisations</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top 3 Partenaires */}
          <TabsContent value="top-partners" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPartners.map((partner, index) => (
                <Card key={partner.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        {partner.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {partner.city}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{partner.totalOffers}</div>
                        <div className="text-xs text-muted-foreground">Offres</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{partner.usageCount}</div>
                        <div className="text-xs text-muted-foreground">Utilisations</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Valeur totale:</span>
                        <span className="font-medium">{partner.totalValue.toLocaleString()} CHF</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Note moyenne:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{partner.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dernière activité:</span>
                        <span className="font-medium">
                          {new Date(partner.lastActivity).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerDashboard; 