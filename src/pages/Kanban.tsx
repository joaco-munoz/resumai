
import { KanbanStatsProvider } from "@/contexts/KanbanStatsContext";
import { KanbanHeader } from "@/components/KanbanHeader";
import { KanbanColumn } from "@/components/KanbanColumn";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

function KanbanContent() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const columns = [
    { id: 'applied', title: 'Postulado', color: 'bg-blue-500' },
    { id: 'interviewing', title: 'En Entrevista', color: 'bg-yellow-500' },
    { id: 'offered', title: 'Oferta Recibida', color: 'bg-green-500' },
    { id: 'rejected', title: 'Rechazado', color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_applications_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast.error("Error al cargar las postulaciones");
        return;
      }

      setApplications(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addApplication = () => {
    // This would typically open a modal or form
    console.log("Add application");
  };

  const updateApplication = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error("Error updating application:", error);
        toast.error("Error al actualizar la postulación");
        return;
      }

      fetchApplications(); // Refresh data
      toast.success("Postulación actualizada");
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Error al actualizar la postulación");
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting application:", error);
        toast.error("Error al eliminar la postulación");
        return;
      }

      fetchApplications(); // Refresh data
      toast.success("Postulación eliminada");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Error al eliminar la postulación");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    await updateApplication(draggableId, { status: destination.droppableId });
  };

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
        <KanbanHeader 
          totalApplications={applications.length}
          onAddApplication={addApplication} 
        />
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {columns.map((column) => (
              <div key={column.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className={`${column.color} text-white px-3 py-1 rounded mb-4`}>
                  <h3 className="font-semibold">{column.title}</h3>
                </div>
                <div className="space-y-2">
                  {applications
                    .filter(app => app.status === column.id)
                    .map(app => (
                      <div key={app.id} className="bg-gray-50 p-3 rounded border">
                        <h4 className="font-medium">{app.position}</h4>
                        <p className="text-sm text-gray-600">{app.company}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => deleteApplication(app.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
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
