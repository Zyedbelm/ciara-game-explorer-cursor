// Configuration sécurisée du client Supabase
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Variables d'environnement avec validation stricte
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation des variables d'environnement critiques
const validateEnvironment = () => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    console.error('URL:', SUPABASE_URL ? '✅' : '❌');
    console.error('KEY:', SUPABASE_PUBLISHABLE_KEY ? '✅' : '❌');
    throw new Error('Variables d\'environnement Supabase requises');
  }
};

// Validation stricte en production
if (import.meta.env.PROD) {
  validateEnvironment();
}

// Configuration sécurisée du client
export const supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
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

// Exports sécurisés
export { createClient };
export default supabase;