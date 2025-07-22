
import { memo } from "react";
import Logo from "@/assets/Favicon.png";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const HeaderBrand = memo(() => {
  const { isPremium, isLoading: statusLoading } = useSubscriptionStatus();

  return (
    <div className="fixed top-4 right-6 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
      <div className="flex items-center gap-2">
        <img src={Logo} alt="ResumAI logo" className="h-8 w-8" />
        <div className="flex flex-col">
          <span className="font-bold text-lg gradient-text">ResumAI</span>
          {!statusLoading && (
            <Badge 
              variant={isPremium ? "default" : "secondary"} 
              className={`text-xs mt-1 ${
                isPremium 
                  ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {isPremium ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Plan Pro
                </>
              ) : (
                "Plan Gratuito"
              )}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

HeaderBrand.displayName = "HeaderBrand";

export default HeaderBrand;
