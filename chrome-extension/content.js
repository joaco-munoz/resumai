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

function detectJobApplicationForms() {
  const config = SITE_CONFIGS[currentSite];
  const forms = document.querySelectorAll(config.formContainer);
  
  if (forms.length > 0) {
    console.log(`Encontrados ${forms.length} formularios de postulación`);
    forms.forEach((form, index) => {
      addResumAIWidget(form, index);
    });
  } else {
    // Intentar detectar formularios después de un delay
    setTimeout(detectJobApplicationForms, 2000);
  }
}

function addResumAIWidget(form, index = 0) {
  // Evitar duplicar widgets
  if (form.querySelector('.resumai-widget')) {
    return;
  }
  
  const widget = createWidget(index);
  
  // Insertar el widget antes del formulario o al inicio
  if (form.parentNode) {
    form.parentNode.insertBefore(widget, form);
  } else {
    form.insertAdjacentElement('afterbegin', widget);
  }
  
  console.log('Widget ResumAI agregado al formulario');
}

function createWidget(index) {
  const widget = document.createElement('div');
  widget.className = 'resumai-widget';
  widget.id = `resumai-widget-${index}`;
  
  widget.innerHTML = `
    <div class="resumai-container">
      <div class="resumai-header">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="ResumAI" class="resumai-logo">
        <h3>ResumAI Job Assistant</h3>
        <button class="resumai-toggle" id="resumai-toggle-${index}">
          <span class="toggle-text">Activar</span>
        </button>
      </div>
      <div class="resumai-content" id="resumai-content-${index}" style="display: none;">
        <div class="resumai-status" id="resumai-status-${index}">
          <p>Haz clic en "Conectar" para sincronizar con ResumAI</p>
        </div>
        <div class="resumai-actions" id="resumai-actions-${index}" style="display: none;">
          <div class="cv-selector">
            <label for="cv-select-${index}">Seleccionar CV:</label>
            <select id="cv-select-${index}" class="cv-select">
              <option value="">Cargando CVs...</option>
            </select>
          </div>
          <div class="action-buttons">
            <button class="btn-fill" id="btn-fill-${index}">Rellenar Formulario</button>
            <button class="btn-apply" id="btn-apply-${index}">Postular Automáticamente</button>
          </div>
        </div>
        <button class="btn-connect" id="btn-connect-${index}">Conectar con ResumAI</button>
      </div>
    </div>
  `;
  
  // Agregar event listeners
  setupWidgetEvents(widget, index);
  
  return widget;
}

function setupWidgetEvents(widget, index) {
  const toggle = widget.querySelector(`#resumai-toggle-${index}`);
  const content = widget.querySelector(`#resumai-content-${index}`);
  const connectBtn = widget.querySelector(`#btn-connect-${index}`);
  const fillBtn = widget.querySelector(`#btn-fill-${index}`);
  const applyBtn = widget.querySelector(`#btn-apply-${index}`);
  const cvSelect = widget.querySelector(`#cv-select-${index}`);
  
  // Toggle widget
  toggle.addEventListener('click', () => {
    const isVisible = content.style.display !== 'none';
    content.style.display = isVisible ? 'none' : 'block';
    toggle.querySelector('.toggle-text').textContent = isVisible ? 'Activar' : 'Ocultar';
  });
  
  // Conectar con ResumAI
  connectBtn.addEventListener('click', () => connectToResumAI(index));
  
  // Rellenar formulario
  fillBtn.addEventListener('click', () => fillForm(index));
  
  // Postular automáticamente
  applyBtn.addEventListener('click', () => autoApply(index));
  
  // Cambio de CV
  cvSelect.addEventListener('change', () => onCVChange(index));
}

