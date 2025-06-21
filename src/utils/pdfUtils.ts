
import { jsPDF } from 'jspdf';

export const downloadCVAsPDF = (cvData: any, filename: string) => {
  try {
    // Create new PDF document
    const pdf = new jsPDF();
    
    // Set font to Times (closest to serif for Harvard style)
    pdf.setFont('times');
    
    let yPosition = 25;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to check for new page
    const checkNewPage = (additionalSpace: number = 15) => {
      if (yPosition + additionalSpace > pageHeight - 25) {
        pdf.addPage();
        yPosition = 25;
      }
    };
    
    // Header - Harvard style (centered)
    pdf.setFontSize(20);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(0, 0, 0);
    const nameWidth = pdf.getTextWidth(cvData.personalInfo.fullName);
    const nameX = (pageWidth - nameWidth) / 2;
    pdf.text(cvData.personalInfo.fullName, nameX, yPosition);
    yPosition += 6;
    
    // Contact info (centered, single line - Harvard style)
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const contactParts = [
      cvData.personalInfo.location,
      cvData.personalInfo.linkedin,
      cvData.personalInfo.phone,
      cvData.personalInfo.email
    ].filter(Boolean);
    
    const contactInfo = contactParts.join(' • ');
    const contactWidth = pdf.getTextWidth(contactInfo);
    const contactX = (pageWidth - contactWidth) / 2;
    pdf.text(contactInfo, contactX, yPosition);
    yPosition += 6;
    
    // Header separator line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    // Summary Section (italic paragraph)
    if (cvData.summary && cvData.summary.trim()) {
      checkNewPage(20);
      pdf.setFontSize(10);
      pdf.setFont('times', 'italic');
      pdf.setTextColor(0, 0, 0);
      
      const summaryLines = pdf.splitTextToSize(cvData.summary, contentWidth);
      summaryLines.forEach((line: string) => {
        checkNewPage(5);
        pdf.text(line, margin, yPosition);
        yPosition += 4.5;
      });
      yPosition += 8;
    }
    
    // Experience Section
    if (cvData.experience && cvData.experience.length > 0) {
      checkNewPage(25);
      
      // Section header
      pdf.setFontSize(11);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EXPERIENCIA PROFESIONAL', margin, yPosition);
      yPosition += 2;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      cvData.experience.forEach((exp: any, index: number) => {
        checkNewPage(30);
        
        // Company name (left, bold) and Location (right, bold)
        pdf.setFontSize(10);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(exp.company, margin, yPosition);
        
        const locationText = cvData.personalInfo.location;
        const locationWidth = pdf.getTextWidth(locationText);
        pdf.text(locationText, pageWidth - margin - locationWidth, yPosition);
        yPosition += 5;
        
        // Position (left, italic) and dates (right, italic)
        pdf.setFont('times', 'italic');
        pdf.text(exp.position, margin, yPosition);
        
        const dateRange = `${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}`;
        const dateWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, pageWidth - margin - dateWidth, yPosition);
        yPosition += 6;
        
        // Description as bullet points
        if (exp.description && exp.description.trim()) {
          pdf.setFont('times', 'normal');
          const descLines = exp.description.split('\n').filter((line: string) => line.trim());
          
          descLines.forEach((line: string) => {
            const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
            if (!cleanLine) return;
            
            checkNewPage(5);
            pdf.text('•', margin, yPosition);
            
            const bulletLines = pdf.splitTextToSize(cleanLine, contentWidth - 8);
            bulletLines.forEach((bulletLine: string, lineIndex: number) => {
              if (lineIndex > 0) {
                checkNewPage(5);
                yPosition += 4.5;
              }
              pdf.text(bulletLine, margin + 6, yPosition);
            });
            yPosition += 4.5;
          });
        }
        
        // Add spacing after each experience entry except the last
        if (index < cvData.experience.length - 1) {
          yPosition += 6;
        }
      });
      
      yPosition += 8;
    }
    
    // Education Section
    if (cvData.education && cvData.education.length > 0) {
      checkNewPage(25);
      
      // Section header
      pdf.setFontSize(11);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EDUCACIÓN', margin, yPosition);
      yPosition += 2;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      cvData.education.forEach((edu: any, index: number) => {
        checkNewPage(25);
        
        // Institution (left, bold uppercase) and Location (right, bold)
        pdf.setFontSize(10);
        pdf.setFont('times', 'bold');
        pdf.text(edu.institution.toUpperCase(), margin, yPosition);
        
        const locationText = cvData.personalInfo.location;
        const locationWidth = pdf.getTextWidth(locationText);
        pdf.text(locationText, pageWidth - margin - locationWidth, yPosition);
        yPosition += 5;
        
        // Degree (left) and year (right, italic)
        pdf.setFont('times', 'normal');
        pdf.text(edu.degree, margin, yPosition);
        
        pdf.setFont('times', 'italic');
        const yearWidth = pdf.getTextWidth(edu.year);
        pdf.text(edu.year, pageWidth - margin - yearWidth, yPosition);
        yPosition += 5;
        
        // Description if exists (italic)
        if (edu.description && edu.description.trim()) {
          pdf.setFont('times', 'italic');
          const eduDescLines = pdf.splitTextToSize(edu.description, contentWidth);
          
          eduDescLines.forEach((line: string) => {
            checkNewPage(5);
            pdf.text(line, margin, yPosition);
            yPosition += 4.5;
          });
        }
        
        // Add spacing after each education entry except the last
        if (index < cvData.education.length - 1) {
          yPosition += 6;
        }
      });
      
      yPosition += 8;
    }
    
    // Skills Section
    if (cvData.skills && cvData.skills.length > 0) {
      checkNewPage(20);
      
      // Section header
      pdf.setFontSize(11);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('SKILLS ADICIONALES', margin, yPosition);
      yPosition += 2;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Skills as bullet points - improved layout to match preview
      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      
      let currentLine = '';
      let currentX = margin;
      const skillSpacing = 20; // Space between skills horizontally
      const maxWidth = contentWidth - 20; // Leave some margin
      
      cvData.skills.forEach((skill: string, index: number) => {
        const skillText = `• ${skill}`;
        const skillWidth = pdf.getTextWidth(skillText);
        
        // Check if we need to move to next line
        if (currentX + skillWidth > margin + maxWidth && currentX > margin) {
          yPosition += 5;
          currentX = margin;
          checkNewPage(5);
        }
        
        pdf.text(skillText, currentX, yPosition);
        currentX += skillWidth + skillSpacing;
        
        // If this is the last skill or we're close to the right margin, move to next line
        if (index === cvData.skills.length - 1 || currentX > margin + maxWidth - 50) {
          if (index < cvData.skills.length - 1) {
            yPosition += 5;
            currentX = margin;
            checkNewPage(5);
          }
        }
      });
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};
