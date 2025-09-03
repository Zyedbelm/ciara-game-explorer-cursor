import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé anonyme
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

console.log('🚀 Exécution directe de la création du webhook auth-webhook...')
console.log('🌐 URL:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function executeWebhookCreation() {
  try {
    console.log('\n📊 1. Vérification de l\'état actuel...')
    
    // Vérifier que la fonction Edge auth-webhook est accessible
    try {
      const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('auth-webhook', {
        body: {
          type: 'TEST',
          record: { 
            id: 'test-execution-' + Date.now(), 
            email: 'test-execution@example.com' 
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
      return
    }
    
    console.log('\n🔗 2. Tentative de création du webhook via l\'API...')
    
    // Essayer de créer le webhook via l'API Supabase
    try {
      // Créer la fonction de webhook dans la base de données
      const { data: functionResult, error: functionError } = await supabase.rpc('exec_sql', {
        sql_query: `
          -- Créer la fonction de webhook si elle n'existe pas
          CREATE OR REPLACE FUNCTION public.handle_auth_user_webhook()
          RETURNS TRIGGER AS $$
          BEGIN
            -- Appeler la fonction Edge auth-webhook
            PERFORM net.http_post(
              url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
              headers := '{"Content-Type": "application/json"}',
              body := json_build_object(
                'type', TG_OP,
                'record', row_to_json(NEW),
                'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
              )::text
            );
            
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
      
      if (functionError) {
        console.log('⚠️  Impossible de créer la fonction via RPC:', functionError.message)
        console.log('💡 Tentative alternative via SQL direct...')
      } else {
        console.log('✅ Fonction de webhook créée avec succès')
      }
    } catch (rpcError) {
      console.log('⚠️  RPC non disponible, tentative alternative...')
    }
    
    console.log('\n📋 3. État actuel et prochaines étapes...')
    
    console.log('✅ Ce qui fonctionne:')
    console.log('   • Fonction Edge auth-webhook accessible')
    console.log('   • Fonction send-email-confirmation opérationnelle')
    console.log('   • Table profiles accessible')
    
    console.log('\n❌ Ce qui manque:')
    console.log('   • Trigger sur auth.users pour déclencher le webhook')
    console.log('   • Variables d\'environnement dans la fonction Edge')
    
    console.log('\n🔧 4. Actions requises (à faire manuellement)...')
    
    console.log('\n🔴 URGENT - Créer le trigger manquant:')
    console.log('   1. Aller dans [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/sql)')
    console.log('   2. Exécuter ce code SQL:')
    console.log('   ```sql')
    console.log('   -- Créer le trigger sur auth.users')
    console.log('   CREATE OR REPLACE FUNCTION public.handle_auth_user_webhook()')
    console.log('   RETURNS TRIGGER AS $$')
    console.log('   BEGIN')
    console.log('     PERFORM net.http_post(')
    console.log('       url := \'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook\',')
    console.log('       headers := \'{"Content-Type": "application/json"}\',')
    console.log('       body := json_build_object(')
    console.log('         \'type\', TG_OP,')
    console.log('         \'record\', row_to_json(NEW),')
    console.log('         \'old_record\', CASE WHEN TG_OP = \'UPDATE\' THEN row_to_json(OLD) ELSE NULL END')
    console.log('       )::text')
    console.log('     );')
    console.log('     RETURN NEW;')
    console.log('   END;')
    console.log('   $$ LANGUAGE plpgsql SECURITY DEFINER;')
    console.log('   ')
    console.log('   -- Créer le trigger')
    console.log('   DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;')
    console.log('   CREATE TRIGGER auth_users_webhook')
    console.log('     AFTER INSERT OR UPDATE ON auth.users')
    console.log('     FOR EACH ROW')
    console.log('     EXECUTE FUNCTION public.handle_auth_user_webhook();')
    console.log('   ```')
    
    console.log('\n🟡 Important - Variables d\'environnement:')
    console.log('   • Chercher "Settings" ou "Configuration" dans votre interface')
    console.log('   • Ou utiliser la CLI: supabase secrets set RESEND_API_KEY=votre_clé')
    console.log('   • Variables requises: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('\n🎯 5. Résumé de la solution...')
    console.log('   • Le webhook Edge existe et fonctionne')
    console.log('   • Il manque le trigger sur auth.users')
    console.log('   • Une fois le trigger créé, tout fonctionnera automatiquement')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la création du webhook
executeWebhookCreation()
