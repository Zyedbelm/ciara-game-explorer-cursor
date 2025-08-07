// Configuration sécurisée du client Supabase
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Variables d'environnement avec fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

// Validation des variables d'environnement critiques
const validateEnvironment = () => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    console.error('URL:', SUPABASE_URL ? '✅' : '❌');
    console.error('KEY:', SUPABASE_PUBLISHABLE_KEY ? '✅' : '❌');
  }
};

// Validation en développement uniquement
if (import.meta.env.DEV) {
  validateEnvironment();
}

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