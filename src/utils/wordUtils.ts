
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle, TableCell, TableRow, Table } from 'docx';
import { saveAs } from 'file-saver';
import { formatDateToSpanish } from './dateUtils';

import { CVData } from '@/types/cv';

export const downloadCVAsWord = (cvData: CVData, filename: string) => {
  try {
    // Create new Word document with STIX Two Text font to match preview
    const doc = new Document({
      sections: [
        {
          properties: {
            // Reducir márgenes para que el contenido esté más cerca de los bordes
            page: {
              margin: {
                top: 340, // ~12mm (1 cm ≈ 283 twips)
                right: 340, // ~12mm
                bottom: 340, // ~12mm
                left: 340 // ~12mm
              }
            }
          },
          children: [
            // Header - Name
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: cvData.personalInfo.fullName,
                  bold: true,
                  size: 40, // Equivalent to 20pt in PDF (size in half-points)
                  font: "STIX Two Text",
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
                  size: 18, // Equivalent to 9pt in PDF (size in half-points)
                  font: "STIX Two Text",
                }),
              ],
            }),

            // Summary Section
            ...(cvData.summary && cvData.summary.trim() ? [
              new Paragraph({
                spacing: { before: 100, after: 120 }, // Reduced spacing to match PDF
                children: [
                  new TextRun({
                    text: cvData.summary,
                    italics: true,
                    size: 18, // Equivalent to 9pt in PDF
                    font: "STIX Two Text",
                  }),
                ],
              }),
            ] : []),

            // Experience Section
            ...(cvData.experience && cvData.experience.length > 0 ? [
              // Section header
              new Paragraph({
                spacing: { before: 120, after: 80 }, // Reduced spacing to match PDF
                border: {
                  bottom: { color: "#000000", style: BorderStyle.SINGLE, size: 0.3 },
                },
                children: [
                  new TextRun({
                    text: 'EXPERIENCIA PROFESIONAL',
                    bold: true,
                    size: 20, // Equivalent to 10pt in PDF
                    font: "STIX Two Text",
                  }),
                ],
              }),
              
              // Experience entries
              ...cvData.experience.flatMap((exp: any, index: number) => [
                // Company and Location
                new Paragraph({
                  spacing: { before: 100 },
                  children: [
                    new TextRun({
                      text: exp.company,
                      bold: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
                    }),
                    new TextRun({
                      text: `\t${exp.location || cvData.personalInfo.location}`,
                      bold: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
                    }),
                  ],
                }),
                
                // Position and dates
                new Paragraph({
                  spacing: { after: 80 },
                  children: [
                    new TextRun({
                      text: exp.position,
                      italics: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
                    }),
                    new TextRun({
                      text: `\t${formatDateToSpanish(exp.startDate)} - ${exp.current ? 'Presente' : formatDateToSpanish(exp.endDate)}`,
                      italics: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
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
                        spacing: { before: 60 },
                        bullet: { level: 0 },
                        children: [
                          new TextRun({
                            text: cleanLine,
                            size: 18, // Equivalent to 9pt in PDF
                            font: "STIX Two Text",
                          }),
                        ],
                      });
                    })
                    .filter(Boolean) : []
                ),
                
                // Spacing after each experience entry
                ...(index < cvData.experience.length - 1 ? [
                  new Paragraph({
                    spacing: { after: 80 }, // Reduced spacing to match PDF
                    children: [],
                  }),
                ] : []),
              ]),
            ] : []),

            // Education Section
            ...(cvData.education && cvData.education.length > 0 ? [
              // Section header
              new Paragraph({
                spacing: { before: 120, after: 80 }, // Reduced spacing to match PDF
                border: {
                  bottom: { color: "#000000", style: BorderStyle.SINGLE, size: 0.3 },
                },
                children: [
                  new TextRun({
                    text: 'EDUCACIÓN',
                    bold: true,
                    size: 20, // Equivalent to 10pt in PDF
                    font: "STIX Two Text",
                  }),
                ],
              }),
              
              // Education entries
              ...cvData.education.flatMap((edu: any, index: number) => [
                // Institution and Location
                new Paragraph({
                  spacing: { before: 100 },
                  children: [
                    new TextRun({
                      text: edu.institution.toUpperCase(),
                      bold: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
                    }),
                    new TextRun({
                      text: `\t${edu.location || cvData.personalInfo.location}`,
                      bold: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
                    }),
                  ],
                }),
                
                // Degree and year
                new Paragraph({
                  spacing: { after: 80 },
                  children: [
                    new TextRun({
                      text: edu.degree,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
                    }),
                    new TextRun({
                      text: `\t${edu.year}`,
                      italics: true,
                      size: 18, // Equivalent to 9pt in PDF
                      font: "STIX Two Text",
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
                        size: 18, // Equivalent to 9pt in PDF
                        font: "STIX Two Text",
                      }),
                    ],
                  }),
                ] : []),
                
                // Spacing after each education entry
                ...(index < cvData.education.length - 1 ? [
                  new Paragraph({
                    spacing: { after: 80 }, // Reduced spacing to match PDF
                    children: [],
                  }),
                ] : []),
              ]),
            ] : []),

            // Skills Section
            ...(cvData.skills && cvData.skills.length > 0 ? [
              // Section header
              new Paragraph({
                spacing: { before: 120, after: 80 }, // Reduced spacing to match PDF
                border: {
                  bottom: { color: "#000000", style: BorderStyle.SINGLE, size: 0.3 },
                },
                children: [
                  new TextRun({
                    text: 'SKILLS ADICIONALES',
                    bold: true,
                    size: 20, // Equivalent to 10pt in PDF
                    font: "STIX Two Text",
                  }),
                ],
              }),
              
              // Skills as bullet points
              // Implementar un diseño horizontal para los skills similar al PDF
              new Paragraph({
                spacing: { before: 80 },
                children: cvData.skills.map((skill: string, index: number) => [
                  new TextRun({
                    text: `• ${skill}${index < cvData.skills.length - 1 ? '   ' : ''}`,
                    size: 18, // Equivalent to 9pt in PDF
                    font: "STIX Two Text",
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
