import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PartnerDashboardLayout from './PartnerDashboardLayout';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Gift,
  Star,
  ShoppingCart,
  Search
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  value_chf: number;
  is_active: boolean;
  max_redemptions: number;
  max_redemptions_per_user: number;
  validity_days: number;
  created_at: string;
  total_redemptions: number;
  average_rating: number;
}

const PartnerRewardsManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Formulaire pour créer/éditer une récompense
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_required: 0,
    value_chf: 0,
    is_active: true,
    max_redemptions: 100,
    max_redemptions_per_user: 1,
    validity_days: 30
  });

  // Récupérer les récompenses du partenaire
  useEffect(() => {
    const fetchRewards = async () => {
      if (!profile?.partner_id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('rewards')
          .select(`
            *,
            reward_redemptions(count)
          `)
          .eq('partner_id', profile.partner_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformer les données pour inclure le nombre de rédactions
        const transformedRewards = data?.map(reward => ({
          ...reward,
          total_redemptions: reward.reward_redemptions?.[0]?.count || 0,
          average_rating: 4.2 // À calculer avec de vraies données
        })) || [];

        setRewards(transformedRewards);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les récompenses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [profile?.partner_id, toast]);

  // Filtrer les récompenses
  const filteredRewards = rewards.filter(reward =>
    reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReward = async () => {
    if (!profile?.partner_id) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert([{
          ...formData,
          partner_id: profile.partner_id
        }])
        .select()
        .single();

      if (error) throw error;

      setRewards(prev => [data, ...prev]);
      setIsCreating(false);
      setFormData({
        title: '',
        description: '',
        points_required: 0,
        value_chf: 0,
        is_active: true,
        max_redemptions: 100,
        max_redemptions_per_user: 1,
        validity_days: 30
      });

      toast({
        title: "Succès",
        description: "Récompense créée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la récompense",
        variant: "destructive",
      });
    }
  };

  const handleUpdateReward = async () => {
    if (!editingReward) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .update(formData)
        .eq('id', editingReward.id)
        .select()
        .single();

      if (error) throw error;

      setRewards(prev => prev.map(r => r.id === editingReward.id ? data : r));
      setEditingReward(null);
      setFormData({
        title: '',
        description: '',
        points_required: 0,
        value_chf: 0,
        is_active: true,
        max_redemptions: 100,
        max_redemptions_per_user: 1,
        validity_days: 30
      });

      toast({
        title: "Succès",
        description: "Récompense mise à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la récompense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette récompense ?')) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;

      setRewards(prev => prev.filter(r => r.id !== rewardId));
      toast({
        title: "Succès",
        description: "Récompense supprimée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la récompense",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  if (loading) {
    return (
      <PartnerDashboardLayout title="Gestion des Récompenses">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PartnerDashboardLayout>
    );
  }

  return (
    <PartnerDashboardLayout title="Gestion des Récompenses">
      <div className="space-y-6">
        {/* En-tête avec recherche et bouton d'ajout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Récompense
          </Button>
        </div>

        {/* Formulaire de création/édition */}
        {(isCreating || editingReward) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Créer une nouvelle récompense' : 'Modifier la récompense'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de la récompense"
                  />
                </div>
                <div>
                  <Label htmlFor="points">Points requis</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="value">Valeur (CHF)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value_chf}
                    onChange={(e) => setFormData(prev => ({ ...prev, value_chf: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="max_redemptions">Max rédactions</Label>
                  <Input
                    id="max_redemptions"
                    type="number"
                    value={formData.max_redemptions}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_redemptions: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la récompense"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Récompense active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={isCreating ? handleCreateReward : handleUpdateReward}>
                  {isCreating ? 'Créer' : 'Mettre à jour'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingReward(null);
                    setFormData({
                      title: '',
                      description: '',
                      points_required: 0,
                      value_chf: 0,
                      is_active: true,
                      max_redemptions: 100,
                      max_redemptions_per_user: 1,
                      validity_days: 30
                    });
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des récompenses */}
        <Card>
          <CardHeader>
            <CardTitle>Vos Récompenses ({filteredRewards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Récompense</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Rédactions</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reward.title}</div>
                        <div className="text-sm text-muted-foreground">{reward.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{reward.points_required}</TableCell>
                    <TableCell>{formatCurrency(reward.value_chf)}</TableCell>
                    <TableCell>{reward.total_redemptions}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {reward.average_rating?.toFixed(1) || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                        {reward.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingReward(reward);
                            setFormData({
                              title: reward.title,
                              description: reward.description,
                              points_required: reward.points_required,
                              value_chf: reward.value_chf,
                              is_active: reward.is_active,
                              max_redemptions: reward.max_redemptions,
                              max_redemptions_per_user: reward.max_redemptions_per_user,
                              validity_days: reward.validity_days
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReward(reward.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PartnerDashboardLayout>
  );
};

export default PartnerRewardsManagement; 