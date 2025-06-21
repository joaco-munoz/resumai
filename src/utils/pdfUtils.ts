
export const downloadCVAsPDF = (cvData: any, filename: string) => {
  // Create a simple HTML version of the CV for PDF generation
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .contact { font-size: 14px; color: #666; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .experience-item, .education-item { margin-bottom: 15px; }
        .job-title { font-weight: bold; }
        .company { color: #2563eb; font-weight: 500; }
        .date { color: #666; font-size: 14px; }
        .description { margin-top: 5px; white-space: pre-line; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${cvData.personalInfo.fullName}</div>
        <div class="contact">
          ${cvData.personalInfo.email} • ${cvData.personalInfo.phone} • ${cvData.personalInfo.location}
        </div>
        <div class="contact">
          ${cvData.personalInfo.linkedin} • ${cvData.personalInfo.website}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Resumen Profesional</div>
        <p>${cvData.summary}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Experiencia Laboral</div>
        ${cvData.experience.map((exp: any) => `
          <div class="experience-item">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>
                <div class="job-title">${exp.position}</div>
                <div class="company">${exp.company}</div>
              </div>
              <div class="date">${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate}</div>
            </div>
            <div class="description">${exp.description}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <div class="section-title">Educación</div>
        ${cvData.education.map((edu: any) => `
          <div class="education-item">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <div class="job-title">${edu.degree}</div>
                <div class="company">${edu.institution}</div>
                ${edu.description ? `<div style="font-size: 14px; color: #666;">${edu.description}</div>` : ''}
              </div>
              <div class="date">${edu.year}</div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <div class="section-title">Habilidades</div>
        <div class="skills">
          ${cvData.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download it
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Note: For proper PDF generation, you would typically use a library like jsPDF or Puppeteer
  // This creates an HTML file that can be opened in a browser and printed as PDF
};
