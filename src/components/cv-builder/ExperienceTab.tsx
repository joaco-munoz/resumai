
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ArrowRight, ChevronUp, ChevronDown } from "lucide-react";
import AIButton from "@/components/AIButton";
import { CVData } from "@/types/cv";
import { useState } from "react";

const MAX_BULLET_CHARACTERS = 250;
const MAX_BULLET_POINTS = 5;

interface ExperienceTabProps {
  cvData: CVData;
  updateExperience: (id: string, field: string, value: any) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  improveWithAI: (section: string) => void;
  isImproving: string | null;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
}

export const ExperienceTab = ({ 
  cvData, 
  updateExperience, 
  addExperience: originalAddExperience, 
  removeExperience, 
  improveWithAI, 
  isImproving, 
  goToPreviousTab, 
  goToNextTab 
}: ExperienceTabProps) => {
  // Estado para controlar qué experiencias están minimizadas
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
          Detalla tu experiencia profesional más relevante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cvData.experience.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => toggleMinimize(exp.id)}
                >
                  {minimizedExperiences[exp.id] ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
                <h3 className="font-medium">{exp.position || 'Cargo'} en {exp.company || 'Empresa'}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeExperience(exp.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {!minimizedExperiences[exp.id] && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="ej. Desarrollador Frontend"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="ej. TechCorp"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    placeholder="ej. Ciudad de México, México"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha inicio</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha fin</Label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onCheckedChange={(checked) => updateExperience(exp.id, 'current', checked)}
                    />
                    <Label htmlFor={`current-${exp.id}`}>Trabajo actual</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  {exp.description.split('\n').map((line, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex gap-2 items-start">
                        <Input
                          className="flex-1"
                          value={line}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length <= MAX_BULLET_CHARACTERS) {
                              const lines = exp.description.split('\n');
                              lines[idx] = newValue;
                              updateExperience(exp.id, 'description', lines.join('\n'));
                            }
                          }}
                          placeholder={`Responsabilidad o logro ${idx + 1}`}
                          maxLength={MAX_BULLET_CHARACTERS}
                        />
                        <AIButton
                          onClick={() => improveWithAI(`experience-${exp.id}-${idx}`)}
                          isLoading={isImproving === `experience-${exp.id}-${idx}`}
                          disabled={!line.trim()}
                          size="sm"
                          className="shrink-0"
                        >
                          IA
                        </AIButton>
                        {exp.description.split('\n').length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const lines = exp.description.split('\n');
                              lines.splice(idx, 1);
                              updateExperience(exp.id, 'description', lines.join('\n'));
                            }}
                            className="text-red-600 hover:text-red-700 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex justify-end items-center text-xs">
                        <span className={`${line.length >= MAX_BULLET_CHARACTERS ? 'text-red-500' : 'text-gray-500'}`}>
                          {line.length}/{MAX_BULLET_CHARACTERS} caracteres
                        </span>
                        {line.length >= MAX_BULLET_CHARACTERS && (
                          <span className="text-red-500 font-medium ml-2">
                            Límite máximo alcanzado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const lines = exp.description ? exp.description.split('\n') : [];
                        if (lines.length < MAX_BULLET_POINTS) {
                          lines.push('');
                          updateExperience(exp.id, 'description', lines.join('\n'));
                        }
                      }}
                      disabled={exp.description.split('\n').length >= MAX_BULLET_POINTS}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar bullet
                    </Button>
                    {exp.description.split('\n').length >= MAX_BULLET_POINTS && (
                      <div className="text-xs text-amber-600 font-medium mt-1">
                        Limitamos cada sección a {MAX_BULLET_POINTS} logros  para que tu CV sea claro, conciso y 100 % compatible con los sistemas ATS. Prioriza los resultados más relevantes y obtendrás mayor impacto ante reclutadores y software de filtrado.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {minimizedExperiences[exp.id] && (
              <div className="text-sm text-gray-500 italic mt-1">
                Experiencia minimizada. Haz clic en el botón para expandir.
              </div>
            )}
          </div>
        ))}

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
