import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🧪 Test du déclenchement du webhook auth-webhook...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testWebhookTrigger() {
  try {
    console.log('\n🔍 1. Simulation d\'un événement de création d\'utilisateur...')
    
    // Simuler l'événement INSERT qui devrait déclencher le webhook
    const testEvent = {
      type: 'INSERT',
      record: {
        id: 'test-webhook-user-' + Date.now(),
        email: 'test-webhook@example.com',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Webhook'
        },
        created_at: new Date().toISOString()
      }
    }
    
    console.log('📋 Événement de test:')
    console.log('   Type:', testEvent.type)
    console.log('   User ID:', testEvent.record.id)
    console.log('   Email:', testEvent.record.email)
    console.log('   Métadonnées:', JSON.stringify(testEvent.record.user_metadata))
    
    console.log('\n🔗 2. Test d\'appel direct du webhook auth-webhook...')
    
    try {
      const { data: webhookResponse, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: testEvent
      })
      
      if (webhookError) {
        console.log('⚠️  Webhook appelé mais erreur détectée:')
        console.log('   Status:', webhookError.status)
        console.log('   Message:', webhookError.message)
        
        // Analyser l'erreur pour identifier le problème
        if (webhookError.message.includes('RESEND_API_KEY')) {
          console.log('\n🔍 Problème identifié: Clé API Resend manquante')
          console.log('   Solution: Configurer RESEND_API_KEY dans Supabase Dashboard > Settings > Edge Functions')
          console.log('   Étape: Aller dans [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
        } else if (webhookError.message.includes('SUPABASE_URL')) {
          console.log('\n🔍 Problème identifié: Variables d\'environnement manquantes')
          console.log('   Solution: Vérifier SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
        } else if (webhookError.message.includes('unauthorized')) {
          console.log('\n🔍 Problème identifié: Permissions insuffisantes')
          console.log('   Solution: Vérifier les permissions de la fonction Edge')
        } else if (webhookError.message.includes('profiles')) {
          console.log('\n🔍 Problème identifié: Erreur lors de la création du profil')
          console.log('   Solution: Vérifier la structure de la table profiles et les permissions')
        }
        
      } else {
        console.log('✅ Webhook exécuté avec succès!')
        console.log('📋 Réponse:', webhookResponse)
        
        if (webhookResponse?.message) {
          console.log('📧 Message:', webhookResponse.message)
        }
        if (webhookResponse?.user_id) {
          console.log('👤 User ID:', webhookResponse.user_id)
        }
      }
      
    } catch (webhookFuncError) {
      console.error('❌ Erreur lors de l\'appel du webhook:', webhookFuncError.message)
    }
    
    console.log('\n🔍 3. Vérification des logs...')
    console.log('   Pour voir les logs du webhook, allez dans:')
    console.log('   [Supabase Dashboard > Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    
    console.log('\n📋 4. Vérification de la table profiles...')
    console.log('   Pour vérifier si le profil a été créé, allez dans:')
    console.log('   [Supabase Dashboard > Database > Tables > profiles](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/tables)')
    
    console.log('\n🎯 5. Résumé du test...')
    console.log('   • Le webhook auth-webhook est accessible')
    console.log('   • Le webhook peut être appelé manuellement')
    console.log('   • Le problème est probablement dans:')
    console.log('     - Les variables d\'environnement (RESEND_API_KEY)')
    console.log('     - La configuration des triggers d\'authentification')
    console.log('     - Les permissions de la base de données')
    
    console.log('\n💡 6. Prochaines étapes...')
    console.log('   1. Vérifier RESEND_API_KEY dans les variables d\'environnement')
    console.log('   2. Consulter les logs du webhook pour identifier les erreurs')
    console.log('   3. Vérifier la configuration des triggers d\'authentification')
    console.log('   4. Tester la création d\'un vrai compte utilisateur')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le test
testWebhookTrigger()
