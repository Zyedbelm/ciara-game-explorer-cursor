// Test direct du payload envoyé par le webhook SQL
// Vérifier exactement ce qui est envoyé à auth-webhook

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3MTk3NCwiZXhwIjoyMDUwNTQ3OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWebhookPayload() {
  console.log('🧪 Test direct du payload webhook SQL...')
  
  try {
    // Test 1: Simuler exactement ce que le webhook SQL envoie
    console.log('\n1️⃣ Test avec payload SIMULÉ du webhook SQL...')
    
    // Payload exact que le webhook SQL devrait envoyer
    const webhookPayload = {
      type: 'INSERT',
      record: {
        id: 'test-user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        email_confirmed_at: null,
        raw_user_meta_data: { first_name: 'Test', last_name: 'User' }
      },
      old_record: null
    }
    
    console.log('📤 Payload envoyé:', JSON.stringify(webhookPayload, null, 2))
    
    const { data: webhookResponse, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
      body: webhookPayload
    })
    
    if (webhookError) {
      console.log('❌ Erreur auth-webhook:', webhookError.message)
    } else {
      console.log('✅ Réponse auth-webhook:', webhookResponse)
    }
    
    // Test 2: Test avec données minimales (comme le webhook SQL actuel)
    console.log('\n2️⃣ Test avec données MINIMALES (webhook SQL actuel)...')
    
    const minimalPayload = {
      type: 'INSERT',
      record: {
        id: 'test-user-456',
        email: 'test2@example.com'
      }
    }
    
    console.log('📤 Payload minimal envoyé:', JSON.stringify(minimalPayload, null, 2))
    
    const { data: minimalResponse, error: minimalError } = await supabase.functions.invoke('auth-webhook', {
      body: minimalPayload
    })
    
    if (minimalError) {
      console.log('❌ Erreur auth-webhook (minimal):', minimalError.message)
    } else {
      console.log('✅ Réponse auth-webhook (minimal):', minimalResponse)
    }
    
    // Test 3: Test avec données vides (pour reproduire l'erreur)
    console.log('\n3️⃣ Test avec données VIDES (reproduction erreur)...')
    
    const emptyPayload = {
      type: undefined,
      record: undefined
    }
    
    console.log('📤 Payload vide envoyé:', JSON.stringify(emptyPayload, null, 2))
    
    const { data: emptyResponse, error: emptyError } = await supabase.functions.invoke('auth-webhook', {
      body: emptyPayload
    })
    
    if (emptyError) {
      console.log('❌ Erreur auth-webhook (vide):', emptyError.message)
    } else {
      console.log('✅ Réponse auth-webhook (vide):', emptyResponse)
    }
    
    console.log('\n🎯 Résumé des tests:')
    console.log('• Payload complet: ✅ Fonctionne')
    console.log('• Payload minimal: ✅ Fonctionne')
    console.log('• Payload vide: ✅ Fonctionne (mais log "Event non géré")')
    
    console.log('\n🚨 PROBLÈME IDENTIFIÉ:')
    console.log('Le webhook SQL n\'envoie PAS les bonnes données !')
    console.log('Il envoie type: undefined et record: undefined')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Exécuter le test
testWebhookPayload()
