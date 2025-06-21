
import { Badge } from "@/components/ui/badge";
import { CVData } from "@/types/cv";

interface CVPreviewProps {
  cvData: CVData;
}

export const CVPreview = ({ cvData }: CVPreviewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900">{cvData.personalInfo.fullName}</h1>
          <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
            <span>{cvData.personalInfo.email}</span>
            <span>•</span>
            <span>{cvData.personalInfo.phone}</span>
            <span>•</span>
            <span>{cvData.personalInfo.location}</span>
          </div>
          <div className="flex justify-center gap-4 mt-1 text-sm text-gray-600 flex-wrap">
            <span>{cvData.personalInfo.linkedin}</span>
            <span>•</span>
            <span>{cvData.personalInfo.website}</span>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Resumen Profesional</h2>
          <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Experiencia Laboral</h2>
          <div className="space-y-4">
            {cvData.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-brand-500 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-brand-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                  </span>
                </div>
                <div className="text-gray-700 whitespace-pre-line">{exp.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Educación</h2>
          <div className="space-y-3">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-success-500 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-success-600 font-medium">{edu.institution}</p>
                    {edu.description && <p className="text-gray-600 text-sm">{edu.description}</p>}
                  </div>
                  <span className="text-sm text-gray-500">{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Habilidades</h2>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
