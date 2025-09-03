import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

console.log('🔍 Diagnostic du système CIARA...')
console.log('🌐 URL:', SUPABASE_URL)

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
  console.log('💡 Définissez la variable d\'environnement:')
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkSystemStatus() {
  try {
    console.log('\n📊 1. Vérification des utilisateurs...')
    
    // Récupérer tous les utilisateurs
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateurs:', userError)
      return
    }
    
    console.log(`✅ ${users.users.length} utilisateurs trouvés`)
    
    // Trouver l'utilisateur de test
    const targetUser = users.users.find(u => u.email === 'baptiste.meddeb@genieculturel.ch')
    
    if (targetUser) {
      console.log('\n👤 Utilisateur de test trouvé:')
      console.log('   ID:', targetUser.id)
      console.log('   Email:', targetUser.email)
      console.log('   Créé le:', targetUser.created_at)
      console.log('   Email confirmé:', targetUser.email_confirmed_at ? 'OUI' : 'NON')
      console.log('   Dernière connexion:', targetUser.last_sign_in_at || 'Jamais')
      console.log('   Métadonnées:', JSON.stringify(targetUser.user_metadata, null, 2))
    } else {
      console.log('\n❌ Utilisateur baptiste.meddeb@genieculturel.ch non trouvé')
    }
    
    console.log('\n📧 2. Vérification des fonctions Edge...')
    
    try {
      // Test de la fonction send-email-confirmation
      const { data: emailFunc, error: emailFuncError } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          email: 'test@example.com',
          confirmationUrl: 'https://example.com/test',
          name: 'Test User'
        }
      })
      
      if (emailFuncError) {
        console.log('⚠️  Fonction send-email-confirmation accessible mais erreur attendue (email de test)')
        console.log('   Status:', emailFuncError.status)
        console.log('   Message:', emailFuncError.message)
      } else {
        console.log('✅ Fonction send-email-confirmation accessible')
      }
    } catch (funcError) {
      console.error('❌ Erreur accès fonction send-email-confirmation:', funcError.message)
    }
    
    console.log('\n🔗 3. Vérification des webhooks...')
    
    // Vérifier si le webhook auth-webhook est configuré
    try {
      const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { id: 'test', email: 'test@example.com' }
        }
      })
      
      if (webhookError) {
        console.log('⚠️  Webhook auth-webhook accessible mais erreur attendue (données de test)')
        console.log('   Status:', webhookError.status)
        console.log('   Message:', webhookError.message)
      } else {
        console.log('✅ Webhook auth-webhook accessible')
      }
    } catch (webhookFuncError) {
      console.error('❌ Erreur accès webhook auth-webhook:', webhookFuncError.message)
    }
    
    console.log('\n📋 4. Vérification des profils...')
    
    // Vérifier la table des profils
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'baptiste.meddeb@genieculturel.ch')
    
    if (profileError) {
      console.error('❌ Erreur récupération profils:', profileError)
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profil trouvé dans la table profiles:')
      console.log('   User ID:', profiles[0].user_id)
      console.log('   Email:', profiles[0].email)
      console.log('   Rôle:', profiles[0].role)
      console.log('   Points:', profiles[0].total_points)
      console.log('   Créé le:', profiles[0].created_at)
    } else {
      console.log('⚠️  Aucun profil trouvé dans la table profiles')
    }
    
    console.log('\n🎯 5. Recommandations...')
    
    if (targetUser && !targetUser.email_confirmed_at) {
      console.log('   • L\'utilisateur existe mais l\'email n\'est pas confirmé')
      console.log('   • Le webhook auth-webhook devrait avoir envoyé un email automatiquement')
      console.log('   • Vérifiez les logs de la fonction auth-webhook')
      console.log('   • Vérifiez la configuration Resend (clé API, domaine)')
    } else if (targetUser && targetUser.email_confirmed_at) {
      console.log('   • L\'utilisateur existe et l\'email est confirmé')
      console.log('   • Vérifiez si l\'email a été reçu dans les spams')
      console.log('   • L\'utilisateur peut se connecter directement')
    } else {
      console.log('   • L\'utilisateur n\'existe pas dans la base')
      console.log('   • Vérifiez le processus de création de compte')
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le diagnostic
checkSystemStatus()
