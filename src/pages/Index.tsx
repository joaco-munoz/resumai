import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/AuthModal";
import { Sparkles, Target, FileText, CheckCircle, Users, Zap, Star } from "lucide-react";
import { toast } from "sonner";
const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase when integration is set up
    toast.success("¡Te hemos añadido a la lista de espera!");
    setEmail("");
  };
  const features = [{
    icon: <Sparkles className="h-8 w-8 text-brand-500" />,
    title: "IA Generativa",
    description: "Mejora automáticamente tu CV con sugerencias de IA basadas en ofertas específicas"
  }, {
    icon: <Target className="h-8 w-8 text-success-500" />,
    title: "ATS Optimizer",
    description: "Supera los filtros automáticos con nuestro formato optimizado para sistemas ATS"
  }, {
    icon: <FileText className="h-8 w-8 text-brand-500" />,
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
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">ResumAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Características</Button>
            <Button variant="ghost" size="sm">Precios</Button>
            <Button onClick={() => setAuthModalOpen(true)} size="sm">
              Crear Cuenta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-purple-600/10 animate-pulse"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 mr-2" />
            Potenciado por IA Avanzada
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in gradient-text">
            Crea tu CV con IA y
            <br />
            <span className="text-success-600">supera los filtros ATS</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in">
            Genera CVs profesionales optimizados para sistemas automáticos de selección. 
            Aumenta tus posibilidades de conseguir entrevistas con IA generativa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button size="lg" className="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-lg px-8 py-4" onClick={() => setAuthModalOpen(true)}>
              <Sparkles className="h-5 w-5 mr-2" />
              Empezar Gratis
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">95%</div>
              <div className="text-sm text-gray-600">Tasa de éxito ATS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600">10k+</div>
              <div className="text-sm text-gray-600">CVs creados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4.9★</div>
              <div className="text-sm text-gray-600">Valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Características Principales</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para crear CVs que destaquen y superen filtros automáticos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Interfaz Intuitiva</h2>
            <p className="text-xl text-gray-600">
              Crea tu CV profesional en minutos con nuestra interfaz diseñada para la productividad
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-3xl p-8 animate-float">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-brand-500 to-brand-700 p-4 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <span className="ml-4 text-sm">CVMaster AI - Editor</span>
                  </div>
                </div>
                <div className="p-8 text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-brand-300" />
                  <p className="text-lg">Vista previa del editor en tiempo real</p>
                  <p className="text-sm mt-2">Interfaz dividida: Editor + Preview en vivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Planes Simples</h2>
            <p className="text-xl text-gray-600">Empieza gratis, actualiza cuando necesites más</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Gratis</CardTitle>
                <div className="text-4xl font-bold text-brand-600 mt-4">$0</div>
                <CardDescription>Perfecto para empezar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>1 CV con IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>1 exportación PDF gratis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>Análisis básico ATS</span>
                </div>
                <Button className="w-full mt-6" variant="outline" onClick={() => setAuthModalOpen(true)}>
                  Empezar Gratis
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-brand-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-500 to-brand-700 text-white px-4 py-1 text-sm">
                Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-brand-600 mt-4">$29</div>
                <CardDescription>Para profesionales serios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>CVs ilimitados con IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>Exportaciones ilimitadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>DOCX y JSON export</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>Job Matcher avanzado</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <span>Soporte prioritario</span>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800" onClick={() => setAuthModalOpen(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Empezar Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Preguntas Frecuentes</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqItems.map((item, index) => <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.answer}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-brand-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para destacar?</h2>
          <p className="text-xl mb-8 text-brand-100">
            Únete a miles de profesionales que ya consiguen más entrevistas
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex gap-4">
            <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/60" required />
            <Button type="submit" variant="secondary">
              Únete
            </Button>
          </form>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-brand-200">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>10,000+ usuarios</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span>4.9/5 estrellas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">CVMaster AI</span>
            </div>
            
            <div className="text-gray-400">
              © 2024 CVMaster AI. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>;
};
export default Index;