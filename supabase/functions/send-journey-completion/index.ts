import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend";
import { renderAsync } from "npm:@react-email/render";
import React from "npm:react";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Email translations
const translations = {
  fr: {
    subject: "🎉 Félicitations ! Parcours terminé avec CIARA | 🎉 Congratulations! Journey completed with CIARA",
    title: "🏆 Exploit accompli !",
    subtitle: "Vous venez de terminer un parcours extraordinaire",
    journeyCompleted: "Mission accomplie",
    rating: "Votre évaluation",
    duration: "Temps d'exploration",
    pointsEarned: "Points d'aventurier gagnés",
    totalPoints: "Total de vos points d'exploration",
    nextSteps: "Votre prochaine aventure",
    exploreMore: "Continuez votre découverte avec d'autres parcours passionnants sur CIARA. Chaque étape révèle de nouveaux secrets !",
    thankYou: "Bravo pour cette belle exploration !",
    teamCiara: "L'équipe CIARA - Vos guides numériques",
    appLink: "Découvrir d'autres parcours CIARA",
    footer: "Vous recevez cet email car vous avez terminé un parcours sur CIARA.",
    personalizedMessage: "Votre aventure dans {cityName} a été remarquable ! Vous avez exploré {stepCount} étapes uniques et découvert des trésors cachés.",
    insights: "💡 Vos statistiques d'explorateur",
    achievement: "🌟 Accomplissement débloqué",
    completionCongrats: "Félicitations ! Vous faites désormais partie des explorateurs ayant terminé ce parcours.",
    sectionTitle: "🇫🇷 VOTRE AVENTURE EN FRANÇAIS",
    bilingual: {
      frenchSection: "🇫🇷 SECTION FRANÇAISE",
      englishSection: "🇬🇧 ENGLISH SECTION"
    }
  },
  en: {
    subject: "🎉 Félicitations ! Parcours terminé avec CIARA | 🎉 Congratulations! Journey completed with CIARA",
    title: "🏆 Achievement Unlocked!",
    subtitle: "You've just completed an extraordinary journey",
    journeyCompleted: "Mission accomplished",
    rating: "Your rating",
    duration: "Exploration time",
    pointsEarned: "Adventure points earned",
    totalPoints: "Total exploration points",
    nextSteps: "Your next adventure",
    exploreMore: "Continue your discovery with other exciting journeys on CIARA. Each step reveals new secrets!",
    thankYou: "Congratulations on this amazing exploration!",
    teamCiara: "The CIARA team - Your digital guides",
    appLink: "Discover more CIARA journeys",
    footer: "You are receiving this email because you completed a journey on CIARA.",
    personalizedMessage: "Your adventure in {cityName} was remarkable! You explored {stepCount} unique steps and discovered hidden treasures.",
    insights: "💡 Your explorer statistics",
    achievement: "🌟 Achievement unlocked",
    completionCongrats: "Congratulations! You are now part of the explorers who completed this journey.",
    sectionTitle: "🇬🇧 YOUR ADVENTURE IN ENGLISH",
    bilingual: {
      frenchSection: "🇫🇷 SECTION FRANÇAISE",
      englishSection: "🇬🇧 ENGLISH SECTION"
    }
  }
};

