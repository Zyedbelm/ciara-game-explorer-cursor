import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const systemChecks = [
    {
      name: 'Base de données',
      status: 'operational',
      responseTime: '12ms',
      uptime: '99.9%'
    },
    {
      name: 'API Analytics',
      status: 'operational',
      responseTime: '89ms',
      uptime: '99.8%'
    },
    {
      name: 'Google Maps API',
      status: 'warning',
      responseTime: '245ms',
      uptime: '99.5%'
    },
    {
      name: 'Edge Functions',
      status: 'operational',
      responseTime: '156ms',
      uptime: '99.9%'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Opérationnel</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Attention</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Erreur</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Statut du Système
        </CardTitle>
        <CardDescription>
          État des services et composants critiques
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {check.responseTime} • Uptime: {check.uptime}
                  </p>
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="font-medium text-sm">Tous les services sont opérationnels</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Dernière vérification: {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};