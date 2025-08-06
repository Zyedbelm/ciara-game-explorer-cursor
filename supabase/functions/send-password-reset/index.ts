import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
  name?: string;
}

// Bilingual Password Reset Template
const BilingualPasswordReset: React.FC<PasswordResetRequest> = (props) => {
  return React.createElement(BilingualEmailTemplate, { 
    previewText: "Réinitialisez votre mot de passe CIARA • Reset your CIARA password"
  },
    // Security icon
    React.createElement('div', { style: { textAlign: 'center', marginBottom: '30px' } },
      React.createElement('div', { 
        style: { 
          display: 'inline-block', 
          background: 'linear-gradient(135deg, #f97316, #ea580c)', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto' 
        } 
      },
        React.createElement('span', { style: { fontSize: '32px', color: 'white' } }, "🔒")
      )
    ),
    
    // Bilingual title section
    React.createElement(BilingualSection, {
      frenchContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, "Réinitialiser votre mot de passe"),
        React.createElement('p', { style: textStyles.p }, 
          "Vous avez demandé à réinitialiser votre mot de passe CIARA. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe."
        )
      ),
      englishContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, "Reset your password"),
        React.createElement('p', { style: textStyles.p }, 
          "You have requested to reset your CIARA password. Click the button below to create a new password."
        )
      )
    }),

    // Reset button
    React.createElement('div', { style: { textAlign: 'center', margin: '40px 0' } },
      React.createElement(BilingualEmailButton, { href: props.resetUrl },
        "🔑 Réinitialiser le mot de passe • Reset Password"
      )
    ),

    // Security alert
    React.createElement(BilingualEmailCard, { variant: 'warning' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 10px 0', fontWeight: '600' } }, 
            "⚠️ Important pour votre sécurité"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '0' } }, 
            "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et contactez-nous immédiatement. Ce lien expire dans 1 heure."
          )
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 10px 0', fontWeight: '600' } }, 
            "⚠️ Important for your security"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '0' } }, 
            "If you did not request this reset, ignore this email and contact us immediately. This link expires in 1 hour."
          )
        )
      })
    ),

    // Security tips
    React.createElement(BilingualEmailCard, { variant: 'info' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 15px 0', fontWeight: '600' } }, 
            "💡 Conseils pour un mot de passe sécurisé :"
          ),
          React.createElement('ul', { style: { ...textStyles.list, fontSize: '14px' } },
            React.createElement('li', {}, "Au moins 8 caractères"),
            React.createElement('li', {}, "Mélange de majuscules et minuscules"),
            React.createElement('li', {}, "Incluez des chiffres et symboles"),
            React.createElement('li', {}, "Évitez les informations personnelles")
          )
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 15px 0', fontWeight: '600' } }, 
            "💡 Tips for a secure password:"
          ),
          React.createElement('ul', { style: { ...textStyles.list, fontSize: '14px' } },
            React.createElement('li', {}, "At least 8 characters"),
            React.createElement('li', {}, "Mix of uppercase and lowercase"),
            React.createElement('li', {}, "Include numbers and symbols"),
            React.createElement('li', {}, "Avoid personal information")
          )
        )
      })
    ),

    // Help section
    React.createElement('div', { style: { textAlign: 'center', marginTop: '30px' } },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Des difficultés ? Notre équipe support est disponible 24/7"),
          React.createElement('a', { 
            href: "mailto:info@ciara.city", 
            style: { 
              color: '#f97316', 
              textDecoration: 'none', 
              fontWeight: '500' 
            } 
          }, "📧 Contacter le support")
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Having trouble? Our support team is available 24/7"),
          React.createElement('a', { 
            href: "mailto:info@ciara.city", 
            style: { 
              color: '#f97316', 
              textDecoration: 'none', 
              fontWeight: '500' 
            } 
          }, "📧 Contact support")
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
    const { email, resetUrl, name }: PasswordResetRequest = await req.json();

    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and resetUrl" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }


    // Render the React Email template
    const emailHtml = await renderAsync(
      React.createElement(BilingualPasswordReset, { 
        email, 
        resetUrl, 
        name
      })
    );

    // Send the email with bilingual subject
    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: "🔑 Réinitialisez votre mot de passe CIARA • Reset your CIARA password",
      html: emailHtml,
    });


    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);