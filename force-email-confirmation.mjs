import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

console.log('🚀 Forçage de l\'envoi d\'email de confirmation...')
console.log('📧 Email cible: baptiste.meddeb@genieculturel.ch')

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
  console.log('💡 Définissez la variable d\'environnement:')
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function forceEmailConfirmation() {
  try {
    console.log('\n🔍 1. Récupération de l\'utilisateur...')
    
    // Récupérer l'utilisateur spécifique
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateurs:', userError)
      return
    }
    
    const targetUser = users.users.find(u => u.email === 'baptiste.meddeb@genieculturel.ch')
    
    if (!targetUser) {
      console.error('❌ Utilisateur non trouvé: baptiste.meddeb@genieculturel.ch')
      return
    }
    
    console.log('✅ Utilisateur trouvé:', targetUser.id)
    console.log('📧 Email:', targetUser.email)
    console.log('✅ Email confirmé:', targetUser.email_confirmed_at ? 'OUI' : 'NON')
    
    if (targetUser.email_confirmed_at) {
      console.log('⚠️  L\'email est déjà confirmé!')
      console.log('💡 L\'utilisateur peut se connecter directement')
      return
    }
    
    console.log('\n🔗 2. Génération du lien de confirmation...')
    
    // Générer un nouveau lien de confirmation
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
    
    console.log('\n📧 3. Envoi forcé de l\'email de confirmation...')
    
    // Appeler directement la fonction send-email-confirmation
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        email: targetUser.email,
        confirmationUrl: linkData.properties.action_link,
        name: targetUser.user_metadata?.first_name || targetUser.user_metadata?.last_name || 'Utilisateur'
      }
    })
    
    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      console.log('\n🔍 Détails de l\'erreur:')
      console.log('   Message:', emailError.message)
      console.log('   Status:', emailError.status)
      console.log('   Details:', emailError.details)
      
      // Tentative de diagnostic
      console.log('\n🔍 Diagnostic de l\'erreur...')
      if (emailError.message.includes('RESEND_API_KEY')) {
        console.log('💡 Problème: Clé API Resend manquante ou invalide')
        console.log('   Vérifiez la variable RESEND_API_KEY dans Supabase')
      } else if (emailError.message.includes('domain')) {
        console.log('💡 Problème: Domaine Resend non configuré')
        console.log('   Vérifiez la configuration du domaine dans Resend')
      } else if (emailError.message.includes('rate limit')) {
        console.log('💡 Problème: Limite de taux dépassée')
        console.log('   Attendez quelques minutes avant de réessayer')
      }
      
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
    
    console.log('\n🔍 5. Vérification du webhook...')
    console.log('   Le webhook auth-webhook devrait automatiquement:')
    console.log('   • Créer le profil utilisateur')
    console.log('   • Attribuer 10 points de bienvenue après confirmation')
    console.log('   • Envoyer l\'email de bienvenue')
    
    console.log('\n📋 6. Prochaines étapes:')
    console.log('   • Demandez à l\'utilisateur de vérifier ses emails')
    console.log('   • Si l\'email n\'arrive toujours pas, vérifiez:')
    console.log('     - La configuration Resend dans Supabase')
    console.log('     - Les logs de la fonction auth-webhook')
    console.log('     - Le statut des webhooks dans Supabase')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    console.log('\n🔍 Détails de l\'erreur:')
    console.log('   Message:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Exécuter le forçage
forceEmailConfirmation()
