/**
 * 🚀 PAGE DE CALLBACK NATIVE SUPABASE - VERSION CORRIGÉE
 * 
 * Gestion correcte des magic links et reset password avec établissement de session
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NativeAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleNativeCallback = async () => {
      try {
        console.log('🔄 NativeAuthCallbackPage - URL complète:', window.location.href);
        
        // Vérifier d'abord les erreurs dans le hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error');
        const errorCode = hashParams.get('error_code');
        
        if (hashError) {
          console.error('❌ Erreur dans le hash:', { hashError, errorCode });
          let errorMessage = "Lien d'authentification invalide";
          if (errorCode === 'otp_expired') {
            errorMessage = "Le lien d'authentification a expiré";
          }
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        // Vérifier les paramètres URL (query params puis hash)
        const params = new URLSearchParams(window.location.search);
        let accessToken = params.get('access_token');
        let refreshToken = params.get('refresh_token');
        let type = params.get('type');
        
        // Si pas de tokens dans query params, vérifier dans le hash
        if (!accessToken && !refreshToken) {
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
        }
        
        console.log('🔄 Paramètres détectés:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          type 
        });
        
        if (accessToken && refreshToken) {
          console.log('🔄 Tokens détectés, établissement session...');
          
          // Établir la session avec les tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('❌ Erreur établissement session:', sessionError);
            setError('Lien invalide ou expiré');
            setLoading(false);
            return;
          }
          
          if (data.session) {
            console.log('✅ Session établie avec succès pour:', data.session.user.email);
            setSuccess(true);
            
            // Déterminer la redirection selon le type
            let redirectPath = '/profile';
            let message = 'Connexion magique réussie ! ✨';
            
            if (type === 'recovery') {
              redirectPath = '/reset-password';
              message = 'Redirection vers le formulaire de réinitialisation...';
            }
            
            toast({
              title: message,
              description: "Vous êtes maintenant connecté",
              variant: "default"
            });
            
            // Nettoyer l'URL des paramètres
            window.history.replaceState({}, document.title, redirectPath);
            
            // Redirection
            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 2000);
          } else {
            console.error('❌ Pas de session dans la réponse');
            setError('Erreur lors de l\'authentification');
          }
        } else {
          console.log('🔄 Pas de tokens - vérification session existante...');
          
          // Vérifier s'il y a déjà une session active
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.log('❌ Erreur récupération session:', sessionError);
            setError('Erreur lors de la récupération de la session');
            setLoading(false);
            return;
          }
          
          if (session) {
            console.log('✅ Session existante trouvée');
            setSuccess(true);
            
            toast({
              title: "Déjà connecté !",
              description: "Redirection vers votre profil...",
              variant: "default"
            });
            
            setTimeout(() => {
              navigate('/profile', { replace: true });
            }, 1000);
          } else {
            console.log('⚠️ Aucune session - redirection vers auth');
            setError('Lien invalide ou expiré');
            
            setTimeout(() => {
              navigate('/auth', { replace: true });
            }, 3000);
          }
        }
        
      } catch (err: any) {
        console.error('🔄 Erreur dans handleNativeCallback:', err);
        setError(err.message || 'Erreur lors de l\'authentification');
      } finally {
        setLoading(false);
      }
    };

    handleNativeCallback();
  }, [navigate, toast]);

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
              <CardTitle>Authentification en cours...</CardTitle>
              <CardDescription>
                Nous traitons votre demande d'authentification
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // État de succès
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Connexion réussie ! ✨</CardTitle>
              <CardDescription>
                Vous êtes maintenant connecté. Redirection en cours...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // État d'erreur
  return (
    <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Erreur d'authentification</CardTitle>
            <CardDescription>
              {error || "Une erreur s'est produite lors de l'authentification"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/auth', { replace: true })}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NativeAuthCallbackPage;