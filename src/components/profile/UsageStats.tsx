
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Zap } from "lucide-react";

interface UsageData {
  cvs: { used: number; limit: number };
  exports: { used: number; limit: number };
  aiImprovements: { used: number; limit: number };
}

interface UsageStatsProps {
  usageStats: UsageData;
  getUsagePercentage: (used: number, limit: number) => number;
}

export const UsageStats = ({ usageStats, getUsagePercentage }: UsageStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CVs Creados
            </CardTitle>
            <span className="text-xs text-gray-500">
              {usageStats.cvs.used}/{usageStats.cvs.limit === 999 ? '∞' : usageStats.cvs.limit}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={getUsagePercentage(usageStats.cvs.used, usageStats.cvs.limit)}
            className="h-2 mb-2"
          />
          <p className="text-xs text-gray-600">
            {usageStats.cvs.limit === 999 
              ? 'Ilimitados' 
              : `${Math.max(0, usageStats.cvs.limit - usageStats.cvs.used)} restantes este mes`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportaciones
            </CardTitle>
            <span className="text-xs text-gray-500">
              {usageStats.exports.used}/{usageStats.exports.limit === 999 ? '∞' : usageStats.exports.limit}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={getUsagePercentage(usageStats.exports.used, usageStats.exports.limit)}
            className="h-2 mb-2"
          />
          <p className="text-xs text-gray-600">
            {usageStats.exports.limit === 999 
              ? 'Ilimitadas' 
              : `${Math.max(0, usageStats.exports.limit - usageStats.exports.used)} restantes este mes`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Mejoras con IA
            </CardTitle>
            <span className="text-xs text-gray-500">
              {usageStats.aiImprovements.used}/{usageStats.aiImprovements.limit === 999 ? '∞' : usageStats.aiImprovements.limit}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={getUsagePercentage(usageStats.aiImprovements.used, usageStats.aiImprovements.limit)}
            className="h-2 mb-2"
          />
          <p className="text-xs text-gray-600">
            {usageStats.aiImprovements.limit === 999 
              ? 'Ilimitadas' 
              : `${Math.max(0, usageStats.aiImprovements.limit - usageStats.aiImprovements.used)} restantes este mes`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
