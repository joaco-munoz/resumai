
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { CVData } from "@/types/cv";
import { DraggableEducationItem } from "./DraggableEducationItem";

interface EducationTabProps {
  cvData: CVData;
  updateEducation: (id: string, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
}

export const EducationTab = ({ 
  cvData, 
  updateEducation, 
  addEducation: originalAddEducation, 
  removeEducation, 
  goToPreviousTab, 
  goToNextTab,
  setCvData
}: EducationTabProps) => {
  const [minimizedEducations, setMinimizedEducations] = useState<Record<string, boolean>>({});
  
  const toggleMinimize = (id: string) => {
    setMinimizedEducations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const addEducation = () => {
    const updatedMinimized: Record<string, boolean> = {};
    cvData.education.forEach(edu => {
      updatedMinimized[edu.id] = true;
    });
    
    setMinimizedEducations(updatedMinimized);
    originalAddEducation();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(cvData.education);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCvData(prev => ({
      ...prev,
      education: items
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Educación</span>
          <Button onClick={addEducation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </CardTitle>
        <CardDescription>
          Incluye tu formación académica más relevante. Arrastra para reordenar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="education-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {cvData.education.map((edu, index) => (
                  <DraggableEducationItem
                    key={edu.id}
                    edu={edu}
                    index={index}
                    updateEducation={updateEducation}
                    removeEducation={removeEducation}
                    isMinimized={minimizedEducations[edu.id]}
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
