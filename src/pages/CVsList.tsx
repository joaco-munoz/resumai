
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDownloadManager } from "@/hooks/useDownloadManager";

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
  const { user } = useAuth();
  const { downloadCV } = useDownloadManager();
  
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
  function handleViewCV(cv: CV) {
    if (isJobReport(cv)) {
      setJobReportCV(cv);
    } else {
      setPreviewCV(cv);
    }
  }

  function handleEditCV(cv: CV) {
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
  }

  async function handleDownloadCV(cv: CV, format: 'pdf' | 'word' = 'pdf') {
    if (isJobReport(cv)) {
      toast.error("Los informes no se pueden descargar");
      return;
    }
    
    if (!cv.content) {
      toast.error("No se pudo descargar el CV");
      return;
    }

    await downloadCV({ cvData: cv.content, filename: cv.title, format });
  }

  function handleDeleteCV(cv: CV) {
    setDeleteCV(cv);
  }

  async function confirmDeleteCV() {
    if (!deleteCV) return;
    
    setIsDeleting(true);
    const success = await deleteCVFromDB(deleteCV.id);
    if (success) {
      setDeleteCV(null);
    }
    setIsDeleting(false);
  }

  function startRenameCV(cv: CV) {
    setRenamingCVId(cv.id);
    setRenamingTitle(cv.title);
  }

  async function handleRenameSave() {
    if (!renamingCVId || renamingTitle.trim() === "") {
      setRenamingCVId(null);
      return;
    }
    setSavingRename(true);
    const success = await renameCV(renamingCVId, renamingTitle);
    if (success) {
      setRenamingCVId(null);
      // If this CV is linked to a job application, update it there too
      await updateLinkedJobApplications(renamingCVId, renamingTitle);
    }
    setSavingRename(false);
  }

  function handleRenameCancel() {
    setRenamingCVId(null);
  }

  async function handleSelectLogo(cv: CV, logoUrl: string) {
    updateLogoMap(cv.id, logoUrl);
    cancelLogoEdit();
    await updateCVLogo(cv, logoUrl);
  }

  function handleSaveEditedCV() {
    setEditingJobMatcherCV(null);
    loadCVs();
  }

  async function updateLinkedJobApplications(cvId: string, newTitle: string) {
    try {
      const jobTitle = extractJobTitle(newTitle);
      const companyName = extractCompanyName(newTitle);

      if (jobTitle && companyName) {
        const { error } = await supabase
          .from('job_applications_tracking')
          .update({
            position: jobTitle,
            company: companyName
          })
          .eq('cv_id', cvId)
          .eq('user_id', user?.id);

        if (error) {
          console.error('Error updating linked job applications:', error);
        }
      }
    } catch (error) {
      console.error('Error updating linked job applications:', error);
    }
  }

  const handleAddToTracking = async (cv: CV) => {
    if (!user) {
      toast.error("Debes estar autenticado para agregar al seguimiento");
      return;
    }

    try {
      // Extract job title and company from CV content
      let jobTitle = 'Posición sin especificar';
      let companyName = 'Empresa sin especificar';

      if (cv.title) {
        const extractedJobTitle = extractJobTitle(cv.title);
        const extractedCompanyName = extractCompanyName(cv.title);
        
        if (extractedJobTitle) jobTitle = extractedJobTitle;
        if (extractedCompanyName) companyName = extractedCompanyName;
      }

      console.log('Adding to tracking:', { jobTitle, companyName, cvTitle: cv.title });

      // Check if entries with same company & position already exist
      const { data: existingEntries, error: fetchError } = await supabase
        .from('job_applications_tracking')
        .select('id, position')
        .eq('user_id', user.id)
        .eq('company', companyName)
        .ilike('position', `${jobTitle}%`); // Use ilike to find positions that start with the job title

      if (fetchError) {
        console.error('Error checking existing entries:', fetchError);
        toast.error('No se pudo verificar entradas existentes');
        return;
      }

      // If there are existing entries, add a numeric suffix to make this one unique
      let finalJobTitle = jobTitle;
      if (existingEntries && existingEntries.length > 0) {
        // Find the highest number suffix
        let maxSuffix = 0;
        existingEntries.forEach(entry => {
          const match = entry.position.match(new RegExp(`^${jobTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\((\\d+)\\)$`));
          if (match) {
            const suffix = parseInt(match[1]);
            if (suffix > maxSuffix) {
              maxSuffix = suffix;
            }
          } else if (entry.position === jobTitle) {
            // Original entry without suffix counts as (1)
            if (maxSuffix === 0) maxSuffix = 1;
          }
        });
        
        // Add new suffix
        finalJobTitle = `${jobTitle} (${maxSuffix + 1})`;
      }

      const { error } = await supabase
        .from('job_applications_tracking')
        .insert({
          user_id: user.id,
          position: finalJobTitle,
          company: companyName,
          status: 'saved',
          applied_date: new Date().toISOString().split('T')[0],
          notes: `CV adaptado: ${cv.title}`,
          cv_id: cv.id
        });

      if (error) {
        console.error('Error adding to tracking:', error);
        toast.error(`Error al agregar al seguimiento: ${error.message}`);
      } else {
        toast.success("CV agregado al seguimiento de Kanban");
      }
    } catch (error) {
      console.error('Error adding to tracking:', error);
      toast.error("Error al agregar al seguimiento");
    }
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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
                <div className="min-w-0 flex-1 mb-4 sm:mb-0">
                  <h1 className="font-bold text-2xl sm:text-3xl gradient-text">
                    Mis Currículums
                  </h1>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">
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
                onAddToTracking={handleAddToTracking}
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
                onAddToTracking={handleAddToTracking}
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
        />

        <JobReportModal
          isOpen={!!jobReportCV}
          onClose={() => setJobReportCV(null)}
          reportData={jobReportCV?.content || null}
          reportTitle={jobReportCV?.title || ""}
          reportId={jobReportCV?.id}
          onApply={() => {
            setJobReportCV(null);
            loadCVs(); // Reload CVs after adaptation
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
