// Centralized configuration for the ResumAI Chrome extension.
//
// The extension has no build step, so configuration lives here. Replace the
// placeholders below with your own Supabase project values before loading the
// extension. The anon key is a public (publishable) key protected by Row Level
// Security — it is safe to ship in the extension, but do NOT paste a service
// role key here.
const RESUMAI_CONFIG = {
  // Supabase configuration — REPLACE with your own project values.
  supabase: {
    url: 'https://YOUR-PROJECT-REF.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    endpoints: {
      auth: '/auth/v1/user',
      profiles: '/rest/v1/profiles',
      cvs: '/rest/v1/cvs',
      storage: '/storage/v1/object/public/cvs'
    }
  },

  // URLs de ResumAI
  resumai: {
    baseUrl: 'https://resumai.dev',
    loginUrl: 'https://resumai.dev/auth/login',
    dashboardUrl: 'https://resumai.dev/dashboard'
  },

  // Sitios compatibles
  supportedSites: {
    'trabajando.cl': {
      name: 'Trabajando.cl',
      selectors: {
        forms: 'form[action*="postular"], form[action*="apply"], .application-form',
        firstName: 'input[name*="nombre"], input[name*="first"], input[placeholder*="nombre"]',
        lastName: 'input[name*="apellido"], input[name*="last"], input[placeholder*="apellido"]',
        email: 'input[type="email"], input[name*="email"], input[name*="correo"]',
        phone: 'input[type="tel"], input[name*="telefono"], input[name*="phone"], input[name*="celular"]',
        cv: 'input[type="file"][accept*="pdf"], input[name*="cv"], input[name*="curriculum"]',
        message: 'textarea[name*="mensaje"], textarea[name*="message"], textarea[placeholder*="mensaje"]',
        experience: 'textarea[name*="experiencia"], textarea[name*="experience"]',
        education: 'textarea[name*="educacion"], textarea[name*="education"]'
      },
      jobInfo: {
        title: 'h1, .job-title, .position-title',
        company: '.company-name, .employer, .empresa',
        location: '.location, .ubicacion, .city',
        salary: '.salary, .sueldo, .salario'
      }
    },
    'laborum.com': {
      name: 'Laborum',
      selectors: {
        forms: 'form[action*="postular"], form[action*="apply"], .postulation-form',
        firstName: 'input[name*="nombre"], input[name*="first_name"]',
        lastName: 'input[name*="apellido"], input[name*="last_name"]',
        email: 'input[type="email"], input[name*="email"]',
        phone: 'input[type="tel"], input[name*="telefono"], input[name*="phone"]',
        cv: 'input[type="file"], input[name*="cv"]',
        message: 'textarea[name*="mensaje"], textarea[name*="message"]'
      },
      jobInfo: {
        title: 'h1, .job-title',
        company: '.company, .empresa',
        location: '.location, .ubicacion'
      }
    },
    'getonboard.com': {
      name: 'Get on Board',
      selectors: {
        forms: 'form[action*="apply"], .application-form',
        firstName: 'input[name*="first"], input[name*="nombre"]',
        lastName: 'input[name*="last"], input[name*="apellido"]',
        email: 'input[type="email"]',
        phone: 'input[type="tel"], input[name*="phone"]',
        cv: 'input[type="file"]',
        message: 'textarea[name*="message"], textarea[name*="cover"]'
      },
      jobInfo: {
        title: 'h1, .position-title',
        company: '.company-name',
        location: '.location'
      }
    }
  },

  // Configuración de la extensión
  extension: {
    name: 'ResumAI Job Assistant',
    version: '1.0.0',
    updateInterval: 24 * 60 * 60 * 1000, // 24 horas en ms
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    animationDelay: 50, // ms entre caracteres al escribir
    notificationDuration: 3000, // 3 segundos
    
    // Configuración del widget
    widget: {
      position: 'top-right',
      zIndex: 10000,
      width: '300px',
      maxHeight: '400px'
    },

    // Configuración del popup
    popup: {
      width: '400px',
      height: '600px'
    }
  },

  // Mensajes y textos
  messages: {
    es: {
      // Autenticación
      notAuthenticated: 'No estás conectado a ResumAI',
      authSuccess: 'Conectado exitosamente a ResumAI',
      authError: 'Error de autenticación. Verifica tu token.',
      tokenExpired: 'Tu sesión ha expirado. Vuelve a conectarte.',
      
      // CVs
      noCvs: 'No tienes CVs creados en ResumAI',
      cvSelected: 'CV seleccionado',
      cvError: 'Error al cargar CVs',
      
      // Formularios
      formFilled: 'Formulario rellenado exitosamente',
      formError: 'Error al rellenar formulario',
      noFormFound: 'No se encontró formulario de postulación',
      applicationSent: 'Postulación enviada exitosamente',
      applicationError: 'Error al enviar postulación',
      
      // General
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: '¿Estás seguro?',
      cancel: 'Cancelar',
      accept: 'Aceptar',
      
      // Botones
      connect: 'Conectar',
      disconnect: 'Desconectar',
      fillForm: 'Rellenar Formulario',
      apply: 'Postular Automáticamente',
      selectCv: 'Seleccionar CV',
      openResumai: 'Abrir ResumAI',
      settings: 'Configuración'
    }
  },

  // Configuración de desarrollo
  development: {
    debug: false, // Cambiar a true para logs detallados
    mockData: false, // Usar datos de prueba
    skipAuth: false, // Saltar autenticación (solo desarrollo)
    testMode: false // Modo de prueba
  },

  // Configuración de seguridad
  security: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    sanitizeInput: true,
    validateOrigin: true
  },

  // Configuración de rendimiento
  performance: {
    debounceDelay: 300, // ms
    throttleDelay: 1000, // ms
    maxConcurrentRequests: 3,
    cacheExpiry: 5 * 60 * 1000, // 5 minutos
    lazyLoadDelay: 100 // ms
  }
};

// Función para obtener configuración por sitio
function getSiteConfig(hostname) {
  const cleanHostname = hostname.replace('www.', '');
  return RESUMAI_CONFIG.supportedSites[cleanHostname] || null;
}

// Función para verificar si un sitio es compatible
function isSupportedSite(hostname) {
  return getSiteConfig(hostname) !== null;
}

// Función para obtener mensaje localizado
function getMessage(key, lang = 'es') {
  return RESUMAI_CONFIG.messages[lang]?.[key] || key;
}

// Función para log de desarrollo
function debugLog(...args) {
  if (RESUMAI_CONFIG.development.debug) {
    console.log('[ResumAI Debug]', ...args);
  }
}

// Función para validar configuración
function validateConfig() {
  const required = [
    'supabase.url',
    'supabase.anonKey',
    'resumai.baseUrl'
  ];
  
  const missing = required.filter(path => {
    const keys = path.split('.');
    let obj = RESUMAI_CONFIG;
    for (const key of keys) {
      if (!obj[key]) return true;
      obj = obj[key];
    }
    return false;
  });
  
  if (missing.length > 0) {
    console.error('[ResumAI Config] Configuración faltante:', missing);
    return false;
  }
  
  return true;
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = {
    RESUMAI_CONFIG,
    getSiteConfig,
    isSupportedSite,
    getMessage,
    debugLog,
    validateConfig
  };
} else {
  // Browser
  window.RESUMAI_CONFIG = RESUMAI_CONFIG;
  window.getSiteConfig = getSiteConfig;
  window.isSupportedSite = isSupportedSite;
  window.getMessage = getMessage;
  window.debugLog = debugLog;
  window.validateConfig = validateConfig;
}

// Validar configuración al cargar
validateConfig();
