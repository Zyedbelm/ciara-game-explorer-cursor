import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { BaseEmailI18n, EmailCard, EmailButton, t } from "../_shared/email-i18n-components.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPreviewRequest {
  template: 'welcome' | 'partner-welcome' | 'partner-offer' | 'email-confirmation' | 'package-inquiry' | 'inactive-reminder' | 'new-reward';
  lang?: 'fr' | 'en';
  data?: Record<string, any>;
}

// Mock data for different templates
const getMockData = (template: string) => {
  const mockData = {
    welcome: {
      userName: "Marie Dubois",
      email: "marie.dubois@example.com",
      loginUrl: "https://ciara.city/auth"
    },
    'partner-welcome': {
      partnerName: "Restaurant Le Petit Gourmet",
      partnerEmail: "contact@petitgourmet.com",
      cityName: "Lausanne",
      contactEmail: "marie@tourisme-lausanne.ch",
      contactName: "Marie Tourisme"
    },
    'partner-offer': {
      partnerName: "Restaurant Le Petit Gourmet",
      partnerEmail: "contact@petitgourmet.com",
      offerTitle: "Menu découverte -20%",
      offerDescription: "Découvrez notre menu 3 services avec une réduction de 20%",
      pointsRequired: 150,
      validityDays: 30,
      maxRedemptions: 50,
      cityName: "Lausanne",
      createdBy: "Admin Lausanne"
    },
    'email-confirmation': {
      email: "marie.dubois@example.com",
      confirmationUrl: "https://ciara.city/confirm-email?token=abc123",
      name: "Marie Dubois"
    },
    'package-inquiry': {
      packageName: "CIARA Professional",
      packagePrice: "CHF 35'000/an",
      packageFeatures: [
        "Parcours illimités selon besoins",
        "Personnalisation avancée : branding complet",
        "Support prioritaire : téléphone, 24h",
        "Gamification avancée : 15 partenaires, badges spéciaux"
      ],
      userEmail: "directeur@tourisme-geneve.ch",
      userName: "Jean-Pierre Martin",
      userMessage: "Nous aimerions discuter d'une implémentation pour Genève avec 50'000 visiteurs attendus."
    },
    'inactive-reminder': {
      user: {
        user_id: "123",
        email: "marie.dubois@example.com",
        full_name: "Marie Dubois",
        last_activity: "2024-01-15T10:00:00Z",
        days_inactive: 10,
        incomplete_journeys: [
          { name: "Patrimoine de Lausanne", progress: 65, city_name: "Lausanne" },
          { name: "Gastronomie Locale", progress: 30, city_name: "Lausanne" }
        ],
        preferred_language: "fr"
      }
    },
    'new-reward': {
      user: {
        user_id: "123",
        email: "marie.dubois@example.com",
        full_name: "Marie Dubois",
        city_id: "city-123",
        preferred_language: "fr",
        total_points: 250
      },
      reward: {
        id: "reward-123",
        title: "Dégustation de vins gratuite",
        description: "Une dégustation gratuite de 3 vins locaux avec explications du sommelier",
        points_required: 200,
        city_name: "Lausanne",
        partner_name: "Cave du Château",
        value_description: "Valeur 35 CHF"
      }
    }
  };

  return mockData[template] || {};
};

// Import email components dynamically based on template
const renderEmailTemplate = async (template: string, data: any, lang: 'fr' | 'en') => {
  switch (template) {
    case 'welcome':
      const WelcomeEmail = ({ userName, email, loginUrl, lang }: any) => 
        React.createElement(BaseEmailI18n, { 
          previewText: t('welcome.title', lang, { userName }),
          lang 
        },
          React.createElement('h1', { style: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 24px 0' } }, 
            t('welcome.title', lang, { userName })
          ),
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            t('welcome.description', lang)
          ),
          React.createElement(EmailCard, { title: t('welcome.features_title', lang) },
            React.createElement('ul', { style: { color: '#475569', lineHeight: '1.6', margin: '0', paddingLeft: '20px' } },
              React.createElement('li', { style: { marginBottom: '8px' } }, t('welcome.feature_1', lang)),
              React.createElement('li', { style: { marginBottom: '8px' } }, t('welcome.feature_2', lang))
            )
          ),
          React.createElement('div', { style: { textAlign: 'center', margin: '32px 0' } },
            React.createElement(EmailButton, { href: loginUrl },
              t('welcome.cta_button', lang)
            )
          )
        );
      
      return await renderAsync(React.createElement(WelcomeEmail, { ...data, lang }));

    case 'partner-welcome':
      const PartnerWelcomeEmail = ({ partnerName, cityName, lang }: any) => 
        React.createElement(BaseEmailI18n, { 
          previewText: `Bienvenue dans le réseau CIARA - ${cityName}`,
          lang 
        },
          React.createElement('h1', { style: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 24px 0' } }, 
            "Bienvenue dans le réseau de partenaires CIARA !"
          ),
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            `Bonjour ${partnerName}, nous sommes ravis de vous accueillir à ${cityName}.`
          ),
          React.createElement(EmailCard, { title: "Vos avantages" },
            React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569' } },
              "Visibilité accrue, augmentation du trafic client, intégration dans les parcours gamifiés."
            )
          )
        );
      
      return await renderAsync(React.createElement(PartnerWelcomeEmail, { ...data, lang }));

    default:
      // Generic preview template
      const GenericEmail = ({ template, data, lang }: any) => 
        React.createElement(BaseEmailI18n, { 
          previewText: `Prévisualisation du template ${template}`,
          lang 
        },
          React.createElement('h1', { style: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 24px 0' } }, 
            `Prévisualisation - ${template}`
          ),
          React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px 0' } },
            "Ceci est une prévisualisation du template email."
          ),
          React.createElement(EmailCard, { title: "Données du template" },
            React.createElement('pre', { 
              style: { 
                fontSize: '12px', 
                backgroundColor: '#f8fafc', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto'
              } 
            }, JSON.stringify(data, null, 2))
          )
        );
      
      return await renderAsync(React.createElement(GenericEmail, { template, data, lang }));
  }
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
    const { template, lang = 'fr', data: customData }: EmailPreviewRequest = await req.json();

    if (!template) {
      return new Response(
        JSON.stringify({ error: "Template name is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`📧 Generating preview for template: ${template} (${lang})`);

    // Use custom data if provided, otherwise use mock data
    const templateData = customData || getMockData(template);

    // Render the email template
    const emailHtml = await renderEmailTemplate(template, templateData, lang);

    // Return the rendered HTML for preview
    return new Response(emailHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error generating email preview:", error);
    
    // Return error as HTML for better preview experience
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erreur de prévisualisation</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f8fafc; }
          .error { background: #fecaca; border: 1px solid #dc2626; padding: 20px; border-radius: 8px; }
          .error h1 { color: #dc2626; margin: 0 0 16px 0; }
          .error pre { background: #f3f4f6; padding: 12px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Erreur de prévisualisation</h1>
          <p>Impossible de générer la prévisualisation du template.</p>
          <pre>${error.message}</pre>
        </div>
      </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
};

serve(handler);