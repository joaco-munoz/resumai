
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, ExternalLink, Edit, Search, Filter, Download, Upload, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Interview {
  id: string;
  position: string;
  company: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes?: string;
  interview_date?: string;
  interview_link?: string;
  applied_date: string;
  job_type?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Kanban = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    notes: '',
    interview_date: '',
    interview_link: '',
    job_type: '',
    location: ''
  });
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle hydration for drag and drop
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch job applications from Supabase
  const fetchInterviews = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('job_applications_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Error al cargar las postulaciones');
        return;
      }

      const formattedData: Interview[] = data.map(item => ({
        id: item.id,
        position: item.position,
        company: item.company,
        status: item.status as Interview['status'],
        notes: item.notes || '',
        interview_date: item.interview_date || '',
        interview_link: item.interview_link || '',
        applied_date: item.applied_date,
        job_type: item.job_type || '',
        location: item.location || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id
      }));

      setInterviews(formattedData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  const columns = [
    { id: 'saved', title: 'Guardado', count: interviews.filter(i => i.status === 'saved').length },
    { id: 'applied', title: 'Postulado', count: interviews.filter(i => i.status === 'applied').length },
    { id: 'interviewing', title: 'En entrevista', count: interviews.filter(i => i.status === 'interviewing').length },
    { id: 'offer', title: 'Oferta Recibidad', count: interviews.filter(i => i.status === 'offer').length },
    { id: 'rejected', title: 'Rechazado', count: interviews.filter(i => i.status === 'rejected').length }
  ];

  const handleAddInterview = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para añadir postulaciones");
      return;
    }

    if (!formData.position || !formData.company) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('job_applications_tracking')
        .insert({
          user_id: user.id,
          position: formData.position,
          company: formData.company,
          status: 'saved',
          notes: formData.notes || null,
          interview_date: formData.interview_date || null,
          interview_link: formData.interview_link || null,
          job_type: formData.job_type || null,
          location: formData.location || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding interview:', error);
        toast.error('Error al añadir la postulación');
        return;
      }

      // Refresh the interviews list
      await fetchInterviews();
      
      setFormData({ position: '', company: '', notes: '', interview_date: '', interview_link: '', job_type: '', location: '' });
      setIsModalOpen(false);
      toast.success("Postulación añadida al tablero");
    } catch (error) {
      console.error('Error adding interview:', error);
      toast.error('Error al añadir la postulación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormData({
      position: interview.position,
      company: interview.company,
      notes: interview.notes || '',
      interview_date: interview.interview_date || '',
      interview_link: interview.interview_link || '',
      job_type: interview.job_type || '',
      location: interview.location || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateInterview = async () => {
    if (!selectedInterview || !user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .update({
          position: formData.position,
          company: formData.company,
          notes: formData.notes || null,
          interview_date: formData.interview_date || null,
          interview_link: formData.interview_link || null,
          job_type: formData.job_type || null,
          location: formData.location || null
        })
        .eq('id', selectedInterview.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating interview:', error);
        toast.error('Error al actualizar la postulación');
        return;
      }

      // Refresh the interviews list
      await fetchInterviews();
      
      setSelectedInterview(null);
      setFormData({ position: '', company: '', notes: '', interview_date: '', interview_link: '', job_type: '', location: '' });
      setIsModalOpen(false);
      toast.success("Postulación actualizada");
    } catch (error) {
      console.error('Error updating interview:', error);
      toast.error('Error al actualizar la postulación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !user) {
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId as Interview['status'];

    try {
      const { error } = await supabase
        .from('job_applications_tracking')
        .update({ status: newStatus })
        .eq('id', draggableId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating status:', error);
        toast.error('Error al mover la postulación');
        return;
      }

      // Update local state immediately for better UX
      setInterviews(prev => prev.map(interview =>
        interview.id === draggableId
          ? { ...interview, status: newStatus }
          : interview
      ));
      
      const columnTitle = columns.find(col => col.id === destination.droppableId)?.title;
      toast.success(`Postulación movida a ${columnTitle}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al mover la postulación');
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Seguimiento Postulaciones</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">{interviews.length} TOTAL JOBS</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir postulación
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedInterview ? 'Editar Aplicación' : 'Nueva Aplicación'}
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
                          <Label htmlFor="jobType">Tipo de Trabajo</Label>
                          <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Ubicación</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="ej. Remote, Madrid, etc."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Fecha Entrevista</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.interview_date}
                            onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link">Enlace Entrevista</Label>
                          <Input
                            id="link"
                            value={formData.interview_link}
                            onChange={(e) => setFormData({ ...formData, interview_link: e.target.value })}
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
                          setFormData({ position: '', company: '', notes: '', interview_date: '', interview_link: '', job_type: '', location: '' });
                        }}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={selectedInterview ? handleUpdateInterview : handleAddInterview}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Guardando...' : (selectedInterview ? 'Actualizar' : 'Agregar')} Aplicación
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

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
                    <div key={column.id} className="bg-white rounded-lg">
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
                            {filteredInterviews
                              .filter(interview => interview.status === column.id)
                              .map((interview, index) => (
                                <Draggable key={interview.id} draggableId={interview.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 ${
                                        snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                      }`}
                                    >
                                      <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-600">
                                                  {interview.company.charAt(0)}
                                                </span>
                                              </div>
                                              <div>
                                                <CardTitle className="text-sm font-medium text-gray-900">
                                                  {interview.position}
                                                </CardTitle>
                                                <CardDescription className="text-xs text-blue-600">
                                                  {interview.company}
                                                </CardDescription>
                                              </div>
                                            </div>
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
                                          {interview.location && (
                                            <p className="text-xs text-gray-500">{interview.location}</p>
                                          )}
                                          
                                          {interview.notes && (
                                            <p className="text-xs text-gray-600 line-clamp-2">{interview.notes}</p>
                                          )}
                                          
                                          {interview.interview_date && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                              <Calendar className="h-3 w-3" />
                                              {new Date(interview.interview_date).toLocaleDateString('es-ES')}
                                            </div>
                                          )}
                                          
                                          {interview.interview_link && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 text-xs p-1"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(interview.interview_link, '_blank');
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
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Kanban;
