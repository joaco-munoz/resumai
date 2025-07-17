import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useAnimation, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, Target, TrendingUp, BarChart3 } from "lucide-react";
import "./rolling-gallery.css";

// Componentes de las cards individuales
const CrearCVCard = () => (
  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
    <CardContent className="p-4 sm:p-6">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">Crear CV</h3>
        <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">12</div>
        <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">CV creados</p>
        
        <div className="w-full mb-3 sm:mb-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo CV
        </div>

        <div className="bg-slate-50 rounded-lg p-2 sm:p-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-700">CV - Desarrollador Frontend</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MatchOfertasCard = () => (
  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
    <CardContent className="p-4 sm:p-6">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">Match de Ofertas</h3>
        
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 bg-green-50 rounded-lg p-2 sm:p-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              C
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs sm:text-sm font-medium text-slate-700">Analista de Datos</div>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs sm:text-sm px-1.5 sm:px-2">86%</Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-orange-50 rounded-lg p-2 sm:p-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              AX
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs sm:text-sm font-medium text-slate-700">Diseñador UX</div>
            </div>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs sm:text-sm px-1.5 sm:px-2">76%</Badge>
          </div>
        </div>

        <div className="w-full border border-slate-200 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center justify-center text-slate-600">
          <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Has tu Match
        </div>
      </div>
    </CardContent>
  </Card>
);

const SeguimientoCard = () => (
  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
    <CardContent className="p-4 sm:p-6">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">Seguimiento de Postulaciones</h3>
        <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-1 sm:mb-2">65%</div>
        <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">Tasa de respuesta</p>

        <div className="bg-slate-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded flex items-center justify-center">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs sm:text-sm font-medium text-slate-700">Desarrollador web</div>
              <div className="text-xs text-green-600 font-medium">En entrevista</div>
            </div>
          </div>
        </div>

        <div className="w-full border border-slate-200 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium flex items-center justify-center text-slate-600">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Ver Estadísticas
        </div>
      </div>
    </CardContent>
  </Card>
);

// Array de componentes de cards
const DASHBOARD_CARDS = [
  { component: CrearCVCard, key: "crear-cv" },
  { component: MatchOfertasCard, key: "match-ofertas" },
  { component: SeguimientoCard, key: "seguimiento" }
];

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
}

const RollingGallery = ({ autoplay = false, pauseOnHover = false }: RollingGalleryProps) => {
  const [isScreenSizeSm, setIsScreenSizeSm] = useState(window.innerWidth <= 640);

  const cylinderWidth = isScreenSizeSm ? 100 : 800;
  const faceCount = DASHBOARD_CARDS.length;
  const faceWidth = (cylinderWidth / faceCount) * 1.8;
  const radius = cylinderWidth / (2 * Math.PI);

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setRotation((prev) => prev + faceCount);
    }, 100);

    return () => clearInterval(interval);
  }, [autoplay, faceCount]);

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSizeSm(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="gallery-container">
      <div className="gallery-content">
        <motion.div
          className="gallery-track"
          animate={{
            rotateY: rotation,
          }}
          transition={{
            duration: 0.9,
            ease: "easeInOut",
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {DASHBOARD_CARDS.map((card, i) => {
            const CardComponent = card.component;
            return (
              <div
                key={card.key}
                className="gallery-item"
                style={{
                  width: `${faceWidth}px`,
                  transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
                }}
              >
                <div className="gallery-card">
                  <CardComponent />
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;
