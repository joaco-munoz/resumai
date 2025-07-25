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
import { useCredits } from "@/hooks/useCredits";
import { CreditsIndicator } from "@/components/CreditsIndicator";

interface MatchResult {
  matched_keywords: string[];
  missing_keywords: string[];
  score: number;
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

  // Credits hook
  const { canUseCredits, useCredits: consumeCredits, isPro } = useCredits();

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

    // Check if user has enough credits (1 credit per analysis)
    if (!canUseCredits(1)) {
      return; // Error already shown by the hook
    }

    setIsAnalyzing(true);
    setShowResult(false);

    try {
      // Fetch the selected CV content
      const { data: cvData, error: cvError } = await supabase
        .from('cvs')
        .select('content')
        .eq('id', selectedCVId)
        .single();

      if (cvError) {
        console.error('Error fetching CV data:', cvError);
        toast.error("Error al cargar el CV seleccionado");
        return;
      }

      if (!cvData || !cvData.content) {
        toast.error("CV no encontrado o contenido inválido");
        return;
      }

      // Prepare the data for the API
      // Use 1 credit for the analysis
      const creditsUsed = await consumeCredits(1);
      if (!creditsUsed) {
        toast.error("Error al usar créditos");
        return;
      }

      // Prepare the data for the API
      const requestBody = {
        cv_data: cvData.content,
        job_description: jobDescription,
      };

      // Call the API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error('API request failed:', response.status, response.statusText);
        toast.error("Error al analizar la compatibilidad");
        return;
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowResult(true);
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Job Matcher</h1>
              <p className="text-gray-600 mt-2">
                Analiza qué tan compatible es tu CV con ofertas de trabajo específicas
              </p>
            </div>
            
            {/* Usage indicator for non-pro users */}
            <div className="flex-shrink-0 mr-48">
              <CreditsIndicator />
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              {/* CV Selector */}
              <CVSelector
                selectedCVId={selectedCVId}
                onCVSelect={handleCVSelect}
              />

              {/* Job Description Input */}
              <div className="space-y-2">
                <Label htmlFor="job-description">Descripción del puesto</Label>
                <Textarea
                  id="job-description"
                  placeholder="Pega la descripción del puesto aquí..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Section */}
          <Button 
            onClick={analyzeMatch} 
            disabled={isAnalyzing || (!isPro && !canUseCredits(1))} 
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
                  <h3 className="text-lg font-semibold">Coincidencias</h3>
                  {analysisResult.matched_keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.matched_keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No se encontraron coincidencias.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Áreas de Mejora</h3>
                  {analysisResult.missing_keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missing_keywords.map((keyword) => (
                        <Badge key={keyword} variant="destructive">{keyword}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay áreas de mejora.</p>
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
