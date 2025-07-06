
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, HelpCircle } from "lucide-react";
import { CVData } from "@/types/cv";

interface PersonalInfoTabProps {
  cvData: CVData;
  handlePersonalInfoChange: (field: string, value: string) => void;
  goToNextTab: () => void;
}

export const PersonalInfoTab = ({ 
  cvData, 
  handlePersonalInfoChange, 
  goToNextTab 
}: PersonalInfoTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              value={cvData.personalInfo.fullName}
              onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={cvData.personalInfo.email}
              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={cvData.personalInfo.phone}
              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={cvData.personalInfo.location}
              onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1 mb-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
            </div>
            <Input
              id="linkedin"
              value={cvData.personalInfo.linkedin}
              onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1 mb-2">
              <Label htmlFor="website">Sitio web (opcional)</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5} className="max-w-xs bg-gray-900 text-white p-3 rounded-md shadow-lg">
                    <p>Recomendado para profesionales con portafolio web, diseñadores, desarrolladores y creativos.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="website"
              value={cvData.personalInfo.website}
              onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
              placeholder="ej. www.tuportafolio.com"
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={goToNextTab}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
