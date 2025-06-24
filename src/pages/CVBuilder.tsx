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

const LOCAL_STORAGE_TAB_KEY = 'cv-editor-active-tab';

const CVBuilder = () => {
  const { cvData, setCvData, isLoading, currentCvId, saveCV, saveAndAdapt } = useCVData();
  
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(80);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load active tab from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, activeTab);
  }, [activeTab]);

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

  const addSkill = (skillName?: string) => {
    if (skillName && skillName.trim() !== "") {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, skillName.trim()]
      }));
      return;
    }

    // Fallback to prompt (backward compatibility)
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
      if (section === 'summary') {
        const content = cvData.summary;
        const context = `Profesional: ${cvData.personalInfo.fullName}, Experiencia: ${cvData.experience.map(exp => `${exp.position} en ${exp.company}`).join(', ')}`;
        
        console.log('Calling improve-cv-content function for summary...');
        
        const { data, error } = await supabase.functions.invoke('improve-cv-content', {
          body: {
            content,
            context
          }
        });

        if (error) {
          throw error;
        }

        if (data?.improvedContent) {
          setCvData(prev => ({
            ...prev,
            summary: data.improvedContent
          }));
          toast.success('Resumen mejorado con IA');
        }
      } else if (section.startsWith('experience-')) {
        // Extract experience ID and bullet point index from section
        const parts = section.split('-');
        const expId = parts[1];
        const bulletIndex = parseInt(parts[2]);
        
        const experience = cvData.experience.find(exp => exp.id === expId);
        if (!experience) return;
        
        const bulletPoints = experience.description.split('\n');
        const bulletPoint = bulletPoints[bulletIndex];
        
        if (!bulletPoint || !bulletPoint.trim()) return;
        
        const context = `Posición: ${experience.position} en ${experience.company}`;
        
        console.log('Calling improve-bullet-point function...');
        
        const { data, error } = await supabase.functions.invoke('improve-bullet-point', {
          body: {
            bulletPoint,
            context
          }
        });

        if (error) {
          throw error;
        }

        if (data?.improvedBulletPoint) {
          const newBulletPoints = [...bulletPoints];
          newBulletPoints[bulletIndex] = data.improvedBulletPoint;
          
          setCvData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => 
              exp.id === expId 
                ? { ...exp, description: newBulletPoints.join('\n') }
                : exp
            )
          }));
          
          toast.success('Bullet point mejorado con IA');
        }
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

  const handleSaveCV = async () => {
    setIsSaving(true);
    setShowSaveAnimation(true);
    setSavingProgress(80);
    
    // Animate progress from 80% to 100%
    const progressInterval = setInterval(() => {
      setSavingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Wait for animation to complete
    setTimeout(async () => {
      await saveCV();
      setIsSaving(false);
      setShowSaveAnimation(false);
      setSavingProgress(80);
    }, 1000);
  };

  const handleSaveAndAdapt = async () => {
    setIsSaving(true);
    setShowSaveAnimation(true);
    setSavingProgress(80);
    
    // Animate progress from 80% to 100%
    const progressInterval = setInterval(() => {
      setSavingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Wait for animation to complete
    setTimeout(async () => {
      await saveAndAdapt();
      setIsSaving(false);
      setShowSaveAnimation(false);
      setSavingProgress(80);
    }, 1000);
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
                    improveWithAI={improveWithAI}
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
                    improveWithAI={improveWithAI}
                    isImproving={isImproving}
                    goToPreviousTab={goToPreviousTab}
                    goToNextTab={goToNextTab}
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

          {/* Save Animation Overlay */}
          {showSaveAnimation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="text-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Guardando CV...</h3>
                  <p className="text-gray-600 mt-2">Finalizando el proceso</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progreso</span>
                    <span className="font-medium">{Math.round(savingProgress)}%</span>
                  </div>
                  <Progress value={savingProgress} className="h-2" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CVBuilder;
