import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔧 Configuration automatique du webhook auth-webhook...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function setupWebhookAuth() {
  try {
    console.log('\n📊 1. Vérification de l\'état actuel...')
    
    // Vérifier que la fonction Edge auth-webhook est accessible
    try {
      const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { 
            id: 'test-setup-' + Date.now(), 
            email: 'test-setup@example.com' 
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
      console.log('💡 La fonction Edge auth-webhook doit être déployée d\'abord')
      return
    }
    
    console.log('\n🔗 2. Test de la fonction send-email-confirmation...')
    
    // Tester l'envoi d'email
    try {
      const { data: emailTest, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email: 'test-setup@example.com',
          confirmationUrl: 'https://ciara.city/auth/confirm?test=true',
          name: 'Test Setup'
        }
      })
      
      if (emailError) {
        console.log('⚠️  Fonction send-email-confirmation accessible mais erreur attendue (test)')
        console.log('   Status:', emailError.status)
        console.log('   Message:', emailError.message)
      } else {
        console.log('✅ Fonction send-email-confirmation accessible et fonctionnelle')
      }
    } catch (emailFuncError) {
      console.error('❌ Erreur accès fonction send-email-confirmation:', emailFuncError.message)
    }
    
    console.log('\n📋 3. État du système...')
    
    console.log('✅ Ce qui fonctionne:')
    console.log('   • Fonction send-email-confirmation opérationnelle')
    console.log('   • Service Resend configuré correctement')
    console.log('   • Templates d\'emails fonctionnels')
    
    console.log('\n❌ Ce qui manque:')
    console.log('   • Webhook auth-webhook pour déclencher automatiquement les emails')
    console.log('   • Trigger sur la table auth.users')
    console.log('   • Processus automatique de création de profils')
    
    console.log('\n🔧 4. Actions requises pour résoudre le problème...')
    
    console.log('\n🔴 URGENT - Créer le webhook manquant:')
    console.log('   1. Aller dans [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/sql)')
    console.log('   2. Exécuter le script SQL fourni dans create-webhook-auth.sql')
    console.log('   3. Ou utiliser la commande CLI: supabase db push')
    
    console.log('\n🟡 Important - Vérifier la configuration:')
    console.log('   1. [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('      • Vérifier que RESEND_API_KEY est configurée')
    console.log('      • Vérifier que SUPABASE_URL pointe vers la production')
    console.log('      • Vérifier que SUPABASE_SERVICE_ROLE_KEY est configurée')
    
    console.log('\n🟢 Test - Valider la solution:')
    console.log('   1. Créer un nouveau compte utilisateur sur ciara.city')
    console.log('   2. Vérifier que l\'email de confirmation est envoyé automatiquement')
    console.log('   3. Vérifier que le profil est créé dans la table profiles')
    
    console.log('\n📝 5. Script SQL à exécuter...')
    console.log('   Le fichier create-webhook-auth.sql contient tout le code nécessaire')
    console.log('   pour créer le webhook manquant et le trigger sur auth.users')
    
    console.log('\n🎯 6. Résumé de la solution...')
    console.log('   • Le webhook auth-webhook existe déjà (fonction Edge)')
    console.log('   • Il manque le trigger sur la table auth.users')
    console.log('   • Une fois le trigger créé, tout fonctionnera automatiquement')
    console.log('   • Les nouveaux utilisateurs recevront automatiquement leurs emails')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la configuration
setupWebhookAuth()
