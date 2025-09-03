import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🧪 Test du Webhook Corrigé - Vérification de la Solution...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testWebhookFixed() {
  try {
    console.log('\n📊 1. Test de la fonction Edge auth-webhook corrigée...')
    
    // Test 1: Données minimales
    console.log('\n🧪 Test 1: Données minimales (INSERT)')
    try {
      const { data: test1, error: error1 } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'INSERT',
          record: { 
            id: 'test-fixed-' + Date.now(), 
            email: 'test-fixed@example.com',
            user_metadata: {
              first_name: 'Test',
              last_name: 'Fixed'
            }
          }
        }
      })
      
      if (error1) {
        console.log('❌ Test 1 échoué:')
        console.log('   Status:', error1.status)
        console.log('   Message:', error1.message)
        console.log('   Details:', error1.details)
      } else {
        console.log('✅ Test 1 réussi:', test1)
      }
    } catch (test1Error) {
      console.log('❌ Test 1 erreur:', test1Error.message)
    }
    
    // Test 2: Test de la fonction send-email-confirmation directement
    console.log('\n🧪 Test 2: Fonction send-email-confirmation directe')
    try {
      const { data: test2, error: error2 } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email: 'test-fixed@example.com',
          confirmationUrl: 'https://ciara.city/auth/confirm?test=fixed',
          name: 'Test Fixed'
        }
      })
      
      if (error2) {
        console.log('❌ Test 2 échoué:')
        console.log('   Status:', error2.status)
        console.log('   Message:', error2.message)
        console.log('   Details:', error2.details)
      } else {
        console.log('✅ Test 2 réussi:', test2)
      }
    } catch (test2Error) {
      console.log('❌ Test 2 erreur:', test2Error.message)
    }
    
    console.log('\n📋 3. Analyse des résultats...')
    
    console.log('🔍 Si Test 1 réussit maintenant:')
    console.log('   ✅ Le problème des variables d\'environnement est résolu')
    console.log('   ✅ Le webhook peut créer des profils et envoyer des emails')
    console.log('   ✅ Votre application devrait fonctionner parfaitement')
    
    console.log('\n🔍 Si Test 1 échoue toujours:')
    console.log('   ❌ Il y a un autre problème à identifier')
    console.log('   ❌ Vérifier les logs de la fonction auth-webhook')
    
    console.log('\n🎯 4. Actions recommandées...')
    
    console.log('\n🟢 Si le test réussit:')
    console.log('   1. Tester la création d\'un vrai compte sur ciara.city')
    console.log('   2. Vérifier que l\'email de confirmation arrive automatiquement')
    console.log('   3. Vérifier que le profil est créé dans la table profiles')
    
    console.log('\n🔴 Si le test échoue:')
    console.log('   1. Vérifier les logs de la fonction auth-webhook')
    console.log('   2. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   3. Partager l\'erreur exacte des logs')
    
    console.log('\n💡 5. Prochaines étapes...')
    console.log('   1. Analyser les résultats des tests ci-dessus')
    console.log('   2. Si tout fonctionne, tester avec un vrai compte')
    console.log('   3. Si des problèmes persistent, consulter les logs')
    
    console.log('\n🎉 6. Résumé de la solution appliquée...')
    console.log('   ✅ Variables d\'environnement configurées (SERVICE_ROLE_KEY, PROJECT_URL)')
    console.log('   ✅ Code de auth-webhook modifié pour utiliser les nouvelles variables')
    console.log('   ✅ Fonction auth-webhook redéployée')
    console.log('   ✅ Webhook trigger créé sur auth.users')
    console.log('   ✅ RESEND_API_KEY déjà configurée')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le test
testWebhookFixed()
