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
import { CVBuilderHeader } from "@/components/cv-builder/CVBuilderHeader";
import { CVBuilderTabs } from "@/components/cv-builder/CVBuilderTabs";
import { PersonalInfoTab } from "@/components/cv-builder/PersonalInfoTab";
import { SummaryTab } from "@/components/cv-builder/SummaryTab";
import { ExperienceTab } from "@/components/cv-builder/ExperienceTab";
import { EducationTab } from "@/components/cv-builder/EducationTab";
import { SkillsTab } from "@/components/cv-builder/SkillsTab";
import { CVPreview } from "@/components/cv-builder/CVPreview";

const CVBuilder = () => {
  const { cvData, setCvData, isLoading, currentCvId, saveCV, saveAndAdapt } = useCVData();
  
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Validation functions
  const validatePersonalInfo = () => {
    const { fullName, email, phone, location } = cvData.personalInfo;
    return fullName.trim() && email.trim() && phone.trim() && location.trim();
  };

  const validateSummary = () => {
    return cvData.summary.trim().length > 0;
  };

  const validateExperience = () => {
    return cvData.experience.length > 0 && cvData.experience.every(exp => 
      exp.position.trim() && exp.company.trim() && exp.startDate && exp.description.trim()
    );
  };

  const validateEducation = () => {
    return cvData.education.length > 0 && cvData.education.every(edu => 
      edu.degree.trim() && edu.institution.trim() && edu.year.trim()
    );
  };

  const validateSkills = () => {
    return cvData.skills.length > 0;
  };

  const getSectionValidation = () => {
    return {
      personal: validatePersonalInfo(),
      summary: validateSummary(),
      experience: validateExperience(),
      education: validateEducation(),
      skills: validateSkills()
    };
  };

  const getProgress = () => {
    return completedSections.length * 20;
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSummaryChange = (value: string) => {
    setCvData(prev => ({
      ...prev,
      summary: value
    }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      year: '',
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    const newSkill = prompt("Enter new skill:");
    if (newSkill && newSkill.trim() !== "") {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const improveWithAI = async (section: string) => {
    setIsImproving(section);
    
    try {
      let content = '';
      let context = '';
      
      if (section === 'summary') {
        content = cvData.summary;
        context = `Profesional: ${cvData.personalInfo.fullName}, Experiencia: ${cvData.experience.map(exp => `${exp.position} en ${exp.company}`).join(', ')}`;
      } else if (section === 'experience') {
        const expToImprove = cvData.experience[0];
        if (expToImprove) {
          content = expToImprove.description;
          context = `Posición: ${expToImprove.position} en ${expToImprove.company}`;
        }
      }

      console.log('Calling improve-cv-content function...');
      
      const { data, error } = await supabase.functions.invoke('improve-cv-content', {
        body: {
          content,
          type: section,
          context
        }
      });

      if (error) {
        throw error;
      }

      if (data?.improvedContent) {
        if (section === 'summary') {
          setCvData(prev => ({
            ...prev,
            summary: data.improvedContent
          }));
        } else if (section === 'experience' && cvData.experience[0]) {
          setCvData(prev => ({
            ...prev,
            experience: prev.experience.map((exp, index) => 
              index === 0 ? { ...exp, description: data.improvedContent } : exp
            )
          }));
        }
        
        toast.success(`Sección ${section} mejorada con IA`);
      }
    } catch (error) {
      console.error('Error improving with AI:', error);
      toast.error("Error al mejorar con IA. Verifica tu conexión.");
    } finally {
      setIsImproving(null);
    }
  };

  const exportPDF = () => {
    toast.success("CV exportado como PDF");
  };

  const saveCV = async () => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    setIsSaving(true);
    
    try {
      const cvTitle = `CV - ${cvData.personalInfo.fullName}`;
      
      console.log('Attempting to save CV with data:', {
        user_id: user.id,
        title: cvTitle,
        content: cvData,
        status: 'draft',
        template_name: 'modern'
      });

      let result;

      if (currentCvId) {
        // Update existing CV
        result = await supabase
          .from('cvs')
          .update({
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern',
            last_updated: new Date().toISOString()
          })
          .eq('id', currentCvId)
          .eq('user_id', user.id)
          .select();
      } else {
        // Create new CV
        result = await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern'
          })
          .select();
      }

      if (result.error) {
        console.error('Error saving CV:', result.error);
        toast.error(`Error al guardar el CV: ${result.error.message}`);
        return;
      }

      console.log('CV saved successfully:', result.data);
      
      // Update currentCvId if it was a new CV
      if (!currentCvId && result.data && result.data[0]) {
        setCurrentCvId(result.data[0].id);
        navigate(`/app/cv/${result.data[0].id}`, { replace: true });
      }
      
      toast.success(currentCvId ? "CV actualizado exitosamente" : "CV guardado exitosamente");
      navigate("/app/cvs");
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Error al guardar el CV");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndAdapt = async () => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    setIsSaving(true);
    
    try {
      const cvTitle = `CV - ${cvData.personalInfo.fullName}`;
      
      console.log('Attempting to save and adapt CV with data:', {
        user_id: user.id,
        title: cvTitle,
        content: cvData,
        status: 'draft',
        template_name: 'modern'
      });

      let result;

      if (currentCvId) {
        // Update existing CV
        result = await supabase
          .from('cvs')
          .update({
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern',
            last_updated: new Date().toISOString()
          })
          .eq('id', currentCvId)
          .eq('user_id', user.id)
          .select();
      } else {
        // Create new CV
        result = await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvTitle,
            content: cvData as any,
            status: 'draft',
            template_name: 'modern'
          })
          .select();
      }

      if (result.error) {
        console.error('Error saving CV:', result.error);
        toast.error(`Error al guardar el CV: ${result.error.message}`);
        return;
      }

      console.log('CV saved successfully:', result.data);
      
      // Update currentCvId if it was a new CV
      if (!currentCvId && result.data && result.data[0]) {
        setCurrentCvId(result.data[0].id);
      }
      
      toast.success(currentCvId ? "CV actualizado exitosamente" : "CV guardado exitosamente");
      navigate("/app/match");
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Error al guardar el CV");
    } finally {
      setIsSaving(false);
    }
  };

  const goToNextTab = () => {
    const tabOrder = ['personal', 'summary', 'experience', 'education', 'skills'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const validations = getSectionValidation();
    
    if (!validations[activeTab as keyof typeof validations]) {
      toast.error("Por favor completa todos los campos requeridos antes de continuar");
      return;
    }

    if (!completedSections.includes(activeTab)) {
      setCompletedSections(prev => [...prev, activeTab]);
    }

    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const tabOrder = ['personal', 'summary', 'experience', 'education', 'skills'];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const progress = getProgress();

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
                    improveWithAI={improveWithAI}
                    isImproving={isImproving}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
                  />
                </TabsContent>

                <TabsContent value="experience">
                  <ExperienceTab
                    cvData={cvData}
                    updateExperience={(id, field, value) => {
                      setCvData(prev => ({
                        ...prev,
                        experience: prev.experience.map(exp =>
                          exp.id === id ? { ...exp, [field]: value } : exp
                        )
                      }));
                    }}
                    addExperience={() => {
                      const newExp = {
                        id: Date.now().toString(),
                        position: '',
                        company: '',
                        startDate: '',
                        endDate: '',
                        current: false,
                        description: ''
                      };
                      setCvData(prev => ({
                        ...prev,
                        experience: [...prev.experience, newExp]
                      }));
                    }}
                    removeExperience={(id) => {
                      setCvData(prev => ({
                        ...prev,
                        experience: prev.experience.filter(exp => exp.id !== id)
                      }));
                    }}
                    improveWithAI={improveWithAI}
                    isImproving={isImproving}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
                  />
                </TabsContent>

                <TabsContent value="education">
                  <EducationTab
                    cvData={cvData}
                    updateEducation={(id, field, value) => {
                      setCvData(prev => ({
                        ...prev,
                        education: prev.education.map(edu =>
                          edu.id === id ? { ...edu, [field]: value } : edu
                        )
                      }));
                    }}
                    addEducation={() => {
                      const newEdu = {
                        id: Date.now().toString(),
                        degree: '',
                        institution: '',
                        year: '',
                        description: ''
                      };
                      setCvData(prev => ({
                        ...prev,
                        education: [...prev.education, newEdu]
                      }));
                    }}
                    removeEducation={(id) => {
                      setCvData(prev => ({
                        ...prev,
                        education: prev.education.filter(edu => edu.id !== id)
                      }));
                    }}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
                  />
                </TabsContent>

                <TabsContent value="skills">
                  <SkillsTab
                    cvData={cvData}
                    addSkill={() => {
                      const newSkill = prompt("Enter new skill:");
                      if (newSkill && newSkill.trim() !== "") {
                        setCvData(prev => ({
                          ...prev,
                          skills: [...prev.skills, newSkill.trim()]
                        }));
                      }
                    }}
                    removeSkill={(skill) => {
                      setCvData(prev => ({
                        ...prev,
                        skills: prev.skills.filter(s => s !== skill)
                      }));
                    }}
                    goToPreviousTab={goToPreviousTab}
                    saveCV={saveCV}
                    saveAndAdapt={saveAndAdapt}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 p-6 bg-gray-100">
              <CVPreview cvData={cvData} />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CVBuilder;
