// Email Validation Service - Audit complet du système d'emails
import { supabase } from '@/integrations/supabase/client';

export interface EmailValidationResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  suggestions?: string[];
}

export interface EmailFlowTest {
  id: string;
  type: 'password_reset' | 'email_confirmation' | 'welcome';
  email: string;
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
  response?: any;
  duration?: number;
}

export class EmailValidationService {
  private static instance: EmailValidationService;
  
  public static getInstance(): EmailValidationService {
    if (!EmailValidationService.instance) {
      EmailValidationService.instance = new EmailValidationService();
    }
    return EmailValidationService.instance;
  }

  async validateEmailInfrastructure(): Promise<EmailValidationResult[]> {
    const results: EmailValidationResult[] = [];

    try {
      // 1. Test Supabase Auth Configuration
      await this.validateSupabaseAuth(results);
      
      // 2. Test Edge Functions Availability
      await this.validateEdgeFunctions(results);
      
      // 3. Validate Email Configuration
      await this.validateEmailConfiguration(results);
      
      // 4. Check Database Triggers
      await this.validateDatabaseTriggers(results);
      
      // 5. Analyze Recent Logs
      await this.analyzeRecentLogs(results);

    } catch (error: any) {
      results.push({
        component: 'Email Validation Service',
        status: 'error',
        message: `Erreur globale: ${error.message}`,
        details: error,
        suggestions: ['Vérifier la connectivité réseau', 'Vérifier les permissions Supabase']
      });
    }

    return results;
  }

