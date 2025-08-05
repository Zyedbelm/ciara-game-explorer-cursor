import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { BaseEmail, EmailCard, EmailButton, styles } from "../_shared/email-components.tsx";
import { supabase } from "../_shared/supabase.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerWelcomeRequest {
  partnerName: string;
  partnerEmail: string;
  partnerId: string; // ID du partenaire pour chercher les liens
  cityName: string;
  createdBy?: string;
}

// React Email Template
const PartnerWelcomeEmail: React.FC<PartnerWelcomeRequest> = (props) => 
  React.createElement(BaseEmail, { previewText: `Bienvenue dans le réseau CIARA - ${props.cityName}` },
    React.createElement('h1', { style: styles.h1 }, "Bienvenue dans le réseau de partenaires CIARA !"),
    
    React.createElement('p', { style: styles.p }, `Bonjour ${props.partnerName},`),
    
    React.createElement('p', { style: styles.p },
      "Nous sommes ravis de vous accueillir en tant que partenaire officiel de CIARA à ",
      React.createElement('span', { style: styles.highlight }, props.cityName),
      ". Votre établissement fait désormais partie de notre réseau de partenaires qui enrichissent l'expérience de nos visiteurs grâce à des offres exclusives et des récompenses attrayantes."
    ),

    React.createElement(EmailCard, { title: "Vos avantages en tant que partenaire" },
      React.createElement('ul', { style: { color: '#475569', lineHeight: '1.6', margin: '0', paddingLeft: '20px' } },
        React.createElement('li', { style: { marginBottom: '8px' } }, `Visibilité accrue auprès des visiteurs de ${props.cityName}`),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Augmentation du trafic client grâce aux récompenses CIARA"),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Intégration dans les parcours touristiques gamifiés"),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Notifications par email lors de l'utilisation de vos offres")
      )
    ),

    React.createElement(EmailCard, { title: "Prochaines étapes" },
      React.createElement('ol', { style: { color: '#475569', lineHeight: '1.6', margin: '0', paddingLeft: '20px' } },
        React.createElement('li', { style: { marginBottom: '8px' } }, "Préparez votre équipe à accueillir les détenteurs de codes"),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Vérifiez votre stock ou disponibilité selon vos offres"),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Vous recevrez une notification par email chaque fois qu'un client utilisera une de vos offres")
      )
    ),

    React.createElement('p', { style: styles.p },
      "Notre équipe reste à votre disposition pour vous accompagner dans cette nouvelle collaboration. N'hésitez pas à nous contacter pour toute question ou demande d'assistance."
    ),

    (props.contactName && props.contactEmail) && React.createElement(EmailCard, { title: "Contact local" },
      React.createElement('p', { style: styles.p },
        React.createElement('strong', { style: styles.strong }, props.contactName),
        React.createElement('br'),
        `📧 ${props.contactEmail}`
      )
    )
  );

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { partnerName, partnerEmail, partnerId, cityName, createdBy }: PartnerWelcomeRequest = await req.json();

    if (!partnerName || !partnerEmail || !partnerId || !cityName) {
      return new Response(
        JSON.stringify({ error: "Partner name, email, ID, and city name are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Déterminer l'email de destination en priorité
    let destinationEmail = partnerEmail;
    
    try {
      // Chercher d'abord un partenaire lié à ce partenaire
      const { data: linkedPartner, error: linkError } = await supabase
        .from('partner_user_links')
        .select('user_id')
        .eq('partner_id', partnerId)
        .single();

      if (linkedPartner && !linkError) {
        // Récupérer l'email du partenaire lié
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', linkedPartner.user_id)
          .single();

        if (userProfile && !profileError && userProfile.email) {
          destinationEmail = userProfile.email;
          console.log('📧 Sending to linked partner email:', destinationEmail);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not find linked partner, using partner email:', partnerEmail);
    }

    console.log('📧 Sending partner welcome email to:', destinationEmail);

    // Render React Email template
    const htmlContent = await renderAsync(
      React.createElement(PartnerWelcomeEmail, {
        partnerName,
        partnerEmail,
        cityName,
        createdBy
      })
    );

    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [destinationEmail],
      subject: `Bienvenue dans le réseau CIARA - ${cityName}`,
      html: htmlContent,
    });

    console.log("✅ Partner welcome email sent successfully:", emailResponse);

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
    console.error("❌ Error in send-partner-welcome function:", error);
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