
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import AIButton from "@/components/AIButton";
import { CVData, Experience } from "@/types/cv";
import { AIUsageIndicator } from "@/components/AIUsageIndicator";
import { useFeatureLimits } from "@/hooks/useFeatureLimits";

interface ExperienceTabProps {
  cvData: CVData;
  updateExperience: (id: string, field: keyof Experience, value: string) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  improveWithAI: (section: string) => void;
  isImproving: string | null;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
  setCvData: (data: CVData | ((prev: CVData) => CVData)) => void;
  isPro: boolean;
}

export const ExperienceTab = ({ 
  cvData, 
  updateExperience, 
  addExperience, 
  removeExperience, 
  improveWithAI, 
  isImproving, 
  goToPreviousTab, 
  goToNextTab, 
  setCvData,
  isPro
}: ExperienceTabProps) => {
  const { usage, limits, canUseFeature } = useFeatureLimits();

  const handleBulletPointChange = (expId: string, index: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          const bulletPoints = exp.description.split('\n');
          bulletPoints[index] = value;
          return { ...exp, description: bulletPoints.join('\n') };
        }
        return exp;
      })
    }));
  };

  const addBulletPoint = (expId: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          const bulletPoints = exp.description.split('\n').filter(bp => bp.trim() !== '');
          bulletPoints.push('');
          return { ...exp, description: bulletPoints.join('\n') };
        }
        return exp;
      })
    }));
  };

  const removeBulletPoint = (expId: string, index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          const bulletPoints = exp.description.split('\n');
          bulletPoints.splice(index, 1);
          return { ...exp, description: bulletPoints.join('\n') };
        }
        return exp;
      })
    }));
  };

  const handleAIImprovement = (section: string) => {
    if (!canUseFeature('ai_improvements')) {
      return;
    }
    improveWithAI(section);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiencia Profesional</CardTitle>
        <CardDescription>
          Agrega tu experiencia laboral más relevante. Usa bullet points para describir tus logros y responsabilidades.
        </CardDescription>
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
      <CardContent className="space-y-6">
        {cvData.experience.map((exp, index) => (
          <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Experiencia {index + 1}</Badge>
              {cvData.experience.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`position-${exp.id}`}>Cargo</Label>
                <Input
                  id={`position-${exp.id}`}
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder="Ej: Desarrollador Frontend"
                />
              </div>
              <div>
                <Label htmlFor={`company-${exp.id}`}>Empresa</Label>
                <Input
                  id={`company-${exp.id}`}
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Ej: Google Inc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`start-${exp.id}`}>Fecha Inicio</Label>
                <Input
                  id={`start-${exp.id}`}
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  placeholder="Ej: Enero 2020"
                />
              </div>
              <div>
                <Label htmlFor={`end-${exp.id}`}>Fecha Fin</Label>
                <Input
                  id={`end-${exp.id}`}
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  placeholder="Ej: Presente"
                />
              </div>
            </div>

            <div>
              <Label>Responsabilidades y Logros</Label>
              <div className="space-y-2 mt-2">
                {exp.description.split('\n').map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={bullet}
                        onChange={(e) => handleBulletPointChange(exp.id, bulletIndex, e.target.value)}
                        placeholder="Ej: Desarrollé aplicaciones web que aumentaron la eficiencia en un 30%"
                      />
                    </div>
                    <AIButton
                      onClick={() => handleAIImprovement(`experience-${exp.id}-${bulletIndex}`)}
                      isLoading={isImproving === `experience-${exp.id}-${bulletIndex}`}
                      disabled={!bullet.trim() || !canUseFeature('ai_improvements')}
                      size="sm"
                    >
                      IA
                    </AIButton>
                    {exp.description.split('\n').length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBulletPoint(exp.id, bulletIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBulletPoint(exp.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar punto
                </Button>
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addExperience}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Experiencia
        </Button>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={goToPreviousTab}>
            Atrás
          </Button>
          <Button onClick={goToNextTab} disabled={cvData.experience.length === 0}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
