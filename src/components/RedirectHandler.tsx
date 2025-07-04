import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si hay un parámetro redirect en la URL
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirect');
    
    if (redirectTo === 'profile') {
      // Navegar a la página de perfil
      navigate('/app/profile', { replace: true });
      return;
    }
    
    // Manejar caso donde la URL tiene /redirect=profile (sin signo de interrogación)
    if (location.pathname === '/redirect=profile') {
      navigate('/app/profile', { replace: true });
      return;
    }
  }, [location, navigate]);

  return null; // Este componente no renderiza nada
};

export default RedirectHandler;
