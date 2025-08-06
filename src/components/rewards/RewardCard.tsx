import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { rewardsTranslations } from '@/utils/myJourneysTranslations';
import {
  Gift,
  Trophy,
  ShoppingBag,
  Coffee,
  Utensils,
  MapPin,
  Star,
  Ticket,
  Sparkles,
  Navigation,
  Loader2
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  category: string | null;
  logo_url: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_required: number | null;
  value_chf: number | null;
  type: string | null;
  image_url: string | null;
  max_redemptions: number | null;
  is_active: boolean | null;
  partner: Partner;
}

interface RewardCardProps {
  reward: Reward;
  onRedeem?: (rewardId: string) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onRedeem }) => {
  const [redeeming, setRedeeming] = useState(false);
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();

  const t = (key: string, params?: Record<string, string | number>) => {
    let translation = rewardsTranslations[currentLanguage]?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return translation;
  };

  const getRewardIcon = (type: string, category: string) => {
    switch (type) {
      case 'discount':
        return <Ticket className="h-5 w-5" />;
      case 'free_item':
        return <Gift className="h-5 w-5" />;
      case 'upgrade':
        return <Star className="h-5 w-5" />;
      case 'experience':
        return <Sparkles className="h-5 w-5" />;
      default:
        if (category === 'Restaurant') return <Utensils className="h-5 w-5" />;
        if (category === 'Café') return <Coffee className="h-5 w-5" />;
        return <ShoppingBag className="h-5 w-5" />;
    }
  };

  const openGoogleMaps = () => {
    if (reward.partner.latitude && reward.partner.longitude) {
      // Use GPS coordinates if available
      const url = `https://www.google.com/maps/dir/?api=1&destination=${reward.partner.latitude},${reward.partner.longitude}&travelmode=walking`;
      window.open(url, '_blank');
    } else if (reward.partner.address) {
      // Fallback to address
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reward.partner.address)}&travelmode=walking`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Erreur",
        description: "Localisation non disponible pour ce partenaire",
        variant: "destructive",
      });
    }
  };

  const handleRedeem = async () => {
    if (!profile || !reward.points_required || profile.total_points < reward.points_required) {
      toast({
        title: t('rewards.insufficient_points'),
        description: t('rewards.insufficient_points_desc', { required: reward.points_required || 0 }),
        variant: "destructive",
      });
      return;
    }

    setRedeeming(true);

    try {
      // Generate redemption code
      const redemptionCode = `CIARA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: profile.user_id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          redemption_code: redemptionCode,
          // expires_at: 30 days from now
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Update user points
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ 
          total_points: profile.total_points - reward.points_required 
        })
        .eq('user_id', profile.user_id);

      if (pointsError) throw pointsError;

      toast({
        title: t('rewards.exchanged_success'),
        description: t('rewards.code', { code: redemptionCode }),
      });

      // Call parent callback if provided
      if (onRedeem) {
        onRedeem(reward.id);
      }

    } catch (error) {
      toast({
        title: "Erreur",
        description: t('rewards.exchange_error'),
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
    }
  };

  const canRedeem = () => {
    if (!profile) return false;
    if (!reward.points_required || (profile.total_points || 0) < reward.points_required) return false;
    return true;
  };

  const hasLocation = reward.partner.latitude && reward.partner.longitude || reward.partner.address;
  const isAvailable = canRedeem();

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${
      isAvailable ? 'hover:shadow-lg border-primary/20' : 'opacity-60'
    }`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {getRewardIcon(reward.type || '', reward.partner.category || '')}
            </div>
            <div>
              <CardTitle className="text-lg">{reward.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{reward.partner.name}</p>
            </div>
          </div>
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {reward.type || 'Récompense'}
          </Badge>
        </div>
        
        {reward.description && (
          <p className="text-sm">{reward.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-semibold">{reward.points_required} points</span>
          </div>
          {reward.value_chf && (
            <span className="text-green-600 font-medium">
              {reward.value_chf} CHF
            </span>
          )}
        </div>

        {reward.max_redemptions && (
          <div className="text-sm text-muted-foreground">
            Limite: {reward.max_redemptions} utilisations
          </div>
        )}

        {/* Partner Location */}
        {hasLocation && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Localisation disponible</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openGoogleMaps}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Localiser
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Button
          onClick={handleRedeem}
          disabled={!isAvailable || redeeming}
          className="w-full"
          variant={isAvailable ? 'default' : 'secondary'}
        >
          {redeeming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('rewards.exchanging')}
            </>
          ) : isAvailable ? (
            t('rewards.exchange')
          ) : profile && reward.points_required && (profile.total_points || 0) < reward.points_required ? (
            t('rewards.points_missing', { missing: reward.points_required - (profile.total_points || 0) })
          ) : (
            t('rewards.not_available')
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RewardCard;