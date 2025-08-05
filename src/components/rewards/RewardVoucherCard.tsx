import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { contactTranslations } from '@/utils/translations';
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  Loader2,
  Calendar,
  Building2,
  Tag,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface RewardVoucher {
  id: string;
  reward_id: string;
  user_id: string;
  redemption_code: string;
  points_spent: number;
  status: 'pending' | 'used' | 'expired';
  redeemed_at: string;
  used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  reward: {
    id: string;
    title: string;
    title_en?: string;
    title_de?: string;
    description?: string;
    description_en?: string;
    description_de?: string;
    type: string;
    value_chf?: number;
    image_url?: string;
    partner: {
      id: string;
      name: string;
      category: string;
      email?: string;
    };
  };
}

interface RewardVoucherCardProps {
  voucher: RewardVoucher;
  onStatusChange: (voucherId: string, newStatus: string) => void;
}

const RewardVoucherCard: React.FC<RewardVoucherCardProps> = ({ 
  voucher, 
  onStatusChange 
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [usageStats, setUsageStats] = useState<{used: number, total: number} | null>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();

  // Helper function for rewards translations
  const getRewardTranslation = (key: string, params: Record<string, any> = {}) => {
    const translation = contactTranslations.rewards.voucher[key]?.[currentLanguage] || 
                       contactTranslations.rewards.voucher[key]?.fr || 
                       contactTranslations.rewards[key]?.[currentLanguage] ||
                       contactTranslations.rewards[key]?.fr || 
                       key;
    
    // Simple parameter replacement
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), value);
    }, translation);
  };

  // Fetch usage statistics for this reward
  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('reward_redemptions')
          .select('*')
          .eq('reward_id', voucher.reward_id)
          .eq('user_id', user.id)
          .in('status', ['pending', 'used']);

        if (error) throw error;
        
        // Get reward max redemptions per user
        const { data: rewardData, error: rewardError } = await supabase
          .from('rewards')
          .select('max_redemptions_per_user')
          .eq('id', voucher.reward_id)
          .single();

        if (!rewardError && rewardData) {
          setUsageStats({
            used: data.length,
            total: rewardData.max_redemptions_per_user || 5
          });
        }
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      }
    };

    fetchUsageStats();
  }, [voucher.reward_id, user]);

  const getDaysUntilExpiration = () => {
    if (!voucher.expires_at) return null;
    const now = new Date();
    const expiry = new Date(voucher.expires_at);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLocalizedTitle = () => {
    if (currentLanguage === 'en' && voucher.reward.title_en) {
      return voucher.reward.title_en;
    }
    if (currentLanguage === 'de' && voucher.reward.title_de) {
      return voucher.reward.title_de;
    }
    return voucher.reward.title;
  };

  const getLocalizedDescription = () => {
    if (currentLanguage === 'en' && voucher.reward.description_en) {
      return voucher.reward.description_en;
    }
    if (currentLanguage === 'de' && voucher.reward.description_de) {
      return voucher.reward.description_de;
    }
    return voucher.reward.description;
  };

  const getStatusBadge = () => {
    switch (voucher.status) {
      case 'pending':
        return (
          <Badge variant="default" className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            {t('rewards.status.pending')}
          </Badge>
        );
      case 'used':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('rewards.status.used')}
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <Clock className="h-3 w-3 mr-1" />
            {t('rewards.status.expired')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRedeem = async () => {
    if (!voucher.reward.partner.email) {
      toast({
        title: t('rewards.error.title'),
        description: t('rewards.error.no_partner_email'),
        variant: 'destructive',
      });
      return;
    }

    setIsRedeeming(true);
    try {
      // Send email to partner with redemption request and update status
      const { error } = await supabase.functions.invoke('send-reward-redemption', {
        body: {
          voucherId: voucher.id,
          redemptionCode: voucher.redemption_code,
          partnerEmail: voucher.reward.partner.email,
          partnerName: voucher.reward.partner.name,
          partnerAddress: undefined,
          rewardTitle: getLocalizedTitle(),
          rewardDescription: getLocalizedDescription(),
          pointsSpent: voucher.points_spent,
          userEmail: user?.email,
          language: currentLanguage
        }
      });

      if (error) throw error;

      toast({
        title: "Récompense utilisée !",
        description: "Votre récompense a été utilisée avec succès. Un email de confirmation vous a été envoyé.",
      });

      // Update voucher status to 'used' since the edge function handles the database update
      onStatusChange(voucher.id, 'used');

    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast({
        title: t('rewards.error.title'),
        description: "Une erreur est survenue lors de l'utilisation de la récompense",
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(currentLanguage, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const isExpired = () => {
    // Check if voucher has expired based on expires_at column
    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      return true;
    }
    return voucher.status === 'expired';
  };

  const canRedeem = voucher.status === 'pending' && !isExpired();

  return (
    <Card className={`transition-all duration-200 ${
      voucher.status === 'used' 
        ? 'border-green-200 bg-green-50/30' 
        : voucher.status === 'expired' || isExpired()
        ? 'border-red-200 bg-red-50/30 opacity-75'
        : 'border-blue-200 bg-blue-50/30 hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {getLocalizedTitle()}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          {voucher.reward.partner.name}
          <Tag className="h-4 w-4 ml-2" />
          {voucher.reward.partner.category}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {getLocalizedDescription() && (
          <p className="text-sm text-muted-foreground">
            {getLocalizedDescription()}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground">{t('rewards.voucher.type')}</div>
            <div>{voucher.reward.type}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">{t('rewards.voucher.points_spent')}</div>
            <div className="font-semibold text-primary">{voucher.points_spent} pts</div>
          </div>
          {voucher.reward.value_chf && (
            <div>
              <div className="font-medium text-muted-foreground">{t('rewards.voucher.value')}</div>
              <div className="font-semibold text-green-600">{voucher.reward.value_chf} CHF</div>
            </div>
          )}
          <div>
            <div className="font-medium text-muted-foreground">{t('rewards.voucher.code')}</div>
            <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {voucher.redemption_code}
            </div>
          </div>
        </div>

        
        {/* Nouvelles informations : délai de validation et compteur d'utilisation */}
        <div className="pt-2 border-t space-y-2">
          {/* Délai de validation */}
          {voucher.expires_at && (
            <div className="flex items-center gap-2 text-xs">
              {(() => {
                const daysLeft = getDaysUntilExpiration();
                if (daysLeft === null) return null;
                
                if (daysLeft <= 0) {
                  return (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-red-600 font-medium">
                        {getRewardTranslation('expires_at')}: {formatDate(voucher.expires_at)}
                      </span>
                    </>
                  );
                } else if (daysLeft <= 3) {
                  return (
                    <>
                      <Clock className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-600 font-medium">
                        {getRewardTranslation('expires_in', { days: daysLeft })}
                      </span>
                    </>
                  );
                } else {
                  return (
                    <>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {getRewardTranslation('expires_at')}: {formatDate(voucher.expires_at)}
                      </span>
                    </>
                  );
                }
              })()}
            </div>
          )}

          {/* Compteur d'utilisation Y/X */}
          {usageStats && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{getRewardTranslation('usage_stats', { used: usageStats.used, total: usageStats.total })}</span>
            </div>
          )}

          {/* Dates existantes */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{t('rewards.voucher.redeemed_at')}: {formatDate(voucher.redeemed_at)}</span>
          </div>
          {voucher.used_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              <span>{t('rewards.voucher.used_at')}: {formatDate(voucher.used_at)}</span>
            </div>
          )}
        </div>

        {canRedeem && (
          <div className="pt-2">
            <Button 
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="w-full"
              size="sm"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('rewards.redeem.processing')}
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('rewards.redeem.use_now')}
                </>
              )}
            </Button>
          </div>
        )}

        {!canRedeem && voucher.status === 'pending' && isExpired() && (
          <div className="pt-2">
            <Badge variant="destructive" className="w-full justify-center">
              {t('rewards.status.expired')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardVoucherCard;