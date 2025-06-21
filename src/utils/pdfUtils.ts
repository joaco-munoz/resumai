
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
    pdf.setFontSize(16);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(0, 0, 0); // Black
    const nameWidth = pdf.getTextWidth(cvData.personalInfo.fullName);
    const nameX = (pageWidth - nameWidth) / 2;
    pdf.text(cvData.personalInfo.fullName, nameX, yPosition);
    yPosition += 10;
    
    // Contact info (centered, each line separate - Harvard style)
    pdf.setFontSize(11);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const contactLines = [
      cvData.personalInfo.location,
      cvData.personalInfo.phone,
      cvData.personalInfo.email,
      cvData.personalInfo.linkedin,
      cvData.personalInfo.website
    ].filter(Boolean);
    
    contactLines.forEach(line => {
      const lineWidth = pdf.getTextWidth(line);
      const lineX = (pageWidth - lineWidth) / 2;
      pdf.text(line, lineX, yPosition);
      yPosition += 5;
    });
    
    // Header separator line
    yPosition += 5;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Summary Section
    if (cvData.summary) {
      checkNewPage(20);
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('RESUMEN PROFESIONAL', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('times', 'normal');
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
      pdf.text('EXPERIENCIA LABORAL', margin, yPosition);
      yPosition += 8;
      
      cvData.experience.forEach((exp: any) => {
        checkNewPage(25);
        
        // Position and date (Harvard style - position left, date right)
        pdf.setFontSize(11);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(exp.position, margin, yPosition);
        
        const dateRange = `${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}`;
        const dateWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, pageWidth - margin - dateWidth, yPosition);
        yPosition += 6;
        
        // Company (italic)
        pdf.setFont('times', 'italic');
        pdf.text(exp.company, margin, yPosition);
        yPosition += 8;
        
        // Description (indented)
        if (exp.description) {
          pdf.setFont('times', 'normal');
          const descLines = pdf.splitTextToSize(exp.description, contentWidth - 10);
          descLines.forEach((line: string) => {
            checkNewPage();
            pdf.text(line, margin + 10, yPosition);
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
      yPosition += 8;
      
      cvData.education.forEach((edu: any) => {
        checkNewPage(20);
        
        // Degree and year (Harvard style)
        pdf.setFontSize(11);
        pdf.setFont('times', 'bold');
        pdf.text(edu.degree, margin, yPosition);
        
        const yearWidth = pdf.getTextWidth(edu.year);
        pdf.text(edu.year, pageWidth - margin - yearWidth, yPosition);
        yPosition += 6;
        
        // Institution (italic)
        pdf.setFont('times', 'italic');
        pdf.text(edu.institution, margin, yPosition);
        yPosition += 6;
        
        // Description if exists
        if (edu.description) {
          pdf.setFont('times', 'normal');
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
      pdf.text('HABILIDADES', margin, yPosition);
      yPosition += 8;
      
      // Skills as continuous text with bullets (Harvard style)
      pdf.setFontSize(11);
      pdf.setFont('times', 'normal');
      const skillsText = cvData.skills.join(' • ');
      const skillsLines = pdf.splitTextToSize(skillsText, contentWidth);
      skillsLines.forEach((line: string) => {
        checkNewPage();
        pdf.text(line, margin, yPosition);
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
