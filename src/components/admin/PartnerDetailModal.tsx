import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Star, 
  Award, 
  Users, 
  TrendingUp, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  X
} from 'lucide-react';

interface PartnerDetail {
  partner: {
    id: string;
    name: string;
    category: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    cities?: { name: string };
  };
  stats: {
    totalOffers: number;
    totalValue: number;
    totalRedemptions: number;
    totalPointsSpent: number;
    averageRating: number;
  };
  redemptions: Array<{
    id: string;
    redeemed_at: string;
    points_spent: number;
    status: string;
    used_at?: string;
    rewards: {
      title: string;
      value_chf: number;
    };
    profiles?: {
      full_name: string;
      email: string;
    };
  }>;
  offers: Array<{
    id: string;
    title: string;
    value_chf: number;
    points_required: number;
    is_active: boolean;
  }>;
}

interface PartnerDetailModalProps {
  partnerDetail: PartnerDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  partnerDetail,
  isOpen,
  onClose
}) => {
  if (!partnerDetail) return null;

  const { partner, stats, redemptions, offers } = partnerDetail;

  // Calculer les statistiques supplémentaires
  const activeOffers = offers.filter(offer => offer.is_active).length;
  const totalValue = offers.reduce((sum, offer) => sum + (offer.value_chf || 0), 0);
  const recentRedemptions = redemptions.slice(0, 5); // 5 dernières redemptions

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Détails du partenaire : {partner.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du partenaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations du partenaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{partner.name}</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">{partner.category}</Badge>
                    {partner.cities && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {partner.cities.name}
                      </div>
                    )}
                    {partner.description && (
                      <p className="text-sm text-muted-foreground">{partner.description}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {partner.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {partner.email}
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {partner.phone}
                    </div>
                  )}
                  {partner.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {partner.address}
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {partner.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Offres</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOffers}</div>
                <p className="text-xs text-muted-foreground">
                  {activeOffers} actives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue.toLocaleString()} CHF</div>
                <p className="text-xs text-muted-foreground">
                  Valeur des offres
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPointsSpent} points dépensés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Sur 5 étoiles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Offres du partenaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Offres du partenaire ({offers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{offer.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{offer.value_chf} CHF</span>
                        <span>{offer.points_required} points</span>
                      </div>
                    </div>
                    <Badge variant={offer.is_active ? "default" : "secondary"}>
                      {offer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dernières utilisations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dernières utilisations ({redemptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRedemptions.map((redemption) => (
                  <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{redemption.rewards.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{redemption.rewards.value_chf} CHF</span>
                        <span>{redemption.points_spent} points</span>
                        <span>{new Date(redemption.redeemed_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {redemption.profiles && (
                        <p className="text-xs text-muted-foreground">
                          Utilisé par {redemption.profiles.full_name} ({redemption.profiles.email})
                        </p>
                      )}
                    </div>
                    <Badge variant={redemption.status === 'used' ? "default" : "secondary"}>
                      {redemption.status === 'used' ? 'Utilisé' : 'En attente'}
                    </Badge>
                  </div>
                ))}
                {redemptions.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    ... et {redemptions.length - 5} autres utilisations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDetailModal; 