import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TravelJournalData {
  city: string;
  journey: string;
  date: string;
  completedSteps: number;
  totalSteps: number;
  totalPoints: number;
  steps: Array<{
    name: string;
    description: string;
    completedAt: string;
    points: number;
    imageUrl?: string;
    quiz?: {
      question: string;
      answer: string;
      userAnswer?: string;
      correct: boolean;
    };
  }>;
  userInfo: {
    name: string;
    email: string;
  };
  rating?: number;
  comment?: string;
  duration?: string;
  distance?: number;
  journeyImage?: string;
  insights?: {
    bestTime?: string;
    averageRating?: number;
    popularSteps?: string[];
    completionRate?: number;
  };
}

export const generateTravelJournalPDF = async (
  journalData: TravelJournalData,
  htmlElement?: HTMLElement
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Si on a un élément HTML, on le convertit en image
    if (htmlElement) {
      const canvas = await html2canvas(htmlElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Si l'image est trop haute, on la divise en plusieurs pages
      if (imgHeight > pageHeight - (margin * 2)) {
        const pagesNeeded = Math.ceil(imgHeight / (pageHeight - (margin * 2)));
        
        for (let i = 0; i < pagesNeeded; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const sourceY = i * (canvas.height / pagesNeeded);
          const sourceHeight = canvas.height / pagesNeeded;
          
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            
            const tempImgData = tempCanvas.toDataURL('image/png');
            const tempImgHeight = (sourceHeight * imgWidth) / canvas.width;
            
            pdf.addImage(tempImgData, 'PNG', margin, margin, imgWidth, tempImgHeight);
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      }
    } else {
      // Génération manuelle du PDF riche
      generateRichPDF(pdf, journalData, pageWidth, pageHeight, margin, contentWidth);
    }

    // Téléchargement du PDF
    const fileName = `journal-voyage-${journalData.city}-${journalData.date.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le PDF du journal de voyage');
  }
};

const generateRichPDF = (
  pdf: jsPDF,
  journalData: TravelJournalData,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  contentWidth: number
): void => {
  let yPosition = margin;

  // En-tête avec logo CIARA
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 126, 234); // CIARA blue
  pdf.text('CIARA', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Carnet de Voyage Personnel', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Image du parcours si disponible
  if (journalData.journeyImage) {
    try {
      // Note: En production, il faudrait gérer le chargement d'image depuis URL
      // Pour l'instant, on ajoute un placeholder
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 40, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Image du parcours', pageWidth / 2, yPosition + 20, { align: 'center' });
      yPosition += 50;
    } catch (error) {
      console.warn('Impossible de charger l\'image du parcours:', error);
      yPosition += 10;
    }
  }

  // Titre du parcours
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(45, 55, 72);
  pdf.text(journalData.journey, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Informations générales dans un cadre
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPosition, contentWidth, 35, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(margin, yPosition, contentWidth, 35, 'D');
  
  yPosition += 8;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(45, 55, 72);
  pdf.text(`Ville: ${journalData.city}`, margin + 5, yPosition);
  pdf.text(`Date: ${journalData.date}`, pageWidth / 2, yPosition);
  pdf.text(`Voyageur: ${journalData.userInfo.name}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Durée: ${journalData.duration || 'N/A'}`, margin + 5, yPosition);
  pdf.text(`Distance: ${journalData.distance ? `${journalData.distance} km` : 'N/A'}`, pageWidth / 2, yPosition);
  pdf.text(`Points: ${journalData.totalPoints}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  
  yPosition += 15;

  // Informations du voyageur
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(45, 55, 72);
  pdf.text(`Voyageur: ${journalData.userInfo.name}`, margin, yPosition);
  yPosition += 6;
  if (journalData.rating) {
    pdf.text(`Note donnée: ${journalData.rating}/5`, margin, yPosition);
    yPosition += 6;
  }
  yPosition += 10;

  // Commentaire utilisateur
  if (journalData.comment) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    pdf.text('Votre commentaire', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(45, 55, 72);
    pdf.setFillColor(255, 255, 240);
    pdf.rect(margin, yPosition, contentWidth, 15, 'F');
    pdf.setDrawColor(255, 193, 7);
    pdf.rect(margin, yPosition, contentWidth, 15, 'D');
    
    const commentLines = pdf.splitTextToSize(`"${journalData.comment}"`, contentWidth - 10);
    commentLines.forEach((line, index) => {
      pdf.text(line, margin + 5, yPosition + 5 + (index * 4));
    });
    yPosition += 20;
  }

  // Étapes détaillées avec quiz
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 126, 234);
  pdf.text('Detail des etapes', margin, yPosition);
  yPosition += 10;

  journalData.steps.forEach((step, index) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }

    // Encadré pour chaque étape
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, contentWidth, 0, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, yPosition, contentWidth, 0, 'D');

    // Numéro et nom de l'étape
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.text(`${index + 1}. ${step.name}`, margin + 5, yPosition + 5);
    yPosition += 8;

    // Description
    if (step.description) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const descLines = pdf.splitTextToSize(step.description, contentWidth - 10);
      descLines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      yPosition += 2;
    }

    // Informations de l'étape
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(45, 55, 72);
    pdf.text(`Completée le: ${step.completedAt}`, margin + 5, yPosition);
    yPosition += 4;
    pdf.text(`Points gagnés: ${step.points}`, margin + 5, yPosition);
    yPosition += 4;

    // Quiz si disponible
    if (step.quiz) {
      yPosition += 2;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text(`Quiz: ${step.quiz.question}`, margin + 5, yPosition);
      yPosition += 4;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(45, 55, 72);
      pdf.text(`Réponse correcte: ${step.quiz.answer}`, margin + 5, yPosition);
      yPosition += 4;
      
      if (step.quiz.userAnswer) {
        const isCorrect = step.quiz.correct;
        if (isCorrect) {
          pdf.setTextColor(34, 197, 94);
        } else {
          pdf.setTextColor(239, 68, 68);
        }
        pdf.text(`${isCorrect ? 'Correct' : 'Incorrect'} Votre réponse: ${step.quiz.userAnswer}`, margin + 5, yPosition);
        yPosition += 4;
      }
    }

    yPosition += 8;

    // Ligne de séparation
    if (index < journalData.steps.length - 1) {
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    }
  });

  // Statistiques du parcours
  yPosition += 10;
  
  // Vérifier si on a besoin d'une nouvelle page
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(102, 126, 234);
  pdf.text('Statistiques du parcours', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(45, 55, 72);

  pdf.text(`Étapes complétées: ${journalData.completedSteps}/${journalData.totalSteps}`, margin, yPosition);
  yPosition += 6;
  
  pdf.text(`Points totaux gagnés: ${journalData.totalPoints}`, margin, yPosition);
  yPosition += 6;
  
  if (journalData.rating) {
    pdf.text(`Note donnée: ${journalData.rating}/5`, margin, yPosition);
    yPosition += 6;
  }
  
  const completionPercentage = journalData.totalSteps > 0 ? ((journalData.completedSteps / journalData.totalSteps) * 100).toFixed(1) : '0';
  pdf.text(`Taux de complétion: ${completionPercentage}%`, margin, yPosition);
  yPosition += 6;

  // Pied de page
  const footerY = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  pdf.text('Généré par CIARA - City Interactive Assistant for Regional Adventures', pageWidth / 2, footerY, { align: 'center' });
  pdf.text(`www.ciara.city | info@ciara.city`, pageWidth / 2, footerY + 5, { align: 'center' });
};

