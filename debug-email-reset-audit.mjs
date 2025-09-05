#!/usr/bin/env node
/**
 * 🔍 AUDIT EMAILS DE RESET PASSWORD
 * Diagnostiquer pourquoi les emails de reset ne sont pas envoyés
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
 * 1. Vérifier la configuration email Supabase
 */
async function auditEmailConfiguration() {
  console.log('🔍 1. AUDIT CONFIGURATION EMAIL SUPABASE\n');
  
  console.log('📋 Configuration dans config.toml:');
  console.log('   ✅ enable_confirmations = true');
  console.log('   ✅ double_confirm_changes = true');
  console.log('   ✅ enable_signup = true');
  
  console.log('\n📋 À vérifier dans Dashboard Supabase:');
  console.log('   🔗 https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/templates');
  console.log('   - Template "Reset Password" activé ?');
  console.log('   - Provider email configuré ?');
  console.log('   - SMTP/Resend configuré ?');
  
  // Test basique de connexion
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('\n✅ Connexion Supabase OK');
  } catch (error) {
    console.log('❌ Erreur connexion:', error.message);
  }
}

/**
 * 2. Diagnostiquer les fonctions Edge email
 */
async function auditEmailEdgeFunctions() {
  console.log('\n🔍 2. AUDIT FONCTIONS EDGE EMAIL\n');
  
  const emailFunctions = [
    'send-password-reset',
    'send-email-confirmation', 
    'send-welcome-ciara',
    'send-contact-form'
  ];
  
  console.log('📋 Fonctions Edge email disponibles:');
  
  for (const funcName of emailFunctions) {
    try {
      console.log(`\n🧪 Test fonction: ${funcName}`);
      
      // Test de base - juste voir si la fonction répond
      const response = await fetch(`${supabaseUrl}/functions/v1/${funcName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          test: true,
          email: 'test@example.com'
        })
      });
      
      const responseText = await response.text();
      
      if (response.status === 200) {
        console.log(`   ✅ Fonction ${funcName} répond (200)`);
      } else if (response.status === 400) {
        console.log(`   ⚠️  Fonction ${funcName} répond mais paramètres manquants (400)`);
      } else {
        console.log(`   ❌ Fonction ${funcName} erreur (${response.status})`);
        console.log(`   📄 Réponse: ${responseText.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Fonction ${funcName} inaccessible: ${error.message}`);
    }
  }
}

/**
 * 3. Tester l'envoi de reset password
 */
async function testResetPasswordEmail(email) {
  console.log(`\n🔍 3. TEST RESET PASSWORD POUR: ${email}\n`);
  
  if (!email || !email.includes('@')) {
    console.log('❌ Email invalide fourni');
    return;
  }
  
  try {
    // Vérifier que l'utilisateur existe
    console.log('👤 Vérification utilisateur...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(email);
    
    if (userError) {
      // Essayer par email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      const foundUser = users?.users?.find(u => u.email === email);
      
      if (!foundUser) {
        console.log('❌ Utilisateur non trouvé avec cet email');
        console.log('💡 L\'utilisateur doit exister pour recevoir un reset password');
        return;
      } else {
        console.log('✅ Utilisateur trouvé');
      }
    } else {
      console.log('✅ Utilisateur trouvé');
    }
    
    // Test 1: Méthode native Supabase
    console.log('\n📤 Test 1: Reset password natif Supabase...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ciara.city/reset-password'
    });
    
    if (resetError) {
      console.log('❌ Erreur reset natif:', resetError.message);
      console.log('📋 Code erreur:', resetError.status);
      
      if (resetError.message?.includes('rate limit')) {
        console.log('⏱️  Trop de tentatives - attendre avant de réessayer');
      }
    } else {
      console.log('✅ Reset password natif envoyé avec succès');
      console.log('📧 Vérifiez votre boîte mail (y compris spam)');
    }
    
    // Test 2: Via fonction Edge (si elle existe)
    console.log('\n📤 Test 2: Via fonction Edge send-password-reset...');
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: email,
          resetUrl: 'https://ciara.city/reset-password'
        }
      });
      
      if (edgeError) {
        console.log('❌ Erreur fonction Edge:', edgeError.message);
      } else {
        console.log('✅ Fonction Edge exécutée');
        console.log('📄 Résultat:', edgeData);
      }
    } catch (edgeErr) {
      console.log('⚠️  Fonction Edge send-password-reset non disponible ou erreur');
    }
    
  } catch (error) {
    console.log('❌ Erreur test reset:', error.message);
  }
}

/**
 * 4. Diagnostiquer les problèmes email
 */
function diagnoseEmailIssues() {
  console.log('\n🔍 4. DIAGNOSTIC PROBLÈMES EMAIL\n');
  
  console.log('🚨 Causes possibles emails non reçus:');
  
  console.log('\n   1. 📧 CONFIGURATION EMAIL MANQUANTE');
  console.log('      - Dashboard Supabase > Auth > Settings > Email');
  console.log('      - Aucun provider email configuré');
  console.log('      - Solution: Configurer SMTP ou Resend');
  
  console.log('\n   2. 📨 TEMPLATE EMAIL DÉSACTIVÉ');
  console.log('      - Dashboard Supabase > Auth > Email Templates');
  console.log('      - Template "Reset Password" désactivé');
  console.log('      - Solution: Activer le template');
  
  console.log('\n   3. 🚫 RATE LIMITING');
  console.log('      - Trop de tentatives de reset');
  console.log('      - Supabase bloque temporairement');
  console.log('      - Solution: Attendre 15-60 minutes');
  
  console.log('\n   4. 📮 PROBLÈME SMTP/RESEND');
  console.log('      - Clé API Resend expirée/invalide');
  console.log('      - Configuration SMTP incorrecte');
  console.log('      - Solution: Vérifier les credentials');
  
  console.log('\n   5. 🛡️  FILTRE ANTI-SPAM');
  console.log('      - Email de reset dans spam/promotion');
  console.log('      - Domaine ciara.city non vérifié');
  console.log('      - Solution: Vérifier dossiers spam');
  
  console.log('\n   6. 👤 UTILISATEUR INEXISTANT');
  console.log('      - Email non enregistré dans la base');
  console.log('      - Utilisateur supprimé/désactivé');
  console.log('      - Solution: Vérifier l\'existence utilisateur');
}

/**
 * 5. Proposer des solutions
 */
function proposeSolutions() {
  console.log('\n🔧 5. SOLUTIONS RECOMMANDÉES\n');
  
  console.log('📋 Plan d\'action prioritaire:');
  
  console.log('\n   ÉTAPE 1: VÉRIFIER DASHBOARD SUPABASE');
  console.log('   🔗 https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/providers');
  console.log('   - Vérifier qu\'un provider email est configuré');
  console.log('   - Si "Use Supabase SMTP", c\'est limité et peut ne pas fonctionner');
  console.log('   - Recommandé: Configurer Resend');
  
  console.log('\n   ÉTAPE 2: VÉRIFIER EMAIL TEMPLATES');
  console.log('   🔗 https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/templates');
  console.log('   - Template "Reset Password" doit être activé');
  console.log('   - Vérifier le contenu du template');
  
  console.log('\n   ÉTAPE 3: CONFIGURER RESEND (RECOMMANDÉ)');
  console.log('   - Créer compte Resend: https://resend.com');
  console.log('   - Générer clé API');
  console.log('   - Configurer dans Dashboard Supabase > Auth > Providers > Email');
  console.log('   - Vérifier domaine ciara.city dans Resend');
  
  console.log('\n   ÉTAPE 4: TESTER AVEC UTILISATEUR EXISTANT');
  console.log('   - Utiliser un email qui a déjà un compte');
  console.log('   - Vérifier tous les dossiers email (spam, promotion, etc.)');
  
  console.log('\n   ÉTAPE 5: LOGS SUPABASE');
  console.log('   🔗 https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/logs/auth-logs');
  console.log('   - Regarder les logs d\'authentification');
  console.log('   - Chercher des erreurs d\'envoi email');
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 AUDIT COMPLET EMAILS DE RESET PASSWORD\n');
  console.log('='.repeat(70));
  
  await auditEmailConfiguration();
  await auditEmailEdgeFunctions();
  
  // Test avec email fourni
  const testEmail = process.argv[2];
  if (testEmail && testEmail.includes('@')) {
    await testResetPasswordEmail(testEmail);
  } else {
    console.log('\n💡 Pour tester avec un email spécifique:');
    console.log('   node debug-email-reset-audit.mjs votre-email@example.com');
  }
  
  diagnoseEmailIssues();
  proposeSolutions();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Audit terminé');
  
  console.log('\n🎯 ACTIONS IMMÉDIATES:');
  console.log('1. Vérifiez Dashboard Supabase > Auth > Providers > Email');
  console.log('2. Vérifiez Dashboard Supabase > Auth > Email Templates');
  console.log('3. Configurez Resend si nécessaire');
  console.log('4. Testez avec un email existant');
  console.log('5. Vérifiez les dossiers spam/promotion');
}

main().catch(console.error);