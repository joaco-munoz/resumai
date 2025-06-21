
import { jsPDF } from 'jspdf';

export const downloadCVAsPDF = (cvData: any, filename: string) => {
  try {
    // Create new PDF document
    const pdf = new jsPDF();
    
    // Set font and colors
    pdf.setFont('helvetica');
    
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: string = '#000000') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color);
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > 270) { // Check if we need a new page
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.6;
      });
      yPosition += 3; // Add extra space after text block
    };
    
    // Helper function to add section separator
    const addSectionSeparator = () => {
      yPosition += 8;
    };
    
    // Header - Personal Info (matching CVPreview center alignment)
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#111827'); // text-gray-900
    const nameWidth = pdf.getTextWidth(cvData.personalInfo.fullName);
    const nameX = (pageWidth - nameWidth) / 2;
    pdf.text(cvData.personalInfo.fullName, nameX, yPosition);
    yPosition += 18;
    
    // Contact info line (centered, with bullets)
    const contactInfo = [
      cvData.personalInfo.email,
      cvData.personalInfo.phone,
      cvData.personalInfo.location
    ].filter(Boolean).join(' • ');
    
    if (contactInfo) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#6B7280'); // text-gray-600
      const contactWidth = pdf.getTextWidth(contactInfo);
      const contactX = (pageWidth - contactWidth) / 2;
      pdf.text(contactInfo, contactX, yPosition);
      yPosition += 12;
    }
    
    // Links info line (centered, with bullets)
    const linksInfo = [
      cvData.personalInfo.linkedin,
      cvData.personalInfo.website
    ].filter(Boolean).join(' • ');
    
    if (linksInfo) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#6B7280'); // text-gray-600
      const linksWidth = pdf.getTextWidth(linksInfo);
      const linksX = (pageWidth - linksWidth) / 2;
      pdf.text(linksInfo, linksX, yPosition);
      yPosition += 12;
    }
    
    // Header separator line
    pdf.setDrawColor(229, 231, 235); // border-gray-200
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Summary Section
    if (cvData.summary) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#111827'); // text-gray-900
      pdf.text('Resumen Profesional', margin, yPosition);
      yPosition += 12;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#374151'); // text-gray-700
      const summaryLines = pdf.splitTextToSize(cvData.summary, contentWidth);
      summaryLines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });
      addSectionSeparator();
    }
    
    // Experience Section
    if (cvData.experience && cvData.experience.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#111827'); // text-gray-900
      pdf.text('Experiencia Laboral', margin, yPosition);
      yPosition += 12;
      
      cvData.experience.forEach((exp: any, index: number) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Left border line (matching the blue border from CVPreview)
        pdf.setDrawColor('#3B82F6'); // brand-500 blue
        pdf.setLineWidth(2);
        pdf.line(margin, yPosition - 3, margin, yPosition + 25);
        pdf.setLineWidth(0.2);
        
        // Position (bold, matching CVPreview)
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#111827'); // text-gray-900
        pdf.text(exp.position, margin + 8, yPosition);
        yPosition += 8;
        
        // Company (blue color, matching CVPreview)
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#3B82F6'); // brand-600
        pdf.text(exp.company, margin + 8, yPosition);
        
        // Date range (right aligned, matching CVPreview)
        const dateRange = `${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}`;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#6B7280'); // text-gray-500
        const dateWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, pageWidth - margin - dateWidth, yPosition);
        yPosition += 10;
        
        // Description
        if (exp.description) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor('#374151'); // text-gray-700
          const descLines = pdf.splitTextToSize(exp.description, contentWidth - 15);
          descLines.forEach((line: string) => {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, margin + 8, yPosition);
            yPosition += 6;
          });
        }
        
        yPosition += 8; // Space between experiences
      });
      
      addSectionSeparator();
    }
    
    // Education Section
    if (cvData.education && cvData.education.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#111827'); // text-gray-900
      pdf.text('Educación', margin, yPosition);
      yPosition += 12;
      
      cvData.education.forEach((edu: any) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Left border line (green for education, matching CVPreview)
        pdf.setDrawColor('#10B981'); // success-500 green
        pdf.setLineWidth(2);
        pdf.line(margin, yPosition - 3, margin, yPosition + 20);
        pdf.setLineWidth(0.2);
        
        // Degree (bold)
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#111827'); // text-gray-900
        pdf.text(edu.degree, margin + 8, yPosition);
        yPosition += 8;
        
        // Institution (green color)
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#10B981'); // success-600
        pdf.text(edu.institution, margin + 8, yPosition);
        
        // Year (right aligned)
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#6B7280'); // text-gray-500
        const yearWidth = pdf.getTextWidth(edu.year);
        pdf.text(edu.year, pageWidth - margin - yearWidth, yPosition);
        yPosition += 8;
        
        // Description if exists
        if (edu.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor('#6B7280'); // text-gray-600
          const eduDescLines = pdf.splitTextToSize(edu.description, contentWidth - 15);
          eduDescLines.forEach((line: string) => {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, margin + 8, yPosition);
            yPosition += 5;
          });
        }
        
        yPosition += 8; // Space between education entries
      });
      
      addSectionSeparator();
    }
    
    // Skills Section
    if (cvData.skills && cvData.skills.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#111827'); // text-gray-900
      pdf.text('Habilidades', margin, yPosition);
      yPosition += 12;
      
      // Create skills as badges (similar to CVPreview but simplified for PDF)
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#374151'); // text-gray-700
      
      let currentX = margin;
      let lineHeight = 8;
      
      cvData.skills.forEach((skill: string, index: number) => {
        const skillText = skill;
        const textWidth = pdf.getTextWidth(skillText);
        const badgeWidth = textWidth + 8; // padding
        
        // Check if we need a new line
        if (currentX + badgeWidth > pageWidth - margin) {
          currentX = margin;
          yPosition += lineHeight + 4;
        }
        
        // Draw badge background (light gray border)
        pdf.setDrawColor('#D1D5DB'); // border-gray-300
        pdf.setFillColor('#F9FAFB'); // bg-gray-50
        pdf.roundedRect(currentX, yPosition - 6, badgeWidth, lineHeight, 2, 2, 'FD');
        
        // Draw skill text
        pdf.text(skillText, currentX + 4, yPosition);
        
        currentX += badgeWidth + 6; // spacing between badges
      });
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};
