// Content Script para ResumAI Chrome Extension
// Se ejecuta en las páginas de los portales de empleo

console.log('ResumAI Content Script cargado');

// Configuración de sitios y selectores
const SITE_CONFIGS = {
  'trabajando.cl': {
    name: 'Trabajando.cl',
    selectors: {
      firstName: 'input[name="nombre"], input[id*="nombre"], input[placeholder*="nombre"]',
      lastName: 'input[name="apellido"], input[id*="apellido"], input[placeholder*="apellido"]',
      email: 'input[type="email"], input[name="email"], input[id*="email"]',
      phone: 'input[type="tel"], input[name="telefono"], input[name="phone"], input[id*="telefono"]',
      fileUpload: 'input[type="file"], input[name*="cv"], input[id*="cv"]',
      submitButton: 'button[type="submit"], input[type="submit"], .btn-postular, .apply-btn'
    },
    formContainer: '.job-application-form, .postulation-form, form'
  },
  'laborum.com': {
    name: 'Laborum',
    selectors: {
      firstName: 'input[name="firstName"], input[id="firstName"], input[placeholder*="nombre"]',
      lastName: 'input[name="lastName"], input[id="lastName"], input[placeholder*="apellido"]',
      email: 'input[type="email"], input[name="email"]',
      phone: 'input[type="tel"], input[name="phone"], input[name="telefono"]',
      fileUpload: 'input[type="file"]',
      submitButton: 'button[type="submit"], .btn-apply'
    },
    formContainer: '.application-form, form'
  },
  'getonboard.com': {
    name: 'GetOnBoard',
    selectors: {
      firstName: 'input[name="first_name"], input[placeholder*="nombre"]',
      lastName: 'input[name="last_name"], input[placeholder*="apellido"]',
      email: 'input[type="email"], input[name="email"]',
      phone: 'input[type="tel"], input[name="phone"]',
      fileUpload: 'input[type="file"], input[accept*="pdf"]',
      submitButton: 'button[type="submit"], .apply-button'
    },
    formContainer: '.job-application, form'
  }
};

// Variables globales
let currentSite = null;
let isExtensionActive = false;
let resumaiWidget = null;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  console.log('Inicializando ResumAI Content Script');
  
  // Detectar el sitio actual
  const hostname = window.location.hostname.replace('www.', '');
  currentSite = Object.keys(SITE_CONFIGS).find(site => hostname.includes(site));
  
  if (!currentSite) {
    console.log('Sitio no compatible:', hostname);
    return;
  }
  
  console.log('Sitio detectado:', currentSite);
  
  // Buscar formularios de postulación
  detectJobApplicationForms();
  
  // Observar cambios en el DOM para formularios dinámicos
  observeFormChanges();
  
  // Escuchar mensajes del popup
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Mejorar la detección de formularios y campos
const ENHANCED_SITE_CONFIGS = {
  'trabajando.cl': {
    name: 'Trabajando.cl',
    selectors: {
      firstName: [
        'input[name*="nombre"]',
        'input[id*="nombre"]',
        'input[placeholder*="nombre"]',
        'input[aria-label*="nombre"]',
        '.form-field input[type="text"]:first-of-type'
      ],
      lastName: [
        'input[name*="apellido"]',
        'input[id*="apellido"]', 
        'input[placeholder*="apellido"]',
        'input[aria-label*="apellido"]'
      ],
      email: [
        'input[type="email"]',
        'input[name*="email"]',
        'input[id*="email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="correo"]'
      ],
      phone: [
        'input[type="tel"]',
        'input[name*="telefono"]',
        'input[name*="phone"]',
        'input[id*="telefono"]',
        'input[placeholder*="teléfono"]',
        'input[placeholder*="telefono"]'
      ],
      location: [
        'input[name*="direccion"]',
        'input[name*="ciudad"]',
        'input[id*="direccion"]',
        'input[placeholder*="dirección"]',
        'input[placeholder*="ciudad"]'
      ],
      fileUpload: [
        'input[type="file"]',
        'input[name*="cv"]',
        'input[id*="cv"]',
        'input[accept*="pdf"]'
      ],
      submitButton: [
        'button[type="submit"]',
        'input[type="submit"]',
        '.btn-postular',
        '.apply-btn',
        'button:contains("Postular")',
        'button:contains("Enviar")'
      ]
    }
  },
  'laborum.com': {
    name: 'Laborum',
    selectors: {
      firstName: [
        'input[name="firstName"]',
        'input[id="firstName"]',
        'input[placeholder*="nombre"]'
      ],
      lastName: [
        'input[name="lastName"]',
        'input[id="lastName"]',
        'input[placeholder*="apellido"]'
      ],
      email: [
        'input[type="email"]',
        'input[name="email"]'
      ],
      phone: [
        'input[type="tel"]',
        'input[name="phone"]',
        'input[name="telefono"]'
      ],
      location: [
        'input[name*="address"]',
        'input[name*="direccion"]',
        'input[name*="ciudad"]'
      ],
      fileUpload: [
        'input[type="file"]'
      ],
      submitButton: [
        'button[type="submit"]',
        '.btn-apply'
      ]
    }
  },
  'getonboard.com': {
    name: 'GetOnBoard',
    selectors: {
      firstName: [
        'input[name="first_name"]',
        'input[placeholder*="nombre"]'
      ],
      lastName: [
        'input[name="last_name"]',
        'input[placeholder*="apellido"]'
      ],
      email: [
        'input[type="email"]',
        'input[name="email"]'
      ],
      phone: [
        'input[type="tel"]',
        'input[name="phone"]'
      ],
      location: [
        'input[name*="location"]',
        'input[name*="address"]'
      ],
      fileUpload: [
        'input[type="file"]',
        'input[accept*="pdf"]'
      ],
      submitButton: [
        'button[type="submit"]',
        '.apply-button'
      ]
    }
  }
};

