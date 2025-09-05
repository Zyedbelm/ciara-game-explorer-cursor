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

interface MagicLinkRequest {
  email: string;
  userName?: string;
}

// Template Email Magic Link Bilingue
const BilingualMagicLinkEmail: React.FC<{ email: string; magicUrl: string; userName?: string }> = (props) => {
  return React.createElement(BilingualEmailTemplate, { 
    previewText: `Connexion magique CIARA ${props.userName || ''} • CIARA Magic Link ${props.userName || ''}`
  },
    // Magic icon
    React.createElement('div', { style: { textAlign: 'center', marginBottom: '30px' } },
      React.createElement('div', { 
        style: { 
          display: 'inline-block', 
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto' 
        } 
      },
        React.createElement('span', { style: { fontSize: '32px', color: 'white' } }, "✨")
      )
    ),
    
    // Title section
    React.createElement(BilingualSection, {
      frenchContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, 
          props.userName ? `Bonjour ${props.userName} !` : 'Connexion magique'
        ),
        React.createElement('p', { style: textStyles.p }, 
          "Voici votre lien de connexion magique pour accéder à CIARA. Un clic et vous êtes connecté !"
        )
      ),
      englishContent: React.createElement('div', {},
        React.createElement('h1', { style: textStyles.h1 }, 
          props.userName ? `Hello ${props.userName}!` : 'Magic Link'
        ),
        React.createElement('p', { style: textStyles.p }, 
          "Here's your magic link to access CIARA. One click and you're logged in!"
        )
      )
    }),

    // Magic features
    React.createElement(BilingualEmailCard, { title: "✨ Pourquoi magique ? • Why is it magic?" },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('ul', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "🚀 Connexion instantanée sans mot de passe"),
          React.createElement('li', { style: textStyles.listItem }, "🔐 100% sécurisé et chiffré"),
          React.createElement('li', { style: textStyles.listItem }, "⚡ Plus rapide qu'un formulaire de connexion"),
          React.createElement('li', { style: textStyles.listItem }, "📱 Fonctionne sur tous vos appareils")
        ),
        englishContent: React.createElement('ul', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "🚀 Instant login without password"),
          React.createElement('li', { style: textStyles.listItem }, "🔐 100% secure and encrypted"),
          React.createElement('li', { style: textStyles.listItem }, "⚡ Faster than a login form"),
          React.createElement('li', { style: textStyles.listItem }, "📱 Works on all your devices")
        )
      })
    ),

    // CTA Button
    React.createElement('div', { style: { textAlign: 'center', margin: '40px 0' } },
      React.createElement(BilingualEmailButton, { 
        href: props.magicUrl,
        style: { backgroundColor: '#8b5cf6' }
      },
        "✨ Connexion magique • Magic Login"
      )
    ),

    // Warning card
    React.createElement(BilingualEmailCard, { variant: 'warning' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.p, margin: '0', fontWeight: '600' } },
            "⏱️ Ce lien magique expire dans 1 heure"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '8px 0 0 0' } },
            "Il ne peut être utilisé qu'une seule fois. Si vous n'avez pas demandé ce lien, ignorez cet email."
          )
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.p, margin: '0', fontWeight: '600' } },
            "⏱️ This magic link expires in 1 hour"
          ),
          React.createElement('p', { style: { ...textStyles.small, margin: '8px 0 0 0' } },
            "It can only be used once. If you didn't request this link, ignore this email."
          )
        )
      })
    ),

    // Next steps
    React.createElement(BilingualEmailCard, { title: "🎯 Que faire ensuite ? • What's next?" },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('ol', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "Cliquez sur le bouton magique ci-dessus"),
          React.createElement('li', { style: textStyles.listItem }, "Vous serez automatiquement connecté"),
          React.createElement('li', { style: textStyles.listItem }, "Explorez vos destinations et parcours"),
          React.createElement('li', { style: textStyles.listItem }, "Gagnez des points et débloquez des récompenses !")
        ),
        englishContent: React.createElement('ol', { style: textStyles.list },
          React.createElement('li', { style: textStyles.listItem }, "Click the magic button above"),
          React.createElement('li', { style: textStyles.listItem }, "You'll be automatically logged in"),
          React.createElement('li', { style: textStyles.listItem }, "Explore your destinations and journeys"),
          React.createElement('li', { style: textStyles.listItem }, "Earn points and unlock rewards!")
        )
      })
    ),

    // Alternative login
    React.createElement(BilingualEmailCard, { variant: 'info' },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 8px 0' } },
            "💡 Alternative : Vous pouvez aussi vous connecter avec votre mot de passe habituel"
          ),
          React.createElement('a', { 
            href: "https://ciara.city/auth", 
            style: { 
              color: '#8b5cf6', 
              textDecoration: 'none', 
              fontWeight: '500',
              fontSize: '14px'
            } 
          }, "🔐 Connexion classique")
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: { ...textStyles.small, margin: '0 0 8px 0' } },
            "💡 Alternative: You can also log in with your usual password"
          ),
          React.createElement('a', { 
            href: "https://ciara.city/auth", 
            style: { 
              color: '#8b5cf6', 
              textDecoration: 'none', 
              fontWeight: '500',
              fontSize: '14px'
            } 
          }, "🔐 Classic login")
        )
      })
    ),

    // Help section
    React.createElement('div', { style: { textAlign: 'center', marginTop: '30px' } },
      React.createElement(BilingualSection, {
        frenchContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Problème avec la connexion magique ?"),
          React.createElement('a', { 
            href: "mailto:info@ciara.city", 
            style: { 
              color: '#8b5cf6', 
              textDecoration: 'none', 
              fontWeight: '500' 
            } 
          }, "📧 Support CIARA")
        ),
        englishContent: React.createElement('div', {},
          React.createElement('p', { style: textStyles.small }, "Problem with magic login?"),
          React.createElement('a', { 
            href: "mailto:info@ciara.city", 
            style: { 
              color: '#8b5cf6', 
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
    const { email, userName }: MagicLinkRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('✨ Magic link custom pour:', email);

    // Créer client Supabase pour générer le magic link
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
      ? 'http://localhost:8080/profile'
      : 'https://ciara.city/profile';

    console.log('🔗 URL de redirection:', redirectUrl);

    // Générer le magic link
    const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (magicError) {
      console.error('❌ Erreur génération magic link:', magicError);
      return new Response(
        JSON.stringify({ error: "Failed to generate magic link" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const magicUrl = magicData.properties.action_link;
    console.log('✅ Magic link généré');

    // Render le template React Email
    const emailHtml = await renderAsync(
      React.createElement(BilingualMagicLinkEmail, { 
        email,
        magicUrl,
        userName
      })
    );

    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: "CIARA <info@ciara.city>",
      to: [email],
      subject: `✨ Connexion magique CIARA ${userName || ''} • CIARA Magic Link ${userName || ''}`,
      html: emailHtml,
    });

    console.log('📧 Magic link envoyé via Resend');

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: "Magic link sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur send-magic-link-custom:', error);
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