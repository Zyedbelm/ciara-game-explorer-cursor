#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateTestResetLink() {
  console.log('🔗 Génération d\'un lien de test de reset password...\n');
  
  // Email de test (remplacez par votre email)
  const testEmail = 'test@example.com';
  
  console.log(`📧 Envoi d'un email de reset à: ${testEmail}`);
  console.log('🔄 URL de redirection: http://localhost:8080/reset-password\n');
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:8080/reset-password'
    });
    
    if (error) {
      console.log('❌ Erreur Supabase:', error.message);
      return;
    }
    
    console.log('✅ Email de reset envoyé avec succès !');
    console.log('📨 Vérifiez votre boîte de réception pour le lien de test.');
    console.log('\n📋 Instructions de test:');
    console.log('1. Ouvrez l\'email reçu');
    console.log('2. Cliquez sur le lien de reset password');
    console.log('3. Vérifiez que vous arrivez sur http://localhost:8080/reset-password');
    console.log('4. Vérifiez que les paramètres sont préservés');
    console.log('5. Testez la réinitialisation du mot de passe');
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('- Ne modifiez PAS l\'URL de redirection dans le lien');
    console.log('- Utilisez le lien tel qu\'il est généré par Supabase');
    console.log('- Cela évite les erreurs PKCE "bad_code_verifier"');
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
}

// Exécuter le script
generateTestResetLink().catch(console.error);
