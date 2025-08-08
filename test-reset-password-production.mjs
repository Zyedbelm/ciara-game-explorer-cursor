#!/usr/bin/env node

async function testResetPasswordProduction() {
  console.log('🧪 Test de la solution reset password en production...\n');
  
  const baseUrl = 'https://ciara.city';
  
  // Test 1: Route directe (devrait rediriger)
  console.log('1️⃣ Test de la route directe /reset-password...');
  try {
    const response = await fetch(`${baseUrl}/reset-password`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route accessible directement');
    } else if (response.status === 404) {
      console.log('   ⚠️  404 - Le script de redirection devrait gérer cela');
    } else {
      console.log('   ❌ Statut inattendu');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Route avec paramètres (devrait rediriger)
  console.log('\n2️⃣ Test de la route avec paramètres...');
  try {
    const response = await fetch(`${baseUrl}/reset-password?code=test123&type=recovery`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Route accessible avec paramètres');
    } else if (response.status === 404) {
      console.log('   ⚠️  404 - Le script de redirection devrait gérer cela');
    } else {
      console.log('   ❌ Statut inattendu');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 3: Format SPA (devrait fonctionner)
  console.log('\n3️⃣ Test du format SPA /?/reset-password...');
  try {
    const response = await fetch(`${baseUrl}/?/reset-password?code=test123&type=recovery`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ Format SPA fonctionne');
    } else {
      console.log('   ❌ Format SPA ne fonctionne pas');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 4: Simulation du flux Supabase
  console.log('\n4️⃣ Test de simulation du flux Supabase...');
  const testUrl = `${baseUrl}/reset-password?code=pkce_test123&type=recovery&token=test456`;
  console.log(`   URL de test: ${testUrl}`);
  console.log('   Ouvrez cette URL dans votre navigateur pour tester');
  
  console.log('\n📋 Instructions de test manuel:');
  console.log('1. Ouvrez votre navigateur');
  console.log('2. Allez sur:', `${baseUrl}/reset-password`);
  console.log('3. Vérifiez que vous êtes redirigé vers:', `${baseUrl}/?/reset-password`);
  console.log('4. Testez avec des paramètres:', `${baseUrl}/reset-password?code=test123&type=recovery`);
  console.log('5. Vérifiez que les paramètres sont préservés');
  
  console.log('\n🔍 Résultats attendus:');
  console.log('- ✅ Redirection automatique vers le format SPA');
  console.log('- ✅ Paramètres préservés dans l\'URL');
  console.log('- ✅ Page de réinitialisation accessible');
  console.log('- ✅ Pas d\'erreur 404');
  
  console.log('\n⚠️  Si les tests échouent:');
  console.log('- Vérifiez que les corrections ont été déployées');
  console.log('- Attendez la fin de la build GitHub Actions');
  console.log('- Videz le cache du navigateur');
  console.log('- Testez en navigation privée');
}

// Exécuter le test
testResetPasswordProduction().catch(console.error);
