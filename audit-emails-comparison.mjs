#!/usr/bin/env node
/**
 * 🔍 AUDIT COMPARATIF EMAILS - QUI FONCTIONNE VS QUI NE FONCTIONNE PAS
 * Analyser pourquoi certains emails marchent et pas d'autres
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
 * 1. ANALYSER LES EMAILS QUI FONCTIONNENT
 */
async function analyzeWorkingEmails() {
  console.log('✅ EMAILS QUI FONCTIONNENT\n');
  
  console.log('📧 1. EMAIL DE BIENVENUE');
  console.log('   - Fonction: send-welcome-ciara');
  console.log('   - Méthode: Edge Function via Resend');
  console.log('   - Déclencheur: Webhook auth après confirmation email');
  console.log('   - Template: Custom React Email bilingue');
  
  console.log('\n📧 2. EMAIL DE CONFIRMATION INSCRIPTION');
  console.log('   - Fonction: send-email-confirmation'); 
  console.log('   - Méthode: Edge Function via Resend');
  console.log('   - Déclencheur: Webhook auth lors création compte');
  console.log('   - Template: Custom React Email bilingue');
  
  console.log('\n📧 3. EMAILS BONS CADEAUX/RÉCOMPENSES');
  console.log('   - Méthode: Edge Functions via Resend');
  console.log('   - Déclencheur: Actions utilisateur/admin');
  console.log('   - Template: Custom React Email');
  
  console.log('\n🔑 POINT COMMUN: Tous utilisent RESEND via Edge Functions');
}

/**
 * 2. ANALYSER LES EMAILS QUI NE FONCTIONNENT PAS
 */
async function analyzeNonWorkingEmails() {
  console.log('\n❌ EMAILS QUI NE FONCTIONNENT PAS\n');
  
  console.log('📧 1. RESET PASSWORD');
  console.log('   - Méthode: supabase.auth.resetPasswordForEmail()');
  console.log('   - Provider: Templates Supabase natifs');
  console.log('   - Déclencheur: Frontend AuthPage.tsx ligne 110');
  console.log('   - Template: Template Supabase Dashboard');
  
  console.log('\n📧 2. MAGIC LINK');
  console.log('   - Méthode: supabase.auth.signInWithOtp()');  
  console.log('   - Provider: Templates Supabase natifs');
  console.log('   - Déclencheur: Frontend AuthPage.tsx ligne 152');
  console.log('   - Template: Template Supabase Dashboard');
  
  console.log('\n🚨 DIFFÉRENCE CRITIQUE:');
  console.log('   Reset/Magic Link = Templates Supabase natifs');
  console.log('   Autres emails = Edge Functions + Resend');
}

/**
 * 3. COMPARER LES MÉTHODES
 */
function compareEmailMethods() {
  console.log('\n🔍 COMPARAISON DES MÉTHODES\n');
  
  console.table([
    {
      'Type Email': 'Bienvenue',
      'Méthode': 'Edge Function',
      'Provider': 'Resend',
      'Template': 'React Custom',
      'Status': '✅ Fonctionne'
    },
    {
      'Type Email': 'Confirmation',
      'Méthode': 'Edge Function', 
      'Provider': 'Resend',
      'Template': 'React Custom',
      'Status': '✅ Fonctionne'
    },
    {
      'Type Email': 'Reset Password',
      'Méthode': 'Supabase natif',
      'Provider': 'Templates Supabase',
      'Template': 'Supabase Dashboard',
      'Status': '❌ Ne fonctionne pas'
    },
    {
      'Type Email': 'Magic Link',
      'Méthode': 'Supabase natif',
      'Provider': 'Templates Supabase', 
      'Template': 'Supabase Dashboard',
      'Status': '❌ Ne fonctionne pas'
    }
  ]);
}

/**
 * 4. DIAGNOSTIQUER LE PROBLÈME
 */
