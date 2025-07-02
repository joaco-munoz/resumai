import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Zap, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanCardProps {
  currentPlan: string;
  isUpgrading: boolean;
  onUpgrade: () => void;
}

export const PlanCard = ({ currentPlan, isUpgrading, onUpgrade }: PlanCardProps) => {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const isMobile = useIsMobile();

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

      console.log("Usuario autenticado, redirigiendo a Reveniu...");
      toast.success("Redirigiendo a Reveniu...");
      
      // Obtener el ID del usuario para incluirlo como parámetro en la URL
      const userId = session.user.id;
      
      // Usar la función de Reveniu en lugar del link directo
      const { data, error } = await supabase.functions.invoke('create-reveniu-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription error:', error);
        toast.error(`Error al crear la suscripción: ${error.message}`);
        return;
      }

      if (data?.checkout_url) {
        toast.success("Redirigiendo a Reveniu...");
        setTimeout(() => {
          window.location.href = data.checkout_url;
        }, 1500);
      } else {
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
      <Card className={`${currentPlan === 'pro' ? 'border-2 border-brand-500' : ''} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
        <CardHeader>
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentPlan === 'pro' ? 'bg-brand-100 dark:bg-brand-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {currentPlan === 'pro' ? (
                  <Crown className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                ) : (
                  <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  Plan {currentPlan === 'pro' ? 'Pro' : 'Gratuito'}
                  {currentPlan === 'pro' && (
                    <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">Activo</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {currentPlan === 'pro' 
                    ? 'Acceso completo a todas las funciones premium'
                    : 'Actualiza a Pro para acceder a todas las funciones premium'
                  }
                </CardDescription>
              </div>
            </div>
            
            {currentPlan === 'free' && (
              <div className={`${isMobile ? 'w-full' : 'text-right'}`}>
                <div className="text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400 mb-1">
                  $6.990 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">CLP/mes</span>
                </div>
                <Button 
                  onClick={handleCreateSubscription}
                  disabled={isCreatingSubscription}
                  className={`bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 ${isMobile ? 'w-full' : ''}`}
                  size={isMobile ? "default" : "default"}
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
              <span className="text-gray-600 dark:text-gray-300">Suscripción activa con Reveniu</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">$6.990 CLP/mes</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plan Comparison */}
      {currentPlan === 'free' && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Desbloquea Todo el Potencial</CardTitle>
            <CardDescription className="text-sm">
              Compara los beneficios del plan Pro vs Gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Free Plan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Plan Gratuito</h3>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Actual</Badge>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">$0<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mes</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">1 CV optimizado con IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">1 exportación PDF sin marca de agua</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">5 mejoras inteligentes al mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Análisis ATS básico para pasar filtros</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-lg border border-brand-200 dark:border-brand-700">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Plan Pro</h3>
                  <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">Recomendado</Badge>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">$6.990<span className="text-sm font-normal text-gray-500 dark:text-gray-400"> CLP/mes</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">CVs ilimitados con IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Exportaciones ilimitadas en PDF y Word</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Job Matcher avanzado con recomendaciones precisas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Mejoras IA ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Acceso a novedades antes que nadie</span>
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
