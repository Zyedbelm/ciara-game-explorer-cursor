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

interface PartnerOfferNotificationRequest {
  partnerName: string;
  partnerEmail: string;
  partnerId: string; // ID du partenaire pour chercher les liens
  offerTitle: string;
  offerDescription: string;
  pointsRequired: number;
  validityDays: number;
  maxRedemptions?: number;
  cityName: string;
  createdBy?: string;
}

// React Email Template
const PartnerOfferNotificationEmail: React.FC<PartnerOfferNotificationRequest> = (props) => 
  React.createElement(BaseEmail, { previewText: `Nouvelle offre créée : ${props.offerTitle}` },
    React.createElement('h1', { style: styles.h1 }, "Nouvelle offre ajoutée à votre profil partenaire"),
    
    React.createElement('p', { style: styles.p }, `Bonjour ${props.partnerName},`),
    
    React.createElement('p', { style: styles.p },
      "Une nouvelle offre de récompense a été créée pour votre établissement sur la plateforme CIARA ",
      React.createElement('span', { style: styles.highlight }, props.cityName),
      ". Voici les détails de cette offre :"
    ),

    React.createElement(EmailCard, { title: props.offerTitle },
      React.createElement('p', { style: styles.p }, props.offerDescription),
      
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' } },
        React.createElement('div', {},
          React.createElement('strong', { style: styles.strong }, "Points requis :"),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#667eea', fontSize: '18px', fontWeight: 'bold' } }, `${props.pointsRequired} points`)
        ),
        React.createElement('div', {},
          React.createElement('strong', { style: styles.strong }, "Validité :"),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#059669', fontWeight: 'bold' } }, `${props.validityDays} jours`)
        ),
        props.maxRedemptions && React.createElement('div', { style: { gridColumn: '1 / -1' } },
          React.createElement('strong', { style: styles.strong }, "Limite d'échanges :"),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#f59e0b', fontWeight: 'bold' } }, `${props.maxRedemptions} échanges maximum`)
        )
      )
    ),

    React.createElement(EmailCard, { title: "Prochaines étapes" },
      React.createElement('ul', { style: { color: '#475569', lineHeight: '1.6', margin: '0', paddingLeft: '20px' } },
        React.createElement('li', { style: { marginBottom: '8px' } }, "Les visiteurs peuvent maintenant découvrir cette offre"),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Préparez votre équipe à accueillir les détenteurs de codes"),
        React.createElement('li', { style: { marginBottom: '8px' } }, "Vérifiez votre stock ou disponibilité selon l'offre")
      )
    ),

    React.createElement('p', { style: styles.p },
      "Cette offre est maintenant active sur la plateforme. Vous recevrez une notification par email chaque fois qu'un client utilisera cette offre."
    ),

    props.createdBy && React.createElement('p', { style: { color: '#94a3b8', fontSize: '14px', marginBottom: '30px' } },
      `Offre créée par : ${props.createdBy}`
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

    const { 
      partnerName, 
      partnerEmail, 
      partnerId,
      offerTitle, 
      offerDescription, 
      pointsRequired, 
      validityDays, 
      maxRedemptions,
      cityName,
      createdBy 
    }: PartnerOfferNotificationRequest = await req.json();

    if (!partnerName || !partnerEmail || !partnerId || !offerTitle || !cityName) {
      return new Response(
        JSON.stringify({ error: "Partner name, email, ID, offer title, and city name are required" }),
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

    console.log('📧 Sending partner offer notification to:', destinationEmail);

    // Render React Email template
    const htmlContent = await renderAsync(
      React.createElement(PartnerOfferNotificationEmail, {
        partnerName,
        partnerEmail,
        offerTitle,
        offerDescription,
        pointsRequired,
        validityDays,
        maxRedemptions,
        cityName,
        createdBy
      })
    );

    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [destinationEmail],
      subject: `Nouvelle offre créée pour votre établissement - ${offerTitle}`,
      html: htmlContent,
    });

    console.log("✅ Partner offer notification email sent successfully:", emailResponse);

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
    console.error("❌ Error in send-partner-offer-notification function:", error);
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