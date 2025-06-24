
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { CVData } from "@/types/cv";

interface EducationTabProps {
  cvData: CVData;
  updateEducation: (id: string, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  goToPreviousTab: () => void;
  goToNextTab: () => void;
}

export const EducationTab = ({ 
  cvData, 
  updateEducation, 
  addEducation, 
  removeEducation, 
  goToPreviousTab, 
  goToNextTab 
}: EducationTabProps) => {
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
          Incluye tu formación académica más relevante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cvData.education.map((edu) => (
          <div key={edu.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Educación {cvData.education.indexOf(edu) + 1}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
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
                <Label>Año</Label>
                <Input
                  value={edu.year}
                  onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                  placeholder="ej. 2020"
                />
              </div>
              <div></div>
            </div>
            
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={edu.description}
                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                rows={2}
                placeholder="ej. Especialización en Desarrollo de Software"
              />
            </div>
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
