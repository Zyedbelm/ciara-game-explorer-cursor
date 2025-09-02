import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Extraire les paramètres d'erreur de l'URL
    const errorParam = searchParams.get('error');
    const errorCodeParam = searchParams.get('error_code');
    const errorDescriptionParam = searchParams.get('error_description');
    const redirectParam = searchParams.get('redirect');
    
    if (errorParam) {
      setError(errorParam);
      setErrorCode(errorCodeParam);
      setErrorDescription(errorDescriptionParam);
      setRedirectPath(redirectParam);
    }
  }, [searchParams]);

  const getErrorMessage = () => {
    if (error === 'access_denied') {
      if (errorCode === 'otp_expired') {
        return "Le lien de réinitialisation a expiré. Les liens de sécurité ont une durée de vie limitée pour votre sécurité.";
      }
      return "Accès refusé. Veuillez vérifier vos informations et réessayer.";
    }
    
    if (errorDescription) {
      return decodeURIComponent(errorDescription);
    }
    
    return "Une erreur d'authentification s'est produite. Veuillez réessayer.";
  };

  const getErrorIcon = () => {
    if (errorCode === 'otp_expired') {
      return <RefreshCw className="h-8 w-8 text-orange-600" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-600" />;
  };

  const getErrorColor = () => {
    if (errorCode === 'otp_expired') {
      return 'orange';
    }
    return 'red';
  };

  const handleRequestNewLink = () => {
    // Rediriger vers la page d'authentification avec l'onglet reset password
    navigate('/auth?tab=reset');
  };

  const handleGoToAuth = () => {
    navigate('/auth');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!error) {
    return (
      <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Aucune erreur détectée
                </h2>
                <p className="text-gray-600">
                  Cette page est destinée à gérer les erreurs d'authentification.
                </p>
                <Button onClick={handleGoHome} className="mt-4">
                  Retour à l'accueil
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
      
      {/* Bouton retour */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={handleGoHome}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>

      <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 bg-${getErrorColor()}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                {getErrorIcon()}
              </div>
              <CardTitle className={`text-2xl text-${getErrorColor()}-700`}>
                Erreur d'authentification
              </CardTitle>
              <CardDescription className="mt-2">
                {getErrorMessage()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Actions selon le type d'erreur */}
              {errorCode === 'otp_expired' && (
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <RefreshCw className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800 mb-1">
                          Lien expiré - Que faire ?
                        </p>
                        <ul className="text-orange-700 space-y-1 text-xs">
                          <li>• Les liens de sécurité expirent pour votre protection</li>
                          <li>• Demandez un nouveau lien de réinitialisation</li>
                          <li>• Vérifiez votre email dans les minutes qui suivent</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleRequestNewLink}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Demander un nouveau lien
                  </Button>
                </div>
              )}
              
              {/* Actions générales */}
              <div className="space-y-2">
                <Button
                  onClick={handleGoToAuth}
                  variant="outline"
                  className="w-full"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Aller à la page de connexion
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </div>
              
              {/* Informations techniques pour le debug */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-3 bg-gray-50 rounded-md text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Informations techniques (Debug)
                  </summary>
                  <div className="mt-2 space-y-1 text-gray-600">
                    <p><strong>Error:</strong> {error}</p>
                    {errorCode && <p><strong>Code:</strong> {errorCode}</p>}
                    {errorDescription && <p><strong>Description:</strong> {errorDescription}</p>}
                    {redirectPath && <p><strong>Redirect:</strong> {redirectPath}</p>}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage;
