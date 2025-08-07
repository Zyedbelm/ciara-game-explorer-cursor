
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserJourneys } from '@/hooks/useUserJourneys';
import { useUserStats } from '@/hooks/useUserStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import JourneyStatsGrid from '@/components/journey/JourneyStatsGrid';
import JourneyNotificationAlert from '@/components/journey/JourneyNotificationAlert';
import WelcomeAlert from '@/components/journey/WelcomeAlert';
import OptimizedJourneyTabsContent from '@/components/journey/OptimizedJourneyTabsContent';
import { Filter, Sparkles, Play, Trophy, Bookmark } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyJourneysPage = () => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const { journeys, loading: journeysLoading, error, refetch } = useUserJourneys();
  const { stats, loading: statsLoading } = useUserStats();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
  // State pour maintenir l'onglet actuel avec gestion de l'URL
  const [activeTab, setActiveTab] = useState('saved');

  // Gérer la redirection vers l'onglet "completed"
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['saved', 'in-progress', 'completed'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Callback optimisé pour les changements de statut
  const handleStatusChange = useCallback(() => {
    refetch();
  }, [refetch]);

  // Calcul optimisé pour déterminer si l'utilisateur a des parcours
  const hasAnyJourneys = useMemo(() => 
    journeys.inProgress.length > 0 || 
    journeys.completed.length > 0 || 
    journeys.saved.length > 0,
    [journeys.inProgress.length, journeys.completed.length, journeys.saved.length]
  );

  // États de chargement
  if (authLoading || journeysLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirection si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Gestion des erreurs
  if (error) {
    return (
      <StandardPageLayout 
        showBackButton 
        title={t('my_journeys.title')}
      >
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{t('my_journeys.error')}</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      showBackButton 
      title={t('my_journeys.title')} 
      subtitle={t('my_journeys.subtitle')}
      className="bg-gradient-to-br from-background to-muted/20"
      containerClassName="space-y-6"
    >
      {/* Notification alert */}
      <JourneyNotificationAlert />

      {/* Welcome message for new users */}
      <WelcomeAlert hasAnyJourneys={hasAnyJourneys} />

      {/* Statistics */}
      <JourneyStatsGrid stats={stats} />

      {/* Journey tabs optimisés */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <TabsList className="grid w-full max-w-xs grid-cols-3 h-20">
            <TabsTrigger 
              value="saved" 
              className="flex flex-col items-center justify-center p-2 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <Sparkles className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('ai_generated_routes')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="in-progress" 
              className="flex flex-col items-center justify-center p-2 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <Play className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('my_journeys.tabs.in_progress')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="flex flex-col items-center justify-center p-2 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <Trophy className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('my_journeys.tabs.completed')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenu des onglets optimisé */}
        <OptimizedJourneyTabsContent 
          journeys={journeys}
          onStatusChange={handleStatusChange}
        />
      </Tabs>
    </StandardPageLayout>
  );
};

export default MyJourneysPage;
