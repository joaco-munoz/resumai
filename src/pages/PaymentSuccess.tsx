import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al perfil después de un breve retraso
    const timer = setTimeout(() => {
      navigate('/app/profile', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 rounded-lg max-w-md">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">¡Pago procesado exitosamente!</h1>
        <p className="text-muted-foreground mb-6">
          Estamos redireccionándote a tu perfil...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
