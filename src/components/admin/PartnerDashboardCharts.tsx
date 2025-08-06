import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Star, Award, Calendar, Activity } from 'lucide-react';

interface ChartData {
  date: string;
  count: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface PartnerStats {
  id: string;
  name: string;
  totalRedemptions: number;
  totalValue: number;
  totalOffers: number;
}

interface PartnerDashboardChartsProps {
  dailyData: ChartData[];
  monthlyData: MonthlyData[];
  partnerStats: PartnerStats[];
  cityStats: Array<{
    name: string;
    totalRedemptions: number;
    totalValue: number;
  }>;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const PartnerDashboardCharts: React.FC<PartnerDashboardChartsProps> = ({
  dailyData,
  monthlyData,
  partnerStats,
  cityStats
}) => {
  // Préparer les données pour le graphique en secteurs des partenaires
  const pieData = partnerStats.slice(0, 6).map((partner, index) => ({
    name: partner.name,
    value: partner.totalRedemptions,
    color: COLORS[index % COLORS.length]
  }));

  // Préparer les données pour le graphique en barres des villes
  const cityBarData = cityStats.map(city => ({
    name: city.name,
    redemptions: city.totalRedemptions,
    value: city.totalValue
  }));

  return (
    <div className="space-y-6">
      {/* Graphique linéaire - Utilisation quotidienne */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Utilisation quotidienne (30 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
                formatter={(value: any) => [`${value} utilisations`, 'Utilisations']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique en barres - Utilisation mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            Utilisation mensuelle (12 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('fr-FR', { month: 'short' })}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
                formatter={(value: any) => [`${value} utilisations`, 'Utilisations']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique en secteurs - Top partenaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Répartition des utilisations par partenaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} utilisations`, 'Utilisations']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique en barres - Performance par ville */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Performance par ville
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityBarData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'redemptions' ? `${value} utilisations` : `${value} CHF`, 
                    name === 'redemptions' ? 'Utilisations' : 'Valeur'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="redemptions" 
                  fill="#F59E0B" 
                  radius={[0, 4, 4, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Graphique en aire - Évolution de la valeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Évolution de la valeur des offres utilisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
                formatter={(value: any) => [`${value} CHF`, 'Valeur']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#F59E0B" 
                fill="#F59E0B" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboardCharts; 