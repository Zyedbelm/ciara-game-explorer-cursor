import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Users,
  Building2,
  Link,
  Unlink,
  Plus,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city_id: string;
  city_name?: string;
  created_at: string;
  is_active: boolean;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  partner_id?: string;
  created_at: string;
}

interface PartnerLink {
  id: string;
  partner_id: string;
  user_id: string;
  partner_name: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

const PartnerLinkManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [createLinkDialog, setCreateLinkDialog] = useState(false);
  const [deleteLinkDialog, setDeleteLinkDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedLink, setSelectedLink] = useState<PartnerLink | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Récupérer tous les partenaires
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select(`*, cities(name)`)
        .order('name');
      if (partnersError) throw partnersError;

      // 2. Récupérer tous les profils utilisateurs avec rôle 'partner'
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'partner')
        .order('full_name');
      if (userProfilesError) throw userProfilesError;

      // 3. Récupérer les liens existants avec les données des partenaires
      const { data: linksData, error: linksError } = await supabase
        .from('partner_user_links')
        .select(`*, partners(name)`)
        .order('created_at', { ascending: false });
      if (linksError) throw linksError;

      // 4. Récupérer les profils utilisateurs pour les liens
      const userIds = linksData?.map(link => link.user_id) || [];
      const { data: linkedProfilesData, error: linkedProfilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      if (linkedProfilesError) throw linkedProfilesError;

      // 5. Fusionner les données pour enrichir les liens
      const enrichedLinks = linksData?.map(link => {
        const profile = linkedProfilesData?.find(p => p.user_id === link.user_id);
        return {
          ...link,
          partner_name: link.partners?.name,
          user_name: profile?.full_name || 'Utilisateur inconnu',
          user_email: profile?.email || 'Email inconnu'
        };
      }) || [];

      setPartners(partnersData || []);
      setUserProfiles(userProfilesData || []);
      setPartnerLinks(enrichedLinks);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!selectedPartner || !selectedUser) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un partenaire et un utilisateur",
        variant: "destructive",
      });
      return;
    }

    try {
      // Vérifier si le lien existe déjà
      const existingLink = partnerLinks.find(
        link => link.partner_id === selectedPartner && link.user_id === selectedUser
      );

      if (existingLink) {
        toast({
          title: "Erreur",
          description: "Ce lien existe déjà",
          variant: "destructive",
        });
        return;
      }

      // Créer le lien
      const { error } = await supabase
        .from('partner_user_links')
        .insert({
          partner_id: selectedPartner,
          user_id: selectedUser
        });

      if (error) throw error;

      // Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ partner_id: selectedPartner })
        .eq('user_id', selectedUser);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "Lien créé avec succès",
      });

      setCreateLinkDialog(false);
      setSelectedPartner('');
      setSelectedUser('');
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la création du lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async () => {
    if (!selectedLink) return;

    try {
      // Supprimer le lien
      const { error } = await supabase
        .from('partner_user_links')
        .delete()
        .eq('id', selectedLink.id);

      if (error) throw error;

      // Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ partner_id: null })
        .eq('user_id', selectedLink.user_id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "Lien supprimé avec succès",
      });

      setDeleteLinkDialog(false);
      setSelectedLink(null);
      fetchData();

    } catch (error) {
      console.error('Erreur lors de la suppression du lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (link: PartnerLink) => {
    setSelectedLink(link);
    setDeleteLinkDialog(true);
  };

  const filteredLinks = partnerLinks.filter(link => {
    const matchesSearch = 
      link.partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'linked' && link.id) ||
      (filterStatus === 'unlinked' && !link.id);
    
    return matchesSearch && matchesStatus;
  });

  const getAvailablePartners = () => {
    return partners.filter(partner => 
      !partnerLinks.some(link => link.partner_id === partner.id)
    );
  };

  const getAvailableUsers = () => {
    return userProfiles.filter(user => 
      !partnerLinks.some(link => link.user_id === user.user_id)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gestion des Liens Partenaires
          </h1>
          <p className="text-muted-foreground">
            Associez les profils utilisateurs aux partenaires pour leur donner accès au tableau de bord
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partenaires</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">
                {partners.filter(p => p.is_active).length} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profils Partenaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfiles.length}</div>
              <p className="text-xs text-muted-foreground">
                {userProfiles.filter(u => u.partner_id).length} liés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liens Actifs</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerLinks.length}</div>
              <p className="text-xs text-muted-foreground">
                {userProfiles.filter(u => !u.partner_id).length} non liés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Actions
              </CardTitle>
              <Button onClick={() => setCreateLinkDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un Lien
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les liens</SelectItem>
                  <SelectItem value="linked">Liés</SelectItem>
                  <SelectItem value="unlinked">Non liés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des liens */}
        <Card>
          <CardHeader>
            <CardTitle>Liens Partenaires-Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partenaire</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de Création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Aucun lien trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="font-medium">{link.partner_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{link.user_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {link.user_email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(link.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteDialog(link)}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de création de lien */}
        <Dialog open={createLinkDialog} onOpenChange={setCreateLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Lien Partenaire-Utilisateur</DialogTitle>
              <DialogDescription>
                Associez un profil utilisateur à un partenaire pour lui donner accès au tableau de bord partenaire.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">Partenaire</label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un partenaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePartners().map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name} ({partner.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableUsers().map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateLinkDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateLink}>
                Créer le Lien
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de suppression */}
        <AlertDialog open={deleteLinkDialog} onOpenChange={setDeleteLinkDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le Lien</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le lien entre {selectedLink?.partner_name} et {selectedLink?.user_name} ? 
                L'utilisateur perdra l'accès au tableau de bord partenaire.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteLink}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export { PartnerLinkManagement }; 