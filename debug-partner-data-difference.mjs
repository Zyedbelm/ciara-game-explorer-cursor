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

async function debugPartnerDataDifference() {
  console.log('🔍 DIAGNOSTIC DIFFÉRENCE DONNÉES PARTENAIRES');
  console.log('============================================');

  try {
    // 1. Vérifier les récompenses avec leurs partner_id
    console.log('\n1. 📦 Récompenses avec partner_id...');
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('id, title, partner_id');
    
    if (rewardsError) {
      console.error('❌ Erreur:', rewardsError);
      return;
    }

    console.log(`📦 Récompenses trouvées: ${rewards?.length || 0}`);
    rewards?.forEach(reward => {
      console.log(`   - ${reward.title} (partner_id: ${reward.partner_id})`);
    });

    // 2. Vérifier si les partner_id existent dans la table partners
    console.log('\n2. 🏢 Vérification des partenaires...');
    const { data: allPartners, error: partnersError } = await supabase
      .from('partners')
      .select('id, name, category, city_id, is_active');
    
    if (partnersError) {
      console.error('❌ Erreur partenaires:', partnersError);
    } else {
      console.log(`🏢 Total partenaires: ${allPartners?.length || 0}`);
      allPartners?.forEach(partner => {
        console.log(`   - ${partner.name} (ID: ${partner.id}, Actif: ${partner.is_active}, Ville: ${partner.city_id})`);
      });
    }

    // 3. Vérifier les villes
    console.log('\n3. 🌍 Vérification des villes...');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, country_id');
    
    if (citiesError) {
      console.error('❌ Erreur villes:', citiesError);
    } else {
      console.log(`🌍 Total villes: ${cities?.length || 0}`);
      cities?.forEach(city => {
        console.log(`   - ${city.name} (ID: ${city.id})`);
      });
    }

    // 4. Test de la requête exacte avec jointure
    console.log('\n4. 🔗 Test de la requête avec jointure...');
    const { data: rewardsWithPartners, error: joinError } = await supabase
      .from('rewards')
      .select(`
        *,
        partners(
          id,
          name,
          category,
          logo_url,
          address,
          latitude,
          longitude,
          city_id,
          cities(id, name, country_id)
        )
      `)
      .eq('is_active', true);

    if (joinError) {
      console.error('❌ Erreur jointure:', joinError);
    } else {
      console.log(`🔗 Récompenses avec jointure: ${rewardsWithPartners?.length || 0}`);
      rewardsWithPartners?.forEach(reward => {
        console.log(`\n   📦 ${reward.title}`);
        console.log(`      - partner_id: ${reward.partner_id}`);
        console.log(`      - partners: ${reward.partners ? 'TROUVÉ' : 'NULL'}`);
        if (reward.partners) {
          console.log(`      - Nom: ${reward.partners.name}`);
          console.log(`      - Ville: ${reward.partners.cities?.name || 'Non définie'}`);
          console.log(`      - Adresse: ${reward.partners.address || 'Non définie'}`);
        }
      });
    }

    // 5. Vérifier s'il y a des partenaires inactifs
    console.log('\n5. 🔍 Vérification des partenaires inactifs...');
    if (rewards && allPartners) {
      rewards.forEach(reward => {
        if (reward.partner_id) {
          const partner = allPartners.find(p => p.id === reward.partner_id);
          if (partner) {
            console.log(`   ✅ ${reward.title} -> ${partner.name} (Actif: ${partner.is_active})`);
          } else {
            console.log(`   ❌ ${reward.title} -> Partenaire ID ${reward.partner_id} NON TROUVÉ`);
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugPartnerDataDifference();


