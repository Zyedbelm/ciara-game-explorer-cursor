import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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

/**
 * Hook d'authentification ultra-simplifié pour les tests
 * PHASE 2: Version minimale sans real-time, sans setTimeout, sans sur-optimisation
 * PHASE 3: Ajout des fonctions de permission pour compatibilité totale
 */
export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction simple pour récupérer le profil
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  };

  // Initialisation simple sans real-time ni complexité
  useEffect(() => {
    // Vérifier la session initiale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }
      
      setLoading(false);
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Valeurs calculées simples
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'tenant_admin';

  // Fonctions de permission simplifiées mais fonctionnelles
  const hasRole = (requiredRoles: UserRole[]): boolean => {
    return profile?.role ? requiredRoles.includes(profile.role) : false;
  };

  const canManageContent = (): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
  };

  const canViewAnalytics = (): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
  };

  const canManageUsers = (): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
  };

  const isSuperAdmin = (): boolean => {
    return profile?.role === 'super_admin';
  };

  const isTenantAdmin = (): boolean => {
    return profile?.role === 'tenant_admin';
  };

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    
    // Fonctions de permission
    hasRole,
    canManageContent,
    canViewAnalytics,
    canManageUsers,
    isSuperAdmin,
    isTenantAdmin,
    
    // Pour la compatibilité avec les fonctions manquantes
    signUp: () => Promise.resolve({ error: 'Not implemented in simple auth' }),
    signIn: () => Promise.resolve({ error: 'Not implemented in simple auth' }),
    signOut: () => Promise.resolve({ error: 'Not implemented in simple auth' }),
    updateProfile: () => Promise.resolve({ error: 'Not implemented in simple auth' }),
    updateEmail: () => Promise.resolve({ error: 'Not implemented in simple auth' }),
    refreshProfile: () => Promise.resolve(null),
  };
}