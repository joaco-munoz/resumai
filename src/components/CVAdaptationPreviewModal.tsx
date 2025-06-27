
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CVPreview } from "@/components/cv-builder/CVPreview";
import { CVBuilderTabs } from "@/components/cv-builder/CVBuilderTabs";
import { PersonalInfoTab } from "@/components/cv-builder/PersonalInfoTab";
import { SummaryTab } from "@/components/cv-builder/SummaryTab";
import { ExperienceTab } from "@/components/cv-builder/ExperienceTab";
import { EducationTab } from "@/components/cv-builder/EducationTab";
import { SkillsTab } from "@/components/cv-builder/SkillsTab";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Edit3, Save, Eye } from "lucide-react";
import { CVData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CVAdaptationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCvData: CVData;
  adaptedCvData: CVData;
  jobTitle: string;
  companyName: string;
  existingCVId?: string;
  onSave: () => void;
}

export const CVAdaptationPreviewModal = ({
  isOpen,
  onClose,
  originalCvData,
  adaptedCvData,
  jobTitle,
  companyName,
  existingCVId,
  onSave
}: CVAdaptationPreviewModalProps) => {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize CV data when props change
  useEffect(() => {
    if (adaptedCvData) {
      setCvData(adaptedCvData);
    } else if (originalCvData) {
      setCvData(originalCvData);
    } else {
      console.error('No CV data provided to CVAdaptationPreviewModal');
      toast.error("No se encontraron datos del CV");
      onClose();
    }
  }, [adaptedCvData, originalCvData, jobTitle, companyName, existingCVId, onClose]);

  // Don't render if no CV data
  if (!cvData) {
    return null;
  }

  // Validation functions (same as CVBuilder)
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

  // Handler functions (same as CVBuilder)
  const handlePersonalInfoChange = (field: string, value: string) => {
    setCvData(prev => prev ? ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }) : null);
  };

  const handleSummaryChange = (value: string) => {
    setCvData(prev => prev ? ({
      ...prev,
      summary: value
    }) : null);
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setCvData(prev => prev ? ({
      ...prev,
      experience: [...prev.experience, newExp]
    }) : null);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setCvData(prev => prev ? ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }) : null);
  };

  const removeExperience = (id: string) => {
    setCvData(prev => prev ? ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }) : null);
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      year: '',
      description: ''
    };
    setCvData(prev => prev ? ({
      ...prev,
      education: [...prev.education, newEdu]
    }) : null);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData(prev => prev ? ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }) : null);
  };

  const removeEducation = (id: string) => {
    setCvData(prev => prev ? ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }) : null);
  };

  const addSkill = (skillName?: string) => {
    if (!cvData) return;
    
    if (skillName && skillName.trim() !== "") {
      setCvData(prev => prev ? ({
        ...prev,
        skills: [...prev.skills, skillName.trim()]
      }) : null);
      return;
    }

    const newSkill = prompt("Enter new skill:");
    if (newSkill && newSkill.trim() !== "") {
      setCvData(prev => prev ? ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }) : null);
    }
  };

  const removeSkill = (skill: string) => {
    setCvData(prev => prev ? ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }) : null);
  };

  const improveWithAI = async (section: string) => {
    if (!cvData) return;
    
    setIsImproving(section);
    
    try {
      if (section === 'summary') {
        const content = cvData.summary;
        const context = `Profesional: ${cvData.personalInfo.fullName}, Experiencia: ${cvData.experience.map(exp => `${exp.position} en ${exp.company}`).join(', ')}`;
        
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
          setCvData(prev => prev ? ({
            ...prev,
            summary: data.improvedContent
          }) : null);
          toast.success('Resumen mejorado con IA');
        }
      } else if (section.startsWith('experience-')) {
        const parts = section.split('-');
        const expId = parts[1];
        const bulletIndex = parseInt(parts[2]);
        
        const experience = cvData.experience.find(exp => exp.id === expId);
        if (!experience) return;
        
        const bulletPoints = experience.description.split('\n');
        const bulletPoint = bulletPoints[bulletIndex];
        
        if (!bulletPoint || !bulletPoint.trim()) return;
        
        const context = `Posición: ${experience.position} en ${experience.company}`;
        
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
          
          setCvData(prev => prev ? ({
            ...prev,
            experience: prev.experience.map(exp => 
              exp.id === expId 
                ? { ...exp, description: newBulletPoints.join('\n') }
                : exp
            )
          }) : null);
          
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

  const handleSave = async () => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    if (!cvData) {
      toast.error("No hay datos del CV para guardar");
      return;
    }

    setIsSaving(true);

    try {
      // Ensure we preserve any company logo or other content when saving
      const contentToSave = {
        ...cvData,
        // Preserve any additional metadata that might exist
        ...(adaptedCvData?.companyLogo && { companyLogo: adaptedCvData.companyLogo }),
        ...(adaptedCvData?.jobTitle && { jobTitle: adaptedCvData.jobTitle }),
        ...(adaptedCvData?.companyName && { companyName: adaptedCvData.companyName })
      };

      if (existingCVId) {
        const { error: updateError } = await supabase
          .from('cvs')
          .update({
            content: contentToSave as any,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingCVId);

        if (updateError) {
          console.error('Error updating existing CV:', updateError);
          toast.error("Error al actualizar el CV");
          return;
        }

        toast.success("CV actualizado exitosamente");
      } else {
        const now = new Date();
        const dateTime = now.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        let cvTitle;
        if (companyName && jobTitle) {
          cvTitle = `CV - ${jobTitle} en ${companyName}`;
        } else if (companyName) {
          cvTitle = `CV - ${companyName}`;
        } else if (jobTitle) {
          cvTitle = `CV - ${jobTitle}`;
        } else {
          cvTitle = `CV - ${cvData.personalInfo?.fullName || 'Sin nombre'} - ${dateTime}`;
        }

        const { data: adaptedCV, error: adaptError } = await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvTitle,
            content: contentToSave as any,
            status: 'draft',
            template_name: 'modern',
            cv_source: 'job_matcher'
          })
          .select()
          .single();

        if (adaptError || !adaptedCV) {
          console.error('Error creating adapted CV:', adaptError);
          toast.error("Error al crear el CV adaptado");
          return;
        }

        const { error: trackingError } = await supabase
          .from('job_applications_tracking')
          .insert({
            user_id: user.id,
            position: jobTitle || 'Posición sin especificar',
            company: companyName || 'Empresa sin especificar',
            status: 'saved',
            applied_date: new Date().toISOString().split('T')[0],
            notes: `CV adaptado con Job Matcher`
          });

        if (trackingError) {
          console.error('Error saving to job tracking:', trackingError);
        }

        toast.success("CV adaptado guardado exitosamente");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving adapted CV:', error);
      toast.error("Error al guardar el CV adaptado");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isEditing ? 'max-w-7xl' : 'max-w-4xl'} max-h-[95vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand-500" />
            {existingCVId ? 'Editar CV Adaptado' : 'CV Adaptado'} - {jobTitle} {companyName && `en ${companyName}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edita tu CV adaptado antes de guardarlo' : 'Revisa tu CV adaptado antes de guardarlo'}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Edición - Usando los mismos componentes que CVBuilder */}
            <div className="space-y-6 overflow-y-auto max-h-[70vh]">
              <CVBuilderTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                completedSections={completedSections}
                progress={completedSections.length * 20}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="personal">
                  <PersonalInfoTab
                    cvData={cvData}
                    handlePersonalInfoChange={handlePersonalInfoChange}
                    goToNextTab={() => {
                      if (!completedSections.includes('personal')) {
                        setCompletedSections(prev => [...prev, 'personal']);
                      }
                      setActiveTab('summary');
                    }}
                  />
                </TabsContent>

                <TabsContent value="summary">
                  <SummaryTab
                    cvData={cvData}
                    handleSummaryChange={handleSummaryChange}
                    improveWithAI={improveWithAI}
                    isImproving={isImproving}
                    goToPreviousTab={() => setActiveTab('personal')}
                    goToNextTab={() => {
                      if (!completedSections.includes('summary')) {
                        setCompletedSections(prev => [...prev, 'summary']);
                      }
                      setActiveTab('experience');
                    }}
                  />
                </TabsContent>

                <TabsContent value="experience">
                  <ExperienceTab
                    cvData={cvData}
                    updateExperience={(id: string, field: string, value: any) => {
                      setCvData(prev => prev ? ({
                        ...prev,
                        experience: prev.experience.map(exp =>
                          exp.id === id ? { ...exp, [field]: value } : exp
                        )
                      }) : null);
                    }}
                    addExperience={() => {
                      const newExp = {
                        id: Date.now().toString(),
                        position: '',
                        company: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        current: false,
                        description: ''
                      };
                      setCvData(prev => prev ? ({
                        ...prev,
                        experience: [...prev.experience, newExp]
                      }) : null);
                    }}
                    removeExperience={(id: string) => {
                      setCvData(prev => prev ? ({
                        ...prev,
                        experience: prev.experience.filter(exp => exp.id !== id)
                      }) : null);
                    }}
                    improveWithAI={improveWithAI}
                    isImproving={isImproving}
                    goToPreviousTab={() => setActiveTab('summary')}
                    goToNextTab={() => {
                      if (!completedSections.includes('experience')) {
                        setCompletedSections(prev => [...prev, 'experience']);
                      }
                      setActiveTab('education');
                    }}
                    setCvData={setCvData}
                  />
                </TabsContent>

                <TabsContent value="education">
                  <EducationTab
                    cvData={cvData}
                    updateEducation={(id: string, field: string, value: string) => {
                      setCvData(prev => prev ? ({
                        ...prev,
                        education: prev.education.map(edu =>
                          edu.id === id ? { ...edu, [field]: value } : edu
                        )
                      }) : null);
                    }}
                    addEducation={() => {
                      const newEdu = {
                        id: Date.now().toString(),
                        degree: '',
                        institution: '',
                        location: '',
                        year: '',
                        description: ''
                      };
                      setCvData(prev => prev ? ({
                        ...prev,
                        education: [...prev.education, newEdu]
                      }) : null);
                    }}
                    removeEducation={(id: string) => {
                      setCvData(prev => prev ? ({
                        ...prev,
                        education: prev.education.filter(edu => edu.id !== id)
                      }) : null);
                    }}
                    goToPreviousTab={() => setActiveTab('experience')}
                    goToNextTab={() => {
                      if (!completedSections.includes('education')) {
                        setCompletedSections(prev => [...prev, 'education']);
                      }
                      setActiveTab('skills');
                    }}
                    setCvData={setCvData}
                  />
                </TabsContent>

                <TabsContent value="skills">
                  <SkillsTab
                    cvData={cvData}
                    addSkill={(skillName?: string) => {
                      if (!cvData) return;
                      
                      if (skillName && skillName.trim() !== "") {
                        setCvData(prev => prev ? ({
                          ...prev,
                          skills: [...prev.skills, skillName.trim()]
                        }) : null);
                        return;
                      }

                      const newSkill = prompt("Enter new skill:");
                      if (newSkill && newSkill.trim() !== "") {
                        setCvData(prev => prev ? ({
                          ...prev,
                          skills: [...prev.skills, newSkill.trim()]
                        }) : null);
                      }
                    }}
                    removeSkill={(skill: string) => {
                      setCvData(prev => prev ? ({
                        ...prev,
                        skills: prev.skills.filter(s => s !== skill)
                      }) : null);
                    }}
                    goToPreviousTab={() => setActiveTab('education')}
                    saveCV={handleSave}
                    saveAndAdapt={() => {}} // No aplica en este contexto
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Vista Previa */}
            <div className="border rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[70vh]">
              <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
                <CVPreview cvData={cvData} />
              </div>
            </div>
          </div>
        ) : (
          /* Solo Vista Previa */
          <div className="flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm overflow-hidden">
              <CVPreview cvData={cvData} />
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-4 pt-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={() => setIsEditing(!isEditing)} 
            variant="outline" 
            className="flex-1"
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {existingCVId ? 'Actualizar CV' : 'Guardar CV'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
