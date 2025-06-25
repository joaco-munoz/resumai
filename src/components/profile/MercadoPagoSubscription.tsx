
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MercadoPagoSubscriptionProps {
  currentPlan: string;
  onPlanChange: (plan: string) => void;
}

export const MercadoPagoSubscription = ({ currentPlan, onPlanChange }: MercadoPagoSubscriptionProps) => {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

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
        // Abrir en nueva pestaña
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
  );
};
