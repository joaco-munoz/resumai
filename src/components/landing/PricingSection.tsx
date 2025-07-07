
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap } from "lucide-react";

interface PricingSectionProps {
  onSignUpNavigation: () => void;
}

export const PricingSection = forwardRef<HTMLDivElement, PricingSectionProps>(({ onSignUpNavigation }, ref) => {
  return (
    <section id="planes-simples" ref={ref} className="py-20 bg-blue-950/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Planes Simples</h2>
          <p className="text-lg md:text-xl text-slate-300">Prueba gratis hoy, amplía tu plan a tu ritmo.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Gratis</CardTitle>
              <div className="text-3xl font-bold text-blue-400 mt-4">$0</div>
              <CardDescription className="text-slate-300 text-base">Perfecto para empezar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">5 mejoras inteligentes al mes a tu CV  </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">3 match de ofertas laborales al mes con adaptación incluida</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">1 exportación PDF sin marca de agua</span>
              </div>

            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-blue-500 bg-slate-800/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-cyan-600 text-white px-4 py-1 text-sm">
              Popular
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Pro</CardTitle>
              <div className="text-3xl font-bold text-blue-400 mt-4">$6.990<span className="text-lg font-normal text-blue-300"> CLP/mes</span></div>
              <CardDescription className="text-slate-300 text-base">CVs sin límites, inscríbete hoy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">CVs ilimitados con IA</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">Exportaciones ilimitadas en PDF y Word</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">Job Matcher avanzado con recomendaciones precisas</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">Mejoras IA ilimitadas</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300 text-base">Acceso a novedades antes que nadie</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
});

PricingSection.displayName = "PricingSection";
