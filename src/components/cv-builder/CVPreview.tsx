
import { Badge } from "@/components/ui/badge";
import { CVData } from "@/types/cv";

interface CVPreviewProps {
  cvData: CVData;
}

export const CVPreview = ({ cvData }: CVPreviewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto font-serif">
      <div className="space-y-6">
        {/* Header - Harvard style centered */}
        <div className="text-center border-b border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-black mb-2">{cvData.personalInfo.fullName}</h1>
          <div className="text-sm text-black space-y-1">
            <div>{cvData.personalInfo.location}</div>
            <div>{cvData.personalInfo.phone}</div>
            <div>{cvData.personalInfo.email}</div>
            {cvData.personalInfo.linkedin && <div>{cvData.personalInfo.linkedin}</div>}
            {cvData.personalInfo.website && <div>{cvData.personalInfo.website}</div>}
          </div>
        </div>

        {/* Summary */}
        {cvData.summary && (
          <div>
            <h2 className="text-lg font-bold text-black mb-2 uppercase tracking-wide">Resumen Profesional</h2>
            <p className="text-sm text-black leading-relaxed text-justify">{cvData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {cvData.experience && cvData.experience.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-black mb-2 uppercase tracking-wide">Experiencia Laboral</h2>
            <div className="space-y-4">
              {cvData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-black">{exp.position}</h3>
                      <p className="text-sm font-semibold text-black italic">{exp.company}</p>
                    </div>
                    <span className="text-sm text-black">
                      {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-sm text-black leading-relaxed text-justify whitespace-pre-line ml-4">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cvData.education && cvData.education.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-black mb-2 uppercase tracking-wide">Educación</h2>
            <div className="space-y-3">
              {cvData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-black">{edu.degree}</h3>
                      <p className="text-sm font-semibold text-black italic">{edu.institution}</p>
                      {edu.description && <p className="text-sm text-black mt-1">{edu.description}</p>}
                    </div>
                    <span className="text-sm text-black">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills && cvData.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-black mb-2 uppercase tracking-wide">Habilidades</h2>
            <div className="text-sm text-black">
              {cvData.skills.join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
