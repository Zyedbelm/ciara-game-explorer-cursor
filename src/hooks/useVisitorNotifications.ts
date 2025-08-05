import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VisitorNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  trigger_type: string;
  is_read: boolean;
  shown_as_toast: boolean;
  metadata: any;
  created_at: string;
}

export const useVisitorNotifications = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<VisitorNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Récupérer les notifications non affichées comme toast
  const fetchUnshownNotifications = async () => {
    if (!profile?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('visitor_notifications')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('shown_as_toast', false)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Afficher les notifications comme toast
        data.forEach(notification => {
          showNotificationToast(notification);
        });

        // Marquer comme affichées
        const notificationIds = data.map(n => n.id);
        await markAsShownAsToast(notificationIds);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  // Afficher une notification comme toast
  const showNotificationToast = (notification: VisitorNotification) => {
    const getVariant = (type: string) => {
      switch (type) {
        case 'error': return 'destructive';
        case 'warning': return 'destructive'; 
        case 'success': return 'default';
        default: return 'default';
      }
    };

    const getIcon = (triggerType: string) => {
      switch (triggerType) {
        case 'step_completion': return '✅';
        case 'journey_complete': return '🎉';
        case 'reward_available': return '🎁';
        case 'achievement': return '🏆';
        case 'reminder': return '⏰';
        default: return '📢';
      }
    };

    toast({
      title: `${getIcon(notification.trigger_type)} ${notification.title}`,
      description: notification.message,
      variant: getVariant(notification.type),
      duration: notification.type === 'error' ? 8000 : 5000,
    });
  };

  // Marquer les notifications comme affichées en toast
  const markAsShownAsToast = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('visitor_notifications')
        .update({ shown_as_toast: true, updated_at: new Date().toISOString() })
        .in('id', notificationIds);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  // Récupérer toutes les notifications pour l'historique
  const fetchAllNotifications = async () => {
    if (!profile?.user_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitor_notifications')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('visitor_notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Créer une notification (pour les tests)
  const createTestNotification = async (type: 'step_completion' | 'journey_complete' | 'reward_available' | 'achievement' | 'reminder') => {
    if (!profile?.user_id) return;

    const notifications = {
      step_completion: {
        title: 'Étape complétée !',
        message: 'Vous avez gagné 15 points en complétant cette étape.',
        type: 'success' as const,
      },
      journey_complete: {
        title: 'Parcours terminé !',
        message: 'Félicitations ! Vous avez terminé le parcours patrimoine.',
        type: 'success' as const,
      },
      reward_available: {
        title: 'Récompense disponible',
        message: 'Un nouveau bon de réduction vous attend !',
        type: 'info' as const,
      },
      achievement: {
        title: 'Nouveau niveau !',
        message: 'Vous êtes maintenant Explorateur niveau 2 !',
        type: 'success' as const,
      },
      reminder: {
        title: 'Reprenez l\'exploration',
        message: 'De nouveaux parcours vous attendent !',
        type: 'info' as const,
      },
    };

    const notif = notifications[type];

    try {
      const { error } = await supabase.rpc('create_visitor_notification', {
        p_user_id: profile.user_id,
        p_title: notif.title,
        p_message: notif.message,
        p_type: notif.type,
        p_trigger_type: type,
        p_metadata: { test: true },
        p_expires_hours: 168
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la création de notification:', error);
    }
  };

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!profile?.user_id) return;

    // Récupérer les notifications non affichées au chargement
    fetchUnshownNotifications();

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel('visitor-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitor_notifications',
          filter: `user_id=eq.${profile.user_id}`
        },
        (payload) => {
          const newNotification = payload.new as VisitorNotification;
          showNotificationToast(newNotification);
          
          // Marquer immédiatement comme affiché
          markAsShownAsToast([newNotification.id]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  return {
    notifications,
    loading,
    fetchAllNotifications,
    markAsRead,
    createTestNotification,
  };
};