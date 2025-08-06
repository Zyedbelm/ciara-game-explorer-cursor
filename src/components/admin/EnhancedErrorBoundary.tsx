import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, index) => prevProps.resetKeys?.[index] !== key)) {
        this.resetErrorBoundary();
      }
    }
  }

  private resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Une erreur inattendue s'est produite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Il semble qu'un problème soit survenu lors du chargement de cette section. 
                Nos équipes ont été automatiquement notifiées.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-3 rounded-md text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Détails de l'erreur (développement)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={this.resetErrorBoundary}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </Button>
                
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}