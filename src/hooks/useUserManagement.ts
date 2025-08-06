import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  total_points: number;
  current_level: number;
  city_id: string | null;
  city_name?: string | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

interface City {
  id: string;
  name: string;
  slug: string;
  country_id: string;
}

interface Country {
  id: string;
  name_fr: string;
  name_en: string;
  name_de: string;
  code: string;
}

export const useUserManagement = (cityId?: string) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
    fetchCities();
    fetchCountries();
  }, [cityId, profile?.city_id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Check authentication first
      if (!profile) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          role,
          total_points,
          current_level,
          city_id,
          created_at,
          updated_at,
          avatar_url,
          cities(name)
        `);

      if (cityId) {
        query = query.eq('city_id', cityId);
      } else if (profile?.role === 'tenant_admin' && profile?.city_id) {
        query = query.or(`city_id.eq.${profile.city_id},city_id.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const transformedUsers: User[] = (data || []).map((user: any) => ({
        id: user.user_id,
        user_id: user.user_id,
        first_name: user.full_name?.split(' ')[0] || null,
        last_name: user.full_name?.split(' ').slice(1).join(' ') || null,
        email: user.email,
        role: user.role,
        total_points: user.total_points || 0,
        current_level: user.current_level || 1,
        city_id: user.city_id,
        city_name: user.cities?.name || null,
        created_at: user.created_at,
        updated_at: user.updated_at,
        avatar_url: user.avatar_url,
      }));

      setUsers(transformedUsers);
    } catch (error: any) {
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, country_id')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      // Silent error for cities
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name_fr');

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      // Silent error for countries
    }
  };

  const assignCityToUser = async (userId: string, newCityId: string | null) => {
    const user = users.find(u => u.user_id === userId);
    if (!user) return;

    // Security checks
    if (profile?.role === 'tenant_admin') {
      if (user.user_id === profile.user_id) {
        toast({
          title: "Action non autorisée",
          description: "Vous ne pouvez pas modifier votre propre assignation de ville.",
          variant: "destructive",
        });
        return;
      }
      
      if (newCityId && newCityId !== profile.city_id) {
        toast({
          title: "Action non autorisée",
          description: "Vous ne pouvez assigner des utilisateurs qu'à votre propre ville.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ city_id: newCityId })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Ville affectée avec succès",
      });

      await Promise.all([
        fetchUsers(),
        user.user_id === profile?.user_id ? refreshProfile() : Promise.resolve()
      ]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'affecter la ville",
        variant: "destructive",
      });
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.user_id === userId);
    if (!user) return;

    // Security checks
    if (profile?.role === 'tenant_admin') {
      if (user.user_id === profile.user_id) {
        toast({
          title: "Action non autorisée",
          description: "Vous ne pouvez pas modifier votre propre rôle.",
          variant: "destructive",
        });
        return;
      }
      
      if (newRole === 'tenant_admin') {
        toast({
          title: "Action non autorisée",
          description: "Vous ne pouvez pas promouvoir des utilisateurs au rôle d'Admin Ville.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle modifié avec succès",
      });

      await Promise.all([
        fetchUsers(),
        user.user_id === profile?.user_id ? refreshProfile() : Promise.resolve()
      ]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le rôle",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower);

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // City filter (only for super admin)
      const matchesCity = selectedCity === 'all' || 
        (selectedCity === 'none' && !user.city_id) ||
        user.city_id === selectedCity;

      // Country filter (only for super admin)
      const matchesCountry = selectedCountry === 'all' || 
        cities.find(city => city.id === user.city_id)?.country_id === selectedCountry;

      return matchesSearch && matchesRole && matchesCity && matchesCountry;
    });
  }, [users, searchTerm, roleFilter, selectedCity, selectedCountry, cities]);

  return {
    users: filteredUsers,
    cities,
    countries,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCountry,
    setSelectedCountry,
    selectedCity,
    setSelectedCity,
    roleFilter,
    setRoleFilter,
    assignCityToUser,
    changeUserRole,
    deleteUser,
    refreshUsers: fetchUsers
  };
};