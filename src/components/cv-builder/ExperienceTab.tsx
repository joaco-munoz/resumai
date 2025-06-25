
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { CVData } from "@/types/cv";
import { DraggableExperienceItem } from "./DraggableExperienceItem";

interface ExperienceTabProps {
  cvData: CVData;
  updateExperience: (id: string, field: string, value: any) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  improveWithAI: (section: string) => void;
  isImproving: string | null;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
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
  setCvData
}: ExperienceTabProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Experiencia Laboral</span>
          <Button onClick={addExperience} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </CardTitle>
        <CardDescription>
          Detalla tu experiencia profesional más relevante. Arrastra para reordenar.
        </CardDescription>
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
                    improveWithAI={improveWithAI}
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
          <Button onClick={goToNextTab}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
