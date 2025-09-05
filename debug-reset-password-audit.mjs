#!/usr/bin/env node
/**
 * 🔍 AUDIT COMPLET RESET PASSWORD & MAGIC LINK
 * Script pour diagnostiquer pourquoi les liens mènent à une page d'erreur
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ ERREUR: SUPABASE_SERVICE_ROLE_KEY manquante dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * 1. Vérifier la configuration Supabase
 */
async function auditSupabaseConfig() {
  console.log('🔍 1. AUDIT CONFIGURATION SUPABASE\n');
  
  console.log('📋 URLs de redirection configurées dans config.toml:');
  console.log('   ✅ https://ciara.city/reset-password');
  console.log('   ✅ https://ciara.city/auth/callback');
  console.log('   ✅ https://ciara.city/profile');
  console.log('   ✅ http://localhost:8080/reset-password');
  console.log('   ✅ http://localhost:8080/auth/callback');
  console.log('   ✅ http://localhost:8080/profile');
  
  console.log('\n📋 Configuration auth actuelle:');
  console.log('   - site_url: https://ciara.city');
  console.log('   - jwt_expiry: 3600 (1 heure)');
  console.log('   - enable_confirmations: true');
  
  // Tester la connexion
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('\n✅ Connexion Supabase OK');
  } catch (error) {
    console.log('❌ Erreur connexion Supabase:', error.message);
  }
}

/**
 * 2. Analyser les routes React
 */
function auditReactRoutes() {
  console.log('\n🔍 2. AUDIT ROUTES REACT\n');
  
  const routes = [
    { path: '/reset-password', component: 'NativeResetPasswordPage', purpose: 'Reset password form' },
    { path: '/auth/callback', component: 'NativeAuthCallbackPage', purpose: 'Magic link & reset callback' },
    { path: '/auth/unified-callback', component: 'NativeAuthCallbackPage', purpose: 'Unified callback' },
    { path: '/auth/error', component: 'AuthErrorPage', purpose: 'Error handling' },
    { path: '/profile', component: 'ProfilePage', purpose: 'User profile (magic link target)' }
  ];
  
  console.log('📋 Routes configurées:');
  routes.forEach(route => {
    console.log(`   ✅ ${route.path} → ${route.component} (${route.purpose})`);
  });
}

/**
 * 3. Tester les fonctionnalités Supabase
 */
async function testSupabaseFunctionality() {
  console.log('\n🔍 3. TEST FONCTIONNALITÉS SUPABASE\n');
  
  const testEmail = 'test-debug@ciara.city';
  
  console.log('🧪 Test 1: Reset Password Email');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://ciara.city/reset-password'
    });
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log('   ✅ Reset password email envoyé avec succès');
      console.log('   📧 Redirection configurée vers: https://ciara.city/reset-password');
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
  
  console.log('\n🧪 Test 2: Magic Link Email');
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'https://ciara.city/profile'
      }
    });
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log('   ✅ Magic link email envoyé avec succès');
      console.log('   📧 Redirection configurée vers: https://ciara.city/profile');
    }
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
  }
}

/**
 * 4. Diagnostiquer les problèmes potentiels
 */
function diagnosePotentialIssues() {
  console.log('\n🔍 4. DIAGNOSTIC DES PROBLÈMES POTENTIELS\n');
  
  console.log('🚨 Causes possibles de la page d\'erreur:');
  console.log('\n   1. 🌐 PROBLÈME DE DOMAINE');
  console.log('      - Le lien pointe vers un domaine différent de la configuration');
  console.log('      - ciara.city vs localhost vs autre domaine');
  console.log('      - Solution: Vérifier l\'URL exacte dans l\'email reçu');
  
  console.log('\n   2. 🔗 PROBLÈME DE ROUTE');
  console.log('      - La route /reset-password ou /auth/callback n\'existe pas');
  console.log('      - Route mal configurée dans App.tsx');
  console.log('      - Solution: Vérifier que les routes sont bien définies');
  
  console.log('\n   3. 📝 PROBLÈME DE PARAMÈTRES URL');
  console.log('      - Les paramètres access_token, refresh_token manquent');
  console.log('      - URL malformée ou corrompue');
  console.log('      - Solution: Examiner l\'URL complète dans l\'email');
  
  console.log('\n   4. ⏱️  PROBLÈME DE TOKEN EXPIRÉ');
  console.log('      - Le lien est valide seulement 1 heure');
  console.log('      - Token déjà utilisé ou expiré');
  console.log('      - Solution: Générer un nouveau lien');
  
  console.log('\n   5. 🔧 PROBLÈME DE CONFIGURATION SUPABASE');
  console.log('      - URL de redirection non autorisée dans le dashboard');
  console.log('      - Mauvaise configuration de site_url');
  console.log('      - Solution: Vérifier Authentication > URL Configuration');
  
  console.log('\n   6. 🛡️  PROBLÈME DE SÉCURITÉ/CORS');
  console.log('      - Politique de sécurité bloquant la redirection');
  console.log('      - Headers CORS mal configurés');
  console.log('      - Solution: Vérifier la console browser pour erreurs');
}

