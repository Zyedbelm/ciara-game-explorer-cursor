import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RecentActivity {
  id: string;
  type: 'journey' | 'user' | 'partner' | 'article' | 'step';
  title: string;
  description: string;
  timestamp: string;
  city_name?: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchRecentActivity();
  }, [profile?.role, profile?.city_id]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const activities: RecentActivity[] = [];

      // Pour les super admins, récupérer toutes les activités
      // Pour les tenant admins, filtrer par leur ville
      const isFilterByCity = profile?.role === 'tenant_admin' && profile?.city_id;

      // Récupérer les nouveaux parcours
      let journeysQuery = supabase
        .from('journeys')
        .select(`
          id, 
          name, 
          created_at,
          cities:city_id(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (isFilterByCity) {
        journeysQuery = journeysQuery.eq('city_id', profile.city_id);
      }

      const { data: journeys } = await journeysQuery;

      journeys?.forEach(journey => {
        activities.push({
          id: `journey-${journey.id}`,
          type: 'journey',
          title: `Nouveau parcours "${journey.name}" créé`,
          description: `${journey.cities?.name || 'Ville inconnue'}`,
          timestamp: journey.created_at,
          city_name: journey.cities?.name
        });
      });

      // Récupérer les nouveaux utilisateurs
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          user_id, 
          full_name, 
          created_at,
          cities:city_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (isFilterByCity) {
        profilesQuery = profilesQuery.eq('city_id', profile.city_id);
      }

      const { data: users } = await profilesQuery;

      // Grouper les utilisateurs par jour
      const usersByDay = users?.reduce((acc, user) => {
        const date = new Date(user.created_at).toDateString();
        if (!acc[date]) {
          acc[date] = { count: 0, city_name: user.cities?.name, timestamp: user.created_at };
        }
        acc[date].count++;
        return acc;
      }, {} as Record<string, { count: number; city_name?: string; timestamp: string }>);

      Object.entries(usersByDay || {}).forEach(([date, data]) => {
        activities.push({
          id: `users-${date}`,
          type: 'user',
          title: `${data.count} nouveau${data.count > 1 ? 'x' : ''} utilisateur${data.count > 1 ? 's' : ''} inscrit${data.count > 1 ? 's' : ''}`,
          description: data.city_name || '',
          timestamp: data.timestamp,
          city_name: data.city_name
        });
      });

      // Récupérer les nouveaux partenaires
      let partnersQuery = supabase
        .from('partners')
        .select(`
          id, 
          name, 
          created_at,
          cities:city_id(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (isFilterByCity) {
        partnersQuery = partnersQuery.eq('city_id', profile.city_id);
      }

      const { data: partners } = await partnersQuery;

      partners?.forEach(partner => {
        activities.push({
          id: `partner-${partner.id}`,
          type: 'partner',
          title: `Partenaire "${partner.name}" ajouté`,
          description: `${partner.cities?.name || 'Ville inconnue'}`,
          timestamp: partner.created_at,
          city_name: partner.cities?.name
        });
      });

      // Récupérer les nouveaux articles
      let articlesQuery = supabase
        .from('articles')
        .select(`
          id, 
          title, 
          created_at,
          cities:city_id(name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (isFilterByCity) {
        articlesQuery = articlesQuery.eq('city_id', profile.city_id);
      }

      const { data: articles } = await articlesQuery;

      articles?.forEach(article => {
        activities.push({
          id: `article-${article.id}`,
          type: 'article',
          title: `Article "${article.title}" publié`,
          description: `${article.cities?.name || 'Général'}`,
          timestamp: article.created_at,
          city_name: article.cities?.name
        });
      });

      // Trier toutes les activités par date et garder les 10 plus récentes
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Il y a moins d\'une heure';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'journey': return 'bg-primary';
      case 'user': return 'bg-secondary';
      case 'partner': return 'bg-accent';
      case 'article': return 'bg-green-500';
      case 'step': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return {
    activities,
    loading,
    getTimeAgo,
    getActivityColor,
    refresh: fetchRecentActivity
  };
}