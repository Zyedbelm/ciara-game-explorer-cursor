import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 VÉRIFICATION ENVIRONNEMENT');
console.log('============================');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey?.substring(0, 20)}...`);

// Vérifier si c'est l'environnement de production ou de développement
if (supabaseUrl?.includes('pohqkspsdvvbqrgzfayl')) {
  console.log('🌐 ENVIRONNEMENT: PRODUCTION (pohqkspsdvvbqrgzfayl.supabase.co)');
} else {
  console.log('🏠 ENVIRONNEMENT: DÉVELOPPEMENT LOCAL');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEnvDifferences() {
  try {
    // Test simple de connexion
    const { data, error } = await supabase
      .from('rewards')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
    } else {
      console.log('✅ Connexion réussie');
    }

    // Vérifier les récompenses
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('id, title, partner_id')
      .limit(5);
    
    if (rewardsError) {
      console.error('❌ Erreur récompenses:', rewardsError);
    } else {
      console.log(`📦 Récompenses: ${rewards?.length || 0}`);
      rewards?.forEach(reward => {
        console.log(`   - ${reward.title} (partner_id: ${reward.partner_id})`);
      });
    }

    // Vérifier les partenaires
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, name, city_id')
      .limit(5);
    
    if (partnersError) {
      console.error('❌ Erreur partenaires:', partnersError);
    } else {
      console.log(`🏢 Partenaires: ${partners?.length || 0}`);
      partners?.forEach(partner => {
        console.log(`   - ${partner.name} (ville: ${partner.city_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkEnvDifferences();


