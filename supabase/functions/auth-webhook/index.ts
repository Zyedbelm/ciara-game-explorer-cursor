import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { type, record, old_record } = await req.json()
    
    console.log('🔔 Auth Webhook - Type:', type)
    console.log('🔔 Auth Webhook - Record:', record?.id ? 'User ID: ' + record.id : 'No user ID')
    
    // Only handle user creation - let Supabase handle emails natively
    if (type === 'INSERT' && record?.id) {
      console.log('👤 Création de profil pour utilisateur:', record.id)
      
      // Create Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Create profile with default values
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: record.id,
          email: record.email,
          role: 'visitor', // Default role
          first_name: record.user_metadata?.first_name || '',
          last_name: record.user_metadata?.last_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('❌ Erreur création profil:', profileError)
        return new Response(
          JSON.stringify({ error: 'Failed to create profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('✅ Profil créé avec succès pour:', record.id)
      
      // ENVOYER L'EMAIL DE CONFIRMATION VIA RESEND (COMME LES PARTENAIRES)
      console.log('📧 Envoi automatique de l\'email de confirmation via Resend...')
      try {
        // Générer le lien de confirmation
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: record.email,
          options: {
            redirectTo: 'https://ciara.city/auth/callback'
          }
        })
        
        if (linkError) {
          console.error('❌ Erreur génération lien:', linkError)
        } else {
          console.log('✅ Lien de confirmation généré')
          
          // Appeler la fonction send-email-confirmation (même méthode que les partenaires)
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-confirmation', {
            body: {
              email: record.email,
              confirmationUrl: linkData.properties.action_link,
              name: record.user_metadata?.first_name || record.user_metadata?.last_name || ''
            }
          })
          
          if (emailError) {
            console.error('❌ Erreur envoi email via Resend:', emailError)
          } else {
            console.log('✅ Email de confirmation envoyé via Resend (méthode partenaires)')
            console.log('📧 Message ID:', emailData?.messageId)
          }
        }
      } catch (emailError) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
      }
      
      return new Response(
        JSON.stringify({ 
          message: 'Profile created successfully and confirmation email sent via Resend',
          user_id: record.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // For all other events, just log and return success
    console.log('ℹ️ Auth Webhook - Event non géré:', type)
    
    return new Response(
      JSON.stringify({ message: 'Event processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('❌ Erreur Auth Webhook:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})