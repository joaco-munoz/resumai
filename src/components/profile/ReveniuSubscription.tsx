import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, TestTube, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ReveniuSubscriptionProps {
  currentPlan: string;
  onPlanChange: (plan: string) => void;
}

interface SubscriptionStatus {
  subscription_tier: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  subscription: {
    status: string;
    current_period_end: string | null;
  } | null;
  benefits: {
    unlimited_cvs: boolean;
    unlimited_exports: boolean;
    unlimited_ai_improvements: boolean;
    job_matcher_advanced: boolean;
    premium_templates: boolean;
    priority_support: boolean;
  };
}

export const ReveniuSubscription = ({ currentPlan, onPlanChange }: ReveniuSubscriptionProps) => {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // Procesar parámetros de retorno de Reveniu
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    if (status === 'success') {
      setIsProcessingPayment(true);
      toast.success("¡Pago procesado exitosamente!", {
        description: "Tu suscripción Pro está siendo activada. Esto puede tomar unos minutos."
      });
      
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verificar el estado cada 3 segundos por 1 minuto
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkInterval = setInterval(async () => {
        attempts++;
        console.log(`Verificando estado de suscripción (intento ${attempts}/${maxAttempts})...`);
        
        await checkSubscriptionStatus();
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setIsProcessingPayment(false);
          toast.info("La activación está tomando más tiempo del esperado", {
            description: "Por favor, recarga la página en unos minutos o contacta soporte."
          });
        }
      }, 3000);

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(checkInterval);
    } else if (status === 'failed') {
      toast.error("Error en el procesamiento del pago", {
        description: "El pago no pudo ser procesado. Por favor, intenta nuevamente."
      });
      
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Verificar el estado cuando cambie subscriptionStatus
  useEffect(() => {
    if (subscriptionStatus?.is_premium && isProcessingPayment) {
      setIsProcessingPayment(false);
      toast.success("¡Suscripción Pro activada!", {
        description: "Ya tienes acceso a todas las funciones premium."
      });
      onPlanChange('pro');
    }
  }, [subscriptionStatus?.is_premium, isProcessingPayment, onPlanChange]);

  const checkSubscriptionStatus = async () => {
    try {
      console.log("🔍 Verificando estado de suscripción...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("❌ No hay sesión activa");
        setIsCheckingStatus(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        toast.error("Error al verificar el estado de la suscripción");
        setIsCheckingStatus(false);
        return;
      }

      console.log("📊 Estado de suscripción recibido:", data);
      setSubscriptionStatus(data);
      onPlanChange(data.is_premium ? 'pro' : 'free');
      
    } catch (error: any) {
      console.error('Subscription check error:', error);
      toast.error("Error al verificar la suscripción");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCreateSubscription = async () => {
    setIsCreatingSubscription(true);
    
    try {
      console.log("🚀 Iniciando proceso de suscripción Reveniu...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Debes iniciar sesión para suscribirte");
        setIsCreatingSubscription(false);
        return;
      }

      console.log("👤 Usuario autenticado, creando suscripción...");
      
      const { data, error } = await supabase.functions.invoke('create-reveniu-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription error:', error);
        toast.error(`Error al crear la suscripción: ${error.message}`);
        setIsCreatingSubscription(false);
        return;
      }

      if (data?.checkout_url) {
        console.log("🔗 Redirigiendo a:", data.checkout_url);
        setIsTestMode(data.test_mode || false);
        
        if (data.test_mode) {
          toast.success("🧪 Redirigiendo a Reveniu (Modo Prueba)", {
            description: "Usa las tarjetas de prueba de Transbank"
          });
        } else {
          toast.success("Redirigiendo a Reveniu para procesar suscripción...");
        }
        
        // Añadir un pequeño delay para que el usuario vea el mensaje
        setTimeout(() => {
          window.location.href = data.checkout_url;
        }, 1500);
      } else {
        toast.error("No se pudo obtener la URL de pago");
        setIsCreatingSubscription(false);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error("Error inesperado al procesar la suscripción");
      setIsCreatingSubscription(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando estado de suscripción...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPro = subscriptionStatus?.is_premium || false;

  return (
    <>
      {/* Modo de Prueba */}
      {isTestMode && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <TestTube className="h-4 w-4" />
              <span className="text-sm font-medium">
                Modo de Prueba Activo - Usar tarjetas de prueba de Transbank
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Procesando Pago */}
      {isProcessingPayment && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                Procesando pago y activando suscripción...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Actual */}
      <Card className={`${isPro ? 'border-2 border-brand-500' : ''} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPro ? 'bg-brand-100 dark:bg-brand-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {isPro ? (
                  <Crown className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                ) : (
                  <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plan {isPro ? 'Pro' : 'Gratuito'}
                  {isPro && (
                    <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">Activo</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isPro 
                    ? 'Suscripción mensual activa con Reveniu'
                    : 'Suscríbete para acceder a todas las funciones premium'
                  }
                </CardDescription>
              </div>
            </div>
            
            {!isPro && (
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400 mb-1">
                  $6.990 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">CLP/mes</span>
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
        {isPro && (
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Suscripción activa con Reveniu</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">$6.990 CLP/mes</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Comparación de Planes */}
      {!isPro && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Desbloquea Todo el Potencial</CardTitle>
            <CardDescription>
              Compara los beneficios del plan Pro vs Gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Plan Gratuito */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plan Gratuito</h3>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Actual</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$0<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mes</span></div>
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

              {/* Plan Pro */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-lg border border-brand-200 dark:border-brand-700">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plan Pro</h3>
                  <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">Recomendado</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$6.990<span className="text-sm font-normal text-gray-500 dark:text-gray-400"> CLP/mes</span></div>
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

      {/* Tarjetas de Prueba */}
      {isTestMode && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Tarjetas de Prueba - Transbank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
              <div><strong>✅ Para aprobar (Crédito):</strong></div>
              <div>• <strong>Número:</strong> 4051 8856 0044 6623</div>
              <div>• <strong>CVV:</strong> 123 | <strong>Fecha:</strong> 11/25</div>
              
              <div className="mt-4"><strong>✅ Para aprobar (Débito):</strong></div>
              <div>• <strong>Número:</strong> 4051 8842 3993 7763</div>
              <div>• <strong>RUT:</strong> 11.111.111-1 | <strong>Contraseña:</strong> 123</div>
              
              <div className="mt-4"><strong>❌ Para rechazar:</strong></div>
              <div>• <strong>Crédito:</strong> 5186 0595 5959 0568</div>
              <div>• <strong>Débito:</strong> 5186 0085 4123 3829</div>
              
              <div className="mt-4 text-blue-600 dark:text-blue-400"><strong>💡 Importante:</strong> Usa una cuenta de prueba en Sandbox de Reveniu</div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};