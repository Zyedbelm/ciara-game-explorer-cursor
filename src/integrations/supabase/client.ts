// Configuration sécurisée du client Supabase
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validation des variables d'environnement critiques
const validateEnvironment = () => {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
  }
};

// Validation en développement uniquement (sans erreur fatale)
if (import.meta.env.DEV) {
  validateEnvironment();
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration sécurisée du client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'ciara-web-app',
    },
  },
  // Configuration realtime optimisée pour éviter les erreurs WebSocket
  realtime: {
    params: {
      eventsPerSecond: 2, // Réduire la fréquence pour éviter la surcharge
    },
  },
});

// Validation du client
if (!supabase) {
  throw new Error('Échec de l\'initialisation du client Supabase');
}

// Export sécurisé
export default supabase;