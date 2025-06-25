/**
 * Configuración de la localización para fechas en español
 */

// Define nombres de meses en español
const mesesEnEspañol = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Configura la localización para español
export const configurarLocalizacionFechas = () => {
  // Configurar la localización global para fechas
  if (typeof Intl !== 'undefined') {
    try {
      // Intentar registrar la localización para 'es'
      if (!Intl.DateTimeFormat.supportedLocalesOf(['es']).length) {
        console.warn('La localización de español no está disponible en este navegador');
      }
    } catch (error) {
      console.error('Error al verificar soporte de localización:', error);
    }
  }
  
  // Inicializar listener para inputs de tipo month
  document.addEventListener('DOMContentLoaded', () => {
    // Aplicar estilos personalizados a todos los inputs con la clase date-input-es
    const actualizarInputsDeDate = () => {
      const inputs = document.querySelectorAll('input[type="month"].date-input-es');
      inputs.forEach(input => {
        input.setAttribute('lang', 'es');
        
        // Esta es una forma de forzar la localización 
        // No funcionará en todos los navegadores pero es un intento adicional
        if ((input as HTMLInputElement).showPicker) {
          const originalShowPicker = (input as HTMLInputElement).showPicker;
          (input as any).showPicker = function() {
            document.documentElement.lang = 'es';
            originalShowPicker.call(this);
          };
        }
      });
    };
    
    // Llamar inicialmente
    actualizarInputsDeDate();
    
    // Configurar un MutationObserver para detectar cuando se agregan nuevos inputs
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        actualizarInputsDeDate();
      }
    });
    
    // Comenzar a observar el documento
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
};

// Exportar los meses en español para uso en formateo manual si es necesario
export const getMesEnEspañol = (index: number) => {
  if (index >= 0 && index < 12) {
    return mesesEnEspañol[index];
  }
  return '';
};
