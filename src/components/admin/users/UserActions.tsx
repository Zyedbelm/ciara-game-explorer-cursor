import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, MapPin, UserCog, Trash2 } from 'lucide-react';

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

interface UserActionsProps {
  user: User;
  onAssignCity: (user: User) => void;
  onChangeRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  canModifyUser: boolean;
}

export const UserActions = ({ 
  user, 
  onAssignCity, 
  onChangeRole, 
  onDeleteUser, 
  canModifyUser 
}: UserActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canModifyUser && (
          <>
            <DropdownMenuItem onClick={() => onAssignCity(user)}>
              <MapPin className="mr-2 h-4 w-4" />
              Affecter ville
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeRole(user)}>
              <UserCog className="mr-2 h-4 w-4" />
              Modifier rôle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeleteUser(user)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};