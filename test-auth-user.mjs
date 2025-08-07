// Vérifier l'utilisateur dans auth.users
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

// Utiliser les variables d'environnement sécurisées
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ ERREUR: VITE_SUPABASE_ANON_KEY non définie dans les variables d\'environnement');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthUser() {
  const userId = '7a782714-4642-492a-b370-e5f2a08c1f51';
  
  console.log('🔍 Test de l\'utilisateur auth pour user ID:', userId);
  
  try {
    // Test 1: Vérifier l'utilisateur dans auth.users via une fonction
    const { data: authData, error: authError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('Auth user data:', authData);
    console.log('Auth error:', authError);
    
    // Test 2: Vérifier les politiques RLS
    console.log('🔍 Test des politiques RLS...');
    
    // Test 3: Lister tous les utilisateurs auth (si possible)
    const { data: allUsers, error: allError } = await supabase
      .from('profiles')
      .select('user_id, email, role')
      .limit(5);
    
    console.log('All users in profiles:', allUsers);
    console.log('All error:', allError);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAuthUser(); 