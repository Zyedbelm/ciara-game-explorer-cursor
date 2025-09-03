#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TEST DU STATUT DU WEBHOOK
 * 
 * Ce script teste si le webhook auth-webhook est correctement configuré
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

console.log('🧪 TEST DU STATUT DU WEBHOOK AUTH-WEBHOOK');
console.log('==========================================\n');

async function testWebhookStatus() {
  try {
    console.log('🔍 Étape 1: Vérification de la connexion Supabase');
    console.log('------------------------------------------------');
    console.log('📋 URL Supabase:', supabaseUrl);
    console.log('🔑 Service Key:', supabaseServiceKey ? '✅ Configurée' : '❌ Manquante');
    
    // Test de connexion basique
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erreur de connexion Supabase:', healthError);
      return;
    } else {
      console.log('✅ Connexion Supabase réussie');
    }
    
    console.log('\n🔍 Étape 2: Test de la fonction auth-webhook');
    console.log('---------------------------------------------');
    
    // Simuler un événement d'inscription
    const testEvent = {
      type: 'INSERT',
      record: {
        id: 'test-user-' + Date.now(),
        email: 'test-webhook@example.com',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Webhook'
        }
      }
    };
    
    console.log('📧 Test d\'événement d\'inscription simulé');
    console.log('📋 Données de test:', JSON.stringify(testEvent, null, 2));
    
    // Appeler la fonction auth-webhook
    const { data: webhookData, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
      body: testEvent
    });
    
    if (webhookError) {
      console.error('❌ Erreur auth-webhook:', webhookError);
      
      if (webhookError.message.includes('Function not found')) {
        console.log('\n🔧 SOLUTION : Redéployer auth-webhook');
        console.log('   cd supabase && supabase functions deploy auth-webhook');
      } else if (webhookError.message.includes('Invalid API key')) {
        console.log('\n🔧 SOLUTION : Vérifier RESEND_API_KEY dans Supabase Dashboard');
      }
    } else {
      console.log('✅ auth-webhook fonctionne !');
      console.log('📧 Réponse:', webhookData);
    }
    
    console.log('\n🔍 Étape 3: Test de la fonction send-email-confirmation');
    console.log('--------------------------------------------------------');
    
    const testEmailData = {
      email: 'test-email@example.com',
      confirmationUrl: 'https://ciara.city/auth/callback?test=true',
      name: 'Test User'
    };
    
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
      body: testEmailData
    });
    
    if (emailError) {
      console.error('❌ Erreur send-email-confirmation:', emailError);
      
      if (emailError.message.includes('Invalid API key')) {
        console.log('\n🔧 SOLUTION : Vérifier RESEND_API_KEY dans Supabase Dashboard');
        console.log('   → Settings → Edge Functions → Environment Variables');
      }
    } else {
      console.log('✅ send-email-confirmation fonctionne !');
      console.log('📧 Message ID:', emailData?.messageId);
    }
    
    console.log('\n🔍 Étape 4: Vérification des variables d\'environnement');
    console.log('-------------------------------------------------------');
    
    console.log('📋 Variables d\'environnement nécessaires:');
    console.log('   - SUPABASE_URL:', supabaseUrl);
    console.log('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurée' : '❌ Manquante');
    console.log('   - RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurée localement' : '❌ Manquante localement');
    
    if (!process.env.RESEND_API_KEY) {
      console.log('\n⚠️  ATTENTION: RESEND_API_KEY non configurée localement');
      console.log('   Cette variable doit être configurée dans Supabase Dashboard');
      console.log('   → Settings → Edge Functions → Environment Variables');
    }
    
    console.log('\n🎯 RÉSUMÉ DU DIAGNOSTIC');
    console.log('==========================');
    
    if (webhookError || emailError) {
      console.log('❌ PROBLÈMES DÉTECTÉS:');
      if (webhookError) console.log('   - auth-webhook:', webhookError.message);
      if (emailError) console.log('   - send-email-confirmation:', emailError.message);
      
      console.log('\n🔧 SOLUTIONS RECOMMANDÉES:');
      console.log('   1. Vérifiez RESEND_API_KEY dans Supabase Dashboard');
      console.log('   2. Redéployez auth-webhook si nécessaire');
      console.log('   3. Vérifiez les logs dans Supabase Dashboard');
    } else {
      console.log('✅ TOUTES LES FONCTIONS FONCTIONNENT !');
      console.log('   Le problème vient peut-être du frontend ou de la configuration');
    }
    
    console.log('\n🔍 PROCHAINES ÉTAPES:');
    console.log('   1. Vérifiez les logs du webhook dans Supabase Dashboard');
    console.log('   2. Testez l\'inscription d\'un vrai compte');
    console.log('   3. Surveillez les logs en temps réel');
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error);
    console.log('\n🔧 VÉRIFICATIONS IMMÉDIATES:');
    console.log('   1. Vérifiez votre connexion internet');
    console.log('   2. Vérifiez que Supabase est accessible');
    console.log('   3. Vérifiez vos clés API');
  }
}

// Exécuter le test
testWebhookStatus();

