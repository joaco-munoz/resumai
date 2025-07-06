
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AIButton from "@/components/AIButton";
import { CVData } from "@/types/cv";
import { AIUsageIndicator } from "@/components/AIUsageIndicator";
import { useFeatureLimits } from "@/hooks/useFeatureLimits";

interface SummaryTabProps {
  cvData: CVData;
  handleSummaryChange: (value: string) => void;
  improveWithAI: (section: string) => void;
  isImproving: string | null;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
  isPro: boolean;
}

const MAX_CHARACTERS = 750;

export const SummaryTab = ({ 
  cvData, 
  handleSummaryChange, 
  improveWithAI, 
  isImproving, 
  goToPreviousTab, 
  goToNextTab,
  isPro
}: SummaryTabProps) => {
  const { usage, limits, canUseFeature } = useFeatureLimits();
  const currentLength = cvData.summary.length;
  const isAtLimit = currentLength >= MAX_CHARACTERS;

  const handleTextChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      handleSummaryChange(value);
    }
  };

  const handleAIImprovement = () => {
    if (!canUseFeature('ai_improvements')) {
      return;
    }
    improveWithAI('summary');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center justify-between">
              <span>Resumen Profesional</span>
              <AIButton
                onClick={handleAIImprovement}
                isLoading={isImproving === 'summary'}
                disabled={!cvData.summary.trim() || !canUseFeature('ai_improvements')}
              >
                Optimizar Resumen
              </AIButton>
            </CardTitle>
            <CardDescription>
              Tu Resumen Profesional es tu carta de presentación en 2-3 líneas: escribe tu experiencia y logros con tus propias palabras, y ResumAI los perfeccionará al instante.
            </CardDescription>
          </div>
        </div>
        {!isPro && (
          <div className="mt-4">
            <AIUsageIndicator 
              current={usage.ai_improvements}
              limit={limits.ai_improvements}
              type="ai_improvements"
              isPro={isPro}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={cvData.summary}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={4}
            placeholder="Ej.: Ingeniera de datos con 6 años de experiencia en BI y Python; lideré proyectos que elevaron la eficiencia un 20 % y busco impulsar decisiones estratégicas."
            maxLength={MAX_CHARACTERS}
          />
          <div className="flex justify-between items-center text-xs">
            <span className={`${isAtLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {currentLength}/{MAX_CHARACTERS} caracteres
            </span>
            {isAtLimit && (
              <span className="text-red-500 font-medium">
                Límite máximo alcanzado
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={goToPreviousTab}>
            Atrás
          </Button>
          <Button onClick={goToNextTab}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
