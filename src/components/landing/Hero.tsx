
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import RollingGallery from "@/components/ui/rolling-gallery";

interface HeroProps {
  onSignUpNavigation: () => void;
}

export const Hero = forwardRef<HTMLDivElement, HeroProps>(({ onSignUpNavigation }, ref) => {
  return (
    <section id="empieza-gratis" ref={ref} className="relative py-10 sm:py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/10 to-cyan-600/10 animate-pulse"></div>
      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <Badge variant="secondary" className="mb-4 sm:mb-6 animate-fade-in bg-slate-800 text-blue-400 text-sm sm:text-base md:text-xl border-slate-700 py-1 px-3">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Potenciado por IA Avanzada
        </Badge>
        
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in text-white leading-tight">
          Crea CVs que se adaptan como tú
          <span className="block sm:inline sm:ml-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">🧜</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 max-w-3xl mx-auto animate-fade-in px-2">
          Ahorra horas adaptando tu currículum: nuestra plataforma usa IA para convertir tus datos reales en CVs listos para superar filtros y destacar en cada oferta.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12 animate-fade-in">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base px-6 sm:px-8 py-3 sm:py-4 text-white w-full sm:w-auto max-w-xs mx-auto sm:mx-0" 
            onClick={onSignUpNavigation}
          >
            Empieza gratis
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-full sm:max-w-5xl mx-auto mb-8 sm:mb-12">
          <RollingGallery autoplay={true} pauseOnHover={true} />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
