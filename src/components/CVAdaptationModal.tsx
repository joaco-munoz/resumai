
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, TrendingUp, Sparkles, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  onSave: () => void;
}

export const CVAdaptationModal = ({ 
  isOpen, 
  onClose, 
  matchResult, 
  jobDetails, 
  onSave 
}: CVAdaptationModalProps) => {
  const [isAdapting, setIsAdapting] = useState(false);
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

      // Extraer detalles del trabajo desde la descripción si están disponibles
      const jobDescription = localStorage.getItem('currentJobDescription') || '';
      const extractedDetails = extractJobDetailsFromDescription(jobDescription);
      
      // Generar nombre para el CV adaptado
      const now = new Date();
      const dateTime = now.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      let cvTitle;
      if (extractedDetails.company && extractedDetails.position) {
        cvTitle = `CV - ${extractedDetails.position} en ${extractedDetails.company}`;
      } else if (extractedDetails.company) {
        cvTitle = `CV - ${extractedDetails.company}`;
      } else if (extractedDetails.position) {
        cvTitle = `CV - ${extractedDetails.position}`;
      } else {
        cvTitle = `CV - ${generalCV.content?.personalInfo?.fullName || 'Adaptado'} - ${dateTime}`;
      }

      // Crear el CV adaptado
      const { data: adaptedCV, error: adaptError } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          title: cvTitle,
          content: generalCV.content,
          status: 'draft',
          template_name: 'modern',
          cv_source: 'job_matcher',
          ai_score: matchResult.score
        })
        .select()
        .single();

      if (adaptError || !adaptedCV) {
        console.error('Error creating adapted CV:', adaptError);
        toast.error("Error al crear el CV adaptado");
        return;
      }

      // Guardar en seguimiento de postulaciones
      const { error: trackingError } = await supabase
        .from('job_applications_tracking')
        .insert({
          user_id: user.id,
          position: extractedDetails.position || 'Posición sin especificar',
          company: extractedDetails.company || 'Empresa sin especificar',
          status: 'saved',
          applied_date: new Date().toISOString().split('T')[0],
          notes: `CV adaptado automáticamente. Puntuación de compatibilidad: ${matchResult.score}%`
        });

      if (trackingError) {
        console.error('Error saving to job tracking:', trackingError);
        // No bloqueamos el flujo por este error, solo logueamos
        console.log('CV saved but failed to add to job tracking');
      }

      toast.success("CV adaptado y guardado exitosamente");
      onSave();
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              Mejoras Sugeridas
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
              onClick={handleAdaptCV}
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
  );
};
