
import { KanbanStatsProvider } from "@/contexts/KanbanStatsContext";
import { KanbanHeader } from "@/components/KanbanHeader";
import { KanbanColumn } from "@/components/KanbanColumn";
import { useJobApplications } from "@/hooks/useJobApplications";
import { useKanbanDragDrop } from "@/hooks/useKanbanDragDrop";
import { DragDropContext } from "react-beautiful-dnd";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

function KanbanContent() {
  const { applications, loading, addApplication, updateApplication, deleteApplication } = useJobApplications();
  const { onDragEnd } = useKanbanDragDrop(updateApplication);

  const columns = [
    { id: 'applied', title: 'Postulado', color: 'bg-blue-500' },
    { id: 'interviewing', title: 'En Entrevista', color: 'bg-yellow-500' },
    { id: 'offered', title: 'Oferta Recibida', color: 'bg-green-500' },
    { id: 'rejected', title: 'Rechazado', color: 'bg-red-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <HeaderBrand />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando seguimiento...</p>
          </div>
        </div>
        <Dock 
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <HeaderBrand />
      
      <div className="container mx-auto px-4 py-6">
        <KanbanHeader onAddApplication={addApplication} />
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                applications={applications.filter(app => app.status === column.id)}
                onUpdateApplication={updateApplication}
                onDeleteApplication={deleteApplication}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}

export default function Kanban() {
  return (
    <KanbanStatsProvider>
      <KanbanContent />
    </KanbanStatsProvider>
  );
}
