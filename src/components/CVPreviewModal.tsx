
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
  onDownloadPDF: () => void;
  onDownloadWord: () => void;
}

export const CVPreviewModal = ({ isOpen, onClose, cvData, cvTitle, onDownloadPDF, onDownloadWord }: CVPreviewModalProps) => {
  if (!cvData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{cvTitle}</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={onDownloadPDF} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={onDownloadWord} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Word
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-white p-8 space-y-6 font-serif">
          {/* Header - Harvard style centered */}
          <div className="text-center border-b border-gray-400 pb-4">
            <h1 className="text-3xl font-bold text-black mb-2">{cvData.personalInfo.fullName}</h1>
            <div className="text-sm text-black">
              {cvData.personalInfo.location} • {cvData.personalInfo.linkedin} • {cvData.personalInfo.phone} • {cvData.personalInfo.email}
              {cvData.personalInfo.website && <span> • {cvData.personalInfo.website}</span>}
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
                        <div className="text-sm text-black font-bold">{cvData.personalInfo.location}</div>
                        <div className="text-sm text-black italic">
                          {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
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
                        <div className="text-sm text-black font-bold">{cvData.personalInfo.location}</div>
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
              <ul className="text-sm text-black">
                {cvData.skills.map((skill, index) => (
                  <li key={index} className="flex items-start mb-1">
                    <span className="mr-2">•</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
