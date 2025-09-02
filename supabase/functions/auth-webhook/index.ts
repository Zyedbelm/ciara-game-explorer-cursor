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
      
      return new Response(
        JSON.stringify({ 
          message: 'Profile created successfully',
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