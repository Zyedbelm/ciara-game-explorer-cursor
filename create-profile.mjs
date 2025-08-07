// Créer le profil utilisateur manquant
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

async function createProfile() {
  const userId = '7a782714-4642-492a-b370-e5f2a08c1f51';
  
  console.log('🔧 Création du profil pour user ID:', userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: 'hedi.elmeddeb@gmail.com',
        full_name: 'Hedi Elmeddeb',
        role: 'partner',
        total_points: 0,
        current_level: 1,
        fitness_level: 'medium',
        preferred_languages: ['fr', 'en'],
        interests: ['gastronomy', 'culture'],
        city_id: null
      })
      .select()
      .single();
    
    console.log('✅ Profil créé:', data);
    console.log('❌ Erreur:', error);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

createProfile(); 