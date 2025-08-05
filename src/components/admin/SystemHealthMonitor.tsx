import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, RefreshCw, Activity, Shield, Database } from 'lucide-react';

interface HealthReport {
  timestamp: string;
  total_profiles: number;
  points_sync_issues: number;
  orphaned_completions: number;
  triggers_active: {
    profile_creation: boolean;
    points_update: boolean;
    duplicate_prevention: boolean;
  };
}

export function SystemHealthMonitor() {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('system_health_check');
      
      if (error) {
        console.error('Health check failed:', error);
        toast({
          title: 'Erreur de vérification',
          description: 'Impossible de vérifier l\'état du système',
          variant: 'destructive',
        });
        return;
      }

      const healthData = data as unknown as HealthReport;
      setHealthReport(healthData);
      setLastCheck(new Date());
      
      // Check for critical issues
      const issues = [];
      if (!healthData.triggers_active.profile_creation) issues.push('Création de profils');
      if (!healthData.triggers_active.points_update) issues.push('Synchronisation des points');
      if (!healthData.triggers_active.duplicate_prevention) issues.push('Prévention des doublons');
      if (healthData.points_sync_issues > 0) issues.push(`${healthData.points_sync_issues} problèmes de points`);
      if (healthData.orphaned_completions > 0) issues.push(`${healthData.orphaned_completions} données orphelines`);

      if (issues.length > 0) {
        toast({
          title: 'Problèmes détectés',
          description: `${issues.length} problème(s) trouvé(s): ${issues.join(', ')}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Système sain',
          description: 'Tous les systèmes fonctionnent correctement',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Health check error:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la vérification système',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runMaintenance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('run_daily_maintenance');
      
      if (error) {
        console.error('Maintenance failed:', error);
        toast({
          title: 'Erreur de maintenance',
          description: 'Impossible d\'exécuter la maintenance',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Maintenance terminée',
        description: data,
        variant: 'default',
      });

      // Re-run health check after maintenance
      setTimeout(() => runHealthCheck(), 2000);
    } catch (error) {
      console.error('Maintenance error:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la maintenance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (!healthReport) return 'unknown';
    
    const hasIssues = 
      !healthReport.triggers_active.profile_creation ||
      !healthReport.triggers_active.points_update ||
      !healthReport.triggers_active.duplicate_prevention ||
      healthReport.points_sync_issues > 0 ||
      healthReport.orphaned_completions > 0;

    return hasIssues ? 'warning' : 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  useEffect(() => {
    // Run initial health check
    runHealthCheck();

    // Set up periodic health checks every 5 minutes
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const status = getHealthStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Surveillance Système</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge variant={status === 'healthy' ? 'default' : 'destructive'}>
              {status === 'healthy' ? 'Sain' : 'Problèmes détectés'}
            </Badge>
          </div>
        </div>
        <CardDescription>
          État des systèmes critiques et intégrité des données
          {lastCheck && (
            <span className="text-xs block mt-1">
              Dernière vérification: {lastCheck.toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {healthReport && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Données
                </h4>
                <div className="text-sm space-y-1">
                  <div>Profils: {healthReport.total_profiles}</div>
                  <div className={healthReport.points_sync_issues > 0 ? 'text-red-600' : 'text-green-600'}>
                    Problèmes de points: {healthReport.points_sync_issues}
                  </div>
                  <div className={healthReport.orphaned_completions > 0 ? 'text-red-600' : 'text-green-600'}>
                    Données orphelines: {healthReport.orphaned_completions}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Triggers
                </h4>
                <div className="text-sm space-y-1">
                  <div className={healthReport.triggers_active.profile_creation ? 'text-green-600' : 'text-red-600'}>
                    ✓ Création profils: {healthReport.triggers_active.profile_creation ? 'Actif' : 'Inactif'}
                  </div>
                  <div className={healthReport.triggers_active.points_update ? 'text-green-600' : 'text-red-600'}>
                    ✓ Maj. points: {healthReport.triggers_active.points_update ? 'Actif' : 'Inactif'}
                  </div>
                  <div className={healthReport.triggers_active.duplicate_prevention ? 'text-green-600' : 'text-red-600'}>
                    ✓ Anti-doublon: {healthReport.triggers_active.duplicate_prevention ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              </div>
            </div>

            {status === 'warning' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Des problèmes ont été détectés. Exécutez une maintenance pour résoudre les problèmes automatiques.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={runHealthCheck} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
          
          <Button 
            onClick={runMaintenance} 
            disabled={loading}
            size="sm"
            variant="default"
          >
            <Activity className="h-4 w-4 mr-2" />
            Maintenance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}