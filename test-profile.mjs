// Test direct du profil utilisateur
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

async function testProfile() {
  const userId = '7a782714-4642-492a-b370-e5f2a08c1f51';
  
  console.log('🔍 Test du profil pour user ID:', userId);
  
  try {
    // Test 2: Vérifier si le profil existe dans profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('Profile:', profile);
    console.log('Profile error:', profileError);
    
    // Test 3: Lister tous les profils
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('user_id, email, role')
      .limit(10);
    
    console.log('All profiles:', allProfiles);
    console.log('All error:', allError);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testProfile(); 