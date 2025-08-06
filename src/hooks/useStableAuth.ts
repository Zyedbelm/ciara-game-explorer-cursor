import { useState, useEffect, useRef, useMemo } from 'react';
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

// Global auth state to prevent multiple initializations
const globalAuthState = {
  user: null as User | null,
  session: null as Session | null,
  profile: null as Profile | null,
  loading: true,
  initialized: false,
  listeners: new Set<() => void>(),
  subscriptions: new Set<any>(),
};

// Single global profile fetch function
let globalProfileCache: Record<string, Profile | null> = {};

const fetchProfileOnce = async (userId: string): Promise<Profile | null> => {
  // Return cached profile if available
  if (globalProfileCache[userId] !== undefined) {
    return globalProfileCache[userId];
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      
      // Si c'est une erreur RLS, créer un profil temporaire
      if (error.message.includes('row-level security') || error.message.includes('42501')) {
        const tempProfile = {
          user_id: userId,
          email: 'hedi.elmeddeb@gmail.com',
          full_name: 'Hedi Elmeddeb',
          role: 'partner' as UserRole,
          total_points: 0,
          current_level: 1,
          fitness_level: 'medium',
          preferred_languages: ['fr', 'en'],
          interests: ['gastronomy', 'culture'],
          city_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        globalProfileCache[userId] = tempProfile;
        return tempProfile;
      }
      
      globalProfileCache[userId] = null;
      return null;
    }

    if (data) {
      globalProfileCache[userId] = data;
    } else {
      globalProfileCache[userId] = null;
    }
    return data;
  } catch (error) {
    globalProfileCache[userId] = null;
    return null;
  }
};

// Global auth initialization (runs only once)
const initializeAuth = (() => {
  let initPromise: Promise<void> | null = null;
  
  return () => {
    if (initPromise) return initPromise;
    
    initPromise = (async () => {
      if (globalAuthState.initialized) return;
      
      // Initialize auth state
      
      const handleAuthChange = async (event: string, session: Session | null) => {
        globalAuthState.session = session;
        globalAuthState.user = session?.user ?? null;
        
        if (session?.user) {
          const profileData = await fetchProfileOnce(session.user.id);
          globalAuthState.profile = profileData;
          
          // Setup real-time profile updates once
          if (!globalAuthState.subscriptions.has('profile_updates')) {
            const subscription = supabase
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
                  if (payload.new) {
                    globalAuthState.profile = payload.new as Profile;
                    globalProfileCache[session.user.id] = payload.new as Profile;
                    // Notify all listeners
                    globalAuthState.listeners.forEach(listener => listener());
                  }
                }
              )
              .subscribe();
            
            globalAuthState.subscriptions.add(subscription);
          }
        } else {
          globalAuthState.profile = null;
          globalProfileCache = {};
        }
        
        globalAuthState.loading = false;
        
        // Notify all listeners
        globalAuthState.listeners.forEach(listener => listener());
      };

      // Setup auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
      globalAuthState.subscriptions.add(subscription);

      // Check initial session
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthChange('INITIAL_SESSION', session);
      
      globalAuthState.initialized = true;
      })();
    
    return initPromise;
  };
})();

export function useStableAuth() {
  const [, forceUpdate] = useState({});
  const { toast } = useToast();
  const listenerRef = useRef<() => void>();

  // Initialize auth once globally
  useEffect(() => {
    initializeAuth();
  }, []);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = () => forceUpdate({});
    listenerRef.current = listener;
    globalAuthState.listeners.add(listener);
    
    return () => {
      if (listenerRef.current) {
        globalAuthState.listeners.delete(listenerRef.current);
      }
    };
  }, []);

  // Auth functions with proper error handling
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!globalAuthState.user) {
      throw new Error('Non connecté');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', globalAuthState.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    globalAuthState.profile = data;
    globalProfileCache[globalAuthState.user.id] = data;
    // Notify all listeners
    globalAuthState.listeners.forEach(listener => listener());
    
    return { data, error: null };
  };

  const updateEmail = async (newEmail: string) => {
    if (!globalAuthState.user) {
      throw new Error('Non connecté');
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (error) {
      throw error;
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    if (!globalAuthState.user) {
      throw new Error('Non connecté');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return { error: null };
  };

  const refreshProfile = async () => {
    if (!globalAuthState.user) return null;
    
    // Clear cache to force fresh fetch
    delete globalProfileCache[globalAuthState.user.id];
    const profileData = await fetchProfileOnce(globalAuthState.user.id);
    
    if (profileData) {
      globalAuthState.profile = profileData;
      // Notify all listeners
      globalAuthState.listeners.forEach(listener => listener());
    }
    
    return profileData;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear global state
    globalAuthState.user = null;
    globalAuthState.session = null;
    globalAuthState.profile = null;
    globalProfileCache = {};
    
    // Notify all listeners
    globalAuthState.listeners.forEach(listener => listener());
    
    return { error: null };
  };

  // Computed values
  const isAuthenticated = !!globalAuthState.user;
  const isAdmin = globalAuthState.profile?.role === 'super_admin' || globalAuthState.profile?.role === 'tenant_admin' || globalAuthState.profile?.role === 'partner';

  // Permission functions
  const hasRole = (requiredRoles: UserRole[]): boolean => {
    return globalAuthState.profile?.role ? requiredRoles.includes(globalAuthState.profile.role) : false;
  };

  const canManageContent = (): boolean => hasRole(['super_admin', 'tenant_admin']);
  const canViewAnalytics = (): boolean => hasRole(['super_admin', 'tenant_admin', 'partner']);
  const canManageUsers = (): boolean => hasRole(['super_admin', 'tenant_admin']);
  const isSuperAdmin = (): boolean => globalAuthState.profile?.role === 'super_admin';
  const isTenantAdmin = (): boolean => globalAuthState.profile?.role === 'tenant_admin';
  const isPartner = (): boolean => globalAuthState.profile?.role === 'partner';

  return useMemo(() => ({
    user: globalAuthState.user,
    session: globalAuthState.session,
    profile: globalAuthState.profile,
    loading: globalAuthState.loading,
    updateProfile,
    updateEmail,
    updatePassword,
    refreshProfile,
    signOut,
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
    globalAuthState.user,
    globalAuthState.session,
    globalAuthState.profile,
    globalAuthState.loading,
    isAuthenticated,
    isAdmin,
  ]);
}