
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import Dock from "@/components/ui/Dock";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Plus, Trash2, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { CVSelector } from "@/components/job-matcher/CVSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CVNamingModal } from "@/components/cv-builder/CVNamingModal";
import { useFeatureLimits } from "@/hooks/useFeatureLimits";

interface MatchResult {
  score: number;
  strengths: string[];
  missingKeywords: string[];
  suggestedBullets: string[];
  improvements: string[];
}

const JobMatcher = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cvIdFromUrl = searchParams.get('cvId');
  
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<MatchResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [selectedCVTitle, setSelectedCVTitle] = useState<string>("");

  // Feature limits hook (usage is enforced and counted server-side)
  const { canUseFeature, isPro, usage, limits, refreshLimits } = useFeatureLimits();

  // Effect to handle CV selection from URL parameter
  useEffect(() => {
    if (cvIdFromUrl && cvIdFromUrl !== selectedCVId) {
      // When coming from CV editor with a specific CV ID, select it
      setSelectedCVId(cvIdFromUrl);
      // The CVSelector component will handle loading the CV title
    }
  }, [cvIdFromUrl]);

  const handleCVSelect = (cvId: string, cvTitle: string) => {
    setSelectedCVId(cvId);
    setSelectedCVTitle(cvTitle);
  };

  const analyzeMatch = async () => {
    if (!selectedCVId) {
      toast.error("Por favor selecciona un CV primero");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Por favor ingresa una descripción de trabajo");
      return;
    }

    // Check if user can use this feature
    if (!canUseFeature('job_matcher_advanced')) {
      return; // Error already shown by the hook
    }

    setIsAnalyzing(true);
    setShowResult(false);

    try {
      // The edge function reads the CV under the caller's own RLS context and
      // derives the user from the verified JWT — the CV id is validated
      // server-side, and usage is enforced/counted on the server.
      const { data, error } = await supabase.functions.invoke('analyze-job-compatibility', {
        body: { jobDescription, cvId: selectedCVId },
      });

      if (error) {
        console.error('Analysis request failed:', error);
        toast.error("Error al analizar la compatibilidad");
        return;
      }

      setAnalysisResult(data as MatchResult);
      setShowResult(true);

      // Usage is counted server-side; refresh the local counters for the UI.
      await refreshLimits();
    } catch (error) {
      console.error('Error during analysis:', error);
      toast.error("Error al analizar la compatibilidad");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveReport = async (reportName: string) => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el informe");
      return;
    }

    if (!analysisResult) {
      toast.error("No hay resultados para guardar");
      return;
    }

    setSavingReport(true);
    try {
      const reportData = {
        cv_id: selectedCVId,
        cv_title: selectedCVTitle,
        job_description: jobDescription,
        analysis_result: analysisResult,
      };

      const { data, error } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          title: reportName,
          content: reportData as any,
          status: 'draft',
          template_name: 'job_matcher_report',
          cv_source: 'job_matcher',
        })
        .select();

      if (error) {
        console.error('Error saving report:', error);
        toast.error(`Error al guardar el informe: ${error.message}`);
        return;
      }

      toast.success("Informe guardado exitosamente");
      setShowNamingModal(false);
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error("Error al guardar el informe");
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Matcher</h1>
                <p className="text-gray-600 mt-2">
                  Analiza qué tan compatible es tu CV con ofertas de trabajo específicas
                </p>
              </div>
              
              {/* Usage indicator for non-pro users */}
              {/* TODO: Restore AIUsageIndicator when AIUsageContext is properly configured */}
              {/*
              {!isPro && (
                <div className="flex-shrink-0">
                  <AIUsageIndicator
                    current={usage.job_matcher_advanced}
                    limit={limits.job_matcher_advanced}
                    type="job_matcher_advanced"
                    isPro={isPro}
                  />
                </div>
              )}
              */}
            </div>

            {/* CV Selector */}
            <CVSelector
              selectedCVId={selectedCVId}
              onCVSelect={handleCVSelect}
              className="mb-6"
            />

            {/* Job Description Input */}
            <div className="space-y-2">
              <Label htmlFor="job-description">Descripción del puesto</Label>
              <Textarea
                id="job-description"
                placeholder="Pega la descripción del puesto aquí..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Analysis Section */}
            <Button 
              onClick={analyzeMatch} 
              disabled={isAnalyzing || !canUseFeature('job_matcher_advanced')} 
              className="w-full"
            >
              {isAnalyzing ? "Analizando..." : "Analizar Compatibilidad"}
            </Button>

            {/* Result Section */}
            {showResult && analysisResult && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Resultado del Análisis</CardTitle>
                  <CardDescription>
                    Informe generado con el CV: {selectedCVTitle}
                  </CardDescription>
                  <CardDescription>
                    Porcentaje de compatibilidad: {Math.round(analysisResult.score)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Fortalezas</h3>
                    {analysisResult.strengths.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {analysisResult.strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Sin fortalezas destacadas.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Palabras clave faltantes</h3>
                    {analysisResult.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingKeywords.map((keyword) => (
                          <Badge key={keyword} variant="destructive">{keyword}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay palabras clave faltantes.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Recomendaciones</h3>
                    {analysisResult.improvements.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {analysisResult.improvements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Sin recomendaciones.</p>
                    )}
                  </div>
                  <Button variant="secondary" onClick={() => setShowNamingModal(true)}>
                    Guardar Informe
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
      </main>
      
      <CVNamingModal
        isOpen={showNamingModal}
        onClose={() => setShowNamingModal(false)}
        onSave={saveReport}
        defaultName={`${selectedCVTitle} - Informe de Compatibilidad`}
        isSaving={savingReport}
        isReport={true}
      />
      
      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </>
  );
};

export default JobMatcher;
