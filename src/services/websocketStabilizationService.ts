import { supabase } from '@/integrations/supabase/client';

interface WebSocketConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

const DEFAULT_CONFIG: WebSocketConfig = {
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  connectionTimeout: 10000
};

class WebSocketStabilizationService {
  private config: WebSocketConfig;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private connectionStartTime: number = 0;
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStabilization();
  }

  private initializeStabilization() {
    // Écouter les événements de connexion Supabase
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.establishStableConnection();
      } else if (event === 'SIGNED_OUT') {
        this.cleanup();
      }
    });

    // Écouter les changements de connexion
    supabase.realtime.on('connected', () => {
      this.onConnected();
    });

    supabase.realtime.on('disconnected', () => {
      this.onDisconnected();
    });

    supabase.realtime.on('error', (error) => {
      this.onError(error);
    });
  }

  private onConnected() {
    console.log('🔗 WebSocket connected successfully');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.connectionStartTime = Date.now();
    
    // Démarrer le heartbeat
    this.startHeartbeat();
    
    // Notifier les listeners
    this.notifyListeners('connected');
  }

  private onDisconnected() {
    console.log('🔌 WebSocket disconnected');
    this.isConnected = false;
    this.stopHeartbeat();
    
    // Notifier les listeners
    this.notifyListeners('disconnected');
    
    // Tenter la reconnexion si pas en cours
    if (!this.isConnecting) {
      this.scheduleReconnect();
    }
  }

  private onError(error: any) {
    console.error('❌ WebSocket error:', error);
    this.notifyListeners('error', error);
    
    // Si l'erreur est critique, forcer la reconnexion
    if (this.isConnected) {
      this.forceReconnect();
    }
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        // Envoyer un ping pour maintenir la connexion
        try {
          supabase.realtime.send({
            type: 'heartbeat',
            payload: { timestamp: Date.now() }
          });
        } catch (error) {
          console.warn('Heartbeat failed:', error);
          this.forceReconnect();
        }
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.notifyListeners('maxReconnectAttemptsReached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.config.maxReconnectDelay
    );

    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts + 1} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.establishStableConnection();
    }, delay);
  }

  private async establishStableConnection() {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.reconnectAttempts++;

    try {
      console.log(`🔗 Attempting to establish WebSocket connection (attempt ${this.reconnectAttempts})`);
      
      // Vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Établir la connexion avec timeout
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, this.config.connectionTimeout);

        const checkConnection = () => {
          if (this.isConnected) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };

        checkConnection();
      });

      await connectionPromise;
      
    } catch (error) {
      console.error('❌ Failed to establish connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private forceReconnect() {
    console.log('🔄 Forcing WebSocket reconnection');
    this.isConnected = false;
    this.stopHeartbeat();
    
    // Nettoyer la connexion actuelle
    try {
      supabase.realtime.disconnect();
    } catch (error) {
      console.warn('Error during disconnect:', error);
    }
    
    // Programmer une nouvelle connexion
    setTimeout(() => {
      this.establishStableConnection();
    }, 1000);
  }

  private cleanup() {
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
  }

  // API publique
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
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      connectionDuration: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0
    };
  }

  public forceReconnectNow() {
    this.forceReconnect();
  }

  public resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }
}

// Instance singleton
export const websocketService = new WebSocketStabilizationService();

// Hook pour utiliser le service
export const useWebSocketStabilization = () => {
  return websocketService;
}; 