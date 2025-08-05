import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { BaseEmailI18n, EmailCard, EmailButton, styles, t } from "../_shared/email-i18n-components.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InactiveUser {
  user_id: string;
  email: string;
  full_name: string;
  last_activity: string;
  days_inactive: number;
  incomplete_journeys: Array<{
    name: string;
    progress: number;
    city_name: string;
  }>;
  preferred_language: string;
}

// Inactive Reminder Email Template
const InactiveReminderEmailI18n: React.FC<{user: InactiveUser, lang: 'fr' | 'en'}> = ({ user, lang }) => 
  React.createElement(BaseEmailI18n, { 
    previewText: `${user.full_name}, we miss you on CIARA!`,
    lang 
  },
    React.createElement('h1', { style: styles.h1 }, 
      lang === 'fr' 
        ? `${user.full_name}, vous nous manquez sur CIARA !`
        : `${user.full_name}, we miss you on CIARA!`
    ),
    
    React.createElement('p', { style: styles.p },
      lang === 'fr'
        ? `Cela fait ${user.days_inactive} jours que nous ne vous avons pas vu explorer de nouvelles destinations. Vos aventures CIARA vous attendent !`
        : `It's been ${user.days_inactive} days since we've seen you explore new destinations. Your CIARA adventures are waiting for you!`
    ),

    user.incomplete_journeys.length > 0 && React.createElement(EmailCard, { 
      title: lang === 'fr' ? "🗺️ Vos parcours en cours" : "🗺️ Your ongoing journeys"
    },
      React.createElement('div', {},
        ...user.incomplete_journeys.map((journey, index) => 
          React.createElement('div', { 
            key: index,
            style: { 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px', 
              margin: '8px 0',
              border: '1px solid #e2e8f0'
            }
          },
            React.createElement('p', { style: { ...styles.p, margin: '0 0 4px 0', fontWeight: '600' } },
              `${journey.name} (${journey.city_name})`
            ),
            React.createElement('div', { style: { 
              backgroundColor: '#e2e8f0', 
              height: '8px', 
              borderRadius: '4px',
              overflow: 'hidden'
            }},
              React.createElement('div', { style: {
                backgroundColor: '#667eea',
                height: '100%',
                width: `${journey.progress}%`,
                borderRadius: '4px'
              }})
            ),
            React.createElement('p', { style: { ...styles.p, margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' } },
              lang === 'fr' ? `${journey.progress}% complété` : `${journey.progress}% completed`
            )
          )
        )
      )
    ),

    React.createElement('div', { style: { textAlign: 'center', margin: '32px 0' } },
      React.createElement(EmailButton, { href: 'https://ciara.city/' },
        lang === 'fr' ? "🚀 Reprendre l'aventure" : "🚀 Resume the adventure"
      )
    ),

    React.createElement(EmailCard, { 
      title: lang === 'fr' ? "🎁 Offre spéciale de retour" : "🎁 Special comeback offer"
    },
      React.createElement('p', { style: styles.p },
        lang === 'fr'
          ? "Pour célébrer votre retour, nous vous offrons 25 points bonus dès votre prochaine connexion !"
          : "To celebrate your return, we're offering you 25 bonus points on your next login!"
      ),
      React.createElement('p', { style: { ...styles.p, fontSize: '14px', color: '#94a3b8' } },
        lang === 'fr'
          ? "Offre valable pendant 7 jours"
          : "Offer valid for 7 days"
      )
    ),

    React.createElement('p', { style: { 
      color: '#94a3b8', 
      fontSize: '12px', 
      textAlign: 'center',
      marginTop: '32px'
    }},
      lang === 'fr'
        ? "Vous recevez cet email car vous êtes inscrit à CIARA. Vous pouvez vous désinscrire à tout moment."
        : "You're receiving this email because you're registered with CIARA. You can unsubscribe at any time."
    )
  );

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting inactive users reminder process...');

    // Get users who haven't been active for 7+ days
    const { data: inactiveUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        full_name,
        preferred_languages,
        updated_at
      `)
      .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('role', 'visitor')
      .not('email', 'is', null);

    if (usersError) {
      throw new Error(`Error fetching inactive users: ${usersError.message}`);
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      console.log('📊 No inactive users found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No inactive users found',
        count: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`📊 Found ${inactiveUsers.length} inactive users`);

    let sentEmails = 0;
    const errors: string[] = [];

    for (const user of inactiveUsers) {
      try {
        // Get incomplete journeys for this user
        const { data: incompleteJourneys } = await supabase
          .from('user_journey_progress')
          .select(`
            journey_id,
            progress_percentage,
            journeys!inner(name, cities!inner(name))
          `)
          .eq('user_id', user.user_id)
          .eq('is_completed', false)
          .limit(3);

        const daysInactive = Math.floor(
          (Date.now() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        const userLang = user.preferred_languages?.[0] === 'en' ? 'en' : 'fr';

        const inactiveUser: InactiveUser = {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name || 'Voyageur',
          last_activity: user.updated_at,
          days_inactive: daysInactive,
          incomplete_journeys: incompleteJourneys?.map(ij => ({
            name: ij.journeys?.name || 'Parcours',
            progress: ij.progress_percentage || 0,
            city_name: ij.journeys?.cities?.name || 'Ville'
          })) || [],
          preferred_language: userLang
        };

        // Render email template
        const emailHtml = await renderAsync(
          React.createElement(InactiveReminderEmailI18n, { 
            user: inactiveUser, 
            lang: userLang 
          })
        );

        // Send email
        const emailResponse = await resend.emails.send({
          from: "CIARA <info@ciara.city>",
          to: [user.email],
          subject: userLang === 'fr' 
            ? `${user.full_name}, vos aventures CIARA vous attendent !`
            : `${user.full_name}, your CIARA adventures await!`,
          html: emailHtml,
        });

        if (emailResponse.data?.id) {
          sentEmails++;
          console.log(`✅ Sent inactive reminder to: ${user.email}`);
        }

      } catch (error) {
        const errorMsg = `Failed to send to ${user.email}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`📧 Inactive reminder process completed: ${sentEmails} emails sent, ${errors.length} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${sentEmails} inactive reminder emails`,
      count: sentEmails,
      total_inactive: inactiveUsers.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Error in inactive reminder process:", error);
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