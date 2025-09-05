import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { 
  BilingualEmailTemplate, 
  BilingualEmailButton, 
  BilingualEmailCard, 
  BilingualSection,
  textStyles 
} from "../_shared/bilingual-email-system.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  userName?: string;
}

// Template Email Reset Password Bilingue
const BilingualResetPasswordEmail: React.FC<{ email: string; resetUrl: string; userName?: string }> = (props) => {
  return React.createElement(BilingualEmailTemplate, { 
    previewText: `Réinitialiser votre mot de passe CIARA • Reset your CIARA password`
  },
    // Reset icon
    React.createElement('div', { style: { textAlign: 'center', marginBottom: '30px' } },
      React.createElement('div', { 
        style: { 
          display: 'inline-block', 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto' 
        } 
      },
        React.createElement('span', { style: { fontSize: '32px', color: 'white' } }, "🔐")
      )
    ),
    
    // Title section
    React.createElement(BilingualSection, {
      frenchContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, 
          props.userName ? `Bonjour ${props.userName}` : 'Réinitialisation de mot de passe'
        ),
        React.createElement('p', { style: textStyles.p }, 
          "Vous avez demandé la réinitialisation de votre mot de passe CIARA. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe."
        )
      ),
      englishContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, 
          props.userName ? `Hello ${props.userName}` : 'Password Reset'
        ),
        React.createElement('p', { style: textStyles.p }, 
          "You requested to reset your CIARA password. Click the button below to create a new password."
        )
      )
    }),

    // Warning card
    React.createElement(BilingualEmailCard, { variant: 'warning' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.p, margin: '0', fontWeight: '600' } },
            "⚠️ Ce lien est valide pendant 1 heure seulement"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '8px 0 0 0' } },
            "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email."
          )
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.p, margin: '0', fontWeight: '600' } },
            "⚠️ This link is valid for 1 hour only"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '8px 0 0 0' } },
            "If you didn't request this reset, ignore this email."
          )
        )
      })
    ),

    // CTA Button
    React.createElement('div', { style: { textAlign: 'center', margin: '40px 0' } },
      React.createElement(BilingualEmailButton, { 
        href: props.resetUrl,
        style: { backgroundColor: '#ef4444' }
      },
        "🔐 Réinitialiser mon mot de passe • Reset my password"
      )
    ),

    // Instructions
    React.createElement(BilingualEmailCard, { title: "📋 Instructions • Instructions" },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('ol', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "Cliquez sur le bouton ci-dessus"),
          React.createElement('li', { style: textStyles.listItem }, "Créez un nouveau mot de passe sécurisé"),
          React.createElement('li', { style: textStyles.listItem }, "Confirmez votre nouveau mot de passe"),
          React.createElement('li', { style: textStyles.listItem }, "Connectez-vous avec votre nouveau mot de passe")
        ),
        englishContent: React.createElement('ol', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "Click the button above"),
          React.createElement('li', { style: textStyles.listItem }, "Create a new secure password"),
          React.createElement('li', { style: textStyles.listItem }, "Confirm your new password"),
          React.createElement('li', { style: textStyles.listItem }, "Log in with your new password")
        )
      })
    ),

    // Security info
    React.createElement(BilingualEmailCard, { variant: 'info' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0' } },
            "🛡️ Pour votre sécurité, ce lien ne peut être utilisé qu'une seule fois et expire dans 1 heure."
          )
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0' } },
            "🛡️ For your security, this link can only be used once and expires in 1 hour."
          )
        )
      })
    ),

    // Help section
    React.createElement('div', { style: { textAlign: 'center', marginTop: '30px' } },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Besoin d'aide ? Contactez-nous !"),
          React.createElement('a', { 
            href: "mailto:info@ciara.city", 
            style: { 
              color: '#ef4444', 
              textDecoration: 'none', 
              fontWeight: '500' 
            } 
          }, "📧 Support CIARA")
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Need help? Contact us!"),
          React.createElement('a', { 
            href: "mailto:info@ciara.city", 
            style: { 
              color: '#ef4444', 
              textDecoration: 'none', 
              fontWeight: '500' 
            } 
          }, "📧 CIARA Support")
        )
      })
    )
  );
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email, userName }: ResetPasswordRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('🔐 Reset password custom pour:', email);

    // Créer client Supabase pour générer le lien de reset
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://pohqkspsdvvbqrgzfayl.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Détecter l'origine de la requête pour ajuster l'URL de redirection
    const origin = req.headers.get('origin') || 'https://ciara.city';
    const redirectUrl = origin.includes('localhost') 
      ? 'http://localhost:8080/reset-password'
      : 'https://ciara.city/reset-password';

    console.log('🔗 URL de redirection:', redirectUrl);

    // Générer le lien de reset password
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (resetError) {
      console.error('❌ Erreur génération lien reset:', resetError);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const resetUrl = resetData.properties.action_link;
    console.log('✅ Lien de reset généré');

    // Render le template React Email
    const emailHtml = await renderAsync(
      React.createElement(BilingualResetPasswordEmail, { 
        email,
        resetUrl,
        userName
      })
    );

    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: `🔐 Réinitialiser votre mot de passe CIARA • Reset your CIARA password`,
      html: emailHtml,
    });

    console.log('📧 Email reset password envoyé via Resend');

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: "Reset password email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur send-password-reset-custom:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);