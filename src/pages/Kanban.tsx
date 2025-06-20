import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, ExternalLink, Edit } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface Interview {
  id: string;
  position: string;
  company: string;
  status: 'applied' | 'interview' | 'offer' | 'hired' | 'rejected';
  notes: string;
  date?: string;
  link?: string;
  appliedDate: string;
}

const Kanban = () => {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: '1',
      position: 'Frontend Developer',
      company: 'TechCorp',
      status: 'applied',
      notes: 'Aplicado a través de LinkedIn',
      appliedDate: '2024-01-15'
    },
    {
      id: '2',
      position: 'Full Stack Engineer',
      company: 'StartupXYZ',
      status: 'interview',
      notes: 'Primera entrevista técnica programada',
      date: '2024-01-20',
      link: 'https://meet.google.com/xyz',
      appliedDate: '2024-01-10'
    }
  ]);

  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    notes: '',
    date: '',
    link: ''
  });

  const columns = [
    { id: 'applied', title: 'Aplicado', color: 'bg-blue-100 border-blue-200' },
    { id: 'interview', title: 'Entrevista', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'offer', title: 'Oferta', color: 'bg-green-100 border-green-200' },
    { id: 'hired', title: 'Contratado', color: 'bg-emerald-100 border-emerald-200' },
    { id: 'rejected', title: 'Rechazado', color: 'bg-red-100 border-red-200' }
  ];

  const handleAddInterview = () => {
    if (!formData.position || !formData.company) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const newInterview: Interview = {
      id: Date.now().toString(),
      position: formData.position,
      company: formData.company,
      status: 'applied',
      notes: formData.notes,
      date: formData.date,
      link: formData.link,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setInterviews([...interviews, newInterview]);
    setFormData({ position: '', company: '', notes: '', date: '', link: '' });
    setIsModalOpen(false);
    toast.success("Aplicación añadida al tablero");
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormData({
      position: interview.position,
      company: interview.company,
      notes: interview.notes,
      date: interview.date || '',
      link: interview.link || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateInterview = () => {
    if (!selectedInterview) return;

    const updatedInterviews = interviews.map(interview =>
      interview.id === selectedInterview.id
        ? {
            ...interview,
            position: formData.position,
            company: formData.company,
            notes: formData.notes,
            date: formData.date,
            link: formData.link
          }
        : interview
    );

    setInterviews(updatedInterviews);
    setSelectedInterview(null);
    setFormData({ position: '', company: '', notes: '', date: '', link: '' });
    setIsModalOpen(false);
    toast.success("Aplicación actualizada");
  };

  const moveInterview = (interviewId: string, newStatus: string) => {
    const updatedInterviews = interviews.map(interview =>
      interview.id === interviewId
        ? { ...interview, status: newStatus as Interview['status'] }
        : interview
    );
    setInterviews(updatedInterviews);
    toast.success("Estado actualizado");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    // Si se mueve a la misma columna y posición, no hacer nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Actualizar el estado de la entrevista
    const updatedInterviews = interviews.map(interview =>
      interview.id === draggableId
        ? { ...interview, status: destination.droppableId as Interview['status'] }
        : interview
    );

    setInterviews(updatedInterviews);
    
    const columnTitle = columns.find(col => col.id === destination.droppableId)?.title;
    toast.success(`Aplicación movida a ${columnTitle}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Tablero de Aplicaciones</h1>
                  <p className="text-gray-600">Gestiona tu proceso de búsqueda de empleo</p>
                </div>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-brand-500 to-brand-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Aplicación
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedInterview ? 'Editar Aplicación' : 'Adding Nueva Aplicación'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedInterview ? 'Actualiza los detalles de tu aplicación' : 'Agrega una nueva aplicación de trabajo a tu tablero'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Posición *</Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="ej. Frontend Developer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa *</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="ej. TechCorp"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha Entrevista</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Enlace Entrevista</Label>
                        <Input
                          id="link"
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          placeholder="https://meet.google.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Notas sobre la aplicación, contactos, etc."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => {
                        setIsModalOpen(false);
                        setSelectedInterview(null);
                        setFormData({ position: '', company: '', notes: '', date: '', link: '' });
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={selectedInterview ? handleUpdateInterview : handleAddInterview}>
                        {selectedInterview ? 'Actualizar' : 'Agregar'} Aplicación
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="p-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {columns.map((column) => (
                  <div key={column.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{column.title}</h3>
                      <Badge variant="secondary">
                        {interviews.filter(interview => interview.status === column.id).length}
                      </Badge>
                    </div>
                    
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-gray-100' : ''
                          }`}
                        >
                          {interviews
                            .filter(interview => interview.status === column.id)
                            .map((interview, index) => (
                              <Draggable key={interview.id} draggableId={interview.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`${column.color} cursor-pointer hover:shadow-md transition-all duration-200 ${
                                      snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                    }`}
                                  >
                                    <CardHeader className="pb-2">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <CardTitle className="text-sm font-medium">{interview.position}</CardTitle>
                                          <CardDescription className="text-xs">{interview.company}</CardDescription>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditInterview(interview);
                                          }}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                      <div className="space-y-2">
                                        {interview.notes && (
                                          <p className="text-xs text-gray-600 line-clamp-2">{interview.notes}</p>
                                        )}
                                        
                                        {interview.date && (
                                          <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(interview.date).toLocaleDateString('es-ES')}
                                          </div>
                                        )}
                                        
                                        {interview.link && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs p-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(interview.link, '_blank');
                                            }}
                                          >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            Ver enlace
                                          </Button>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Kanban;
