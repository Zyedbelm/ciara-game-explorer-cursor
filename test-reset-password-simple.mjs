#!/usr/bin/env node

async function testResetPasswordSimple() {
  console.log('🧪 TEST SIMPLE - Reset Password Refactorisé\n');
  
  const baseUrl = 'https://ciara.city';
  
  console.log('📋 TESTS DE VALIDATION :\n');
  
  // Test 1: Route directe
  console.log('1️⃣ Test de la route directe...');
  const directUrl = `${baseUrl}/reset-password`;
  console.log(`   URL: ${directUrl}`);
  
  try {
    const response = await fetch(directUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route accessible');
    } else {
      console.log('   ❌ Route non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Route avec paramètres
  console.log('\n2️⃣ Test de la route avec paramètres...');
  const paramUrl = `${baseUrl}/reset-password?access_token=test&refresh_token=test&type=recovery`;
  console.log(`   URL: ${paramUrl}`);
  
  try {
    const response = await fetch(paramUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route avec paramètres accessible');
    } else {
      console.log('   ❌ Route avec paramètres non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 3: Site principal
  console.log('\n3️⃣ Test du site principal...');
  try {
    const response = await fetch(baseUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Site principal accessible');
    } else {
      console.log('   ❌ Site principal non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  console.log('\n📋 INSTRUCTIONS DE TEST MANUEL :');
  console.log('\n📱 Test 1 - Demande de reset :');
  console.log('   1. Allez sur https://ciara.city/auth');
  console.log('   2. Cliquez sur "Mot de passe oublié"');
  console.log('   3. Entrez votre email');
  console.log('   4. Vérifiez que l\'email est envoyé');
  
  console.log('\n📱 Test 2 - Reset password :');
  console.log('   1. Cliquez sur le lien dans l\'email');
  console.log('   2. Vérifiez que vous arrivez sur la page de reset');
  console.log('   3. Entrez un nouveau mot de passe');
  console.log('   4. Vérifiez que le reset fonctionne');
  
  console.log('\n🔍 RÉSULTATS ATTENDUS :');
  console.log('- ✅ Route /reset-password accessible');
  console.log('- ✅ Paramètres préservés dans l\'URL');
  console.log('- ✅ Page de réinitialisation fonctionnelle');
  console.log('- ✅ Processus complet opérationnel');
  
  console.log('\n⏰ Délai recommandé : 3-5 minutes après le push');
  console.log('🔄 Si problème persiste : Vider le cache du navigateur');
}

// Exécuter le test
testResetPasswordSimple().catch(console.error);
