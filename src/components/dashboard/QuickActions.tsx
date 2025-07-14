
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Briefcase, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Editor de CVs",
      description: "Crea o edita tus currículums",
      icon: FileText,
      action: () => navigate("/app/cv-selector"),
      buttonText: "Ir al Editor"
    },
    {
      title: "Job Matcher",
      description: "Encuentra trabajos compatibles con tu CV",
      icon: BarChart3,
      action: () => navigate("/app/match"),
      buttonText: "Buscar Trabajos"
    },
    {
      title: "Seguimiento",
      description: "Rastrea tus aplicaciones de trabajo",
      icon: Briefcase,
      action: () => navigate("/app/kanban"),
      buttonText: "Ver Seguimiento"
    },
    {
      title: "Mis Currículums",
      description: "Revisa tus currículums e informes",
      icon: FolderOpen,
      action: () => navigate("/app/cvs"),
      buttonText: "Ver Currículums"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Acciones Rápidas
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-2 px-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <action.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-xs mt-1">
                {action.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-3">
              <Button 
                onClick={action.action}
                className="w-full text-sm py-1.5" 
                size="sm"
              >
                {action.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
