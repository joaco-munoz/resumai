// Script inyectado para ResumAI Chrome Extension
// Se ejecuta en el contexto de la página para acceder a variables globales

(function() {
  'use strict';
  
  console.log('ResumAI Injected Script cargado');
  
  // Función para extraer datos de formularios dinámicos
  function extractFormData() {
    const formData = {};
    
    // Buscar campos de formulario comunes
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (input.name || input.id) {
        const key = input.name || input.id;
        const value = input.value;
        
        if (value && value.trim()) {
          formData[key] = value;
        }
      }
    });
    
    return formData;
  }
  
  // Función para detectar el tipo de página
  function detectPageType() {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    const content = document.body.textContent.toLowerCase();
    
    // Detectar páginas de postulación
    const jobApplicationKeywords = [
      'postular', 'aplicar', 'apply', 'solicitar',
      'curriculum', 'cv', 'resume', 'trabajo',
      'empleo', 'job', 'position', 'vacante'
    ];
    
    const isJobApplication = jobApplicationKeywords.some(keyword => 
      url.includes(keyword) || title.includes(keyword) || content.includes(keyword)
    );
    
    return {
      isJobApplication,
      url: window.location.href,
      title: document.title,
      hostname: window.location.hostname
    };
  }
  
  // Función para obtener información de la oferta de trabajo
  function getJobInfo() {
    const jobInfo = {
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: ''
    };
    
    // Selectores comunes para información de trabajo
    const selectors = {
      title: [
        'h1', '.job-title', '.position-title', '.vacancy-title',
        '[class*="title"]', '[id*="title"]'
      ],
      company: [
        '.company-name', '.employer', '.company',
        '[class*="company"]', '[id*="company"]'
      ],
      location: [
        '.location', '.job-location', '.city',
        '[class*="location"]', '[id*="location"]'
      ]
    };
    
    // Extraer título del trabajo
    for (const selector of selectors.title) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobInfo.title = element.textContent.trim();
        break;
      }
    }
    
    // Extraer nombre de la empresa
    for (const selector of selectors.company) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobInfo.company = element.textContent.trim();
        break;
      }
    }
    
    // Extraer ubicación
    for (const selector of selectors.location) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobInfo.location = element.textContent.trim();
        break;
      }
    }
    
    return jobInfo;
  }
  
  // Función para monitorear cambios en formularios
  function monitorFormChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Buscar nuevos formularios
              const forms = node.querySelectorAll ? node.querySelectorAll('form') : [];
              if (forms.length > 0) {
                // Notificar al content script sobre nuevos formularios
                window.postMessage({
                  type: 'RESUMAI_NEW_FORMS',
                  forms: forms.length
                }, '*');
              }
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
  
  // Función para interceptar envíos de formularios
  function interceptFormSubmissions() {
    const originalSubmit = HTMLFormElement.prototype.submit;
    
    HTMLFormElement.prototype.submit = function() {
      // Notificar antes del envío
      window.postMessage({
        type: 'RESUMAI_FORM_SUBMIT',
        formData: extractFormData(),
        jobInfo: getJobInfo()
      }, '*');
      
      // Llamar al método original
      return originalSubmit.call(this);
    };
    
    // También interceptar eventos de submit
    document.addEventListener('submit', (event) => {
      window.postMessage({
        type: 'RESUMAI_FORM_SUBMIT',
        formData: extractFormData(),
        jobInfo: getJobInfo()
      }, '*');
    });
  }
  
  // Función para extraer datos específicos del sitio
  function extractSiteSpecificData() {
    const hostname = window.location.hostname.replace('www.', '');
    let siteData = {};
    
    switch (hostname) {
      case 'trabajando.cl':
        siteData = extractTrabajandoData();
        break;
      case 'laborum.com':
        siteData = extractLaborumData();
        break;
      case 'getonboard.com':
        siteData = extractGetonboardData();
        break;
      default:
        siteData = extractGenericData();
    }
    
    return siteData;
  }
  
  function extractTrabajandoData() {
    return {
      jobTitle: document.querySelector('.job-title, h1')?.textContent?.trim() || '',
      company: document.querySelector('.company-name, .employer')?.textContent?.trim() || '',
      location: document.querySelector('.location, .city')?.textContent?.trim() || '',
      salary: document.querySelector('.salary, .sueldo')?.textContent?.trim() || '',
      type: document.querySelector('.job-type, .tipo-trabajo')?.textContent?.trim() || ''
    };
  }
  
  function extractLaborumData() {
    return {
      jobTitle: document.querySelector('h1, .job-title')?.textContent?.trim() || '',
      company: document.querySelector('.company, .empresa')?.textContent?.trim() || '',
      location: document.querySelector('.location, .ubicacion')?.textContent?.trim() || '',
      description: document.querySelector('.job-description, .descripcion')?.textContent?.trim() || ''
    };
  }
  
  function extractGetonboardData() {
    return {
      jobTitle: document.querySelector('h1, .position-title')?.textContent?.trim() || '',
      company: document.querySelector('.company-name')?.textContent?.trim() || '',
      location: document.querySelector('.location')?.textContent?.trim() || '',
      tags: Array.from(document.querySelectorAll('.tag, .skill')).map(el => el.textContent.trim())
    };
  }
  
  function extractGenericData() {
    return {
      jobTitle: document.querySelector('h1')?.textContent?.trim() || document.title,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }
  
  // Función para simular interacciones humanas
  function simulateHumanInteraction(element, delay = 100) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular eventos de mouse
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // Simular focus
        element.focus();
        
        resolve();
      }, delay);
    });
  }
  
  // Función para rellenar campos con animación
  async function fillFieldWithAnimation(element, value, delay = 50) {
    if (!element || !value) return;
    
    // Limpiar campo
    element.value = '';
    element.focus();
    
    // Escribir carácter por carácter
    for (let i = 0; i < value.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      element.value += value[i];
      
      // Disparar eventos de input
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('keyup', { bubbles: true }));
    }
    
    // Disparar evento de change al final
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }
  
  // Exponer funciones al content script
  window.resumaiInjected = {
    extractFormData,
    detectPageType,
    getJobInfo,
    extractSiteSpecificData,
    simulateHumanInteraction,
    fillFieldWithAnimation
  };
  
  // Inicializar monitoreo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      monitorFormChanges();
      interceptFormSubmissions();
    });
  } else {
    monitorFormChanges();
    interceptFormSubmissions();
  }
  
  // Escuchar mensajes del content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    switch (event.data.type) {
      case 'RESUMAI_GET_PAGE_DATA':
        window.postMessage({
          type: 'RESUMAI_PAGE_DATA_RESPONSE',
          data: {
            pageType: detectPageType(),
            jobInfo: getJobInfo(),
            siteData: extractSiteSpecificData(),
            formData: extractFormData()
          }
        }, '*');
        break;
        
      case 'RESUMAI_FILL_FIELD':
        const field = document.querySelector(event.data.selector);
        if (field) {
          fillFieldWithAnimation(field, event.data.value, event.data.delay || 50);
        }
        break;
        
      default:
        break;
    }
  });
  
  console.log('ResumAI Injected Script inicializado correctamente');
  
})();
