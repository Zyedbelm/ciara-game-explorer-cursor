/**
 * Script pour désactiver complètement le système d'authentification personnalisé
 * et revenir aux templates natifs Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIzNjQ0NCwiZXhwIjoyMDY3ODEyNDQ0fQ.Ht9OzTGUwOGQqTm0nJgE-yFGFLQZZ4xJGxOOKqfPaR0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableCustomAuth() {
  console.log('🔄 Désactivation du système d\'authentification personnalisé...');
  
  try {
    // Désactiver l'email externe
    console.log('📧 Désactivation de external_email_enabled...');
    const { error: emailError } = await supabase
      .from('auth.config')
      .update({ value: 'false' })
      .eq('key', 'external_email_enabled')
      .eq('instance_id', '00000000-0000-0000-0000-000000000000');
    
    if (emailError && !emailError.message.includes('No rows')) {
      console.error('❌ Erreur désactivation email externe:', emailError);
    } else {
      console.log('✅ Email externe désactivé');
    }
    
    // Supprimer l'URL du webhook
    console.log('🔗 Suppression de webhook_url...');
    const { error: webhookError } = await supabase
      .from('auth.config')
      .delete()
      .eq('key', 'webhook_url')
      .eq('instance_id', '00000000-0000-0000-0000-000000000000');
    
    if (webhookError && !webhookError.message.includes('No rows')) {
      console.error('❌ Erreur suppression webhook URL:', webhookError);
    } else {
      console.log('✅ Webhook URL supprimé');
    }
    
    // Supprimer le secret du webhook
    console.log('🔐 Suppression de webhook_secret...');
    const { error: secretError } = await supabase
      .from('auth.config')
      .delete()
      .eq('key', 'webhook_secret')
      .eq('instance_id', '00000000-0000-0000-0000-000000000000');
    
    if (secretError && !secretError.message.includes('No rows')) {
      console.error('❌ Erreur suppression webhook secret:', secretError);
    } else {
      console.log('✅ Webhook secret supprimé');
    }
    
    console.log('✅ Système d\'authentification personnalisé désactivé');
    console.log('📧 Supabase utilisera maintenant ses templates natifs');
    
  } catch (error) {
    console.error('❌ Erreur lors de la désactivation:', error);
  }
}

disableCustomAuth();
