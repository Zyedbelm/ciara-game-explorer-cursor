#!/usr/bin/env node

async function testResetPasswordFinal() {
  console.log('🎯 TEST FINAL - Reset Password Solution\n');
  
  const baseUrl = 'https://ciara.city';
  const testCode = 'cfba5c68-315c-410f-adf4-8b7b58a59af3';
  
  console.log('📋 TESTS DE VALIDATION :\n');
  
  // Test 1: Route directe (devrait maintenant fonctionner)
  console.log('1️⃣ Test de la route directe...');
  const directUrl = `${baseUrl}/reset-password?code=${testCode}`;
  console.log(`   URL: ${directUrl}`);
  
  try {
    const response = await fetch(directUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route directe accessible !');
    } else if (response.status === 404) {
      console.log('   ❌ 404 - Solution pas encore active');
    } else {
      console.log('   ⚠️  Statut inattendu');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Format SPA (devrait fonctionner)
  console.log('\n2️⃣ Test du format SPA...');
  const spaUrl = `${baseUrl}/?/reset-password?code=${testCode}`;
  console.log(`   URL: ${spaUrl}`);
  
  try {
    const response = await fetch(spaUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Format SPA fonctionne');
    } else {
      console.log('   ❌ Format SPA ne fonctionne pas');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 3: Simulation du flux complet
  console.log('\n3️⃣ Test de simulation du flux complet...');
  console.log('   Simulant le flux Supabase → ciara.city');
  
  const supabaseUrl = `https://pohqkspsdvvbqrgzfayl.supabase.co/auth/v1/verify?token=pkce_test&type=recovery&redirect_to=${encodeURIComponent(`${baseUrl}/reset-password`)}&apikey=test`;
  console.log(`   URL Supabase simulée: ${supabaseUrl}`);
  console.log(`   URL finale attendue: ${directUrl}`);
  
  console.log('\n📋 INSTRUCTIONS DE TEST MANUEL :');
  console.log('\n📱 Test 1 - Route directe :');
  console.log(`   Ouvrez : ${directUrl}`);
  console.log('   Résultat attendu : Page de réinitialisation s\'affiche');
  
  console.log('\n📱 Test 2 - Format SPA :');
  console.log(`   Ouvrez : ${spaUrl}`);
  console.log('   Résultat attendu : Redirection vers route directe');
  
  console.log('\n📱 Test 3 - Flux complet :');
  console.log('   1. Demandez un reset password');
  console.log('   2. Cliquez sur le lien dans l\'email');
  console.log('   3. Vérifiez que vous arrivez sur la page de réinitialisation');
  
  console.log('\n🔍 DIAGNOSTIC :');
  console.log('- Si la route directe fonctionne : Solution complète ✅');
  console.log('- Si seul le format SPA fonctionne : Solution partielle ⚠️');
  console.log('- Si aucun ne fonctionne : Problème de déploiement ❌');
  
  console.log('\n⏰ Délai recommandé : 3-5 minutes après le push');
  console.log('🔄 Si problème persiste : Vider le cache du navigateur');
}

// Exécuter le test
testResetPasswordFinal().catch(console.error);
