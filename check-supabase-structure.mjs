import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔍 Vérification de la structure réelle de votre interface Supabase...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkSupabaseStructure() {
  try {
    console.log('\n📊 1. Test d\'accès aux fonctions Edge...')
    
    // Lister les fonctions disponibles
    try {
      const { data: functions, error: functionsError } = await supabase.functions.list()
      
      if (functionsError) {
        console.log('⚠️  Impossible de lister les fonctions:', functionsError.message)
      } else {
        console.log('✅ Fonctions Edge disponibles:')
        functions.forEach(func => {
          console.log(`   • ${func.name} - Status: ${func.status}`)
        })
      }
    } catch (listError) {
      console.log('⚠️  Impossible de lister les fonctions:', listError.message)
    }
    
    console.log('\n🔗 2. Test d\'accès à auth-webhook...')
    
    // Tester l'accès à auth-webhook
    try {
      const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { 
            id: 'test-structure-' + Date.now(), 
            email: 'test-structure@example.com' 
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
    }
    
    console.log('\n📋 3. Vérification de la base de données...')
    
    // Vérifier l'accès à la table profiles
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (profileError) {
        console.log('❌ Erreur accès table profiles:', profileError.message)
      } else {
        console.log('✅ Table profiles accessible')
      }
    } catch (dbError) {
      console.log('❌ Erreur accès base de données:', dbError.message)
    }
    
    console.log('\n🔍 4. Instructions pour accéder aux variables d\'environnement...')
    
    console.log('\n🔴 URGENT - Comment accéder aux variables d\'environnement:')
    console.log('   1. Aller dans [Supabase Dashboard](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl)')
    console.log('   2. Chercher "Settings" ou "Configuration" dans le menu de gauche')
    console.log('   3. Ou chercher "Environment Variables" ou "Variables d\'environnement"')
    console.log('   4. Ou aller dans "Project Settings" puis "Environment"')
    
    console.log('\n🟡 Alternative - Via l\'interface des fonctions:')
    console.log('   1. Aller dans [Edge Functions](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Cliquer sur "auth-webhook"')
    console.log('   3. Chercher un onglet "Configuration", "Settings", "Variables" ou "Environment"')
    
    console.log('\n🟢 Si aucune option n\'est disponible:')
    console.log('   1. Utiliser la CLI Supabase: supabase secrets set RESEND_API_KEY=votre_clé')
    console.log('   2. Ou contacter le support Supabase')
    
    console.log('\n🎯 5. Prochaines étapes...')
    console.log('   • Identifier où configurer les variables d\'environnement')
    console.log('   • Configurer RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    console.log('   • Exécuter le script SQL pour créer le webhook')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la vérification
checkSupabaseStructure()
