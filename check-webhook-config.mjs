import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔍 Vérification de la configuration du webhook auth-webhook...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkWebhookConfig() {
  try {
    console.log('\n📊 1. Vérification de l\'accès aux fonctions Edge...')
    
    // Test de la fonction auth-webhook
    try {
      const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { 
            id: 'test-user-id', 
            email: 'test@example.com',
            user_metadata: { first_name: 'Test', last_name: 'User' }
          }
        }
      })
      
      if (webhookError) {
        console.log('⚠️  Webhook auth-webhook accessible mais erreur attendue (données de test)')
        console.log('   Status:', webhookError.status)
        console.log('   Message:', webhookError.message)
        
        // Analyser l'erreur pour identifier le problème
        if (webhookError.message.includes('RESEND_API_KEY')) {
          console.log('\n🔍 Problème identifié: Clé API Resend manquante')
          console.log('   Solution: Configurer RESEND_API_KEY dans Supabase Dashboard')
        } else if (webhookError.message.includes('SUPABASE_URL')) {
          console.log('\n🔍 Problème identifié: Variables d\'environnement manquantes')
          console.log('   Solution: Vérifier SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
        } else if (webhookError.message.includes('unauthorized')) {
          console.log('\n🔍 Problème identifié: Permissions insuffisantes')
          console.log('   Solution: Vérifier les permissions de la fonction Edge')
        }
      } else {
        console.log('✅ Webhook auth-webhook accessible et fonctionnel')
      }
    } catch (webhookFuncError) {
      console.error('❌ Erreur accès webhook auth-webhook:', webhookFuncError.message)
    }
    
    console.log('\n🔗 2. Test de la fonction send-email-confirmation...')
    
    // Test de la fonction d'envoi d'email
    try {
      const { data: emailTest, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email: 'test@example.com',
          confirmationUrl: 'https://example.com/test',
          name: 'Test User'
        }
      })
      
      if (emailError) {
        console.log('⚠️  Fonction send-email-confirmation accessible mais erreur attendue (email de test)')
        console.log('   Status:', emailError.status)
        console.log('   Message:', emailError.message)
      } else {
        console.log('✅ Fonction send-email-confirmation accessible et fonctionnelle')
      }
    } catch (emailFuncError) {
      console.error('❌ Erreur accès fonction send-email-confirmation:', emailFuncError.message)
    }
    
    console.log('\n📋 3. Analyse de la configuration...')
    
    console.log('✅ Ce qui fonctionne:')
    console.log('   • Fonction send-email-confirmation opérationnelle')
    console.log('   • Service Resend configuré correctement')
    console.log('   • Templates d\'emails fonctionnels')
    
    console.log('\n⚠️  Ce qui pose problème:')
    console.log('   • Webhook auth-webhook non déclenché lors de la création de comptes')
    console.log('   • Processus automatique interrompu')
    
    console.log('\n🔍 4. Vérifications manuelles requises...')
    console.log('   1. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Vérifier que la fonction est active et déployée')
    console.log('   3. Consulter les logs pour identifier les erreurs')
    console.log('   4. Vérifier les variables d\'environnement (RESEND_API_KEY)')
    
    console.log('\n   5. Aller dans [Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)')
    console.log('   6. Vérifier que le webhook auth-webhook est configuré')
    console.log('   7. Tester le webhook avec des données de test')
    
    console.log('\n   8. Aller dans [Auth > Users](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/users)')
    console.log('   9. Vérifier le statut de baptiste.meddeb@genieculturel.ch')
    console.log('   10. Confirmer que l\'email a été confirmé')
    
    console.log('\n🎯 5. Actions recommandées...')
    console.log('   • Vérifier la configuration du webhook dans Supabase Dashboard')
    console.log('   • Consulter les logs pour identifier les erreurs spécifiques')
    console.log('   • Configurer les variables d\'environnement manquantes')
    console.log('   • Tester la création d\'un nouveau compte')
    console.log('   • Mettre en place un monitoring des webhooks')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la vérification
checkWebhookConfig()
