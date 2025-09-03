import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🧪 Test du Webhook avec Données Simplifiées...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testWebhookSimple() {
  try {
    console.log('\n📊 1. Test de la fonction Edge auth-webhook...')
    
    // Test 1: Données minimales
    console.log('\n🧪 Test 1: Données minimales')
    try {
      const { data: test1, error: error1 } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'INSERT',
          record: { 
            id: 'test-minimal-' + Date.now(), 
            email: 'test-minimal@example.com' 
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
    
    // Test 2: Données complètes (simulation d'un vrai utilisateur)
    console.log('\n🧪 Test 2: Données complètes (simulation utilisateur)')
    try {
      const { data: test2, error: error2 } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'INSERT',
          record: { 
            id: 'test-complete-' + Date.now(), 
            email: 'test-complete@example.com',
            email_confirmed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated'
          }
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
    
    // Test 3: Test de la fonction send-email-confirmation directement
    console.log('\n🧪 Test 3: Fonction send-email-confirmation directe')
    try {
      const { data: test3, error: error3 } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email: 'test-direct@example.com',
          confirmationUrl: 'https://ciara.city/auth/confirm?test=direct',
          name: 'Test Direct'
        }
      })
      
      if (error3) {
        console.log('❌ Test 3 échoué:')
        console.log('   Status:', error3.status)
        console.log('   Message:', error3.message)
        console.log('   Details:', error3.details)
      } else {
        console.log('✅ Test 3 réussi:', test3)
      }
    } catch (test3Error) {
      console.log('❌ Test 3 erreur:', test3Error.message)
    }
    
    console.log('\n📋 4. Analyse des résultats...')
    
    console.log('🔍 Si Test 1 et 2 échouent mais Test 3 réussit:')
    console.log('   • Le problème est dans la logique du webhook auth-webhook')
    console.log('   • Vérifier les variables d\'environnement dans la fonction')
    console.log('   • Vérifier les permissions de la fonction')
    
    console.log('\n🔍 Si tous les tests échouent:')
    console.log('   • Problème général avec les fonctions Edge')
    console.log('   • Vérifier la configuration globale du projet')
    
    console.log('\n🔍 Si Test 3 échoue:')
    console.log('   • Problème avec la fonction send-email-confirmation')
    console.log('   • Vérifier la configuration de Resend')
    
    console.log('\n🎯 5. Actions recommandées...')
    
    console.log('\n🔴 Action immédiate:')
    console.log('   1. Vérifier les logs de la fonction auth-webhook')
    console.log('   2. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   3. Créer un compte pour déclencher l\'erreur')
    console.log('   4. Partager l\'erreur exacte des logs')
    
    console.log('\n🟡 Action alternative:')
    console.log('   1. Vérifier les variables d\'environnement de la fonction')
    console.log('   2. Vérifier que RESEND_API_KEY est correcte')
    console.log('   3. Vérifier que SUPABASE_SERVICE_ROLE_KEY est configurée')
    
    console.log('\n💡 6. Prochaines étapes...')
    console.log('   1. Analyser les résultats des tests ci-dessus')
    console.log('   2. Consulter les logs de la fonction auth-webhook')
    console.log('   3. Identifier la cause exacte de l\'erreur 500')
    console.log('   4. Corriger le problème spécifique')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter les tests
testWebhookSimple()
