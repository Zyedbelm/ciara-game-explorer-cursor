import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔍 Debug du Webhook - Identification du Problème Exact...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testWebhookDebug() {
  try {
    console.log('\n📊 1. Test de debug de la fonction auth-webhook...')
    
    // Test avec des données très simples
    console.log('\n🧪 Test Debug: Données très simples')
    try {
      const { data: testDebug, error: errorDebug } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { 
            id: 'debug-' + Date.now()
          }
        }
      })
      
      if (errorDebug) {
        console.log('❌ Test Debug échoué:')
        console.log('   Status:', errorDebug.status)
        console.log('   Message:', errorDebug.message)
        console.log('   Details:', errorDebug.details)
      } else {
        console.log('✅ Test Debug réussi:', testDebug)
      }
    } catch (testDebugError) {
      console.log('❌ Test Debug erreur:', testDebugError.message)
    }
    
    console.log('\n🔍 2. Analyse du problème...')
    
    console.log('❌ Problème identifié:')
    console.log('   • Le webhook est déclenché (bon signe)')
    console.log('   • Mais il retourne "Edge Function returned a non-2xx status code"')
    console.log('   • Cela signifie une erreur interne dans la fonction')
    
    console.log('\n🔧 3. Causes possibles...')
    
    console.log('🔴 Cause 1: Erreur dans le code de la fonction')
    console.log('   • Erreur de syntaxe ou de logique')
    console.log('   • Problème avec l\'accès aux variables d\'environnement')
    console.log('   • Erreur lors de la création du profil')
    
    console.log('\n🟡 Cause 2: Problème de permissions')
    console.log('   • La fonction n\'a pas accès à la table profiles')
    console.log('   • La fonction n\'a pas les bonnes permissions')
    
    console.log('\n🟢 Cause 3: Problème avec l\'extension net.http_post')
    console.log('   • L\'extension peut ne pas être installée')
    console.log('   • L\'extension peut avoir des problèmes')
    
    console.log('\n📋 4. Actions de diagnostic immédiates...')
    
    console.log('\n🔍 Vérification des logs (OBLIGATOIRE):')
    console.log('   1. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Créer un nouveau compte pour déclencher l\'erreur')
    console.log('   3. Vérifier les logs pour voir l\'erreur exacte')
    console.log('   4. Partager l\'erreur exacte des logs')
    
    console.log('\n🔧 Vérification de la configuration:')
    console.log('   1. Vérifier que les variables d\'environnement sont bien configurées')
    console.log('   2. Vérifier que la fonction a les bonnes permissions')
    console.log('   3. Vérifier que l\'extension net.http_post est installée')
    
    console.log('\n🎯 5. Solutions recommandées...')
    
    console.log('\n🔴 Solution immédiate:')
    console.log('   1. Consulter les logs de la fonction auth-webhook')
    console.log('   2. Identifier l\'erreur exacte')
    console.log('   3. Corriger le problème spécifique')
    
    console.log('\n🟡 Solution alternative:')
    console.log('   1. Vérifier que l\'extension net.http_post est installée')
    console.log('   2. Vérifier les permissions de la fonction')
    console.log('   3. Tester avec des données simplifiées')
    
    console.log('\n💡 6. Prochaines étapes...')
    console.log('   1. CONSULTER LES LOGS (étape obligatoire)')
    console.log('   2. Partager l\'erreur exacte trouvée dans les logs')
    console.log('   3. Corriger le problème spécifique identifié')
    console.log('   4. Tester à nouveau')
    
    console.log('\n🚨 7. IMPORTANT - Action requise immédiatement:')
    console.log('   • Vous DEVEZ consulter les logs de la fonction auth-webhook')
    console.log('   • Les logs contiennent l\'erreur exacte qui cause le problème')
    console.log('   • Sans cette information, nous ne pouvons pas résoudre le problème')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le debug
testWebhookDebug()
