import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    // Solo redirigir si el usuario está autenticado
    if (loading) return;

    if (user) {
      // Cuenta regresiva para la redirección
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate('/app/profile', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [navigate, user, loading]);

  // Si el usuario no está autenticado, mostrar opciones para iniciar sesión
  if (!loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 rounded-lg border shadow-md max-w-md">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">¡Pago procesado exitosamente!</h1>
          <p className="text-muted-foreground mb-6">
            Tu suscripción ha sido activada, pero necesitas iniciar sesión para acceder a tu cuenta.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/auth', { replace: true })}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 rounded-lg border shadow-md max-w-md">
        <div className="flex justify-center mb-4">
          {loading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-4">¡Pago procesado exitosamente!</h1>
        <p className="text-muted-foreground mb-6">
          Tu suscripción Pro ha sido activada. Serás redirigido a tu perfil en {redirectCountdown} segundos...
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate('/app/profile', { replace: true })}>
            Ir a mi perfil ahora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
