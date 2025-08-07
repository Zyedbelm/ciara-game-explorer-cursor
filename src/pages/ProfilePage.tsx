
import React, { useState, useEffect, useMemo } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useOptimizedUserStats } from '@/hooks/useOptimizedUserStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import EditableProfile from '@/components/profile/EditableProfile';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import AvatarUpload from '@/components/profile/AvatarUpload';
import MonthlyStatsCard from '@/components/profile/MonthlyStatsCard';
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Star,
  Settings,
  Edit
} from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';

const ProfilePage = () => {
  const { user, profile, loading, isAuthenticated, refreshProfile } = useOptimizedAuth();
  const { stats, loading: statsLoading } = useOptimizedUserStats();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [cityName, setCityName] = useState<string>('');

  // Optimisation : Récupérer le nom de la ville avec cache
  useEffect(() => {
    const fetchCityName = async () => {
      if (profile?.city_id) {
        try {
          const { data: city, error } = await supabase
            .from('cities')
            .select('name')
            .eq('id', profile.city_id)
            .single();
          
          if (city && !error) {
            setCityName(city.name);
          }
        } catch (error) {
          console.warn('Erreur lors de la récupération du nom de la ville:', error);
        }
      } else {
        setCityName('');
      }
    };

    fetchCityName();
  }, [profile?.city_id]);

  // Optimisation : Calculs mémorisés
  const userInitials = useMemo(() => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return profile.full_name[0].toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  }, [profile?.full_name, profile?.email]);

  const levelInfo = useMemo(() => {
    const points = profile?.total_points || 0;
    if (points < 100) return { level: 1, name: t('profile.badges.explorer'), progress: points };
    if (points < 500) return { level: 2, name: t('profile.badges.adventurer'), progress: ((points - 100) / 400) * 100 };
    if (points < 1000) return { level: 3, name: t('profile.badges.expert'), progress: ((points - 500) / 500) * 100 };
    return { level: 4, name: t('profile.badges.ambassador'), progress: 100 };
  }, [profile?.total_points, t]);

  // État de chargement optimisé
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <StandardPageLayout 
      showBackButton 
      title={t('profile.title')}
      className="space-y-6"
    >
      {/* Header du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile?.full_name || 'Utilisateur'}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              {cityName && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {cityName}
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Niveau et points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Niveau et Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{levelInfo.name}</p>
              <p className="text-sm text-muted-foreground">Niveau {levelInfo.level}</p>
            </div>
            <Badge variant="secondary">{profile?.total_points || 0} points</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{Math.round(levelInfo.progress)}%</span>
            </div>
            <Progress value={levelInfo.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Statistiques mensuelles */}
      {!statsLoading && stats && (
        <MonthlyStatsCard stats={stats} />
      )}

      {/* Badges */}
      <BadgeDisplay />

      {/* Formulaire d'édition */}
      {isEditing && (
        <EditableProfile 
          onSave={() => {
            setIsEditing(false);
            refreshProfile();
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Upload d'avatar */}
      <AvatarUpload onUploadComplete={refreshProfile} />
    </StandardPageLayout>
  );
};

export default ProfilePage;
