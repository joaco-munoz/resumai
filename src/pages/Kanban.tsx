import { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from '@/contexts/AuthContext';
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

  const { columns, showFireworks, setShowFireworks, handleDragEnd } = 
    useKanbanDragDrop(interviews, updateInterviewStatus);

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
      await handleUpdateInterview();
    } else {
      await handleAddInterview();
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    await handleDeleteInterview();
    setIsDeleteDialogOpen(false);
    setIsModalOpen(false);
  };

  if (!user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso requerido</h2>
              <p className="text-gray-600">Debes iniciar sesión para ver tus postulaciones.</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
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
    </SidebarProvider>
  );
};

export default Kanban;
