
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface CVBuilderTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  completedSections: string[];
  progress: number;
}

export const CVBuilderTabs = ({ 
  activeTab, 
  setActiveTab, 
  completedSections, 
  progress 
}: CVBuilderTabsProps) => {
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="text-xs flex items-center gap-1">
            {completedSections.includes('personal') && <Check className="h-4 w-4 text-green-500" />}
            Personal
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-xs flex items-center gap-1">
            {completedSections.includes('summary') && <Check className="h-4 w-4 text-green-500" />}
            Resumen
          </TabsTrigger>
          <TabsTrigger value="experience" className="text-xs flex items-center gap-1">
            {completedSections.includes('experience') && <Check className="h-4 w-4 text-green-500" />}
            Experiencia
          </TabsTrigger>
          <TabsTrigger value="education" className="text-xs flex items-center gap-1">
            {completedSections.includes('education') && <Check className="h-4 w-4 text-green-500" />}
            Educación
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs flex items-center gap-1">
            {completedSections.includes('skills') && <Check className="h-4 w-4 text-green-500" />}
            Habilidades
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progreso del CV</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};
