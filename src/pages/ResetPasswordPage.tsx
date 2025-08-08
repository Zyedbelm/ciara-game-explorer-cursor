import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mountain, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordResetService } from '@/services/passwordResetService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Extract and validate parameters
  useEffect(() => {
    const validateResetLink = async () => {
      try {
        // Extract parameters from current URL
        const params = PasswordResetService.extractResetParams(window.location.href);
        
        // Check for errors first
        if (params.error) {
          let errorMessage = "Le lien de récupération n'est pas valide.";
          
          if (params.error === 'access_denied') {
            errorMessage = "Le lien de récupération a expiré. Veuillez demander un nouveau lien.";
          } else if (params.errorDescription) {
            errorMessage = decodeURIComponent(params.errorDescription);
          }
          
          setError(errorMessage);
          return;
        }
        
        // Check if we have valid tokens
        if (params.accessToken && params.refreshToken && params.type === 'recovery') {
          const result = await PasswordResetService.validateResetLink(params.accessToken, params.refreshToken);
          
          if (!result.success) {
            setError(result.error || 'Session invalide');
            return;
          }
          
          // Clean up URL
          PasswordResetService.cleanUrl();
          return;
        }
        
        // Check if user is already authenticated (for direct access)
        const hasSession = await PasswordResetService.hasValidSession();
        
        if (!hasSession) {
          setError("Lien de récupération invalide ou expiré. Veuillez demander un nouveau lien.");
          return;
        }
        
      } catch (err: any) {
        setError(err.message || "Erreur lors de la validation du lien");
      }
    };

    validateResetLink();
  }, [searchParams]);

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
      const result = await PasswordResetService.updatePassword(formData.password);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(true);
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été réinitialisé avec succès",
        variant: "default"
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 3000);

    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
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

  // Error state
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
                  Lien invalide
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;