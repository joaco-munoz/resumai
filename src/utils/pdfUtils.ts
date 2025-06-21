
import { jsPDF } from 'jspdf';

export const downloadCVAsPDF = (cvData: any, filename: string) => {
  try {
    // Create new PDF document
    const pdf = new jsPDF();
    
    // Set font to Times (closest to serif for Harvard style)
    pdf.setFont('times');
    
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to check for new page
    const checkNewPage = (additionalSpace: number = 10) => {
      if (yPosition + additionalSpace > 270) {
        pdf.addPage();
        yPosition = 20;
      }
    };
    
    // Header - Harvard style (centered)
    pdf.setFontSize(18);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(0, 0, 0); // Black
    const nameWidth = pdf.getTextWidth(cvData.personalInfo.fullName);
    const nameX = (pageWidth - nameWidth) / 2;
    pdf.text(cvData.personalInfo.fullName, nameX, yPosition);
    yPosition += 8;
    
    // Contact info (centered, single line - Harvard style)
    pdf.setFontSize(11);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const contactInfo = [
      cvData.personalInfo.location,
      cvData.personalInfo.linkedin,
      cvData.personalInfo.phone,
      cvData.personalInfo.email,
      cvData.personalInfo.website
    ].filter(Boolean).join(' • ');
    
    const contactWidth = pdf.getTextWidth(contactInfo);
    const contactX = (pageWidth - contactWidth) / 2;
    pdf.text(contactInfo, contactX, yPosition);
    yPosition += 10;
    
    // Header separator line
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Summary Section (italic paragraph)
    if (cvData.summary) {
      checkNewPage(20);
      pdf.setFontSize(11);
      pdf.setFont('times', 'italic');
      pdf.setTextColor(0, 0, 0);
      const summaryLines = pdf.splitTextToSize(cvData.summary, contentWidth);
      summaryLines.forEach((line: string) => {
        checkNewPage();
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }
    
    // Experience Section
    if (cvData.experience && cvData.experience.length > 0) {
      checkNewPage(20);
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EXPERIENCIA PROFESIONAL', margin, yPosition);
      yPosition += 3;
      
      // Underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      cvData.experience.forEach((exp: any) => {
        checkNewPage(25);
        
        // Company name (left, bold) and Location (right, bold)
        pdf.setFontSize(11);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(exp.company, margin, yPosition);
        
        const locationWidth = pdf.getTextWidth(cvData.personalInfo.location);
        pdf.text(cvData.personalInfo.location, pageWidth - margin - locationWidth, yPosition);
        yPosition += 6;
        
        // Position (left, italic) and dates (right, italic)
        pdf.setFont('times', 'italic');
        pdf.text(exp.position, margin, yPosition);
        
        const dateRange = `${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}`;
        const dateWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, pageWidth - margin - dateWidth, yPosition);
        yPosition += 8;
        
        // Description as bullet points
        if (exp.description) {
          pdf.setFont('times', 'normal');
          const descLines = exp.description.split('\n').filter((line: string) => line.trim());
          descLines.forEach((line: string) => {
            checkNewPage();
            pdf.text('•', margin, yPosition);
            const bulletLines = pdf.splitTextToSize(line.trim(), contentWidth - 10);
            bulletLines.forEach((bulletLine: string, index: number) => {
              if (index > 0) {
                checkNewPage();
                yPosition += 5;
              }
              pdf.text(bulletLine, margin + 6, yPosition);
            });
            yPosition += 5;
          });
        }
        
        yPosition += 8;
      });
    }
    
    // Education Section
    if (cvData.education && cvData.education.length > 0) {
      checkNewPage(20);
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EDUCACIÓN', margin, yPosition);
      yPosition += 3;
      
      // Underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      cvData.education.forEach((edu: any) => {
        checkNewPage(20);
        
        // Institution (left, bold uppercase) and Location (right, bold)
        pdf.setFontSize(11);
        pdf.setFont('times', 'bold');
        pdf.text(edu.institution.toUpperCase(), margin, yPosition);
        
        const locationWidth = pdf.getTextWidth(cvData.personalInfo.location);
        pdf.text(cvData.personalInfo.location, pageWidth - margin - locationWidth, yPosition);
        yPosition += 6;
        
        // Degree (left) and year (right, italic)
        pdf.setFont('times', 'normal');
        pdf.text(edu.degree, margin, yPosition);
        
        pdf.setFont('times', 'italic');
        const yearWidth = pdf.getTextWidth(edu.year);
        pdf.text(edu.year, pageWidth - margin - yearWidth, yPosition);
        yPosition += 6;
        
        // Description if exists (italic)
        if (edu.description) {
          pdf.setFont('times', 'italic');
          const eduDescLines = pdf.splitTextToSize(edu.description, contentWidth);
          eduDescLines.forEach((line: string) => {
            checkNewPage();
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          });
        }
        
        yPosition += 8;
      });
    }
    
    // Skills Section
    if (cvData.skills && cvData.skills.length > 0) {
      checkNewPage(15);
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('SKILLS ADICIONALES', margin, yPosition);
      yPosition += 3;
      
      // Underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Skills as bullet points
      pdf.setFontSize(11);
      pdf.setFont('times', 'normal');
      cvData.skills.forEach((skill: string) => {
        checkNewPage();
        pdf.text('•', margin, yPosition);
        pdf.text(skill, margin + 6, yPosition);
        yPosition += 5;
      });
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};
