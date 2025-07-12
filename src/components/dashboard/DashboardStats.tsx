import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Send, Calendar, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    cvsCreated: number;
    applications: number;
    interviews: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  // Calculate response rate: interviews / (interviews + applications) * 100
  // Show '— %' only if there are no applications AND no interviews
  const totalOpportunities = stats.applications + stats.interviews;
  const responseRate = totalOpportunities > 0
    ? Math.round((stats.interviews / totalOpportunities) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Currículums Creados</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-600">{stats.cvsCreated}</div>
          <p className="text-xs text-muted-foreground">Total de currículums</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Postulaciones</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success-600">{stats.applications}</div>
          <p className="text-xs text-muted-foreground">Postulaciones enviadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entrevistas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.interviews}</div>
          <p className="text-xs text-muted-foreground">Entrevistas conseguidas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-600">{totalOpportunities > 0 ? `${responseRate}%` : '— %'}</div>
          <p className="text-xs text-muted-foreground">Respuestas positivas</p>
        </CardContent>
      </Card>
    </div>
  );
};
