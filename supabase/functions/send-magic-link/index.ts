import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { renderAsync } from 'https://esm.sh/@react-email/render@0.0.10';
import { Resend } from 'https://esm.sh/resend@2.0.0';
// Removed unused imports - using direct HTML template instead
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

// Simple Magic Link Email Template
const MagicLinkEmail = ({ email, magicLinkUrl, name }: MagicLinkRequest) => {
  const displayName = name || email.split('@')[0];
  
  return React.createElement('html', {},
    React.createElement('head', {},
      React.createElement('meta', { charset: 'utf-8' }),
      React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      React.createElement('title', {}, 'CIARA Magic Login')
    ),
    React.createElement('body', { 
      style: { 
        fontFamily: 'Arial, sans-serif', 
        backgroundColor: '#f8fafc', 
        margin: '0', 
        padding: '20px' 
      } 
    },
      React.createElement('div', { 
        style: { 
          maxWidth: '600px', 
          margin: '0 auto', 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '40px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        } 
      },
        // Header
        React.createElement('div', { 
          style: { 
            textAlign: 'center', 
            marginBottom: '40px',
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '20px'
          } 
        },
          React.createElement('h1', { 
            style: { 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#1e293b', 
              margin: '0 0 8px 0' 
            } 
          }, '🔗 CIARA Magic Login'),
          React.createElement('p', { 
            style: { 
              fontSize: '16px', 
              color: '#64748b', 
              margin: '0' 
            } 
          }, 'Your intelligent travel companion')
        ),

        // French Section
        React.createElement('div', { 
          style: { 
            border: '2px solid #f97316', 
            borderRadius: '8px', 
            padding: '24px', 
            marginBottom: '24px',
            backgroundColor: '#fff7ed'
          } 
        },
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px' 
            } 
          },
            React.createElement('span', { 
              style: { 
                fontSize: '20px', 
                marginRight: '8px' 
              } 
            }, '🇫🇷'),
            React.createElement('h2', { 
              style: { 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#1e293b', 
                margin: '0' 
              } 
            }, 'Français')
          ),
          
          React.createElement('h3', { 
            style: { 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1e293b', 
              margin: '0 0 16px 0' 
            } 
          }, 'Connexion magique 🪄'),
          
          React.createElement('p', { 
            style: { 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: '#475569', 
              margin: '0 0 16px 0' 
            } 
          }, `Bonjour ${displayName},`),
          
          React.createElement('p', { 
            style: { 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: '#475569', 
              margin: '0 0 24px 0' 
            } 
          }, 'Cliquez sur le bouton ci-dessous pour vous connecter automatiquement à votre compte CIARA :'),
          
          React.createElement('div', { 
            style: { 
              textAlign: 'center', 
              margin: '32px 0' 
            } 
          },
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
            }, 'Se connecter automatiquement')
          ),
          
          React.createElement('div', { 
            style: { 
              margin: '24px 0', 
              padding: '16px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '6px', 
              border: '1px solid #f59e0b' 
            } 
          },
            React.createElement('p', { 
              style: { 
                fontSize: '14px', 
                lineHeight: '1.6', 
                color: '#92400e', 
                margin: '0', 
                fontStyle: 'italic' 
              } 
            }, '⚠️ Ce lien est valide pendant 1 heure et ne peut être utilisé qu\'une seule fois.')
          )
        ),

        // English Section
        React.createElement('div', { 
          style: { 
            border: '2px solid #3b82f6', 
            borderRadius: '8px', 
            padding: '24px',
            backgroundColor: '#eff6ff'
          } 
        },
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px' 
            } 
          },
            React.createElement('span', { 
              style: { 
                fontSize: '20px', 
                marginRight: '8px' 
              } 
            }, '🇬🇧'),
            React.createElement('h2', { 
              style: { 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#1e293b', 
                margin: '0' 
              } 
            }, 'English')
          ),
          
          React.createElement('h3', { 
            style: { 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1e293b', 
              margin: '0 0 16px 0' 
            } 
          }, 'Magic Login 🪄'),
          
          React.createElement('p', { 
            style: { 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: '#475569', 
              margin: '0 0 16px 0' 
            } 
          }, `Hello ${displayName},`),
          
          React.createElement('p', { 
            style: { 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: '#475569', 
              margin: '0 0 24px 0' 
            } 
          }, 'Click the button below to automatically log in to your CIARA account:'),
          
          React.createElement('div', { 
            style: { 
              textAlign: 'center', 
              margin: '32px 0' 
            } 
          },
            React.createElement('a', {
              href: magicLinkUrl,
              style: {
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                border: 'none',
                cursor: 'pointer'
              }
            }, 'Log in automatically')
          ),
          
          React.createElement('div', { 
            style: { 
              margin: '24px 0', 
              padding: '16px', 
              backgroundColor: '#dbeafe', 
              borderRadius: '6px', 
              border: '1px solid #3b82f6' 
            } 
          },
            React.createElement('p', { 
              style: { 
                fontSize: '14px', 
                lineHeight: '1.6', 
                color: '#1e40af', 
                margin: '0', 
                fontStyle: 'italic' 
              } 
            }, '⚠️ This link is valid for 1 hour and can only be used once.')
          )
        ),

        // Footer
        React.createElement('div', { 
          style: { 
            textAlign: 'center', 
            marginTop: '40px', 
            paddingTop: '20px', 
            borderTop: '2px solid #f1f5f9' 
          } 
        },
          React.createElement('p', { 
            style: { 
              fontSize: '14px', 
              color: '#64748b', 
              margin: '0 0 8px 0' 
            } 
          }, 'Need help? Contact us at ',
            React.createElement('a', { 
              href: 'mailto:support@ciara.city',
              style: { color: '#f97316', textDecoration: 'none' }
            }, 'support@ciara.city')
          ),
          React.createElement('p', { 
            style: { 
              fontSize: '14px', 
              color: '#64748b', 
              margin: '0' 
            } 
          }, 'The CIARA Team')
        )
      )
    )
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