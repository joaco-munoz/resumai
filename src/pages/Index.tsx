
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/AuthModal";
import { Sparkles, Target, FileText, CheckCircle, Users, Zap, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase when integration is set up
    toast.success("¡Te hemos añadido a la lista de espera!");
    setEmail("");
  };

  const handleTestAccess = () => {
    navigate("/app");
  };

  const features = [{
    icon: <Sparkles className="h-8 w-8 text-blue-400" />,
    title: "IA Generativa",
    description: "Mejora automáticamente tu CV con sugerencias de IA basadas en ofertas específicas"
  }, {
    icon: <Target className="h-8 w-8 text-cyan-400" />,
    title: "ATS Optimizer",
    description: "Supera los filtros automáticos con nuestro formato optimizado para sistemas ATS"
  }, {
    icon: <FileText className="h-8 w-8 text-blue-400" />,
    title: "Múltiples Formatos",
    description: "Exporta en PDF, DOCX y JSON. Compatible con todas las plataformas de empleo"
  }];

  const faqItems = [{
    question: "¿Cómo funciona el optimizador ATS?",
    answer: "Analizamos más de 10,000 descripciones de trabajo para crear CVs que superen filtros automáticos."
  }, {
    question: "¿Puedo usar mi propio contenido?",
    answer: "¡Por supuesto! La IA mejora tu información existente sin cambiar tu experiencia real."
  }, {
    question: "¿Qué incluye el plan Pro?",
    answer: "Exportaciones ilimitadas, análisis avanzado de compatibilidad y plantillas premium."
  }];

  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ResumAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">Creador CV</Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">JD Match</Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">Precios</Button>
            <Button onClick={handleTestAccess} variant="outline" size="sm" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
              <ArrowRight className="h-4 w-4 mr-2" />
              Acceso Directo (Test)
            </Button>
            <Button size="sm" className="bg-slate-600 hover:bg-slate-700 text-white border border-slate-500">
              Iniciar Sesión
            </Button>
            <Button onClick={() => setAuthModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Regístrate
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 animate-pulse"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 animate-fade-in bg-slate-800 text-blue-400 border-slate-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Potenciado por IA Avanzada
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-white">
            Crea CVs que se adaptan como tú
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">🧬</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in">
Ahorra horas adaptando tu currículum: nuestra plataforma usa IA para convertir tus datos reales en CVs listos para superar filtros y destacar en cada oferta.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-4 text-white" onClick={() => setAuthModalOpen(true)}>
              Empieza gratis
            </Button>
          </div>

          {/* App Preview Mockup */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-100 p-4 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white rounded mx-4 px-3 py-1 text-sm text-slate-600">resumai.com</div>
                </div>
                <div className="p-8 bg-white">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">75</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Resume Score</div>
                          <div className="text-sm text-slate-500">View 12 issues found</div>
                        </div>
                        <div className="ml-auto w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs">?</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-cyan-600 font-bold text-sm">6</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">Keyword Match</div>
                          <div className="text-sm text-slate-500">Strong: 6 out of 9</div>
                        </div>
                        <div className="ml-auto w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-cyan-600 text-xs">?</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="font-semibold text-slate-800 mb-2">Resume Builder</div>
                        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-4">
                          Tailor Resume
                        </Button>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-slate-800">Andrés Hernández</div>
                        <div className="text-sm text-slate-500">DM Sales Rep | andres.hndz@gmail.com</div>
                        <div className="w-full bg-cyan-500 h-2 rounded-full mt-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Características Principales</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Todo lo que necesitas para crear CVs que destaquen y superen filtros automáticos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="border-slate-700 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-slate-700/50 rounded-2xl w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base text-slate-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Planes Simples</h2>
            <p className="text-xl text-slate-300">Empieza gratis, actualiza cuando necesites más</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Gratis</CardTitle>
                <div className="text-4xl font-bold text-blue-400 mt-4">$0</div>
                <CardDescription className="text-slate-300">Perfecto para empezar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">1 CV optimizado con IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">1 exportación PDF gratis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">Análisis básico ATS</span>
                </div>
                <Button className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600" onClick={() => setAuthModalOpen(true)}>
                  Empezar Gratis
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-blue-500 bg-slate-800/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-cyan-600 text-white px-4 py-1 text-sm">
                Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Pro</CardTitle>
                <div className="text-4xl font-bold text-blue-400 mt-4">$29</div>
                <CardDescription className="text-slate-300">CVs sin límites, inscríbete hoy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">Genera CVs sin límite, impulsados por IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">Exporta sin limites</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">DOCX y JSON export</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">Job Matcher avanzado</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-300">Soporte prioritario</span>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" onClick={() => setAuthModalOpen(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Empezar Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Preguntas Frecuentes</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((item, index) => <Card key={index} className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{item.answer}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para destacar?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a miles de profesionales que ya consiguen más entrevistas
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex gap-4">
            <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/60" required />
            <Button type="submit" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
              Únete
            </Button>
          </form>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Plataforma Beta</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span>5/5 estrellas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">ResumAI</span>
            </div>
            
            <div className="text-slate-400">
              ©2025
            </div>
            
            <div className="text-slate-400">
              resumai.support@gmail.com
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>;
};
export default Index;
