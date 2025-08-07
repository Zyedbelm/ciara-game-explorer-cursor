// Exécuter la migration pour créer le profil
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

async function executeMigration() {
  console.log('🔧 Exécution de la migration...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO public.profiles (
          user_id,
          email,
          full_name,
          role,
          total_points,
          current_level,
          fitness_level,
          preferred_languages,
          interests,
          city_id,
          created_at,
          updated_at
        ) VALUES (
          '7a782714-4642-492a-b370-e5f2a08c1f51',
          'hedi.elmeddeb@gmail.com',
          'Hedi Elmeddeb',
          'partner',
          0,
          1,
          'medium',
          ARRAY['fr', 'en'],
          ARRAY['gastronomy', 'culture'],
          NULL,
          NOW(),
          NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
      `
    });
    
    console.log('✅ Migration exécutée:', data);
    console.log('❌ Erreur:', error);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

executeMigration(); 