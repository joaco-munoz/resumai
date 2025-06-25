
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, BarChart3, Search, CheckCircle ,FolderOpen, Target} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate("/app/cv/new")} 
          className="justify-start"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          Crear Nuevo CV
        </Button>
        
        <Button 
          onClick={() => navigate("/app/cvs")} 
          className="justify-start"
          variant="outline"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Ver Mis CVs
        </Button>
        
        <Button 
          onClick={() => navigate("/app/kanban")} 
          className="justify-start"
          variant="outline"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Seguimiento
        </Button>
        
        <Button 
          onClick={() => navigate("/app/match")} 
          className="justify-start"
          variant="outline"
        >
          <Target className="h-4 w-4 mr-2" />
          Match de ofertas
        </Button>
      </CardContent>
    </Card>
  );
};
