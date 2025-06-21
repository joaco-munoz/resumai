
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AIButton from "@/components/AIButton";
import { CVData } from "@/types/cv";

interface SummaryTabProps {
  cvData: CVData;
  handleSummaryChange: (value: string) => void;
  improveWithAI: (section: string) => void;
  isImproving: string | null;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
}

export const SummaryTab = ({ 
  cvData, 
  handleSummaryChange, 
  improveWithAI, 
  isImproving, 
  goToPreviousTab, 
  goToNextTab 
}: SummaryTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resumen Profesional</span>
          <AIButton
            onClick={() => improveWithAI('summary')}
            isLoading={isImproving === 'summary'}
            disabled={!cvData.summary.trim()}
          >
            Optimizar Resumen
          </AIButton>
        </CardTitle>
        <CardDescription>
          Un resumen conciso que destaque tus fortalezas principales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={cvData.summary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          rows={4}
          placeholder="Describe tu perfil profesional, experiencia clave y objetivos..."
        />
        
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
