
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Zap, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PlanCardProps {
  currentPlan: string;
  isUpgrading: boolean;
  onUpgrade: () => void;
}

export const PlanCard = ({ currentPlan, isUpgrading, onUpgrade }: PlanCardProps) => {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  const handleCreateSubscription = async () => {
    setIsCreatingSubscription(true);
    
    try {
      console.log("Iniciando proceso de suscripción desde Profile...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Debes iniciar sesión para suscribirte");
        setIsCreatingSubscription(false);
        return;
      }

      console.log("Usuario autenticado, creando suscripción...");
      
      const { data, error } = await supabase.functions.invoke('create-mercadopago-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log("Respuesta de la función:", { data, error });

      if (error) {
        console.error('Error creating subscription:', error);
        toast.error(`Error al crear la suscripción: ${error.message}`);
        return;
      }

      if (data?.checkout_url) {
        console.log("Redirigiendo a:", data.checkout_url);
        toast.success("Redirigiendo a MercadoPago...");
        window.open(data.checkout_url, '_blank');
      } else {
        console.error("No checkout URL received:", data);
        toast.error("No se pudo obtener la URL de pago");
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error("Error inesperado al procesar la suscripción");
    } finally {
      setIsCreatingSubscription(false);
    }
  };

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
                    ? 'Acceso completo a todas las funciones premium'
                    : 'Actualiza a Pro para acceder a todas las funciones premium'
                  }
                </CardDescription>
              </div>
            </div>
            
            {currentPlan === 'free' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-600 mb-1">
                  $6.990 <span className="text-sm font-normal text-gray-500">CLP/mes</span>
                </div>
                <Button 
                  onClick={handleCreateSubscription}
                  disabled={isCreatingSubscription}
                  className="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800"
                >
                  {isCreatingSubscription ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Suscribirse a Pro
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {currentPlan === 'pro' && (
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Suscripción activa con MercadoPago</span>
              <span className="font-semibold text-brand-600">$6.990 CLP/mes</span>
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
                    1 CV optimizado con IA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    1 exportación PDF sin marca de agua
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    5 mejoras inteligentes al mes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Análisis ATS básico para pasar filtros
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-brand-50 to-purple-50 rounded-lg border border-brand-200">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Plan Pro</h3>
                  <Badge className="bg-brand-100 text-brand-700">Recomendado</Badge>
                </div>
                <div className="text-2xl font-bold">$6.990<span className="text-sm font-normal text-gray-500"> CLP/mes</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    CVs ilimitados con IA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Exportaciones ilimitadas en PDF y Word
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Job Matcher avanzado con recomendaciones precisas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Mejoras IA ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    Acceso a novedades antes que nadie
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateSubscription}
                  disabled={isCreatingSubscription}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800"
                >
                  {isCreatingSubscription ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Suscribirse a Pro
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
