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

// Function to create comprehensive journey report with Google Maps
function createJourneyReportHTML(data: {
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
}) {
  const isEnglish = data.language === 'en';
  const isFrench = data.language === 'fr';
  
  return `
<!DOCTYPE html>
<html lang="${data.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #2d3748;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        
        .container {
            width: 100%;
            max-width: 100%;
            padding: 30px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #667eea;
            page-break-after: avoid;
        }
        
        .logo {
            font-size: 24pt;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 10pt;
            color: #666;
            margin-bottom: 15px;
        }
        
        .journey-title {
            font-size: 18pt;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 15px;
            word-wrap: break-word;
        }
        
        .meta-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
            gap: 10px;
        }
        
        .meta-item {
            text-align: center;
            min-width: 120px;
        }
        
        .meta-label {
            font-size: 8pt;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .meta-value {
            font-size: 10pt;
            font-weight: bold;
            color: #2d3748;
        }
        
        .stars {
            color: #ffd700;
            font-size: 12pt;
        }
        
        .content-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            page-break-after: avoid;
        }
        
        .journal-content {
            font-size: 11pt;
            line-height: 1.6;
            color: #2d3748;
            text-align: justify;
            hyphens: auto;
            white-space: pre-line;
            word-wrap: break-word;
        }
        
        .comment-box {
            background: #f0f9ff;
            border-left: 3px solid #0ea5e9;
            padding: 12px;
            margin: 15px 0;
            border-radius: 3px;
            font-style: italic;
            page-break-inside: avoid;
        }
        
        .steps-list {
            list-style: none;
            padding: 0;
        }
        
        .step-item {
            background: #f8fafc;
            margin-bottom: 8px;
            padding: 10px;
            border-radius: 4px;
            border-left: 2px solid #667eea;
            page-break-inside: avoid;
        }
        
        .step-name {
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 3px;
            font-size: 10pt;
        }
        
        .step-description {
            color: #666;
            font-size: 9pt;
            line-height: 1.4;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .overview-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
        }
        
        .overview-label {
            font-weight: bold;
            color: #475569;
        }
        
        .overview-value {
            color: #1e293b;
        }
        
        .description-box {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #0ea5e9;
            margin-top: 15px;
        }
        
        .description-box h3 {
            margin: 0 0 8px 0;
            color: #0c4a6e;
            font-size: 12pt;
        }
        
        .map-container {
            text-align: center;
            margin: 20px 0;
        }
        
        .journey-map {
            max-width: 100%;
            height: auto;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        
        .map-caption {
            font-size: 9pt;
            color: #666;
            font-style: italic;
            margin: 0;
        }
        
        .steps-detailed {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .step-detail-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            page-break-inside: avoid;
        }
        
        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .step-number {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10pt;
            font-weight: bold;
            margin-right: 12px;
        }
        
        .step-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .step-stat {
            display: flex;
            align-items: center;
            gap: 5px;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9pt;
        }
        
        .stat-icon {
            font-size: 10pt;
        }
        
        .stat-text {
            color: #475569;
        }

        .quiz-section {
            background: #fef3e4;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        
        .quiz-title {
            font-size: 12pt;
            font-weight: bold;
            color: #92400e;
            margin-bottom: 8px;
        }
        
        .quiz-question {
            font-size: 10pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 6px;
        }
        
        .quiz-options {
            list-style: none;
            padding: 0;
            margin: 0 0 8px 15px;
        }
        
        .quiz-option {
            font-size: 9pt;
            color: #374151;
            margin-bottom: 2px;
        }
        
        .correct-answer {
            background: #d1fae5;
            color: #065f46;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
        }
        
        .quiz-explanation {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
            margin-top: 4px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #666;
            font-size: 9pt;
            page-break-inside: avoid;
        }
        
    </style>
</head>
<body>
    
    <div class="container">
        <div class="header">
            <div class="logo">CIARA</div>
            <div class="subtitle">
                ${isEnglish ? 'Personal Travel Journal' : isFrench ? 'Carnet de Voyage Personnel' : 'Persönliches Reisetagebuch'}
            </div>
            <h1 class="journey-title">${data.journeyName}</h1>
        </div>
        
        <div class="meta-info">
            <div class="meta-item">
                <div class="meta-label">${isEnglish ? 'City' : isFrench ? 'Ville' : 'Stadt'}</div>
                <div class="meta-value">${data.cityName}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">${isEnglish ? 'Rating' : isFrench ? 'Note' : 'Bewertung'}</div>
                <div class="meta-value">
                    <span class="stars">${'★'.repeat(data.rating)}${'☆'.repeat(5-data.rating)}</span>
                </div>
            </div>
            <div class="meta-item">
                <div class="meta-label">${isEnglish ? 'Date' : isFrench ? 'Date' : 'Datum'}</div>
                <div class="meta-value">${data.completionDate}</div>
            </div>
            ${data.duration ? `
            <div class="meta-item">
                <div class="meta-label">${isEnglish ? 'Duration' : isFrench ? 'Durée' : 'Dauer'}</div>
                <div class="meta-value">${data.duration}</div>
            </div>
            ` : ''}
            ${data.distance ? `
            <div class="meta-item">
                <div class="meta-label">${isEnglish ? 'Distance' : isFrench ? 'Distance' : 'Entfernung'}</div>
                <div class="meta-value">${data.distance} km</div>
            </div>
            ` : ''}
            <div class="meta-item">
                <div class="meta-label">${isEnglish ? 'Points' : isFrench ? 'Points' : 'Punkte'}</div>
                <div class="meta-value">${data.totalPoints}</div>
            </div>
        </div>
        
        ${data.comment ? `
        <div class="content-section">
            <h2 class="section-title">${isEnglish ? 'Your Comment' : isFrench ? 'Votre Commentaire' : 'Ihr Kommentar'}</h2>
            <div class="comment-box">
                "${data.comment}"
            </div>
        </div>
        ` : ''}
        
        ${data.journeyDescription ? `
        <div class="content-section">
            <h2 class="section-title">${isEnglish ? 'Journey Description' : isFrench ? 'Description du Parcours' : 'Reisebeschreibung'}</h2>
            <div class="description-box">
                <h3>${isEnglish ? 'About this journey' : isFrench ? 'À propos de ce parcours' : 'Über diese Reise'}</h3>
                <div class="journal-content">${data.journeyDescription}</div>
            </div>
        </div>
        ` : ''}
        
        ${data.mapImageUrl ? `
        <div class="content-section">
            <h2 class="section-title">${isEnglish ? 'Journey Map' : isFrench ? 'Carte du Parcours' : 'Reisekarte'}</h2>
            <div class="map-container">
                <img src="${data.mapImageUrl}" alt="Journey Map" class="journey-map" />
                <p class="map-caption">${isEnglish ? 'Your journey route with completed steps marked' : isFrench ? 'Votre parcours avec les étapes complétées marquées' : 'Ihre Reiseroute mit markierten abgeschlossenen Schritten'}</p>
            </div>
        </div>
        ` : ''}
        
        ${data.stepDetails && data.stepDetails.length > 0 ? `
        <div class="content-section">
            <h2 class="section-title">${isEnglish ? 'Completed Steps' : isFrench ? 'Étapes Complétées' : 'Abgeschlossene Schritte'}</h2>
            <div class="steps-detailed">
                ${data.stepDetails.map((step, index) => `
                <div class="step-detail-card">
                    <div class="step-header">
                        <div class="step-number">${index + 1}</div>
                        <div>
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
        
        <div class="footer">
            <p>${isEnglish ? 'Generated by CIARA - City Interactive Assistant for Regional Adventures' : isFrench ? 'Généré par CIARA - Assistant Interactif de Ville pour les Aventures Régionales' : 'Generiert von CIARA - Interaktiver Stadtassistent für regionale Abenteuer'}</p>
            <p>www.ciara.city | info@ciara.city</p>
        </div>
    </div>
</body>
</html>`;
}

// Function to generate PDF from journey data
function generatePDF(data: {
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
}): Uint8Array {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  const isEnglish = data.language === 'en';
  const isFrench = data.language === 'fr';

  // Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 126, 234); // CIARA blue
  pdf.text('CIARA', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  const subtitle = isEnglish ? 'Personal Travel Journal' : isFrench ? 'Carnet de Voyage Personnel' : 'Persönliches Reisetagebuch';
  pdf.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Journey title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(45, 55, 72);
  pdf.text(data.journeyName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Meta information
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(45, 55, 72);
  
  const metaInfo = [
    { label: isEnglish ? 'City' : isFrench ? 'Ville' : 'Stadt', value: data.cityName },
    { label: isEnglish ? 'Rating' : isFrench ? 'Note' : 'Bewertung', value: '★'.repeat(data.rating) + '☆'.repeat(5-data.rating) },
    { label: isEnglish ? 'Date' : isFrench ? 'Date' : 'Datum', value: data.completionDate },
    ...(data.duration ? [{ label: isEnglish ? 'Duration' : isFrench ? 'Durée' : 'Dauer', value: data.duration }] : []),
    ...(data.distance ? [{ label: isEnglish ? 'Distance' : isFrench ? 'Distance' : 'Entfernung', value: `${data.distance} km` }] : []),
    { label: isEnglish ? 'Points' : isFrench ? 'Points' : 'Punkte', value: data.totalPoints?.toString() || '0' }
  ];

  // Draw meta info in a grid
  const itemsPerRow = 3;
  const itemWidth = contentWidth / itemsPerRow;
  const itemHeight = 15;
  
  metaInfo.forEach((item, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const x = margin + (col * itemWidth);
    const y = yPosition + (row * itemHeight);
    
    pdf.setFontSize(8);
    pdf.setTextColor(102, 102, 102);
    pdf.text(item.label.toUpperCase(), x, y);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.text(item.value, x, y + 5);
  });
  
  yPosition += (Math.ceil(metaInfo.length / itemsPerRow) * itemHeight) + 20;

  // Comment section
  if (data.comment) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const commentTitle = isEnglish ? 'Your Comment' : isFrench ? 'Votre Commentaire' : 'Ihr Kommentar';
    pdf.text(commentTitle, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(14, 165, 233);
    const commentLines = pdf.splitTextToSize(`"${data.comment}"`, contentWidth);
    commentLines.forEach(line => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Journey description
  if (data.journeyDescription) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const descTitle = isEnglish ? 'Journey Description' : isFrench ? 'Description du Parcours' : 'Reisebeschreibung';
    pdf.text(descTitle, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(45, 55, 72);
    const descLines = pdf.splitTextToSize(data.journeyDescription, contentWidth);
    descLines.forEach(line => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Steps section
  if (data.stepDetails && data.stepDetails.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const stepsTitle = isEnglish ? 'Completed Steps' : isFrench ? 'Étapes Complétées' : 'Abgeschlossene Schritte';
    pdf.text(stepsTitle, margin, yPosition);
    yPosition += 10;

    data.stepDetails.forEach((step, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(45, 55, 72);
      pdf.text(`${index + 1}. ${step.name}`, margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 102, 102);
      const descLines = pdf.splitTextToSize(step.description, contentWidth);
      descLines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });

      pdf.setTextColor(45, 55, 72);
      const completedDate = new Date(step.completed_at).toLocaleDateString(data.language);
      pdf.text(`${isEnglish ? 'Completed' : isFrench ? 'Complété' : 'Abgeschlossen'}: ${completedDate}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`${isEnglish ? 'Points earned' : isFrench ? 'Points gagnés' : 'Erhaltene Punkte'}: ${step.points_earned}`, margin, yPosition);
      yPosition += 10;

      // Separator line
      if (index < data.stepDetails!.length - 1) {
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
  }

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  const footerText = isEnglish ? 'Generated by CIARA - City Interactive Assistant for Regional Adventures' : 
                    isFrench ? 'Généré par CIARA - Assistant Interactif de Ville pour les Aventures Régionales' : 
                    'Generiert von CIARA - Interaktiver Stadtassistent für regionale Abenteuer';
  pdf.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  pdf.text('www.ciara.city | info@ciara.city', pageWidth / 2, footerY + 5, { align: 'center' });

  return pdf.output('arraybuffer') as Uint8Array;
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
    console.log('📖 Travel journal generation started');

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

    // Generate PDF instead of HTML
    const pdfData = generatePDF({
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

    // Convert PDF to base64 for transmission
    const pdfBase64 = btoa(String.fromCharCode(...pdfData));

    try {
      await supabaseClient
        .from('travel_journals')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          title: title,
          content: `PDF generated for ${journeyName}`,
          language: language,
          metadata: {
            stepCount: stepDetails.length,
            rating: rating,
            format: 'pdf',
            cityName: cityName,
            totalPoints: totalPoints
          }
        });
    } catch (dbError) {
      console.log('DB save failed, continuing with response');
    }

    return new Response(JSON.stringify({
      success: true,
      format: 'pdf',
      pdfData: pdfBase64,
      fileName: `${journeyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_journal.pdf`,
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
    console.error('❌ Error in generate-travel-journal function:', error);
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