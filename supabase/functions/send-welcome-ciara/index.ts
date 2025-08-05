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

interface WelcomeEmailRequest {
  userName: string;
  email: string;
  loginUrl?: string;
}

// Bilingual CIARA Welcome Email Template
const BilingualWelcomeEmail: React.FC<WelcomeEmailRequest> = (props) => {
  return React.createElement(BilingualEmailTemplate, { 
    previewText: `Bienvenue sur CIARA ${props.userName} • Welcome to CIARA ${props.userName}`
  },
    // Welcome icon
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
        React.createElement('span', { style: { fontSize: '32px', color: 'white' } }, "🎉")
      )
    ),
    
    // Bilingual title section
    React.createElement(BilingualSection, {
      frenchContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, `Bienvenue ${props.userName} !`),
        React.createElement('p', { style: textStyles.p }, 
          "Félicitations ! Votre compte CIARA est maintenant activé. Vous êtes prêt à découvrir une nouvelle façon d'explorer les destinations avec notre plateforme de tourisme intelligent et gamifié."
        )
      ),
      englishContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, `Welcome ${props.userName}!`),
        React.createElement('p', { style: textStyles.p }, 
          "Congratulations! Your CIARA account is now activated. You're ready to discover a new way to explore destinations with our intelligent and gamified tourism platform."
        )
      )
    }),

    // Features section
    React.createElement(BilingualEmailCard, { title: "🌟 Découvrez CIARA • Discover CIARA" },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('ul', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "🗺️ Parcours personnalisés générés par IA"),
          React.createElement('li', { style: textStyles.listItem }, "🎮 Système de points et récompenses"),
          React.createElement('li', { style: textStyles.listItem }, "🏆 Défis et quizzes interactifs"),
          React.createElement('li', { style: textStyles.listItem }, "📱 Navigation GPS intégrée"),
          React.createElement('li', { style: textStyles.listItem }, "🎁 Réductions chez nos partenaires locaux")
        ),
        englishContent: React.createElement('ul', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "🗺️ AI-generated personalized journeys"),
          React.createElement('li', { style: textStyles.listItem }, "🎮 Points and rewards system"),
          React.createElement('li', { style: textStyles.listItem }, "🏆 Interactive challenges and quizzes"),
          React.createElement('li', { style: textStyles.listItem }, "📱 Integrated GPS navigation"),
          React.createElement('li', { style: textStyles.listItem }, "🎁 Discounts at local partners")
        )
      })
    ),

    // CTA Button
    React.createElement('div', { style: { textAlign: 'center', margin: '40px 0' } },
      React.createElement(BilingualEmailButton, { href: props.loginUrl || 'https://ciara.city/auth' },
        "🚀 Commencer l'aventure • Start the adventure"
      )
    ),

    // Next steps
    React.createElement(BilingualEmailCard, { title: "📋 Prochaines étapes • Next Steps" },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('ol', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "Connectez-vous à votre compte"),
          React.createElement('li', { style: textStyles.listItem }, "Choisissez votre première destination"),
          React.createElement('li', { style: textStyles.listItem }, "Générez votre parcours personnalisé"),
          React.createElement('li', { style: textStyles.listItem }, "Commencez à explorer et gagner des points !")
        ),
        englishContent: React.createElement('ol', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "Log in to your account"),
          React.createElement('li', { style: textStyles.listItem }, "Choose your first destination"),
          React.createElement('li', { style: textStyles.listItem }, "Generate your personalized journey"),
          React.createElement('li', { style: textStyles.listItem }, "Start exploring and earning points!")
        )
      })
    ),

    // Bonus section
    React.createElement(BilingualEmailCard, { variant: 'warning' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('p', { style: { ...textStyles.p, margin: '0', fontWeight: '600' } },
          "🎁 Bonus de bienvenue : 10 points offerts pour commencer votre aventure !"
        ),
        englishContent: React.createElement('p', { style: { ...textStyles.p, margin: '0', fontWeight: '600' } },
          "🎁 Welcome bonus: 10 points offered to start your adventure!"
        )
      })
    ),

    // Help section
    React.createElement('div', { style: { textAlign: 'center', marginTop: '30px' } },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Des questions ? Nous sommes là pour vous aider !"),
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
          React.createElement('p', { style: textStyles.small }, "Questions? We're here to help!"),
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
    ),

    // Pro tip
    React.createElement(BilingualEmailCard, { variant: 'info' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('p', { style: { ...textStyles.small, margin: '0' } },
          "💡 Conseil : Téléchargez l'app mobile pour profiter de toutes les fonctionnalités même hors ligne !"
        ),
        englishContent: React.createElement('p', { style: { ...textStyles.small, margin: '0' } },
          "💡 Tip: Download the mobile app to enjoy all features even offline!"
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
    const { userName, email, loginUrl }: WelcomeEmailRequest = await req.json();

    if (!userName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`📧 Sending bilingual CIARA welcome email to: ${email}`);

    const finalLoginUrl = loginUrl || 'https://ciara.city/auth';

    // Render the React Email template
    const emailHtml = await renderAsync(
      React.createElement(BilingualWelcomeEmail, { 
        userName, 
        email, 
        loginUrl: finalLoginUrl
      })
    );

    // Send the email with bilingual subject
    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: `🎉 Bienvenue sur CIARA ${userName} • Welcome to CIARA ${userName}`,
      html: emailHtml,
    });

    console.log("✅ Bilingual CIARA welcome email sent successfully:", emailResponse);

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
    console.error("❌ Error sending bilingual CIARA welcome email:", error);
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