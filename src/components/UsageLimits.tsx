
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Zap, Crown } from "lucide-react";
import { useFeatureLimits } from "@/hooks/useFeatureLimits";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const UsageLimits = () => {
  const { limits, usage, userPlan, isLoading } = useFeatureLimits();
  const navigate = useNavigate();

  if (isLoading || !limits) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 999) return 25; // Para plan pro, mostrar barra baja
    return Math.min((used / limit) * 100, 100);
  };

  const features = [
    {
      key: 'cv_creation' as const,
      name: 'CVs Creados',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      key: 'pdf_export' as const,
      name: 'Exportaciones PDF',
      icon: Download,
      color: 'text-green-600'
    },
    {
      key: 'ai_improvements' as const,
      name: 'Mejoras con IA',
      icon: Zap,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uso Mensual</span>
          {userPlan === 'free' && (
            <Button 
              size="sm" 
              onClick={() => navigate('/app/profile')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            >
              <Crown className="h-4 w-4 mr-1" />
              Actualizar a Pro
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map(({ key, name, icon: Icon, color }) => {
          const used = usage[key];
          const limit = limits[key];
          const percentage = getUsagePercentage(used, limit);
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {used}/{limit === 999 ? '∞' : limit}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              {userPlan === 'free' && used >= limit && (
                <p className="text-xs text-red-600">
                  Has alcanzado tu límite mensual. Actualiza a Pro para uso ilimitado.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
