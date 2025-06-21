
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Zap, CheckCircle } from "lucide-react";

interface PlanCardProps {
  currentPlan: string;
  isUpgrading: boolean;
  onUpgrade: () => void;
}

export const PlanCard = ({ currentPlan, isUpgrading, onUpgrade }: PlanCardProps) => {
  return (
    <>
      {/* Current Plan */}
      <Card className={currentPlan === 'pro' ? 'border-2 border-brand-500' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentPlan === 'pro' ? 'bg-brand-100' : 'bg-gray-100'}`}>
                {currentPlan === 'pro' ? (
                  <Crown className="h-6 w-6 text-brand-600" />
                ) : (
                  <CreditCard className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plan {currentPlan === 'pro' ? 'Pro' : 'Gratuito'}
                  {currentPlan === 'pro' && (
                    <Badge className="bg-brand-100 text-brand-700">Activo</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentPlan === 'pro' 
                    ? 'Acceso completo a todas las funciones'
                    : 'Perfecto para empezar con CVMaster AI'
                  }
                </CardDescription>
              </div>
            </div>
            
            {currentPlan === 'free' && (
              <Button 
                onClick={onUpgrade}
                disabled={isUpgrading}
                className="bg-gradient-to-r from-brand-500 to-brand-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isUpgrading ? 'Procesando...' : 'Actualizar a Pro'}
              </Button>
            )}
          </div>
        </CardHeader>
        {currentPlan === 'pro' && (
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Próxima facturación: 15 de Febrero, 2024</span>
              <span>$29.00 USD/mes</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plan Comparison */}
      {currentPlan === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Desbloquea Todo el Potencial</CardTitle>
            <CardDescription>
              Compara los beneficios del plan Pro vs Gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Plan Gratuito</h3>
                  <Badge variant="secondary">Actual</Badge>
                </div>
                <div className="text-2xl font-bold">$0<span className="text-sm font-normal text-gray-500">/mes</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    1 CV con IA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    1 exportación PDF gratis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    5 mejoras con IA/mes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Análisis básico ATS
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-brand-50 to-purple-50 rounded-lg border border-brand-200">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Plan Pro</h3>
                  <Badge className="bg-brand-100 text-brand-700">Recomendado</Badge>
                </div>
                <div className="text-2xl font-bold">$29<span className="text-sm font-normal text-gray-500">/mes</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    CVs ilimitados con IA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Exportaciones ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    DOCX y JSON export
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Job Matcher avanzado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Mejoras IA ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Plantillas premium
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Soporte prioritario
                  </li>
                </ul>
                <Button 
                  onClick={onUpgrade}
                  disabled={isUpgrading}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {isUpgrading ? 'Procesando...' : 'Actualizar a Pro'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
