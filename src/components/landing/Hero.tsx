
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { DashboardPreviewSection } from "./DashboardPreviewSection";

interface HeroProps {
  onSignUpNavigation: () => void;
}

export const Hero = forwardRef<HTMLDivElement, HeroProps>(({ onSignUpNavigation }, ref) => {
  return (
    <section id="empieza-gratis" ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/10 to-cyan-600/10 animate-pulse"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <Badge variant="secondary" className="mb-6 animate-fade-in bg-slate-800 text-blue-400 text-xl border-slate-700">
          <Sparkles className="h-4 w-4 mr-2" />
          Potenciado por IA Avanzada
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-white">
          Crea CVs que se adaptan como tú
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">🧬</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in">
          Ahorra horas adaptando tu currículum: nuestra plataforma usa IA para convertir tus datos reales en CVs listos para superar filtros y destacar en cada oferta.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base px-8 py-4 text-white" 
            onClick={onSignUpNavigation}
          >
            Empieza gratis
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto mb-12">
          <DashboardPreviewSection onSignUpNavigation={onSignUpNavigation} />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
