#!/usr/bin/env node
/**
 * 🔧 CORRECTION DIRECTE WEBHOOK AUTHENTICATION
 * Script pour nettoyer et diagnostiquer le système d'authentification
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ ERREUR: SUPABASE_SERVICE_ROLE_KEY manquante dans .env');
  console.log('💡 Récupère ta clé depuis: Dashboard Supabase > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

/**
 * Nettoyer l'ancien trigger SQL défaillant
 */
async function cleanupOldTrigger() {
  console.log('🧹 Nettoyage de l\'ancien trigger SQL...\n');
  
  const cleanupQueries = [
    'DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;',
    'DROP FUNCTION IF EXISTS public.handle_auth_user_webhook();'
  ];
  
  for (const query of cleanupQueries) {
    try {
      const { error } = await supabase.rpc('sql_query', { query });
      
      if (error) {
        // Essayer avec une autre méthode
        const { error: directError } = await supabase
          .from('pg_stat_activity')
          .select('*')
          .limit(1);
        
        if (!directError) {
          console.log(`⚠️  Impossible d'exécuter: ${query}`);
          console.log('   Reason:', error.message);
        }
      } else {
        console.log(`✅ Exécuté: ${query}`);
      }
    } catch (err) {
      console.log(`⚠️  Query failed: ${query} - ${err.message}`);
    }
  }
}

/**
 * Tester la connexion et les permissions
 */
async function testConnection() {
  console.log('🔗 Test de connexion Supabase...\n');
  
  try {
    // Test basique - lire les profils
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, email, total_points')
      .limit(3);
    
    if (error) {
      console.error('❌ Erreur connexion:', error.message);
      return false;
    }
    
    console.log(`✅ Connexion OK - Trouvé ${profiles.length} profils`);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
    return false;
  }
}

/**
 * Diagnostiquer les utilisateurs sans points de bienvenue
 */
async function diagnoseWelcomePoints() {
  console.log('🔍 Diagnostic des points de bienvenue...\n');
  
  try {
    // Chercher les utilisateurs avec 0 points
    const { data: usersWithoutPoints, error } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name, total_points, created_at')
      .eq('total_points', 0)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur requête:', error.message);
      return;
    }
    
    console.log(`📊 Utilisateurs avec 0 points: ${usersWithoutPoints.length}`);
    
    if (usersWithoutPoints.length > 0) {
      console.table(usersWithoutPoints.map(u => ({
        email: u.email,
        nom: `${u.first_name} ${u.last_name}`.trim(),
        points: u.total_points,
        inscription: new Date(u.created_at).toLocaleDateString()
      })));
      
      // Vérifier si ces utilisateurs ont confirmé leur email
      let confirmedWithoutPoints = 0;
      
      for (const user of usersWithoutPoints.slice(0, 5)) { // Limite à 5 pour éviter rate limiting
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
          
          if (authUser?.user?.email_confirmed_at) {
            confirmedWithoutPoints++;
            console.log(`🚨 ${user.email} - Email confirmé mais 0 points !`);
          }
        } catch (err) {
          console.log(`⚠️  Impossible de vérifier ${user.email}`);
        }
      }
      
      if (confirmedWithoutPoints > 0) {
        console.log(`\n💡 Solution: ${confirmedWithoutPoints} utilisateur(s) doivent recevoir leurs 10 points`);
      }
    } else {
      console.log('✅ Tous les utilisateurs ont leurs points de bienvenue');
    }
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error.message);
  }
}

/**
 * Tester le webhook directement
 */
async function testWebhookFunction() {
  console.log('🧪 Test de la fonction webhook...\n');
  
  const testPayload = {
    type: 'UPDATE',
    record: {
      id: 'test-user-webhook-' + Date.now(),
      email: 'test-webhook@ciara.city',
      email_confirmed_at: new Date().toISOString(),
      user_metadata: {
        first_name: 'Test',
        last_name: 'Webhook'
      }
    },
    old_record: {
      id: 'test-user-webhook-' + Date.now(),
      email: 'test-webhook@ciara.city',
      email_confirmed_at: null
    }
  };
  
  try {
    console.log('📤 Envoi de la requête test...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    
    console.log(`📥 Réponse (${response.status}):`);
    console.log(responseText);
    
    if (response.ok) {
      console.log('✅ Webhook fonctionne correctement');
    } else {
      console.log('❌ Webhook ne répond pas correctement');
    }
    
  } catch (error) {
    console.error('❌ Erreur test webhook:', error.message);
  }
}

/**
 * Corriger un utilisateur spécifique
 */
async function fixUserPoints(email) {
  console.log(`\n🔧 Correction des points pour ${email}...\n`);
  
  try {
    // Trouver l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (profileError || !profile) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`👤 Utilisateur trouvé: ${profile.first_name} ${profile.last_name}`);
    console.log(`📊 Points actuels: ${profile.total_points}`);
    
    // Vérifier l'état de confirmation email
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
    
    if (!authUser?.user?.email_confirmed_at) {
      console.log('⚠️  Email non confirmé - pas d\'attribution de points');
      return;
    }
    
    console.log('✅ Email confirmé');
    
    if (profile.total_points >= 10) {
      console.log('✅ Utilisateur a déjà ses points de bienvenue');
      return;
    }
    
    // Attribuer 10 points
    console.log('🎁 Attribution des 10 points de bienvenue...');
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        total_points: 10,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);
    
    if (updateError) {
      console.error('❌ Erreur attribution points:', updateError.message);
      return;
    }
    
    console.log('✅ 10 points attribués avec succès');
    
    // Envoyer l'email de bienvenue
    console.log('📧 Envoi du mail de bienvenue...');
    
    try {
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
        if (emailData?.messageId) {
          console.log('📧 Message ID:', emailData.messageId);
        }
      }
    } catch (emailErr) {
      console.error('❌ Erreur email:', emailErr.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur correction:', error.message);
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 CORRECTION WEBHOOK AUTHENTIFICATION CIARA\n');
  console.log('='.repeat(60));
  
  // Test de connexion
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Impossible de continuer sans connexion Supabase');
    return;
  }
  
  console.log();
  
  // Nettoyage (sera sûrement limité par les permissions)
  await cleanupOldTrigger();
  
  console.log();
  
  // Test du webhook
  await testWebhookFunction();
  
  console.log();
  
  // Diagnostic
  await diagnoseWelcomePoints();
  
  // Correction manuelle si email fourni
  const emailToFix = process.argv[2];
  if (emailToFix && emailToFix.includes('@')) {
    await fixUserPoints(emailToFix);
  } else if (emailToFix) {
    console.log('\n❌ Email invalide fourni:', emailToFix);
  } else {
    console.log('\n💡 Pour corriger un utilisateur spécifique:');
    console.log('   node fix-webhook-direct.mjs email@example.com');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Script terminé');
  console.log('\n📋 PROCHAINES ÉTAPES:');
  console.log('1. Configurer le webhook dans Dashboard Supabase > Authentication > Webhooks');
  console.log('2. URL: https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook');
  console.log('3. Events: user.created, user.updated');
}

main().catch(console.error);