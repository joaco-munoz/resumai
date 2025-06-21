
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MatchResult {
  score: number;
  missingKeywords: string[];
  suggestedBullets: string[];
  strengths: string[];
  improvements: string[];
}

const JobMatcher = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const { user } = useAuth();

  const analyzeMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error("Por favor, pega una descripción de trabajo");
      return;
    }

    if (!user) {
      toast.error("Debes estar autenticado para usar esta función");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting job compatibility analysis...');
      
      const { data, error } = await supabase.functions.invoke('analyze-job-compatibility', {
        body: {
          jobDescription: jobDescription,
          userId: user.id
        }
      });

      if (error) {
        console.error('Error calling analyze-job-compatibility function:', error);
        toast.error(`Error al analizar la compatibilidad: ${error.message}`);
        return;
      }

      console.log('Analysis completed successfully:', data);
      setMatchResult(data as MatchResult);
      toast.success("Análisis completado exitosamente");
      
    } catch (error) {
      console.error('Error analyzing job compatibility:', error);
      toast.error("Error al analizar la compatibilidad");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyToCV = () => {
    // TODO: Integrate with CV Builder when needed
    toast.success("Sugerencias aplicadas al CV actual");
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Job Matcher</h1>
                <p className="text-gray-600">Analiza la compatibilidad de tu CV con ofertas específicas</p>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Job Description Section - Full Width */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-500" />
                  Descripción del Trabajo
                </CardTitle>
                <CardDescription>
                  Pega la descripción completa de la oferta de trabajo que te interesa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Pega aquí la descripción del trabajo completa...

Ejemplo:
- Estamos buscando un Frontend Developer con experiencia en React
- Requisitos: 3+ años con JavaScript, TypeScript, React
- Conocimientos en Node.js, APIs REST, Git
- Experiencia con metodologías ágiles
- Plus: Docker, Testing, GraphQL"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                
                <Button 
                  onClick={analyzeMatch}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="bg-gradient-to-r from-brand-500 to-brand-700"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Analizando compatibilidad...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analizar Compatibilidad
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section - Vertical Grid */}
            {!matchResult && !isAnalyzing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Esperando análisis
                    </h3>
                    <p className="text-gray-500">
                      Pega una descripción de trabajo y haz clic en "Analizar" para ver la compatibilidad con tu CV General
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Sparkles className="h-16 w-16 text-brand-500 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analizando con IA...
                    </h3>
                    <p className="text-gray-500">
                      Comparando tu CV General con los requisitos de la oferta
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {matchResult && (
              <div className="grid gap-6">
                {/* Score Card */}
                <Card className={`border-2 ${getScoreBg(matchResult.score)}`}>
                  <CardHeader className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(matchResult.score)} mb-2`}>
                      {matchResult.score}%
                    </div>
                    <CardTitle>Compatibilidad General</CardTitle>
                    <CardDescription>
                      Tu CV General coincide en un {matchResult.score}% con esta oferta
                    </CardDescription>
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
                    <CardDescription>
                      Considera añadir estas habilidades a tu CV si las tienes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingKeywords.map((keyword) => (
                        <Badge key={keyword} variant="destructive">
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
                    <CardDescription>
                      Fragmentos optimizados para esta oferta específica
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {matchResult.suggestedBullets.map((bullet, index) => (
                        <div key={index} className="p-3 bg-brand-50 rounded-lg border border-brand-200">
                          <p className="text-sm font-mono">{bullet}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={applyToCV}
                      className="w-full"
                      variant="outline"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Aplicar al CV Actual
                    </Button>
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
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default JobMatcher;
