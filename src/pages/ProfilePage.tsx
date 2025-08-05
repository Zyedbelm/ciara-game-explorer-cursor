
import React, { useState, useEffect } from 'react';
import { useStableAuth } from '@/hooks/useStableAuth';
import { useUserStats } from '@/hooks/useUserStats';
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
  const { user, profile, loading, isAuthenticated, refreshProfile } = useStableAuth();
  const { stats, loading: statsLoading } = useUserStats();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [cityName, setCityName] = useState<string>('');


  // Récupérer le nom de la ville depuis l'ID du profil
  useEffect(() => {
    const fetchCityName = async () => {
      if (profile?.city_id) {
        const { data: city, error } = await supabase
          .from('cities')
          .select('name')
          .eq('id', profile.city_id)
          .single();
        
        if (city && !error) {
          setCityName(city.name);
        }
      }
    };

    fetchCityName();
  }, [profile?.city_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return profile.full_name[0].toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  const getLevel = () => {
    const points = profile?.total_points || 0;
    if (points < 100) return { level: 1, name: t('profile.badges.explorer'), progress: points };
    if (points < 500) return { level: 2, name: t('profile.badges.adventurer'), progress: ((points - 100) / 400) * 100 };
    if (points < 1000) return { level: 3, name: t('profile.badges.expert'), progress: ((points - 500) / 500) * 100 };
    return { level: 4, name: t('profile.badges.ambassador'), progress: 100 };
  };

  const levelInfo = getLevel();

  return (
    <StandardPageLayout 
      showBackButton 
      title={t('profile.title')}
      className="bg-gradient-to-br from-background to-muted/20"
      containerClassName="space-y-6"
    >
      {/* Header de profil avec couleurs harmonisées */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border -mx-4 -mt-8 px-4 pt-8 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <AvatarUpload size="lg" showUploadButton={true} />
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {profile?.full_name || 'Mon Profil'}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">{profile?.email}</p>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 md:mt-4">
                <Badge variant="default" className="px-2 md:px-3 py-1 text-xs md:text-sm">
                  <Trophy className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {profile?.total_points || 0} points
                </Badge>
                <Badge variant="outline" className="px-2 md:px-3 py-1 text-xs md:text-sm">
                  <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {levelInfo.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <Button 
              variant="default" 
              className="gap-2 w-full md:w-auto"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              {t('profile.edit_profile')}
            </Button>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              {t('profile.edit_to_change_password')}
            </p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="max-w-4xl mx-auto">
          <EditableProfile 
            onSave={async () => {
              await refreshProfile();
              setIsEditing(false);
            }}
            onCancel={() => {
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progression */}
          <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {t('profile.progression')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Niveau {levelInfo.level} - {levelInfo.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(levelInfo.progress)}%
                  </span>
                </div>
                <Progress value={levelInfo.progress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-8 rounded mx-auto"></div>
                    ) : (
                      stats?.completedJourneys || 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('profile.completed_journeys')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-8 rounded mx-auto"></div>
                    ) : (
                      stats?.completedSteps || 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('profile.visited_steps')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {statsLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-8 rounded mx-auto"></div>
                    ) : (
                      (() => {
                        const currentPoints = profile?.total_points || 0;
                        const badges = [
                          { points: 0 },
                          { points: 100 },
                          { points: 500 },
                          { points: 1000 }
                        ];
                        return badges.filter(badge => currentPoints >= badge.points).length;
                      })()
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('profile.badges_earned')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Display */}
          <BadgeDisplay currentPoints={profile?.total_points || 0} />

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('profile.personal_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">{t('profile.full_name')}</Label>
                  <Input 
                    id="fullName"
                    value={profile?.full_name || ''} 
                    placeholder={t('profile.full_name')}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input 
                    id="email"
                    value={profile?.email || ''} 
                    placeholder={t('profile.email')}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Préférences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                {t('profile.preferences')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('profile.fitness_level')}</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-3 w-8 rounded ${
                        level <= parseInt(profile?.fitness_level || '3')
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label>{t('profile.interests')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(profile?.interests && profile.interests.length > 0) ? 
                    profile.interests.map((interest) => {
                      // Normaliser les noms des centres d'intérêt pour correspondre aux clés de traduction
                      const normalizedInterest = interest.toLowerCase()
                        .replace('gastronomie', 'gastronomy')
                        .replace('sport', 'sports')
                        .replace('histoire', 'history')
                        .replace('patrimoine', 'heritage')
                        .replace('aventure', 'adventure');
                      
                      return (
                        <Badge key={interest} variant="outline">
                          {t(`profile.interest_categories.${normalizedInterest}`) !== `profile.interest_categories.${normalizedInterest}` 
                            ? t(`profile.interest_categories.${normalizedInterest}`) 
                            : interest}
                        </Badge>
                      );
                    }) : (
                      <span className="text-sm text-muted-foreground">{t('profile.no_interests')}</span>
                    )
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <MonthlyStatsCard />
        </div>
      </div>
      )}
    </StandardPageLayout>
  );
};

export default ProfilePage;
