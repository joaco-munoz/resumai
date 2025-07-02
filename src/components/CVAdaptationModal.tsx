import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, TrendingUp, Sparkles, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVData } from "@/types/cv";
import { CVAdaptationPreviewModal } from "./CVAdaptationPreviewModal";

interface MatchResult {
  score: number;
  missingKeywords: string[];
  suggestedBullets: string[];
  strengths: string[];
  improvements: string[];
}

interface JobDetails {
  title: string;
  company: string;
}

interface CVAdaptationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: MatchResult | null;
  jobDetails: JobDetails;
  existingReportId?: string;
  onSave: () => void;
}

export const CVAdaptationModal = ({ 
  isOpen, 
  onClose, 
  matchResult, 
  jobDetails, 
  existingReportId,
  onSave 
}: CVAdaptationModalProps) => {
  const [isAdapting, setIsAdapting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [originalCvData, setOriginalCvData] = useState<CVData | null>(null);
  const [adaptedCvData, setAdaptedCvData] = useState<CVData | null>(null);

  // Estado para el aviso legal
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalButtonsVisible, setLegalButtonsVisible] = useState(false);

  // Abre el aviso legal y muestra los botones tras 5 s
  const handleOpenLegal = () => {
    setShowLegalModal(true);
    setLegalButtonsVisible(false);
    setTimeout(() => setLegalButtonsVisible(true), 5000);
  };

  const handleLegalAccept = () => {
    setShowLegalModal(false);
    handleAdaptCV();
  };

  const handleLegalDecline = () => {
    setShowLegalModal(false);
  };
  const { user } = useAuth();

  const extractJobDetailsFromDescription = (description: string): { company: string; position: string } => {
    const lines = description.split('\n').filter(line => line.trim());
    let company = "";
    let position = "";
    
    // Buscar patrones comunes para extraer información
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Buscar empresa
      if (lowerLine.includes('empresa:') || lowerLine.includes('compañía:')) {
        company = line.split(':')[1]?.trim() || "";
      } else if (lowerLine.includes('en ') && !company) {
        const match = line.match(/en\s+([A-Za-z\s]+)/i);
        if (match) company = match[1].trim();
      }
      
      // Buscar posición
      if (lowerLine.includes('puesto:') || lowerLine.includes('cargo:') || lowerLine.includes('posición:')) {
        position = line.split(':')[1]?.trim() || "";
      } else if (lowerLine.includes('buscamos') && lowerLine.includes('developer')) {
        const match = line.match(/buscamos.*?([a-zA-Z\s]+developer)/i);
        if (match) position = match[1].trim();
      } else if (!position && (lowerLine.includes('developer') || lowerLine.includes('ingeniero') || lowerLine.includes('analista'))) {
        // Extraer la primera palabra que parezca un cargo
        const words = line.split(' ');
        for (let i = 0; i < words.length - 1; i++) {
          if (words[i].toLowerCase().includes('developer') || 
              words[i].toLowerCase().includes('ingeniero') || 
              words[i].toLowerCase().includes('analista')) {
            position = `${words[i]} ${words[i + 1] || ''}`.trim();
            break;
          }
        }
      }
    }
    
    return { company: company || jobDetails.company, position: position || jobDetails.title };
  };

  const applyAIImprovements = (cvData: CVData, matchResult: MatchResult): CVData => {
    const adaptedCV = { ...cvData };
    
    // Mejorar el resumen con keywords faltantes
    if (matchResult.missingKeywords.length > 0) {
      const keywordsToAdd = matchResult.missingKeywords.slice(0, 3);
      const currentSummary = adaptedCV.summary || '';
      
      // Si el resumen no contiene las keywords, las agregamos de forma natural
      keywordsToAdd.forEach(keyword => {
        if (!currentSummary.toLowerCase().includes(keyword.toLowerCase())) {
          if (currentSummary.includes('experiencia en')) {
            adaptedCV.summary = currentSummary.replace(
              'experiencia en',
              `experiencia en ${keyword},`
            );
          } else {
            adaptedCV.summary = `${currentSummary} Experiencia con ${keyword}.`;
          }
        }
      });
    }

    // Agregar skills faltantes
    const newSkills = [...adaptedCV.skills];
    matchResult.missingKeywords.forEach(keyword => {
      const cap = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      if (!newSkills.some(skill => skill.toLowerCase() === cap.toLowerCase())) {
        newSkills.push(cap);
      }
    });
    adaptedCV.skills = newSkills;

    // Mejorar descripciones de experiencia con bullets sugeridos
    if (matchResult.suggestedBullets.length > 0 && adaptedCV.experience.length > 0) {
      const latestExperience = adaptedCV.experience[0];
      const currentDescription = latestExperience.description || '';
      const newBullets = matchResult.suggestedBullets.slice(0, 2);
      
      // Agregar bullets sugeridos al trabajo más reciente
      const enhancedDescription = [
  ...currentDescription
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0),
  ...newBullets.map(bullet => {
    // Eliminar cualquier viñeta o espacio inicial
    const sanitized = bullet.replace(/^\s*(?:[•\-*]\s*)+/, '').trim();
    return sanitized;
  })
].join('\n');
      
      adaptedCV.experience[0] = {
        ...latestExperience,
        description: enhancedDescription
      };
    }

    return adaptedCV;
  };

  const handleAdaptCV = async () => {
    if (!user || !matchResult) {
      toast.error("Información insuficiente para adaptar el CV");
      return;
    }

    setIsAdapting(true);

    try {
      console.log('Starting CV adaptation...');
      
      // Obtener el CV general del usuario
      const { data: generalCV, error: cvError } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .eq('cv_source', 'editor')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cvError || !generalCV) {
        console.error('Error loading general CV:', cvError);
        toast.error("No se pudo cargar el CV principal");
        return;
      }

      // Cast the content to CVData type
      const cvContent = generalCV.content as unknown as CVData;
      
      // Aplicar mejoras de IA al CV
      const adaptedCV = applyAIImprovements(cvContent, matchResult);
      
      // Extraer detalles del trabajo desde la descripción si están disponibles
      const jobDescription = localStorage.getItem('currentJobDescription') || '';
      const extractedDetails = extractJobDetailsFromDescription(jobDescription);
      
      setOriginalCvData(cvContent);
      setAdaptedCvData(adaptedCV);
      setShowPreviewModal(true);
      
      toast.success("CV adaptado generado exitosamente");
      
    } catch (error) {
      console.error('Error adapting CV:', error);
      toast.error("Error al adaptar el CV");
    } finally {
      setIsAdapting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success-100 border-success-200";
    if (score >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  if (!matchResult) return null;

  return (
    <>
      {/* Modal Principal */}
      <Dialog open={isOpen && !showPreviewModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-500" />
              Adaptar CV para esta Oferta
            </DialogTitle>
            <DialogDescription>
              Revisa el análisis de compatibilidad y adapta tu CV para esta posición específica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Score Summary */}
            <div className={`p-4 rounded-lg border-2 ${getScoreBg(matchResult.score)}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(matchResult.score)} mb-2`}>
                  {matchResult.score}%
                </div>
                <p className="text-sm text-gray-600">
                  Compatibilidad con: <strong>{jobDetails.title}</strong> en <strong>{jobDetails.company}</strong>
                </p>
                <Progress value={matchResult.score} className="mt-3 h-2" />
              </div>
            </div>

            {/* Resto del contenido existente */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="space-y-4">
                <h3 className="font-semibold text-success-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fortalezas Detectadas
                </h3>
                <ul className="space-y-2">
                  {matchResult.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-success-500 mt-1 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Keywords */}
              <div className="space-y-4">
                <h3 className="font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Keywords Faltantes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingKeywords.slice(0, 6).map((keyword) => (
                    <Badge key={keyword} variant="destructive" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Improvements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-brand-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Mejoras que se Aplicarán
              </h3>
              <div className="space-y-2">
                {matchResult.improvements.slice(0, 2).map((improvement, index) => (
                  <div key={index} className="p-3 bg-brand-50 rounded-lg border border-brand-200">
                    <p className="text-sm">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={isAdapting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleOpenLegal}
                disabled={isAdapting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isAdapting ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Adaptando CV...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Adaptar CV
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación Legal */}
      {showLegalModal && (
        <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Aviso Legal</DialogTitle>
              <DialogDescription>
                <div className="p-4 bg-red-50 border border-red-300 rounded-md space-y-3 text-sm">
                  <p className="font-semibold">
                    ResumAI te ayuda a optimizar tu CV, pero tú eres responsable de lo que postulas.
                  </p>
                  <p>
                    Al continuar, aceptas que cualquier información generada debe ser revisada y aprobada por ti. No nos hacemos responsables por usos indebidos o declaraciones falsas.
                  </p>
                  <p className="italic">
                    Nuestro consejo: verifica siempre lo que se incluye. Un buen CV abre puertas, pero la honestidad las mantiene abiertas.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>

            {legalButtonsVisible ? (
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={handleLegalDecline}>
                  No acepto
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleLegalAccept}>
                  Acepto
                </Button>
              </div>
            ) : (
              <p className="text-center text-xs text-gray-500 pt-4">
                Los botones aparecerán en 5&nbsp;segundos...
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Vista Previa */}
      {showPreviewModal && originalCvData && adaptedCvData && (
        <CVAdaptationPreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            onClose();
          }}
          originalCvData={originalCvData}
          adaptedCvData={adaptedCvData}
          jobTitle={jobDetails.title}
          companyName={jobDetails.company}
          existingCVId={existingReportId}
          onSave={() => {
            setShowPreviewModal(false);
            onSave();
          }}
        />
      )}
    </>
  );
};
