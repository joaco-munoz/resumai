
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Calendar, MoreHorizontal } from "lucide-react";

interface HeroProps {
  onSignUpNavigation: () => void;
}

export const Hero = forwardRef<HTMLDivElement, HeroProps>(({ onSignUpNavigation }, ref) => {
  return (
    <section id="empieza-gratis" ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 animate-pulse"></div>
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

        {/* App Preview Mockup */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-slate-100 p-4 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded mx-4 px-3 py-1 text-sm text-slate-600">resumai.com/app/cvs</div>
              </div>
              <div className="p-8 bg-white">
                {/* Header with title and icon */}
                <div className="flex items-center gap-3 mb-8">
                  <FileText className="h-8 w-8 text-slate-600" />
                  <h2 className="text-xl font-bold text-slate-800">Currículums</h2>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 py-4 border-b border-slate-200 text-sm font-medium text-slate-600">
                  <div>CV</div>
                  <div className="text-center">Puntuación</div>
                  <div className="text-center">Estado</div>
                  <div className="text-center">Actualizado</div>
                  <div></div>
                </div>

                {/* CV List Items */}
                <div className="space-y-4 mt-4">
                  {/* CV 1 */}
                  <div className="grid grid-cols-5 gap-4 py-4 items-center hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">CV - Desarrollador Frontend</div>
                        <div className="text-xs text-slate-500">Creado hace 5 días</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">85%</Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Activo</Badge>
                    </div>
                    <div className="text-center flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600">hace 2 días</span>
                    </div>
                    <div className="text-center">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* CV 2 */}
                  <div className="grid grid-cols-5 gap-4 py-4 items-center hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">CV - Data Analyst</div>
                        <div className="text-xs text-slate-500">Creado hace 12 días</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">92%</Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Activo</Badge>
                    </div>
                    <div className="text-center flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600">hace 8 días</span>
                    </div>
                    <div className="text-center">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* CV 3 */}
                  <div className="grid grid-cols-5 gap-4 py-4 items-center hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">CV - Product Manager</div>
                        <div className="text-xs text-slate-500">Creado hace 20 días</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">78%</Badge>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs">Borrador</Badge>
                    </div>
                    <div className="text-center flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600">hace 15 días</span>
                    </div>
                    <div className="text-center">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer pagination */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">Mostrando 1 a 3 de 3 CVs</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="text-slate-400">Anterior</Button>
                    <Button variant="outline" size="sm" disabled className="text-slate-400">Siguiente</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
