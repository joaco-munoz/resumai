import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus } from "lucide-react";

interface KanbanHeaderProps {
  totalApplications: number;
  onAddApplication: () => void;
}

export const KanbanHeader = ({ totalApplications, onAddApplication }: KanbanHeaderProps) => {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seguimiento Postulaciones</h1>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">{totalApplications} postulaciones totales</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onAddApplication}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir postulación
          </Button>
        </div>
      </div>
    </header>
  );
};
