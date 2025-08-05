// Test direct du profil utilisateur
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

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