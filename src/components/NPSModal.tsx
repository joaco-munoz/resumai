
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NPSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NPSModal = ({ isOpen, onClose }: NPSModalProps) => {
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreSelect = (selectedScore: number) => {
    setScore(selectedScore);
  };

  const handleSubmit = async () => {
    if (!user || score === null) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('nps_responses')
        .insert([{
          user_id: user.id,
          score,
          feedback: feedback.trim() || null
        }]);

      if (error) throw error;

      toast.success("¡Gracias por tu feedback!");
      onClose();
      setScore(null);
      setFeedback("");
    } catch (error) {
      console.error('Error submitting NPS:', error);
      toast.error("Error al enviar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreLabel = () => {
    if (score === null) return "";
    if (score <= 6) return "Necesitamos mejorar";
    if (score <= 8) return "¡Bien! Pero podemos ser mejores";
    return "¡Excelente! Nos alegra saberlo";
  };

  const getScoreColor = () => {
    if (score === null) return "";
    if (score <= 6) return "text-red-500";
    if (score <= 8) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            ¿Cómo ha sido tu experiencia?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              En una escala del 0 al 10, ¿qué tan probable es que recomiendes ResumAI?
            </p>
            
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(11)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleScoreSelect(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    score === index
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {index}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>Nada probable</span>
              <span>Muy probable</span>
            </div>
            
            {score !== null && (
              <p className={`text-sm font-medium mt-2 ${getScoreColor()}`}>
                {getScoreLabel()}
              </p>
            )}
          </div>

          {score !== null && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                ¿Hay algo específico que te gustaría compartir? (opcional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Comparte tu experiencia o sugerencias..."
                className="resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={score === null || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
