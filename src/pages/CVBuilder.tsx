import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, FileText, Plus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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

const CVBuilder = () => {
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: 'Andrés Hernandez',
      email: 'andres.hernandez@gmail.com',
      phone: '+569 9876 5432',
      location: 'Valparaíso, Chile',
      linkedin: 'linkedin.com/in/andreshernandez',
      website: 'juanperez.dev'
    },
    summary: 'Desarrollador Frontend con 3+ años de experiencia en React, TypeScript y Node.js. Especializado en crear aplicaciones web modernas y escalables.',
    experience: [
      {
        id: '1',
        position: 'Frontend Developer',
        company: 'TechCorp',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: '• Desarrollé aplicaciones React con TypeScript\n• Implementé arquitecturas escalables\n• Colaboré con equipos multidisciplinarios'
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Ingeniería Informática',
        institution: 'Universidad Politécnica de Madrid',
        year: '2020',
        description: 'Especialización en Desarrollo de Software'
      }
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL', 'Git', 'Docker']
  });

  const [newSkill, setNewSkill] = useState('');
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

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
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
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
    // TODO: Connect to OpenAI when Supabase integration is set up
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Sección ${section} mejorada con IA`);
    } catch (error) {
      toast.error("Error al mejorar con IA");
    } finally {
      setIsImproving(null);
    }
  };

  const exportPDF = () => {
    // TODO: Implement PDF generation
    toast.success("CV exportado como PDF");
  };

  const goToNextTab = () => {
    const tabOrder = ['personal', 'summary', 'experience', 'education', 'skills'];
    const currentIndex = tabOrder.indexOf(activeTab);
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Editor de CV</h1>
                  <p className="text-gray-600">Crea tu CV profesional optimizado para ATS</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={exportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Badge variant="secondary">Guardado automático activado</Badge>
              </div>
            </div>
          </header>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Editor Panel */}
            <div className="w-2/5 p-6 overflow-y-auto bg-white border-r">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Resumen</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">Experiencia</TabsTrigger>
                  <TabsTrigger value="education" className="text-xs">Educación</TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs">Habilidades</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Información Personal
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => improveWithAI('personal')}
                          disabled={isImproving === 'personal'}
                        >
                          <Sparkles className="h-4 w-4" />
                          {isImproving === 'personal' ? 'Mejorando...' : 'Mejorar con IA'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nombre completo</Label>
                          <Input
                            id="fullName"
                            value={cvData.personalInfo.fullName}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Ubicación</Label>
                          <Input
                            id="location"
                            value={cvData.personalInfo.location}
                            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={cvData.personalInfo.linkedin}
                            onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Sitio web</Label>
                          <Input
                            id="website"
                            value={cvData.personalInfo.website}
                            onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button onClick={goToNextTab}>
                          Siguiente
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Resumen Profesional
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => improveWithAI('summary')}
                          disabled={isImproving === 'summary'}
                        >
                          <Sparkles className="h-4 w-4" />
                          {isImproving === 'summary' ? 'Mejorando...' : 'Mejorar con IA'}
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Un resumen conciso que destaque tus fortalezas principales
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={cvData.summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        rows={4}
                        placeholder="Describe tu perfil profesional, experiencia clave y objetivos..."
                      />
                      
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPreviousTab}>
                          Atrás
                        </Button>
                        <Button onClick={goToNextTab}>
                          Siguiente
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Experiencia Laboral
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => improveWithAI('experience')}
                              disabled={isImproving === 'experience'}
                            >
                              <Sparkles className="h-4 w-4" />
                              {isImproving === 'experience' ? 'Mejorando...' : 'Mejorar con IA'}
                            </Button>
                          </CardTitle>
                          <CardDescription>
                            Añade tu experiencia laboral más relevante
                          </CardDescription>
                        </div>
                        <Button size="sm" onClick={addExperience}>
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {cvData.experience.map((exp) => (
                        <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                              <div className="space-y-2">
                                <Label>Posición</Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                  placeholder="ej. Frontend Developer"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Empresa</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  placeholder="ej. TechCorp"
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Fecha inicio</Label>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha fin</Label>
                              <Input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Actual</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <input
                                  type="checkbox"
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                />
                                <span className="text-sm">Trabajo actual</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              rows={3}
                              placeholder="• Logro específico con métricas&#10;• Responsabilidad clave&#10;• Tecnología utilizada"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPreviousTab}>
                          Atrás
                        </Button>
                        <Button onClick={goToNextTab}>
                          Siguiente
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Educación</CardTitle>
                        <Button size="sm" onClick={addEducation}>
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {cvData.education.map((edu) => (
                        <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-2 gap-4 flex-1">
                              <div className="space-y-2">
                                <Label>Título/Grado</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                  placeholder="ej. Ingeniería Informática"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Institución</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                  placeholder="ej. Universidad Politécnica"
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Año</Label>
                              <Input
                                value={edu.year}
                                onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                placeholder="2020"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Descripción</Label>
                              <Input
                                value={edu.description}
                                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                placeholder="Especialización, nota, etc."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={goToPreviousTab}>
                          Atrás
                        </Button>
                        <Button onClick={goToNextTab}>
                          Siguiente
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Habilidades
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => improveWithAI('skills')}
                          disabled={isImproving === 'skills'}
                        >
                          <Sparkles className="h-4 w-4" />
                          {isImproving === 'skills' ? 'Mejorando...' : 'Mejorar con IA'}
                        </Button>
                      </CardTitle>
                      <CardDescription>Añade habilidades técnicas y blandas relevantes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="ej. React, Python, Liderazgo..."
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill}
                            <span className="ml-2 text-red-500">×</span>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={goToPreviousTab}>
                          Atrás
                        </Button>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ¡CV Completado!
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 p-6 bg-gray-100">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b pb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{cvData.personalInfo.fullName}</h1>
                    <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                      <span>{cvData.personalInfo.email}</span>
                      <span>•</span>
                      <span>{cvData.personalInfo.phone}</span>
                      <span>•</span>
                      <span>{cvData.personalInfo.location}</span>
                    </div>
                    <div className="flex justify-center gap-4 mt-1 text-sm text-gray-600 flex-wrap">
                      <span>{cvData.personalInfo.linkedin}</span>
                      <span>•</span>
                      <span>{cvData.personalInfo.website}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Resumen Profesional</h2>
                    <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Experiencia Laboral</h2>
                    <div className="space-y-4">
                      {cvData.experience.map((exp) => (
                        <div key={exp.id} className="border-l-2 border-brand-500 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                              <p className="text-brand-600 font-medium">{exp.company}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                            </span>
                          </div>
                          <div className="text-gray-700 whitespace-pre-line">{exp.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Educación</h2>
                    <div className="space-y-3">
                      {cvData.education.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-success-500 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                              <p className="text-success-600 font-medium">{edu.institution}</p>
                              {edu.description && <p className="text-gray-600 text-sm">{edu.description}</p>}
                            </div>
                            <span className="text-sm text-gray-500">{edu.year}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Habilidades</h2>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CVBuilder;