// React Email component for bilingual journey completion
const BilingualJourneyCompletionEmail = ({ 
  userName, 
  journeyName, 
  pointsEarned, 
  totalPoints, 
  language = 'fr',
  userRating,
  completionDuration,
  cityName,
  stepCount
}: {
  userName: string;
  journeyName: string;
  pointsEarned: number;
  totalPoints: number;
  language?: 'fr' | 'en';
  userRating?: number;
  completionDuration?: string;
  cityName?: string;
  stepCount?: number;
  totalCompletedJourneys?: number;
  isFrequentExplorer?: boolean;
}) => {
  const tFr = translations.fr;
  const tEn = translations.en;
  
  return React.createElement('html', { lang: 'fr' },
    React.createElement('head', null,
      React.createElement('meta', { charSet: 'utf-8' }),
      React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      React.createElement('title', null, tFr.subject)
    ),
    React.createElement('body', { style: emailStyles.body },
      React.createElement('div', { style: emailStyles.container },
        // Header
        React.createElement('div', { style: emailStyles.header },
          React.createElement('div', { style: emailStyles.logo },
            React.createElement('h1', { style: emailStyles.logoText }, 'CIARA'),
            React.createElement('p', { style: emailStyles.logoSubtext }, 'Votre guide touristique intelligent • Your smart travel guide')
          )
        ),
        
        // SECTION FRANÇAISE
        React.createElement('div', { style: emailStyles.section },
          React.createElement('div', { style: emailStyles.sectionHeader },
            React.createElement('h2', { style: emailStyles.sectionTitle }, tFr.bilingual.frenchSection)
          ),
          
          React.createElement('div', { style: emailStyles.celebration },
            React.createElement('h1', { style: emailStyles.title }, `🎉 ${tFr.title}`),
            React.createElement('p', { style: emailStyles.subtitle }, 
              `Bonjour ${userName},`
            ),
            React.createElement('p', { style: emailStyles.text }, tFr.subtitle),
            React.createElement('p', { style: emailStyles.personalizedText }, 
              tFr.personalizedMessage
                .replace('{cityName}', cityName || 'cette destination')
                .replace('{stepCount}', (stepCount || 5).toString())
            )
          ),
          
          // Journey details (French)
          React.createElement('div', { style: emailStyles.journeyCard },
            React.createElement('h2', { style: emailStyles.journeyTitle }, `🏆 ${tFr.achievement}`),
            React.createElement('p', { style: emailStyles.journeyName }, journeyName),
            React.createElement('p', { style: emailStyles.completionMessage }, tFr.completionCongrats),
            
            // Stats grid
            React.createElement('div', { style: emailStyles.statsGrid },
              React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '🎯'),
                React.createElement('div', { style: emailStyles.statNumber }, pointsEarned.toString()),
                React.createElement('div', { style: emailStyles.statLabel }, tFr.pointsEarned)
              ),
              React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '🏅'),
                React.createElement('div', { style: emailStyles.statNumber }, totalPoints.toString()),
                React.createElement('div', { style: emailStyles.statLabel }, tFr.totalPoints)
              ),
              userRating && React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '⭐'),
                React.createElement('div', { style: emailStyles.statNumber }, 
                  `${userRating}/5`
                ),
                React.createElement('div', { style: emailStyles.statLabel }, tFr.rating)
              ),
              completionDuration && React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '⏱️'),
                React.createElement('div', { style: emailStyles.statNumber }, completionDuration),
                React.createElement('div', { style: emailStyles.statLabel }, tFr.duration)
              )
            ).filter(Boolean)
          ),
          
          // Insights section (French) - Enhanced with personalized data
          React.createElement('div', { style: emailStyles.insights },
            React.createElement('h3', { style: emailStyles.insightsTitle }, tFr.insights),
            React.createElement('ul', { style: emailStyles.insightsList },
              React.createElement('li', { style: emailStyles.insightItem }, 
                `🎖️ Vous avez gagné ${pointsEarned} points d'aventurier lors de cette exploration`
              ),
              React.createElement('li', { style: emailStyles.insightItem }, 
                `🌟 Votre total atteint maintenant ${totalPoints} points - continuez à explorer !`
              ),
              userRating && React.createElement('li', { style: emailStyles.insightItem }, 
                `⭐ Votre note de ${userRating}/5 nous aide à améliorer l'expérience`
              ),
              totalCompletedJourneys && totalCompletedJourneys > 1 && React.createElement('li', { style: emailStyles.insightItem }, 
                `🏆 Félicitations ! C'est votre ${totalCompletedJourneys}${totalCompletedJourneys === 1 ? 'er' : 'ème'} parcours terminé`
              ),
              isFrequentExplorer && React.createElement('li', { style: emailStyles.insightItem }, 
                `⭐ Statut Explorateur Expérimenté débloqué ! Vous maîtrisez l'art de l'exploration`
              ),
              React.createElement('li', { style: emailStyles.insightItem }, 
                `🚀 Vous êtes prêt(e) pour de nouvelles aventures !`
              )
            ).filter(Boolean)
          ),
          
          // Next steps (French)
          React.createElement('div', { style: emailStyles.nextSteps },
            React.createElement('h3', { style: emailStyles.nextStepsTitle }, tFr.nextSteps),
            React.createElement('p', { style: emailStyles.text }, tFr.exploreMore)
          )
        ),
        
        // ENGLISH SECTION
        React.createElement('div', { style: { ...emailStyles.section, ...emailStyles.englishSection } },
          React.createElement('div', { style: emailStyles.sectionHeader },
            React.createElement('h2', { style: emailStyles.sectionTitle }, tEn.bilingual.englishSection)
          ),
          
          React.createElement('div', { style: emailStyles.celebration },
            React.createElement('h1', { style: emailStyles.title }, `🎉 ${tEn.title}`),
            React.createElement('p', { style: emailStyles.subtitle }, 
              `Hello ${userName},`
            ),
            React.createElement('p', { style: emailStyles.text }, tEn.subtitle),
            React.createElement('p', { style: emailStyles.personalizedText }, 
              tEn.personalizedMessage
                .replace('{cityName}', cityName || 'this destination')
                .replace('{stepCount}', (stepCount || 5).toString())
            )
          ),
          
          // Journey details (English)
          React.createElement('div', { style: emailStyles.journeyCard },
            React.createElement('h2', { style: emailStyles.journeyTitle }, `🏆 ${tEn.achievement}`),
            React.createElement('p', { style: emailStyles.journeyName }, journeyName),
            React.createElement('p', { style: emailStyles.completionMessage }, tEn.completionCongrats),
            
            // Stats grid (English)
            React.createElement('div', { style: emailStyles.statsGrid },
              React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '🎯'),
                React.createElement('div', { style: emailStyles.statNumber }, pointsEarned.toString()),
                React.createElement('div', { style: emailStyles.statLabel }, tEn.pointsEarned)
              ),
              React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '🏅'),
                React.createElement('div', { style: emailStyles.statNumber }, totalPoints.toString()),
                React.createElement('div', { style: emailStyles.statLabel }, tEn.totalPoints)
              ),
              userRating && React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '⭐'),
                React.createElement('div', { style: emailStyles.statNumber }, 
                  `${userRating}/5`
                ),
                React.createElement('div', { style: emailStyles.statLabel }, tEn.rating)
              ),
              completionDuration && React.createElement('div', { style: emailStyles.statItem },
                React.createElement('div', { style: emailStyles.statIcon }, '⏱️'),
                React.createElement('div', { style: emailStyles.statNumber }, completionDuration),
                React.createElement('div', { style: emailStyles.statLabel }, tEn.duration)
              )
            ).filter(Boolean)
          ),
          
          // Insights section (English) - Enhanced with personalized data
          React.createElement('div', { style: emailStyles.insights },
            React.createElement('h3', { style: emailStyles.insightsTitle }, tEn.insights),
            React.createElement('ul', { style: emailStyles.insightsList },
              React.createElement('li', { style: emailStyles.insightItem }, 
                `🎖️ You earned ${pointsEarned} adventure points during this exploration`
              ),
              React.createElement('li', { style: emailStyles.insightItem }, 
                `🌟 Your total now reaches ${totalPoints} points - keep exploring!`
              ),
              userRating && React.createElement('li', { style: emailStyles.insightItem }, 
                `⭐ Your ${userRating}/5 rating helps us improve the experience`
              ),
              totalCompletedJourneys && totalCompletedJourneys > 1 && React.createElement('li', { style: emailStyles.insightItem }, 
                `🏆 Congratulations! This is your ${totalCompletedJourneys}${totalCompletedJourneys === 1 ? 'st' : totalCompletedJourneys === 2 ? 'nd' : totalCompletedJourneys === 3 ? 'rd' : 'th'} completed journey`
              ),
              isFrequentExplorer && React.createElement('li', { style: emailStyles.insightItem }, 
                `⭐ Experienced Explorer status unlocked! You've mastered the art of exploration`
              ),
              React.createElement('li', { style: emailStyles.insightItem }, 
                `🚀 You're ready for new adventures!`
              )
            ).filter(Boolean)
          ),
          
          // Next steps (English)
          React.createElement('div', { style: emailStyles.nextSteps },
            React.createElement('h3', { style: emailStyles.nextStepsTitle }, tEn.nextSteps),
            React.createElement('p', { style: emailStyles.text }, tEn.exploreMore)
          )
        ),
        
        // CTA Button
        React.createElement('div', { style: emailStyles.ctaSection },
          React.createElement('a', { 
            href: 'https://ciara.city',
            style: emailStyles.button 
          }, `${tFr.appLink} • ${tEn.appLink}`)
        ),
        
        // Footer
        React.createElement('div', { style: emailStyles.footer },
          React.createElement('p', { style: emailStyles.signature }, `${tFr.teamCiara} • ${tEn.teamCiara}`),
          React.createElement('p', { style: emailStyles.footerText }, tFr.footer),
          React.createElement('p', { style: emailStyles.footerText }, 
            `CIARA - ${new Date().getFullYear()}`
          )
        )
      )
    )
  );
};

