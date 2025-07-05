
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Plus, Trash2, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AIButton from "@/components/AIButton";

import { CVData } from "@/types/cv";
import { useCVData } from "@/hooks/useCVData";
import { useCVBuilder } from "@/hooks/useCVBuilder";
import { useAIImprovement } from "@/hooks/useAIImprovement";
import { useCVSaving } from "@/hooks/useCVSaving";
import { CVBuilderHeader } from "@/components/cv-builder/CVBuilderHeader";
import { CVBuilderTabs } from "@/components/cv-builder/CVBuilderTabs";
import { PersonalInfoTab } from "@/components/cv-builder/PersonalInfoTab";
import { SummaryTab } from "@/components/cv-builder/SummaryTab";
import { ExperienceTab } from "@/components/cv-builder/ExperienceTab";
import { EducationTab } from "@/components/cv-builder/EducationTab";
import { SkillsTab } from "@/components/cv-builder/SkillsTab";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { SaveAnimationOverlay } from "@/components/SaveAnimationOverlay";

const CVBuilder = () => {
  const { cvData, setCvData, isLoading, currentCvId, saveCV, saveAndAdapt } = useCVData();
  
  const {
    activeTab,
    setActiveTab,
    completedSections,
    getProgress,
    goToNextTab,
    goToPreviousTab,
    handlePersonalInfoChange,
    handleSummaryChange,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill
  } = useCVBuilder(cvData, setCvData);

  const { isImproving, improveBulletPoint, improveCVContent } = useAIImprovement();
  
  const { 
    savingProgress, 
    showSaveAnimation, 
    handleSaveWithAnimation 
  } = useCVSaving();

  const navigate = useNavigate();
  const { user } = useAuth();

  const exportPDF = () => {
    toast.success("CV exportado como PDF");
  };

  const handleSaveCV = async () => {
    await handleSaveWithAnimation(saveCV);
  };

  const handleSaveAndAdapt = async () => {
    await handleSaveWithAnimation(saveAndAdapt);
  };

  const progress = showSaveAnimation ? savingProgress : getProgress();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando CV...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <CVBuilderHeader currentCvId={currentCvId} exportPDF={exportPDF} />

          <div className="flex h-[calc(100vh-80px)]">
            {/* Editor Panel */}
            <div className="w-2/5 p-6 overflow-y-auto bg-white border-r">
              <CVBuilderTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                completedSections={completedSections}
                progress={progress}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsContent value="personal">
                  <PersonalInfoTab
                    cvData={cvData}
                    handlePersonalInfoChange={handlePersonalInfoChange}
                    goToNextTab={goToNextTab}
                  />
                </TabsContent>

                <TabsContent value="summary">
                  <SummaryTab
                    cvData={cvData}
                    handleSummaryChange={handleSummaryChange}
                    improveWithAI={improveCVContent}
                    isImproving={isImproving}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
                  />
                </TabsContent>

                <TabsContent value="experience">
                  <ExperienceTab
                    cvData={cvData}
                    updateExperience={updateExperience}
                    addExperience={addExperience}
                    removeExperience={removeExperience}
                    improveWithAI={improveBulletPoint}
                    isImproving={isImproving}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
                    setCvData={setCvData}
                  />
                </TabsContent>

                <TabsContent value="education">
                  <EducationTab
                    cvData={cvData}
                    updateEducation={updateEducation}
                    addEducation={addEducation}
                    removeEducation={removeEducation}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
                    setCvData={setCvData}
                  />
                </TabsContent>

                <TabsContent value="skills">
                  <SkillsTab
                    cvData={cvData}
                    addSkill={addSkill}
                    removeSkill={removeSkill}
                    goToPreviousTab={goToPreviousTab}
                    saveCV={handleSaveCV}
                    saveAndAdapt={handleSaveAndAdapt}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 p-6 bg-gray-100">
              <CVPreview cvData={cvData} />
            </div>
          </div>

          <SaveAnimationOverlay 
            isVisible={showSaveAnimation}
            progress={savingProgress}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CVBuilder;
