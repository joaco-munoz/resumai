import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { downloadCVAsPDF } from "@/utils/pdfUtils";
import { JobReportModal } from "@/components/JobReportModal";
import { CVAdaptationModal } from "@/components/CVAdaptationModal";
import { CVAdaptationPreviewModal } from "@/components/CVAdaptationPreviewModal";
import { CV, CVData } from "@/types/cv";
import { GeneralCVSection } from "@/components/cv-list/GeneralCVSection";
import { JobMatcherCVsSection } from "@/components/cv-list/JobMatcherCVsSection";

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
  const [editJobMatcherCV, setEditJobMatcherCV] = useState<CV | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadCVs = useCallback(async () => {
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
      toast.error('Error al cargar los CVs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCVs();
    }
  }, [user, loadCVs]);

  /* Duplicate block (legacy) removed during refactor


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


  */

  const filteredJobMatcherCVs = useMemo(() =>
    jobMatcherCVs.filter(cv =>
      cv.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [jobMatcherCVs, searchTerm]
  );

  const getScoreColor = useCallback((score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }, []);

  const getStatusColor = useCallback((status: string) => (
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800"
  ), []);

  const getStatusLabel = useCallback((status: string) => (
    status === "active" ? "Activo" : "Borrador"
  ), []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "hace 1 día";
    if (diffDays < 30) return `hace ${diffDays} días`;
    if (diffDays < 365) return `hace ${Math.ceil(diffDays / 30)} meses`;
    return `hace ${Math.ceil(diffDays / 365)} años`;
  }, []);

  const isJobReport = useCallback((cv: CV) => cv.content?.type === 'job_report', []);

  const handleViewCV = (cv: CV) => {
    if (isJobReport(cv)) {
      setJobReportCV(cv);
    } else {
      setPreviewCV(cv);
    }
  };

  const handleEditCV = (cv: CV) => {
    if (cv.cv_source === 'job_matcher') {
      if (isJobReport(cv)) {
        // Para informes, mostrar el modal de adaptación
        setAdaptationCV(cv);
      } else {
        // Para CVs de Job Matcher, abrir el modal de edición directa
        setEditJobMatcherCV(cv);
      }
    } else {
      // Para CVs regulares, ir al editor
      navigate(`/app/cv/${cv.id}`);
    }
  };

  const handleDownloadCV = (cv: CV) => {
    if (isJobReport(cv)) {
      toast.error("Los informes no se pueden descargar");
      return;
    }
    
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
                    Gestiona tu CV Principal y los CVs adaptados por Job Matcher
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

              <GeneralCVSection
                generalCV={generalCV}
                isJobReport={isJobReport}
                formatDate={formatDate}
                getScoreColor={getScoreColor}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                onView={handleViewCV}
                onEdit={handleEditCV}
                onDownload={handleDownloadCV}
                onDelete={handleDeleteCV}
                onCreateNew={() => navigate("/app/cv/new")}
              />

              <JobMatcherCVsSection
                cvs={filteredJobMatcherCVs}
                searchTerm={searchTerm}
                onSearchChange={(value) => setSearchTerm(value)}
                isJobReport={isJobReport}
                formatDate={formatDate}
                getScoreColor={getScoreColor}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                onView={handleViewCV}
                onEdit={handleEditCV}
                onDownload={handleDownloadCV}
                onDelete={handleDeleteCV}
                onGoToJobMatcher={() => navigate("/app/match")}
              />
            </div>
          </div>
        </SidebarInset>

        {/* Preview Modal for CVs */}
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

        {/* Job Report Modal */}
        <JobReportModal
          isOpen={!!jobReportCV}
          onClose={() => setJobReportCV(null)}
          reportData={jobReportCV?.content || null}
          reportTitle={jobReportCV?.title || ""}
          onApply={() => {
            setJobReportCV(null);
            // Aquí podríamos abrir el modal de adaptación si es necesario
          }}
        />

        {/* CV Adaptation Modal */}
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

        {/* CV Adaptation Preview Modal for Job Matcher CVs */}
        <CVAdaptationPreviewModal
          isOpen={!!editJobMatcherCV}
          onClose={() => setEditJobMatcherCV(null)}
          originalCvData={editJobMatcherCV?.content as CVData || {} as CVData}
          adaptedCvData={editJobMatcherCV?.content as CVData || {} as CVData}
          jobTitle={editJobMatcherCV?.content?.jobDetails?.title || editJobMatcherCV?.title || ""}
          companyName={editJobMatcherCV?.content?.jobDetails?.company || ""}
          onSave={() => {
            setEditJobMatcherCV(null);
            loadCVs();
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
