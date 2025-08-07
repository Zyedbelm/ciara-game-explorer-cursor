import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import jsPDF from 'https://esm.sh/jspdf@2.5.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JournalRequest {
  journeyName: string;
  rating: number;
  comment?: string;
  language?: string;
  journeyId?: string;
  userJourneyProgressId?: string;
}

// Function to generate a modern HTML document that can be easily converted to PDF
function generateModernHTMLDocument(data: {
  userName: string;
  journeyName: string;
  cityName: string;
  rating: number;
  comment?: string;
  language: string;
  stepDetails?: any[];
  completionDate?: string;
  duration?: string;
  distance?: number;
  totalPoints?: number;
  journeyDescription?: string;
  mapImageUrl?: string;
  quizData?: any[];
}): string {
  const isEnglish = data.language === 'en';
  const isFrench = data.language === 'fr';
  
  return `
<!DOCTYPE html>
<html lang="${data.language}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.journeyName} - CIARA Travel Journal</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .page-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .logo {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.2rem;
            font-weight: 300;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .journey-title {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .container {
            padding: 40px 30px;
        }
        
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .meta-item {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.2s ease;
        }
        
        .meta-item:hover {
            transform: translateY(-2px);
        }
        
        .meta-icon {
            font-size: 2rem;
            margin-bottom: 10px;
            display: block;
        }
        
        .meta-label {
            font-size: 0.8rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .meta-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
        }
        
        .stars {
            font-size: 1.2rem;
            color: #f59e0b;
        }
        
        .content-section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-icon {
            font-size: 1.8rem;
        }
        
        .comment-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-left: 5px solid #3b82f6;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .comment-quote {
            font-size: 3rem;
            color: #3b82f6;
            position: absolute;
            top: -10px;
            left: 20px;
            font-family: serif;
        }
        
        .comment-text {
            font-size: 1.1rem;
            font-style: italic;
            color: #1e40af;
            line-height: 1.6;
            margin-left: 20px;
        }
        
        .description-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #0ea5e9;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .description-box h3 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .journal-content {
            font-size: 1rem;
            line-height: 1.7;
            color: #0f172a;
        }
        
        .map-container {
            text-align: center;
            margin: 20px 0;
        }
        
        .journey-map {
            max-width: 100%;
            height: auto;
            border-radius: 15px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border: 3px solid #e2e8f0;
        }
        
        .map-caption {
            font-size: 0.9rem;
            color: #64748b;
            margin-top: 10px;
            font-style: italic;
        }
        
        .steps-grid {
            display: grid;
            gap: 20px;
        }
        
        .step-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .step-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .step-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .step-header {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .step-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        
        .step-info {
            flex: 1;
        }
        
        .step-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        
        .step-description {
            font-size: 1rem;
            color: #64748b;
            line-height: 1.6;
        }
        
        .step-stats {
            display: flex;
            gap: 15px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        
        .step-stat {
            background: #f8fafc;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 5px;
            border: 1px solid #e2e8f0;
        }
        
        .stat-icon {
            font-size: 1rem;
        }
        
        .achievement-section {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            margin: 40px 0;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
        }
        
        .achievement-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .achievement-stats {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .achievement-subtitle {
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 0.9rem;
            color: #64748b;
            margin-bottom: 10px;
        }
        
        .footer-links {
            font-size: 0.9rem;
            color: #667eea;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .page-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .meta-item:hover,
            .step-card:hover {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="header">
            <div class="header-content">
                <div class="logo">🌟 CIARA</div>
                <div class="subtitle">${isEnglish ? 'Personal Travel Journal' : isFrench ? 'Carnet de Voyage Personnel' : 'Persönliches Reisetagebuch'}</div>
                <div class="journey-title">${data.journeyName}</div>
            </div>
        </div>
        
        <div class="container">
            <div class="meta-grid">
                <div class="meta-item">
                    <span class="meta-icon">🏙️</span>
                    <div class="meta-label">${isEnglish ? 'City' : isFrench ? 'Ville' : 'Stadt'}</div>
                    <div class="meta-value">${data.cityName}</div>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">⭐</span>
                    <div class="meta-label">${isEnglish ? 'Rating' : isFrench ? 'Note' : 'Bewertung'}</div>
                    <div class="meta-value">
                        <span class="stars">${'★'.repeat(data.rating)}${'☆'.repeat(5-data.rating)}</span>
                    </div>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <div class="meta-label">${isEnglish ? 'Date' : isFrench ? 'Date' : 'Datum'}</div>
                    <div class="meta-value">${data.completionDate}</div>
                </div>
                ${data.duration ? `
                <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <div class="meta-label">${isEnglish ? 'Duration' : isFrench ? 'Durée' : 'Dauer'}</div>
                    <div class="meta-value">${data.duration}</div>
                </div>
                ` : ''}
                ${data.distance ? `
                <div class="meta-item">
                    <span class="meta-icon">📏</span>
                    <div class="meta-label">${isEnglish ? 'Distance' : isFrench ? 'Distance' : 'Entfernung'}</div>
                    <div class="meta-value">${data.distance} km</div>
                </div>
                ` : ''}
                <div class="meta-item">
                    <span class="meta-icon">🏆</span>
                    <div class="meta-label">${isEnglish ? 'Points' : isFrench ? 'Points' : 'Punkte'}</div>
                    <div class="meta-value">${data.totalPoints}</div>
                </div>
            </div>
            
            ${data.comment && data.comment.trim() !== '' && data.comment !== 'knpbj' ? `
            <div class="content-section">
                <h2 class="section-title">
                    <span class="section-icon">💭</span>
                    ${isEnglish ? 'Your Comment' : isFrench ? 'Votre Commentaire' : 'Ihr Kommentar'}
                </h2>
                <div class="comment-box">
                    <div class="comment-quote">"</div>
                    <div class="comment-text">${data.comment}</div>
                </div>
            </div>
            ` : ''}
            
            ${data.journeyDescription ? `
            <div class="content-section">
                <h2 class="section-title">
                    <span class="section-icon">📖</span>
                    ${isEnglish ? 'Journey Description' : isFrench ? 'Description du Parcours' : 'Reisebeschreibung'}
                </h2>
                <div class="description-box">
                    <h3>📚 ${isEnglish ? 'About this journey' : isFrench ? 'À propos de ce parcours' : 'Über diese Reise'}</h3>
                    <div class="journal-content">${data.journeyDescription}</div>
                </div>
            </div>
            ` : ''}
            
            ${data.mapImageUrl ? `
            <div class="content-section">
                <h2 class="section-title">
                    <span class="section-icon">🗺️</span>
                    ${isEnglish ? 'Journey Map' : isFrench ? 'Carte du Parcours' : 'Reisekarte'}
                </h2>
                <div class="map-container">
                    <img src="${data.mapImageUrl}" alt="Journey Map" class="journey-map" />
                    <p class="map-caption">${isEnglish ? 'Your journey route with completed steps marked' : isFrench ? 'Votre parcours avec les étapes complétées marquées' : 'Ihre Reiseroute mit markierten abgeschlossenen Schritten'}</p>
                </div>
            </div>
            ` : ''}
            
            ${data.stepDetails && data.stepDetails.length > 0 ? `
            <div class="content-section">
                <h2 class="section-title">
                    <span class="section-icon">🎯</span>
                    ${isEnglish ? 'Completed Steps' : isFrench ? 'Étapes Complétées' : 'Abgeschlossene Schritte'}
                </h2>
                <div class="steps-grid">
                    ${data.stepDetails.map((step, index) => `
                    <div class="step-card">
                        <div class="step-header">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-info">
                                <div class="step-name">${step.name}</div>
                                <div class="step-description">${step.description}</div>
                            </div>
                        </div>
                        <div class="step-stats">
                            <div class="step-stat">
                                <span class="stat-icon">📍</span>
                                <span class="stat-text">${step.type}</span>
                            </div>
                            <div class="step-stat">
                                <span class="stat-icon">⭐</span>
                                <span class="stat-text">${step.points_earned} ${isEnglish ? 'points' : isFrench ? 'points' : 'Punkte'}</span>
                            </div>
                            <div class="step-stat">
                                <span class="stat-icon">📅</span>
                                <span class="stat-text">${new Date(step.completed_at).toLocaleDateString(data.language)}</span>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="achievement-section">
                <div class="achievement-title">${isEnglish ? 'Journey Achievement' : isFrench ? 'Réussite du Parcours' : 'Reiseerfolg'}</div>
                <div class="achievement-stats">${data.stepDetails ? data.stepDetails.length : 0}/${data.stepDetails ? data.stepDetails.length : 0}</div>
                <div class="achievement-subtitle">${isEnglish ? 'Steps Completed' : isFrench ? 'Étapes Complétées' : 'Schritte Abgeschlossen'}</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">${isEnglish ? 'Generated by CIARA - City Interactive Assistant for Regional Adventures' : isFrench ? 'Généré par CIARA - Assistant Interactif de Ville pour les Aventures Régionales' : 'Generiert von CIARA - Interaktiver Stadtassistent für regionale Abenteuer'}</div>
            <div class="footer-links">🌐 www.ciara.city | 📧 info@ciara.city</div>
        </div>
    </div>
</body>
</html>`;
}

// Function to generate PDF using a different approach - return HTML for browser rendering
function generatePDFAlternative(data: {
  userName: string;
  journeyName: string;
  cityName: string;
  rating: number;
  comment?: string;
  language: string;
  stepDetails?: any[];
  completionDate?: string;
  duration?: string;
  distance?: number;
  totalPoints?: number;
  journeyDescription?: string;
  mapImageUrl?: string;
  quizData?: any[];
}): string {
  // Return the HTML document that can be printed or converted to PDF by the browser
  return generateModernHTMLDocument(data);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Missing authorization header', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response('Invalid authorization', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const { journeyName, rating, comment, language = 'fr', journeyId, userJourneyProgressId }: JournalRequest = await req.json();

    if (!journeyName || !rating) {
      return new Response('Missing required fields: journeyName and rating', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, preferred_languages')
      .eq('user_id', user.id)
      .single();

    let journeyDetails = null;
    let stepDetails: any[] = [];
    let quizData: any[] = [];
    let cityName = '';
    let completionDuration = '';
    
    if (userJourneyProgressId) {
      const { data: progressData } = await supabaseClient
        .from('user_journey_progress')
        .select(`
          *,
          journeys!inner(
            id, name, description, estimated_duration, distance_km,
            cities!inner(name)
          )
        `)
        .eq('id', userJourneyProgressId)
        .single();

      if (progressData) {
        journeyDetails = progressData;
        cityName = progressData.journeys.cities?.name || '';
        completionDuration = progressData.completion_duration || '';
        
        const { data: stepCompletions } = await supabaseClient
          .from('step_completions')
          .select(`
            step_id, points_earned, completed_at, validation_method,
            steps!inner(name, description, type, latitude, longitude)
          `)
          .eq('user_id', user.id)
          .eq('journey_id', progressData.journey_id)
          .order('completed_at', { ascending: true });
        
        if (stepCompletions) {
          stepDetails = stepCompletions.map(sc => ({
            name: sc.steps.name,
            description: sc.steps.description,
            type: sc.steps.type,
            points_earned: sc.points_earned,
            completed_at: sc.completed_at,
            validation_method: sc.validation_method,
            latitude: sc.steps.latitude,
            longitude: sc.steps.longitude
          }));
          
          // Fetch quiz questions for each step
          const stepIds = stepCompletions.map(sc => sc.step_id);
          if (stepIds.length > 0) {
            const { data: quizQuestions } = await supabaseClient
              .from('quiz_questions')
              .select(`
                id, question, options, correct_answer, explanation,
                step_id,
                steps!inner(name)
              `)
              .in('step_id', stepIds)
              .order('step_id');
            
            if (quizQuestions && quizQuestions.length > 0) {
              // Group quiz questions by step
              const quizByStep = quizQuestions.reduce((acc, quiz) => {
                const stepId = quiz.step_id;
                if (!acc[stepId]) {
                  acc[stepId] = {
                    stepName: quiz.steps.name,
                    questions: []
                  };
                }
                acc[stepId].questions.push({
                  question: quiz.question,
                  options: quiz.options,
                  correct_answer: quiz.correct_answer,
                  explanation: quiz.explanation
                });
                return acc;
              }, {} as any);
              
              quizData = Object.values(quizByStep);
            }
          }
        }
      }
    }

    // Generate Google Maps static image with markers
    let mapImageUrl = '';
    if (stepDetails.length > 0) {
      const validSteps = stepDetails.filter(step => step.latitude && step.longitude);
      if (validSteps.length > 0) {
        const markers = validSteps.map((step, index) => 
          `markers=color:red%7Clabel:${index + 1}%7C${step.latitude},${step.longitude}`
        ).join('&');
        
        const center = validSteps.length === 1 
          ? `${validSteps[0].latitude},${validSteps[0].longitude}`
          : ''; // Google will auto-center if no center specified
        
        const centerParam = center ? `&center=${center}` : '';
        const zoom = validSteps.length === 1 ? '&zoom=18' : '&zoom=15';
        
        mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400${centerParam}${zoom}&${markers}&key=${Deno.env.get('GOOGLE_MAPS_API_KEY')}`;
      }
    }

    // Create comprehensive journey report without AI content generation
    const totalPoints = stepDetails.reduce((sum, step) => sum + (step.points_earned || 0), 0);

    const title = language === 'fr' ? `Rapport de Parcours : ${journeyName}` : 
                 language === 'en' ? `Journey Report: ${journeyName}` :
                 `Reisebericht: ${journeyName}`;

    // Generate modern HTML document
    const htmlContent = generateModernHTMLDocument({
      userName: profile?.full_name || 'Explorateur',
      journeyName,
      cityName,
      rating,
      comment,
      language,
      stepDetails,
      completionDate: journeyDetails?.completed_at ? new Date(journeyDetails.completed_at).toLocaleDateString(language) : new Date().toLocaleDateString(language),
      duration: completionDuration || journeyDetails?.completion_duration,
      distance: journeyDetails?.journeys?.distance_km,
      totalPoints,
      journeyDescription: journeyDetails?.journeys?.description,
      mapImageUrl,
      quizData
    });

    // Convert HTML to base64 for transmission with proper UTF-8 encoding
    const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));

    try {
      await supabaseClient
        .from('travel_journals')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          title: title,
          content: `HTML journal generated for ${journeyName}`,
          language: language,
          metadata: {
            stepCount: stepDetails.length,
            rating: rating,
            format: 'html',
            cityName: cityName,
            totalPoints: totalPoints
          }
        });
    } catch (dbError) {
    }

    return new Response(JSON.stringify({
      success: true,
      format: 'html',
      htmlData: htmlBase64,
      fileName: `${journeyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_journal.html`,
      metadata: {
        stepCount: stepDetails.length,
        language: language,
        rating: rating,
        cityName: cityName,
        totalPoints: totalPoints
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate travel journal',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);