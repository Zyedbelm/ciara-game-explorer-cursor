import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { renderAsync } from 'https://esm.sh/@react-email/render@0.0.10';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { BilingualEmailTemplate, BilingualEmailButton, BilingualEmailCard, BilingualSection } from '../_shared/bilingual-email-system.tsx';
import React from 'npm:react@18.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MagicLinkRequest {
  email: string;
  magicLinkUrl: string;
  name?: string;
}

// Bilingual Magic Link Email Template
const MagicLinkEmail = ({ email, magicLinkUrl, name }: MagicLinkRequest) => {
  const displayName = name || email.split('@')[0];
  
  return React.createElement(BilingualEmailTemplate, {
    previewText: "🔗 Votre lien de connexion magique / Your magic login link"
  },
    React.createElement(BilingualSection, {
      frenchContent: React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 24px 0' } }, 
          "Connexion magique 🪄"
        ),
        
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
          `Bonjour ${displayName},`
        ),
        
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
          "Cliquez sur le bouton ci-dessous pour vous connecter automatiquement à votre compte CIARA :"
        ),
        
        React.createElement('div', { style: { textAlign: 'center', margin: '32px 0' } },
          React.createElement('a', {
            href: magicLinkUrl,
            style: {
              display: 'inline-block',
              padding: '16px 32px',
              backgroundColor: '#f97316',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              border: 'none',
              cursor: 'pointer'
            }
          }, "Se connecter automatiquement / Log in automatically")
        ),
        

        React.createElement(BilingualEmailCard, {
          frenchTitle: "Sécurité",
          englishTitle: "Security",
          frenchContent: React.createElement('div', {},
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
              "• Ce lien est valide pendant ", React.createElement('strong', {}, "1 heure")
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
              "• Il ne peut être utilisé qu'une seule fois"
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
              "• Si vous n'avez pas demandé cette connexion, ignorez cet email"
            )
          ),
          englishContent: React.createElement('div', {},
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
              "• This link is valid for ", React.createElement('strong', {}, "1 hour")
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
              "• It can only be used once"
            ),
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
              "• If you didn't request this login, please ignore this email"
            )
          )
        }),

        React.createElement('div', { style: { margin: '24px 0' } },
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "Vous pouvez aussi copier-coller ce lien dans votre navigateur :"
          ),
          React.createElement('p', { 
            style: {
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#475569',
              wordBreak: 'break-all',
              backgroundColor: '#f5f5f5',
              padding: '8px',
              borderRadius: '4px',
              margin: '0 0 16px 0'
            }
          }, magicLinkUrl)
        ),

        React.createElement('div', { style: { margin: '24px 0' } },
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "Besoin d'aide ? Contactez-nous à ",
            React.createElement('a', { 
              href: "mailto:support@ciara.city",
              style: { color: '#f97316', textDecoration: 'none' }
            }, "support@ciara.city")
          ),
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "L'équipe CIARA"
          )
        )
      ),
      englishContent: React.createElement('div', {},
        React.createElement('h1', { style: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 24px 0' } }, 
          "Magic Login 🪄"
        ),
        
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
          `Hello ${displayName},`
        ),
        
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
          "Click the button below to automatically log in to your CIARA account:"
        ),
        
        React.createElement('div', { style: { textAlign: 'center', margin: '32px 0' } },
          React.createElement('a', {
            href: magicLinkUrl,
            style: {
              display: 'inline-block',
              padding: '16px 32px',
              backgroundColor: '#f97316',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              border: 'none',
              cursor: 'pointer'
            }
          }, "Log in automatically / Se connecter automatiquement")
        ),
        
        React.createElement('div', { style: { margin: '24px 0' } },
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "You can also copy and paste this link into your browser:"
          ),
          React.createElement('p', { 
            style: {
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#475569',
              wordBreak: 'break-all',
              backgroundColor: '#f5f5f5',
              padding: '8px',
              borderRadius: '4px',
              margin: '0 0 16px 0'
            }
          }, magicLinkUrl)
        ),

        React.createElement('div', { style: { margin: '24px 0' } },
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "Need help? Contact us at ",
            React.createElement('a', { 
              href: "mailto:support@ciara.city",
              style: { color: '#f97316', textDecoration: 'none' }
            }, "support@ciara.city")
          ),
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "The CIARA Team"
          )
        )
      )
    })
  );
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { email, magicLinkUrl, name }: MagicLinkRequest = await req.json();

    if (!email || !magicLinkUrl) {
      return new Response(
        JSON.stringify({ error: 'Email and magicLinkUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Render the email template
    const emailHtml = await renderAsync(
      MagicLinkEmail({ email, magicLinkUrl, name })
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: 'CIARA <noreply@ciara.city>',
      to: [email],
      subject: '🔗 Connexion magique CIARA / CIARA Magic Login',
      html: emailHtml,
    });

    console.log('✅ Magic link email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Magic link email sent successfully',
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Error sending magic link email:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send magic link email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);