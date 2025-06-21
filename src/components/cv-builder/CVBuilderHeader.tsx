
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface CVBuilderHeaderProps {
  currentCvId: string | null;
  exportPDF: () => void;
}

export const CVBuilderHeader = ({ currentCvId, exportPDF }: CVBuilderHeaderProps) => {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {currentCvId ? "Editar CV" : "Editor de CV"}
            </h1>
            <p className="text-gray-600">
              {currentCvId ? "Modifica tu CV existente" : "Crea tu CV profesional optimizado para ATS"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Badge variant="secondary">Guardado automático activado</Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
