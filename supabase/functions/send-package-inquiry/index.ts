import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { BaseEmail, EmailCard, EmailButton, styles } from "../_shared/email-components.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PackageInquiryRequest {
  packageName: string;
  packagePrice: string;
  packageFeatures: string[];
  userEmail?: string;
  userName?: string;
  userMessage?: string;
}

// React Email Template
const PackageInquiryEmail: React.FC<PackageInquiryRequest> = (props) => 
  React.createElement(BaseEmail, { previewText: `Nouvelle demande de forfait ${props.packageName} de ${props.userName}` },
    React.createElement('h1', { style: styles.h1 }, "Nouvelle Demande de Forfait"),
    
    React.createElement('p', { style: styles.p }, "Bonjour l'équipe CIARA,"),
    
    React.createElement('p', { style: styles.p }, 
      "Vous avez reçu une nouvelle demande de renseignements pour un forfait via le site web."
    ),

    React.createElement(EmailCard, { title: `${props.packageName} - ${props.packagePrice}` },
      React.createElement('h3', { style: styles.h3 }, "Fonctionnalités incluses :"),
      React.createElement('ul', { style: { color: '#475569', lineHeight: '1.6', margin: '0', paddingLeft: '20px' } },
        ...props.packageFeatures.map((feature, index) => 
          React.createElement('li', { key: index, style: { marginBottom: '8px' } }, feature)
        )
      )
    ),

    React.createElement(EmailCard, { title: "Informations du Prospect" },
      React.createElement('p', { style: styles.p },
        React.createElement('strong', { style: styles.strong }, "Nom : "),
        props.userName || 'Non spécifié'
      ),
      React.createElement('p', { style: styles.p },
        React.createElement('strong', { style: styles.strong }, "Email : "),
        props.userEmail || 'Non spécifié'
      ),
      props.userMessage && React.createElement('div', {},
        React.createElement('h3', { style: styles.h3 }, "Message :"),
        React.createElement('p', { style: styles.p }, props.userMessage)
      )
    ),

    React.createElement(EmailCard, { title: "Ce que CIARA fait pour vous" },
      React.createElement('div', { style: { color: '#047857' } },
        React.createElement('p', { style: styles.p },
          React.createElement('strong', { style: styles.strong }, "🎯 Création de contenu : "),
          "Nous créons 90% de votre contenu"
        ),
        React.createElement('p', { style: styles.p },
          React.createElement('strong', { style: styles.strong }, "⚙️ Configuration technique : "),
          "Infrastructure technique complète"
        ),
        React.createElement('p', { style: styles.p },
          React.createElement('strong', { style: styles.strong }, "🎮 Gamification : "),
          "Système complet de points et récompenses"
        ),
        React.createElement('p', { style: styles.p },
          React.createElement('strong', { style: styles.strong }, "📊 Analytics : "),
          "Insights détaillés d'engagement"
        )
      )
    ),

    React.createElement('div', { style: { textAlign: 'center', margin: '32px 0' } },
      React.createElement(EmailButton, { href: `mailto:${props.userEmail}` },
        "Répondre au Prospect"
      )
    ),

    React.createElement(EmailCard, { title: "Prochaines étapes" },
      React.createElement('p', { style: styles.p }, 
        "Notre équipe va contacter ce prospect sous 24h pour discuter de ses besoins spécifiques."
      ),
      React.createElement('p', { style: styles.p },
        React.createElement('strong', { style: styles.strong }, "Contact :"),
        React.createElement('br'),
        "📞 +41 79 301 79 15",
        React.createElement('br'),
        "📧 info@ciara.city"
      )
    )
  );

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      packageName, 
      packagePrice, 
      packageFeatures, 
      userEmail = "prospect@example.com",
      userName = "Prospect CIARA",
      userMessage = ""
    }: PackageInquiryRequest = await req.json();


    // Render React Email template
    const htmlContent = await renderAsync(
      React.createElement(PackageInquiryEmail, {
        packageName,
        packagePrice,
        packageFeatures,
        userEmail,
        userName,
        userMessage
      })
    );

    // Send email to CIARA team
    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: ["info@ciara.city"],
      subject: `Nouvelle demande forfait ${packageName} - ${userName}`,
      html: htmlContent,
    });


    return new Response(JSON.stringify({ 
      success: true, 
      message: "Demande envoyée avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);