import { Sparkles, Target, FileText } from "lucide-react";
import { Feature, FAQ } from "@/types/landing";

export const features: Feature[] = [
  {
    icon: <Sparkles className="h-8 w-8 text-blue-400" />,
    title: "Impulso con IA",
    description: "Describe tu rol; nuestra IA añade logros medibles, verbos de impacto y palabras clave que enamoran a los reclutadores."
  },
  {
    icon: <Target className="h-8 w-8 text-cyan-400" />,
    title: "Optimización ATS Avanzada",
    description: "Palabras clave y formato afinados para atravesar los filtros de los principales rastreadores de talento."
  },
  {
    icon: <FileText className="h-8 w-8 text-blue-400" />,
    title: "Exportación 1 click",
    description: "Descarga al instante en PDF y Word para postular en portales, compartir por correo o integrar con tu propio sistema."
  }
];

export const faqItems: FAQ[] = [
  {
    question: "¿Cómo funciona el optimizador ATS?",
    answer: "Transformamos tu CV en el formato que el algoritmo ATS entiende y prioriza, acercándote directo al reclutador."
  },
  {
    question: "¿Puedo usar mi propio contenido?",
    answer: "Tu experiencia se mantiene; la IA solo la hace brillar."
  },
  {
    question: "¿Qué incluye el plan Pro?",
    answer: "Todo lo que necesitas para destacar: CVs ilimitados con IA, exportaciones sin tope, análisis de compatibilidad preciso, plantillas premium y soporte prioritario."
  }
];
