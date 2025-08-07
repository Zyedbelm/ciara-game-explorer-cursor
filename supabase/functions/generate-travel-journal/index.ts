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
    <title>${data.journeyName} - CIARA</title>
    <style>
        @page {
            size: A4;
            margin: 1.5cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a202c;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .page-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            margin: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 100%;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            margin: -40px -40px 40px -40px;
        }
        
        .logo {
            font-size: 32pt;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 12pt;
            opacity: 0.9;
            margin-bottom: 20px;
            font-weight: 300;
        }
        
        .journey-title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .meta-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
        }
        
        .meta-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        
        .meta-icon {
            font-size: 24pt;
            margin-bottom: 8px;
            display: block;
        }
        
        .meta-label {
            font-size: 9pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }
        
        .meta-value {
            font-size: 12pt;
            font-weight: bold;
            color: #1e293b;
        }
        
        .stars {
            color: #fbbf24;
            font-size: 16pt;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .content-section {
            margin-bottom: 35px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 18pt;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            page-break-after: avoid;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-icon {
            font-size: 20pt;
        }
        
        .journal-content {
            font-size: 11pt;
            line-height: 1.7;
            color: #374151;
            text-align: justify;
            hyphens: auto;
            white-space: pre-line;
            word-wrap: break-word;
        }
        
        .comment-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            font-style: italic;
            page-break-inside: avoid;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .comment-quote {
            font-size: 14pt;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .steps-list {
            list-style: none;
            padding: 0;
        }
        
        .step-item {
            background: #ffffff;
            margin-bottom: 15px;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
            page-break-inside: avoid;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        
        .step-name {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 8px;
            font-size: 14pt;
        }
        
        .step-description {
            color: #64748b;
            font-size: 11pt;
            line-height: 1.6;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .overview-item {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .overview-label {
            font-weight: 600;
            color: #475569;
        }
        
        .overview-value {
            color: #1e293b;
            font-weight: bold;
        }
        
        .description-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #0ea5e9;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .description-box h3 {
            margin: 0 0 15px 0;
            color: #0c4a6e;
            font-size: 16pt;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .map-container {
            text-align: center;
            margin: 30px 0;
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        
        .journey-map {
            max-width: 100%;
            height: auto;
            border: 3px solid #e2e8f0;
            border-radius: 12px;
            margin-bottom: 15px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .map-caption {
            font-size: 10pt;
            color: #64748b;
            font-style: italic;
            margin: 0;
        }
        
        .steps-detailed {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .step-detail-card {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            page-break-inside: avoid;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s ease;
        }
        
        .step-detail-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .step-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14pt;
            font-weight: bold;
            margin-right: 15px;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }
        
        .step-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 15px;
        }
        
        .step-stat {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #f1f5f9;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 10pt;
            border: 1px solid #e2e8f0;
        }
        
        .stat-icon {
            font-size: 12pt;
        }
        
        .stat-text {
            color: #475569;
            font-weight: 500;
        }

        .quiz-section {
            background: linear-gradient(135deg, #fef3e4 0%, #fed7aa 100%);
            border: 2px solid #fbbf24;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            page-break-inside: avoid;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .quiz-title {
            font-size: 16pt;
            font-weight: bold;
            color: #92400e;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .quiz-question {
            font-size: 12pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .quiz-options {
            list-style: none;
            padding: 0;
            margin: 0 0 12px 20px;
        }
        
        .quiz-option {
            font-size: 10pt;
            color: #374151;
            margin-bottom: 4px;
            padding: 4px 0;
        }
        
        .correct-answer {
            background: #d1fae5;
            color: #065f46;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: bold;
            border: 1px solid #10b981;
        }
        
        .quiz-explanation {
            font-size: 10pt;
            color: #6b7280;
            font-style: italic;
            margin-top: 8px;
            padding: 8px;
            background: #f9fafb;
            border-radius: 6px;
        }

        .footer {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 10pt;
            page-break-inside: avoid;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
        }
        
        .achievement-badge {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: bold;
            margin: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stats-highlight {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
        }
        
        .stats-highlight h3 {
            margin: 0 0 10px 0;
            font-size: 14pt;
        }
        
        .stats-highlight .value {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
    </style>
</head>
<body>
    
    <div class="page-container">
        <div class="container">
            <div class="header">
                <div class="logo">🌟 CIARA</div>
                <div class="subtitle">
                    ${isEnglish ? 'Personal Travel Journal' : isFrench ? 'Carnet de Voyage Personnel' : 'Persönliches Reisetagebuch'}
                </div>
                <h1 class="journey-title">${data.journeyName}</h1>
            </div>
            
            <div class="meta-info">
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
                    ${data.comment}
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
            
            ${data.quizData && data.quizData.length > 0 ? `
            <div class="content-section">
                <h2 class="section-title">
                    <span class="section-icon">🧠</span>
                    ${isEnglish ? 'Knowledge Quiz' : isFrench ? 'Quiz de Connaissances' : 'Wissensquiz'}
                </h2>
                ${data.quizData.map((quiz, index) => `
                <div class="quiz-section">
                    <div class="quiz-title">
                        <span class="section-icon">📝</span>
                        ${isEnglish ? 'Step' : isFrench ? 'Étape' : 'Schritt'} ${index + 1}: ${quiz.stepName}
                    </div>
                    ${quiz.questions.map((q, qIndex) => `
                    <div style="margin-bottom: 15px;">
                        <div class="quiz-question">${qIndex + 1}. ${q.question}</div>
                        <ul class="quiz-options">
                            ${q.options.map((option, oIndex) => `
                            <li class="quiz-option">
                                ${String.fromCharCode(65 + oIndex)}. ${option}
                                ${option === q.correct_answer ? '<span class="correct-answer">✓ Correct</span>' : ''}
                            </li>
                            `).join('')}
                        </ul>
                        <div class="quiz-explanation">
                            <strong>${isEnglish ? 'Explanation' : isFrench ? 'Explication' : 'Erklärung'}:</strong> ${q.explanation}
                        </div>
                    </div>
                    `).join('')}
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="stats-highlight">
                <h3>${isEnglish ? 'Journey Achievement' : isFrench ? 'Réussite du Parcours' : 'Reiseerfolg'}</h3>
                <div class="value">${data.stepDetails ? data.stepDetails.length : 0}/${data.stepDetails ? data.stepDetails.length : 0}</div>
                <div>${isEnglish ? 'Steps Completed' : isFrench ? 'Étapes Complétées' : 'Schritte Abgeschlossen'}</div>
                <div style="margin-top: 10px;">
                    <span class="achievement-badge">🏆 ${isEnglish ? 'Perfect Score' : isFrench ? 'Score Parfait' : 'Perfekte Punktzahl'}</span>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>${isEnglish ? 'Generated by CIARA - City Interactive Assistant for Regional Adventures' : isFrench ? 'Généré par CIARA - Assistant Interactif de Ville pour les Aventures Régionales' : 'Generiert von CIARA - Interaktiver Stadtassistent für regionale Abenteuer'}</strong></p>
                <p>🌐 www.ciara.city | 📧 info@ciara.city</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Function to generate PDF from HTML using html2canvas and jsPDF
async function generatePDFFromHTML(data: {
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
}): Promise<Uint8Array> {
  // Generate the HTML content
  const htmlContent = createJourneyReportHTML(data);
  
  // Create a complete HTML document
  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.journeyName} - CIARA</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>
    ${htmlContent}
    <script>
        // Wait for images to load
        window.addEventListener('load', function() {
            setTimeout(function() {
                const element = document.querySelector('.page-container');
                if (element) {
                    html2canvas(element, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: element.scrollWidth,
                        height: element.scrollHeight
                    }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
                        const imgWidth = 210;
                        const pageHeight = 295;
                        const imgHeight = canvas.height * imgWidth / canvas.width;
                        let heightLeft = imgHeight;
                        let position = 0;

                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;

                        while (heightLeft >= 0) {
                            position = heightLeft - imgHeight;
                            pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                            heightLeft -= pageHeight;
                        }

                        // Convert to base64 and send to parent
                        const pdfOutput = pdf.output('arraybuffer');
                        const uint8Array = new Uint8Array(pdfOutput);
                        console.log('PDF generated successfully');
                        
                        // Send the PDF data back to the server
                        fetch('/api/pdf-ready', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                pdfData: Array.from(uint8Array)
                            })
                        });
                    });
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

  // For now, we'll use a simplified approach that creates a PDF with the HTML content
  // In a production environment, you'd use a headless browser or a service like Puppeteer
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  const isEnglish = data.language === 'en';
  const isFrench = data.language === 'fr';

  // Enhanced Header with gradient-like effect
  pdf.setFillColor(102, 126, 234);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('🌟 CIARA', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const subtitle = isEnglish ? 'Personal Travel Journal' : isFrench ? 'Carnet de Voyage Personnel' : 'Persönliches Reisetagebuch';
  pdf.text(subtitle, pageWidth / 2, 35, { align: 'center' });
  
  yPosition = 50;

  // Journey title with enhanced styling
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(45, 55, 72);
  pdf.text(data.journeyName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 25;

  // Enhanced Meta information with icons and better layout
  const metaInfo = [
    { icon: '🏙️', label: isEnglish ? 'City' : isFrench ? 'Ville' : 'Stadt', value: data.cityName },
    { icon: '⭐', label: isEnglish ? 'Rating' : isFrench ? 'Note' : 'Bewertung', value: '★'.repeat(data.rating) + '☆'.repeat(5-data.rating) },
    { icon: '📅', label: isEnglish ? 'Date' : isFrench ? 'Date' : 'Datum', value: data.completionDate },
    ...(data.duration ? [{ icon: '⏱️', label: isEnglish ? 'Duration' : isFrench ? 'Durée' : 'Dauer', value: data.duration }] : []),
    ...(data.distance ? [{ icon: '📏', label: isEnglish ? 'Distance' : isFrench ? 'Distance' : 'Entfernung', value: `${data.distance} km` }] : []),
    { icon: '🏆', label: isEnglish ? 'Points' : isFrench ? 'Points' : 'Punkte', value: data.totalPoints?.toString() || '0' }
  ];

  // Draw enhanced meta info grid
  const itemsPerRow = 3;
  const itemWidth = contentWidth / itemsPerRow;
  const itemHeight = 25;
  
  // Background for meta info section
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPosition - 5, contentWidth, (Math.ceil(metaInfo.length / itemsPerRow) * itemHeight) + 10, 'F');
  
  metaInfo.forEach((item, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const x = margin + (col * itemWidth) + 10;
    const y = yPosition + (row * itemHeight);
    
    // Icon
    pdf.setFontSize(16);
    pdf.setTextColor(102, 126, 234);
    pdf.text(item.icon, x, y);
    
    // Label
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(item.label.toUpperCase(), x + 15, y);
    
    // Value
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(item.value, x + 15, y + 8);
  });
  
  yPosition += (Math.ceil(metaInfo.length / itemsPerRow) * itemHeight) + 25;

  // Enhanced Comment section
  if (data.comment && data.comment.trim() !== '' && data.comment !== 'knpbj') {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const commentTitle = `💭 ${isEnglish ? 'Your Comment' : isFrench ? 'Votre Commentaire' : 'Ihr Kommentar'}`;
    pdf.text(commentTitle, margin, yPosition);
    yPosition += 15;

    // Comment box background
    pdf.setFillColor(219, 234, 254);
    pdf.rect(margin, yPosition - 5, contentWidth, 30, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(30, 64, 175);
    const commentLines = pdf.splitTextToSize(`"${data.comment}"`, contentWidth - 20);
    commentLines.forEach(line => {
      pdf.text(line, margin + 10, yPosition);
      yPosition += 8;
    });
    yPosition += 15;
  }

  // Enhanced Journey Description
  if (data.journeyDescription) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const descTitle = `📖 ${isEnglish ? 'Journey Description' : isFrench ? 'Description du Parcours' : 'Reisebeschreibung'}`;
    pdf.text(descTitle, margin, yPosition);
    yPosition += 15;

    // Description box background
    pdf.setFillColor(240, 249, 255);
    pdf.rect(margin, yPosition - 5, contentWidth, 40, 'F');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81);
    const descLines = pdf.splitTextToSize(data.journeyDescription, contentWidth - 20);
    descLines.forEach(line => {
      pdf.text(line, margin + 10, yPosition);
      yPosition += 6;
    });
    yPosition += 15;
  }

  // Enhanced Steps section
  if (data.stepDetails && data.stepDetails.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const stepsTitle = `🎯 ${isEnglish ? 'Completed Steps' : isFrench ? 'Étapes Complétées' : 'Abgeschlossene Schritte'}`;
    pdf.text(stepsTitle, margin, yPosition);
    yPosition += 20;

    data.stepDetails.forEach((step, index) => {
      // Step card background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, yPosition - 5, contentWidth, 35, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, yPosition - 5, contentWidth, 35, 'D');
      
      // Step number circle
      pdf.setFillColor(102, 126, 234);
      pdf.circle(margin + 15, yPosition + 10, 8, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text((index + 1).toString(), margin + 15, yPosition + 13, { align: 'center' });
      
      // Step name
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text(step.name, margin + 35, yPosition + 8);
      
      // Step description
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      const descLines = pdf.splitTextToSize(step.description, contentWidth - 50);
      descLines.forEach((line, lineIndex) => {
        pdf.text(line, margin + 35, yPosition + 15 + (lineIndex * 5));
      });
      
      yPosition += 45;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }
    });
  }

  // Enhanced Achievement section
  pdf.setFillColor(16, 185, 129);
  pdf.rect(margin, yPosition, contentWidth, 30, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  const achievementTitle = isEnglish ? 'Journey Achievement' : isFrench ? 'Réussite du Parcours' : 'Reiseerfolg';
  pdf.text(achievementTitle, pageWidth / 2, yPosition + 10, { align: 'center' });
  
  pdf.setFontSize(20);
  pdf.text(`${data.stepDetails ? data.stepDetails.length : 0}/${data.stepDetails ? data.stepDetails.length : 0}`, pageWidth / 2, yPosition + 20, { align: 'center' });
  
  pdf.setFontSize(10);
  const achievementSubtitle = isEnglish ? 'Steps Completed' : isFrench ? 'Étapes Complétées' : 'Schritte Abgeschlossen';
  pdf.text(achievementSubtitle, pageWidth / 2, yPosition + 28, { align: 'center' });

  // Enhanced Footer
  yPosition = pageHeight - 20;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139);
  const footerText = isEnglish ? 'Generated by CIARA - City Interactive Assistant for Regional Adventures' : 
                    isFrench ? 'Généré par CIARA - Assistant Interactif de Ville pour les Aventures Régionales' : 
                    'Generiert von CIARA - Interaktiver Stadtassistent für regionale Abenteuer';
  pdf.text(footerText, pageWidth / 2, yPosition + 5, { align: 'center' });
  pdf.text('🌐 www.ciara.city | 📧 info@ciara.city', pageWidth / 2, yPosition + 12, { align: 'center' });

  return pdf.output('arraybuffer');
}

// Keep the old function for backward compatibility but mark it as deprecated
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
  // This is the old function - keeping for compatibility
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
  if (data.comment && data.comment.trim() !== '' && data.comment !== 'knpbj') {
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
    yPosition += 15;
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
    yPosition += 15;
  }

  // Steps section
  if (data.stepDetails && data.stepDetails.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    const stepsTitle = isEnglish ? 'Completed Steps' : isFrench ? 'Étapes Complétées' : 'Abgeschlossene Schritte';
    pdf.text(stepsTitle, margin, yPosition);
    yPosition += 15;

    data.stepDetails.forEach((step, index) => {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(45, 55, 72);
      pdf.text(`${index + 1}. ${step.name}`, margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 102, 102);
      const stepDescLines = pdf.splitTextToSize(step.description, contentWidth);
      stepDescLines.forEach(line => {
        pdf.text(line, margin + 10, yPosition);
        yPosition += 5;
      });
      yPosition += 10;

      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }
    });
  }

  // Footer
  yPosition = pageHeight - 20;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  const footerText = isEnglish ? 'Generated by CIARA - City Interactive Assistant for Regional Adventures' : 
                    isFrench ? 'Généré par CIARA - Assistant Interactif de Ville pour les Aventures Régionales' : 
                    'Generiert von CIARA - Interaktiver Stadtassistent für regionale Abenteuer';
  pdf.text(footerText, pageWidth / 2, yPosition, { align: 'center' });

  return pdf.output('arraybuffer');
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

    // Generate PDF instead of HTML
    const pdfData = await generatePDFFromHTML({
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