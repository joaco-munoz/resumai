
import jsPDF from 'jsPDF';

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
        yPosition += fontSize * 0.5;
      });
      yPosition += 5; // Add extra space after text block
    };
    
    // Header - Personal Info
    addText(cvData.personalInfo.fullName, 20, true, '#2563eb');
    
    const contactInfo = [
      cvData.personalInfo.email,
      cvData.personalInfo.phone,
      cvData.personalInfo.location
    ].filter(Boolean).join(' • ');
    
    addText(contactInfo, 10, false, '#666666');
    
    const linksInfo = [
      cvData.personalInfo.linkedin,
      cvData.personalInfo.website
    ].filter(Boolean).join(' • ');
    
    if (linksInfo) {
      addText(linksInfo, 10, false, '#666666');
    }
    
    yPosition += 10;
    
    // Add a line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Summary Section
    if (cvData.summary) {
      addText('RESUMEN PROFESIONAL', 14, true, '#2563eb');
      addText(cvData.summary, 11);
    }
    
    // Experience Section
    if (cvData.experience && cvData.experience.length > 0) {
      addText('EXPERIENCIA LABORAL', 14, true, '#2563eb');
      
      cvData.experience.forEach((exp: any) => {
        // Position and Company
        addText(exp.position, 12, true);
        addText(exp.company, 11, false, '#2563eb');
        
        // Date range
        const dateRange = `${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}`;
        addText(dateRange, 10, false, '#666666');
        
        // Description
        if (exp.description) {
          addText(exp.description, 11);
        }
        
        yPosition += 5; // Extra space between experiences
      });
    }
    
    // Education Section
    if (cvData.education && cvData.education.length > 0) {
      addText('EDUCACIÓN', 14, true, '#2563eb');
      
      cvData.education.forEach((edu: any) => {
        addText(edu.degree, 12, true);
        addText(edu.institution, 11, false, '#2563eb');
        addText(edu.year, 10, false, '#666666');
        
        if (edu.description) {
          addText(edu.description, 10, false, '#666666');
        }
        
        yPosition += 5;
      });
    }
    
    // Skills Section
    if (cvData.skills && cvData.skills.length > 0) {
      addText('HABILIDADES', 14, true, '#2563eb');
      
      // Group skills in lines of reasonable length
      const skillsText = cvData.skills.join(' • ');
      addText(skillsText, 11);
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el PDF');
  }
};
