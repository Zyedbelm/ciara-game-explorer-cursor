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
    
    // Handle user creation - create profile and send confirmation email
    if (type === 'INSERT' && record?.id) {
      console.log('👤 Création de profil pour utilisateur:', record.id)
      
      // Create Supabase client - CORRECTION DES NOMS DE VARIABLES
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pohqkspsdvvbqrgzfayl.supabase.co'
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')
      
      if (!supabaseServiceKey) {
        console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
        return new Response(
          JSON.stringify({ error: 'Service role key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
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
          total_points: 0, // Initialize with 0 points
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
    
    // Handle email confirmation - award 10 points and send welcome email
    if (type === 'UPDATE' && record?.id && record?.email_confirmed_at && !old_record?.email_confirmed_at) {
      console.log('✅ Email confirmé pour utilisateur:', record.id)
      console.log('🎁 Attribution des 10 points de bienvenue...')
      
      // Create Supabase client - CORRECTION DES NOMS DE VARIABLES
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pohqkspsdvvbqrgzfayl.supabase.co'
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')
      
      if (!supabaseServiceKey) {
        console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
        return new Response(
          JSON.stringify({ error: 'Service role key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      try {
        // 1. Attribuer 10 points de bienvenue
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            total_points: 10,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', record.id)
        
        if (pointsError) {
          console.error('❌ Erreur attribution points:', pointsError)
        } else {
          console.log('✅ 10 points de bienvenue attribués avec succès')
        }
        
        // 2. Envoyer l'email de bienvenue
        console.log('📧 Envoi de l\'email de bienvenue...')
        const { data: welcomeData, error: welcomeError } = await supabase.functions.invoke('send-welcome-ciara', {
          body: {
            userName: record.user_metadata?.first_name || record.user_metadata?.last_name || record.email.split('@')[0],
            email: record.email,
            loginUrl: 'https://ciara.city/auth'
          }
        })
        
        if (welcomeError) {
          console.error('❌ Erreur envoi email de bienvenue:', welcomeError)
        } else {
          console.log('✅ Email de bienvenue envoyé avec succès')
          console.log('📧 Message ID:', welcomeData?.messageId)
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du traitement post-confirmation:', error)
      }
      
      return new Response(
        JSON.stringify({ 
          message: 'Welcome bonus awarded and welcome email sent',
          user_id: record.id,
          points_awarded: 10
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