async function connectToResumAI(widgetIndex) {
  const statusEl = document.querySelector(`#resumai-status-${widgetIndex}`);
  const connectBtn = document.querySelector(`#btn-connect-${widgetIndex}`);
  const actionsEl = document.querySelector(`#resumai-actions-${widgetIndex}`);
  
  statusEl.innerHTML = '<p>Conectando con ResumAI...</p>';
  connectBtn.disabled = true;
  
  try {
    // Verificar si hay token guardado
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken) {
      // Abrir popup para autenticación
      statusEl.innerHTML = '<p>Por favor, abre la extensión para autenticarte</p>';
      return;
    }
    
    // Obtener datos del usuario
    const response = await chrome.runtime.sendMessage({
      action: 'getUserData',
      token: result.authToken
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    // Obtener CVs del usuario
    const cvsResponse = await chrome.runtime.sendMessage({
      action: 'getUserCVs',
      token: result.authToken
    });
    
    if (!cvsResponse.success) {
      throw new Error(cvsResponse.error);
    }
    
    // Actualizar UI
    statusEl.innerHTML = `<p>✅ Conectado como ${response.data.full_name || response.data.email}</p>`;
    connectBtn.style.display = 'none';
    actionsEl.style.display = 'block';
    
    // Llenar selector de CVs
    const cvSelect = document.querySelector(`#cv-select-${widgetIndex}`);
    cvSelect.innerHTML = '<option value="">Seleccionar CV...</option>';
    
    cvsResponse.data.forEach(cv => {
      const option = document.createElement('option');
      option.value = cv.id;
      option.textContent = cv.title || `CV ${cv.id}`;
      cvSelect.appendChild(option);
    });
    
    // Guardar datos en el widget
    document.querySelector(`#resumai-widget-${widgetIndex}`).userData = response.data;
    document.querySelector(`#resumai-widget-${widgetIndex}`).userCVs = cvsResponse.data;
    
  } catch (error) {
    console.error('Error conectando con ResumAI:', error);
    statusEl.innerHTML = `<p>❌ Error: ${error.message}</p>`;
  } finally {
    connectBtn.disabled = false;
  }
}

async function fillForm(widgetIndex) {
  const widget = document.querySelector(`#resumai-widget-${widgetIndex}`);
  const cvSelect = document.querySelector(`#cv-select-${widgetIndex}`);
  const selectedCVId = cvSelect.value;
  
  if (!selectedCVId) {
    alert('Por favor selecciona un CV primero');
    return;
  }
  
  if (!widget.userData) {
    alert('Error: No hay datos de usuario cargados');
    return;
  }
  
  try {
    // Obtener contenido del CV seleccionado
    const result = await chrome.storage.local.get(['authToken']);
    const cvResponse = await chrome.runtime.sendMessage({
      action: 'getCVContent',
      cvId: selectedCVId,
      token: result.authToken
    });
    
    if (!cvResponse.success) {
      throw new Error(cvResponse.error);
    }
    
    const cvData = cvResponse.data;
    const userData = widget.userData;
    const config = SITE_CONFIGS[currentSite];
    
    // Rellenar campos básicos
    fillField(config.selectors.firstName, userData.full_name?.split(' ')[0] || '');
    fillField(config.selectors.lastName, userData.full_name?.split(' ').slice(1).join(' ') || '');
    fillField(config.selectors.email, userData.email || '');
    fillField(config.selectors.phone, userData.phone || '');
    
    // Rellenar campos adicionales si están disponibles en el CV
    if (cvData.content) {
      try {
        const cvContent = JSON.parse(cvData.content);
        fillAdditionalFields(cvContent, config);
      } catch (e) {
        console.log('No se pudo parsear el contenido del CV como JSON');
      }
    }
    
    // Mostrar confirmación
    showNotification('Formulario rellenado correctamente', 'success');
    
  } catch (error) {
    console.error('Error rellenando formulario:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}

function fillField(selector, value) {
  if (!value) return;
  
  const field = document.querySelector(selector);
  if (field) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`Campo rellenado: ${selector} = ${value}`);
  }
}

function fillAdditionalFields(cvContent, config) {
  // Aquí puedes agregar lógica específica para rellenar campos adicionales
  // basados en el contenido del CV (experiencia, educación, etc.)
  
  // Ejemplo: si el CV tiene campos estructurados
  if (cvContent.personalInfo) {
    const info = cvContent.personalInfo;
    if (info.address) {
      fillField('input[name*="direccion"], input[name*="address"]', info.address);
    }
    if (info.city) {
      fillField('input[name*="ciudad"], input[name*="city"]', info.city);
    }
  }
}

async function autoApply(widgetIndex) {
  const confirmation = confirm(
    '¿Estás seguro de que quieres postular automáticamente?\n\n' +
    'Esta acción enviará el formulario con los datos rellenados.'
  );
  
  if (!confirmation) return;
  
  try {
    // Primero rellenar el formulario
    await fillForm(widgetIndex);
    
    // Esperar un momento para que se procesen los cambios
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Intentar adjuntar CV si es posible
    await attachCV(widgetIndex);
    
    // Enviar formulario
    const config = SITE_CONFIGS[currentSite];
    const submitButton = document.querySelector(config.selectors.submitButton);
    
    if (submitButton) {
      submitButton.click();
      showNotification('Postulación enviada automáticamente', 'success');
    } else {
      showNotification('No se pudo encontrar el botón de envío. Por favor, envía manualmente.', 'warning');
    }
    
  } catch (error) {
    console.error('Error en postulación automática:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}

async function attachCV(widgetIndex) {
  const cvSelect = document.querySelector(`#cv-select-${widgetIndex}`);
  const selectedCVId = cvSelect.value;
  
  if (!selectedCVId) return;
  
  try {
    const result = await chrome.storage.local.get(['authToken']);
    const cvResponse = await chrome.runtime.sendMessage({
      action: 'downloadCV',
      cvId: selectedCVId,
      token: result.authToken
    });
    
    if (!cvResponse.success) {
      console.log('No se pudo descargar el CV para adjuntar');
      return;
    }
    
    const config = SITE_CONFIGS[currentSite];
    const fileInput = document.querySelector(config.selectors.fileUpload);
    
    if (fileInput) {
      // Crear archivo blob
      const uint8Array = new Uint8Array(cvResponse.data.data);
      const blob = new Blob([uint8Array], { type: cvResponse.data.mimeType });
      const file = new File([blob], cvResponse.data.filename, { type: cvResponse.data.mimeType });
      
      // Crear FileList
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      
      // Disparar eventos
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log('CV adjuntado correctamente');
    }
    
  } catch (error) {
    console.error('Error adjuntando CV:', error);
  }
}

function onCVChange(widgetIndex) {
  const cvSelect = document.querySelector(`#cv-select-${widgetIndex}`);
  const selectedCVId = cvSelect.value;
  
  if (selectedCVId) {
    console.log(`CV seleccionado: ${selectedCVId}`);
    // Aquí podrías mostrar una preview del CV si quisieras
  }
}

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

function handleMessage(request, sender, sendResponse) {
  switch (request.action) {
    case 'fillForm':
      fillForm(0);
      sendResponse({ success: true });
      break;
    case 'getPageInfo':
      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title,
          site: currentSite
        }
      });
      break;
    default:
      sendResponse({ success: false, error: 'Acción no reconocida' });
  }
}

function showNotification(message, type = 'info') {
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.className = `resumai-notification resumai-notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

console.log('ResumAI Content Script inicializado correctamente');
