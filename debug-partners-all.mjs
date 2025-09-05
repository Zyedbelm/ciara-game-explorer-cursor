import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPartnersAll() {
  console.log('🔍 DIAGNOSTIC COMPLET DES PARTENAIRES');
  console.log('=====================================');

  try {
    // 1. Tous les partenaires (actifs et inactifs)
    console.log('\n1. 🏢 Tous les partenaires...');
    const { data: allPartners, error: allPartnersError } = await supabase
      .from('partners')
      .select('id, name, category, city_id, is_active, created_at');
    
    if (allPartnersError) {
      console.error('❌ Erreur de récupération des partenaires:', allPartnersError);
    } else {
      console.log(`🏢 Total des partenaires: ${allPartners?.length || 0}`);
      if (allPartners && allPartners.length > 0) {
        allPartners.forEach(partner => {
          console.log(`   - ${partner.name} (ID: ${partner.id}, Actif: ${partner.is_active}, Ville: ${partner.city_id})`);
        });
      }
    }

    // 2. Partenaires actifs seulement
    console.log('\n2. 🟢 Partenaires actifs...');
    const { data: activePartners, error: activePartnersError } = await supabase
      .from('partners')
      .select('id, name, category, city_id, is_active')
      .eq('is_active', true);
    
    if (activePartnersError) {
      console.error('❌ Erreur de récupération des partenaires actifs:', activePartnersError);
    } else {
      console.log(`🟢 Partenaires actifs: ${activePartners?.length || 0}`);
    }

    // 3. Vérifier les partner_id des récompenses
    console.log('\n3. 🔍 Vérification des partner_id des récompenses...');
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('id, title, partner_id');
    
    if (rewardsError) {
      console.error('❌ Erreur de récupération des récompenses:', rewardsError);
    } else {
      console.log(`📦 Récompenses: ${rewards?.length || 0}`);
      if (rewards && rewards.length > 0) {
        rewards.forEach(reward => {
          console.log(`   - ${reward.title} (partner_id: ${reward.partner_id})`);
          
          // Vérifier si ce partner_id existe
          if (reward.partner_id) {
            const partnerExists = allPartners?.find(p => p.id === reward.partner_id);
            if (partnerExists) {
              console.log(`     ✅ Partenaire trouvé: ${partnerExists.name} (Actif: ${partnerExists.is_active})`);
            } else {
              console.log(`     ❌ Partenaire NON TROUVÉ pour ID: ${reward.partner_id}`);
            }
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugPartnersAll();


