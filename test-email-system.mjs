#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TEST DU SYSTÈME EMAIL COMPLET
 * 
 * Ce script teste toutes les fonctions d'email pour identifier les problèmes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non configurée dans .env');
  console.log('💡 Ajoutez SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 TEST DU SYSTÈME EMAIL COMPLET CIARA');
console.log('=====================================\n');

async function testEmailSystem() {
  try {
    console.log('🔍 Étape 1: Test de la fonction send-email-confirmation');
    console.log('-----------------------------------------------------');
    
    const testEmailData = {
      email: 'test@example.com',
      confirmationUrl: 'https://ciara.city/auth/callback?test=true',
      name: 'Test User'
    };
    
    console.log('📧 Données de test:', testEmailData);
    
    const { data: confirmationData, error: confirmationError } = await supabase.functions.invoke('send-email-confirmation', {
      body: testEmailData
    });
    
    if (confirmationError) {
      console.error('❌ Erreur send-email-confirmation:', confirmationError);
    } else {
      console.log('✅ send-email-confirmation fonctionne !');
      console.log('📧 Message ID:', confirmationData?.messageId);
    }
    
    console.log('\n🔍 Étape 2: Test de la fonction send-welcome-ciara');
    console.log('-----------------------------------------------');
    
    const testWelcomeData = {
      userName: 'Test User',
      email: 'test@example.com',
      loginUrl: 'https://ciara.city/auth'
    };
    
    console.log('📧 Données de test:', testWelcomeData);
    
    const { data: welcomeData, error: welcomeError } = await supabase.functions.invoke('send-welcome-ciara', {
      body: testWelcomeData
    });
    
    if (welcomeError) {
      console.error('❌ Erreur send-welcome-ciara:', welcomeError);
    } else {
      console.log('✅ send-welcome-ciara fonctionne !');
      console.log('📧 Message ID:', welcomeData?.messageId);
    }
    
    console.log('\n🔍 Étape 3: Test de création de profil (simulation webhook)');
    console.log('--------------------------------------------------------');
    
    // Simuler la création d'un profil
    const testProfile = {
      user_id: 'test-user-' + Date.now(),
      email: 'test-profile@example.com',
      role: 'visitor',
      first_name: 'Test',
      last_name: 'Profile',
      total_points: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('👤 Création du profil de test:', testProfile.email);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert(testProfile);
    
    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
    } else {
      console.log('✅ Profil de test créé avec succès');
      
      // Nettoyer le profil de test
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', testProfile.user_id);
      
      console.log('🧹 Profil de test supprimé');
    }
    
    console.log('\n🔍 Étape 4: Vérification des variables d\'environnement');
    console.log('---------------------------------------------------');
    
    // Vérifier que les fonctions peuvent accéder aux variables d'environnement
    console.log('📋 Variables d\'environnement disponibles:');
    console.log('   - SUPABASE_URL:', supabaseUrl);
    console.log('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurée' : '❌ Manquante');
    console.log('   - RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante');
    
    if (!process.env.RESEND_API_KEY) {
      console.log('\n⚠️  ATTENTION: RESEND_API_KEY non configurée localement');
      console.log('   Cette variable doit être configurée dans Supabase Dashboard');
      console.log('   → Settings → Edge Functions → Environment Variables');
    }
    
    console.log('\n🎯 RÉSUMÉ DU TEST');
    console.log('==================');
    
    if (confirmationError || welcomeError) {
      console.log('❌ PROBLÈMES DÉTECTÉS:');
      if (confirmationError) console.log('   - send-email-confirmation:', confirmationError.message);
      if (welcomeError) console.log('   - send-welcome-ciara:', welcomeError.message);
      
      console.log('\n🔧 SOLUTIONS RECOMMANDÉES:');
      console.log('   1. Vérifiez RESEND_API_KEY dans Supabase Dashboard');
      console.log('   2. Redéployez les fonctions Edge Functions');
      console.log('   3. Vérifiez les logs dans Supabase Dashboard');
    } else {
      console.log('✅ TOUTES LES FONCTIONS FONCTIONNENT !');
      console.log('   Le système d\'email est opérationnel');
    }
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    console.log('\n🔧 VÉRIFICATIONS IMMÉDIATES:');
    console.log('   1. Vérifiez votre connexion internet');
    console.log('   2. Vérifiez que Supabase est accessible');
    console.log('   3. Vérifiez vos clés API');
  }
}

// Exécuter le test
testEmailSystem();

