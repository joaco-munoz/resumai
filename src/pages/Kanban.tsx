
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

interface Interview {
  id: string;
  position: string;
  company: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes: string;
  date?: string;
  link?: string;
  appliedDate: string;
  jobType?: string;
  location?: string;
}

const Kanban = () => {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: '1',
      position: 'Frontend Developer',
      company: 'TechCorp',
      status: 'applied',
      notes: 'Aplicado a través de LinkedIn',
      appliedDate: '2024-01-15',
      jobType: 'Full-time',
      location: 'Remote'
    },
    {
      id: '2',
      position: 'Full Stack Engineer',
      company: 'StartupXYZ',
      status: 'interviewing',
      notes: 'Primera entrevista técnica programada',
      date: '2024-01-20',
      link: 'https://meet.google.com/xyz',
      appliedDate: '2024-01-10',
      jobType: 'Full-time',
      location: 'Hybrid'
    }
  ]);

  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    notes: '',
    date: '',
    link: '',
    jobType: '',
    location: ''
  });
  const [isClient, setIsClient] = useState(false);

  // Handle hydration for drag and drop
  useEffect(() => {
    setIsClient(true);
  }, []);

  const columns = [
    { id: 'saved', title: 'SAVED', count: interviews.filter(i => i.status === 'saved').length },
    { id: 'applied', title: 'APPLIED', count: interviews.filter(i => i.status === 'applied').length },
    { id: 'interviewing', title: 'INTERVIEWING', count: interviews.filter(i => i.status === 'interviewing').length },
    { id: 'offer', title: 'OFFER', count: interviews.filter(i => i.status === 'offer').length },
    { id: 'rejected', title: 'REJECTED', count: interviews.filter(i => i.status === 'rejected').length }
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
      status: 'saved',
      notes: formData.notes,
      date: formData.date,
      link: formData.link,
      jobType: formData.jobType,
      location: formData.location,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setInterviews([...interviews, newInterview]);
    setFormData({ position: '', company: '', notes: '', date: '', link: '', jobType: '', location: '' });
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
      link: interview.link || '',
      jobType: interview.jobType || '',
      location: interview.location || ''
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
            link: formData.link,
            jobType: formData.jobType,
            location: formData.location
          }
        : interview
    );

    setInterviews(updatedInterviews);
    setSelectedInterview(null);
    setFormData({ position: '', company: '', notes: '', date: '', link: '', jobType: '', location: '' });
    setIsModalOpen(false);
    toast.success("Aplicación actualizada");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const updatedInterviews = interviews.map(interview =>
      interview.id === draggableId
        ? { ...interview, status: destination.droppableId as Interview['status'] }
        : interview
    );

    setInterviews(updatedInterviews);
    
    const columnTitle = columns.find(col => col.id === destination.droppableId)?.title;
    toast.success(`Postulación movida a ${columnTitle}`);
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                          <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
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
                          setFormData({ position: '', company: '', notes: '', date: '', link: '', jobType: '', location: '' });
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
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-6 mb-4">
              <button
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  statusFilter === 'all' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStatusFilter('all')}
              >
                Active
              </button>
              <button
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  statusFilter === 'archived' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setStatusFilter('archived')}
              >
                Archived
              </button>
            </div>
{/*
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for roles or companies"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Applied from" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Applied until" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="quarter">This quarter</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">0 Jobs Selected</span>
                <Button variant="ghost" size="sm">
                  <span className="text-sm text-gray-600">Visible Columns (5)</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
        
          {/* Kanban Board */}
          <div className="p-6">
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