// Fonction utilitaire pour créer un élément HTML temporaire pour la conversion
export const createJournalHTML = (journalData: TravelJournalData): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.backgroundColor = 'white';
  container.style.color = '#333';

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #667eea; font-size: 32px; margin: 0;">CIARA</h1>
      <p style="color: #666; font-size: 14px; margin: 10px 0;">Carnet de Voyage Personnel</p>
      <h2 style="font-size: 24px; margin: 20px 0;">${journalData.journey}</h2>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
        <div>
          <div style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold;">Ville</div>
          <div style="font-size: 16px; font-weight: bold;">${journalData.city}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold;">Date</div>
          <div style="font-size: 16px; font-weight: bold;">${journalData.date}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold;">Points</div>
          <div style="font-size: 16px; font-weight: bold;">${journalData.totalPoints}</div>
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #667eea; font-size: 18px; margin-bottom: 15px;">Résumé de votre aventure</h3>
      <p><strong>Étapes complétées:</strong> ${journalData.completedSteps}/${journalData.totalSteps}</p>
      <p><strong>Taux de complétion:</strong> ${((journalData.completedSteps / journalData.totalSteps) * 100).toFixed(1)}%</p>
    </div>
    
    <div>
      <h3 style="color: #667eea; font-size: 18px; margin-bottom: 15px;">Détail des étapes</h3>
      ${journalData.steps.map((step, index) => `
        <div style="background: #f8fafc; margin-bottom: 15px; padding: 15px; border-radius: 8px; border-left: 3px solid #667eea;">
          <h4 style="margin: 0 0 10px 0; font-size: 16px;">${index + 1}. ${step.name}</h4>
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">${step.description}</p>
          <div style="font-size: 12px; color: #666;">
            <span><strong>Complétée le:</strong> ${step.completedAt}</span> | 
            <span><strong>Points gagnés:</strong> ${step.points}</span>
          </div>
          ${step.quiz ? `
            <div style="margin-top: 10px; padding: 10px; background: #e0f2fe; border-radius: 4px;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #0277bd;">Quiz:</p>
              <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Question:</strong> ${step.quiz.question}</p>
              <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Réponse:</strong> ${step.quiz.answer}</p>
              ${step.quiz.userAnswer ? `
                <p style="margin: 0; font-size: 12px; color: ${step.quiz.correct ? '#2e7d32' : '#c62828'};">
                  <strong>Votre réponse:</strong> ${step.quiz.userAnswer} ${step.quiz.correct ? 'Correct' : 'Incorrect'}
                </p>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #666; font-size: 12px;">
      <p>Généré par CIARA - City Interactive Assistant for Regional Adventures</p>
      <p>www.ciara.city | info@ciara.city</p>
    </div>
  `;

  return container;
}; 