// Función mejorada para encontrar campos
function findField(selectors) {
  if (typeof selectors === 'string') {
    return document.querySelector(selectors);
  }
  
  if (Array.isArray(selectors)) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
  }
  
  return null;
}

// Función mejorada para rellenar campos con animación natural
async function fillFieldNaturally(element, value, delay = 50) {
  if (!element || !value) return;
  
  // Hacer focus en el campo
  element.focus();
  element.click();
  
  // Limpiar campo existente
  element.value = '';
  element.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Escribir carácter por carácter para simular escritura humana
  for (let i = 0; i < value.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 30));
    element.value += value[i];
    
    // Disparar eventos de input
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('keyup', { bubbles: true }));
  }
  
  // Eventos finales
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  
  console.log(`✅ Campo rellenado: ${value}`);
}

// Función principal de autofill mejorada
async function performAutofill(cvData, profileData) {
  const config = ENHANCED_SITE_CONFIGS[currentSite];
  if (!config) {
    throw new Error('Sitio no compatible');
  }
  
  console.log('🚀 Iniciando autofill avanzado...');
  
  const personalInfo = cvData?.personalInfo || {};
  const profile = profileData || {};
  
  // Datos a rellenar con prioridad (CV > Perfil > Default)
  const fillData = {
    firstName: personalInfo.fullName?.split(' ')[0] || profile.fullName?.split(' ')[0] || '',
    lastName: personalInfo.fullName?.split(' ').slice(1).join(' ') || profile.fullName?.split(' ').slice(1).join(' ') || '',
    email: personalInfo.email || currentUser?.email || '',
    phone: personalInfo.phone || profile.phone || '',
    location: personalInfo.location || profile.location || ''
  };
  
  // Rellenar campos uno por uno
  for (const [fieldType, value] of Object.entries(fillData)) {
    if (!value) continue;
    
    const field = findField(config.selectors[fieldType]);
    if (field && !field.value) {
      await fillFieldNaturally(field, value);
      await new Promise(resolve => setTimeout(resolve, 200)); // Pausa entre campos
    }
  }
  
  // Buscar y rellenar campos adicionales
  await fillAdditionalFields(cvData);
  
  console.log('✅ Autofill completado');
  showEnhancedNotification('Formulario rellenado correctamente', 'success');
}

