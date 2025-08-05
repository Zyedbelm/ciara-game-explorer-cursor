import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Crown, Shield, User, Building2, Store } from 'lucide-react';
import { UserActions } from './UserActions';

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

interface UserTableProps {
  users: User[];
  onAssignCity: (user: User) => void;
  onChangeRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  canModifyUser: (user: User) => boolean;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'tenant_admin': return 'Admin Ville';
    case 'partner':
      return 'Partenaire';
    case 'visitor': return 'Explorateur';
    default: return 'Explorateur';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <Shield className="h-3 w-3" />;
    case 'tenant_admin':
      return <Building2 className="h-3 w-3" />;
    case 'partner':
      return <Store className="h-3 w-3" />;
    case 'visitor':
    default:
      return <User className="h-3 w-3" />;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'default';
    case 'tenant_admin':
      return 'secondary';
    case 'partner':
      return 'destructive';
    case 'visitor':
    default:
      return 'outline';
  }
};

const getUserInitials = (user: User) => {
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
};

const getUserDisplayName = (user: User) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email || 'Utilisateur sans nom';
};

export const UserTable = ({
  users,
  onAssignCity,
  onChangeRole,
  onDeleteUser,
  canModifyUser
}: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Ville</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Niveau</TableHead>
          <TableHead>Inscription</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.user_id}>
            <TableCell className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {getUserDisplayName(user)}
                </p>
              </div>
            </TableCell>
            <TableCell className="font-mono text-sm">
              {user.email}
            </TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role) as any} className="flex items-center gap-1 w-fit">
                {getRoleIcon(user.role)}
                {getRoleLabel(user.role)}
              </Badge>
            </TableCell>
            <TableCell>
              {user.city_name ? (
                <Badge variant="outline">{user.city_name}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">Non assigné</span>
              )}
            </TableCell>
            <TableCell className="font-mono">
              {user.total_points?.toLocaleString() || 0}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                Niveau {user.current_level || 1}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </TableCell>
            <TableCell className="text-right">
              <UserActions
                user={user}
                onAssignCity={onAssignCity}
                onChangeRole={onChangeRole}
                onDeleteUser={onDeleteUser}
                canModifyUser={canModifyUser(user)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};