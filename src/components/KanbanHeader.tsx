import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface KanbanHeaderProps {
  totalApplications: number;
  onAddApplication: () => void;
}

export const KanbanHeader = ({ totalApplications, onAddApplication }: KanbanHeaderProps) => {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold gradient-text">Seguimiento Postulaciones</h1>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onAddApplication}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir postulación
            </Button>
          </div>
          <p className="text-gray-600 mt-1">
            <span className="font-semibold">{totalApplications} postulaciones totales</span>
          </p>
        </div>
      </div>
    </header>
  );
};
