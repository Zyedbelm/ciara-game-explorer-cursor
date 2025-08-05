// Exécuter la migration pour créer le profil
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIzNjQ0NCwiZXhwIjoyMDY3ODEyNDQ0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

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