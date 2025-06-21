import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Download, 
  Eye, 
  User, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Code,
  Plus,
  Trash2,
  Star
} from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CVPreviewModal } from "@/components/CVPreviewModal";
import { downloadCVAsPDF } from "@/utils/pdfUtils";

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills: string[];
}

export default function CVBuilder() {
  const { cvId } = useParams();
  const [cvTitle, setCvTitle] = useState("Nuevo CV");
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: "Nombre Completo",
      email: "correo@ejemplo.com",
      phone: "+1234567890",
      location: "Ciudad, Estado",
      linkedin: "linkedin.com/in/usuario",
      website: "www.ejemplo.com",
    },
    summary: "Un breve resumen de tu perfil profesional...",
    experience: [
      {
        id: "1",
        position: "Puesto de Trabajo",
        company: "Nombre de la Empresa",
        startDate: "2020-01-01",
        endDate: "2021-01-01",
        current: false,
        description: "Descripción de las responsabilidades y logros...",
      },
    ],
    education: [
      {
        id: "1",
        degree: "Título Académico",
        institution: "Nombre de la Institución",
        year: "2020",
        description: "Descripción de los estudios...",
      },
    ],
    skills: ["Habilidad 1", "Habilidad 2", "Habilidad 3"],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (cvId === "new") {
        loadLastCV();
      } else {
        loadCV();
      }
    }
  }, [cvId, user]);

  const loadLastCV = async () => {
    try {
      console.log('Loading last CV for user:', user?.id);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading last CV:', error);
        toast.error(`Error al cargar el CV: ${error.message}`);
        return;
      }

      if (data && data.content) {
        console.log('Last CV loaded successfully:', data);
        const cvData = data.content as unknown as CVData;
        setCvData(cvData);
        setCurrentCVId(data.id);
        setCvTitle(data.title);
      } else {
        console.log('No CV found, using default data');
        // Si no hay CV, crear uno nuevo marcado como principal
        const newCV = await createInitialCV();
        if (newCV) {
          setCurrentCVId(newCV.id);
          setCvTitle(newCV.title);
        }
      }
    } catch (error) {
      console.error('Error loading last CV:', error);
      toast.error("Error al cargar el CV");
    } finally {
      setLoading(false);
    }
  };

  const createInitialCV = async () => {
    try {
      const { data, error } = await supabase
        .from('cvs')
        .insert({
          user_id: user?.id,
          title: "Mi CV Principal",
          content: cvData,
          status: 'draft',
          is_primary: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating initial CV:', error);
        toast.error(`Error al crear el CV: ${error.message}`);
        return null;
      }

      console.log('Initial CV created successfully:', data);
      toast.success("CV principal creado exitosamente");
      return data;
    } catch (error) {
      console.error('Error creating initial CV:', error);
      toast.error("Error al crear el CV");
      return null;
    }
  };

  const loadCV = async () => {
    try {
      console.log('Loading CV:', cvId);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', cvId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading CV:', error);
        toast.error(`Error al cargar el CV: ${error.message}`);
        return;
      }

      console.log('CV loaded successfully:', data);
      if (data.content) {
        const cvData = data.content as unknown as CVData;
        setCvData(cvData);
      }
      setCurrentCVId(data.id);
      setCvTitle(data.title);
    } catch (error) {
      console.error('Error loading CV:', error);
      toast.error("Error al cargar el CV");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      console.log('Saving CV...');
      
      const cvPayload = {
        title: cvTitle,
        content: cvData,
        last_updated: new Date().toISOString(),
        status: 'draft',
        user_id: user.id,
        // Marcar como principal si es un CV nuevo o si no hay ningún CV principal
        is_primary: !currentCVId || cvTitle === "Mi CV Principal"
      };

      let result;
      if (currentCVId) {
        // Actualizar CV existente
        const { data, error } = await supabase
          .from('cvs')
          .update(cvPayload)
          .eq('id', currentCVId)
          .eq('user_id', user.id)
          .select()
          .single();

        result = { data, error };
      } else {
        // Crear nuevo CV
        const { data, error } = await supabase
          .from('cvs')
          .insert(cvPayload)
          .select()
          .single();

        result = { data, error };
      }

      if (result.error) {
        console.error('Error saving CV:', result.error);
        toast.error(`Error al guardar el CV: ${result.error.message}`);
        return;
      }

      console.log('CV saved successfully:', result.data);
      if (!currentCVId) {
        setCurrentCVId(result.data.id);
      }
      
      toast.success("CV guardado exitosamente");
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Error al guardar el CV");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    downloadCVAsPDF(cvData, cvTitle);
    toast.success("CV descargado exitosamente");
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const addExperience = () => {
    setCvData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now().toString(),
          position: "Puesto de Trabajo",
          company: "Nombre de la Empresa",
          startDate: "2020-01-01",
          endDate: "2021-01-01",
          current: false,
          description: "Descripción de las responsabilidades y logros...",
        },
      ],
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const deleteExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setCvData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          degree: "Título Académico",
          institution: "Nombre de la Institución",
          year: "2020",
          description: "Descripción de los estudios...",
        },
      ],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const deleteEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addSkill = () => {
    setCvData((prev) => ({
      ...prev,
      skills: [...prev.skills, "Nueva Habilidad"],
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const deleteSkill = (index: number) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
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
                <p className="text-gray-600">Cargando editor de CV...</p>
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
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <Input
                      value={cvTitle}
                      onChange={(e) => setCvTitle(e.target.value)}
                      className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent"
                      placeholder="Título del CV"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Borrador
                      </Badge>
                      {cvTitle === "Mi CV Principal" && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          CV Principal
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Nombre Completo"
                        value={cvData.personalInfo.fullName}
                        onChange={(e) =>
                          updatePersonalInfo("fullName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={cvData.personalInfo.email}
                        onChange={(e) =>
                          updatePersonalInfo("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="tel"
                        placeholder="Número de Teléfono"
                        value={cvData.personalInfo.phone}
                        onChange={(e) =>
                          updatePersonalInfo("phone", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Ubicación"
                        value={cvData.personalInfo.location}
                        onChange={(e) =>
                          updatePersonalInfo("location", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="url"
                        placeholder="LinkedIn"
                        value={cvData.personalInfo.linkedin}
                        onChange={(e) =>
                          updatePersonalInfo("linkedin", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="url"
                        placeholder="Sitio Web"
                        value={cvData.personalInfo.website}
                        onChange={(e) =>
                          updatePersonalInfo("website", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Resumen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Un breve resumen de tu perfil profesional..."
                      value={cvData.summary}
                      onChange={(e) =>
                        setCvData((prev) => ({ ...prev, summary: e.target.value }))
                      }
                    />
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Experiencia Laboral
                    </CardTitle>
                    <Button type="button" variant="secondary" size="sm" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cvData.experience.map((exp) => (
                      <div key={exp.id} className="space-y-2 border rounded-md p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="text"
                              placeholder="Puesto de Trabajo"
                              value={exp.position}
                              onChange={(e) =>
                                updateExperience(exp.id, "position", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Input
                              type="text"
                              placeholder="Nombre de la Empresa"
                              value={exp.company}
                              onChange={(e) =>
                                updateExperience(exp.id, "company", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) =>
                                updateExperience(exp.id, "startDate", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) =>
                                updateExperience(exp.id, "endDate", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Textarea
                            placeholder="Descripción de las responsabilidades y logros..."
                            value={exp.description}
                            onChange={(e) =>
                              updateExperience(exp.id, "description", e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExperience(exp.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Educación
                    </CardTitle>
                    <Button type="button" variant="secondary" size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cvData.education.map((edu) => (
                      <div key={edu.id} className="space-y-2 border rounded-md p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="text"
                              placeholder="Título Académico"
                              value={edu.degree}
                              onChange={(e) =>
                                updateEducation(edu.id, "degree", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Input
                              type="text"
                              placeholder="Nombre de la Institución"
                              value={edu.institution}
                              onChange={(e) =>
                                updateEducation(edu.id, "institution", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Input
                            type="text"
                            placeholder="Año"
                            value={edu.year}
                            onChange={(e) =>
                              updateEducation(edu.id, "year", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Textarea
                            placeholder="Descripción de los estudios..."
                            value={edu.description}
                            onChange={(e) =>
                              updateEducation(edu.id, "description", e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEducation(edu.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Habilidades
                    </CardTitle>
                    <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cvData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Habilidad"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          className="flex-grow"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSkill(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>

        {/* Preview Modal */}
        <CVPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          cvData={cvData}
          cvTitle={cvTitle}
          onDownload={handleDownload}
        />
      </div>
    </SidebarProvider>
  );
}
