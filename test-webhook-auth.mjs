#!/usr/bin/env node
/**
 * 🧪 TEST WEBHOOK AUTHENTIFICATION CIARA
 * Ce script teste le webhook d'authentification et vérifie les points de bienvenue
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
 * Test direct du webhook
 */
async function testWebhookDirect() {
  console.log('🧪 Test direct du webhook auth-webhook...\n');
  
  const testPayload = {
    type: 'UPDATE',
    record: {
      id: 'test-user-123',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    },
    old_record: {
      id: 'test-user-123',
      email: 'test@example.com',
      email_confirmed_at: null
    }
  };
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Webhook répond correctement');
      console.log('📄 Réponse:', result);
    } else {
      console.log('❌ Webhook ne répond pas correctement');
      console.log('📄 Erreur:', result);
      console.log('🔍 Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test webhook:', error.message);
  }
}

/**
 * Vérifier les utilisateurs sans points de bienvenue
 */
async function checkUsersWithoutWelcomePoints() {
  console.log('\n🔍 Vérification des utilisateurs sans points de bienvenue...\n');
  
  try {
    // Chercher les utilisateurs confirmés avec 0 points
    const { data: usersWithoutPoints, error } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name, total_points, created_at')
      .eq('total_points', 0)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur lors de la requête:', error.message);
      return;
    }
    
    if (usersWithoutPoints && usersWithoutPoints.length > 0) {
      console.log(`⚠️  Trouvé ${usersWithoutPoints.length} utilisateur(s) avec 0 points:`);
      console.table(usersWithoutPoints);
      
      // Vérifier si ces utilisateurs ont confirmé leur email
      for (const user of usersWithoutPoints) {
        const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
        if (authUser?.user?.email_confirmed_at) {
          console.log(`🚨 ${user.email} a confirmé son email mais n'a pas reçu ses 10 points !`);
        }
      }
    } else {
      console.log('✅ Aucun utilisateur trouvé avec 0 points');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

/**
 * Corriger manuellement les points pour un utilisateur
 */
async function fixWelcomePointsForUser(email) {
  console.log(`\n🔧 Correction manuelle des points pour ${email}...\n`);
  
  try {
    // Vérifier que l'utilisateur existe et a confirmé son email
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!profile) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
    
    if (!authUser?.user?.email_confirmed_at) {
      console.log('⚠️  Utilisateur n\'a pas encore confirmé son email');
      return;
    }
    
    if (profile.total_points >= 10) {
      console.log('✅ Utilisateur a déjà ses points de bienvenue');
      return;
    }
    
    // Attribuer 10 points
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        total_points: 10,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError.message);
      return;
    }
    
    console.log('✅ 10 points de bienvenue attribués avec succès');
    
    // Envoyer l'email de bienvenue
    console.log('📧 Envoi de l\'email de bienvenue...');
    
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-welcome-ciara', {
      body: {
        userName: profile.first_name || profile.last_name || email.split('@')[0],
        email: email,
        loginUrl: 'https://ciara.city/auth'
      }
    });
    
    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError.message);
    } else {
      console.log('✅ Email de bienvenue envoyé');
      console.log('📧 Message ID:', emailData?.messageId);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Script principal
async function main() {
  console.log('🚀 DÉMARRAGE TEST WEBHOOK AUTHENTIFICATION CIARA\n');
  console.log('='.repeat(50));
  
  // Test 1: Webhook direct
  await testWebhookDirect();
  
  // Test 2: Vérifier les utilisateurs sans points
  await checkUsersWithoutWelcomePoints();
  
  // Test 3: Correction manuelle si nécessaire
  const emailToFix = process.argv[2];
  if (emailToFix) {
    await fixWelcomePointsForUser(emailToFix);
  } else {
    console.log('\n💡 Pour corriger manuellement un utilisateur:');
    console.log('   node test-webhook-auth.mjs email@example.com');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests terminés');
}

main().catch(console.error);