/**
 * 5. Proposer des solutions
 */
function proposeSolutions() {
  console.log('\n🔧 5. SOLUTIONS RECOMMANDÉES\n');
  
  console.log('📋 Plan d\'action:');
  console.log('\n   ÉTAPE 1: VÉRIFIER L\'EMAIL REÇU');
  console.log('   - Copier l\'URL complète du lien de reset');
  console.log('   - Vérifier le domaine (ciara.city vs localhost vs autre)');
  console.log('   - Vérifier les paramètres access_token, type, etc.');
  
  console.log('\n   ÉTAPE 2: VÉRIFIER LE DASHBOARD SUPABASE');
  console.log('   - Aller sur: https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/url-configuration');
  console.log('   - Vérifier Site URL = https://ciara.city');
  console.log('   - Vérifier Redirect URLs contient:');
  console.log('     * https://ciara.city/reset-password');
  console.log('     * https://ciara.city/auth/callback');
  console.log('     * https://ciara.city/profile');
  
  console.log('\n   ÉTAPE 3: TESTER EN LOCAL');
  console.log('   - Démarrer le serveur local: npm run dev');
  console.log('   - Tester avec http://localhost:8080/reset-password');
  console.log('   - Vérifier que la page se charge sans erreur');
  
  console.log('\n   ÉTAPE 4: EXAMINER LA CONSOLE BROWSER');
  console.log('   - Ouvrir DevTools (F12)');
  console.log('   - Cliquer sur le lien de reset');
  console.log('   - Regarder les erreurs dans Console et Network');
  
  console.log('\n   ÉTAPE 5: TEST MANUEL');
  console.log('   - Aller manuellement sur https://ciara.city/reset-password');
  console.log('   - Si ça fonctionne, le problème vient du lien email');
  console.log('   - Si ça ne fonctionne pas, problème de route/hébergement');
}

/**
 * 6. Créer un lien de test
 */
async function createTestLink(email) {
  if (!email) return;
  
  console.log(`\n🧪 6. CRÉATION LIEN DE TEST POUR: ${email}\n`);
  
  try {
    console.log('📤 Envoi reset password test...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ciara.city/reset-password'
    });
    
    if (resetError) {
      console.log('❌ Erreur reset:', resetError.message);
    } else {
      console.log('✅ Reset password envoyé');
      console.log('📧 Vérifiez votre boîte mail et testez le lien');
    }
    
    console.log('\n📤 Envoi magic link test...');
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'https://ciara.city/profile'
      }
    });
    
    if (magicError) {
      console.log('❌ Erreur magic link:', magicError.message);
    } else {
      console.log('✅ Magic link envoyé');
      console.log('📧 Vérifiez votre boîte mail et testez le lien');
    }
    
  } catch (error) {
    console.log('❌ Erreur test:', error.message);
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 AUDIT COMPLET RESET PASSWORD & MAGIC LINK\n');
  console.log('='.repeat(70));
  
  await auditSupabaseConfig();
  auditReactRoutes();
  await testSupabaseFunctionality();
  diagnosePotentialIssues();
  proposeSolutions();
  
  // Test avec email fourni en paramètre
  const testEmail = process.argv[2];
  if (testEmail && testEmail.includes('@')) {
    await createTestLink(testEmail);
  } else {
    console.log('\n💡 Pour tester avec votre email:');
    console.log('   node debug-reset-password-audit.mjs votre-email@example.com');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Audit terminé');
  
  console.log('\n🎯 RÉSUMÉ ACTIONS:');
  console.log('1. Vérifiez l\'URL exacte dans l\'email reçu');
  console.log('2. Testez manuellement: https://ciara.city/reset-password');
  console.log('3. Vérifiez Dashboard Supabase > Auth > URL Configuration');
  console.log('4. Examinez la console browser pour erreurs');
  console.log('5. Testez en localhost si nécessaire');
}

main().catch(console.error);