/**
 * 🚀 PAGE DE RESET PASSWORD SIMPLIFIÉE
 * 
 * Approche innovante : SIMPLE et ROBUSTE
 * - Pas de validation complexe
 * - Délégation au UnifiedAuthManager
 * - Gestion d'erreur claire
 * 
 * PRINCIPE : Si on arrive sur cette page, on peut changer le mot de passe
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
import { usePasswordManagement } from '@/hooks/usePasswordManagement';

const SimpleResetPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, loading: isPasswordLoading, validatePassword } = usePasswordManagement();
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [validating, setValidating] = useState(true);

  // Validation simple au chargement
  useEffect(() => {
    const validateAccess = async () => {
      console.log('🔐 SimpleResetPasswordPage - Validation de l\'accès');
      
      try {
        // APPROCHE SIMPLE : Vérifier directement la session Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔐 Session Supabase:', session);
        
        if (error) {
          console.log('🔐 Erreur session:', error);
          setError('Erreur lors de la vérification de la session');
          return;
        }
        
        if (session) {
          console.log('🔐 Session valide trouvée, accès autorisé');
          setValidating(false);
          return;
        }
        
        // Mode développement : toujours autoriser
        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
          console.log('🔐 Mode développement, accès autorisé');
          setValidating(false);
          return;
        }
        
        // Aucune autorisation
        setError("Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.");
        
      } catch (err: any) {
        console.error('🔐 Erreur lors de la validation:', err);
        setError("Erreur lors de la validation du lien de réinitialisation.");
      } finally {
        setValidating(false);
      }
    };

    validateAccess();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      toast({
        title: "Erreur",
        description: passwordErrors[0],
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await updatePassword(formData.password);
      
      if (!result.success) {
        if (result.requiresReauth) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez demander un nouveau lien de réinitialisation.",
            variant: "destructive",
          });
          navigate('/auth?tab=reset');
          return;
        }
        throw new Error(result.error);
      }

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
      toast({
        title: "Erreur",
        description: err.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive"
      });
    }
  };

  // État de validation
  if (validating) {
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
                  Validation du lien...
                </h2>
                <p className="text-gray-600">
                  Vérification de votre autorisation à réinitialiser le mot de passe.
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
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-700">
                  Lien invalide
                </CardTitle>
                <CardDescription>
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/auth?tab=reset')}
                  className="w-full bg-primary hover:bg-primary/90"
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
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? (
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

export default SimpleResetPasswordPage;
