import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔍 Diagnostic de l\'Erreur 500 lors de la création de profil...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function diagnosticErreur500() {
  try {
    console.log('\n📊 1. Vérification de l\'état actuel...')
    
    // Vérifier que la fonction Edge auth-webhook est accessible
    try {
      const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { 
            id: 'test-diagnostic-' + Date.now(), 
            email: 'test-diagnostic@example.com' 
          }
        }
      })
      
      if (webhookError) {
        console.log('⚠️  Fonction auth-webhook accessible mais erreur attendue (test)')
        console.log('   Status:', webhookError.status)
        console.log('   Message:', webhookError.message)
      } else {
        console.log('✅ Fonction auth-webhook accessible et fonctionnelle')
      }
    } catch (webhookFuncError) {
      console.error('❌ Erreur accès fonction auth-webhook:', webhookFuncError.message)
      return
    }
    
    console.log('\n🔍 2. Analyse de l\'erreur 500...')
    
    console.log('❌ Erreur détectée: POST /auth/v1/signup → 500 (Internal Server Error)')
    console.log('💡 Cela signifie que:')
    console.log('   • Le webhook est déclenché (bon signe)')
    console.log('   • Mais il y a une erreur dans l\'exécution du webhook')
    console.log('   • L\'erreur 500 indique un problème côté serveur')
    
    console.log('\n🔧 3. Causes possibles de l\'erreur 500...')
    
    console.log('🔴 Problème 1: Variables d\'environnement manquantes')
    console.log('   • RESEND_API_KEY peut être mal configurée')
    console.log('   • SUPABASE_SERVICE_ROLE_KEY peut être manquante')
    console.log('   • SUPABASE_URL peut être incorrecte')
    
    console.log('\n🟡 Problème 2: Permissions insuffisantes')
    console.log('   • La fonction peut ne pas avoir accès à la table profiles')
    console.log('   • La fonction peut ne pas avoir les bonnes permissions')
    
    console.log('\n🟢 Problème 3: Erreur dans le code du webhook')
    console.log('   • Erreur de syntaxe ou de logique')
    console.log('   • Problème avec l\'extension net.http_post')
    
    console.log('\n📋 4. Actions de diagnostic immédiates...')
    
    console.log('\n🔍 Vérification des logs:')
    console.log('   1. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Créer un nouveau compte pour déclencher l\'erreur')
    console.log('   3. Vérifier les logs pour voir l\'erreur exacte')
    
    console.log('\n🔧 Vérification de la configuration:')
    console.log('   1. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Vérifier les variables d\'environnement')
    console.log('   3. Vérifier que RESEND_API_KEY est correcte')
    
    console.log('\n📊 5. Test de diagnostic...')
    
    console.log('🧪 Test 1: Vérifier l\'accès à la table profiles')
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (profileError) {
        console.log('❌ Erreur accès table profiles:', profileError.message)
        console.log('💡 Cela peut expliquer l\'erreur 500')
      } else {
        console.log('✅ Table profiles accessible')
      }
    } catch (dbError) {
      console.log('❌ Erreur accès base de données:', dbError.message)
    }
    
    console.log('\n🧪 Test 2: Vérifier l\'extension net.http_post')
    try {
      const { data: extensionCheck, error: extensionError } = await supabase.rpc('check_http_extension')
      
      if (extensionError) {
        console.log('⚠️  Extension net.http_post non vérifiable via RPC')
      } else {
        console.log('✅ Extension net.http_post disponible')
      }
    } catch (rpcError) {
      console.log('⚠️  RPC check_http_extension non disponible')
    }
    
    console.log('\n🎯 6. Solutions recommandées...')
    
    console.log('\n🔴 Solution immédiate:')
    console.log('   1. Vérifier les logs de la fonction auth-webhook')
    console.log('   2. Identifier l\'erreur exacte dans les logs')
    console.log('   3. Corriger la cause spécifique identifiée')
    
    console.log('\n🟡 Solution alternative:')
    console.log('   1. Vérifier que l\'extension net.http_post est installée')
    console.log('   2. Vérifier les permissions de la fonction')
    console.log('   3. Tester avec des données simplifiées')
    
    console.log('\n💡 7. Prochaines étapes...')
    console.log('   1. Consulter les logs de la fonction auth-webhook')
    console.log('   2. Partager l\'erreur exacte trouvée dans les logs')
    console.log('   3. Corriger le problème spécifique identifié')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le diagnostic
diagnosticErreur500()
