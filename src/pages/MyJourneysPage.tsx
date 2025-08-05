
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

  console.log('🎯 [Optimized] MyJourneysPage: Rendering with loading states:', {
    authLoading,
    journeysLoading,
    statsLoading,
    isAuthenticated,
    activeTab
  });

  // Callback optimisé pour les changements de statut
  const handleStatusChange = useCallback(() => {
    console.log('🔄 [Optimized] Status change detected, refetching journeys...');
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
    console.log('⏳ [Optimized] MyJourneysPage: Still loading...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirection si non authentifié
  if (!isAuthenticated) {
    console.log('🔒 [Optimized] MyJourneysPage: User not authenticated, redirecting...');
    return <Navigate to="/auth" replace />;
  }

  // Gestion des erreurs
  if (error) {
    console.error('❌ [Optimized] MyJourneysPage: Error state:', error);
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

  console.log('✅ [Optimized] MyJourneysPage: Rendering successfully');

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
          <TabsList className="grid w-full max-w-xs grid-cols-3 h-12">
              <TabsTrigger value="saved" className="flex items-center justify-center p-2">
                <Sparkles className="h-5 w-5" />
              </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex items-center justify-center p-2">
              <Play className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center justify-center p-2">
              <Trophy className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>
          
          {/* Titres sous les onglets */}
          <div className="grid grid-cols-3 max-w-xs text-center">
            <div className={`text-xs px-2 transition-colors ${activeTab === 'saved' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {t('ai_generated_routes')}
            </div>
            <div className={`text-xs px-2 transition-colors ${activeTab === 'in-progress' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {t('my_journeys.tabs.in_progress')}
            </div>
            <div className={`text-xs px-2 transition-colors ${activeTab === 'completed' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {t('my_journeys.tabs.completed')}
            </div>
          </div>
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
