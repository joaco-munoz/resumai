
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface CVBuilderHeaderProps {
  currentCvId: string | null;
}

export const CVBuilderHeader = ({ currentCvId }: CVBuilderHeaderProps) => {

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
        {/* Botones de descarga eliminados */}
      </div>
    </header>
  );
};
