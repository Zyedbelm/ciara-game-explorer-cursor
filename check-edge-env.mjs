// Vérification des variables d'environnement de la fonction Edge auth-webhook
// Le problème localhost peut venir des variables d'environnement

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzQsImV4cCI6MjA1MDU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEdgeEnvironment() {
  console.log('🔍 Diagnostic des variables d\'environnement Edge Function...')
  
  try {
    // Test 1: Vérifier que la fonction auth-webhook est accessible
    console.log('\n1️⃣ Test d\'accès à auth-webhook...')
    
    const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
      body: {
        type: 'TEST',
        record: { id: 'test', email: 'test@example.com' }
      }
    })
    
    if (webhookError) {
      console.log('⚠️ Erreur accès auth-webhook:', webhookError.message)
    } else {
      console.log('✅ auth-webhook accessible:', webhookTest)
    }
    
    // Test 2: Vérifier les variables d'environnement via un test simple
    console.log('\n2️⃣ Test des variables d\'environnement...')
    
    // Créer un client avec les variables d'environnement
    const projectUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3MTk3NCwiZXhwIjoyMDUwNTQ3OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
    
    const serviceClient = createClient(projectUrl, serviceKey)
    
    // Test 3: Vérifier l'accès à la base de données
    console.log('\n3️⃣ Test d\'accès à la base de données...')
    
    const { data: dbTest, error: dbError } = await serviceClient
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.log('⚠️ Erreur accès base de données:', dbError.message)
    } else {
      console.log('✅ Accès base de données OK')
    }
    
    // Test 4: Vérifier la fonction send-email-confirmation
    console.log('\n4️⃣ Test de send-email-confirmation...')
    
    const { data: emailTest, error: emailError } = await serviceClient.functions.invoke('send-email-confirmation', {
      body: {
        email: 'test@example.com',
        confirmationUrl: 'https://ciara.city/test',
        name: 'Test User'
      }
    })
    
    if (emailError) {
      console.log('⚠️ Erreur send-email-confirmation:', emailError.message)
    } else {
      console.log('✅ send-email-confirmation accessible:', emailTest)
    }
    
    console.log('\n🎯 Diagnostic terminé')
    console.log('• Si localhost persiste, le problème vient des variables d\'environnement')
    console.log('• Vérifiez PROJECT_URL et SERVICE_ROLE_KEY dans Supabase Dashboard')
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message)
  }
}

// Exécuter le diagnostic
checkEdgeEnvironment()
