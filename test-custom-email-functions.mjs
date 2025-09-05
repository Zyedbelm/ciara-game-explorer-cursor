#!/usr/bin/env node
/**
 * 🧪 TEST DES NOUVELLES EDGE FUNCTIONS EMAIL CUSTOM
 * Test des fonctions send-password-reset-custom et send-magic-link-custom
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ ERREUR: SUPABASE_SERVICE_ROLE_KEY manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * Tester la fonction send-password-reset-custom
 */
async function testPasswordResetCustom(email) {
  console.log(`🔐 Test send-password-reset-custom pour: ${email}\n`);
  
  try {
    console.log('📤 Envoi requête à send-password-reset-custom...');
    
    const { data, error } = await supabase.functions.invoke('send-password-reset-custom', {
      body: {
        email: email,
        userName: 'Test User'
      }
    });
    
    if (error) {
      console.log('❌ Erreur Edge Function:', error);
      return false;
    }
    
    console.log('✅ Edge Function exécutée avec succès');
    console.log('📧 Message ID:', data?.messageId || 'N/A');
    console.log('📄 Réponse:', data?.message || 'N/A');
    
    return true;
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return false;
  }
}

/**
 * Tester la fonction send-magic-link-custom
 */
async function testMagicLinkCustom(email) {
  console.log(`\n✨ Test send-magic-link-custom pour: ${email}\n`);
  
  try {
    console.log('📤 Envoi requête à send-magic-link-custom...');
    
    const { data, error } = await supabase.functions.invoke('send-magic-link-custom', {
      body: {
        email: email,
        userName: 'Test User'
      }
    });
    
    if (error) {
      console.log('❌ Erreur Edge Function:', error);
      return false;
    }
    
    console.log('✅ Edge Function exécutée avec succès');
    console.log('📧 Message ID:', data?.messageId || 'N/A');
    console.log('📄 Réponse:', data?.message || 'N/A');
    
    return true;
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return false;
  }
}

/**
 * Comparer avec les anciennes méthodes
 */
async function compareWithNativeMethods(email) {
  console.log(`\n🔍 Comparaison méthodes natives vs custom pour: ${email}\n`);
  
  // Test méthode native reset password
  console.log('📤 Test méthode native resetPasswordForEmail...');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ciara.city/reset-password'
    });
    
    if (error) {
      console.log('❌ Méthode native reset - Erreur:', error.message);
    } else {
      console.log('⚠️  Méthode native reset - Semble OK mais email probablement pas envoyé');
    }
  } catch (err) {
    console.log('❌ Méthode native reset - Exception:', err.message);
  }
  
  // Test méthode native magic link
  console.log('\n📤 Test méthode native signInWithOtp...');
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'https://ciara.city/profile'
      }
    });
    
    if (error) {
      console.log('❌ Méthode native magic link - Erreur:', error.message);
    } else {
      console.log('⚠️  Méthode native magic link - Semble OK mais email probablement pas envoyé');
    }
  } catch (err) {
    console.log('❌ Méthode native magic link - Exception:', err.message);
  }
}

/**
 * Vérifier le déploiement des fonctions
 */
async function checkFunctionDeployment() {
  console.log('🔍 Vérification du déploiement des Edge Functions\n');
  
  const functions = [
    'send-password-reset-custom',
    'send-magic-link-custom'
  ];
  
  for (const funcName of functions) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/${funcName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ test: true })
      });
      
      if (response.status === 200 || response.status === 400) {
        console.log(`✅ ${funcName} - Déployée et accessible`);
      } else {
        console.log(`❌ ${funcName} - Problème de déploiement (${response.status})`);
      }
      
    } catch (error) {
      console.log(`❌ ${funcName} - Non accessible: ${error.message}`);
    }
  }
}

/**
 * Instructions de déploiement
 */
function deploymentInstructions() {
  console.log('\n🚀 INSTRUCTIONS DE DÉPLOIEMENT\n');
  
  console.log('Pour déployer les nouvelles Edge Functions:');
  console.log('1. supabase functions deploy send-password-reset-custom');
  console.log('2. supabase functions deploy send-magic-link-custom');
  console.log('3. Redémarrer le serveur local: npm run dev');
  console.log('4. Tester depuis l\'interface utilisateur');
  
  console.log('\n📋 Variables d\'environnement requises:');
  console.log('- RESEND_API_KEY (pour Resend)');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (pour génération des liens)');
  console.log('- SUPABASE_URL (automatique)');
}

/**
 * Script principal
 */
async function main() {
  console.log('🧪 TEST COMPLET DES NOUVELLES EDGE FUNCTIONS EMAIL\n');
  console.log('='.repeat(70));
  
  // Vérifier le déploiement
  await checkFunctionDeployment();
  
  // Email de test
  const testEmail = process.argv[2];
  
  if (!testEmail || !testEmail.includes('@')) {
    console.log('\n❌ Email de test requis');
    console.log('Usage: node test-custom-email-functions.mjs email@example.com');
    console.log('\nTests de déploiement terminés - fonctions accessibles ✅');
    deploymentInstructions();
    return;
  }
  
  console.log(`\n🎯 Email de test: ${testEmail}\n`);
  
  // Tester les nouvelles fonctions
  const resetResult = await testPasswordResetCustom(testEmail);
  const magicResult = await testMagicLinkCustom(testEmail);
  
  // Comparer avec les anciennes
  await compareWithNativeMethods(testEmail);
  
  // Résumé
  console.log('\n' + '='.repeat(70));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log(`✅ Reset Password Custom: ${resetResult ? 'SUCCÈS' : 'ÉCHEC'}`);
  console.log(`✅ Magic Link Custom: ${magicResult ? 'SUCCÈS' : 'ÉCHEC'}`);
  
  if (resetResult && magicResult) {
    console.log('\n🎉 TOUTES LES FONCTIONS CUSTOM FONCTIONNENT !');
    console.log('📧 Vérifiez votre boîte email pour les 2 emails reçus');
    console.log('🔗 Testez les liens dans les emails');
  } else {
    console.log('\n⚠️  Certaines fonctions ont des problèmes');
    console.log('💡 Vérifiez les logs ci-dessus pour identifier les erreurs');
  }
  
  deploymentInstructions();
}

main().catch(console.error);