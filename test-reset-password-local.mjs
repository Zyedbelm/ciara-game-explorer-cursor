#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testResetPassword() {
  console.log('🧪 Test du flux de reset password en local...\n');
  
  // Test 1: Vérifier que la route fonctionne en local
  console.log('1️⃣ Test de la route /reset-password en local...');
  try {
    const response = await fetch('http://localhost:8080/reset-password');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('   ✅ Route accessible en local');
    } else {
      console.log('   ❌ Route non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Vérifier que la page s'affiche avec des paramètres
  console.log('\n2️⃣ Test de la route avec paramètres...');
  try {
    const response = await fetch('http://localhost:8080/reset-password?code=test123&type=recovery');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('   ✅ Route accessible avec paramètres');
    } else {
      console.log('   ❌ Route non accessible avec paramètres');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 3: Simuler un lien de reset password
  console.log('\n3️⃣ Test de simulation de lien reset password...');
  const testUrl = 'http://localhost:8080/reset-password?code=test123&type=recovery&token=test456';
  console.log(`   URL de test: ${testUrl}`);
  console.log('   Ouvrez cette URL dans votre navigateur pour tester');
  
  // Test 4: Vérifier la configuration Supabase
  console.log('\n4️⃣ Vérification de la configuration Supabase...');
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
      redirectTo: 'http://localhost:8080/reset-password'
    });
    
    if (error) {
      console.log('   ❌ Erreur Supabase:', error.message);
    } else {
      console.log('   ✅ Email de reset envoyé (vérifiez votre boîte de réception)');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion Supabase:', error.message);
  }
  
  console.log('\n📋 Instructions de test:');
  console.log('1. Ouvrez http://localhost:8080/reset-password dans votre navigateur');
  console.log('2. Vérifiez que la page s\'affiche correctement');
  console.log('3. Testez avec des paramètres: http://localhost:8080/reset-password?code=test123');
  console.log('4. Vérifiez que les paramètres sont préservés');
  
  console.log('\n🔍 Problème PKCE identifié:');
  console.log('- L\'erreur "bad_code_verifier" indique un problème avec le flux PKCE');
  console.log('- Ne modifiez pas manuellement les URLs de redirection Supabase');
  console.log('- Utilisez toujours des liens générés correctement par Supabase');
}

// Exécuter le test
testResetPassword().catch(console.error);
