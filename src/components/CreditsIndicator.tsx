import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Plus } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

interface CreditsIndicatorProps {
  className?: string;
  showPurchaseButton?: boolean;
}

export const CreditsIndicator = ({ className = "", showPurchaseButton = true }: CreditsIndicatorProps) => {
  const { credits, isPro, isLoading, createFlowPayment } = useCredits();

  const handlePurchaseCredits = async () => {
    const result = await createFlowPayment();
    if (result.success && result.paymentUrl) {
      window.location.href = result.paymentUrl;
    } else {
      console.error('Error creating payment:', result.error);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className={`flex items-center gap-2 text-brand-600 ${className}`}>
        <Crown className="h-4 w-4" />
        <span className="font-medium text-sm">Ilimitado</span>
      </div>
    );
  }

  const getColorClass = () => {
    if (credits.available_credits === 0) return 'text-red-600 border-red-300 bg-red-50';
    if (credits.available_credits <= 5) return 'text-yellow-600 border-yellow-300 bg-yellow-50';
    return 'text-green-600 border-green-300 bg-green-50';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-brand-500" />
        <Badge 
          variant="outline" 
          className={`px-3 py-1 font-medium ${getColorClass()}`}
        >
          {credits.available_credits} créditos
        </Badge>
      </div>
      
      {showPurchaseButton && credits.available_credits <= 10 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handlePurchaseCredits}
          className="text-xs px-2 py-1 h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          Comprar
        </Button>
      )}
    </div>
  );
};
