import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "sonner";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { downloadCVAsPDF } from "@/utils/pdfUtils";
import { downloadCVAsWord } from "@/utils/wordUtils";
import { JobReportModal } from "@/components/JobReportModal";
import { CVAdaptationModal } from "@/components/CVAdaptationModal";
import { CVAdaptationPreviewModal } from "@/components/CVAdaptationPreviewModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCVsManager } from "@/hooks/useCVsManager";
import { useCompanyLogos } from "@/hooks/useCompanyLogos";
import { GeneralCVSection } from "@/components/GeneralCVSection";
import { JobMatcherCVsSection } from "@/components/JobMatcherCVsSection";
import { isJobReport, extractJobTitle, extractCompanyName } from "@/utils/cvUtils";

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
  const [previewCV, setPreviewCV] = useState<CV | null>(null);
  const [deleteCV, setDeleteCV] = useState<CV | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobReportCV, setJobReportCV] = useState<CV | null>(null);
  const [adaptationCV, setAdaptationCV] = useState<CV | null>(null);
  const [editingJobMatcherCV, setEditingJobMatcherCV] = useState<CV | null>(null);
  const [renamingCVId, setRenamingCVId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState<string>("");
  const [savingRename, setSavingRename] = useState(false);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Custom hooks
  const { generalCV, jobMatcherCVs, loading, loadCVs, deleteCV: deleteCVFromDB, renameCV, updateCVLogo } = useCVsManager();
  const {
    logoEditCvId,
    logoQuery,
    logoSuggestions,
    logoMap,
    setLogoQuery,
    initializeLogoMap,
    updateLogoMap,
    startLogoEdit,
    cancelLogoEdit
  } = useCompanyLogos();

  // Initialize logo map when CVs are loaded
  useState(() => {
    if (generalCV || jobMatcherCVs.length > 0) {
      const allCVs = [generalCV, ...jobMatcherCVs].filter(Boolean);
      initializeLogoMap(allCVs);
    }
  });

  const filteredJobMatcherCVs = jobMatcherCVs.filter(cv => 
    cv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event handlers
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
    const success = await deleteCVFromDB(deleteCV.id);
    if (success) {
      setDeleteCV(null);
    }
    setIsDeleting(false);
  };

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
    const success = await renameCV(renamingCVId, renamingTitle);
    if (success) {
      setRenamingCVId(null);
    }
    setSavingRename(false);
  };

  const handleRenameCancel = () => {
    setRenamingCVId(null);
  };

  const handleSelectLogo = async (cv: CV, logoUrl: string) => {
    updateLogoMap(cv.id, logoUrl);
    cancelLogoEdit();
    await updateCVLogo(cv, logoUrl);
  };

  const handleSaveEditedCV = () => {
    setEditingJobMatcherCV(null);
    loadCVs();
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    Mis Currículums
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                    Gestiona tu Currículum Principal y los currículums adaptados por Match de Ofertas
                  </p>
                </div>
              </div>

              {/* General CV Section */}
              <GeneralCVSection
                generalCV={generalCV}
                isMobile={isMobile}
                renamingCVId={renamingCVId}
                renamingTitle={renamingTitle}
                savingRename={savingRename}
                logoEditCvId={logoEditCvId}
                logoQuery={logoQuery}
                logoSuggestions={logoSuggestions}
                logoMap={logoMap}
                onCreateCV={() => navigate("/app/cv/new")}
                onView={handleViewCV}
                onEdit={handleEditCV}
                onDownload={handleDownloadCV}
                onDelete={handleDeleteCV}
                onStartRename={startRenameCV}
                onSaveRename={handleRenameSave}
                onCancelRename={handleRenameCancel}
                onRenamingTitleChange={setRenamingTitle}
                onStartLogoEdit={startLogoEdit}
                onSelectLogo={handleSelectLogo}
                onLogoQueryChange={setLogoQuery}
              />

              {/* Job Matcher CVs Section */}
              <JobMatcherCVsSection
                jobMatcherCVs={jobMatcherCVs}
                filteredJobMatcherCVs={filteredJobMatcherCVs}
                searchTerm={searchTerm}
                isMobile={isMobile}
                renamingCVId={renamingCVId}
                renamingTitle={renamingTitle}
                savingRename={savingRename}
                logoEditCvId={logoEditCvId}
                logoQuery={logoQuery}
                logoSuggestions={logoSuggestions}
                logoMap={logoMap}
                onSearchChange={setSearchTerm}
                onGoToJobMatcher={() => navigate("/app/match")}
                onView={handleViewCV}
                onEdit={handleEditCV}
                onDownload={handleDownloadCV}
                onDelete={handleDeleteCV}
                onStartRename={startRenameCV}
                onSaveRename={handleRenameSave}
                onCancelRename={handleRenameCancel}
                onRenamingTitleChange={setRenamingTitle}
                onStartLogoEdit={startLogoEdit}
                onSelectLogo={handleSelectLogo}
                onLogoQueryChange={setLogoQuery}
              />
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
            jobTitle={extractJobTitle(editingJobMatcherCV.title)}
            companyName={extractCompanyName(editingJobMatcherCV.title)}
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
