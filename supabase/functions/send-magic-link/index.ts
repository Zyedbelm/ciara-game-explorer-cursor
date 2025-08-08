import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MagicLinkRequest {
  email: string;
  magicLinkUrl: string;
  name?: string;
}

// Simple HTML Template for Magic Link Email
const createMagicLinkEmail = ({ email, magicLinkUrl, name }: MagicLinkRequest): string => {
  const displayName = name || email.split('@')[0];
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CIARA Magic Login</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
            <h1 style="font-size: 32px; font-weight: bold; color: #1e293b; margin: 0 0 8px 0;">🔗 CIARA Magic Login</h1>
            <p style="font-size: 16px; color: #64748b; margin: 0;">Your intelligent travel companion</p>
        </div>

        <!-- French Section -->
        <div style="border: 2px solid #f97316; border-radius: 8px; padding: 24px; margin-bottom: 24px; background-color: #fff7ed;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 20px; margin-right: 8px;">🇫🇷</span>
                <h2 style="font-size: 20px; font-weight: bold; color: #1e293b; margin: 0;">Français</h2>
            </div>
            
            <h3 style="font-size: 24px; font-weight: bold; color: #1e293b; margin: 0 0 16px 0;">Connexion magique 🪄</h3>
            
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">Bonjour ${displayName},</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">Cliquez sur le bouton ci-dessous pour vous connecter automatiquement à votre compte CIARA :</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${magicLinkUrl}" style="display: inline-block; padding: 16px 32px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); border: none; cursor: pointer;">Se connecter automatiquement</a>
            </div>
            
            <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 6px; border: 1px solid #f59e0b;">
                <p style="font-size: 14px; line-height: 1.6; color: #92400e; margin: 0; font-style: italic;">⚠️ Ce lien est valide pendant 1 heure et ne peut être utilisé qu'une seule fois.</p>
            </div>
        </div>

        <!-- English Section -->
        <div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 24px; background-color: #eff6ff;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 20px; margin-right: 8px;">🇬🇧</span>
                <h2 style="font-size: 20px; font-weight: bold; color: #1e293b; margin: 0;">English</h2>
            </div>
            
            <h3 style="font-size: 24px; font-weight: bold; color: #1e293b; margin: 0 0 16px 0;">Magic Login 🪄</h3>
            
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 16px 0;">Hello ${displayName},</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">Click the button below to automatically log in to your CIARA account:</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${magicLinkUrl}" style="display: inline-block; padding: 16px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: none; cursor: pointer;">Log in automatically</a>
            </div>
            
            <div style="margin: 24px 0; padding: 16px; background-color: #dbeafe; border-radius: 6px; border: 1px solid #3b82f6;">
                <p style="font-size: 14px; line-height: 1.6; color: #1e40af; margin: 0; font-style: italic;">⚠️ This link is valid for 1 hour and can only be used once.</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f1f5f9;">
            <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">Need help? Contact us at <a href="mailto:support@ciara.city" style="color: #f97316; text-decoration: none;">support@ciara.city</a></p>
            <p style="font-size: 14px; color: #64748b; margin: 0;">The CIARA Team</p>
        </div>
    </div>
</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { email, magicLinkUrl, name } = await req.json();

    // Validate required fields
    if (!email || !magicLinkUrl) {
      return new Response(
        JSON.stringify({ error: 'Email and magicLinkUrl are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Create email HTML
    const emailHtml = createMagicLinkEmail({ email, magicLinkUrl, name });

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'CIARA <noreply@ciara.city>',
      to: [email],
      subject: '🔗 Connexion magique CIARA / CIARA Magic Login',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});