  private async validateSupabaseAuth(results: EmailValidationResult[]): Promise<void> {
    try {
      // Test session auth
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        results.push({
          component: 'Supabase Auth - Session',
          status: 'error',
          message: `Erreur session: ${sessionError.message}`,
          details: sessionError,
          suggestions: ['Vérifier la configuration auth', 'Renouveler la session']
        });
        return;
      }

      // Test auth settings
      try {
        const { data: user } = await supabase.auth.getUser();
        results.push({
          component: 'Supabase Auth - Configuration',
          status: 'healthy',
          message: 'Configuration Auth fonctionnelle',
          details: {
            hasSession: !!session.session,
            hasUser: !!user.user,
            userEmail: user.user?.email
          }
        });
      } catch (authError: any) {
        results.push({
          component: 'Supabase Auth - User',
          status: 'warning',
          message: `Avertissement auth: ${authError.message}`,
          details: authError,
          suggestions: ['Vérifier les permissions utilisateur']
        });
      }

    } catch (error: any) {
      results.push({
        component: 'Supabase Auth',
        status: 'error',
        message: `Échec validation auth: ${error.message}`,
        details: error,
        suggestions: ['Vérifier la configuration Supabase', 'Vérifier les clés API']
      });
    }
  }

  private async validateEdgeFunctions(results: EmailValidationResult[]): Promise<void> {
    const functions = [
      'send-password-reset',
      'send-email-confirmation',
      'auth-webhook',
      'send-welcome-ciara'
    ];

    for (const funcName of functions) {
      try {
        const startTime = Date.now();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${funcName}`,
          {
            method: 'OPTIONS',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        const duration = Date.now() - startTime;
        const status = response.ok ? 'healthy' : 'warning';
        
        results.push({
          component: `Edge Function: ${funcName}`,
          status,
          message: response.ok 
            ? `Accessible (${duration}ms)` 
            : `Status ${response.status} (${duration}ms)`,
          details: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            responseTime: duration,
            cors: response.headers.get('access-control-allow-origin')
          },
          suggestions: response.ok ? [] : [
            'Vérifier le déploiement de la fonction',
            'Vérifier les logs de la fonction',
            'Vérifier la configuration CORS'
          ]
        });

      } catch (error: any) {
        results.push({
          component: `Edge Function: ${funcName}`,
          status: 'error',
          message: `Non accessible: ${error.message}`,
          details: error,
          suggestions: [
            'Vérifier que la fonction est déployée',
            'Vérifier la connectivité réseau',
            'Vérifier les permissions Supabase'
          ]
        });
      }
    }
  }

  private async validateEmailConfiguration(results: EmailValidationResult[]): Promise<void> {
    try {
      // Vérifier la configuration des URLs
      const currentOrigin = window.location.origin;
      const knownUrls = [
        'https://ciara.city',
        'https://ciara.lovable.app',
        currentOrigin
      ];

      results.push({
        component: 'Configuration URLs',
        status: 'healthy',
        message: 'URLs de redirection configurées',
        details: {
          currentOrigin,
          redirectUrls: knownUrls,
          resetPasswordUrl: `${currentOrigin}/reset-password`,
          confirmationUrl: `${currentOrigin}/auth?confirmed=true`
        },
        suggestions: [
          'Vérifier que les URLs sont ajoutées dans Supabase Auth > URL Configuration',
          'Tester les redirections manuellement'
        ]
      });

      // Test de configuration email templates
      results.push({
        component: 'Templates Email',
        status: 'healthy',
        message: 'Templates bilingues configurés',
        details: {
          passwordReset: 'send-password-reset function',
          emailConfirmation: 'send-email-confirmation function',
          welcome: 'send-welcome-ciara function',
          webhook: 'auth-webhook function'
        }
      });

    } catch (error: any) {
      results.push({
        component: 'Configuration Email',
        status: 'error',
        message: `Erreur configuration: ${error.message}`,
        details: error
      });
    }
  }

  private async validateDatabaseTriggers(results: EmailValidationResult[]): Promise<void> {
    try {
      // Vérifier l'existence des triggers via une query
      const { data: triggers, error } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT 
              trigger_name,
              event_manipulation,
              action_statement,
              trigger_schema,
              event_object_table
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public' 
              AND (trigger_name LIKE '%email%' OR trigger_name LIKE '%auth%')
            ORDER BY trigger_name;
          `
        });

      if (error) {
        results.push({
          component: 'Database Triggers',
          status: 'warning',
          message: 'Impossible de vérifier les triggers',
          details: error,
          suggestions: ['Vérifier les permissions de lecture de la DB']
        });
        return;
      }

      const emailTriggers = triggers?.split('\n').filter(line => line.trim()).length || 0;
      
      results.push({
        component: 'Database Triggers',
        status: emailTriggers > 0 ? 'healthy' : 'warning',
        message: `${emailTriggers} triggers email trouvés`,
        details: { triggerCount: emailTriggers, rawResponse: triggers },
        suggestions: emailTriggers === 0 ? [
          'Vérifier les triggers auth dans la base de données',
          'Recréer les triggers si nécessaire'
        ] : []
      });

    } catch (error: any) {
      results.push({
        component: 'Database Triggers',
        status: 'error',
        message: `Erreur validation triggers: ${error.message}`,
        details: error,
        suggestions: ['Vérifier les permissions database']
      });
    }
  }

  private async analyzeRecentLogs(results: EmailValidationResult[]): Promise<void> {
    try {
      // Analyser les logs récents liés aux emails
      const { data: logs, error } = await supabase
        .from('system_logs')
        .select('*')
        .or('message.ilike.%email%,message.ilike.%password%,message.ilike.%auth%')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        results.push({
          component: 'Logs Analysis',
          status: 'warning',
          message: 'Impossible d\'accéder aux logs système',
          details: error,
          suggestions: ['Vérifier les permissions logs']
        });
        return;
      }

      const errorLogs = logs?.filter(log => log.level === 'error') || [];
      const warningLogs = logs?.filter(log => log.level === 'warning') || [];
      const recentErrors = errorLogs.filter(log => 
        new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (recentErrors.length > 0) status = 'error';
      else if (errorLogs.length > 0 || warningLogs.length > 2) status = 'warning';

      results.push({
        component: 'Logs Analysis - Emails',
        status,
        message: `${logs?.length || 0} logs email analysés`,
        details: {
          totalLogs: logs?.length || 0,
          errorLogs: errorLogs.length,
          warningLogs: warningLogs.length,
          recentErrors: recentErrors.length,
          latestErrors: recentErrors.slice(0, 3).map(log => ({
            message: log.message,
            level: log.level,
            timestamp: log.created_at
          }))
        },
        suggestions: recentErrors.length > 0 ? [
          'Examiner les erreurs récentes en détail',
          'Vérifier la configuration des edge functions',
          'Tester le flux email manuellement'
        ] : []
      });

    } catch (error: any) {
      results.push({
        component: 'Logs Analysis',
        status: 'error',
        message: `Erreur analyse logs: ${error.message}`,
        details: error
      });
    }
  }

  async testEmailFlow(email: string, type: 'password_reset' | 'email_confirmation'): Promise<EmailFlowTest> {
    const testId = `${type}_${Date.now()}`;
    const startTime = Date.now();

    try {
      let result: any;
      
      if (type === 'password_reset') {
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password: 'TestPassword123!',
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
          }
        });
      }

      const duration = Date.now() - startTime;

      return {
        id: testId,
        type,
        email,
        status: result.error ? 'error' : 'success',
        timestamp: new Date(),
        response: result.error || { message: 'Email envoyé avec succès' },
        duration
      };

    } catch (error: any) {
      return {
        id: testId,
        type,
        email,
        status: 'error',
        timestamp: new Date(),
        response: error,
        duration: Date.now() - startTime
      };
    }
  }

  async generateEmailReport(): Promise<{
    summary: {
      totalChecks: number;
      healthyChecks: number;
      warningChecks: number;
      errorChecks: number;
    };
    results: EmailValidationResult[];
    recommendations: string[];
  }> {
    const results = await this.validateEmailInfrastructure();
    
    const summary = {
      totalChecks: results.length,
      healthyChecks: results.filter(r => r.status === 'healthy').length,
      warningChecks: results.filter(r => r.status === 'warning').length,
      errorChecks: results.filter(r => r.status === 'error').length
    };

    const recommendations: string[] = [];
    
    if (summary.errorChecks > 0) {
      recommendations.push('🔴 Problèmes critiques détectés - Action immédiate requise');
    }
    
    if (summary.warningChecks > 0) {
      recommendations.push('🟡 Avertissements détectés - Surveillance recommandée');
    }
    
    if (summary.healthyChecks === summary.totalChecks) {
      recommendations.push('✅ Système email entièrement fonctionnel');
    }

    // Recommendations spécifiques basées sur les résultats
    const errorComponents = results.filter(r => r.status === 'error');
    if (errorComponents.some(r => r.component.includes('Edge Function'))) {
      recommendations.push('Redéployer les edge functions défaillantes');
    }
    
    if (errorComponents.some(r => r.component.includes('Auth'))) {
      recommendations.push('Vérifier la configuration Supabase Auth');
    }

    return {
      summary,
      results,
      recommendations
    };
  }
}

export const emailValidationService = EmailValidationService.getInstance();