function diagnoseProblem() {
  console.log('\n🎯 DIAGNOSTIC DU PROBLÈME\n');
  
  console.log('🚨 HYPOTHÈSE PRINCIPALE:');
  console.log('   Les templates Supabase natifs ne sont PAS configurés');
  console.log('   avec le même provider email que les Edge Functions');
  
  console.log('\n📋 VÉRIFICATIONS NÉCESSAIRES:');
  console.log('   1. Dashboard > Auth > Email Templates');
  console.log('      - Reset Password template activé ?');
  console.log('      - Magic Link template activé ?');
  console.log('      - Même sender que Resend ?');
  
  console.log('\n   2. Dashboard > Auth > Providers');
  console.log('      - Quel provider email pour les templates ?');
  console.log('      - Resend configuré pour Supabase natif ?');
  
  console.log('\n   3. Configuration différente');
  console.log('      - Edge Functions utilisent RESEND_API_KEY');
  console.log('      - Templates Supabase utilisent autre provider ?');
}

/**
 * 5. PROPOSER DES SOLUTIONS
 */
function proposeSolutions() {
  console.log('\n🔧 SOLUTIONS RECOMMANDÉES\n');
  
  console.log('💡 SOLUTION 1: CONFIGURER TEMPLATES SUPABASE');
  console.log('   - Aller Dashboard > Auth > Email Templates');
  console.log('   - Activer Reset Password + Magic Link templates');
  console.log('   - Configurer avec même Resend que Edge Functions');
  
  console.log('\n💡 SOLUTION 2: CRÉER EDGE FUNCTIONS CUSTOM');
  console.log('   - Créer send-password-reset-custom.ts');
  console.log('   - Créer send-magic-link-custom.ts');
  console.log('   - Utiliser même système que send-welcome-ciara');
  console.log('   - Modifier AuthPage.tsx pour appeler ces fonctions');
  
  console.log('\n💡 SOLUTION 3: UNIFIER LE SYSTÈME EMAIL');
  console.log('   - Tout faire passer par Edge Functions + Resend');
  console.log('   - Abandonner templates Supabase natifs');
  console.log('   - Cohérence totale du système email');
  
  console.log('\n🎯 RECOMMANDATION:');
  console.log('   SOLUTION 2 - Edge Functions custom');
  console.log('   - Plus de contrôle');
  console.log('   - Cohérent avec système existant'); 
  console.log('   - Templates React bilingues comme les autres');
}

/**
 * 6. TESTER LA CONFIGURATION ACTUELLE
 */
async function testCurrentConfig() {
  console.log('\n🧪 TEST CONFIGURATION ACTUELLE\n');
  
  const testEmail = 'test-comparison@ciara.city';
  
  console.log('📤 Test Edge Function (qui fonctionne)...');
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-ciara', {
      body: {
        userName: 'Test User',
        email: testEmail,
        loginUrl: 'https://ciara.city/auth'
      }
    });
    
    if (error) {
      console.log('   ❌ Edge Function erreur:', error.message);
    } else {
      console.log('   ✅ Edge Function fonctionne');
      console.log('   📧 Message ID:', data?.messageId || 'N/A');
    }
  } catch (err) {
    console.log('   ❌ Exception Edge Function:', err.message);
  }
  
  console.log('\n📤 Test Supabase natif (qui ne fonctionne pas)...');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://ciara.city/reset-password'
    });
    
    if (error) {
      console.log('   ❌ Supabase natif erreur:', error.message);
    } else {
      console.log('   ✅ Supabase natif semble fonctionner');
      console.log('   ⚠️  Mais email probablement pas envoyé');
    }
  } catch (err) {
    console.log('   ❌ Exception Supabase natif:', err.message);
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 AUDIT COMPARATIF EMAILS - QUI FONCTIONNE VS QUI NE FONCTIONNE PAS\n');
  console.log('='.repeat(80));
  
  analyzeWorkingEmails();
  await analyzeNonWorkingEmails();
  compareEmailMethods();
  diagnoseProblem();
  proposeSolutions();
  await testCurrentConfig();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Audit terminé');
  
  console.log('\n🎯 CONCLUSION PRINCIPALE:');
  console.log('Les emails qui fonctionnent utilisent Edge Functions + Resend');
  console.log('Les emails qui ne fonctionnent pas utilisent templates Supabase natifs');
  console.log('Solution: Créer Edge Functions pour reset password et magic link');
}

main().catch(console.error);