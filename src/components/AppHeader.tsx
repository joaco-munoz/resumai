import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import Logo from "@/assets/Favicon.png";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export function AppHeader() {
  const { user } = useAuth();
  const { isPremium, isLoading: statusLoading } = useSubscriptionStatus();

  if (!user) return null;

  return (
    <div className="fixed top-0 right-0 z-50 p-4">
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
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
}
