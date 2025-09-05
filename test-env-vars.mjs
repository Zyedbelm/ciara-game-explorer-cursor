#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEnvVars() {
  console.log('🔍 VÉRIFICATION VARIABLES D\'ENVIRONNEMENT SUPABASE\n');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-env');
    
    if (error) {
      console.log('❌ Erreur:', error);
    } else {
      console.log('✅ Réponse:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

testEnvVars();