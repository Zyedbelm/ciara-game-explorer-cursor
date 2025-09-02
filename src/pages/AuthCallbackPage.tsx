import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Récupérer les paramètres de l'URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('🔍 AuthCallback - Paramètres reçus:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          type,
          code,
          error,
          errorDescription
        });
        
        // Gérer les erreurs
        if (error) {
          let errorMessage = "Erreur d'authentification";
          
          if (error === 'access_denied') {
            if (errorDescription && errorDescription.includes('expired')) {
              errorMessage = "Le lien a expiré. Veuillez demander un nouveau lien de réinitialisation.";
            } else {
              errorMessage = "Accès refusé. Veuillez réessayer.";
            }
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription);
          }
          
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        // Gérer le magic link avec code
        if (code && !accessToken && !refreshToken) {
          console.log('🔍 Magic Link avec code détecté, échange contre session...');
          
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) {
            console.log('🔍 Erreur échange code:', sessionError);
            throw new Error('Code d\'authentification invalide ou expiré');
          }
          
          if (data.session) {
            console.log('🔍 Session Magic Link établie avec succès');
            setSuccess(true);
            toast({
              title: "Connexion réussie !",
              description: "Vous êtes maintenant connecté via Magic Link",
              variant: "default"
            });
            
            // Rediriger vers le profil après un délai
            setTimeout(() => {
              navigate('/profile', { replace: true });
            }, 2000);
          } else {
            throw new Error('Session Magic Link non établie');
          }
        }
        
        // Gérer le magic link avec tokens (ancienne méthode)
        else if (type === 'magiclink' && accessToken && refreshToken) {
          console.log('🔍 Magic Link avec tokens détecté...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            throw new Error('Erreur lors de l\'établissement de la session');
          }
          
          if (data.session) {
            setSuccess(true);
            toast({
              title: "Connexion réussie !",
              description: "Vous êtes maintenant connecté",
              variant: "default"
            });
            
            // Rediriger vers le profil après un délai
            setTimeout(() => {
              navigate('/profile', { replace: true });
            }, 2000);
          } else {
            throw new Error('Session non établie');
          }
        }
        
        // Gérer OAuth (Google, etc.)
        else if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            throw new Error('Erreur lors de l\'établissement de la session OAuth');
          }
          
          if (data.session) {
            setSuccess(true);
            toast({
              title: "Connexion réussie !",
              description: "Vous êtes maintenant connecté",
              variant: "default"
            });
            
            // Rediriger vers le profil après un délai
            setTimeout(() => {
              navigate('/profile', { replace: true });
            }, 2000);
          } else {
            throw new Error('Session OAuth non établie');
          }
        }
        
        // Aucun paramètre valide
        else {
          throw new Error('Paramètres d\'authentification invalides');
        }
        
      } catch (err: any) {
        console.error('Erreur lors du traitement du callback:', err);
        setError(err.message || 'Erreur lors de l\'authentification');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast]);

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Traitement de l'authentification...
                </h2>
                <p className="text-gray-600">
                  Veuillez patienter pendant que nous vous connectons.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // État de succès
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">
                  Connexion réussie !
                </CardTitle>
                <CardDescription>
                  Vous allez être redirigé vers votre profil dans quelques secondes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Aller au profil maintenant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute top-6 left-6 z-10">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/auth')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Button>
        </div>

        <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-700">
                  Erreur d'authentification
                </CardTitle>
                <CardDescription>
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Retour à la connexion
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // État par défaut (ne devrait jamais arriver)
  return null;
};

export default AuthCallbackPage;
