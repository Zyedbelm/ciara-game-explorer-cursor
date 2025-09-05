/**
 * 🚀 PAGE DE CALLBACK NATIVE SUPABASE
 * 
 * Approche SIMPLE : Utiliser UNIQUEMENT les fonctions natives Supabase
 * - Pas de logique complexe
 * - Pas de gestionnaire personnalisé
 * - JUSTE les fonctions Supabase standards
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
        
        // APPROCHE SIMPLE : Laisser Supabase gérer automatiquement
        // Supabase détecte automatiquement les paramètres et établit la session
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔄 Session après callback:', session);
        
        if (sessionError) {
          console.log('🔄 Erreur de session:', sessionError);
          setError('Erreur lors de la récupération de la session');
          return;
        }
        
        if (session) {
          console.log('🔄 Session trouvée, connexion réussie');
          setSuccess(true);
          
          toast({
            title: "Connexion réussie !",
            description: "Vous êtes maintenant connecté",
            variant: "default"
          });
          
          // Redirection vers le profil
          setTimeout(() => {
            navigate('/profile', { replace: true });
          }, 2000);
        } else {
          console.log('🔄 Pas de session trouvée, attente...');
          
          // Attendre un peu et réessayer (Supabase peut prendre du temps)
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            
            if (retrySession) {
              console.log('🔄 Session trouvée après retry');
              setSuccess(true);
              
              toast({
                title: "Connexion réussie !",
                description: "Vous êtes maintenant connecté",
                variant: "default"
              });
              
              setTimeout(() => {
                navigate('/profile', { replace: true });
              }, 1000);
            } else {
              console.log('🔄 Pas de session après retry');
              setError('Lien d\'authentification invalide ou expiré');
            }
          }, 2000);
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
        
        <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Authentification en cours...
                </h2>
                <p className="text-gray-600">
                  Utilisation des fonctions natives Supabase.
                </p>
                
                {/* Debug en développement */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-left">
                    <p><strong>URL:</strong> {window.location.href}</p>
                    <p><strong>Search:</strong> {window.location.search}</p>
                    <p><strong>Hash:</strong> {window.location.hash}</p>
                  </div>
                )}
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
                  Vous allez être redirigé vers votre profil.
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
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Retour à la connexion
                </Button>
                
                <Button
                  onClick={() => navigate('/auth?tab=reset')}
                  variant="outline"
                  className="w-full"
                >
                  Demander un nouveau lien
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default NativeAuthCallbackPage;
