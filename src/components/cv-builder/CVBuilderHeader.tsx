
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface CVBuilderHeaderProps {
  currentCvId: string | null;
  exportPDF: () => void;
  exportWord: () => void;
  downloadCount: number;
}

export const CVBuilderHeader = ({ currentCvId, exportPDF, exportWord, downloadCount }: CVBuilderHeaderProps) => {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {currentCvId ? "Editar CV" : "Editor de CV"}
            </h1>
            <p className="text-gray-600 mt-2">
              {currentCvId ? "Modifica tu CV principal" : "Crea tu CV profesional optimizado para ATS"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF {downloadCount > 0 && "(con marca de agua)"}
          </Button>
          <Button onClick={exportWord} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Word {downloadCount > 0 && "(con marca de agua)"}
          </Button>
        </div>
      </div>
    </header>
  );
};
