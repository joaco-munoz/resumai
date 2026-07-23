
import { jsPDF } from 'jspdf';
import { formatDateToSpanish } from './dateUtils';
import { CVData } from '@/types/cv';

export const downloadCVAsPDF = (cvData: CVData, filename: string, shouldAddWatermark: boolean = false) => {
  try {
    // Create new PDF document - A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configurar la fuente STIX Two Text para coincidir con el preview
    // Como jsPDF no tiene nativamente STIX Two Text, la configuración de fuente
    // debe aproximarse con la mejor alternativa disponible
    // Se recomienda usar la librería vfs_fonts.js con STIX Two Text si se necesita exactamente
    pdf.setFont('times', 'normal'); // Usar times como la mejor aproximación por defecto
    
    let yPosition = 15;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 12; // Reducido significativamente para que el contenido esté más cerca de los bordes
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to check for new page
    const checkNewPage = (additionalSpace: number = 15) => {
      if (yPosition + additionalSpace > pageHeight - 15) {
        pdf.addPage();
        yPosition = 15;
        
        // Add watermark to new page if needed
        if (shouldAddWatermark) {
          addWatermarkToPDF(pdf, pageWidth, pageHeight);
        }
      }
    };
    
    // Add watermark to first page if needed
    if (shouldAddWatermark) {
      addWatermarkToPDF(pdf, pageWidth, pageHeight);
    }
    
    // Header - Harvard style (centered) - Matching text-3xl (24px) in preview
    pdf.setFontSize(20); // Aumentado ligeramente para mayor impacto visual
    pdf.setFont('times', 'bold');
    pdf.setTextColor(0, 0, 0);
    const nameWidth = pdf.getTextWidth(cvData.personalInfo.fullName);
    const nameX = (pageWidth - nameWidth) / 2;
    pdf.text(cvData.personalInfo.fullName, nameX, yPosition);
    yPosition += 5;
    
    // Contact info (centered, single line - Harvard style)
    pdf.setFontSize(9); // Equivalent to text-sm in preview
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const contactParts = [
      cvData.personalInfo.location,
      cvData.personalInfo.linkedin,
      cvData.personalInfo.phone,
      cvData.personalInfo.email
    ].filter(Boolean);
    
    // Add website if it exists
    if (cvData.personalInfo.website) {
      contactParts.push(cvData.personalInfo.website);
    }
    
    const contactInfo = contactParts.join(' • ');
    const contactWidth = pdf.getTextWidth(contactInfo);
    const contactX = (pageWidth - contactWidth) / 2;
    pdf.text(contactInfo, contactX, yPosition);
    yPosition += 4;
    
    // Header separator line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;
    
    // Summary Section (italic paragraph)
    if (cvData.summary && cvData.summary.trim()) {
      checkNewPage(20);
      pdf.setFontSize(9); // Equivalent to text-sm in preview
      pdf.setFont('times', 'italic');
      pdf.setTextColor(0, 0, 0);
      
      const summaryLines = pdf.splitTextToSize(cvData.summary, contentWidth);
      summaryLines.forEach((line: string) => {
        checkNewPage(5);
        pdf.text(line, margin, yPosition);
        yPosition += 4;
      });
      yPosition += 6;
    }
    
    // Experience Section
    if (cvData.experience && cvData.experience.length > 0) {
      checkNewPage(25);
      
      // Section header
      pdf.setFontSize(10); // Equivalent to text-base in preview
      pdf.setFont('serif', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EXPERIENCIA PROFESIONAL', margin, yPosition);
      yPosition += 2;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;
      
      cvData.experience.forEach((exp: any, index: number) => {
        checkNewPage(30);
        
        // Company name (left, bold) and Location (right, bold)
        pdf.setFontSize(9); // Equivalent to text-sm in preview
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(exp.company, margin, yPosition);
        
        const locationText = exp.location || cvData.personalInfo.location;
        const locationWidth = pdf.getTextWidth(locationText);
        pdf.text(locationText, pageWidth - margin - locationWidth, yPosition);
        yPosition += 4;
        
        // Position (left, italic) and dates (right, italic)
        pdf.setFont('serif', 'italic');
        pdf.text(exp.position, margin, yPosition);
        
        const dateRange = `${formatDateToSpanish(exp.startDate)} - ${exp.current ? 'Presente' : formatDateToSpanish(exp.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, pageWidth - margin - dateWidth, yPosition);
        yPosition += 5;
        
        // Description as bullet points
        if (exp.description && exp.description.trim()) {
          pdf.setFont('times', 'normal');
          const descLines = exp.description.split('\n').filter((line: string) => line.trim());
          
          descLines.forEach((line: string) => {
            const cleanLine = line.trim().replace(/^[•\-*]\s*/, '');
            if (!cleanLine) return;
            
            checkNewPage(5);
            pdf.text('•', margin, yPosition);
            
            const bulletLines = pdf.splitTextToSize(cleanLine, contentWidth - 8);
            bulletLines.forEach((bulletLine: string, lineIndex: number) => {
              if (lineIndex > 0) {
                checkNewPage(5);
                yPosition += 4;
              }
              pdf.text(bulletLine, margin + 6, yPosition);
            });
            yPosition += 4; // Reduced spacing to match preview's mb-1
          });
        }
        
        // Add spacing after each experience entry except the last
        if (index < cvData.experience.length - 1) {
          yPosition += 4;
        }
      });
      
      yPosition += 6;
    }
    
    // Education Section
    if (cvData.education && cvData.education.length > 0) {
      checkNewPage(25);
      
      // Section header
      pdf.setFontSize(10); // Equivalent to text-base in preview
      pdf.setFont('serif', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EDUCACIÓN', margin, yPosition);
      yPosition += 2;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;
      
      cvData.education.forEach((edu: any, index: number) => {
        checkNewPage(25);
        
        // Institution (left, bold uppercase) and Location (right, bold)
        pdf.setFontSize(9); // Equivalent to text-sm in preview
        pdf.setFont('serif', 'bold');
        pdf.text(edu.institution.toUpperCase(), margin, yPosition);
        
        const locationText = edu.location || cvData.personalInfo.location;
        const locationWidth = pdf.getTextWidth(locationText);
        pdf.text(locationText, pageWidth - margin - locationWidth, yPosition);
        yPosition += 4;
        
        // Degree (left) and year (right, italic)
        pdf.setFont('times', 'normal');
        pdf.text(edu.degree, margin, yPosition);
        
        pdf.setFont('times', 'italic');
        const yearWidth = pdf.getTextWidth(edu.year);
        pdf.text(edu.year, pageWidth - margin - yearWidth, yPosition);
        yPosition += 4;
        
        // Description if exists (italic)
        if (edu.description && edu.description.trim()) {
          pdf.setFont('times', 'italic');
          const eduDescLines = pdf.splitTextToSize(edu.description, contentWidth);
          
          eduDescLines.forEach((line: string) => {
            checkNewPage(5);
            pdf.text(line, margin, yPosition);
            yPosition += 4;
          });
        }
        
        // Add spacing after each education entry except the last
        if (index < cvData.education.length - 1) {
          yPosition += 4;
        }
      });
      
      yPosition += 6;
    }
    
    // Skills Section
    if (cvData.skills && cvData.skills.length > 0) {
      checkNewPage(20);
      
      // Section header
      pdf.setFontSize(10); // Equivalent to text-base in preview
      pdf.setFont('serif', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('SKILLS ADICIONALES', margin, yPosition);
      yPosition += 2;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;
      
      // Skills as bullet points - improved layout to match preview
      pdf.setFontSize(9); // Equivalent to text-sm in preview
      pdf.setFont('times', 'normal');
      
      // Implementación de skills distribuidas en columnas para ocupar todo el ancho
      const columns = 3; // Ajusta este valor si deseas más o menos columnas
      const columnWidth = (pageWidth - margin * 2) / columns;
      const lineHeight = 4.5;

      const totalRows = Math.ceil(cvData.skills.length / columns);

      for (let row = 0; row < totalRows; row++) {
        checkNewPage(lineHeight);
        for (let col = 0; col < columns; col++) {
          const index = row * columns + col;
          if (index >= cvData.skills.length) break;

          const skillText = `• ${cvData.skills[index]}`;
          const x = margin + col * columnWidth;
          pdf.text(skillText, x, yPosition);
        }
        yPosition += lineHeight;
      }
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};

// Function to add watermark to PDF
const addWatermarkToPDF = (pdf: jsPDF, pageWidth: number, pageHeight: number) => {
  // Store current state
  const currentFontSize: number = 12; // Default fallback
  const currentTextColor: string = '#000000'; // Default fallback
  
  // Set watermark properties
  pdf.setFontSize(60);
  pdf.setTextColor(200, 200, 200); // Light gray
  pdf.setFont('times', 'bold');
  
  // Calculate center position
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Add rotated watermark text
  pdf.text('RESUMAI.DEV', centerX, centerY, {
    angle: 45,
    align: 'center'
  });
  
  // Add smaller watermark at the bottom
  pdf.setFontSize(12);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Creado con ResumeAI.dev - Plan Gratuito', centerX, pageHeight - 15, {
    align: 'center'
  });
  
  // Restore original state
  pdf.setFontSize(currentFontSize);
  pdf.setTextColor(currentTextColor);
};
