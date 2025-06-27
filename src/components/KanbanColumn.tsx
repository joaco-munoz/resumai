import { Droppable, Draggable } from "react-beautiful-dnd";
import { Interview } from "@/hooks/useJobApplications";
import { JobApplicationCard } from "./JobApplicationCard";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    count: number;
  };
  interviews: Interview[];
  onEditInterview: (interview: Interview) => void;
}

export const KanbanColumn = ({ column, interviews, onEditInterview }: KanbanColumnProps) => {
  const columnInterviews = interviews.filter(interview => interview.status === column.id);

  return (
    <div className="bg-white rounded-lg">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-900 tracking-wide">{column.title}</h3>
          <span className="text-sm text-gray-500">({column.count})</span>
        </div>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 min-h-[400px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-50' : ''
            }`}
          >
            {columnInterviews.map((interview, index) => (
              <Draggable key={interview.id} draggableId={interview.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <JobApplicationCard
                      interview={interview}
                      onEdit={onEditInterview}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
