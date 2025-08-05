
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use ref to store stable fetchProfile function to avoid useEffect dependency issues
  const fetchProfileRef = useRef<(userId: string) => Promise<any>>();
  
  // Create fetchProfile function that doesn't change reference
  fetchProfileRef.current = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no data found

      if (error) {
        console.error('⚠️ Profile fetch error:', error.message);
        return null;
      }

      if (data) {
        console.log('✅ Profile fetched successfully:', data);
      } else {
        console.log('⚠️ No profile found for user:', userId);
      }
      return data;
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);
      return null;
    }
  };

  // Stable fetchProfile wrapper
  const fetchProfile = useCallback(async (userId: string) => {
    return fetchProfileRef.current!(userId);
  }, []);

  // Initialize auth state with proper cleanup and real-time updates
  useEffect(() => {
    let mounted = true;
    let profileSubscription: any = null;
    console.log('🔧 Initializing auth state');

    const handleAuthStateChange = (event: string, session: Session | null) => {
      if (!mounted) {
        console.log('🚫 Component unmounted, ignoring auth change');
        return;
      }

      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      // Handle PASSWORD_RECOVERY events with automatic redirection to preserve URL parameters
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 PASSWORD_RECOVERY event detected, redirecting to reset-password with params');
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        
        // Extract all current URL parameters and hash
        const searchParams = url.search;
        const hash = url.hash;
        
        // Construct the reset-password URL with all parameters preserved
        const resetUrl = `/reset-password${searchParams}${hash}`;
        console.log('🔗 Redirecting to:', resetUrl);
        
        // Use replace to avoid adding to browser history
        window.location.replace(resetUrl);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer profile fetch to avoid blocking auth state change
        setTimeout(async () => {
          if (mounted) {
            const profileData = await fetchProfileRef.current!(session.user.id);
            if (mounted) {
              setProfile(profileData);
              
              // Set up real-time profile updates
              if (profileSubscription) {
                supabase.removeChannel(profileSubscription);
              }
              
              profileSubscription = supabase
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
                    console.log('🔄 Profile updated in real-time:', payload);
                    if (mounted && payload.new) {
                      setProfile(payload.new as Profile);
                    }
                  }
                )
                .subscribe();
            }
          }
        }, 0);
      } else {
        setProfile(null);
        // Clean up profile subscription
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
          profileSubscription = null;
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    // Handle custom profile update events (for immediate local updates)
    const handleProfileUpdate = (event: CustomEvent) => {
      if (mounted && event.detail) {
        console.log('🔄 Handling custom profile update:', event.detail);
        setProfile(event.detail);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Set up custom event listener for immediate profile updates
    window.addEventListener('profile-updated', handleProfileUpdate as EventListener);

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthStateChange('INITIAL_SESSION', session);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth state');
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener);
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []); // Remove fetchProfile dependency to prevent infinite loops

  // Stable auth functions with useCallback
  const signUp = useCallback(async (email: string, password: string, userData?: {
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      console.log('📝 Starting sign up for:', email);
      // Use the same base URL as in auth-webhook
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
        console.error('❌ Sign up error:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Sign up successful');
      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Sign up failed:', errorMessage);
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
      console.log('🔐 Starting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        // Check for email verification requirement
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

      console.log('✅ Sign in successful');
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Sign in failed:', errorMessage);
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
      console.log('🚪 Starting sign out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        toast({
          title: "Erreur de déconnexion",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Sign out successful');
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Sign out failed:', errorMessage);
      toast({
        title: "Erreur de déconnexion",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [toast]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Non connecté' };

    try {
      console.log('📝 Updating profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        toast({
          title: "Erreur de mise à jour",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setProfile(data);
      console.log('✅ Profile updated successfully');
      
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Profile update failed:', errorMessage);
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [user, toast]);

  const updateEmail = useCallback(async (newEmail: string) => {
    if (!user) return { error: 'Non connecté' };

    try {
      console.log('📧 Updating email for user:', user.id);
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        console.error('❌ Email update error:', error);
        toast({
          title: "Erreur de mise à jour",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Email update successful');
      toast({
        title: "Email de confirmation envoyé",
        description: "Vérifiez votre nouvelle adresse email pour confirmer le changement.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Email update failed:', errorMessage);
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  }, [user, toast]);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!user) return { error: 'Non connecté' };

    try {
      console.log('🔐 Updating password for user:', user.id);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update error:', error);
        
        // Handle specific Supabase error for same password
        if (error.message?.includes('same_password') || error.message?.includes('New password should be different')) {
          toast({
            title: "Erreur de mise à jour",
            description: "Le nouveau mot de passe doit être différent de l'ancien.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de mise à jour",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      console.log('✅ Password updated successfully');
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('❌ Password update failed:', errorMessage);
      toast({
        title: "Erreur de mise à jour",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error: errorMessage };
    }
  }, [user, toast]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    console.log('🔄 Refreshing profile for user:', user.id);
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      console.log('✅ Profile refreshed successfully:', profileData);
    }
    return profileData;
  }, [user, fetchProfile]);

  // Stable computed values with useMemo
  const isAuthenticated = useMemo(() => !!user, [user]);
  const isAdmin = useMemo(() => 
    profile?.role === 'super_admin' || profile?.role === 'tenant_admin', 
    [profile?.role]
  );

  // Stable permission functions
  const hasRole = useCallback((requiredRoles: UserRole[]): boolean => {
    return profile?.role ? requiredRoles.includes(profile.role) : false;
  }, [profile?.role]);

  const canManageContent = useCallback((): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
  }, [hasRole]);

  const canViewAnalytics = useCallback((): boolean => {
    return hasRole(['super_admin', 'tenant_admin']);
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

  // Return memoized object to prevent unnecessary re-renders
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
    
    // Permission functions
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
