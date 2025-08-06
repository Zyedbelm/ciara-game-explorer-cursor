
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type JourneyType = 'hiking' | 'museums' | 'old_town' | 'gastronomy' | 'art_culture' | 'nature' | 'adventure' | 'family';
type UserRole = 'super_admin' | 'tenant_admin' | 'visitor' | 'partner';

interface Profile {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  total_points: number | null;
  current_level: number | null;
  fitness_level: string | null;
  preferred_languages: string[] | null;
  interests: string[] | null;
  city_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Cache pour éviter les requêtes redondantes
const profileCache = new Map<string, { profile: Profile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const profileSubscriptionRef = useRef<any>(null);

  // Fonction de récupération de profil optimisée avec cache
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;

    // Vérifier le cache
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.profile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // Mettre en cache
      profileCache.set(userId, { profile: data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // En cas d'erreur, nettoyer le cache
      profileCache.delete(userId);
      return null;
    }
  }, []);

  // Gestionnaire d'état d'authentification optimisé
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (!mountedRef.current) return;

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Nettoyer l'ancienne subscription
      if (profileSubscriptionRef.current) {
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }

      // Récupérer le profil
      const profileData = await fetchProfile(session.user.id);
      if (mountedRef.current) {
        setProfile(profileData);
      }

      // Configurer la subscription en temps réel
      profileSubscriptionRef.current = supabase
        .channel('profile_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            if (mountedRef.current && payload.new) {
              const newProfile = payload.new as Profile;
              setProfile(newProfile);
              // Mettre à jour le cache
              profileCache.set(session.user.id, { profile: newProfile, timestamp: Date.now() });
            }
          }
        )
        .subscribe();
    } else {
      setProfile(null);
      // Nettoyer la subscription
      if (profileSubscriptionRef.current) {
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
    }

    if (mountedRef.current) {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Initialisation optimisée
  useEffect(() => {
    mountedRef.current = true;

    // Gestionnaire d'événements personnalisés
    const handleProfileUpdate = (event: CustomEvent) => {
      if (mountedRef.current && event.detail && user?.id === event.detail.user_id) {
        setProfile(event.detail);
        profileCache.set(user.id, { profile: event.detail, timestamp: Date.now() });
      }
    };

    // Configuration de l'écouteur d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Écouteur d'événements personnalisés
    window.addEventListener('profile-updated', handleProfileUpdate as EventListener);

    // Vérification de la session initiale
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mountedRef.current && session) {
        await handleAuthStateChange('INITIAL_SESSION', session);
      } else if (mountedRef.current) {
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener);
      if (profileSubscriptionRef.current) {
        supabase.removeChannel(profileSubscriptionRef.current);
      }
    };
  }, [handleAuthStateChange, user?.id]);

  // Fonctions d'authentification optimisées
  const signUp = useCallback(async (email: string, password: string, userData?: {
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const redirectUrl = 'https://ciara.city/';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData?.firstName || '',
            last_name: userData?.lastName || ''
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message?.includes('Email not confirmed')) {
          toast({
            title: "Email non confirmé",
            description: "Vérifiez votre email et confirmez votre compte avant de vous connecter.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur CIARA !",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Nettoyer le cache
      if (user?.id) {
        profileCache.delete(user.id);
      }

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur CIARA !",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "Erreur de déconnexion",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [toast, user?.id]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Utilisateur non connecté' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le cache
      profileCache.set(user.id, { profile: data, timestamp: Date.now() });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées.",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [user, toast]);

  const updateEmail = useCallback(async (newEmail: string) => {
    if (!user) return { error: 'Utilisateur non connecté' };

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast({
        title: "Email mis à jour",
        description: "Vérifiez votre nouvel email pour confirmer le changement.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [user, toast]);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!user) return { error: 'Utilisateur non connecté' };

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [user, toast]);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;

    // Nettoyer le cache pour forcer une nouvelle récupération
    profileCache.delete(user.id);
    const profileData = await fetchProfile(user.id);
    
    if (profileData) {
      setProfile(profileData);
    }
    
    return profileData;
  }, [user, fetchProfile]);

  // Valeurs calculées optimisées
  const isAuthenticated = useMemo(() => !!user, [user]);
  const isAdmin = useMemo(() => 
    profile?.role === 'super_admin' || profile?.role === 'tenant_admin', 
    [profile?.role]
  );

  // Fonctions de permission optimisées
  const hasRole = useCallback((requiredRoles: UserRole[]): boolean => {
    return profile?.role ? requiredRoles.includes(profile.role) : false;
  }, [profile?.role]);

  const canManageContent = useCallback((): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
  }, [hasRole]);

  const canViewAnalytics = useCallback((): boolean => {
    return hasRole(['super_admin', 'tenant_admin', 'partner']);
  }, [hasRole]);

  const canManageUsers = useCallback((): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
  }, [hasRole]);

  const isSuperAdmin = useCallback((): boolean => {
    return profile?.role === 'super_admin';
  }, [profile?.role]);

  const isTenantAdmin = useCallback((): boolean => {
    return profile?.role === 'tenant_admin';
  }, [profile?.role]);

  const isPartner = useCallback((): boolean => {
    return profile?.role === 'partner';
  }, [profile?.role]);

  // Retour optimisé avec useMemo
  return useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    hasRole,
    canManageContent,
    canViewAnalytics,
    canManageUsers,
    isSuperAdmin,
    isTenantAdmin,
    isPartner,
  }), [
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    hasRole,
    canManageContent,
    canViewAnalytics,
    canManageUsers,
    isSuperAdmin,
    isTenantAdmin,
    isPartner,
  ]);
}
