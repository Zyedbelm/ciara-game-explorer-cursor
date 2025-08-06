import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAdminTranslation } from '@/utils/adminTranslations';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import DashboardStats from '@/components/admin/DashboardStats';
import UsersManagement from '@/components/admin/UsersManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import { OptimizedRealAnalyticsDashboard } from '@/components/admin/OptimizedRealAnalyticsDashboard';
import { TestimonialsManagement } from '@/components/admin/TestimonialsManagement';
import { ClientLogosManagement } from '@/components/admin/ClientLogosManagement';
import { SystemHealthMonitor } from '@/components/admin/SystemHealthMonitor';
import { SecurityConfigDashboard } from '@/components/admin/SecurityConfigDashboard';
import RewardOffersManagement from '@/components/admin/RewardOffersManagement';
import PartnersManagement from '@/components/admin/PartnersManagement';
import PartnerDashboard from '@/components/admin/PartnerDashboard';
import CityAssignment from '@/components/admin/CityAssignment';
import CityManagement from '@/components/admin/CityManagement';
import CountryManagement from '@/components/admin/CountryManagement';
import HomepageVisibilityManager from '@/components/admin/HomepageVisibilityManager';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ArticleManagement from '@/components/admin/ArticleManagement';
import { OptimizedEnhancedInsightsDashboard } from '@/components/admin/OptimizedEnhancedInsightsDashboard';
import { OpenAIKeyValidator } from '@/components/admin/OpenAIKeyValidator';
import { ImplementationSummary } from '@/components/admin/ImplementationSummary';
import { JourneyDataDebugger } from '@/components/admin/JourneyDataDebugger';
import EmailDiagnosticDashboard from '@/components/admin/EmailDiagnosticDashboard';
import { PartnerLinkManagement } from '@/components/admin/PartnerLinkManagement';

import {
  Users,
  MapPin,
  Plus,
  TrendingUp,
  Activity,
  Globe,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalJourneys: number;
  totalPoints: number;
  activeUsers: number;
}

