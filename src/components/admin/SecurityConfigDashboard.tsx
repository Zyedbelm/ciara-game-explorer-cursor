import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Settings, ExternalLink } from 'lucide-react';

interface SecurityIssue {
  level: 'WARN' | 'ERROR';
  title: string;
  description: string;
  fixUrl?: string;
  canFixProgrammatically?: boolean;
}

const KNOWN_SECURITY_ISSUES: SecurityIssue[] = [
  {
    level: 'WARN',
    title: 'OTP Expiry Long',
    description: 'L\'expiration des codes OTP dépasse le seuil recommandé. Cela peut augmenter le risque de sécurité.',
    fixUrl: 'https://supabase.com/docs/guides/platform/going-into-prod#security',
    canFixProgrammatically: false
  },
  {
    level: 'WARN', 
    title: 'Protection Mots de Passe Désactivée',
    description: 'La protection contre les mots de passe compromis est désactivée.',
    fixUrl: 'https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection',
    canFixProgrammatically: false
  }
];

export function SecurityConfigDashboard() {
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>(KNOWN_SECURITY_ISSUES);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenDocumentation = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getIssueBadgeVariant = (level: string) => {
    switch (level) {
      case 'ERROR': return 'destructive';
      case 'WARN': return 'default';
      default: return 'secondary';
    }
  };

  const getIssueIcon = (level: string) => {
    return <AlertTriangle className={`h-4 w-4 ${level === 'ERROR' ? 'text-red-500' : 'text-yellow-500'}`} />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Configuration Sécurité</CardTitle>
          </div>
          <Badge variant={securityIssues.length > 0 ? 'destructive' : 'default'}>
            {securityIssues.length} problème(s)
          </Badge>
        </div>
        <CardDescription>
          Configuration de sécurité et résolution des problèmes détectés
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {securityIssues.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityIssues.length} problème(s) de sécurité détecté(s). 
              Ces problèmes doivent être résolus dans le tableau de bord Supabase.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {securityIssues.map((issue, index) => (
            <Card key={index} className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getIssueIcon(issue.level)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant={getIssueBadgeVariant(issue.level)}>
                          {issue.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {issue.description}
                      </p>
                      <div className="flex gap-2">
                        {issue.fixUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDocumentation(issue.fixUrl)}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Documentation
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/settings/auth', '_blank')}
                          className="text-xs"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Config Supabase
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {securityIssues.length === 0 && (
          <div className="text-center py-6">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-green-700">Configuration Sécurisée</h3>
            <p className="text-sm text-muted-foreground">
              Aucun problème de sécurité détecté
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Actions de Sécurité Recommandées</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Réduire l'expiration des codes OTP à 10 minutes maximum</li>
            <li>• Activer la protection contre les mots de passe compromis</li>
            <li>• Configurer des limites de taux pour les tentatives de connexion</li>
            <li>• Activer l'authentification à deux facteurs pour les administrateurs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}