import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    return new Response(JSON.stringify({
      env_check: {
        RESEND_API_KEY: resendKey ? `✅ Present (${resendKey.substring(0, 8)}...)` : "❌ Missing",
        SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `✅ Present (${serviceKey.substring(0, 8)}...)` : "❌ Missing", 
        SUPABASE_URL: supabaseUrl ? `✅ Present (${supabaseUrl})` : "❌ Missing"
      },
      message: "Environment variables check"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
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