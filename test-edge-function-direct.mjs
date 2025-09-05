#!/usr/bin/env node
/**
 * 🧪 TEST DIRECT DE L'EDGE FUNCTION RESET PASSWORD
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ ERREUR: VITE_SUPABASE_ANON_KEY manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEdgeFunction() {
  console.log('🧪 TEST DIRECT EDGE FUNCTION send-password-reset-custom\n');
  
  const testEmail = process.argv[2] || 'test@ciara.city';
  
  console.log(`📤 Test avec email: ${testEmail}`);
  console.log('🔗 URL:', `${supabaseUrl}/functions/v1/send-password-reset-custom`);
  
  try {
    const { data, error } = await supabase.functions.invoke('send-password-reset-custom', {
      body: {
        email: testEmail,
        userName: 'Test User'
      }
    });
    
    if (error) {
      console.log('❌ ERREUR Edge Function:', error);
      console.log('📋 Détails:', JSON.stringify(error, null, 2));
      
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('\n🚨 DIAGNOSTIC: Edge Function PAS DEPLOYÉE sur Supabase cloud !');
      }
      
      return false;
    } else {
      console.log('✅ Edge Function fonctionne !');
      console.log('📧 Réponse:', JSON.stringify(data, null, 2));
      return true;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  
  const success = await testEdgeFunction();
  
  console.log('\n' + '='.repeat(60));
  
  if (success) {
    console.log('✅ Edge Function opérationnelle - problème ailleurs');
  } else {
    console.log('❌ Edge Function non disponible - REDEPLOYMENT NÉCESSAIRE');
  }
  
  console.log('\n🎯 PROCHAINE ÉTAPE:');
  if (success) {
    console.log('   - Analyser pourquoi AuthPage n\'utilise pas la fonction');
  } else {
    console.log('   - Re-déployer les Edge Functions sur Supabase cloud');
  }
}

main().catch(console.error);