import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

interface UserDialogsProps {
  // Assign City Dialog
  assignCityDialog: boolean;
  setAssignCityDialog: (open: boolean) => void;
  selectedUser: User | null;
  selectedCityId: string;
  setSelectedCityId: (cityId: string) => void;
  cities: City[];
  onAssignCity: () => void;
  
  // Change Role Dialog
  changeRoleDialog: boolean;
  setChangeRoleDialog: (open: boolean) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  onChangeRole: () => void;
  
  // Delete User Dialog
  deleteUserDialog: boolean;
  setDeleteUserDialog: (open: boolean) => void;
  onDeleteUser: () => void;
}

export const UserDialogs = ({
  assignCityDialog,
  setAssignCityDialog,
  selectedUser,
  selectedCityId,
  setSelectedCityId,
  cities,
  onAssignCity,
  changeRoleDialog,
  setChangeRoleDialog,
  selectedRole,
  setSelectedRole,
  onChangeRole,
  deleteUserDialog,
  setDeleteUserDialog,
  onDeleteUser
}: UserDialogsProps) => {
  return (
    <>
      {/* Assign City Dialog */}
      <Dialog open={assignCityDialog} onOpenChange={setAssignCityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Affecter une ville</DialogTitle>
            <DialogDescription>
              Choisissez une ville pour l'utilisateur {selectedUser?.first_name} {selectedUser?.last_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune ville</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignCityDialog(false)}>
              Annuler
            </Button>
            <Button onClick={onAssignCity}>
              Affecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialog} onOpenChange={setChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Changer le rôle de {selectedUser?.first_name} {selectedUser?.last_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visitor">Explorateur</SelectItem>
                <SelectItem value="tenant_admin">Admin Ville</SelectItem>
                <SelectItem value="partner">Partenaire</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialog(false)}>
              Annuler
            </Button>
            <Button onClick={onChangeRole}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur {selectedUser?.first_name} {selectedUser?.last_name} ({selectedUser?.email}) ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};