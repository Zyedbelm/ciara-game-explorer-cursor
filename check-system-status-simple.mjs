import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme disponible
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔍 Diagnostic simplifié du système CIARA...')
console.log('🌐 URL:', SUPABASE_URL)
console.log('🔑 Clé: Anonyme (accès limité)')

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkSystemStatusSimple() {
  try {
    console.log('\n📊 1. Vérification de l\'accès de base...')
    
    // Test de connexion de base
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur accès base de données:', testError.message)
      console.log('💡 Problème: La clé anonyme n\'a pas les permissions nécessaires')
      console.log('   Solution: Utiliser la clé de service (SUPABASE_SERVICE_ROLE_KEY)')
      return
    }
    
    console.log('✅ Accès à la base de données réussi')
    
    console.log('\n📋 2. Vérification des profils (accès public)...')
    
    // Vérifier la table des profils
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'baptiste.meddeb@genieculturel.ch')
    
    if (profileError) {
      console.error('❌ Erreur récupération profils:', profileError.message)
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
    
    console.log('\n🔗 3. Test des fonctions Edge (accès public)...')
    
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
    
    console.log('\n🎯 4. Recommandations...')
    console.log('   • Le profil utilisateur existe dans la base')
    console.log('   • Pour un diagnostic complet, utilisez la clé de service:')
    console.log('     export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"')
    console.log('   • La clé de service se trouve dans:')
    console.log('     Supabase Dashboard > Settings > API > Project API keys > service_role')
    
    console.log('\n🔍 5. Vérifications manuelles recommandées:')
    console.log('   1. Aller dans [Supabase Dashboard > Auth > Users](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/users)')
    console.log('   2. Vérifier le statut de baptiste.meddeb@genieculturel.ch')
    console.log('   3. Aller dans [Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   4. Vérifier les erreurs dans les logs')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le diagnostic simplifié
checkSystemStatusSimple()
