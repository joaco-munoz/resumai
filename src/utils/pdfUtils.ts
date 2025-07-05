
import jsPDF from 'jspdf';
import { CVData } from '@/types/cv';
import { supabase } from '@/integrations/supabase/client';

// Function to add text with auto-wrapping
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number = 180, lineHeight: number = 7): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = doc.getTextWidth(testLine);

    if (testWidth > maxWidth && i > 0) {
      doc.text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  doc.text(line.trim(), x, currentY);
  return currentY;
};

// Function to calculate the remaining height on the current page
const remainingPageHeight = (doc: jsPDF, currentY: number, pageHeight: number, bottomMargin: number = 10) => {
  return pageHeight - currentY - bottomMargin;
};

// Function to add a new page if needed
const addNewPage = (doc: jsPDF, currentY: number, pageHeight: number, bottomMargin: number = 10) => {
  if (remainingPageHeight(doc, currentY, pageHeight, bottomMargin) < 20) {
    doc.addPage();
    return 20; // Reset Y position to top margin on new page
  }
  return currentY;
};

export const generatePDF = async (cvData: CVData, templateName: string = 'modern'): Promise<void> => {
  try {
    // Verificar límites de exportación
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: canExport, error } = await supabase
        .rpc('can_use_feature', {
          p_user_id: user.id,
          p_feature_type: 'pdf_export'
        });

      if (error) {
        console.error('Error checking export limits:', error);
        throw new Error('Error al verificar límites de exportación');
      }

      if (!canExport) {
        throw new Error('Has alcanzado tu límite de exportaciones PDF. Actualiza a Pro para exportaciones ilimitadas.');
      }

      // Incrementar uso después de verificar
      await supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_type: 'pdf_export'
      });
    }

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const doc = new jsPDF('p', 'mm', 'a4');
    let currentY = margin;

    // Personal Information
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    currentY = addNewPage(doc, currentY, pageHeight);
    doc.text(cvData.personalInfo.fullName, margin, currentY);
    currentY += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (cvData.personalInfo.profession) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.text(cvData.personalInfo.profession, margin, currentY);
      currentY += 8;
    }

    doc.setFontSize(10);
    if (cvData.personalInfo.email) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.text(`Email: ${cvData.personalInfo.email}`, margin, currentY);
      currentY += 6;
    }
    if (cvData.personalInfo.phone) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.text(`Teléfono: ${cvData.personalInfo.phone}`, margin, currentY);
      currentY += 6;
    }
    if (cvData.personalInfo.location) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.text(`Ubicación: ${cvData.personalInfo.location}`, margin, currentY);
      currentY += 6;
    }
    if (cvData.personalInfo.linkedin) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.text(`LinkedIn: ${cvData.personalInfo.linkedin}`, margin, currentY);
      currentY += 6;
    }
    if (cvData.personalInfo.website) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.text(`Sitio Web: ${cvData.personalInfo.website}`, margin, currentY);
      currentY += 6;
    }

    // Summary
    if (cvData.summary) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen', margin, currentY);
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(doc, cvData.summary, margin, currentY, 190, 6) + 10;
    }

    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Experiencia Laboral', margin, currentY);
      currentY += 8;

      cvData.experience.forEach(exp => {
        currentY = addNewPage(doc, currentY, pageHeight);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.position, margin, currentY);
        currentY += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${exp.company} - ${exp.location}`, margin, currentY);
        currentY += 6;
        doc.text(`${exp.startDate} - ${exp.endDate || 'Actualidad'}`, margin, currentY);
        currentY += 6;

        if (exp.description) {
          currentY = addWrappedText(doc, exp.description, margin, currentY, 190, 6) + 10;
        }
      });
    }

    // Education
    if (cvData.education && cvData.education.length > 0) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Educación', margin, currentY);
      currentY += 8;

      cvData.education.forEach(edu => {
        currentY = addNewPage(doc, currentY, pageHeight);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.degree, margin, currentY);
        currentY += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(edu.institution, margin, currentY);
        currentY += 6;
        doc.text(`${edu.year || 'Año no especificado'}`, margin, currentY);
        currentY += 6;

        if (edu.description) {
          currentY = addWrappedText(doc, edu.description, margin, currentY, 190, 6) + 10;
        }
      });
    }

    // Skills
    if (cvData.skills && cvData.skills.length > 0) {
      currentY = addNewPage(doc, currentY, pageHeight);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Habilidades', margin, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = cvData.skills.join(', ');
      currentY = addWrappedText(doc, skillsText, margin, currentY, 190, 6) + 10;
    }

    // Check user plan for watermark
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user?.id)
      .single();

    const isPro = profile?.subscription_tier === 'pro';

    // Add watermark only for free users
    if (!isPro) {
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text('Creado con ResumAI - resumai.cl', pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    doc.save(`${cvData.personalInfo.fullName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
