import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OpenAIKeyValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const { toast } = useToast();

  const validateOpenAIKey = async () => {
    setIsValidating(true);
    try {
      // Test the generate-travel-journal function to verify OpenAI API key access
      const response = await fetch('/functions/v1/generate-travel-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('@/integrations/supabase/client')).supabase.auth.getSession().then(({ data }) => data.session?.access_token || '')}`,
        },
        body: JSON.stringify({
          journeyName: 'Test Journey',
          rating: 5,
          comment: 'Test validation',
          language: 'fr'
        }),
      });

      if (response.ok) {
        setValidationResult({
          isValid: true,
          message: 'OpenAI API Key configurée et fonctionnelle',
          details: 'La génération de carnets de voyage est opérationnelle'
        });
        toast({
          title: "✅ Validation réussie",
          description: "L'API OpenAI est correctement configurée",
        });
      } else {
        const errorData = await response.json();
        setValidationResult({
          isValid: false,
          message: 'Problème avec la configuration OpenAI',
          details: errorData.error || 'Erreur inconnue'
        });
        toast({
          title: "❌ Échec de validation",
          description: "Problème détecté avec l'API OpenAI",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('OpenAI validation error:', error);
      setValidationResult({
        isValid: false,
        message: 'Erreur de connexion',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      toast({
        title: "❌ Erreur de validation",
        description: "Impossible de tester la connexion OpenAI",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Validation OpenAI API Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Vérifiez que la clé API OpenAI est correctement configurée pour la génération de carnets de voyage.
        </p>

        <Button 
          onClick={validateOpenAIKey} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Validation en cours...
            </>
          ) : (
            <>
              <Key className="h-4 w-4 mr-2" />
              Tester la configuration OpenAI
            </>
          )}
        </Button>

        {validationResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{validationResult.message}</span>
              <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                {validationResult.isValid ? "OK" : "Erreur"}
              </Badge>
            </div>
            {validationResult.details && (
              <p className="text-sm text-muted-foreground ml-7">
                {validationResult.details}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};