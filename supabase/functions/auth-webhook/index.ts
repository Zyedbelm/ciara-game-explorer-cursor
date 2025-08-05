import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

// Initialize Supabase client for calling edge functions
const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Extract webhook secret with proper error handling
const rawHookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET");
let hookSecret: string | null = null;

if (rawHookSecret) {
  // Handle the format "v1,whsec_<base64>" or just the secret part
  if (rawHookSecret.startsWith("whsec_")) {
    hookSecret = rawHookSecret;
  } else if (rawHookSecret.includes("whsec_")) {
    // Extract just the whsec_ part
    const parts = rawHookSecret.split(",");
    const secretPart = parts.find(part => part.trim().startsWith("whsec_"));
    hookSecret = secretPart ? secretPart.trim() : null;
  } else {
    // If it doesn't contain whsec_, it might be the raw secret
    hookSecret = rawHookSecret;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("🚀 Auth webhook triggered:", req.method, "URL:", req.url);
  console.log("🔑 Raw hook secret available:", !!rawHookSecret);
  console.log("🔑 Processed hook secret available:", !!hookSecret);
  if (hookSecret) {
    console.log("🔑 Hook secret format:", hookSecret.substring(0, 10) + "...");
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    console.error("❌ Method not allowed:", req.method);
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log("📧 Webhook payload received, length:", payload.length);
    console.log("📋 Headers:", Object.keys(headers));
    
    if (!hookSecret) {
      console.error("🔑 AUTH_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    if (!supabaseServiceKey) {
      console.error("🔑 SUPABASE_SERVICE_ROLE_KEY not configured");
      return new Response("Supabase service key not configured", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log("🔐 Verifying webhook signature...");
    const wh = new Webhook(hookSecret);
    
    let webhookData;
    try {
      webhookData = wh.verify(payload, headers);
    } catch (verifyError) {
      console.error("❌ Webhook verification failed:", verifyError);
      return new Response("Invalid webhook signature", { 
        status: 401,
        headers: corsHeaders 
      });
    }

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

    console.log("✅ Webhook verified successfully");
    console.log("📩 Email action type:", email_action_type);
    console.log("👤 User email:", user.email);
    console.log("🔗 Original redirect_to:", redirect_to);
    console.log("🌐 Site URL:", site_url);

    // Always redirect to ciara.city regardless of original redirect_to
    const CIARA_DOMAIN = "https://ciara.city";
    console.log("🎯 Forced redirect domain:", CIARA_DOMAIN);
    
    // Extract user name from email for personalization
    const userName = user.email.split('@')[0];

    if (email_action_type === "signup") {
      console.log("📝 Processing signup confirmation email (bilingual)");
      
      // Generate confirmation URL
      const baseUrl = site_url.replace('/auth/v1', '');
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk";
      const confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(CIARA_DOMAIN + "/")}&apikey=${supabaseAnonKey}`;
      
      console.log("🔗 Confirmation URL generated:", confirmationUrl);
      
      // Call the dedicated bilingual email confirmation function
      try {
        const { data, error } = await supabase.functions.invoke('send-email-confirmation', {
          body: {
            email: user.email,
            confirmationUrl: confirmationUrl,
            name: userName
          }
        });
        
        if (error) {
          throw error;
        }
        
        console.log("✅ Bilingual email confirmation sent via dedicated function");
        
        return new Response(JSON.stringify({ 
          success: true, 
          email_id: data?.id,
          action_type: email_action_type,
          recipient: user.email,
          template: 'bilingual'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
        
      } catch (error) {
        console.error("❌ Error calling email confirmation function:", error);
        throw new Error(`Failed to send signup email: ${error.message}`);
      }
      
    } else if (email_action_type === "recovery") {
      console.log("🔐 Processing password recovery email (bilingual)");
      
      // Generate reset URL
      const baseUrl = site_url.replace('/auth/v1', '');
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk";
      const resetUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(CIARA_DOMAIN + "/reset-password")}&apikey=${supabaseAnonKey}`;
      
      console.log("🔗 Reset URL generated:", resetUrl);
      
      // Call the dedicated bilingual password reset function
      try {
        const { data, error } = await supabase.functions.invoke('send-password-reset', {
          body: {
            email: user.email,
            resetUrl: resetUrl,
            name: userName
          }
        });
        
        if (error) {
          throw error;
        }
        
        console.log("✅ Bilingual password reset email sent via dedicated function");
        
        return new Response(JSON.stringify({ 
          success: true, 
          email_id: data?.id,
          action_type: email_action_type,
          recipient: user.email,
          template: 'bilingual'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
        
      } catch (error) {
        console.error("❌ Error calling password reset function:", error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }
      
    } else if (email_action_type === "magiclink") {
      console.log("🪄 Processing Magic Link email - sending custom email");
      
      // Generate magic link URL
      const baseUrl = site_url.replace('/auth/v1', '');
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk";
      const magicLinkUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(CIARA_DOMAIN + "/profile")}&apikey=${supabaseAnonKey}`;
      
      console.log("🔗 Magic Link URL generated:", magicLinkUrl);
      
      // Call the dedicated magic link function
      try {
        const { data, error } = await supabase.functions.invoke('send-magic-link', {
          body: {
            email: user.email,
            magicLinkUrl: magicLinkUrl,
            name: userName
          }
        });
        
        if (error) {
          throw error;
        }
        
        console.log("✅ Magic Link email sent via dedicated magic link function");
        
        return new Response(JSON.stringify({ 
          success: true, 
          email_id: data?.id,
          action_type: email_action_type,
          recipient: user.email,
          template: 'magic_link_bilingual'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
        
      } catch (error) {
        console.error("❌ Error calling magic link function:", error);
        throw new Error(`Failed to send magic link email: ${error.message}`);
      }
      
    } else {
      console.error("❌ Unknown email action type:", email_action_type);
      return new Response(
        JSON.stringify({ error: "Unknown email action type: " + email_action_type }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

  } catch (error) {
    console.error("💥 General webhook error:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || "Unknown error occurred",
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});