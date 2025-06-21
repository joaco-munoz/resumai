
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save, 
  Plus, 
  FileText, 
  User,
  Briefcase,
  GraduationCap,
  Book,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CVData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  experience: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
  summary: string;
}

export default function CVBuilder() {
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    experience: [],
    education: [],
    skills: [],
    summary: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCV();
    }
  }, [user]);

  const loadCV = async () => {
    try {
      console.log('Loading CV for user:', user?.id);
      
      const { data, error } = await supabase
        .from('cvs')
        .select('content')
        .eq('user_id', user?.id)
        .eq('cv_source', 'editor')
        .single();

      if (error) {
        console.error('Error loading CV:', error);
        toast.error(`Error al cargar el CV: ${error.message}`);
        return;
      }

      console.log('CV loaded successfully:', data);
      if (data?.content) {
        // Safely cast the content to CVData type
        const loadedData = data.content as unknown as CVData;
        if (loadedData && typeof loadedData === 'object' && 'personalInfo' in loadedData) {
          setCvData(loadedData);
        }
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      toast.error("Error al cargar el CV");
    }
  };

  const handleInputChange = (section: keyof CVData, field: string, value: string) => {
    setCvData(prevData => ({
      ...prevData,
      [section]: {
        ...(prevData[section] as object),
        [field]: value
      }
    }));
  };

  const handleAddExperience = () => {
    setCvData(prevData => ({
      ...prevData,
      experience: [
        ...prevData.experience,
        {
          jobTitle: "",
          company: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setCvData(prevData => {
      const newExperience = [...prevData.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return {
        ...prevData,
        experience: newExperience
      };
    });
  };

  const handleRemoveExperience = (index: number) => {
    setCvData(prevData => ({
      ...prevData,
      experience: prevData.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    setCvData(prevData => ({
      ...prevData,
      education: [
        ...prevData.education,
        {
          institution: "",
          degree: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setCvData(prevData => {
      const newEducation = [...prevData.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return {
        ...prevData,
        education: newEducation
      };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setCvData(prevData => ({
      ...prevData,
      education: prevData.education.filter((_, i) => i !== index)
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    setCvData(prevData => {
      const newSkills = [...prevData.skills];
      newSkills[index] = value;
      return {
        ...prevData,
        skills: newSkills
      };
    });
  };

  const handleAddSkill = () => {
    setCvData(prevData => ({
      ...prevData,
      skills: [...prevData.skills, ""]
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setCvData(prevData => ({
      ...prevData,
      skills: prevData.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSummaryChange = (value: string) => {
    setCvData(prevData => ({
      ...prevData,
      summary: value
    }));
  };

  const handleSave = async () => {
    if (!cvData.personalInfo.fullName.trim()) {
      toast.error("Por favor ingresa tu nombre completo");
      return;
    }

    if (!user) {
      toast.error("Debes estar autenticado para guardar el CV");
      return;
    }

    setSaving(true);
    try {
      console.log('Saving CV data:', cvData);
      
      // Primero verificar si ya existe un CV del editor para este usuario
      const { data: existingCV } = await supabase
        .from('cvs')
        .select('id')
        .eq('user_id', user.id)
        .eq('cv_source', 'editor')
        .single();

      let result;
      
      if (existingCV) {
        // Actualizar el CV existente del editor
        result = await supabase
          .from('cvs')
          .update({
            title: cvData.personalInfo.fullName || "Mi CV General",
            content: cvData as any,
            status: 'draft' as const,
            last_updated: new Date().toISOString(),
            cv_source: 'editor'
          })
          .eq('id', existingCV.id)
          .select()
          .single();
      } else {
        // Crear un nuevo CV del editor
        result = await supabase
          .from('cvs')
          .insert({
            user_id: user.id,
            title: cvData.personalInfo.fullName || "Mi CV General",
            content: cvData as any,
            status: 'draft' as const,
            cv_source: 'editor'
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving CV:', result.error);
        toast.error(`Error al guardar el CV: ${result.error.message}`);
        return;
      }

      console.log('CV saved successfully:', result.data);
      toast.success(existingCV ? "CV actualizado exitosamente" : "CV guardado exitosamente");
      
      // Redirigir a la lista de CVs
      navigate('/app/cvs');
      
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Error al guardar el CV");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Editor de CV</h1>
                  <p className="text-gray-600 text-sm">
                    Crea y personaliza tu currículum vitae con vista previa en tiempo real
                  </p>
                </div>
                <Button 
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar CV"}
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-80px)]">
              {/* Left Panel - Form */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Información Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input
                          type="text"
                          id="fullName"
                          value={cvData.personalInfo.fullName}
                          onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="jobTitle">Título Profesional</Label>
                        <Input
                          type="text"
                          id="jobTitle"
                          value={cvData.personalInfo.jobTitle}
                          onChange={(e) => handleInputChange("personalInfo", "jobTitle", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-500" />
                            Email
                          </Label>
                          <Input
                            type="email"
                            id="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            Teléfono
                          </Label>
                          <Input
                            type="tel"
                            id="phone"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          Ubicación
                        </Label>
                        <Input
                          type="text"
                          id="location"
                          value={cvData.personalInfo.location}
                          onChange={(e) => handleInputChange("personalInfo", "location", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="linkedin" className="flex items-center gap-1">
                            <Linkedin className="h-4 w-4 text-blue-500" />
                            LinkedIn
                          </Label>
                          <Input
                            type="url"
                            id="linkedin"
                            placeholder="https://linkedin.com/in/tuperfil"
                            value={cvData.personalInfo.linkedin}
                            onChange={(e) => handleInputChange("personalInfo", "linkedin", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="github" className="flex items-center gap-1">
                            <Github className="h-4 w-4 text-gray-800" />
                            GitHub
                          </Label>
                          <Input
                            type="url"
                            id="github"
                            placeholder="https://github.com/tuusuario"
                            value={cvData.personalInfo.github}
                            onChange={(e) => handleInputChange("personalInfo", "github", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="flex items-center gap-1">
                            <Globe className="h-4 w-4 text-gray-500" />
                            Sitio Web
                          </Label>
                          <Input
                            type="url"
                            id="website"
                            placeholder="https://tuportfolio.com"
                            value={cvData.personalInfo.website}
                            onChange={(e) => handleInputChange("personalInfo", "website", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        Resumen Profesional
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="summary">Resumen</Label>
                      <Textarea
                        id="summary"
                        value={cvData.summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        className="mt-2 min-h-[100px]"
                        placeholder="Describe brevemente tu perfil profesional..."
                      />
                    </CardContent>
                  </Card>

                  {/* Experience */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Briefcase className="h-5 w-5" />
                        Experiencia Laboral
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cvData.experience.map((exp, index) => (
                        <div key={index} className="border rounded-md p-4 space-y-3 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`jobTitle-${index}`}>Título del Puesto</Label>
                              <Input
                                type="text"
                                id={`jobTitle-${index}`}
                                value={exp.jobTitle}
                                onChange={(e) => handleExperienceChange(index, "jobTitle", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`company-${index}`}>Empresa</Label>
                              <Input
                                type="text"
                                id={`company-${index}`}
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`startDate-${index}`}>Fecha de Inicio</Label>
                              <Input
                                type="date"
                                id={`startDate-${index}`}
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`endDate-${index}`}>Fecha de Fin</Label>
                              <Input
                                type="date"
                                id={`endDate-${index}`}
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`description-${index}`}>Descripción</Label>
                            <Textarea
                              id={`description-${index}`}
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                              rows={3}
                            />
                          </div>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveExperience(index)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline"
                        onClick={handleAddExperience}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Experiencia
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Education */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <GraduationCap className="h-5 w-5" />
                        Educación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cvData.education.map((edu, index) => (
                        <div key={index} className="border rounded-md p-4 space-y-3 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`institution-${index}`}>Institución</Label>
                              <Input
                                type="text"
                                id={`institution-${index}`}
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`degree-${index}`}>Título Obtenido</Label>
                              <Input
                                type="text"
                                id={`degree-${index}`}
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`eduStartDate-${index}`}>Fecha de Inicio</Label>
                              <Input
                                type="date"
                                id={`eduStartDate-${index}`}
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`eduEndDate-${index}`}>Fecha de Fin</Label>
                              <Input
                                type="date"
                                id={`eduEndDate-${index}`}
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`eduDescription-${index}`}>Descripción</Label>
                            <Textarea
                              id={`eduDescription-${index}`}
                              value={edu.description}
                              onChange={(e) => handleEducationChange(index, "description", e.target.value)}
                              rows={2}
                            />
                          </div>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveEducation(index)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline"
                        onClick={handleAddEducation}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Educación
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Book className="h-5 w-5" />
                        Habilidades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cvData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            type="text"
                            value={skill}
                            onChange={(e) => handleSkillChange(index, e.target.value)}
                            placeholder="Ej: JavaScript, React, Node.js"
                            className="flex-grow"
                          />
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveSkill(index)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline"
                        onClick={handleAddSkill}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Habilidad
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Panel - Preview */}
              <div className="w-1/2 bg-white border-l">
                <div className="h-full p-6 overflow-y-auto">
                  <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* CV Preview Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                      <h1 className="text-3xl font-bold mb-2">
                        {cvData.personalInfo.fullName || "Tu Nombre"}
                      </h1>
                      <p className="text-xl opacity-90 mb-4">
                        {cvData.personalInfo.jobTitle || "Tu Título Profesional"}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {cvData.personalInfo.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {cvData.personalInfo.email}
                          </div>
                        )}
                        {cvData.personalInfo.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {cvData.personalInfo.phone}
                          </div>
                        )}
                        {cvData.personalInfo.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {cvData.personalInfo.location}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        {cvData.personalInfo.linkedin && (
                          <div className="flex items-center gap-1">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </div>
                        )}
                        {cvData.personalInfo.github && (
                          <div className="flex items-center gap-1">
                            <Github className="h-4 w-4" />
                            GitHub
                          </div>
                        )}
                        {cvData.personalInfo.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            Portfolio
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      {/* Summary */}
                      {cvData.summary && (
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Resumen Profesional
                          </h2>
                          <p className="text-gray-600 leading-relaxed">{cvData.summary}</p>
                        </div>
                      )}

                      {/* Experience */}
                      {cvData.experience.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Experiencia Laboral
                          </h2>
                          <div className="space-y-4">
                            {cvData.experience.map((exp, index) => (
                              <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {exp.jobTitle || "Título del Puesto"}
                                </h3>
                                <p className="text-blue-600 font-medium mb-1">
                                  {exp.company || "Nombre de la Empresa"}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                  {exp.startDate} - {exp.endDate || "Presente"}
                                </p>
                                {exp.description && (
                                  <p className="text-gray-600 text-sm">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {cvData.education.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Educación
                          </h2>
                          <div className="space-y-4">
                            {cvData.education.map((edu, index) => (
                              <div key={index} className="border-l-4 border-green-500 pl-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {edu.degree || "Título Obtenido"}
                                </h3>
                                <p className="text-green-600 font-medium mb-1">
                                  {edu.institution || "Institución"}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                  {edu.startDate} - {edu.endDate || "Presente"}
                                </p>
                                {edu.description && (
                                  <p className="text-gray-600 text-sm">{edu.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {cvData.skills.length > 0 && cvData.skills.some(skill => skill.trim()) && (
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Book className="h-5 w-5" />
                            Habilidades
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {cvData.skills.filter(skill => skill.trim()).map((skill, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
