
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CVBuilderHeader } from "@/components/cv-builder/CVBuilderHeader";
import { CVBuilderTabs } from "@/components/cv-builder/CVBuilderTabs";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { useCVData } from "@/hooks/useCVData";
import { SaveAnimationOverlay } from "@/components/SaveAnimationOverlay";
import { toast } from "sonner";
import Dock from "@/components/ui/Dock";
import HeaderBrand from "@/components/HeaderBrand";

export default function CVBuilder() {
  const { id } = useParams();
  const {
    cvData,
    updateCVData,
    saveCV,
    isLoading,
    isSaving,
    showSaveAnimation,
    savingProgress
  } = useCVData(id);

  const [activeTab, setActiveTab] = useState("personal");

  const handleSave = async () => {
    if (!cvData) return;
    
    try {
      await saveCV();
      toast.success("CV guardado exitosamente");
    } catch (error) {
      console.error("Error saving CV:", error);
      toast.error("Error al guardar el CV");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <HeaderBrand />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando CV...</p>
          </div>
        </div>
        <Dock 
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen w-full">
        <HeaderBrand />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">No se pudo cargar el CV</p>
          </div>
        </div>
        <Dock 
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <HeaderBrand />
      <SaveAnimationOverlay isVisible={showSaveAnimation} progress={savingProgress} />
      
      <div className="container mx-auto px-4 py-6">
        <CVBuilderHeader 
          currentCvId={id}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <CVBuilderTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              completedSections={[]}
              progress={80}
            />
          </div>
          
          <div className="lg:sticky lg:top-6">
            <CVPreview cvData={cvData} />
          </div>
        </div>
      </div>
      
      <Dock 
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
