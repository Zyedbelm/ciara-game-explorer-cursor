import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

// Configuration sécurisée
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Validation des variables d'environnement critiques
if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Extraction sécurisée du secret webhook
const rawHookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET");
let hookSecret: string | null = null;

if (rawHookSecret) {
  if (rawHookSecret.startsWith("whsec_")) {
    hookSecret = rawHookSecret;
  } else if (rawHookSecret.includes("whsec_")) {
    const parts = rawHookSecret.split(",");
    const secretPart = parts.find(part => part.trim().startsWith("whsec_"));
    hookSecret = secretPart ? secretPart.trim() : null;
  } else {
    hookSecret = rawHookSecret;
  }
}

// Headers CORS sécurisés
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://ciara.city',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Validation des entrées
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateToken = (token: string): boolean => {
  return token && token.length > 0 && token.length < 1000;
};

// Fonction de logging sécurisée
const secureLog = (message: string, data?: any) => {
  if (Deno.env.get("NODE_ENV") === "development") {
  }
};

serve(async (req) => {
  const startTime = Date.now();
  
  // Gestion des requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  // Validation de la méthode HTTP
  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    // Validation du secret webhook
    if (!hookSecret) {
      secureLog("AUTH_WEBHOOK_SECRET non configuré");
      return new Response("Webhook secret not configured", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Lecture et validation du payload
    const payload = await req.text();
    if (!payload || payload.length > 10000) {
      return new Response("Invalid payload", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const headers = Object.fromEntries(req.headers);
    
    // Vérification de la signature webhook
    const wh = new Webhook(hookSecret);
    
    let webhookData;
    try {
      webhookData = wh.verify(payload, headers);
    } catch (verifyError) {
      secureLog("Échec de vérification webhook:", { error: verifyError.message });
      return new Response("Invalid webhook signature", { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Validation des données webhook
    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = webhookData as {
      user: { email: string };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

    // Validation des données critiques
    if (!user?.email || !validateEmail(user.email)) {
      return new Response("Invalid user email", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (!validateToken(token_hash)) {
      return new Response("Invalid token", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (!email_action_type || !['signup', 'recovery', 'magiclink'].includes(email_action_type)) {
      return new Response("Invalid email action type", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Configuration sécurisée
    const CIARA_DOMAIN = "https://ciara.city";
    const userName = user.email.split('@')[0];
    const baseUrl = site_url.replace('/auth/v1', '');
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseAnonKey) {
      throw new Error("SUPABASE_ANON_KEY manquante");
    }

    // Traitement selon le type d'action
    let functionName: string;
    let functionData: any;
    let confirmationUrl: string;

    switch (email_action_type) {
      case "signup":
        secureLog("Traitement email d'inscription");
        functionName = 'send-email-confirmation';
        confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(CIARA_DOMAIN + "/")}&apikey=${supabaseAnonKey}`;
        functionData = {
          email: user.email,
          confirmationUrl: confirmationUrl,
          name: userName
        };
        break;

      case "recovery":
        secureLog("Traitement email de récupération");
        functionName = 'send-password-reset';
        confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(CIARA_DOMAIN + "/reset-password")}&apikey=${supabaseAnonKey}`;
        functionData = {
          email: user.email,
          resetUrl: confirmationUrl,
          name: userName
        };
        break;

      case "magiclink":
        secureLog("Traitement Magic Link");
        functionName = 'send-magic-link';
        confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(CIARA_DOMAIN + "/profile")}&apikey=${supabaseAnonKey}`;
        functionData = {
          email: user.email,
          magicLinkUrl: confirmationUrl,
          name: userName
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Type d'action email non supporté" }), 
          { 
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
    }

    // Appel de la fonction Edge correspondante
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: functionData
    });
    
    if (error) {
      throw error;
    }

    const responseTime = Date.now() - startTime;
    secureLog(`Email ${email_action_type} envoyé avec succès`, { 
      recipient: user.email, 
      responseTime 
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      email_id: data?.id,
      action_type: email_action_type,
      recipient: user.email,
      template: email_action_type === 'magiclink' ? 'magic_link_bilingual' : 'bilingual',
      response_time: responseTime
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    secureLog("Erreur webhook:", { 
      error: error.message, 
      responseTime 
    });

    return new Response(
      JSON.stringify({
        error: {
          message: "Erreur interne du serveur",
          timestamp: new Date().toISOString(),
          response_time: responseTime
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});