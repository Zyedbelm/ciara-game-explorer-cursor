/**
 * 🚀 PAGE DE RESET PASSWORD NATIVE
 * 
 * Approche SIMPLE : Utiliser UNIQUEMENT les fonctions natives Supabase
 * - Pas de validation complexe
 * - Supabase gère automatiquement les sessions
 * - Interface simple et claire
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mountain, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NativeResetPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Vérifier et établir la session au chargement
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Vérification session reset password - URL:', window.location.href);
        
        // Vérifier d'abord les erreurs dans le hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error');
        const errorCode = hashParams.get('error_code');
        const errorDescription = hashParams.get('error_description');
        
        if (hashError) {
          console.error('❌ Erreur dans le hash:', { hashError, errorCode, errorDescription });
          
          let errorMessage = "Lien de réinitialisation invalide";
          if (errorCode === 'otp_expired') {
            errorMessage = "Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.";
          } else if (hashError === 'access_denied') {
            errorMessage = "Lien de réinitialisation invalide ou déjà utilisé.";
          }
          
          toast({
            title: "Lien expiré",
            description: errorMessage,
            variant: "destructive"
          });
          navigate('/auth', { replace: true });
          return;
        }
        
        // Vérifier les paramètres URL pour les tokens (query params)
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
        
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('🔐 Tokens de recovery détectés, établissement session...');
          
          // Établir la session avec les tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Erreur établissement session:', error);
            toast({
              title: "Erreur",
              description: "Lien de réinitialisation invalide ou expiré",
              variant: "destructive"
            });
            navigate('/auth', { replace: true });
            return;
          }
          
          console.log('✅ Session établie avec succès via tokens');
          setSessionReady(true);
          
          // Nettoyer l'URL des paramètres (query et hash)
          window.history.replaceState({}, document.title, '/reset-password');
        } else {
          // Pas de tokens dans l'URL - DEUX POSSIBILITÉS :
          // 1. Lien Supabase natif → callback automatique établit session
          // 2. Accès direct → vérifier session existante
          console.log('🔍 Pas de tokens recovery - vérification session existante...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Erreur récupération session:', sessionError);
            navigate('/auth', { replace: true });
            return;
          }
          
          if (session) {
            console.log('✅ Session existante trouvée - autorisation reset password');
            setSessionReady(true);
          } else {
            console.log('⚠️ Aucune session - redirection vers auth');
            toast({
              title: "Accès refusé",
              description: "Veuillez utiliser le lien de réinitialisation de votre email",
              variant: "destructive"
            });
            navigate('/auth', { replace: true });
          }
        }
      } catch (err) {
        console.error('❌ Erreur callback:', err);
        toast({
          title: "Erreur",
          description: "Problème lors de la validation du lien",
          variant: "destructive"
        });
        navigate('/auth', { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations simples
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (!sessionReady) {
        throw new Error('Session non établie. Veuillez utiliser le lien de votre email.');
      }
      
      console.log('🔐 Tentative de mise à jour du mot de passe...');
      
      // Vérifier que nous avons bien une session active
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée. Veuillez demander un nouveau lien.');
      }
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) {
        console.log('🔐 Erreur Supabase:', error);
        throw error;
      }

      console.log('🔐 Mot de passe mis à jour avec succès');
      setSuccess(true);
      
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été réinitialisé avec succès",
        variant: "default"
      });

      // Redirection après succès
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 3000);

    } catch (err: any) {
      console.error('🔐 Erreur lors de la mise à jour:', err);
      
      let errorMessage = "Impossible de réinitialiser le mot de passe";
      
      if (err.message?.includes('422')) {
        errorMessage = "Données de mot de passe invalides. Vérifiez les critères de sécurité.";
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        errorMessage = "Session expirée. Veuillez demander un nouveau lien de réinitialisation.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
                  Mot de passe réinitialisé !
                </CardTitle>
                <CardDescription>
                  Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Aller à la connexion
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de réinitialisation
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-white/80">
              Choisissez un mot de passe sécurisé
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">Réinitialiser le mot de passe</CardTitle>
              <CardDescription className="text-center">
                Entrez votre nouveau mot de passe ci-dessous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NativeResetPasswordPage;
