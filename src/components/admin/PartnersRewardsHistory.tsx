import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimplifiedTranslations } from '@/hooks/useSimplifiedTranslations';

interface RedemptionHistoryData {
  id: string;
  redeemed_at: string;
  points_spent: number;
  status: string;
  reward_id: string;
  user_id: string;
  rewards: {
    id: string;
    title: string;
    value_chf: number;
    partner_id: string;
    partners: {
      id: string;
      name: string;
      cities: {
        name: string;
      };
    };
  };
  profiles: {
    user_id: string;
    full_name: string;
    email: string;
  };
}

interface PartnersRewardsHistoryProps {
  selectedCountry?: string;
  selectedCity?: string;
  selectedPartner?: string;
  userRole: string;
}

const PartnersRewardsHistory: React.FC<PartnersRewardsHistoryProps> = ({
  selectedCountry,
  selectedCity,
  selectedPartner,
  userRole
}) => {
  const [redemptions, setRedemptions] = useState<RedemptionHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Array<{ id: string; name: string; cities: { name: string } }>>([]);
  const { toast } = useToast();
  const { t } = useSimplifiedTranslations();

  // Récupérer les partenaires disponibles
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        let query = supabase
          .from('partners')
          .select(`
            id,
            name,
            cities(name)
          `);

        // Filtrer par ville si Admin Ville
        if (userRole === 'tenant_admin' && selectedCity) {
          query = query.eq('city_id', selectedCity);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching partners:', error);
          throw error;
        }

        setPartners(data || []);
      } catch (error) {
        console.error('🚨 Error in fetchPartners:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger la liste des partenaires.',
          variant: 'destructive',
        });
      }
    };

    fetchPartners();
  }, [selectedCity, userRole, toast]);

  // Récupérer l'historique des récompenses
  useEffect(() => {
    const fetchRedemptionsHistory = async () => {
      if (!selectedPartner && userRole !== 'super_admin') return;

      try {
        setLoading(true);
        console.log('🔍 [DEBUG] Starting fetchRedemptionsHistory with params:', {
          selectedPartner,
          selectedCity,
          userRole
        });

        // Étape 1: Récupérer les redemptions avec rewards et partners
        let query = supabase
          .from('reward_redemptions')
          .select(`
            id,
            redeemed_at,
            points_spent,
            status,
            reward_id,
            user_id,
            rewards(
              id,
              title,
              value_chf,
              partner_id,
              partners(
                id,
                name,
                cities(name)
              )
            )
          `)
          .order('redeemed_at', { ascending: false });

        console.log('🔍 [DEBUG] Base query created, applying filters...');

        // Filtrer par partenaire si sélectionné
        if (selectedPartner && selectedPartner !== 'all') {
          console.log('🔍 [DEBUG] Applying partner filter:', selectedPartner);
          query = query.eq('rewards.partner_id', selectedPartner);
        }
        // Filtrer par ville si Admin Ville
        else if (userRole === 'tenant_admin' && selectedCity && selectedCity !== 'all') {
          console.log('🔍 [DEBUG] Applying city filter:', selectedCity);
          query = query.eq('rewards.partners.city_id', selectedCity);
        }

        console.log('🔍 [DEBUG] Executing redemptions query...');
        const { data: redemptionsData, error: redemptionsError } = await query;

        if (redemptionsError) {
          console.error('❌ [DEBUG] Redemptions error details:', {
            message: redemptionsError.message,
            details: redemptionsError.details,
            hint: redemptionsError.hint,
            code: redemptionsError.code
          });
          throw redemptionsError;
        }

        console.log('✅ [DEBUG] Redemptions query successful, count:', redemptionsData?.length || 0);

        // Étape 2: Récupérer les profils séparément
        const userIds = redemptionsData?.map(r => r.user_id) || [];
        console.log('🔍 [DEBUG] Fetching profiles for user IDs:', userIds);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('❌ [DEBUG] Profiles error details:', {
            message: profilesError.message,
            details: profilesError.details,
            hint: profilesError.hint,
            code: profilesError.code
          });
          throw profilesError;
        }

        console.log('✅ [DEBUG] Profiles query successful, count:', profilesData?.length || 0);

        // Étape 3: Combiner les données
        const enrichedRedemptions = redemptionsData?.map(redemption => {
          const profile = profilesData?.find(p => p.user_id === redemption.user_id);
          return {
            ...redemption,
            profiles: {
              user_id: profile?.user_id || '',
              full_name: profile?.full_name || 'Utilisateur inconnu',
              email: profile?.email || 'email@inconnu.com'
            }
          };
        }) || [];

        console.log('✅ [DEBUG] Data combined successfully, final count:', enrichedRedemptions.length);
        console.log('✅ [DEBUG] Sample enriched data:', enrichedRedemptions[0]);
        
        setRedemptions(enrichedRedemptions);

      } catch (error) {
        console.error('🚨 [DEBUG] Error in fetchRedemptionsHistory:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger l\'historique des récompenses.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRedemptionsHistory();
  }, [selectedPartner, selectedCity, userRole, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'validated':
        return 'default';
      case 'used':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Validé';
      case 'used':
        return 'Utilisé';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des Récompenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Chargement...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Récompenses</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Total: {redemptions.length} récompenses</span>
          {selectedPartner && (
            <span>• Partenaire: {partners.find(p => p.id === selectedPartner)?.name}</span>
          )}
          {selectedCity && (
            <span>• Ville: {selectedCity}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune récompense trouvée</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Partenaire</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    {new Date(redemption.redeemed_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {redemption.profiles?.full_name || 'Utilisateur inconnu'}
                  </TableCell>
                  <TableCell>
                    {redemption.profiles?.email || 'email@inconnu.com'}
                  </TableCell>
                  <TableCell>
                    {redemption.rewards?.partners?.name || 'Partenaire inconnu'}
                  </TableCell>
                  <TableCell>
                    {redemption.rewards?.partners?.cities?.name || 'Ville inconnue'}
                  </TableCell>
                  <TableCell>
                    {redemption.rewards?.title || 'Offre supprimée'}
                  </TableCell>
                  <TableCell>{redemption.points_spent}</TableCell>
                  <TableCell>{formatCurrency(redemption.rewards?.value_chf || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(redemption.status)}>
                      {getStatusLabel(redemption.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnersRewardsHistory;
