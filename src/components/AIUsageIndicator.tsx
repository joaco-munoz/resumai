
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "lucide-react";
import { useAIUsage } from "@/contexts/AIUsageContext";

interface AIUsageIndicatorProps {
  current: number;
  limit: number;
  type: 'ai_improvements' | 'job_matcher_advanced';
  isPro: boolean;
}

export const AIUsageIndicator = ({ current, limit, type, isPro }: AIUsageIndicatorProps) => {
  // Usar el contexto para obtener el valor animado
  const { animatedUsage } = useAIUsage();
  // Obtener el valor animado según el tipo
  const animatedCurrent = type === 'ai_improvements' ? animatedUsage.ai_improvements : animatedUsage.job_matcher_advanced;
  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-xs text-brand-600">
        <Crown className="h-3 w-3" />
        <span className="font-medium">Ilimitado</span>
      </div>
    );
  }

  const percentage = (animatedCurrent / limit) * 100;
  const remaining = Math.max(0, limit - animatedCurrent);
  
  const getColorClass = () => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const typeLabel = type === 'ai_improvements' ? 'Mejoras IA' : 'Análisis de Ofertas';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-brand-500" />
          <span className="text-xs font-medium text-gray-700">{typeLabel}</span>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gray-100 border ${percentage >= 80 ? 'border-' + (percentage >= 100 ? 'red' : 'yellow') + '-300' : 'border-green-300'} flex items-center`}>
          <span className={`text-xs font-medium ${getColorClass()}`}>{remaining}</span>
          <span className="text-xs text-gray-600 ml-1">restantes</span>
        </div>
      </div>
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-2"
        />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-center">
        {animatedCurrent} de {limit} usados este mes
      </div>
    </div>
  );
};
