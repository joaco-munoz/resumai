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
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "Activo" : "Borrador";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 30) return `hace ${diffDays} días`;
    if (diffDays < 365) return `hace ${Math.ceil(diffDays / 30)} meses`;
    return `hace ${Math.ceil(diffDays / 365)} años`;
  };

  const handleViewCV = (cv: CV) => {
    setPreviewCV(cv);
  };

  const handleEditCV = (cv: CV) => {
    navigate(`/app/cv/${cv.id}`);
  };

  const handleDownloadCV = (cv: CV) => {
    if (cv.content) {
      downloadCVAsPDF(cv.content, cv.title);
      toast.success("CV descargado exitosamente");
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
      loadCVs(); // Reload the list
      setDeleteCV(null);
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error("Error al eliminar el CV");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCVCard = (cv: CV) => (
    <div key={cv.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="col-span-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{cv.title}</h3>
          <p className="text-sm text-gray-500">Creado {formatDate(cv.created_at)}</p>
        </div>
      </div>
      
      <div className="col-span-2">
        <Badge className={`${getScoreColor(cv.ai_score)} border-0`}>
          {cv.ai_score ? `${cv.ai_score}%` : "Sin evaluar"}
        </Badge>
      </div>
      
      <div className="col-span-2">
        <Badge className={`${getStatusColor(cv.status)} border-0`}>
          {getStatusLabel(cv.status)}
        </Badge>
      </div>
      
      <div className="col-span-2 flex items-center gap-1 text-sm text-gray-500">
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
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewCV(cv)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditCV(cv)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadCV(cv)}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleDeleteCV(cv)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando CVs...</p>
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
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mis CVs</h1>
                  <p className="text-gray-600 mt-2">
                    Gestiona tu CV general y los CVs adaptados por Job Matcher
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => navigate("/app/cv/new")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear CV
                  </Button>
                </div>
              </div>

              {/* CV General Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    CV General
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Tu CV principal que se actualiza cuando guardas desde el Editor de CVs
                  </p>
                </CardHeader>
                <CardContent>
                  {generalCV ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-3">
                        <div className="col-span-5">CV</div>
                        <div className="col-span-2">Puntuación</div>
                        <div className="col-span-2">Estado</div>
                        <div className="col-span-2">Actualizado</div>
                        <div className="col-span-1"></div>
                      </div>
                      {renderCVCard(generalCV)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tienes un CV general
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Crea tu primer CV para que aparezca aquí como tu CV general
                      </p>
                      <Button onClick={() => navigate("/app/cv/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear CV General
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Matcher CVs Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    CVs de Job Matcher
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    CVs adaptados específicamente para ofertas de trabajo
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Search for Job Matcher CVs */}
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar CVs de Job Matcher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {filteredJobMatcherCVs.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {jobMatcherCVs.length === 0 ? "No tienes CVs de Job Matcher" : "No se encontraron CVs"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {jobMatcherCVs.length === 0 
                          ? "Los CVs adaptados desde Job Matcher aparecerán aquí" 
                          : "Intenta con otro término de búsqueda"
                        }
                      </p>
                      {jobMatcherCVs.length === 0 && (
                        <Button onClick={() => navigate("/app/match")}>
                          <Target className="h-4 w-4 mr-2" />
                          Ir a Job Matcher
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-3">
                        <div className="col-span-5">CV</div>
                        <div className="col-span-2">Puntuación</div>
                        <div className="col-span-2">Estado</div>
                        <div className="col-span-2">Actualizado</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Table Rows */}
                      {filteredJobMatcherCVs.map(cv => renderCVCard(cv))}
                    </div>
                  )}

                  {/* Pagination Info */}
                  {filteredJobMatcherCVs.length > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        Mostrando 1 a {filteredJobMatcherCVs.length} de {filteredJobMatcherCVs.length} CVs de Job Matcher
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>

        {/* Preview Modal */}
        <CVPreviewModal
          isOpen={!!previewCV}
          onClose={() => setPreviewCV(null)}
          cvData={previewCV?.content || null}
          cvTitle={previewCV?.title || ""}
          onDownload={() => {
            if (previewCV) {
              handleDownloadCV(previewCV);
            }
          }}
        />

        {/* Delete Confirmation Dialog */}
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
