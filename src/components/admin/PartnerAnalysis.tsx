import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Building2, 
  Star, 
  Award, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  Target
} from 'lucide-react';

interface PartnerAnalysisProps {
  partnerId: string;
  partnerStats: any[];
  allRedemptions: any[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const PartnerAnalysis: React.FC<PartnerAnalysisProps> = ({
  partnerId,
  partnerStats,
  allRedemptions
}) => {
  const partner = partnerStats.find(p => p.id === partnerId);
  if (!partner) return null;

  // Récupérer toutes les redemptions pour ce partenaire
  const partnerRedemptions = allRedemptions.filter(r => 
    r.rewards?.partner_id === partnerId
  ) || [];

  // Analyse par jour
  const usageByDay: Record<string, number> = {};
  partnerRedemptions.forEach(redemption => {
    const date = new Date(redemption.redeemed_at).toISOString().split('T')[0];
    usageByDay[date] = (usageByDay[date] || 0) + 1;
  });

  // Analyse par heure
  const usageByHour: Record<number, number> = {};
  partnerRedemptions.forEach(redemption => {
    const hour = new Date(redemption.redeemed_at).getHours();
    usageByHour[hour] = (usageByHour[hour] || 0) + 1;
  });

  // Analyse par type d'offre
  const usageByOffer: Record<string, number> = {};
  partnerRedemptions.forEach(redemption => {
    const offerTitle = redemption.rewards?.title || 'Offre inconnue';
    usageByOffer[offerTitle] = (usageByOffer[offerTitle] || 0) + 1;
  });

  // Classement des meilleures offres
  const topOffers = Object.entries(usageByOffer)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Classement des utilisations par jour
  const topDays = Object.entries(usageByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Données pour le graphique par heure
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}h`,
    count: usageByHour[hour] || 0
  }));

  // Données pour le graphique par jour (30 derniers jours)
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: usageByDay[dateStr] || 0
    };
  }).reverse();

  // Données pour le camembert des offres
  const pieData = topOffers.map((offer, index) => ({
    name: offer.title,
    value: offer.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* En-tête du partenaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Analyse détaillée : {partner.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{partner.totalRedemptions}</div>
              <div className="text-sm text-blue-600">Utilisations totales</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{partner.totalOffers}</div>
              <div className="text-sm text-green-600">Offres disponibles</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{partner.totalValue.toLocaleString()}</div>
              <div className="text-sm text-orange-600">Valeur totale (CHF)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{partner.totalPointsSpent}</div>
              <div className="text-sm text-purple-600">Points dépensés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilisation par heure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Utilisation par heure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value: any) => [`${value} utilisations`, 'Utilisations']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilisation par jour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Utilisation par jour (30 derniers jours)
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
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Répartition des offres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Répartition des utilisations par offre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <div className="space-y-4">
              <h4 className="font-semibold">Top 5 des offres les plus populaires</h4>
              <div className="space-y-3">
                {topOffers.map((offer, index) => (
                  <div key={offer.title} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{offer.title}</div>
                        <div className="text-sm text-muted-foreground">{offer.count} utilisations</div>
                      </div>
                    </div>
                    <Badge variant="outline">{offer.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meilleurs jours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Meilleurs jours d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDays.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">{day.count} utilisations</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  {day.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerAnalysis; 