
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface MercadoPagoSubscriptionProps {
  currentPlan: string;
  onPlanChange: (plan: string) => void;
}

interface SubscriptionStatus {
  subscription_tier: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  benefits: {
    unlimited_cvs: boolean;
    unlimited_exports: boolean;
    unlimited_ai_improvements: boolean;
    job_matcher_advanced: boolean;
    premium_templates: boolean;
    priority_support: boolean;
  };
}

export const MercadoPagoSubscription = ({ currentPlan, onPlanChange }: MercadoPagoSubscriptionProps) => {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Verificar estado de suscripción al cargar
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // Procesar parámetros de retorno de MercadoPago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const preapprovalId = urlParams.get('preapproval_id');
    const errorMessage = urlParams.get('error_message');

    if (status && preapprovalId) {
      console.log('Processing MP return parameters:', { status, preapprovalId });
      handlePaymentResult(status, preapprovalId);
      
      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (errorMessage) {
      // Manejar errores específicos de MercadoPago
      console.log('MercadoPago error:', errorMessage);
      
      if (errorMessage.includes('prueba')) {
        toast.error(
          "Error: Estás mezclando entornos de prueba y producción. " +
          "Asegúrate de usar un token de prueba (TEST-) y cuentas de prueba específicas. " +
          "Consulta la documentación de MercadoPago para tarjetas de prueba."
        );
      } else {
        toast.error(`Error de MercadoPago: ${errorMessage}`);
      }
      
      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handlePaymentResult = async (status: string, preapprovalId: string) => {
    setIsProcessingPayment(true);
    
    if (status === 'authorized') {
      toast.success("¡Pago autorizado! Verificando activación de tu Plan Pro...");
      
      // Esperar un poco para que el webhook procese
      setTimeout(async () => {
        await checkSubscriptionStatus();
        toast.success("¡Plan Pro activado exitosamente!");
        // Recargar la página para asegurar que todo se actualice
        setTimeout(() => window.location.reload(), 2000);
      }, 3000);
      
    } else if (status === 'cancelled') {
      // Verificar si hay mensaje específico en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const errorMessage = urlParams.get('error_message');
      
      if (errorMessage?.includes('mismo')) {
        toast.error("Error: No puedes pagarte a ti mismo. Para pruebas, debes usar una cuenta de comprador diferente a la cuenta de vendedor.");
      } else {
        toast.error("Pago cancelado");
      }
      setIsProcessingPayment(false);
    } else if (status === 'pending') {
      toast.info("Pago pendiente de confirmación");
      setIsProcessingPayment(false);
    } else {
      toast.error("Error en el procesamiento del pago");
      setIsProcessingPayment(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    setIsCheckingStatus(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsCheckingStatus(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription status:', error);
        toast.error("Error al verificar el estado de la suscripción");
        return;
      }

      if (data) {
        setSubscriptionStatus(data);
        onPlanChange(data.subscription_tier);
        console.log("Subscription status:", data);
      }
    } catch (error: any) {
      console.error('Subscription status error:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCreateSubscription = async () => {
    setIsCreatingSubscription(true);
    
    try {
      console.log("Iniciando proceso de suscripción...");
      
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
        body: {
          user_id: session.user.id,
          email: session.user.email
        }
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
        // Abrir en la misma ventana para mejor UX
        window.location.href = data.checkout_url;
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

  if (isCheckingStatus || isProcessingPayment) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {isProcessingPayment 
                ? "Procesando pago y activando Plan Pro..." 
                : "Verificando estado de suscripción..."
              }
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPro = subscriptionStatus?.subscription_tier === 'pro';
  const benefits = subscriptionStatus?.benefits;

  return (
    <div className="space-y-6">
      <Card className={isPro ? 'border-2 border-brand-500' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPro ? 'bg-brand-100' : 'bg-gray-100'}`}>
                {isPro ? (
                  <Crown className="h-6 w-6 text-brand-600" />
                ) : (
                  <CreditCard className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plan {isPro ? 'Pro' : 'Gratuito'}
                  {isPro && (
                    <Badge className="bg-brand-100 text-brand-700">Activo</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isPro 
                    ? 'Acceso completo a todas las funciones premium'
                    : 'Actualiza a Pro para acceder a todas las funciones premium'
                  }
                </CardDescription>
              </div>
            </div>
            
            {!isPro && (
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
        
        {isPro && subscriptionStatus?.premium_expires_at && (
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Suscripción activa con MercadoPago</span>
              <span className="font-semibold text-brand-600">
                Próxima renovación: {new Date(subscriptionStatus.premium_expires_at).toLocaleDateString('es-ES')}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Benefits Card */}
      {benefits && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Beneficios de tu Plan</CardTitle>
            <CardDescription>
              {isPro ? 'Disfruta de todos estos beneficios premium' : 'Estos beneficios se activarán con el Plan Pro'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                {benefits.unlimited_cvs ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={benefits.unlimited_cvs ? 'text-green-700' : 'text-gray-500'}>
                  CVs ilimitados
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {benefits.unlimited_exports ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={benefits.unlimited_exports ? 'text-green-700' : 'text-gray-500'}>
                  Exportaciones ilimitadas
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {benefits.unlimited_ai_improvements ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={benefits.unlimited_ai_improvements ? 'text-green-700' : 'text-gray-500'}>
                  Mejoras IA ilimitadas
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {benefits.job_matcher_advanced ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={benefits.job_matcher_advanced ? 'text-green-700' : 'text-gray-500'}>
                  Job Matcher avanzado
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {benefits.premium_templates ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={benefits.premium_templates ? 'text-green-700' : 'text-gray-500'}>
                  Plantillas premium
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {benefits.priority_support ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={benefits.priority_support ? 'text-green-700' : 'text-gray-500'}>
                  Soporte prioritario
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Status Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={checkSubscriptionStatus}
          disabled={isCheckingStatus}
          className="text-sm"
        >
          {isCheckingStatus ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            'Actualizar Estado'
          )}
        </Button>
      </div>
    </div>
  );
};
