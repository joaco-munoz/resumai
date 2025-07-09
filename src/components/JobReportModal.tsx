
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, TrendingUp, Target, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CVAdaptationModal } from "@/components/CVAdaptationModal";

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

interface ReportData {
  jobDescription: string;
  matchResult: MatchResult;
  jobDetails: JobDetails;
  type: string;
}

interface JobReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  reportTitle: string;
  reportId?: string;
  onApply: () => void;
}

export const JobReportModal = ({ 
  isOpen, 
  onClose, 
  reportData, 
  reportTitle,
  reportId,
  onApply 
}: JobReportModalProps) => {
  const [showAdaptationModal, setShowAdaptationModal] = useState(false);

  if (!reportData || !reportData.matchResult) return null;

  const { matchResult, jobDetails, jobDescription } = reportData;

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

  // Función comentada para deshabilitar la adaptación de CV
  const handleApply = () => {
    // setShowAdaptationModal(true); // Comentado para deshabilitar adaptación
    onApply(); // Mantiene la funcionalidad de guardar el informe
  };

  const handleAdaptationSave = () => {
    setShowAdaptationModal(false);
    onApply(); // This will close the report modal and refresh the CVs list
  };

  const handleNoApply = () => {
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {reportTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descripción del Trabajo Analizada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {jobDescription}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Score Card */}
          <Card className={`border-2 ${getScoreBg(matchResult.score)}`}>
            <CardHeader className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(matchResult.score)} mb-2`}>
                {matchResult.score}%
              </div>
              <CardTitle>Compatibilidad General</CardTitle>
              <p className="text-gray-600">
                Tu CV General coincide en un {matchResult.score}% con esta oferta
              </p>
            </CardHeader>
            <CardContent>
              <Progress 
                value={matchResult.score} 
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success-600">
                <CheckCircle className="h-5 w-5" />
                Fortalezas Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {matchResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Missing Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Keywords Faltantes
              </CardTitle>
              <p className="text-sm text-gray-600">
                Considera añadir estas habilidades a tu CV si las tienes
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="destructive">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-600">
                <TrendingUp className="h-5 w-5" />
                Bullets Sugeridos
              </CardTitle>
              <p className="text-sm text-gray-600">
                Fragmentos optimizados para esta oferta específica
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {matchResult.suggestedBullets.map((bullet, index) => (
                  <div key={index} className="p-3 bg-brand-50 rounded-lg border border-brand-200">
                    <p className="text-sm font-mono">{bullet}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <TrendingUp className="h-5 w-5" />
                Áreas de Mejora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {matchResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {/* Si el informe ya está guardado (tiene ID), solo mostrar botón de cerrar */}
            {reportId ? (
              <Button 
                onClick={handleNoApply}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Cerrar
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleNoApply}
                  variant="outline"
                  className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  No guardar informe
                </Button>
                <Button 
                  onClick={handleApply}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar informe
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal de Adaptación de CV - Temporalmente deshabilitado */}
    {/*
    <CVAdaptationModal
      isOpen={showAdaptationModal}
      onClose={() => setShowAdaptationModal(false)}
      matchResult={matchResult}
      jobDetails={jobDetails}
      existingReportId={reportId}
      onSave={handleAdaptationSave}
    />
    */}
  </>
  );
};
