import { createClient } from '@supabase/supabase-js'

// Configuration Supabase (remplacez par vos vraies valeurs)
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

console.log('🧪 Test d\'envoi d\'email de confirmation...')
console.log('📧 Email de test: baptiste.meddeb@genieculturel.ch')

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
  console.log('💡 Définissez la variable d\'environnement:')
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function testEmailConfirmation() {
  try {
    console.log('\n🔍 1. Vérification de l\'utilisateur...')
    
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateurs:', userError)
      return
    }
    
    const targetUser = user.users.find(u => u.email === 'baptiste.meddeb@genieculturel.ch')
    
    if (!targetUser) {
      console.error('❌ Utilisateur non trouvé: baptiste.meddeb@genieculturel.ch')
      return
    }
    
    console.log('✅ Utilisateur trouvé:', targetUser.id)
    console.log('📧 Email:', targetUser.email)
    console.log('✅ Email confirmé:', targetUser.email_confirmed_at ? 'OUI' : 'NON')
    console.log('📅 Créé le:', targetUser.created_at)
    
    if (targetUser.email_confirmed_at) {
      console.log('⚠️  L\'email est déjà confirmé!')
      return
    }
    
    console.log('\n🔗 2. Génération du lien de confirmation...')
    
    // Générer le lien de confirmation
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: targetUser.email,
      options: {
        redirectTo: 'https://ciara.city/auth/callback'
      }
    })
    
    if (linkError) {
      console.error('❌ Erreur génération lien:', linkError)
      return
    }
    
    console.log('✅ Lien de confirmation généré')
    console.log('🔗 URL:', linkData.properties.action_link)
    
    console.log('\n📧 3. Test d\'envoi d\'email via la fonction Edge...')
    
    // Appeler la fonction send-email-confirmation
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        email: targetUser.email,
        confirmationUrl: linkData.properties.action_link,
        name: targetUser.user_metadata?.first_name || targetUser.user_metadata?.last_name || ''
      }
    })
    
    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      console.log('\n🔍 Détails de l\'erreur:')
      console.log('   Message:', emailError.message)
      console.log('   Status:', emailError.status)
      console.log('   Details:', emailError.details)
      return
    }
    
    console.log('✅ Email envoyé avec succès!')
    console.log('📧 Message ID:', emailData?.messageId)
    console.log('📧 Sujet: 🚀 Confirmez votre inscription CIARA • Confirm your CIARA signup')
    
    console.log('\n🎯 4. Instructions pour l\'utilisateur:')
    console.log('   1. Vérifiez votre boîte email (et spam)')
    console.log('   2. Cliquez sur le lien de confirmation')
    console.log('   3. Vous recevrez 10 points de bienvenue')
    console.log('   4. Un email de bienvenue sera envoyé')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le test
testEmailConfirmation()