const AdminDashboard = () => {
  const { user, profile, loading: authLoading, isAdmin, isPartner, isSuperAdmin, isTenantAdmin, canViewAnalytics, canManageContent, canManageUsers } = useAuth();
  const { toast } = useToast();
  const t = useAdminTranslation();
  const { activities, loading: activitiesLoading, getTimeAgo, getActivityColor } = useRecentActivity();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJourneys: 0,
    totalPoints: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Si c'est un partenaire, rediriger vers le tableau de bord partenaire
    if (isPartner()) {
      // Éviter la redirection infinie en vérifiant l'URL actuelle
      if (window.location.pathname !== '/partner-dashboard') {
        window.location.href = '/partner-dashboard';
        return;
      }
    }

    fetchDashboardStats();
    if (isTenantAdmin() && profile?.city_id) {
      fetchCityName();
    }
  }, [profile?.city_id, isPartner]);

  // Si c'est un partenaire, afficher un message de redirection
  if (isPartner()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirection vers le tableau de bord partenaire...</p>
        </div>
      </div>
    );
  }

  const fetchCityName = async () => {
    if (!profile?.city_id) return;
    
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('name')
        .eq('id', profile.city_id)
        .single();

      if (error) {
        return;
      }

      setCityName(data?.name || null);
    } catch (error) {
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const isSuperAdmin = profile?.role === 'super_admin';
      const cityFilter = isSuperAdmin ? {} : { city_id: profile?.city_id };

      const [usersResult, journeysResult, pointsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }).match(cityFilter),
        supabase.from('journeys').select('*', { count: 'exact' }).match(cityFilter),
        supabase.from('profiles').select('total_points').match(cityFilter)
      ]);

      const totalPoints = pointsResult.data?.reduce((sum, profile) => sum + (profile.total_points || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalJourneys: journeysResult.count || 0,
        totalPoints,
        activeUsers: Math.floor((usersResult.count || 0) * 0.3)
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: t('admin.error.load_failed'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">{t('admin.status.loading')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Vérification des permissions...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAdminAccess = canViewAnalytics() || canManageContent() || canManageUsers();

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Accès non autorisé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="text-center text-sm">
              <p><strong>Rôle actuel:</strong> {profile.role}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              {isTenantAdmin() && !profile.city_id && (
                <p className="text-amber-600 mt-2">
                  ⚠️ Aucune ville assignée. Contactez un super administrateur.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
                  <AdminSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              canManageUsers={canManageUsers}
              canManageContent={canManageContent}
              canViewAnalytics={canViewAnalytics}
              isSuperAdmin={isSuperAdmin}
              isTenantAdmin={isTenantAdmin}
              isPartner={isPartner}
              cityName={cityName}
            />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header showBackButton title="Administration" />
        
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold animate-fade-in">{t('admin.dashboard.title')}</h1>
                  <p className="text-muted-foreground mt-1">
                     {isSuperAdmin() ? 'Administration complète' : 
                     isTenantAdmin() ? 'Administration ville' : 'Gestion du contenu'} - {profile?.full_name || profile?.email}
                  </p>
                  {isTenantAdmin() && profile?.city_id && cityName && (
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-primary">
                        Ville : <span className="font-bold">{cityName}</span>
                      </p>
                    </div>
                  )}
                  {isTenantAdmin() && profile?.city_id && !cityName && (
                    <p className="text-sm text-amber-600 mt-1">
                      Gestion limitée à votre ville assignée
                    </p>
                  )}
                  {isTenantAdmin() && !profile?.city_id && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Aucune ville assignée - Fonctionnalités limitées
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{profile?.role}</Badge>
                  {profile?.city_id && cityName && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {cityName}
                    </Badge>
                  )}
                  {profile?.city_id && !cityName && (
                    <Badge variant="secondary">Ville assignée</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Afficher DashboardStats seulement dans l'onglet overview */}
            {activeTab === 'overview' && canViewAnalytics() && (
              <div className="mb-8">
                <DashboardStats />
              </div>
            )}

            {/* Content Based on Active Tab */}
            <div className="animate-fade-in">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Performance Indicators */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Indicateurs de Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg hover-scale">
                          <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
                          <div className="text-sm text-muted-foreground">Utilisateurs</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg hover-scale">
                          <div className="text-2xl font-bold text-primary">{stats.totalJourneys}</div>
                          <div className="text-sm text-muted-foreground">Parcours</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg hover-scale">
                          <div className="text-2xl font-bold text-primary">{stats.activeUsers}</div>
                          <div className="text-sm text-muted-foreground">Actifs</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg hover-scale">
                          <div className="text-2xl font-bold text-primary">{Math.round(stats.totalPoints / 1000)}k</div>
                          <div className="text-sm text-muted-foreground">Points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Activité Récente
                          {isTenantAdmin() && cityName && (
                            <Badge variant="outline" className="ml-2">
                              {cityName}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activitiesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : activities.length > 0 ? (
                          <div className="max-h-64 overflow-y-auto pr-2 space-y-4">
                            {activities.slice(0, 8).map((activity) => (
                              <div key={activity.id} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{activity.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{getTimeAgo(activity.timestamp)}</span>
                                    {activity.city_name && profile?.role === 'super_admin' && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{activity.city_name}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {activities.length > 8 && (
                              <div className="text-center pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                  +{activities.length - 8} autres activités
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Aucune activité récente</p>
                            <p className="text-xs mt-1">
                              {isTenantAdmin() 
                                ? "Les activités de votre ville apparaîtront ici"
                                : "Les activités de toutes les villes apparaîtront ici"
                              }
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Actions Rapides</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {canManageContent() && (
                          <Button 
                            className="w-full justify-start hover-scale" 
                            variant="outline"
                            onClick={() => setActiveTab('content')}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Créer un nouveau parcours
                          </Button>
                        )}
                        {canManageUsers() && (
                          <Button 
                            className="w-full justify-start hover-scale" 
                            variant="outline"
                            onClick={() => setActiveTab('users')}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Gérer les utilisateurs
                          </Button>
                        )}
                        {canViewAnalytics() && (
                          <Button 
                            className="w-full justify-start hover-scale" 
                            variant="outline"
                            onClick={() => setActiveTab('analytics')}
                          >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Voir les analytics
                          </Button>
                        )}
                         {isSuperAdmin() && (
                          <Button 
                            className="w-full justify-start hover-scale" 
                            variant="outline"
                            onClick={() => setActiveTab('cities')}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Gérer les villes
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'users' && canManageUsers() && (
                <div className="space-y-6">
                  <UsersManagement cityId={isTenantAdmin() ? profile?.city_id : undefined} />
                </div>
              )}

              {activeTab === 'content' && canManageContent() && (
                <div className="space-y-6">
                  <ContentManagement cityId={isTenantAdmin() ? profile?.city_id : undefined} />
                </div>
              )}

              {activeTab === 'analytics' && canViewAnalytics() && (
                <div className="space-y-6">
                  <OptimizedRealAnalyticsDashboard />
                </div>
              )}

              {activeTab === 'insights' && canViewAnalytics() && (
                <div className="space-y-6">
                  <OptimizedEnhancedInsightsDashboard />
                </div>
              )}

              {activeTab === 'reward-offers' && (
                <div className="space-y-6">
                  <RewardOffersManagement cityId={isTenantAdmin() ? profile?.city_id : undefined} />
                </div>
              )}

              {activeTab === 'partners' && (
                <div className="space-y-6">
                  <PartnerDashboard />
                </div>
              )}

              {activeTab === 'partner-links' && isSuperAdmin() && (
                <div className="space-y-6">
                  <PartnerLinkManagement />
                </div>
              )}

              {activeTab === 'cities' && isSuperAdmin() && (
                <div className="space-y-6">
                  <CityManagement />
                  <CityAssignment />
                </div>
              )}

              {activeTab === 'homepage' && isSuperAdmin() && (
                <div className="space-y-6">
                  <HomepageVisibilityManager />
                </div>
              )}

              {activeTab === 'countries' && isSuperAdmin() && (
                <div className="space-y-6">
                  <CountryManagement />
                </div>
              )}

              {activeTab === 'testimonials' && isSuperAdmin() && (
                <div className="space-y-6">
                  <TestimonialsManagement />
                </div>
              )}

              {activeTab === 'client-logos' && isSuperAdmin() && (
                <div className="space-y-6">
                  <ClientLogosManagement />
                </div>
              )}

              {activeTab === 'system' && isSuperAdmin() && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Système</h3>
                    <p className="text-muted-foreground">Monitoring, diagnostics et configuration de sécurité</p>
                  </div>
                  
                  {/* Implementation Summary - Plan Status */}
                  <ImplementationSummary />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <SystemHealthMonitor />
                    <SecurityConfigDashboard />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* OpenAI Diagnostic Tool */}
                    <OpenAIKeyValidator />
                    
                    {/* Journey Data Debugger */}
                    <JourneyDataDebugger />
                  </div>
                </div>
              )}

              {activeTab === 'email-diagnostic' && isSuperAdmin() && (
                <div className="space-y-6">
                  <EmailDiagnosticDashboard />
                </div>
              )}

              {activeTab === 'articles' && (canManageContent() || isSuperAdmin() || isTenantAdmin()) && (
                <div className="space-y-6">
                  <ArticleManagement />
                </div>
              )}

            </div>
          </div>
        </div>
        
        <div className="border-t">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
