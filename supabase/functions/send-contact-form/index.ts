
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import * as React from "npm:react@18.2.0";
import { renderAsync } from "npm:@react-email/components@0.0.12";
import { ContactFormEmail } from "./contact-form-email.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    
    const { name, email, subject, message, priority } = formData;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing contact form submission:", { name, email, subject, priority });

    // Generate the email HTML using React Email
    const html = await renderAsync(
      React.createElement(ContactFormEmail, {
        name,
        email,
        subject,
        message,
        priority,
      })
    );

    // Send email to info@ciara.city
    const emailResponse = await resend.emails.send({
      from: "CIARA Contact <contact@ciara.city>",
      to: ["info@ciara.city"],
      subject: `Contact CIARA: ${subject} (${priority})`,
      html,
      reply_to: email
    });

    console.log("Main email sent:", emailResponse);

    // Send confirmation to the sender
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; font-size: 32px; margin: 0; letter-spacing: 2px;">CIARA</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">Plateforme de Tourisme Intelligent</p>
        </div>
        
        <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">Merci pour votre message !</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Bonjour <strong>${name}</strong>,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Nous avons bien reçu votre message concernant "<strong>${subject}</strong>" et nous vous en remercions.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Notre équipe vous répondra dans les plus brefs délais à l'adresse <strong>${email}</strong>.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 24px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 12px 0;">🕒 Temps de réponse estimé:</h3>
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              ${priority === 'urgent' ? '• Urgent: sous 4 heures' : 
                priority === 'high' ? '• Priorité élevée: sous 12 heures' : 
                priority === 'normal' ? '• Priorité normale: sous 24 heures' : 
                '• Priorité faible: sous 48 heures'}
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            En attendant, n'hésitez pas à explorer notre plateforme et à découvrir nos destinations !
          </p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://ciara.city" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              🌟 Découvrir CIARA
            </a>
          </div>
          
          <hr style="border: none; height: 1px; background: #eee; margin: 30px 0;" />
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
            Cordialement,<br>
            <strong>L'équipe CIARA</strong><br>
            📧 info@ciara.city<br>
            📞 +41 79 301 79 15
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Thank you for your message!</h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
            Hello <strong>${name}</strong>,
          </p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
            We have received your message about "<strong>${subject}</strong>" and we thank you for it.
          </p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Our team will respond to you as soon as possible at <strong>${email}</strong>.
          </p>
          <p style="color: #64748b; font-size: 12px; margin-top: 16px; text-align: center;">
            Best regards,<br>
            <strong>The CIARA Team</strong><br>
            📧 info@ciara.city | 📞 +41 79 301 79 15
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: "✅ Message reçu - Merci de nous avoir contactés | Message received - Thank you for contacting us",
      html: confirmationHtml,
    });

    console.log("Confirmation email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
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
