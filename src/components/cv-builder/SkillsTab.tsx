
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { CVData } from "@/types/cv";
import { SkillInput } from "./SkillInput";

interface SkillsTabProps {
  cvData: CVData;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  goToPreviousTab: () => void;
  saveCV: () => void;
  saveAndAdapt: () => void;
}

export const SkillsTab = ({ 
  cvData, 
  addSkill, 
  removeSkill, 
  goToPreviousTab, 
  saveCV, 
  saveAndAdapt 
}: SkillsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilidades</CardTitle>
        <CardDescription>
        Añade habilidades medibles—herramientas, métodos y soft skills—para demostrar tu expertise y potenciar el match.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SkillInput 
          onAddSkill={addSkill}
          existingSkills={cvData.skills}
        />

        <div className="flex flex-wrap gap-2">
          {cvData.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-sm flex items-center gap-1">
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {cvData.skills.length === 0 && (
            <p className="text-gray-500 text-sm">No hay habilidades agregadas. Escribe una habilidad arriba y haz clic en "Agregar".</p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={goToPreviousTab}>
            Atrás
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveCV}>
              Guardar CV
            </Button>
            <Button onClick={saveAndAdapt}>
              Guardar y Adaptar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
