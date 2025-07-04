
import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, Target, TrendingUp, FileText, BarChart3 } from "lucide-react";

export const DashboardPreviewSection = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-slate-900 to-blue-900">
      <div className="container mx-auto px-4">
        {/* Main dashboard mockup */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
            {/* Dashboard header */}
            <div className="bg-slate-900 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">ResumAI</h2>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Crear CV Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Crear CV</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
                    <p className="text-slate-600 mb-4">CV creados</p>
                    
                    <Button className="w-full mb-4 bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo CV
                    </Button>

                    <div className="bg-slate-50 rounded-lg p-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">CV - Desarrollador Frontend</span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Match de Ofertas Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Match de Ofertas</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          C
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-700">Analista de Datos</div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">86%</Badge>
                      </div>

                      <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          AX
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-700">Diseñador UX</div>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">76%</Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Haz tu Match
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seguimiento Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Seguimiento de Postulaciones</h3>
                    <div className="text-4xl font-bold text-cyan-600 mb-2">65%</div>
                    <p className="text-slate-600 mb-4">tase de respuesta</p>

                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-700">Desarrollador web</div>
                          <div className="text-xs text-green-600 font-medium">En entrevista</div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Ver Estadísticas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to action */}
            <div className="text-center mt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg"
              >
                Regístrate y mejora tu búsqueda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

DashboardPreviewSection.displayName = "DashboardPreviewSection";
