import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🔍 Diagnostic approfondi du webhook auth-webhook...')
console.log('🌐 URL Production:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function diagnosticWebhookProduction() {
  try {
    console.log('\n📊 1. Vérification de la configuration de production...')
    
    // Vérifier que nous utilisons bien l'URL de production
    if (SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1')) {
      console.error('❌ ERREUR CRITIQUE: URL de localhost détectée!')
      console.log('   URL actuelle:', SUPABASE_URL)
      console.log('   URL attendue: https://pohqkspsdvvbqrgzfayl.supabase.co')
      return
    }
    
    console.log('✅ URL de production correcte:', SUPABASE_URL)
    
    console.log('\n🔗 2. Test avec données correctement formatées...')
    
    // Test avec des données dans le bon format (comme attendu par le webhook)
    const correctEvent = {
      type: 'INSERT',
      record: {
        id: 'test-production-user-' + Date.now(),
        email: 'test-production@example.com',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Production'
        },
        created_at: new Date().toISOString()
      }
    }
    
    console.log('📋 Événement de test (format correct):')
    console.log('   Type:', correctEvent.type)
    console.log('   User ID:', correctEvent.record.id)
    console.log('   Email:', correctEvent.record.email)
    
    console.log('\n🔗 3. Appel du webhook avec données correctes...')
    
    try {
      const { data: webhookResponse, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: correctEvent
      })
      
      if (webhookError) {
        console.log('⚠️  Webhook appelé mais erreur détectée:')
        console.log('   Status:', webhookError.status)
        console.log('   Message:', webhookError.message)
        
        // Analyser l'erreur
        if (webhookError.message.includes('localhost')) {
          console.log('\n🔍 PROBLÈME IDENTIFIÉ: Référence à localhost dans la configuration!')
          console.log('   Solution: Vérifier les variables d\'environnement dans Supabase Dashboard')
        }
        
      } else {
        console.log('✅ Webhook exécuté avec succès!')
        console.log('📋 Réponse:', webhookResponse)
      }
      
    } catch (webhookFuncError) {
      console.error('❌ Erreur lors de l\'appel du webhook:', webhookFuncError.message)
    }
    
    console.log('\n🔍 4. Vérifications critiques à faire...')
    
    console.log('\n🔴 URGENT - Vérifier dans Supabase Dashboard:')
    console.log('   1. [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('      • Variables d\'environnement (pas de localhost)')
    console.log('      • URL de la fonction (doit être en production)')
    
    console.log('\n   2. [Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)')
    console.log('      • URL du webhook (doit pointer vers la production)')
    console.log('      • Pas de référence à localhost')
    
    console.log('\n   3. [Settings > API](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/settings/api)')
    console.log('      • URL du projet (doit être en production)')
    console.log('      • Pas de configuration locale')
    
    console.log('\n🔍 5. Problèmes potentiels identifiés...')
    
    console.log('\n⚠️  Problème 1: Variables d\'environnement locales')
    console.log('   - SUPABASE_URL pourrait pointer vers localhost')
    console.log('   - SUPABASE_SERVICE_ROLE_KEY pourrait être locale')
    
    console.log('\n⚠️  Problème 2: Configuration du webhook')
    console.log('   - L\'URL du webhook pourrait pointer vers localhost')
    console.log('   - Les triggers pourraient être mal configurés')
    
    console.log('\n⚠️  Problème 3: Fonction mal déployée')
    console.log('   - La fonction pourrait être en mode développement')
    console.log('   - Les variables d\'environnement pourraient être locales')
    
    console.log('\n🎯 6. Actions immédiates...')
    
    console.log('\n🔴 Maintenant:')
    console.log('   1. Aller dans [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Vérifier qu\'il n\'y a PAS de localhost dans les variables')
    console.log('   3. Vérifier que SUPABASE_URL pointe vers la production')
    
    console.log('\n🟡 Dans l\'heure:')
    console.log('   1. Redéployer la fonction après correction')
    console.log('   2. Tester à nouveau la création de profil')
    console.log('   3. Vérifier que les logs ne mentionnent plus localhost')
    
    console.log('\n🔍 7. Test de validation...')
    console.log('   Après correction, exécuter:')
    console.log('   node test-webhook-trigger.mjs')
    console.log('   Et vérifier que les logs montrent:')
    console.log('   ✅ Type: INSERT')
    console.log('   ✅ Record: User ID: [id]')
    console.log('   ❌ PAS de localhost')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le diagnostic
diagnosticWebhookProduction()
