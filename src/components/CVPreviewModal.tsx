import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { formatDateToSpanish } from "@/utils/dateUtils";
import { downloadCVAsPDF } from "@/utils/pdfUtils";
import { downloadCVAsWord } from "@/utils/wordUtils";
import { useDownloadManager } from "@/hooks/useDownloadManager";
import { useEffect, useState } from "react";

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
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
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
  const { downloadCount, downloadCV, fetchDownloadCount, willNextDownloadHaveWatermark } = useDownloadManager();
  const [showWatermarkWarning, setShowWatermarkWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDownloadCount().then(() => {
        willNextDownloadHaveWatermark().then(setShowWatermarkWarning);
      });
    }
  }, [isOpen, fetchDownloadCount, willNextDownloadHaveWatermark]);

  const handleDownloadPDF = async () => {
    await downloadCV({ cvData, filename: cvTitle, format: 'pdf' });
    onDownloadPDF();
  };

  const handleDownloadWord = async () => {
    await downloadCV({ cvData, filename: cvTitle, format: 'word' });
    onDownloadWord();
  };

  if (!cvData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{cvTitle}</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF {showWatermarkWarning && "(con marca de agua)"}
              </Button>
              <Button onClick={handleDownloadWord} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Word {showWatermarkWarning && "(con marca de agua)"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-white p-8 space-y-6 font-stix">
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
              {cvData.personalInfo.website && <>
                <span>•</span>
                <span>{cvData.personalInfo.website}</span>
              </>}
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
      </DialogContent>
    </Dialog>
  );
};
