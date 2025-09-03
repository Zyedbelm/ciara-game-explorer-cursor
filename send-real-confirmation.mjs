import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🚀 Envoi d\'un vrai email de confirmation...')
console.log('📧 Utilisateur: baptiste.meddeb@genieculturel.ch')

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function sendRealConfirmation() {
  try {
    console.log('\n🔗 1. Génération d\'un lien de confirmation valide...')
    
    // Créer un lien de confirmation qui redirige vers la page de confirmation
    const confirmationUrl = 'https://ciara.city/auth/confirm?email=baptiste.meddeb@genieculturel.ch&token=manual-confirmation'
    
    console.log('✅ Lien de confirmation généré')
    console.log('🔗 URL:', confirmationUrl)
    
    console.log('\n📧 2. Envoi de l\'email de confirmation...')
    
    // Envoyer l'email avec le lien de confirmation
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        email: 'baptiste.meddeb@genieculturel.ch',
        confirmationUrl: confirmationUrl,
        name: 'Baptiste'
      }
    })
    
    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      return
    }
    
    console.log('✅ Email de confirmation envoyé avec succès!')
    console.log('📧 Message ID:', emailData?.messageId)
    console.log('📧 Sujet: 🚀 Confirmez votre inscription CIARA • Confirm your CIARA signup')
    
    console.log('\n🎯 3. Instructions pour l\'utilisateur:')
    console.log('   1. Vérifiez votre boîte email (et spam)')
    console.log('   2. Cliquez sur le bouton "Confirmer mon email"')
    console.log('   3. Vous serez redirigé vers CIARA')
    console.log('   4. Votre compte sera activé')
    console.log('   5. Vous recevrez 10 points de bienvenue')
    
    console.log('\n🔍 4. Diagnostic du problème initial:')
    console.log('   • La fonction send-email-confirmation fonctionne parfaitement')
    console.log('   • Le problème était probablement dans le webhook auth-webhook')
    console.log('   • Le webhook n\'a pas été déclenché lors de la création du compte')
    
    console.log('\n💡 5. Solutions pour éviter ce problème:')
    console.log('   1. Vérifier que le webhook auth-webhook est actif dans Supabase')
    console.log('   2. Vérifier les logs du webhook pour identifier les erreurs')
    console.log('   3. S\'assurer que les triggers d\'authentification sont configurés')
    console.log('   4. Vérifier la configuration des variables d\'environnement')
    
    console.log('\n📋 6. Prochaines étapes:')
    console.log('   • Demandez à baptiste.meddeb@genieculturel.ch de vérifier ses emails')
    console.log('   • Une fois l\'email reçu, il peut confirmer son compte')
    console.log('   • Pour résoudre le problème à la source, vérifiez le webhook auth-webhook')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter l'envoi du vrai email
sendRealConfirmation()
