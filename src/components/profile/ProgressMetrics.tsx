
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, Zap, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  cvsCreated: number;
  applications: number;
  interviews: number;
}

interface ProgressMetricsProps {
  stats: StatsData;
  currentPlan: string;
}

export const ProgressMetrics = ({ stats, currentPlan }: ProgressMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success-500" />
            Tu Progreso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">CVs enviados</span>
            <span className="font-bold text-brand-600">{stats.applications}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Respuestas recibidas</span>
            <span className="font-bold text-success-600">{Math.floor(stats.applications * 0.67)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Entrevistas conseguidas</span>
            <span className="font-bold text-yellow-600">{stats.interviews}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tasa de respuesta</span>
            <span className="font-bold text-brand-600">
              {stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas Ayuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Nuestro equipo está aquí para ayudarte a maximizar tus resultados.
          </p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Centro de Ayuda
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Zap className="h-4 w-4 mr-2" />
              Contactar Soporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History for Pro users */}
      {currentPlan === 'pro' && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de Facturación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Plan Pro - Enero 2024</p>
                  <p className="text-sm text-gray-500">Facturado el 15 de Enero, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.00</p>
                  <Badge variant="secondary">Pagado</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Plan Pro - Diciembre 2023</p>
                  <p className="text-sm text-gray-500">Facturado el 15 de Diciembre, 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.00</p>
                  <Badge variant="secondary">Pagado</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
