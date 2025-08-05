import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { BaseEmailI18n, EmailCard, EmailButton, styles } from "../_shared/email-i18n-components.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewReward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  city_name: string;
  partner_name: string;
  value_description: string;
}

interface UserNotification {
  user_id: string;
  email: string;
  full_name: string;
  city_id: string;
  preferred_language: string;
  total_points: number;
}

// New Reward Notification Email Template
const NewRewardEmailI18n: React.FC<{
  user: UserNotification, 
  reward: NewReward, 
  lang: 'fr' | 'en'
}> = ({ user, reward, lang }) => 
  React.createElement(BaseEmailI18n, { 
    previewText: lang === 'fr' 
      ? `Nouvelle récompense disponible : ${reward.title}`
      : `New reward available: ${reward.title}`,
    lang 
  },
    React.createElement('h1', { style: styles.h1 }, 
      lang === 'fr' 
        ? `Nouvelle récompense disponible, ${user.full_name} !`
        : `New reward available, ${user.full_name}!`
    ),
    
    React.createElement('p', { style: styles.p },
      lang === 'fr'
        ? `Une nouvelle récompense exclusive vient d'être ajoutée à ${reward.city_name}. Avec vos ${user.total_points} points, vous pourriez être éligible !`
        : `A new exclusive reward has just been added to ${reward.city_name}. With your ${user.total_points} points, you might be eligible!`
    ),

    React.createElement(EmailCard, { title: reward.title },
      React.createElement('div', { style: { marginBottom: '16px' } },
        React.createElement('p', { style: { ...styles.p, margin: '0 0 8px 0' } }, reward.description),
        React.createElement('p', { style: { ...styles.p, margin: '0 0 8px 0' } },
          React.createElement('strong', {}, 
            lang === 'fr' ? "Partenaire : " : "Partner: "
          ),
          reward.partner_name
        ),
        React.createElement('p', { style: { ...styles.p, margin: '0' } },
          React.createElement('strong', {}, 
            lang === 'fr' ? "Valeur : " : "Value: "
          ),
          reward.value_description
        )
      ),
      
      React.createElement('div', { style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: user.total_points >= reward.points_required ? '#dcfce7' : '#fef3c7',
        padding: '12px',
        borderRadius: '6px',
        marginTop: '16px'
      }},
        React.createElement('span', { style: { fontWeight: '600' } },
          lang === 'fr' ? "Points requis :" : "Points required:"
        ),
        React.createElement('span', { 
          style: { 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: user.total_points >= reward.points_required ? '#15803d' : '#a16207'
          } 
        }, `${reward.points_required} points`)
      ),

      user.total_points >= reward.points_required && React.createElement('div', { 
        style: { 
          backgroundColor: '#dcfce7', 
          padding: '12px', 
          borderRadius: '6px',
          marginTop: '12px',
          textAlign: 'center'
        }
      },
        React.createElement('p', { style: { ...styles.p, margin: '0', color: '#15803d', fontWeight: '600' } },
          lang === 'fr'
            ? "🎉 Félicitations ! Vous pouvez échanger cette récompense dès maintenant !"
            : "🎉 Congratulations! You can redeem this reward right now!"
        )
      )
    ),

    React.createElement('div', { style: { textAlign: 'center', margin: '32px 0' } },
      React.createElement(EmailButton, { href: `https://ciara.city/rewards?city=${reward.city_name}` },
        user.total_points >= reward.points_required
          ? (lang === 'fr' ? "🎁 Échanger maintenant" : "🎁 Redeem now")
          : (lang === 'fr' ? "👀 Voir les récompenses" : "👀 View rewards")
      )
    ),

    user.total_points < reward.points_required && React.createElement(EmailCard, { 
      title: lang === 'fr' ? "💪 Besoin de plus de points ?" : "💪 Need more points?"
    },
      React.createElement('p', { style: styles.p },
        lang === 'fr'
          ? `Il vous manque ${reward.points_required - user.total_points} points pour cette récompense. Continuez à explorer ${reward.city_name} pour les gagner !`
          : `You need ${reward.points_required - user.total_points} more points for this reward. Keep exploring ${reward.city_name} to earn them!`
      ),
      React.createElement('div', { style: { textAlign: 'center', marginTop: '16px' } },
        React.createElement(EmailButton, { 
          href: `https://ciara.city/destination/${reward.city_name}`,
          variant: 'secondary'
        },
          lang === 'fr' ? "🗺️ Explorer maintenant" : "🗺️ Explore now"
        )
      )
    ),

    React.createElement('p', { style: { 
      color: '#94a3b8', 
      fontSize: '12px', 
      textAlign: 'center',
      marginTop: '32px'
    }},
      lang === 'fr'
        ? "Vous recevez cet email car une nouvelle récompense est disponible dans votre ville. Gérez vos préférences email dans votre profil."
        : "You're receiving this email because a new reward is available in your city. Manage your email preferences in your profile."
    )
  );

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Starting new rewards notification process...');

    // Get rewards created in the last 24 hours
    const { data: newRewards, error: rewardsError } = await supabase
      .from('rewards')
      .select(`
        id,
        title,
        description,
        points_required,
        value_description,
        is_active,
        cities!inner(id, name),
        partners!inner(name)
      `)
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (rewardsError) {
      throw new Error(`Error fetching new rewards: ${rewardsError.message}`);
    }

    if (!newRewards || newRewards.length === 0) {
      console.log('📊 No new rewards found in the last 24 hours');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No new rewards found',
        count: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`📊 Found ${newRewards.length} new rewards`);

    let sentEmails = 0;
    const errors: string[] = [];

    for (const reward of newRewards) {
      try {
        // Get users in the same city as the reward
        const { data: cityUsers, error: usersError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            email,
            full_name,
            city_id,
            preferred_languages,
            total_points
          `)
          .eq('city_id', reward.cities.id)
          .eq('role', 'visitor')
          .not('email', 'is', null);

        if (usersError) {
          console.error(`Error fetching users for city ${reward.cities.name}:`, usersError.message);
          continue;
        }

        if (!cityUsers || cityUsers.length === 0) {
          console.log(`No users found for city ${reward.cities.name}`);
          continue;
        }

        const newRewardData: NewReward = {
          id: reward.id,
          title: reward.title,
          description: reward.description,
          points_required: reward.points_required,
          city_name: reward.cities.name,
          partner_name: reward.partners.name,
          value_description: reward.value_description || reward.title
        };

        for (const user of cityUsers) {
          try {
            const userLang = user.preferred_languages?.[0] === 'en' ? 'en' : 'fr';

            const userNotification: UserNotification = {
              user_id: user.user_id,
              email: user.email,
              full_name: user.full_name || 'Voyageur',
              city_id: user.city_id,
              preferred_language: userLang,
              total_points: user.total_points || 0
            };

            // Render email template
            const emailHtml = await renderAsync(
              React.createElement(NewRewardEmailI18n, { 
                user: userNotification, 
                reward: newRewardData,
                lang: userLang 
              })
            );

            // Send email
            const emailResponse = await resend.emails.send({
              from: "CIARA <info@ciara.city>",
              to: [user.email],
              subject: userLang === 'fr' 
                ? `🎁 Nouvelle récompense : ${reward.title}`
                : `🎁 New reward: ${reward.title}`,
              html: emailHtml,
            });

            if (emailResponse.data?.id) {
              sentEmails++;
            }

          } catch (userError) {
            errors.push(`Failed to send to ${user.email}: ${userError.message}`);
          }
        }

      } catch (rewardError) {
        errors.push(`Failed to process reward ${reward.title}: ${rewardError.message}`);
      }
    }

    console.log(`🎁 New rewards notification process completed: ${sentEmails} emails sent, ${errors.length} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${sentEmails} new reward notification emails`,
      count: sentEmails,
      total_rewards: newRewards.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Error in new rewards notification process:", error);
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