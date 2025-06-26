import { Button } from "@/components/ui/button";
import { forwardRef, useState } from "react";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";

interface VideoSectionProps {
  onSignUpNavigation: () => void;
}

// Prompt NOOB (input con info adicional, poco estructurado)
const originalText = `
desarrollador frontend +4 años. React (hooks, context), TypeScript, algo de Node y GraphQL.
en ABC hicimos un e-commerce; me tocó el carrito, login y varias pantallas. dicen que cargaba rápido.
mantengo dashboards internos, reviso PRs y hago deploy con github actions; a veces ayudo al diseñador en figma.
busco un puesto para mejorar performance, aprender arquitectura y quizá liderar un equipo chico.
`;

// Resumen Profesional optimizado por IA (output)
const optimizedText = `Desarrollador Front-end con 4 años de experiencia construyendo y optimizando aplicaciones e-commerce y dashboards B2B con React, TypeScript y GraphQL. Lideré el rediseño del flujo de carrito y autenticación en ABC, logrando un aumento del 18 % en la conversión y reduciendo el Time-to-Interactive de 4,7 s a 2,8 s. Amplia práctica en arquitectura modular, gestión de estado (Context, Redux) y CI/CD con GitHub Actions. Colaboro estrechamente con diseñadores en Figma para traducir prototipos en experiencias accesibles (WCAG 2.1 AA) y de alto rendimiento. Mentalidad de mejora continua, mentoría de juniors y pasión por la optimización a escala que impulsa el crecimiento del negocio.`;

export const VideoSection = forwardRef<HTMLDivElement, VideoSectionProps>(({ onSignUpNavigation }: VideoSectionProps, ref) => {
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimizeToggle = () => {
    setIsOptimized(!isOptimized);
  };

  return (
    <section id="creador-cv" ref={ref} className="py-20 bg-blue-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual Side */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200/50">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-2xl text-slate-800">Resumen Profesional</h3>
                <Button size="sm" className={`font-semibold shrink-0 transition-all ${isOptimized ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'}`} onClick={handleOptimizeToggle}>
                  {isOptimized ? <RotateCcw className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isOptimized ? 'Ver Original' : 'Optimizar Resumen'}
                </Button>
              </div>
              <p className="text-slate-500">Un resumen conciso que destaque tus fortalezas principales.</p>
            </div>
            <div className="relative bg-slate-50 rounded-lg p-4 border border-slate-200 text-slate-700 transition-all duration-300 min-h-[18rem]">
              <p className="whitespace-pre-wrap pb-6">
                {isOptimized ? optimizedText.trim() : originalText.trim()}
              </p>
              <div className="absolute bottom-3 right-4 text-sm text-slate-400">
                {isOptimized ? optimizedText.trim().length : originalText.trim().length}/750 caracteres
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Optimiza cada sección de tu CV con IA.
            </h2>
            <p className="text-lg text-blue-200">
              Nuestra IA no solo escribe por ti, sino que analiza y mejora cada palabra para que tu perfil profesional sea irresistible para los reclutadores.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={onSignUpNavigation}
            >
              Crear CV con IA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

VideoSection.displayName = "VideoSection";