// Enhanced email styles for bilingual layout
const emailStyles = {
  body: {
    margin: '0',
    padding: '0',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: '1.6',
    color: '#334155'
  },
  container: {
    maxWidth: '650px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
  },
  header: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
    padding: '32px 24px',
    textAlign: 'center' as const
  },
  logo: {
    display: 'inline-block'
  },
  logoText: {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    letterSpacing: '3px',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  logoSubtext: {
    color: '#e0e7ff',
    fontSize: '14px',
    margin: '0',
    opacity: '0.9'
  },
  section: {
    padding: '32px 24px',
    borderBottom: '2px solid #f1f5f9'
  },
  englishSection: {
    backgroundColor: '#fafbff'
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#475569',
    margin: '0',
    padding: '8px 16px',
    backgroundColor: '#e2e8f0',
    borderRadius: '20px',
    display: 'inline-block'
  },
  celebration: {
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    margin: '0 0 12px 0'
  },
  text: {
    fontSize: '16px',
    color: '#475569',
    margin: '0 0 16px 0'
  },
  personalizedText: {
    fontSize: '16px',
    color: '#6366f1',
    fontWeight: '500',
    backgroundColor: '#f0f9ff',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
    margin: '16px 0'
  },
  journeyCard: {
    backgroundColor: '#fefce8',
    border: '2px solid #facc15',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  journeyTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#92400e',
    margin: '0 0 8px 0'
  },
  journeyName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#b45309',
    margin: '0 0 12px 0'
  },
  completionMessage: {
    fontSize: '16px',
    color: '#78716c',
    fontStyle: 'italic',
    margin: '0 0 24px 0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  statItem: {
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
    padding: '16px 12px',
    borderRadius: '12px',
    border: '1px solid #fde047'
  },
  statIcon: {
    fontSize: '24px',
    margin: '0 0 8px 0'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#059669',
    margin: '0 0 4px 0'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontWeight: '500'
  },
  insights: {
    backgroundColor: '#f0f9ff',
    border: '2px solid #0ea5e9',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  insightsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0c4a6e',
    margin: '0 0 16px 0'
  },
  insightsList: {
    margin: '0',
    padding: '0',
    listStyle: 'none'
  },
  insightItem: {
    fontSize: '15px',
    color: '#0f172a',
    margin: '0 0 8px 0',
    padding: '8px 0',
    borderBottom: '1px solid #e0f2fe'
  },
  nextSteps: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #22c55e',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const
  },
  nextStepsTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#166534',
    margin: '0 0 16px 0'
  },
  ctaSection: {
    textAlign: 'center' as const,
    padding: '24px'
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
    transition: 'all 0.3s ease'
  },
  signature: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#6366f1',
    margin: '16px 0 0 0'
  },
  footer: {
    backgroundColor: '#f1f5f9',
    padding: '24px',
    textAlign: 'center' as const,
    borderTop: '1px solid #e2e8f0'
  },
  footerText: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 8px 0'
  }
};

