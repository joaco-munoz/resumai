import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { configurarLocalizacionFechas } from './utils/dateLocalization'

// Configurar la localización para fechas en español
configuracionFechas();

// Función para configurar la localización de fechas
function configuracionFechas() {
  // Establecer el idioma del documento a español
  document.documentElement.lang = 'es';
  
  // Configurar el formato de fecha para inputs
  configurarLocalizacionFechas();
}

createRoot(document.getElementById("root")!).render(<App />);
