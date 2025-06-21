
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills: string[];
}

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData | null;
  cvTitle: string;
  onDownload: () => void;
}

export const CVPreviewModal = ({ isOpen, onClose, cvData, cvTitle, onDownload }: CVPreviewModalProps) => {
  if (!cvData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{cvTitle}</DialogTitle>
            <Button onClick={onDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </DialogHeader>
        
        <div className="bg-white p-8 space-y-6 font-serif">
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
      </DialogContent>
    </Dialog>
  );
};
