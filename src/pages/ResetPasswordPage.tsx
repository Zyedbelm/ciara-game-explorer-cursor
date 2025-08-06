import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mountain, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Extract parameters from both query string and hash fragment
  useEffect(() => {
    const extractParams = async () => {
      // First, sign out any existing user to ensure clean state
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        await supabase.auth.signOut();
      }
      
      // Extract from query parameters (direct link)
      const type = searchParams.get('type');
      const token = searchParams.get('token');
      
      // Extract from hash fragment (after Supabase redirects)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      const hashType = hashParams.get('type');
      const hashToken = hashParams.get('token');
      const hashError = hashParams.get('error');
      const hashErrorDescription = hashParams.get('error_description');
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      
      // Check for errors in hash first
      if (hashError) {
        let errorMessage = "Une erreur s'est produite lors de la récupération.";
        
        if (hashError === 'access_denied' && hashParams.get('error_code') === 'otp_expired') {
          errorMessage = "Le lien de récupération a expiré. Veuillez demander un nouveau lien.";
        } else if (hashErrorDescription) {
          errorMessage = decodeURIComponent(hashErrorDescription);
        }
        
        toast({
          title: "Lien expiré",
          description: errorMessage,
          variant: "destructive"
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      // If we have access_token and refresh_token in hash, this means verification was successful
      if (hashAccessToken && hashRefreshToken) {
        try {
          // Set the session from the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken
          });
          
          if (error) {
            throw error;
          }
          
          setTokenVerified(true);
          
          // Clean up URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de valider la session",
            variant: "destructive"
          });
          navigate('/auth', { replace: true });
          return;
        }
      }
      
      // Use hash parameters if available, otherwise use query parameters
      const finalType = hashType || type;
      const finalToken = hashToken || token;
      
      if (finalType !== 'recovery' || !finalToken) {
        toast({
          title: "Lien invalide",
          description: "Ce lien de récupération n'est pas valide.",
          variant: "destructive"
        });
        navigate('/auth', { replace: true });
        return;
      }

      // Store the token for later use during password update
      setTokenHash(finalToken);
      setTokenVerified(true);
      };

    extractParams();
  }, [searchParams, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Check if we already have a valid session
      const { data: currentSession } = await supabase.auth.getSession();
      
      if (currentSession.session) {
        // We already have a valid session, just update the password
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.password
        });

        if (updateError) {
          throw updateError;
        }
      } else if (tokenHash) {
        // First verify the OTP token and get the session
        const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        if (verifyError) {
          throw new Error(verifyError.message || "Token de récupération invalide ou expiré");
        }

        // Now update the password using the new session
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.password
        });

        if (updateError) {
          throw updateError;
        }
      } else {
        throw new Error("Aucune session valide ou token de récupération disponible");
      }

      // Sign out the user after password update
      await supabase.auth.signOut();

      setSuccess(true);
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été réinitialisé avec succès",
        variant: "default"
      });

      // Redirect after 3 seconds to the appropriate domain
      setTimeout(() => {
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('ciara.city')) {
          window.location.href = 'https://ciara.city/auth';
        } else {
          navigate('/auth', { replace: true });
        }
      }, 3000);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
                  onClick={() => {
                    const currentDomain = window.location.hostname;
                    if (currentDomain.includes('ciara.city')) {
                      window.location.href = 'https://ciara.city/auth';
                    } else {
                      navigate('/auth');
                    }
                  }}
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

  return (
    <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
      {/* Background with mountain effect */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Back to auth button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => {
            const currentDomain = window.location.hostname;
            if (currentDomain.includes('ciara.city')) {
              window.location.href = 'https://ciara.city/auth';
            } else {
              navigate('/auth');
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la connexion
        </Button>
      </div>

      <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Logo and title */}
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
              {!tokenVerified ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Vérification du lien...</p>
                </div>
              ) : (
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
                      required
                    />
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-destructive">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading || formData.password !== formData.confirmPassword || formData.password.length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour le mot de passe'
                  )}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;