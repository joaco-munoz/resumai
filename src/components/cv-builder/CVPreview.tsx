
import { Badge } from "@/components/ui/badge";
import { CVData } from "@/types/cv";
import { formatDateToSpanish } from "@/utils/dateUtils";

interface CVPreviewProps {
  cvData: CVData;
}

export const CVPreview = ({ cvData }: CVPreviewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto font-serif">
      <div className="space-y-6">
        {/* Header - Harvard style centered */}
        <div className="text-center border-b border-gray-400 pb-4">
          <h1 className="text-3xl font-bold text-black mb-2">{cvData.personalInfo.fullName}</h1>
          <div className="flex flex-wrap justify-center gap-2 text-black text-sm">
            <span>{cvData.personalInfo.location}</span>
            <span>•</span>
            <span>{cvData.personalInfo.linkedin}</span>
            <span>•</span>
            <span>{cvData.personalInfo.phone}</span>
            <span>•</span>
            <span>{cvData.personalInfo.email}</span>
          </div>
        </div>

        {/* Summary */}
        {cvData.summary && (
          <div>
            <p className="text-sm text-black leading-relaxed text-justify italic">{cvData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {cvData.experience && cvData.experience.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">Experiencia Profesional</h2>
            <div className="space-y-4">
              {cvData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-black">{exp.company}</h3>
                      <p className="text-sm text-black italic">{exp.position}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-black font-bold">{exp.location || cvData.personalInfo.location}</div>
                      <div className="text-sm text-black italic">
                        {formatDateToSpanish(exp.startDate)} - {exp.current ? 'Presente' : formatDateToSpanish(exp.endDate)}
                      </div>
                    </div>
                  </div>
                  <ul className="text-sm text-black leading-relaxed ml-4">
                    {exp.description.split('\n').filter(line => line.trim()).map((line, index) => (
                      <li key={index} className="flex items-start mb-1">
                        <span className="mr-2">•</span>
                        <span>{line.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cvData.education && cvData.education.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">Educación</h2>
            <div className="space-y-3">
              {cvData.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-black uppercase">{edu.institution}</h3>
                      <p className="text-sm text-black">{edu.degree}</p>
                      {edu.description && <p className="text-sm text-black italic">{edu.description}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-black font-bold">{edu.location || cvData.personalInfo.location}</div>
                      <div className="text-sm text-black italic">{edu.year}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills && cvData.skills.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">Skills Adicionales</h2>
            <ul className="text-sm text-black flex flex-wrap gap-x-4 gap-y-2">
              {cvData.skills.map((skill, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-1">•</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
