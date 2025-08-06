import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, MapPin, Target, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  heatmapData: HeatmapPoint[];
  insights: InsightData[];
  trends: TrendData[];
  demographics: DemographicData;
}

interface HeatmapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  visits: number;
  completions: number;
  averageTime: number;
  popularity: 'high' | 'medium' | 'low';
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  value: string;
  trend: number;
  category: 'engagement' | 'retention' | 'growth' | 'performance';
}

interface TrendData {
  period: string;
  visitors: number;
  completions: number;
  averagePoints: number;
  satisfaction: number;
}

interface DemographicData {
  ageGroups: { range: string; percentage: number }[];
  interests: { category: string; percentage: number }[];
  devices: { type: string; percentage: number }[];
}

const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simuler des données d'analytics avancées
      const heatmapData: HeatmapPoint[] = [
        {
          id: '1',
          name: 'Château de Sion',
          latitude: 46.2326,
          longitude: 7.3586,
          visits: 324,
          completions: 287,
          averageTime: 45,
          popularity: 'high'
        },
        {
          id: '2',
          name: 'Cathédrale Notre-Dame',
          latitude: 46.2315,
          longitude: 7.3597,
          visits: 156,
          completions: 134,
          averageTime: 25,
          popularity: 'medium'
        },
        {
          id: '3',
          name: 'Musée d\'histoire',
          latitude: 46.2308,
          longitude: 7.3612,
          visits: 89,
          completions: 67,
          averageTime: 35,
          popularity: 'low'
        }
      ];

      const insights: InsightData[] = [
        {
          id: '1',
          title: 'Augmentation du taux de complétion',
          description: 'Le taux de complétion des parcours a augmenté de 15% cette semaine',
          impact: 'positive',
          value: '+15%',
          trend: 15,
          category: 'engagement'
        },
        {
          id: '2',
          title: 'Pics d\'affluence le weekend',
          description: 'L\'activité est 3x plus importante les weekends',
          impact: 'neutral',
          value: '3x',
          trend: 0,
          category: 'performance'
        },
        {
          id: '3',
          title: 'Diminution du temps moyen par étape',
          description: 'Les visiteurs passent moins de temps sur chaque étape',
          impact: 'negative',
          value: '-12%',
          trend: -12,
          category: 'retention'
        }
      ];

      const trends: TrendData[] = [
        { period: 'Lun', visitors: 45, completions: 32, averagePoints: 67, satisfaction: 4.2 },
        { period: 'Mar', visitors: 52, completions: 41, averagePoints: 73, satisfaction: 4.3 },
        { period: 'Mer', visitors: 38, completions: 29, averagePoints: 58, satisfaction: 4.1 },
        { period: 'Jeu', visitors: 67, completions: 54, averagePoints: 81, satisfaction: 4.4 },
        { period: 'Ven', visitors: 89, completions: 76, averagePoints: 94, satisfaction: 4.5 },
        { period: 'Sam', visitors: 134, completions: 112, averagePoints: 128, satisfaction: 4.6 },
        { period: 'Dim', visitors: 156, completions: 134, averagePoints: 142, satisfaction: 4.7 }
      ];

      const demographics: DemographicData = {
        ageGroups: [
          { range: '18-24', percentage: 22 },
          { range: '25-34', percentage: 35 },
          { range: '35-44', percentage: 28 },
          { range: '45-54', percentage: 12 },
          { range: '55+', percentage: 3 }
        ],
        interests: [
          { category: 'Histoire', percentage: 45 },
          { category: 'Gastronomie', percentage: 32 },
          { category: 'Nature', percentage: 28 },
          { category: 'Art', percentage: 18 },
          { category: 'Sport', percentage: 12 }
        ],
        devices: [
          { type: 'Mobile', percentage: 78 },
          { type: 'Tablette', percentage: 16 },
          { type: 'Desktop', percentage: 6 }
        ]
      };

      setAnalytics({
        heatmapData,
        insights,
        trends,
        demographics
      });

    } catch (error) {
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const exportData = () => {
    toast.success('Rapport d\'analytics exporté');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics Avancées</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Avancées</h2>
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
          </select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="demographics">Démographie</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Heat Map des Points d'Intérêt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.heatmapData.map((point) => (
                  <Card key={point.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-sm">{point.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${getPopularityColor(point.popularity)}`}></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Visites:</span>
                          <span className="font-medium">{point.visits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Complétions:</span>
                          <span className="font-medium">{point.completions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Temps moyen:</span>
                          <span className="font-medium">{point.averageTime}min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taux de réussite:</span>
                          <span className="font-medium">{Math.round((point.completions / point.visits) * 100)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getImpactColor(insight.impact)}`}>
                        {insight.value}
                      </div>
                      {insight.trend !== 0 && (
                        <div className={`text-sm flex items-center ${insight.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {Math.abs(insight.trend)}%
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendances Hebdomadaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium">{trend.period}</div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{trend.visitors}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>{trend.completions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        <span>{trend.averagePoints} pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                        <span>{trend.satisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Groupes d'âge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{group.range} ans</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Centres d'intérêt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.interests.map((interest, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{interest.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-secondary rounded-full" 
                            style={{ width: `${interest.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{interest.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appareils</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.devices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{device.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-accent rounded-full" 
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;