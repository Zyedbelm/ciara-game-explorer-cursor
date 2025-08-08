import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

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

// Singleton global pour éviter les initialisations multiples
class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;
  private session: Session | null = null;
  private profile: Profile | null = null;
  private loading = true;
  private initialized = false;
  private listeners = new Set<() => void>();
  private profileCache = new Map<string, { profile: Profile | null; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private subscription: any = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private async fetchProfile(userId: string): Promise<Profile | null> {
    // Vérifier le cache
    const cached = this.profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.profile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch error:', error);
        return null;
      }

      // Mettre en cache
      this.profileCache.set(userId, { profile: data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  }

  private async handleAuthChange(event: string, session: Session | null) {
    try {
      this.session = session;
      this.user = session?.user ?? null;

      if (session?.user) {
        // Nettoyer l'ancienne subscription
        if (this.subscription) {
          supabase.removeChannel(this.subscription);
          this.subscription = null;
        }

        // Récupérer le profil avec timeout
        this.profile = await Promise.race([
          this.fetchProfile(session.user.id),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          )
        ]).catch(() => null);

      // Configurer la subscription en temps réel (une seule fois)
      if (!this.subscription) {
        this.subscription = supabase
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
                this.profile = payload.new as Profile;
                this.profileCache.set(session.user.id, { 
                  profile: this.profile, 
                  timestamp: Date.now() 
                });
                this.notifyListeners();
              }
            }
          )
          .subscribe();
      }
    } else {
      this.profile = null;
      this.profileCache.clear();
      
      if (this.subscription) {
        supabase.removeChannel(this.subscription);
        this.subscription = null;
      }
    }

    this.loading = false;
    this.notifyListeners();
    } catch (error) {
      console.error('Auth change error:', error);
      this.loading = false;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  async initialize() {
    if (this.initialized) return;

    // Configuration de l'écouteur d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      this.handleAuthChange.bind(this)
    );

    // Vérification de la session initiale
    const { data: { session } } = await supabase.auth.getSession();
    await this.handleAuthChange('INITIAL_SESSION', session);

    this.initialized = true;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return {
      user: this.user,
      session: this.session,
      profile: this.profile,
      loading: this.loading,
      isAuthenticated: !!this.user
    };
  }

  async refreshProfile() {
    if (this.user) {
      this.profile = await this.fetchProfile(this.user.id);
      this.notifyListeners();
    }
  }

  async updateProfile(updates: Partial<Profile>) {
    if (!this.user) return { error: 'Non authentifié' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', this.user.id)
        .select()
        .single();

      if (error) throw error;

      this.profile = data;
      this.profileCache.set(this.user.id, { profile: data, timestamp: Date.now() });
      this.notifyListeners();

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erreur de mise à jour' };
    }
  }

  async signOut() {
    try {
      await supabase.auth.signOut();
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erreur de déconnexion' };
    }
  }
}

// Hook optimisé qui utilise le singleton
export function useOptimizedAuth() {
  const [state, setState] = useState(() => AuthManager.getInstance().getState());
  const { toast } = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    // Initialiser si nécessaire
    authManager.initialize();
    
    // S'abonner aux changements
    unsubscribeRef.current = authManager.subscribe(() => {
      setState(authManager.getState());
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    await AuthManager.getInstance().refreshProfile();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const result = await AuthManager.getInstance().updateProfile(updates);
    
    if (result.error) {
      toast({
        title: "Erreur de mise à jour",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées.",
      });
    }
    
    return result;
  }, [toast]);

  const signOut = useCallback(async () => {
    const result = await AuthManager.getInstance().signOut();
    
    if (result.error) {
      toast({
        title: "Erreur de déconnexion",
        description: result.error,
        variant: "destructive",
      });
    }
    
    return result;
  }, [toast]);

  // Valeurs calculées optimisées
  const isAuthenticated = useMemo(() => !!state.user, [state.user]);
  const isAdmin = useMemo(() => 
    state.profile?.role === 'super_admin' || state.profile?.role === 'tenant_admin',
    [state.profile?.role]
  );
  const isPartner = useMemo(() => 
    state.profile?.role === 'partner',
    [state.profile?.role]
  );
  const hasRole = useCallback((roles: UserRole[]) => 
    state.profile ? roles.includes(state.profile.role) : false,
    [state.profile]
  );

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated,
    isAdmin,
    isPartner,
    hasRole,
    refreshProfile,
    updateProfile,
    signOut
  };
}
