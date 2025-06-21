
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CVPreview } from "@/components/cv-builder/CVPreview";
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
  onSave: () => void;
}

export const CVAdaptationPreviewModal = ({
  isOpen,
  onClose,
  originalCvData,
  adaptedCvData,
  jobTitle,
  companyName,
  onSave
}: CVAdaptationPreviewModalProps) => {
  const [cvData, setCvData] = useState<CVData>(adaptedCvData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    setIsSaving(true);

    try {
      // Generar nombre para el CV adaptado
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
        cvTitle = `CV - ${cvData.personalInfo.fullName} - ${dateTime}`;
      }

      // Crear el CV adaptado
      const { data: adaptedCV, error: adaptError } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          title: cvTitle,
          content: cvData as any,
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

      // Guardar en seguimiento de postulaciones
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
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving adapted CV:', error);
      toast.error("Error al guardar el CV adaptado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSkills = (newSkills: string[]) => {
    setCvData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !cvData.skills.includes(skill.trim())) {
      handleEditSkills([...cvData.skills, skill.trim()]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleEditSkills(cvData.skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isEditing ? 'max-w-7xl' : 'max-w-4xl'} max-h-[95vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-brand-500" />
            CV Adaptado - {jobTitle} {companyName && `en ${companyName}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edita tu CV adaptado antes de guardarlo' : 'Revisa tu CV adaptado antes de guardarlo'}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de Edición */}
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      value={cvData.personalInfo.fullName}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cvData.personalInfo.email}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={cvData.personalInfo.location}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Resumen */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resumen Profesional</h3>
                <Textarea
                  value={cvData.summary}
                  onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                  placeholder="Describe tu perfil profesional..."
                />
              </div>

              <Separator />

              {/* Habilidades */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Habilidades</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {cvData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar nueva habilidad"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              {/* Experiencia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Experiencia Profesional</h3>
                {cvData.experience.map((exp, index) => (
                  <div key={exp.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cargo</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => {
                            const newExp = [...cvData.experience];
                            newExp[index] = { ...newExp[index], position: e.target.value };
                            setCvData(prev => ({ ...prev, experience: newExp }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Empresa</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...cvData.experience];
                            newExp[index] = { ...newExp[index], company: e.target.value };
                            setCvData(prev => ({ ...prev, experience: newExp }));
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...cvData.experience];
                          newExp[index] = { ...newExp[index], description: e.target.value };
                          setCvData(prev => ({ ...prev, experience: newExp }));
                        }}
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista Previa */}
            <div className="border rounded-lg p-4 bg-gray-50">
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
                Guardar CV
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
