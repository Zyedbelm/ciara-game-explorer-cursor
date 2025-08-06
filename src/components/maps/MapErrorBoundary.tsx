import React, { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Map } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

/**
 * Error Boundary spécialisé pour les composants de carte
 * Phase 4.2: Gestion d'erreurs avancée avec retry automatique
 */
class MapErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 2000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Auto-retry for recoverable errors
    if (this.isRecoverableError(error) && this.state.retryCount < this.maxRetries) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, this.retryDelay * (this.state.retryCount + 1)); // Exponential backoff
    }

    // Report error for monitoring
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private isRecoverableError = (error: Error): boolean => {
    const recoverableMessages = [
      'network',
      'timeout',
      'fetch',
      'loading',
      'api',
      'quota'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return recoverableMessages.some(msg => errorMessage.includes(msg));
  };

  private reportError = (error: Error, errorInfo: any) => {
    // In production, send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      .toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private getErrorType = (error: Error | null): string => {
    if (!error) return 'unknown';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('api')) return 'api';
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('quota') || message.includes('billing')) return 'quota';
    if (message.includes('key') || message.includes('auth')) return 'auth';
    if (message.includes('timeout')) return 'timeout';
    
    return 'unknown';
  };

  private getErrorMessage = (errorType: string): { title: string; description: string; actionText: string } => {
    switch (errorType) {
      case 'api':
        return {
          title: 'Erreur de l\'API Google Maps',
          description: 'Impossible de charger les services de cartographie. Vérifiez votre connexion internet.',
          actionText: 'Réessayer'
        };
      case 'network':
        return {
          title: 'Problème de connexion',
          description: 'Vérifiez votre connexion internet et réessayez.',
          actionText: 'Réessayer'
        };
      case 'quota':
        return {
          title: 'Limite d\'utilisation atteinte',
          description: 'Les services de cartographie sont temporairement indisponibles.',
          actionText: 'Recharger la page'
        };
      case 'auth':
        return {
          title: 'Problème d\'authentification',
          description: 'Configuration de l\'API Google Maps incorrecte.',
          actionText: 'Contacter le support'
        };
      case 'timeout':
        return {
          title: 'Délai d\'attente dépassé',
          description: 'Le chargement de la carte prend trop de temps.',
          actionText: 'Réessayer'
        };
      default:
        return {
          title: 'Erreur inattendue',
          description: 'Une erreur s\'est produite lors du chargement de la carte.',
          actionText: 'Réessayer'
        };
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const { title, description, actionText } = this.getErrorMessage(errorType);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <Card className="p-8 border-destructive/20 bg-destructive/5">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-destructive">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Détails technique (dev)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {canRetry && (
                <Button 
                  onClick={this.handleManualRetry}
                  variant="default"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {actionText}
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                <Map className="h-4 w-4 mr-2" />
                Recharger la page
              </Button>
            </div>

            {this.state.retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Tentatives: {this.state.retryCount}/{this.maxRetries}
              </p>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
export default MapErrorBoundary;
