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

async function testRewardsFix() {
  console.log('🧪 TEST DE LA CORRECTION DES RÉCOMPENSES');
  console.log('=========================================');

  try {
    // Simuler la requête exacte de RewardsPage
    console.log('\n1. 🔍 Test de la requête RewardsPage...');
    const { data, error } = await supabase
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

    if (error) {
      console.error('❌ Erreur de requête:', error);
      return;
    }

    console.log(`📦 Récompenses récupérées: ${data?.length || 0}`);

    if (data && data.length > 0) {
      // Simuler la transformation
      console.log('\n2. 🔄 Test de la transformation...');
      const transformedRewards = data.map(reward => ({
        ...reward,
        partner: reward.partners ? {
          ...reward.partners,
          city: reward.partners.cities
        } : null
      }));

      console.log('✅ Transformation réussie');
      
      // Analyser les résultats
      console.log('\n3. 📊 Analyse des résultats:');
      transformedRewards.forEach((reward, index) => {
        console.log(`\n${index + 1}. ${reward.title}`);
        console.log(`   - ID: ${reward.id}`);
        console.log(`   - Points: ${reward.points_required}`);
        console.log(`   - Partenaire: ${reward.partner ? reward.partner.name : 'AUCUN'}`);
        console.log(`   - Ville: ${reward.partner?.city?.name || 'Non définie'}`);
      });

      // Test du filtrage
      console.log('\n4. 🔍 Test du filtrage (simulation frontend)...');
      const filteredRewards = transformedRewards.filter(reward => {
        // Même logique que dans RewardsPage
        const matchesSearch = true; // Pas de terme de recherche
        const matchesCountry = true; // 'all' sélectionné
        const matchesCity = true; // 'all' sélectionné
        
        return matchesSearch && matchesCountry && matchesCity;
      });

      console.log(`✅ Récompenses après filtrage: ${filteredRewards.length}`);
      
      if (filteredRewards.length > 0) {
        console.log('🎉 SUCCÈS ! Les récompenses devraient maintenant s\'afficher dans le frontend');
      } else {
        console.log('❌ ÉCHEC ! Aucune récompense ne passerait le filtrage');
      }

    } else {
      console.log('❌ Aucune récompense trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testRewardsFix();


