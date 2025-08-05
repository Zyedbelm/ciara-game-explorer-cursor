// Vérifier l'utilisateur dans auth.users
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

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