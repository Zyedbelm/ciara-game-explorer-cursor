// Service pour gérer silencieusement les erreurs WebSocket
class WebSocketErrorHandler {
  private isInitialized = false;

  constructor() {
    this.initializeErrorHandling();
  }

  private initializeErrorHandling() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;

    // Intercepter les erreurs WebSocket globalement
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Filtrer les erreurs WebSocket spécifiques
      const message = args.join(' ');
      if (this.shouldSuppressWebSocketError(message)) {
        // Ne pas afficher ces erreurs dans la console
        return;
      }
      
      // Afficher toutes les autres erreurs normalement
      originalConsoleError.apply(console, args);
    };

    // Intercepter les erreurs non gérées
    window.addEventListener('error', (event) => {
      if (this.shouldSuppressWebSocketError(event.message)) {
        event.preventDefault();
        return false;
      }
    });

    // Intercepter les promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      if (this.shouldSuppressWebSocketError(event.reason?.message || event.reason)) {
        event.preventDefault();
        return false;
      }
    });
  }

  private shouldSuppressWebSocketError(message: string): boolean {
    const suppressedPatterns = [
      'WebSocket is closed before the connection is established',
      'WebSocket connection failed',
      'WebSocket connection to',
      'realtime/v1/websocket',
      'Connection timeout',
      'WebSocket connection was closed'
    ];

    return suppressedPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Méthode pour activer/désactiver la gestion d'erreurs
  public setErrorHandling(enabled: boolean) {
    if (!enabled) {
      this.isInitialized = false;
    } else if (!this.isInitialized) {
      this.initializeErrorHandling();
    }
  }
}

// Instance singleton
export const websocketErrorHandler = new WebSocketErrorHandler();

// Hook pour utiliser le gestionnaire d'erreurs
export const useWebSocketErrorHandler = () => {
  return websocketErrorHandler;
}; 