// Request interface
interface JourneyCompletionRequest {
  email: string;
  userName: string;
  journeyName: string;
  pointsEarned: number;
  totalPoints: number;
  language?: 'fr' | 'en';
  userRating?: number;
  completionDuration?: string;
  cityName?: string;
  stepCount?: number;
}

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  console.log('📧 Journey completion email function called');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: JourneyCompletionRequest = await req.json();
    console.log('📨 Processing journey completion email:', {
      email: body.email,
      journeyName: body.journeyName,
      pointsEarned: body.pointsEarned,
      language: body.language || 'fr'
    });

    // Verify Resend API key is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured - missing RESEND_API_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('✅ RESEND_API_KEY found, length:', resendApiKey.length);

    // Validate required fields
    if (!body.email || !body.userName || !body.journeyName || typeof body.pointsEarned !== 'number') {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, userName, journeyName, pointsEarned' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const language = body.language || 'fr';
    const tFr = translations.fr;

    // Mock data for enhanced personalization (can be enhanced later with real data)
    const cityName = body.cityName || 'cette destination';
    const stepCount = body.stepCount || 5;
    const totalCompletedJourneys = 1; // Will be enhanced when we have access to user data
    const isFrequentExplorer = false;

    // Create simple HTML email for better compatibility
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Félicitations !</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 20px;">
              🎉 ${language === 'fr' ? 'Félicitations' : 'Congratulations'} ${body.userName}!
            </h1>
            
            <p style="font-size: 18px; line-height: 1.6; color: #374151; text-align: center;">
              ${language === 'fr' 
                ? `Vous avez terminé le parcours <strong>"${body.journeyName}"</strong> et gagné <strong>${body.pointsEarned} points</strong> !`
                : `You completed the <strong>"${body.journeyName}"</strong> journey and earned <strong>${body.pointsEarned} points</strong>!`
              }
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                ${language === 'fr' ? 'Votre évaluation' : 'Your rating'}: ${'⭐'.repeat(body.userRating || 5)}
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                ${language === 'fr' ? 'Total de points' : 'Total points'}: ${body.totalPoints || 0}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://ciara.city" style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                ${language === 'fr' ? 'Découvrir plus de parcours' : 'Discover more journeys'}
              </a>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 25px; line-height: 1.4;">
              ${language === 'fr' 
                ? 'Merci d\'utiliser CIARA pour explorer le monde !'
                : 'Thank you for using CIARA to explore the world!'
              }
            </p>
          </div>
        </body>
      </html>
    `;

    console.log('🎨 Email HTML rendered successfully');

    // Send email via Resend with enhanced data
    try {
      console.log('📤 Attempting to send email to:', body.email);
      const emailResult = await resend.emails.send({
        from: 'CIARA <noreply@ciara.city>',
        to: [body.email],
        subject: tFr.subject,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': `journey-completion-${Date.now()}`,
          'X-Journey-Name': body.journeyName,
          'X-User-Rating': body.userRating?.toString() || 'unrated',
          'X-Total-Journeys': totalCompletedJourneys.toString(),
        },
      });

      console.log('✅ Journey completion email sent successfully:', emailResult.data?.id);
      console.log('📧 Email result:', emailResult);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          emailId: emailResult.data?.id,
          message: 'Journey completion email sent successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (emailError) {
      console.error('❌ Failed to send email via Resend:', emailError);
      throw emailError;
    }


  } catch (error) {
    console.error('❌ Error sending journey completion email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send journey completion email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Start the server
serve(handler);