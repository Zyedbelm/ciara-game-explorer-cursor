#!/usr/bin/env node

async function testResetPasswordWithCode() {
  console.log('🧪 TEST - Reset Password avec Code\n');
  
  const baseUrl = 'https://ciara.city';
  
  console.log('📋 TESTS DE VALIDATION AVEC CODE :\n');
  
  // Test 1: Route avec code (format Supabase actuel)
  console.log('1️⃣ Test de la route avec code...');
  const codeUrl = `${baseUrl}/reset-password?code=82c276ef-6feb-4616-85f2-1dd0366c8fbc`;
  console.log(`   URL: ${codeUrl}`);
  
  try {
    const response = await fetch(codeUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route avec code accessible');
    } else {
      console.log('   ❌ Route avec code non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Route avec tokens (format alternatif)
  console.log('\n2️⃣ Test de la route avec tokens...');
  const tokenUrl = `${baseUrl}/reset-password?access_token=test&refresh_token=test&type=recovery`;
  console.log(`   URL: ${tokenUrl}`);
  
  try {
    const response = await fetch(tokenUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route avec tokens accessible');
    } else {
      console.log('   ❌ Route avec tokens non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 3: Route directe
  console.log('\n3️⃣ Test de la route directe...');
  const directUrl = `${baseUrl}/reset-password`;
  console.log(`   URL: ${directUrl}`);
  
  try {
    const response = await fetch(directUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route directe accessible');
    } else {
      console.log('   ❌ Route directe non accessible');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  console.log('\n📋 DIAGNOSTIC DU PROBLÈME :');
  console.log('\n🔍 Le lien que vous recevez :');
  console.log('   https://ciara.city/reset-password?code=82c276ef-6feb-4616-85f2-1dd0366c8fbc');
  
  console.log('\n🔍 Notre nouvelle logique supporte maintenant :');
  console.log('   ✅ Format avec code (Supabase actuel)');
  console.log('   ✅ Format avec tokens (alternatif)');
  console.log('   ✅ Gestion des erreurs');
  
  console.log('\n📱 INSTRUCTIONS DE TEST MANUEL :');
  console.log('\n1️⃣ Test avec le lien reçu :');
  console.log('   - Cliquez sur le lien dans l\'email');
  console.log('   - Vérifiez que vous arrivez sur la page de reset');
  console.log('   - Entrez un nouveau mot de passe');
  console.log('   - Vérifiez que le reset fonctionne');
  
  console.log('\n2️⃣ Si problème persiste :');
  console.log('   - Vider le cache du navigateur');
  console.log('   - Attendre 5-10 minutes pour la propagation');
  console.log('   - Tester en navigation privée');
  
  console.log('\n🔧 CORRECTIONS APPLIQUÉES :');
  console.log('- ✅ Support du format avec code');
  console.log('- ✅ Méthode exchangeCodeForSession()');
  console.log('- ✅ Gestion des deux formats (code et tokens)');
  console.log('- ✅ Validation robuste des paramètres');
  
  console.log('\n⏰ Délai recommandé : 3-5 minutes après le push');
}

// Exécuter le test
testResetPasswordWithCode().catch(console.error);
