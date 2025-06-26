import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  User,
  Target
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { downloadCVAsPDF } from "@/utils/pdfUtils";
import { downloadCVAsWord } from "@/utils/wordUtils";
import { JobReportModal } from "@/components/JobReportModal";
import { CVAdaptationModal } from "@/components/CVAdaptationModal";
import { CVAdaptationPreviewModal } from "@/components/CVAdaptationPreviewModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface CV {
  id: string;
  title: string;
  status: string;
  created_at: string;
  last_updated: string;
  ai_score?: number;
  content?: any;
  cv_source: string;
}

export default function CVsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [generalCV, setGeneralCV] = useState<CV | null>(null);
  const [jobMatcherCVs, setJobMatcherCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCV, setPreviewCV] = useState<CV | null>(null);
  const [deleteCV, setDeleteCV] = useState<CV | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobReportCV, setJobReportCV] = useState<CV | null>(null);
  const [adaptationCV, setAdaptationCV] = useState<CV | null>(null);
  const [editingJobMatcherCV, setEditingJobMatcherCV] = useState<CV | null>(null);
  const [renamingCVId, setRenamingCVId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState<string>("");
  const [savingRename, setSavingRename] = useState(false);
  const isMobile = useIsMobile();

  const startRenameCV = (cv: CV) => {
    setRenamingCVId(cv.id);
    setRenamingTitle(cv.title);
  };

  const handleRenameSave = async () => {
    if (!renamingCVId || renamingTitle.trim() === "") {
      setRenamingCVId(null);
      return;
    }
    setSavingRename(true);
    try {
      const { error } = await supabase
        .from('cvs')
        .update({ title: renamingTitle.trim() })
        .eq('id', renamingCVId);
      if (error) {
        console.error('Error renaming CV:', error);
        toast.error(`Error al renombrar el CV: ${error.message}`);
      } else {
        toast.success("CV renombrado exitosamente");
        loadCVs();
      }
    } catch (err) {
      console.error('Error renaming CV:', err);
      toast.error("Error al renombrar el CV");
    } finally {
      setSavingRename(false);
      setRenamingCVId(null);
    }
  };

  const handleRenameCancel = () => {
    setRenamingCVId(null);
  };

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    try {
      console.log('Loading CVs for user:', user?.id);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('id, title, status, created_at, last_updated, ai_score, content, cv_source')
        .eq('user_id', user?.id)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error loading CVs:', error);
        toast.error(`Error al cargar los CVs: ${error.message}`);
        return;
      }

      console.log('CVs loaded successfully:', data);
      
      // Separate CVs by source
      const editorCVs = data?.filter(cv => cv.cv_source === 'editor') || [];
      const matcherCVs = data?.filter(cv => cv.cv_source === 'job_matcher') || [];
      
      // Set the most recent editor CV as general CV
      setGeneralCV(editorCVs.length > 0 ? editorCVs[0] : null);
      setJobMatcherCVs(matcherCVs);
      
    } catch (error) {
      console.error('Error loading CVs:', error);
      toast.error("Error al cargar los CVs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobMatcherCVs = jobMatcherCVs.filter(cv => 
    cv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200" 
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "Activo" : "Borrador";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return "ahora mismo";
    if (diffMinutes === 1) return "hace 1 minuto";
    if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
    
    if (diffHours === 1) return "hace 1 hora";
    if (diffHours < 24) return `hace ${diffHours} horas`;
    
    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 30) return `hace ${diffDays} días`;
    
    if (diffDays < 365) return `hace ${Math.ceil(diffDays / 30)} meses`;
    return `hace ${Math.ceil(diffDays / 365)} años`;
  };

  const isJobReport = (cv: CV) => {
    return cv.content?.type === 'job_report';
  };

  const handleViewCV = (cv: CV) => {
    if (isJobReport(cv)) {
      setJobReportCV(cv);
    } else {
      setPreviewCV(cv);
    }
  };

  const handleEditCV = (cv: CV) => {
    console.log('Editing CV:', cv);
    console.log('CV content:', cv.content);
    console.log('General CV:', generalCV);
    
    if (isJobReport(cv)) {
      setAdaptationCV(cv);
    } else if (cv.cv_source === 'job_matcher') {
      if (!generalCV || !generalCV.content) {
        toast.error("No se encontró el CV principal para editar");
        console.error('No general CV found for editing');
        return;
      }
      
      if (!cv.content) {
        toast.error("El CV adaptado no tiene contenido válido");
        console.error('Job Matcher CV has no content');
        return;
      }
      
      setEditingJobMatcherCV(cv);
    } else {
      navigate(`/app/cv/${cv.id}`);
    }
  };

  const handleDownloadCV = (cv: CV, format: 'pdf' | 'word' = 'pdf') => {
    if (isJobReport(cv)) {
      toast.error("Los informes no se pueden descargar");
      return;
    }
    
    if (cv.content) {
      if (format === 'pdf') {
        downloadCVAsPDF(cv.content, cv.title);
        toast.success("CV descargado como PDF exitosamente");
      } else if (format === 'word') {
        downloadCVAsWord(cv.content, cv.title);
        toast.success("CV descargado como Word exitosamente");
      }
    } else {
      toast.error("No se pudo descargar el CV");
    }
  };

  const handleDeleteCV = (cv: CV) => {
    setDeleteCV(cv);
  };

  const confirmDeleteCV = async () => {
    if (!deleteCV) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting CV:', deleteCV.id);
      
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', deleteCV.id);

      if (error) {
        console.error('Error deleting CV:', error);
        toast.error(`Error al eliminar el CV: ${error.message}`);
        return;
      }

      console.log('CV deleted successfully');
      toast.success("CV eliminado exitosamente");
      loadCVs();
      setDeleteCV(null);
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error("Error al eliminar el CV");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEditedCV = () => {
    setEditingJobMatcherCV(null);
    loadCVs();
  };

  const renderCVCard = (cv: CV) => {
    const isReport = isJobReport(cv);
    
    return (
      <div key={cv.id} className={`${isMobile ? 'space-y-3 p-4 border rounded-lg' : 'grid grid-cols-12 gap-4 items-center py-3'} border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors`}>
        <div className={`${isMobile ? 'w-full' : 'col-span-5'} flex items-center gap-3`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isReport ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'} shrink-0`}>
            {isReport ? (
              <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {renamingCVId === cv.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={renamingTitle}
                  onChange={e => setRenamingTitle(e.target.value)}
                  className="h-8 py-1"
                  autoFocus
                />
                <Button size="sm" disabled={savingRename} onClick={handleRenameSave}>
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={handleRenameCancel}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{cv.title}</h3>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {isReport ? "Informe de compatibilidad" : "CV adaptado"}
            </p>
          </div>
        </div>
        
        {isMobile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${getScoreColor(cv.ai_score)} border-0 text-xs`}>
                {cv.ai_score ? `${cv.ai_score}%` : "Sin evaluar"}
              </Badge>
              <Badge className={`${getStatusColor(cv.status)} border-0 text-xs`}>
                {getStatusLabel(cv.status)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(cv.last_updated || cv.created_at)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem onClick={() => handleViewCV(cv)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  {!isReport && (
                    <DropdownMenuItem onClick={() => handleEditCV(cv)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {cv.cv_source === 'job_matcher' && (
                    <DropdownMenuItem onClick={() => startRenameCV(cv)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Renombrar
                    </DropdownMenuItem>
                  )}
                  {!isReport && (
                    <>
                      <DropdownMenuItem onClick={() => handleDownloadCV(cv, 'pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadCV(cv, 'word')}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Word
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400"
                    onClick={() => handleDeleteCV(cv)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <>
            <div className="col-span-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {formatDate(cv.created_at)}
            </div>
            
            <div className="col-span-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {formatDate(cv.last_updated || cv.created_at)}
            </div>
            
            <div className="col-span-1 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem onClick={() => handleViewCV(cv)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  {!isReport && (
                    <DropdownMenuItem onClick={() => handleEditCV(cv)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {cv.cv_source === 'job_matcher' && (
                    <DropdownMenuItem onClick={() => startRenameCV(cv)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Renombrar
                    </DropdownMenuItem>
                  )}
                  {!isReport && (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <DropdownMenuItem onClick={() => handleDownloadCV(cv, 'pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadCV(cv, 'word')}>
                        <Download className="h-4 w-4 mr-2" />
                        Word
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400"
                    onClick={() => handleDeleteCV(cv)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Cargando CVs...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">Mis Currículums</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                    Gestiona tu Currículum Principal y los currículums adaptados por Match de Ofertas
                  </p>
                </div>
              </div>

              {/* CV General Section */}
              <Card className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Currículum Principal
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tu Currículum principal que se actualiza cuando guardas desde el Editor de Currículums
                  </p>
                </CardHeader>
                <CardContent>
                  {generalCV ? (
                    <div className="space-y-4">
                      {!isMobile && (
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-3">
                          <div className="col-span-5">CV</div>
                          <div className="col-span-2">Puntuación</div>
                          <div className="col-span-2">Estado</div>
                          <div className="col-span-2">Actualizado</div>
                          <div className="col-span-1"></div>
                        </div>
                      )}
                      {renderCVCard(generalCV)}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No tienes un CV Principal
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                        Crea tu primer CV para que aparezca aquí como tu CV Principal
                      </p>
                      <Button onClick={() => navigate("/app/cv/new")} size={isMobile ? "default" : "lg"}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear CV Principal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Matcher CVs Section */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Currículums del Match de Ofertas
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Currículums adaptados e informes de compatibilidad de ofertas de trabajo
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Search for Job Matcher CVs */}
                  <div className="mb-4 sm:mb-6">
                    <div className="relative max-w-full sm:max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar currículums del Match de Ofertas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {filteredJobMatcherCVs.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {jobMatcherCVs.length === 0 ? "No tienes currículums del Match de Ofertas" : "No se encontraron currículums"}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                        {jobMatcherCVs.length === 0 
                          ? "Los currículums adaptados e informes desde Match de Ofertas aparecerán aquí" 
                          : "Intenta con otro término de búsqueda"
                        }
                      </p>
                      {jobMatcherCVs.length === 0 && (
                        <Button onClick={() => navigate("/app/match")} size={isMobile ? "default" : "lg"}>
                          <Target className="h-4 w-4 mr-2" />
                          Ir a Job Matcher
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Table Header - only on desktop */}
                      {!isMobile && (
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-3">
                          <div className="col-span-5">CV / Informe</div>
                          <div className="col-span-3">Creado</div>
                          <div className="col-span-3">Actualizado</div>
                          <div className="col-span-1"></div>
                        </div>
                      )}

                      {/* Table Rows */}
                      {filteredJobMatcherCVs.map(cv => renderCVCard(cv))}
                    </div>
                  )}

                  {/* Pagination Info */}
                  {filteredJobMatcherCVs.length > 0 && (
                    <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Mostrando 1 a {filteredJobMatcherCVs.length} de {filteredJobMatcherCVs.length} elementos de Match de Ofertas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>

        {/* Modals */}
        <CVPreviewModal
          isOpen={!!previewCV}
          onClose={() => setPreviewCV(null)}
          cvData={previewCV?.content || null}
          cvTitle={previewCV?.title || ""}
          onDownloadPDF={() => {
            if (previewCV) {
              handleDownloadCV(previewCV, 'pdf');
            }
          }}
          onDownloadWord={() => {
            if (previewCV) {
              handleDownloadCV(previewCV, 'word');
            }
          }}
        />

        <JobReportModal
          isOpen={!!jobReportCV}
          onClose={() => setJobReportCV(null)}
          reportData={jobReportCV?.content || null}
          reportTitle={jobReportCV?.title || ""}
          onApply={() => {
            setJobReportCV(null);
          }}
        />

        <CVAdaptationModal
          isOpen={!!adaptationCV}
          onClose={() => setAdaptationCV(null)}
          matchResult={adaptationCV?.content?.matchResult || null}
          jobDetails={adaptationCV?.content?.jobDetails || { title: "", company: "" }}
          onSave={() => {
            setAdaptationCV(null);
            loadCVs();
          }}
        />

        {editingJobMatcherCV && generalCV && (
          <CVAdaptationPreviewModal
            isOpen={!!editingJobMatcherCV}
            onClose={() => setEditingJobMatcherCV(null)}
            originalCvData={generalCV.content || null}
            adaptedCvData={editingJobMatcherCV.content || null}
            jobTitle={editingJobMatcherCV.title.split(' - ')[1]?.split(' en ')[0] || ""}
            companyName={editingJobMatcherCV.title.split(' en ')[1] || ""}
            existingCVId={editingJobMatcherCV.id}
            onSave={handleSaveEditedCV}
          />
        )}

        <DeleteConfirmDialog
          isOpen={!!deleteCV}
          onClose={() => setDeleteCV(null)}
          onConfirm={confirmDeleteCV}
          title={deleteCV?.title || ""}
          isDeleting={isDeleting}
        />
      </div>
    </SidebarProvider>
  );
}
