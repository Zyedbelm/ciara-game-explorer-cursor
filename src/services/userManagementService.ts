import { supabase } from '@/integrations/supabase/client';

export class UserManagementService {
  static async fetchUsers(cityId?: string, tenantCityId?: string, isTenantAdmin?: boolean) {
    try {
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
      } else if (isTenantAdmin && tenantCityId) {
        query = query.or(`city_id.eq.${tenantCityId},city_id.is.null`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      return (data || []).map((user: any) => ({
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
    } catch (error) {
      console.error('UserManagementService.fetchUsers error:', error);
      throw error;
    }
  }

  static async updateUserCity(userId: string, cityId: string | null) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ city_id: cityId })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating user city:', error);
        throw new Error(`Failed to update user city: ${error.message}`);
      }
    } catch (error) {
      console.error('UserManagementService.updateUserCity error:', error);
      throw error;
    }
  }

  static async updateUserRole(userId: string, role: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: role as any })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error updating user role:', error);
        throw new Error(`Failed to update user role: ${error.message}`);
      }
    } catch (error) {
      console.error('UserManagementService.updateUserRole error:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw new Error(`Failed to delete user: ${error.message}`);
      }
    } catch (error) {
      console.error('UserManagementService.deleteUser error:', error);
      throw error;
    }
  }
}