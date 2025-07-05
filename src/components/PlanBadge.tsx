
import { Badge } from "@/components/ui/badge";
import { Crown, Zap } from "lucide-react";

interface PlanBadgeProps {
  plan: string;
  className?: string;
}

export const PlanBadge = ({ plan, className = "" }: PlanBadgeProps) => {
  if (plan === 'pro') {
    return (
      <Badge 
        className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold ${className}`}
      >
        <Crown className="h-3 w-3 mr-1" />
        ResumAI Pro
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`border-gray-300 text-gray-600 ${className}`}
    >
      <Zap className="h-3 w-3 mr-1" />
      Plan Gratuito
    </Badge>
  );
};
