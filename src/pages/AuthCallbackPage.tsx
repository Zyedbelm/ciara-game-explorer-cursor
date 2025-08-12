import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Home } from 'lucide-react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer le code d'autorisation depuis l'URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setErrorMessage(errorDescription || 'Erreur lors de l\'authentification');
          setStatus('error');
          return;
        }

        if (!code) {
          console.error('No authorization code found');
          setErrorMessage('Code d\'autorisation manquant');
          setStatus('error');
          return;
        }

        // Échanger le code contre un token avec Supabase
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

        if (authError) {
          console.error('Auth error:', authError);
          setErrorMessage(authError.message || 'Erreur lors de l\'échange du code');
          setStatus('error');
          return;
        }

        if (data?.user) {
          console.log('Authentication successful:', data.user.email);
          setStatus('success');
          
          toast({
            title: 'Connexion réussie',
            description: `Bienvenue ${data.user.email || 'utilisateur'} !`,
            variant: 'default',
          });

          // Rediriger vers la page d'accueil après un court délai
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setErrorMessage('Aucun utilisateur trouvé après authentification');
          setStatus('error');
        }

      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setErrorMessage('Erreur inattendue lors de l\'authentification');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    // Recharger la page pour réessayer
    window.location.reload();
  };

  return (
    <StandardPageLayout 
      showBackButton={false}
      title="Authentification"
      className="flex items-center justify-center min-h-[60vh]"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Authentification en cours...</h2>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous finalisons votre connexion.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-green-700">
                Connexion réussie !
              </h2>
              <p className="text-muted-foreground">
                Vous allez être redirigé vers la page d'accueil...
              </p>
              <Button onClick={handleGoHome} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Aller à l'accueil
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-red-700">
                Erreur d'authentification
              </h2>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  Réessayer
                </Button>
                <Button onClick={handleGoHome} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Accueil
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

export default AuthCallbackPage;
