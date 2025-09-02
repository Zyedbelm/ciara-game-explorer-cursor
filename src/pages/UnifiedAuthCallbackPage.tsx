/**
 * 🚀 PAGE DE CALLBACK UNIFIÉE
 * 
 * Approche innovante : UNE SEULE PAGE pour TOUS les cas d'authentification
 * - Magic Link
 * - Reset Password
 * - OAuth (Google)
 * - Erreurs
 * 
 * PRINCIPE : Déléguer toute la logique au UnifiedAuthManager
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, Mail, Lock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UnifiedAuthManager, AuthResult } from '@/services/unifiedAuthManager';

const UnifiedAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AuthResult | null>(null);

  useEffect(() => {
    const processAuthentication = async () => {
      console.log('🚀 UnifiedAuthCallbackPage - Démarrage du traitement');
      
      try {
        setLoading(true);
        
        // Déléguer TOUTE la logique au gestionnaire unifié
        const authResult = await UnifiedAuthManager.handleAuthentication();
        console.log('🚀 Résultat du gestionnaire unifié:', authResult);
        
        setResult(authResult);
        
        // Gérer les redirections automatiques
        if (authResult.success && authResult.requiresRedirect && authResult.redirectUrl) {
          toast({
            title: "Connexion réussie !",
            description: this.getSuccessMessage(authResult.action),
            variant: "default"
          });
          
          // Nettoyer l'URL et rediriger
          UnifiedAuthManager.cleanUrl();
          
          setTimeout(() => {
            navigate(authResult.redirectUrl!, { replace: true });
          }, 2000);
        }
        
        // Gérer les cas de reset password (pas de redirection automatique)
        if (authResult.success && authResult.action === 'reset') {
          toast({
            title: "Lien de réinitialisation valide",
            description: "Vous pouvez maintenant définir votre nouveau mot de passe",
            variant: "default"
          });
          
          // Nettoyer l'URL et rediriger vers la page de reset
          UnifiedAuthManager.cleanUrl('/reset-password');
          
          setTimeout(() => {
            navigate('/reset-password', { replace: true });
          }, 1500);
        }
        
      } catch (error: any) {
        console.error('🚀 Erreur dans processAuthentication:', error);
        setResult({
          success: false,
          error: error.message || 'Erreur lors du traitement de l\'authentification'
        });
      } finally {
        setLoading(false);
      }
    };

    processAuthentication();
  }, [navigate, toast]);
  
  /**
   * 📝 MESSAGES DE SUCCÈS PERSONNALISÉS
   */
  private getSuccessMessage(action?: string): string {
    switch (action) {
      case 'magic':
        return "Vous êtes connecté via Magic Link";
      case 'oauth':
        return "Vous êtes connecté via Google";
      case 'reset':
        return "Lien de réinitialisation validé";
      default:
        return "Vous êtes maintenant connecté";
    }
  }
  
  /**
   * 🎨 ICÔNE SELON L'ACTION
   */
  private getActionIcon(action?: string) {
    switch (action) {
      case 'magic':
        return <Mail className="h-8 w-8 text-blue-600" />;
      case 'oauth':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'reset':
        return <Lock className="h-8 w-8 text-orange-600" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
  }

  // 🔄 État de chargement
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
                  Analyse automatique du type d'authentification en cours.
                </p>
                
                {/* Debug en développement */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-left">
                    <p><strong>URL:</strong> {window.location.href}</p>
                    <p><strong>Pathname:</strong> {window.location.pathname}</p>
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

  // ✅ État de succès
  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {this.getActionIcon(result.action)}
                </div>
                <CardTitle className="text-2xl text-green-700">
                  {result.action === 'reset' ? 'Lien validé !' : 'Connexion réussie !'}
                </CardTitle>
                <CardDescription>
                  {this.getSuccessMessage(result.action)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate(result.redirectUrl || '/profile')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {result.action === 'reset' ? 'Définir le mot de passe' : 'Aller au profil'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ❌ État d'erreur
  if (result?.error) {
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
                  {result.error}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Button>
                
                <Button
                  onClick={() => navigate('/auth?tab=reset')}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Demander un nouveau lien
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

export default UnifiedAuthCallbackPage;
