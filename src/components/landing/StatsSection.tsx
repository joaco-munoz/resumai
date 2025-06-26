import { Badge } from "@/components/ui/badge";
import { forwardRef } from "react";
import { CheckCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export const StatsSection = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <section id="match-de-ofertas" ref={ref} className="py-24 bg-blue-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Left Side: Text Content */}
          <div className="lg:w-1/3 text-center lg:text-left">
            <h2 className="text-5xl font-bold text-white mb-6">Haz match <br />con la oferta ideal.</h2>
            <p className="text-lg text-blue-100 mb-8">
              Pega la descripción del trabajo y obtén un análisis instantáneo: porcentaje de coincidencia, keywords faltantes y fortalezas detectadas para optimizar tu CV.
            </p>
            <ul className="space-y-4 text-blue-100 text-left">
              <li className="flex items-start">
                <CheckCircle className="text-cyan-300 mr-3 mt-1 flex-shrink-0" size={20} />
                <span><strong>Análisis de Keywords:</strong> Identifica las palabras clave que no pueden faltar en tu CV.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-cyan-300 mr-3 mt-1 flex-shrink-0" size={20} />
                <span><strong>Sugerencias de Optimización:</strong> Recibe recomendaciones para mejorar el impacto de tu perfil.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-cyan-300 mr-3 mt-1 flex-shrink-0" size={20} />
                <span><strong>Aumento de Compatibilidad:</strong> Incrementa tus posibilidades de superar los filtros de selección (ATS).</span>
              </li>
            </ul>
          </div>
          
          {/* Right Side: Visual Display */}
          <div className="lg:w-1/2">
            <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-blue-200/20 max-w-lg mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-xl text-blue-950">Análisis de Compatibilidad</h4>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">Data Analyst</Badge>
              </div>

              {/* Compatibility Score & Progress Bar */}
              <div className="text-center my-6">
                <p className="text-slate-500 mb-2 text-sm">Compatibilidad General</p>
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-blue-100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-blue-600"
                      strokeDasharray="87, 100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-blue-900">87%</span>
                  </div>
                </div>
              </div>
              
              {/* Strengths */}
              <div className="mb-6">
                <h5 className="font-semibold text-blue-950 mb-3 flex items-center"><CheckCircle2 className="text-green-500 mr-2" size={20} /> Fortalezas Detectadas</h5>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center text-sm"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} /> Experiencia en SQL y bases de datos relacionales.</li>
                  <li className="flex items-center text-sm"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} /> Conocimientos avanzados en Python para análisis.</li>
                  <li className="flex items-center text-sm"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={16} /> Colaboración con equipos multidisciplinarios.</li>
                </ul>
              </div>

              {/* Missing Keywords */}
              <div>
                <h5 className="font-semibold text-blue-950 mb-3 flex items-center"><AlertCircle className="text-amber-500 mr-2" size={20} /> Keywords Faltantes</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50/80">Power BI</Badge>
                  <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50/80">Tableau</Badge>
                  <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50/80">KPIs</Badge>
                  <Badge variant="outline" className="text-amber-800 border-amber-300 bg-amber-50/80">Dashboards</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = "StatsSection";
