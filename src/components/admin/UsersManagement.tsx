import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, BarChart3 } from 'lucide-react';
import { useOptimizedUserManagement } from '@/hooks/useOptimizedUserManagement';
import { UserFilters } from './users/UserFilters';
import { OptimizedUserTable } from './users/OptimizedUserTable';
import { UserDialogs } from './users/UserDialogs';

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

interface UsersManagementProps {
  cityId?: string;
}

const UsersManagement = ({ cityId }: UsersManagementProps) => {
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut } = useAuth();
  const {
    users,
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
    deleteUser
  } = useOptimizedUserManagement(cityId);

  // Dialog states
  const [assignCityDialog, setAssignCityDialog] = useState(false);
  const [changeRoleDialog, setChangeRoleDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const openAssignCityDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedCityId(user.city_id || 'none');
    setAssignCityDialog(true);
  };

  const openChangeRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setChangeRoleDialog(true);
  };

  const openDeleteUserDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteUserDialog(true);
  };

  const handleAssignCity = async () => {
    if (!selectedUser) return;
    const cityIdToAssign = selectedCityId === "none" ? null : selectedCityId;
    await assignCityToUser(selectedUser.user_id, cityIdToAssign);
    setAssignCityDialog(false);
    setSelectedUser(null);
    setSelectedCityId('');
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return;
    await changeUserRole(selectedUser.user_id, selectedRole);
    setChangeRoleDialog(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await deleteUser(selectedUser.user_id);
    setDeleteUserDialog(false);
    setSelectedUser(null);
  };

  const canModifyUser = (user: User) => {
    if (profile?.role === 'super_admin') return true;
    if (profile?.role === 'tenant_admin') {
      if (user.user_id === profile.user_id) return false;
      return user.city_id === profile.city_id || user.city_id === null;
    }
    return false;
  };

  const getAvailableCities = () => {
    if (profile?.role === 'super_admin') {
      return cities;
    }
    if (profile?.role === 'tenant_admin' && profile.city_id) {
      return cities.filter(city => city.id === profile.city_id);
    }
    return [];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            cities={cities}
            countries={countries}
            isTenantAdmin={profile?.role === 'tenant_admin'}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OptimizedUserTable
            users={users}
            onAssignCity={openAssignCityDialog}
            onChangeRole={openChangeRoleDialog}
            onDeleteUser={openDeleteUserDialog}
            canModifyUser={canModifyUser}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserDialogs
        assignCityDialog={assignCityDialog}
        setAssignCityDialog={setAssignCityDialog}
        selectedUser={selectedUser}
        selectedCityId={selectedCityId}
        setSelectedCityId={setSelectedCityId}
        cities={getAvailableCities()}
        onAssignCity={handleAssignCity}
        changeRoleDialog={changeRoleDialog}
        setChangeRoleDialog={setChangeRoleDialog}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onChangeRole={handleChangeRole}
        deleteUserDialog={deleteUserDialog}
        setDeleteUserDialog={setDeleteUserDialog}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default UsersManagement;