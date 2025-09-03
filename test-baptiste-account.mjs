import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🧪 Test Direct - Compte Baptiste et Fonction auth-webhook...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testBaptisteAccount() {
  try {
    console.log('\n📊 1. Test de la fonction Edge auth-webhook avec données Baptiste...')
    
    // Test avec les données exactes de Baptiste
    console.log('\n🧪 Test: Données Baptiste (INSERT)')
    try {
      const { data: testBaptiste, error: errorBaptiste } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'INSERT',
          record: { 
            id: 'baptiste-test-' + Date.now(), 
            email: 'baptiste.meddeb@genieculturel.ch',
            user_metadata: {
              first_name: 'Baptiste',
              last_name: 'Meddeb'
            }
          }
        }
      })
      
      if (errorBaptiste) {
        console.log('❌ Test Baptiste échoué:')
        console.log('   Status:', errorBaptiste.status)
        console.log('   Message:', errorBaptiste.message)
        console.log('   Details:', errorBaptiste.details)
      } else {
        console.log('✅ Test Baptiste réussi:', testBaptiste)
      }
    } catch (testBaptisteError) {
      console.log('❌ Test Baptiste erreur:', testBaptisteError.message)
    }
    
    // Test de la fonction send-email-confirmation directement
    console.log('\n🧪 Test: Fonction send-email-confirmation directe')
    try {
      const { data: emailTest, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email: 'baptiste.meddeb@genieculturel.ch',
          confirmationUrl: 'https://ciara.city/auth/confirm?test=baptiste',
          name: 'Baptiste Meddeb'
        }
      })
      
      if (emailError) {
        console.log('❌ Test email échoué:')
        console.log('   Status:', emailError.status)
        console.log('   Message:', emailError.message)
        console.log('   Details:', emailError.details)
      } else {
        console.log('✅ Test email réussi:', emailTest)
      }
    } catch (emailTestError) {
      console.log('❌ Test email erreur:', emailTestError.message)
    }
    
    console.log('\n📋 3. Analyse des résultats...')
    
    console.log('🔍 Si Test Baptiste échoue mais Test email réussit:')
    console.log('   • Le problème est dans la logique du webhook auth-webhook')
    console.log('   • La fonction send-email-confirmation fonctionne')
    console.log('   • Il faut corriger le webhook')
    
    console.log('\n🔍 Si les deux tests échouent:')
    console.log('   • Problème général avec les fonctions Edge')
    console.log('   • Vérifier la configuration globale')
    
    console.log('\n🔍 Si les deux tests réussissent:')
    console.log('   • Le webhook fonctionne en test direct')
    console.log('   • Le problème est dans le déclenchement automatique')
    console.log('   • Vérifier les logs du webhook')
    
    console.log('\n🎯 4. Actions recommandées...')
    
    console.log('\n🔴 Action immédiate:')
    console.log('   1. Consulter les logs de la fonction auth-webhook')
    console.log('   2. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   3. Chercher les logs récents pour Baptiste')
    console.log('   4. Partager l\'erreur exacte trouvée')
    
    console.log('\n🟡 Action alternative:')
    console.log('   1. Vérifier que le webhook SÛR est bien activé')
    console.log('   2. Vérifier que le trigger est bien créé')
    console.log('   3. Tester la création d\'un autre compte')
    
    console.log('\n💡 5. Prochaines étapes...')
    console.log('   1. Analyser les résultats des tests ci-dessus')
    console.log('   2. Consulter les logs du webhook')
    console.log('   3. Identifier la cause exacte du problème')
    console.log('   4. Corriger le webhook si nécessaire')
    
    console.log('\n🎯 6. Résumé de la situation...')
    console.log('   ✅ Compte Baptiste créé dans Supabase')
    console.log('   ✅ Pas d\'erreur lors de la création')
    console.log('   ❌ Email de confirmation non reçu')
    console.log('   🔍 Le problème est dans l\'envoi de l\'email')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le test
testBaptisteAccount()
