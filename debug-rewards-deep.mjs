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

async function debugRewardsDeep() {
  console.log('🔍 DIAGNOSTIC PROFOND DES RÉCOMPENSES');
  console.log('=====================================');

  try {
    // 1. Vérifier la connexion
    console.log('\n1. 🔌 Test de connexion...');
    const { data: testData, error: testError } = await supabase
      .from('rewards')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return;
    }
    console.log('✅ Connexion OK');

    // 2. Compter toutes les récompenses
    console.log('\n2. 📊 Comptage des récompenses...');
    const { count: totalRewards, error: countError } = await supabase
      .from('rewards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur de comptage:', countError);
    } else {
      console.log(`📈 Total des récompenses: ${totalRewards}`);
    }

    // 3. Compter les récompenses actives
    console.log('\n3. 🟢 Comptage des récompenses actives...');
    const { count: activeRewards, error: activeCountError } = await supabase
      .from('rewards')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (activeCountError) {
      console.error('❌ Erreur de comptage actives:', activeCountError);
    } else {
      console.log(`🟢 Récompenses actives: ${activeRewards}`);
    }

    // 4. Récupérer toutes les récompenses avec leurs partenaires
    console.log('\n4. 🔍 Récupération des récompenses avec partenaires...');
    const { data: rewardsWithPartners, error: rewardsError } = await supabase
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
      .eq('is_active', true)
      .order('points_required');

    if (rewardsError) {
      console.error('❌ Erreur de récupération des récompenses:', rewardsError);
      return;
    }

    console.log(`📦 Récompenses récupérées: ${rewardsWithPartners?.length || 0}`);

    if (rewardsWithPartners && rewardsWithPartners.length > 0) {
      console.log('\n📋 DÉTAIL DES RÉCOMPENSES:');
      rewardsWithPartners.forEach((reward, index) => {
        console.log(`\n${index + 1}. ${reward.title}`);
        console.log(`   - ID: ${reward.id}`);
        console.log(`   - Points: ${reward.points_required}`);
        console.log(`   - Actif: ${reward.is_active}`);
        console.log(`   - Partenaire: ${reward.partners ? reward.partners.name : 'AUCUN'}`);
        console.log(`   - Partenaire ID: ${reward.partner_id || 'NULL'}`);
        if (reward.partners) {
          console.log(`   - Ville: ${reward.partners.cities?.name || 'Non définie'}`);
        }
      });

      // 5. Analyser les récompenses sans partenaires
      console.log('\n5. 🔍 Analyse des récompenses sans partenaires...');
      const rewardsWithoutPartners = rewardsWithPartners.filter(r => !r.partners);
      console.log(`❌ Récompenses sans partenaire: ${rewardsWithoutPartners.length}`);
      
      if (rewardsWithoutPartners.length > 0) {
        console.log('📋 Récompenses sans partenaire:');
        rewardsWithoutPartners.forEach(reward => {
          console.log(`   - ${reward.title} (ID: ${reward.id}, partner_id: ${reward.partner_id})`);
        });
      }

      // 6. Analyser les récompenses avec partenaires
      console.log('\n6. 🔍 Analyse des récompenses avec partenaires...');
      const rewardsWithPartnersData = rewardsWithPartners.filter(r => r.partners);
      console.log(`✅ Récompenses avec partenaire: ${rewardsWithPartnersData.length}`);
      
      if (rewardsWithPartnersData.length > 0) {
        console.log('📋 Récompenses avec partenaire:');
        rewardsWithPartnersData.forEach(reward => {
          console.log(`   - ${reward.title} -> ${reward.partners.name} (${reward.partners.cities?.name || 'Ville inconnue'})`);
        });
      }

    } else {
      console.log('❌ AUCUNE RÉCOMPENSE TROUVÉE !');
    }

    // 7. Vérifier les partenaires
    console.log('\n7. 🏢 Vérification des partenaires...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('id, name, category, city_id, is_active')
      .eq('is_active', true);
    
    if (partnersError) {
      console.error('❌ Erreur de récupération des partenaires:', partnersError);
    } else {
      console.log(`🏢 Partenaires actifs: ${partners?.length || 0}`);
      if (partners && partners.length > 0) {
        partners.forEach(partner => {
          console.log(`   - ${partner.name} (ID: ${partner.id}, Ville: ${partner.city_id})`);
        });
      }
    }

    // 8. Vérifier les villes
    console.log('\n8. 🌍 Vérification des villes...');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, country_id, is_active')
      .eq('is_active', true);
    
    if (citiesError) {
      console.error('❌ Erreur de récupération des villes:', citiesError);
    } else {
      console.log(`🌍 Villes actives: ${cities?.length || 0}`);
      if (cities && cities.length > 0) {
        cities.forEach(city => {
          console.log(`   - ${city.name} (ID: ${city.id}, Pays: ${city.country_id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugRewardsDeep();
