
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Trash2, HelpCircle } from "lucide-react";
import AIButton from "@/components/AIButton";
import { CVData, Experience } from "@/types/cv";
import { AIUsageIndicator } from "@/components/AIUsageIndicator";
import { useFeatureLimits } from "@/hooks/useFeatureLimits";
import { DatePickerEs } from "@/components/ui/date-picker-es";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DraggableExperienceItem } from "./DraggableExperienceItem";

interface ExperienceTabProps {
  cvData: CVData;
  updateExperience: (id: string, field: keyof Experience, value: string | boolean) => void;
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
  addExperience: originalAddExperience, 
  removeExperience, 
  improveWithAI, 
  isImproving, 
  goToPreviousTab, 
  goToNextTab, 
  setCvData,
  isPro
}: ExperienceTabProps) => {
  const { usage, limits, canUseFeature } = useFeatureLimits();
  const [minimizedExperiences, setMinimizedExperiences] = useState<Record<string, boolean>>({});
  
  const toggleMinimize = (id: string) => {
    setMinimizedExperiences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const addExperience = () => {
    const updatedMinimized: Record<string, boolean> = {};
    cvData.experience.forEach(exp => {
      updatedMinimized[exp.id] = true;
    });
    
    setMinimizedExperiences(updatedMinimized);
    originalAddExperience();
  };
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(cvData.experience);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCvData(prev => ({
      ...prev,
      experience: items
    }));
  };

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
        <CardTitle className="flex items-center justify-between">
          <span>Experiencia Profesional</span>
          <Button onClick={addExperience} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </CardTitle>
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="experience-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {cvData.experience.map((exp, index) => (
                  <DraggableExperienceItem
                    key={exp.id}
                    exp={exp}
                    index={index}
                    updateExperience={updateExperience}
                    removeExperience={removeExperience}
                    improveWithAI={handleAIImprovement}
                    isImproving={isImproving}
                    isMinimized={minimizedExperiences[exp.id]}
                    toggleMinimize={toggleMinimize}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

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
