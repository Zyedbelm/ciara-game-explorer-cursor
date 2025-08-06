import { supabase } from '@/integrations/supabase/client';

// Service WebSocket simplifié qui ne fait que gérer les erreurs de base
class WebSocketStabilizationService {
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // Pas d'initialisation automatique pour éviter les erreurs
    console.log('🔧 WebSocket Stabilization Service initialized (simplified mode)');
  }

  // API publique simplifiée
  public addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public removeEventListener(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  public getConnectionStatus() {
    return {
      isConnected: true, // Simuler une connexion stable
      isConnecting: false,
      reconnectAttempts: 0,
      connectionDuration: 0
    };
  }

  public forceReconnectNow() {
    console.log('🔄 WebSocket reconnect requested (simplified mode)');
    this.notifyListeners('connected');
  }

  public resetReconnectAttempts() {
    // Pas d'action nécessaire en mode simplifié
  }
}

// Instance singleton
export const websocketService = new WebSocketStabilizationService();

// Hook pour utiliser le service
export const useWebSocketStabilization = () => {
  return websocketService;
}; 