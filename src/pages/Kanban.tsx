import { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dock from "@/components/ui/Dock";
import { useAuth } from '@/contexts/AuthContext';
import { useKanbanStats, KanbanStatsProvider } from '@/contexts/KanbanStatsContext';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import FireworksAnimation from '@/components/FireworksAnimation';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';
import { JobApplicationForm } from '@/components/JobApplicationForm';
import { KanbanColumn } from '@/components/KanbanColumn';
import { KanbanHeader } from '@/components/KanbanHeader';
import { filterInterviews } from '@/utils/kanbanUtils';

const Kanban = () => {
  const { user } = useAuth();
  const { refreshStats } = useKanbanStats(); // Obtenemos la función para refrescar estadísticas
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm] = useState('');
  const [statusFilter] = useState('all');

  const {
    interviews,
    loading,
    selectedInterview,
    isSubmitting,
    isDeleting,
    formData,
    setFormData,
    resetForm,
    handleAddInterview,
    handleEditInterview,
    handleUpdateInterview,
    handleDeleteInterview,
    updateInterviewStatus
  } = useJobApplications();

  // Customizamos el handleDragEnd para actualizar estadísticas
  const { columns, showFireworks, setShowFireworks } = 
    useKanbanDragDrop(interviews, updateInterviewStatus);
    
  // Wrapper para handleDragEnd que actualiza las estadísticas después del drag
  const handleDragEnd = async (result: any) => {
    const { destination, source } = result;
    
    // Si no hay cambio de columna, no hacemos nada
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Actualizar posición con el hook original
    const success = await updateInterviewStatus(result.draggableId, destination.droppableId);
    
    // Si la actualización fue exitosa y hubo cambio en las columnas de aplicaciones/entrevistas
    if (success) {
      // Refrescamos las estadísticas solo si el movimiento afecta a las columnas que nos interesan
      if (source.droppableId === 'applied' || destination.droppableId === 'applied' ||
          source.droppableId === 'interviewing' || destination.droppableId === 'interviewing') {
        refreshStats();
      }
      
      // Manejamos los fuegos artificiales
      if (destination.droppableId === 'offer') {
        setShowFireworks(true);
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredInterviews = filterInterviews(interviews, searchTerm, statusFilter);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditClick = (interview: any) => {
    handleEditInterview(interview);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (selectedInterview) {
      const oldStatus = selectedInterview.status;
      
      // En handleUpdateInterview() no devuelve un valor boolean
      await handleUpdateInterview();
      
      // Si el estado anterior era applied o interviewing, actualizar estadísticas
      // ya que podría haber cambios relevantes para las estadísticas
      if (oldStatus === 'applied' || oldStatus === 'interviewing') {
        refreshStats();
      }
    } else {
      // handleAddInterview() siempre añade con status='saved', pero debemos refrescar
      // estadísticas igualmente por si hay cambios en la UI
      await handleAddInterview();
      refreshStats();
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const deletedStatus = selectedInterview?.status;
    
    // handleDeleteInterview() no devuelve un valor boolean
    await handleDeleteInterview();
    
    // Si se eliminó una tarjeta en estado applied o interviewing, actualizar estadísticas
    if (deletedStatus && (deletedStatus === 'applied' || deletedStatus === 'interviewing')) {
      refreshStats();
    }
    
    setIsDeleteDialogOpen(false);
    setIsModalOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex w-full bg-gray-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso requerido</h2>
            <p className="text-gray-600">Debes iniciar sesión para ver tus postulaciones.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen flex w-full bg-gray-50">
        <main className="flex-1">
          <KanbanHeader 
            totalApplications={interviews.length}
            onAddApplication={handleOpenModal}
          />

          {/* Kanban Board */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando postulaciones...</p>
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-5 gap-4">
                  {columns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      interviews={filteredInterviews}
                      onEditInterview={handleEditClick}
                    />
                  ))}
                </div>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>
      
      {/* Job Application Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <div style={{ display: 'none' }} />
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInterview ? 'Editar Postulación' : 'Nueva Postulación'}
            </DialogTitle>
            <DialogDescription>
              {selectedInterview ? 'Actualiza los detalles de tu postulación' : 'Agrega una nueva postulación de trabajo a tu tablero'}
            </DialogDescription>
          </DialogHeader>
          <JobApplicationForm
            formData={formData}
            setFormData={setFormData}
            selectedInterview={selectedInterview}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            onDelete={selectedInterview ? handleDeleteClick : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={selectedInterview ? `${selectedInterview.position} en ${selectedInterview.company}` : ''}
        isDeleting={isDeleting}
      />

      {/* Fireworks Animation */}
      <FireworksAnimation 
        isActive={showFireworks} 
        onComplete={() => setShowFireworks(false)} 
      />
    </>
  );
};

// Componente de página que envuelve el Kanban con el KanbanStatsProvider
export default function KanbanPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <KanbanStatsProvider>
        <Kanban />
      </KanbanStatsProvider>
      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </SidebarProvider>
  )
}
