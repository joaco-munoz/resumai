
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronUp, ChevronDown, GripVertical, HelpCircle } from "lucide-react";
import { CVData } from "@/types/cv";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DraggableEducationItemProps {
  edu: CVData['education'][0];
  index: number;
  updateEducation: (id: string, field: string, value: string) => void;
  removeEducation: (id: string) => void;
  isMinimized: boolean;
  toggleMinimize: (id: string) => void;
}

export const DraggableEducationItem = ({
  edu,
  index,
  updateEducation,
  removeEducation,
  isMinimized,
  toggleMinimize
}: DraggableEducationItemProps) => {
  return (
    <Draggable draggableId={edu.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border rounded-lg p-4 space-y-4 bg-white transition-shadow ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div
                {...provided.dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={() => toggleMinimize(edu.id)}
              >
                {isMinimized ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                )}
              </Button>
              <h3 className="font-medium">{edu.degree || 'Título/Grado'} en {edu.institution || 'Institución'}</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeEducation(edu.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {!isMinimized && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título/Grado</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="ej. Ingeniería Informática"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institución</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="ej. Universidad XYZ"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={edu.location}
                  onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                  placeholder="ej. Ciudad de México, México"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Año Egreso</Label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    placeholder="ej. 2020"
                  />
                </div>
                <div></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1 mb-2.5">
                  <Label>Descripción (opcional)</Label>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5} className="max-w-xs bg-gray-900 text-white p-3 rounded-md shadow-lg">
                        <p>Añade información relevante sobre tu formación como especializaciones, honores académicos o proyectos destacados. Mantén la descripción breve y enfocada en logros académicos significativos.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  value={edu.description}
                  onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                  rows={2}
                  placeholder="ej. Especialización en Desarrollo de Software"
                />
              </div>
            </div>
          )}
          {isMinimized && (
            <div className="text-sm text-gray-500 italic mt-1">
              Educación minimizada. Haz clic en el botón para expandir.
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
