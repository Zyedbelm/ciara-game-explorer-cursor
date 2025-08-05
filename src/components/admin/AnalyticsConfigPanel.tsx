import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface AnalyticsConfigPanelProps {
  activityPeriod: number;
  onActivityPeriodChange: (days: number) => void;
  className?: string;
}

export const AnalyticsConfigPanel: React.FC<AnalyticsConfigPanelProps> = ({
  activityPeriod,
  onActivityPeriodChange,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" />
          Configuration des Métriques
        </CardTitle>
        <CardDescription className="text-xs">
          Personnalisez la définition des utilisateurs actifs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Période d'activité
          </label>
          <Select
            value={activityPeriod.toString()}
            onValueChange={(value) => onActivityPeriodChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="14">14 jours</SelectItem>
              <SelectItem value="30">30 jours (défaut)</SelectItem>
              <SelectItem value="60">60 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Un utilisateur est considéré comme actif s'il a complété au moins une étape, 
            démarré un parcours ou répondu à un quiz dans les derniers{' '}
            <Badge variant="secondary" className="text-xs">{activityPeriod} jours</Badge>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};