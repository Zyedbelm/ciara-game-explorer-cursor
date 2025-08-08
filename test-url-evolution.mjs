#!/usr/bin/env node

async function testUrlEvolution() {
  console.log('🔗 TEST - Évolution des URLs Reset Password\n');
  
  // URLs fournies par l'utilisateur
  const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co/auth/v1/verify?token=pkce_84e1477ac1855511c6afb52a05f0c778f31f784b442a4ecac0f96195&type=recovery&redirect_to=https%3A%2F%2Fciara.city%2Freset-password&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';
  
  const finalUrl = 'https://ciara.city/reset-password?code=cfba5c68-315c-410f-adf4-8b7b58a59af3';
  
  console.log('📋 ANALYSE DES URLs :\n');
  
  // Analyser l'URL Supabase
  console.log('1️⃣ URL Supabase :');
  console.log(`   ${supabaseUrl}`);
  
  const supabaseParams = new URL(supabaseUrl).searchParams;
  console.log('\n   Paramètres extraits :');
  console.log(`   - Token PKCE: ${supabaseParams.get('token')}`);
  console.log(`   - Type: ${supabaseParams.get('type')}`);
  console.log(`   - Redirect_to: ${decodeURIComponent(supabaseParams.get('redirect_to'))}`);
  
  // Analyser l'URL finale
  console.log('\n2️⃣ URL Finale :');
  console.log(`   ${finalUrl}`);
  
  const finalParams = new URL(finalUrl).searchParams;
  console.log('\n   Paramètres extraits :');
  console.log(`   - Code: ${finalParams.get('code')}`);
  
  // Vérifier le lien
  console.log('\n🔗 LIEN ENTRE LES URLs :');
  console.log('✅ Le token PKCE est vérifié par Supabase');
  console.log('✅ Supabase génère un code de récupération unique');
  console.log('✅ Supabase redirige vers ciara.city avec le code');
  console.log('✅ Le code est utilisé pour réinitialiser le mot de passe');
  
  // Test de la solution
  console.log('\n🧪 TEST DE LA SOLUTION :');
  
  // Test 1: URL finale directe
  console.log('\n1️⃣ Test de l\'URL finale directe...');
  try {
    const response = await fetch(finalUrl);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 200) {
      console.log('   ✅ URL finale accessible !');
    } else if (response.status === 404) {
      console.log('   ❌ 404 - Notre solution n\'est pas encore active');
    } else {
      console.log('   ⚠️  Statut inattendu');
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Format SPA
  const spaUrl = 'https://ciara.city/?/reset-password?code=cfba5c68-315c-410f-adf4-8b7b58a59af3';
  console.log('\n2️⃣ Test du format SPA...');
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
  
  console.log('\n📋 INSTRUCTIONS DE TEST :');
  console.log('\n1. Ouvrez cette URL dans votre navigateur :');
  console.log(`   ${finalUrl}`);
  console.log('\n2. Vérifiez que vous êtes redirigé vers :');
  console.log(`   ${spaUrl}`);
  console.log('\n3. Vérifiez que la page de réinitialisation s\'affiche');
  
  console.log('\n🔍 DIAGNOSTIC :');
  console.log('- Si l\'URL finale fonctionne : Solution déployée ✅');
  console.log('- Si l\'URL finale donne 404 : Solution pas encore active ⚠️');
  console.log('- Si le format SPA fonctionne : Fallback disponible ✅');
}

// Exécuter le test
testUrlEvolution().catch(console.error);
