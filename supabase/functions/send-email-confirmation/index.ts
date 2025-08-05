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

interface EmailConfirmationRequest {
  email: string;
  confirmationUrl: string;
  name?: string;
}

// Bilingual Email Confirmation Template
const BilingualEmailConfirmation: React.FC<EmailConfirmationRequest> = (props) => {
  return React.createElement(BilingualEmailTemplate, { 
    previewText: "Confirmez votre inscription CIARA • Confirm your CIARA signup"
  },
    // Confirmation icon
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
        React.createElement('span', { style: { fontSize: '32px', color: 'white' } }, "✅")
      )
    ),
    
    // Bilingual title section
    React.createElement(BilingualSection, {
      frenchContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, "Confirmez votre adresse email"),
        React.createElement('p', { style: textStyles.p }, 
          "Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte CIARA."
        )
      ),
      englishContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, "Confirm your email address"),
        React.createElement('p', { style: textStyles.p }, 
          "Click the button below to confirm your email address and activate your CIARA account."
        )
      )
    }),

    // Confirmation button
    React.createElement('div', { style: { textAlign: 'center', margin: '40px 0' } },
      React.createElement(BilingualEmailButton, { href: props.confirmationUrl },
        "🚀 Confirmer mon email • Confirm my email"
      )
    ),

    // Security note
    React.createElement(BilingualEmailCard, { variant: 'warning' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 10px 0', fontWeight: '600' } }, 
            "🔒 Sécurité"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '0' } }, 
            "Si vous n'avez pas demandé cette confirmation, ignorez cet email. Ce lien expire dans 24 heures."
          )
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 10px 0', fontWeight: '600' } }, 
            "🔒 Security"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '0' } }, 
            "If you did not request this confirmation, ignore this email. This link expires in 24 hours."
          )
        )
      })
    ),

    // Help section
    React.createElement('div', { style: { textAlign: 'center', marginTop: '30px' } },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Vous avez des questions ? Nous sommes là pour vous aider !"),
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
          React.createElement('p', { style: textStyles.small }, "Have questions? We're here to help!"),
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
    const { email, confirmationUrl, name }: EmailConfirmationRequest = await req.json();

    if (!email || !confirmationUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and confirmationUrl" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`📧 Sending bilingual email confirmation to: ${email}`);

    // Render the React Email template
    const emailHtml = await renderAsync(
      React.createElement(BilingualEmailConfirmation, { 
        email, 
        confirmationUrl, 
        name
      })
    );

    // Send the email with bilingual subject
    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: "🚀 Confirmez votre inscription CIARA • Confirm your CIARA signup",
      html: emailHtml,
    });

    console.log("✅ Bilingual email confirmation sent successfully:", emailResponse);

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
    console.error("❌ Error sending bilingual email confirmation:", error);
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