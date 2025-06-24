
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { formatDateToSpanish } from './dateUtils';

export const downloadCVAsWord = (cvData: any, filename: string) => {
  try {
    // Create new Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header - Name
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: cvData.personalInfo.fullName,
                  bold: true,
                  size: 28,
                }),
              ],
            }),

            // Contact info
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: [
                    cvData.personalInfo.location,
                    cvData.personalInfo.linkedin,
                    cvData.personalInfo.phone,
                    cvData.personalInfo.email
                  ].filter(Boolean).join(' • '),
                  size: 20,
                }),
              ],
            }),

            // Summary Section
            ...(cvData.summary && cvData.summary.trim() ? [
              new Paragraph({
                spacing: { before: 200, after: 200 },
                children: [
                  new TextRun({
                    text: cvData.summary,
                    italics: true,
                    size: 20,
                  }),
                ],
              }),
            ] : []),

            // Experience Section
            ...(cvData.experience && cvData.experience.length > 0 ? [
              // Section header
              new Paragraph({
                spacing: { before: 300, after: 100 },
                border: {
                  bottom: { color: "#000000", style: BorderStyle.SINGLE, size: 1 },
                },
                children: [
                  new TextRun({
                    text: 'EXPERIENCIA PROFESIONAL',
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
              
              // Experience entries
              ...cvData.experience.flatMap((exp: any, index: number) => [
                // Company and Location
                new Paragraph({
                  spacing: { before: 200 },
                  children: [
                    new TextRun({
                      text: exp.company,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({
                      text: `\t${exp.location || cvData.personalInfo.location}`,
                      bold: true,
                      size: 20,
                    }),
                  ],
                }),
                
                // Position and dates
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: exp.position,
                      italics: true,
                      size: 20,
                    }),
                    new TextRun({
                      text: `\t${formatDateToSpanish(exp.startDate)} - ${exp.current ? 'Presente' : formatDateToSpanish(exp.endDate)}`,
                      italics: true,
                      size: 20,
                    }),
                  ],
                }),
                
                // Description as bullet points
                ...(exp.description && exp.description.trim() ? 
                  exp.description
                    .split('\n')
                    .filter((line: string) => line.trim())
                    .map((line: string) => {
                      const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                      if (!cleanLine) return null;
                      
                      return new Paragraph({
                        spacing: { before: 80 },
                        bullet: { level: 0 },
                        children: [
                          new TextRun({
                            text: cleanLine,
                            size: 20,
                          }),
                        ],
                      });
                    })
                    .filter(Boolean) : []
                ),
                
                // Spacing after each experience entry
                ...(index < cvData.experience.length - 1 ? [
                  new Paragraph({
                    spacing: { after: 100 },
                    children: [],
                  }),
                ] : []),
              ]),
            ] : []),

            // Education Section
            ...(cvData.education && cvData.education.length > 0 ? [
              // Section header
              new Paragraph({
                spacing: { before: 300, after: 100 },
                border: {
                  bottom: { color: "#000000", style: BorderStyle.SINGLE, size: 1 },
                },
                children: [
                  new TextRun({
                    text: 'EDUCACIÓN',
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
              
              // Education entries
              ...cvData.education.flatMap((edu: any, index: number) => [
                // Institution and Location
                new Paragraph({
                  spacing: { before: 200 },
                  children: [
                    new TextRun({
                      text: edu.institution.toUpperCase(),
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({
                      text: `\t${edu.location || cvData.personalInfo.location}`,
                      bold: true,
                      size: 20,
                    }),
                  ],
                }),
                
                // Degree and year
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: edu.degree,
                      size: 20,
                    }),
                    new TextRun({
                      text: `\t${edu.year}`,
                      italics: true,
                      size: 20,
                    }),
                  ],
                }),
                
                // Description if exists
                ...(edu.description && edu.description.trim() ? [
                  new Paragraph({
                    spacing: { before: 80 },
                    children: [
                      new TextRun({
                        text: edu.description,
                        italics: true,
                        size: 20,
                      }),
                    ],
                  }),
                ] : []),
                
                // Spacing after each education entry
                ...(index < cvData.education.length - 1 ? [
                  new Paragraph({
                    spacing: { after: 100 },
                    children: [],
                  }),
                ] : []),
              ]),
            ] : []),

            // Skills Section
            ...(cvData.skills && cvData.skills.length > 0 ? [
              // Section header
              new Paragraph({
                spacing: { before: 300, after: 100 },
                border: {
                  bottom: { color: "#000000", style: BorderStyle.SINGLE, size: 1 },
                },
                children: [
                  new TextRun({
                    text: 'SKILLS ADICIONALES',
                    bold: true,
                    size: 22,
                  }),
                ],
              }),
              
              // Skills as bullet points
              new Paragraph({
                spacing: { before: 100 },
                children: cvData.skills.map((skill: string, index: number) => [
                  new TextRun({
                    text: `• ${skill}${index < cvData.skills.length - 1 ? '   ' : ''}`,
                    size: 20,
                  }),
                ]).flat(),
              }),
            ] : []),
          ],
        },
      ],
    });

    // Generate and download the Word document
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${filename}.docx`);
    });

  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Error al generar el documento Word');
  }
};
