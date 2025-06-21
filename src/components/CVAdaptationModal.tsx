
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVData } from "@/types/cv";

interface MatchResult {
  score: number;
  missingKeywords: string[];
  suggestedBullets: string[];
  strengths: string[];
  improvements: string[];
}

interface JobDetails {
  title: string;
  company: string;
}

interface CVAdaptationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: MatchResult | null;
  jobDetails: JobDetails;
  onSave: () => void;
}

export const CVAdaptationModal = ({ 
  isOpen, 
  onClose, 
  matchResult, 
  jobDetails, 
  onSave 
}: CVAdaptationModalProps) => {
  const [adaptedCV, setAdaptedCV] = useState<CVData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && matchResult) {
      loadAndAdaptCV();
    }
  }, [isOpen, matchResult]);

  const loadAndAdaptCV = async () => {
    if (!user) return;

    try {
      // Cargar el CV principal más reciente
      const { data: cvData, error } = await supabase
        .from('cvs')
        .select('content')
        .eq('user_id', user.id)
        .eq('cv_source', 'editor')
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading CV:', error);
        toast.error("Error al cargar el CV principal");
        return;
      }

      if (!cvData || !cvData.content) {
        toast.error("No se encontró un CV principal para adaptar");
        return;
      }

      const originalCV = cvData.content as unknown as CVData;
      
      // Adaptar el CV con las sugerencias
      const adapted = adaptCVWithSuggestions(originalCV, matchResult!);
      setAdaptedCV(adapted);
      
    } catch (error) {
      console.error('Error loading CV:', error);
      toast.error("Error al cargar el CV");
    }
  };

  const adaptCVWithSuggestions = (originalCV: CVData, suggestions: MatchResult): CVData => {
    const adapted = { ...originalCV };

    // Agregar keywords faltantes a skills si no están ya incluidas
    const existingSkills = adapted.skills.map(skill => skill.toLowerCase());
    const newSkills = suggestions.missingKeywords.filter(
      keyword => !existingSkills.includes(keyword.toLowerCase())
    );
    adapted.skills = [...adapted.skills, ...newSkills];

    // Agregar bullets sugeridos a la experiencia más reciente
    if (adapted.experience.length > 0) {
      const latestExperience = adapted.experience[0];
      const existingBullets = latestExperience.description.split('\n').filter(line => line.trim());
      const newBullets = suggestions.suggestedBullets.map(bullet => 
        bullet.startsWith('•') ? bullet : `• ${bullet}`
      );
      
      adapted.experience[0] = {
        ...latestExperience,
        description: [...existingBullets, ...newBullets].join('\n')
      };
    }

    return adapted;
  };

  const handleSave = async () => {
    if (!adaptedCV || !user || !matchResult) return;

    setSaving(true);
    try {
      const cvTitle = `CV - ${jobDetails.title} en ${jobDetails.company}`;
      
      const { error } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          title: cvTitle,
          content: adaptedCV as any,
          status: 'draft',
          template_name: 'modern',
          cv_source: 'job_matcher',
          ai_score: matchResult.score
        });

      if (error) {
        console.error('Error saving adapted CV:', error);
        toast.error(`Error al guardar el CV adaptado: ${error.message}`);
        return;
      }
      
      toast.success("CV adaptado guardado exitosamente");
      onSave();
    } catch (error) {
      console.error('Error saving adapted CV:', error);
      toast.error("Error al guardar el CV adaptado");
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    if (!adaptedCV) return;
    setAdaptedCV({
      ...adaptedCV,
      personalInfo: {
        ...adaptedCV.personalInfo,
        [field]: value
      }
    });
  };

  const updateSummary = (value: string) => {
    if (!adaptedCV) return;
    setAdaptedCV({
      ...adaptedCV,
      summary: value
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    if (!adaptedCV) return;
    const newExperience = [...adaptedCV.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setAdaptedCV({
      ...adaptedCV,
      experience: newExperience
    });
  };

  const updateSkills = (value: string) => {
    if (!adaptedCV) return;
    setAdaptedCV({
      ...adaptedCV,
      skills: value.split(',').map(skill => skill.trim()).filter(skill => skill)
    });
  };

  if (!adaptedCV) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Adaptando CV...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>CV Adaptado - {jobDetails.title} en {jobDetails.company}</span>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Vista Previa" : "Editar"}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Column */}
          {isEditing && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Nombre completo"
                    value={adaptedCV.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={adaptedCV.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                  <Input
                    placeholder="Teléfono"
                    value={adaptedCV.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                  <Input
                    placeholder="Ubicación"
                    value={adaptedCV.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Resumen Profesional</h3>
                <Textarea
                  placeholder="Resumen profesional"
                  value={adaptedCV.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Experiencia</h3>
                {adaptedCV.experience.map((exp, index) => (
                  <div key={exp.id} className="space-y-3 mb-4 p-4 border rounded-lg">
                    <Input
                      placeholder="Posición"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    />
                    <Input
                      placeholder="Empresa"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                    <Textarea
                      placeholder="Descripción y logros"
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows={6}
                    />
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Habilidades</h3>
                <Textarea
                  placeholder="Habilidades separadas por comas"
                  value={adaptedCV.skills.join(', ')}
                  onChange={(e) => updateSkills(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Preview Column */}
          <div className={`bg-white p-8 space-y-6 font-serif ${!isEditing ? 'lg:col-span-2' : ''}`}>
            {/* Header - Harvard style centered */}
            <div className="text-center border-b border-gray-400 pb-4">
              <h1 className="text-3xl font-bold text-black mb-2">{adaptedCV.personalInfo.fullName}</h1>
              <div className="text-sm text-black">
                {adaptedCV.personalInfo.location} • {adaptedCV.personalInfo.linkedin} • {adaptedCV.personalInfo.phone} • {adaptedCV.personalInfo.email}
                {adaptedCV.personalInfo.website && <span> • {adaptedCV.personalInfo.website}</span>}
              </div>
            </div>

            {/* Summary */}
            {adaptedCV.summary && (
              <div>
                <p className="text-sm text-black leading-relaxed text-justify italic">{adaptedCV.summary}</p>
              </div>
            )}

            {/* Experience */}
            {adaptedCV.experience && adaptedCV.experience.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">Experiencia Profesional</h2>
                <div className="space-y-4">
                  {adaptedCV.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-sm font-bold text-black">{exp.company}</h3>
                          <p className="text-sm text-black italic">{exp.position}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-black font-bold">{adaptedCV.personalInfo.location}</div>
                          <div className="text-sm text-black italic">
                            {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                          </div>
                        </div>
                      </div>
                      <ul className="text-sm text-black leading-relaxed ml-4">
                        {exp.description.split('\n').filter(line => line.trim()).map((line, index) => (
                          <li key={index} className="flex items-start mb-1">
                            <span className="mr-2">•</span>
                            <span>{line.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {adaptedCV.education && adaptedCV.education.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">Educación</h2>
                <div className="space-y-3">
                  {adaptedCV.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-black uppercase">{edu.institution}</h3>
                          <p className="text-sm text-black">{edu.degree}</p>
                          {edu.description && <p className="text-sm text-black italic">{edu.description}</p>}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-black font-bold">{adaptedCV.personalInfo.location}</div>
                          <div className="text-sm text-black italic">{edu.year}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {adaptedCV.skills && adaptedCV.skills.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">Skills Adicionales</h2>
                <ul className="text-sm text-black">
                  {adaptedCV.skills.map((skill, index) => (
                    <li key={index} className="flex items-start mb-1">
                      <span className="mr-2">•</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
