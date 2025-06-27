import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import { Interview } from './useJobApplications';

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
}

export const useKanbanDragDrop = (
  interviews: Interview[],
  updateInterviewStatus: (id: string, status: Interview['status']) => Promise<boolean>
) => {
  const [showFireworks, setShowFireworks] = useState(false);

  const columns: KanbanColumn[] = [
    { id: 'saved', title: 'Guardado', count: interviews.filter(i => i.status === 'saved').length },
    { id: 'applied', title: 'Postulado', count: interviews.filter(i => i.status === 'applied').length },
    { id: 'interviewing', title: 'En entrevista', count: interviews.filter(i => i.status === 'interviewing').length },
    { id: 'offer', title: 'Oferta Recibida', count: interviews.filter(i => i.status === 'offer').length },
    { id: 'rejected', title: 'Rechazado', count: interviews.filter(i => i.status === 'rejected').length }
  ];

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId as Interview['status'];
    const success = await updateInterviewStatus(draggableId, newStatus);

    if (success) {
      const columnTitle = columns.find(col => col.id === destination.droppableId)?.title;
      
      // Trigger fireworks animation if moved to offer status
      if (newStatus === 'offer') {
        setShowFireworks(true);
        toast.success(`🎉 ¡Felicidades! Postulación movida a ${columnTitle}`, {
          duration: 4000,
        });
      } else {
        toast.success(`Postulación movida a ${columnTitle}`);
      }
    }
  };

  return {
    columns,
    showFireworks,
    setShowFireworks,
    handleDragEnd
  };
};
