
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, Briefcase, Plus } from "lucide-react";
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
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Acciones Rápidas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <action.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-sm">
                {action.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={action.action}
                className="w-full"
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
