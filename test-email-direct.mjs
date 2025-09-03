import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🧪 Test direct de la fonction d\'envoi d\'email...')
console.log('📧 Email de test: baptiste.meddeb@genieculturel.ch')

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testEmailDirect() {
  try {
    console.log('\n🔗 1. Test de la fonction send-email-confirmation...')
    
    // Test avec l'email réel de l'utilisateur
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        email: 'baptiste.meddeb@genieculturel.ch',
        confirmationUrl: 'https://ciara.city/auth/callback?test=true',
        name: 'Baptiste'
      }
    })
    
    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      console.log('\n🔍 Détails de l\'erreur:')
      console.log('   Message:', emailError.message)
      console.log('   Status:', emailError.status)
      console.log('   Details:', emailError.details)
      
      // Diagnostic de l'erreur
      console.log('\n🔍 Diagnostic de l\'erreur...')
      if (emailError.message.includes('RESEND_API_KEY')) {
        console.log('💡 Problème: Clé API Resend manquante ou invalide')
        console.log('   Solution: Vérifier RESEND_API_KEY dans Supabase Dashboard > Settings > Edge Functions')
      } else if (emailError.message.includes('domain')) {
        console.log('💡 Problème: Domaine Resend non configuré')
        console.log('   Solution: Vérifier la configuration du domaine dans Resend')
      } else if (emailError.message.includes('rate limit')) {
        console.log('💡 Problème: Limite de taux dépassée')
        console.log('   Solution: Attendre quelques minutes avant de réessayer')
      } else if (emailError.message.includes('unauthorized')) {
        console.log('💡 Problème: Accès non autorisé à la fonction')
        console.log('   Solution: Vérifier les permissions de la fonction Edge')
      }
      
      return
    }
    
    console.log('✅ Email envoyé avec succès!')
    console.log('📧 Message ID:', emailData?.messageId)
    console.log('📧 Sujet: 🚀 Confirmez votre inscription CIARA • Confirm your CIARA signup')
    
    console.log('\n🎯 2. Instructions pour l\'utilisateur:')
    console.log('   1. Vérifiez votre boîte email (et spam)')
    console.log('   2. Cliquez sur le lien de confirmation')
    console.log('   3. Vous recevrez 10 points de bienvenue')
    console.log('   4. Un email de bienvenue sera envoyé')
    
    console.log('\n🔍 3. Prochaines étapes:')
    console.log('   • Demandez à baptiste.meddeb@genieculturel.ch de vérifier ses emails')
    console.log('   • Si l\'email n\'arrive toujours pas, vérifiez:')
    console.log('     - La configuration Resend dans Supabase Dashboard')
    console.log('     - Les logs de la fonction auth-webhook')
    console.log('     - Le statut des webhooks dans Supabase')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    console.log('\n🔍 Détails de l\'erreur:')
    console.log('   Message:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Exécuter le test direct
testEmailDirect()
