import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  event_type: string;
  event_data: Record<string, any>;
  origin?: string;
}

export function useSecurityMonitor() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Log security events
  const logSecurityEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, any> = {},
    origin?: string
  ) => {
    try {
      if (!isAuthenticated) return;

      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_event_data: eventData,
        p_origin: origin || window.location.origin
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }, [isAuthenticated]);

  // Monitor for suspicious activities
  const monitorSuspiciousActivity = useCallback(async () => {
    if (!user) return;

    try {
      // Check for rapid successive actions
      const recentEvents = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', new Date(Date.now() - 60000).toISOString()) // Last minute
        .order('timestamp', { ascending: false });

      if (recentEvents.data && recentEvents.data.length > 10) {
        logSecurityEvent('RAPID_ACTIONS_DETECTED', {
          event_count: recentEvents.data.length,
          time_window: '1_minute'
        });
      }

      // Check for unusual validation patterns
      const recentValidations = await supabase
        .from('step_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
        .order('completed_at', { ascending: false });

      if (recentValidations.data && recentValidations.data.length > 5) {
        logSecurityEvent('UNUSUAL_VALIDATION_PATTERN', {
          validation_count: recentValidations.data.length,
          time_window: '5_minutes'
        });
      }
    } catch (error) {
      console.warn('Security monitoring failed:', error);
    }
  }, [user, logSecurityEvent]);

  // Monitor authentication events
  useEffect(() => {
    if (!isAuthenticated) return;

    // Log session start
    logSecurityEvent('SESSION_START', {
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Set up periodic monitoring
    const monitoringInterval = setInterval(monitorSuspiciousActivity, 60000); // Every minute

    // Cleanup on unmount or logout
    return () => {
      clearInterval(monitoringInterval);
      logSecurityEvent('SESSION_END', {
        timestamp: new Date().toISOString()
      });
    };
  }, [isAuthenticated, logSecurityEvent, monitorSuspiciousActivity]);

  // Handle authentication errors
  const handleAuthError = useCallback((error: any) => {
    logSecurityEvent('AUTH_ERROR', {
      error_code: error.code,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });

    // Show user-friendly error messages
    switch (error.code) {
      case 'invalid_credentials':
        toast({
          title: 'Erreur de connexion',
          description: 'Email ou mot de passe incorrect',
          variant: 'destructive',
        });
        break;
      case 'too_many_requests':
        toast({
          title: 'Trop de tentatives',
          description: 'Veuillez attendre avant de réessayer',
          variant: 'destructive',
        });
        break;
      case 'email_not_confirmed':
        toast({
          title: 'Email non confirmé',
          description: 'Veuillez vérifier votre email',
          variant: 'destructive',
        });
        break;
      default:
        toast({
          title: 'Erreur de sécurité',
          description: 'Une erreur de sécurité est survenue',
          variant: 'destructive',
        });
    }
  }, [logSecurityEvent, toast]);

  // Handle database errors with security implications
  const handleDatabaseError = useCallback((error: any, context: string) => {
    logSecurityEvent('DATABASE_ERROR', {
      error_code: error.code,
      error_message: error.message,
      context: context,
      timestamp: new Date().toISOString()
    });

    // Check for potential security issues
    if (error.code === 'PGRST116') { // RLS violation
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les permissions nécessaires',
        variant: 'destructive',
      });
    } else if (error.code === '23505') { // Unique violation
      toast({
        title: 'Action déjà effectuée',
        description: 'Cette action a déjà été réalisée',
        variant: 'default',
      });
    }
  }, [logSecurityEvent, toast]);

  return {
    logSecurityEvent,
    handleAuthError,
    handleDatabaseError,
    monitorSuspiciousActivity
  };
}