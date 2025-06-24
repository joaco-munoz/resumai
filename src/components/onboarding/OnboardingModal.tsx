
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Sparkles, FileText, Target, CheckCircle } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "¡Bienvenido a ResumAI!",
    description: "La plataforma de inteligencia artificial que revoluciona la creación de currículums y la búsqueda de empleo.",
    icon: Sparkles,
    image: "photo-1649972904349-6e44c42644a7",
    color: "from-brand-500 to-brand-700"
  },
  {
    id: 2,
    title: "Crea currículums profesionales",
    description: "Utiliza nuestro editor inteligente para crear currículums optimizados con IA que destacan tus fortalezas.",
    icon: FileText,
    image: "photo-1488590528505-98d2b5aba04b",
    color: "from-blue-500 to-blue-700"
  },
  {
    id: 3,
    title: "Match inteligente con ofertas",
    description: "Adapta automáticamente tu currículum a cada oferta de trabajo usando nuestra IA avanzada.",
    icon: Target,
    image: "photo-1461749280684-dccba630e2f6",
    color: "from-green-500 to-green-700"
  },
  {
    id: 4,
    title: "Gestiona tus postulaciones",
    description: "Organiza y da seguimiento a todas tus postulaciones en un tablero Kanban intuitivo.",
    icon: CheckCircle,
    image: "photo-1581091226825-a6a2a5aee158",
    color: "from-purple-500 to-purple-700"
  }
];

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            {/* Left side - Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center mb-6`}>
                <currentStepData.icon className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentStepData.title}
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Step indicators */}
              <div className="flex space-x-2 mb-8">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-brand-500 scale-110' 
                        : index < currentStep 
                          ? 'bg-brand-300' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {currentStep === onboardingSteps.length - 1 ? (
                  <Button
                    onClick={handleFinish}
                    className="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 flex items-center gap-2"
                  >
                    ¡Comenzar!
                    <Sparkles className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 flex items-center gap-2"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative overflow-hidden">
              <img
                src={`https://images.unsplash.com/${currentStepData.image}?fm=jpg&w=800&h=600&fit=crop`}
                alt={currentStepData.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${currentStepData.color} opacity-20`} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