// Función para rellenar campos adicionales específicos del sitio
async function fillAdditionalFields(cvData) {
  const additionalFields = document.querySelectorAll('textarea, input[type="text"]:not([name*="nombre"]):not([name*="apellido"])');
  
  additionalFields.forEach(async (field) => {
    const fieldName = (field.name || field.id || field.placeholder || '').toLowerCase();
    
    // Experiencia laboral
    if ((fieldName.includes('experiencia') || fieldName.includes('experience')) && cvData.experience?.length > 0) {
      const experience = cvData.experience[0];
      const experienceText = `${experience.position} en ${experience.company}\n${experience.description}`;
      await fillFieldNaturally(field, experienceText);
    }
    
    // Habilidades
    if ((fieldName.includes('skill') || fieldName.includes('habilidad')) && cvData.skills?.length > 0) {
      const skillsText = cvData.skills.join(', ');
      await fillFieldNaturally(field, skillsText);
    }
    
    // Resumen profesional
    if ((fieldName.includes('summary') || fieldName.includes('resumen')) && cvData.summary) {
      await fillFieldNaturally(field, cvData.summary);
    }
  });
}

// Función para aplicar automáticamente
async function performAutoApply(cvData, profileData) {
  console.log('🚀 Iniciando aplicación automática...');
  
  // Primero rellenar el formulario
  await performAutofill(cvData, profileData);
  
  // Esperar un momento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Intentar adjuntar CV si hay campo de archivo
  await tryAttachCV();
  
  // Buscar y hacer clic en el botón de envío
  const config = ENHANCED_SITE_CONFIGS[currentSite];
  const submitButton = findField(config.selectors.submitButton);
  
  if (submitButton && !submitButton.disabled) {
    // Scroll al botón
    submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Hacer clic
    submitButton.click();
    
    console.log('✅ Aplicación enviada');
    showEnhancedNotification('¡Postulación enviada exitosamente!', 'success');
  } else {
    showEnhancedNotification('No se pudo encontrar el botón de envío', 'warning');
  }
}

// Función para intentar adjuntar CV
async function tryAttachCV() {
  const config = ENHANCED_SITE_CONFIGS[currentSite];
  const fileInput = findField(config.selectors.fileUpload);
  
  if (fileInput) {
    // En una implementación real, aquí se descargaría el CV desde ResumAI
    console.log('📎 Campo de archivo encontrado, pero adjuntar CV requiere implementación del servidor');
    showEnhancedNotification('Campo de CV encontrado - adjunta manualmente si es necesario', 'info');
  }
}

// Notificación mejorada estilo ResumAI
function showEnhancedNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'resumai-enhanced-notification';
  
  const typeColors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#1e63ff'
  };
  
  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${typeIcons[type]}</span>
      <span class="notification-message">${message}</span>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 10000 !important;
    background: white !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    border-left: 4px solid ${typeColors[type]} !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #1e293b !important;
    max-width: 350px !important;
    animation: slideInRight 0.3s ease-out !important;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove después de 4 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
}

// Agregar CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .notification-icon {
    font-size: 18px;
  }
  
  .notification-message {
    flex: 1;
    line-height: 1.4;
  }
`;
document.head.appendChild(style);

// Función para detectar formularios de postulación
function detectJobApplicationForms() {
  const config = SITE_CONFIGS[currentSite];
  if (!config) return [];
  
  const forms = Array.from(document.querySelectorAll(config.formContainer));
  return forms;
}

// Función para observar cambios en el DOM y detectar nuevos formularios
function observeFormChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const config = SITE_CONFIGS[currentSite];
            const forms = node.querySelectorAll ? node.querySelectorAll(config.formContainer) : [];
            forms.forEach((form, index) => {
              if (!form.querySelector('.resumai-widget')) {
                addResumAIWidget(form, index);
              }
            });
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Función para agregar widget ResumAI a un formulario
function addResumAIWidget(form, index = 0) {
  if (form.querySelector('.resumai-widget')) return;
  
  const widget = document.createElement('div');
  widget.className = 'resumai-widget';
  widget.id = `resumai-widget-${index}`;
  widget.textContent = 'ResumAI Job Assistant';
  
  form.parentNode.insertBefore(widget, form);
  console.log('Widget ResumAI agregado al formulario');
}

// Manejar mensajes recibidos
function handleMessage(request, sender, sendResponse) {
  switch (request.action) {
    case 'autofill':
      performAutofill(request.cvData, request.profileData)
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('Error en autofill:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    case 'autoApply':
      performAutoApply(request.cvData, request.profileData)
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('Error en auto apply:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    case 'getPageInfo':
      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title,
          site: currentSite,
          hasJobForm: detectJobApplicationForms().length > 0
        }
      });
      break;
      
    default:
      sendResponse({ success: false, error: 'Acción no reconocida' });
  }
}

console.log('✅ ResumAI Enhanced Content Script cargado para:', currentSite);
