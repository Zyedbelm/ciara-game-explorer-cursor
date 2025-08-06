// Test direct du profil utilisateur
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfile() {
  const userId = '7a782714-4642-492a-b370-e5f2a08c1f51';
  
  try {
    // Test 1: Vérifier si l'utilisateur existe dans auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    // Test 2: Vérifier si le profil existe dans profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Test 3: Lister tous les profils
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('user_id, email, role')
      .limit(10);
    
    } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testProfile(); 