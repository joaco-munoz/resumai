// Popup Script para ResumAI Chrome Extension

// Variables globales
let currentUser = null;
let currentCVs = [];
let selectedCV = null;
let currentTab = null;

// Elementos del DOM
const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  statusIndicator: document.getElementById('statusIndicator'),
  statusText: document.getElementById('statusText'),
  authSection: document.getElementById('authSection'),
  mainSection: document.getElementById('mainSection'),
  errorSection: document.getElementById('errorSection'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  
  // Auth elements
  tokenInput: document.getElementById('tokenInput'),
  tokenSubmit: document.getElementById('tokenSubmit'),
  openResumAI: document.getElementById('openResumAI'),
  
  // Main elements
  userInfo: document.getElementById('userInfo'),
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  userAvatar: document.getElementById('userAvatar'),
  logoutBtn: document.getElementById('logoutBtn'),
  
  pageInfo: document.getElementById('pageInfo'),
  pageDetails: document.getElementById('pageDetails'),
  
  cvSelect: document.getElementById('cvSelect'),
  refreshCVs: document.getElementById('refreshCVs'),
  cvPreview: document.getElementById('cvPreview'),
  cvDetails: document.getElementById('cvDetails'),
  
  fillFormBtn: document.getElementById('fillFormBtn'),
  autoApplyBtn: document.getElementById('autoApplyBtn'),
  
  // Settings
  autoFillEnabled: document.getElementById('autoFillEnabled'),
  notificationsEnabled: document.getElementById('notificationsEnabled'),
  debugMode: document.getElementById('debugMode'),
  
  // Error
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  
  // Loading
  loadingText: document.getElementById('loadingText')
};

// Inicialización
document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  console.log('Inicializando popup ResumAI');
  
  // Configurar event listeners
  setupEventListeners();
  
  // Cargar configuración
  await loadSettings();
  
  // Verificar autenticación
  await checkAuthentication();
  
  // Obtener información de la pestaña actual
  await getCurrentTabInfo();
}

function setupEventListeners() {
  // Auth events
  elements.tokenSubmit.addEventListener('click', handleTokenAuth);
  elements.tokenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleTokenAuth();
  });
  elements.openResumAI.addEventListener('click', openResumAI);
  
  // Main events
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.refreshCVs.addEventListener('click', refreshCVs);
  elements.cvSelect.addEventListener('change', handleCVSelection);
  elements.fillFormBtn.addEventListener('click', fillForm);
  elements.autoApplyBtn.addEventListener('click', autoApply);
  
  // Settings events
  elements.autoFillEnabled.addEventListener('change', saveSettings);
  elements.notificationsEnabled.addEventListener('change', saveSettings);
  elements.debugMode.addEventListener('change', saveSettings);
  
  // Error events
  elements.retryBtn.addEventListener('click', initialize);
}

async function checkAuthentication() {
  showLoading('Verificando autenticación...');
  
  try {
    const result = await chrome.storage.local.get(['authToken', 'user', 'lastAuth']);
    
    if (!result.authToken) {
      showAuthSection();
      return;
    }
    
    // Verificar si el token no ha expirado (24 horas)
    const now = Date.now();
    const lastAuth = result.lastAuth || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (now - lastAuth > oneDay) {
      await chrome.storage.local.clear();
      showAuthSection();
      return;
    }
    
    // Verificar token con el servidor
    const response = await chrome.runtime.sendMessage({
      action: 'authenticate',
      token: result.authToken
    });
    
    if (response.success) {
      currentUser = response.data.user;
      await loadMainSection();
    } else {
      throw new Error(response.error);
    }
    
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    showError('Error de autenticación: ' + error.message);
  } finally {
    hideLoading();
  }
}

async function handleTokenAuth() {
  const token = elements.tokenInput.value.trim();
  
  if (!token) {
    showNotification('Por favor ingresa un token válido', 'error');
    return;
  }
  
  showLoading('Autenticando...');
  elements.tokenSubmit.disabled = true;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'authenticate',
      token: token
    });
    
    if (response.success) {
      currentUser = response.data.user;
      await loadMainSection();
      showNotification('Autenticación exitosa', 'success');
    } else {
      throw new Error(response.error);
    }
    
  } catch (error) {
    console.error('Error en autenticación:', error);
    showNotification('Error: ' + error.message, 'error');
  } finally {
    elements.tokenSubmit.disabled = false;
    hideLoading();
  }
}

function openResumAI() {
  chrome.tabs.create({ url: 'https://resumai.dev' });
}

async function loadMainSection() {
  try {
    // Actualizar información del usuario
    updateUserInfo();
    
    // Cargar CVs
    await loadUserCVs();
    
    // Mostrar sección principal
    showMainSection();
    
    // Actualizar estado de conexión
    updateConnectionStatus('connected', 'Conectado a ResumAI');
    
  } catch (error) {
    console.error('Error cargando sección principal:', error);
    showError('Error cargando datos: ' + error.message);
  }
}

function updateUserInfo() {
  if (!currentUser) return;
  
  elements.userName.textContent = currentUser.user_metadata?.full_name || currentUser.email;
  elements.userEmail.textContent = currentUser.email;
  
  // Actualizar avatar
  const initials = (currentUser.user_metadata?.full_name || currentUser.email)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  elements.userAvatar.textContent = initials;
}

async function loadUserCVs() {
  try {
    const result = await chrome.storage.local.get(['authToken']);
    const response = await chrome.runtime.sendMessage({
      action: 'getUserCVs',
      token: result.authToken
    });
    
    if (response.success) {
      currentCVs = response.data;
      updateCVSelector();
    } else {
      throw new Error(response.error);
    }
    
  } catch (error) {
    console.error('Error cargando CVs:', error);
    elements.cvSelect.innerHTML = '<option value="">Error cargando CVs</option>';
  }
}

function updateCVSelector() {
  elements.cvSelect.innerHTML = '<option value="">Seleccionar CV...</option>';
  
  currentCVs.forEach(cv => {
    const option = document.createElement('option');
    option.value = cv.id;
    option.textContent = cv.title || `CV ${cv.id}`;
    elements.cvSelect.appendChild(option);
  });
  
  if (currentCVs.length === 0) {
    elements.cvSelect.innerHTML = '<option value="">No hay CVs disponibles</option>';
  }
}

async function handleCVSelection() {
  const selectedCVId = elements.cvSelect.value;
  
  if (!selectedCVId) {
    elements.cvPreview.style.display = 'none';
    selectedCV = null;
    return;
  }
  
  try {
    const result = await chrome.storage.local.get(['authToken']);
    const response = await chrome.runtime.sendMessage({
      action: 'getCVContent',
      cvId: selectedCVId,
      token: result.authToken
    });
    
    if (response.success) {
      selectedCV = response.data;
      showCVPreview(selectedCV);
    } else {
      throw new Error(response.error);
    }
    
  } catch (error) {
    console.error('Error obteniendo CV:', error);
    showNotification('Error cargando CV: ' + error.message, 'error');
  }
}

function showCVPreview(cv) {
  elements.cvPreview.style.display = 'block';
  
  let previewHTML = `
    <p><strong>Título:</strong> ${cv.title || 'Sin título'}</p>
    <p><strong>Creado:</strong> ${new Date(cv.created_at).toLocaleDateString()}</p>
  `;
  
  if (cv.content) {
    try {
      const content = JSON.parse(cv.content);
      if (content.personalInfo) {
        previewHTML += `<p><strong>Nombre:</strong> ${content.personalInfo.name || 'N/A'}</p>`;
        previewHTML += `<p><strong>Email:</strong> ${content.personalInfo.email || 'N/A'}</p>`;
      }
    } catch (e) {
      previewHTML += '<p><em>Vista previa no disponible</em></p>';
    }
  }
  
  elements.cvDetails.innerHTML = previewHTML;
}

async function getCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    
    if (tab) {
      const url = new URL(tab.url);
      const hostname = url.hostname.replace('www.', '');
      
      const supportedSites = ['trabajando.cl', 'laborum.com', 'getonboard.com'];
      const isSupported = supportedSites.some(site => hostname.includes(site));
      
      let pageHTML = `
        <p><strong>URL:</strong> ${tab.title}</p>
        <p><strong>Sitio:</strong> ${hostname}</p>
        <p><strong>Estado:</strong> ${isSupported ? '✅ Compatible' : '❌ No compatible'}</p>
      `;
      
      elements.pageDetails.innerHTML = pageHTML;
      
      // Habilitar/deshabilitar botones según compatibilidad
      elements.fillFormBtn.disabled = !isSupported;
      elements.autoApplyBtn.disabled = !isSupported;
      
      if (!isSupported) {
        elements.pageDetails.innerHTML += '<p><small>Esta extensión solo funciona en trabajando.cl, laborum.com y getonboard.com</small></p>';
      }
    }
    
  } catch (error) {
    console.error('Error obteniendo información de la pestaña:', error);
    elements.pageDetails.innerHTML = '<p>Error obteniendo información de la página</p>';
  }
}

async function fillForm() {
  if (!selectedCV) {
    showNotification('Por favor selecciona un CV primero', 'error');
    return;
  }
  
  if (!currentTab) {
    showNotification('Error: No se pudo obtener la pestaña actual', 'error');
    return;
  }
  
  showLoading('Rellenando formulario...');
  
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'fillForm'
    });
    
    if (response && response.success) {
      showNotification('Formulario rellenado correctamente', 'success');
    } else {
      throw new Error(response?.error || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('Error rellenando formulario:', error);
    showNotification('Error: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function autoApply() {
  if (!selectedCV) {
    showNotification('Por favor selecciona un CV primero', 'error');
    return;
  }
  
  const confirmation = confirm(
    '¿Estás seguro de que quieres postular automáticamente?\n\n' +
    'Esta acción enviará el formulario con los datos de tu CV.'
  );
  
  if (!confirmation) return;
  
  showLoading('Postulando automáticamente...');
  
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'autoApply'
    });
    
    if (response && response.success) {
      showNotification('Postulación enviada automáticamente', 'success');
    } else {
      throw new Error(response?.error || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('Error en postulación automática:', error);
    showNotification('Error: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

async function refreshCVs() {
  elements.refreshCVs.disabled = true;
  elements.refreshCVs.textContent = '⟳';
  
  try {
    await loadUserCVs();
    showNotification('CVs actualizados', 'success');
  } catch (error) {
    showNotification('Error actualizando CVs', 'error');
  } finally {
    elements.refreshCVs.disabled = false;
    elements.refreshCVs.textContent = '↻';
  }
}

async function handleLogout() {
  const confirmation = confirm('¿Estás seguro de que quieres desconectarte?');
  
  if (confirmation) {
    await chrome.storage.local.clear();
    currentUser = null;
    currentCVs = [];
    selectedCV = null;
    showAuthSection();
    showNotification('Desconectado correctamente', 'info');
  }
}

async function loadSettings() {
  const result = await chrome.storage.local.get([
    'autoFillEnabled',
    'notificationsEnabled',
    'debugMode'
  ]);
  
  elements.autoFillEnabled.checked = result.autoFillEnabled !== false;
  elements.notificationsEnabled.checked = result.notificationsEnabled !== false;
  elements.debugMode.checked = result.debugMode === true;
}

async function saveSettings() {
  await chrome.storage.local.set({
    autoFillEnabled: elements.autoFillEnabled.checked,
    notificationsEnabled: elements.notificationsEnabled.checked,
    debugMode: elements.debugMode.checked
  });
  
  showNotification('Configuración guardada', 'success');
}

// Funciones de UI
function showAuthSection() {
  elements.authSection.style.display = 'block';
  elements.mainSection.style.display = 'none';
  elements.errorSection.style.display = 'none';
  updateConnectionStatus('disconnected', 'No conectado');
}

function showMainSection() {
  elements.authSection.style.display = 'none';
  elements.mainSection.style.display = 'block';
  elements.errorSection.style.display = 'none';
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.authSection.style.display = 'none';
  elements.mainSection.style.display = 'none';
  elements.errorSection.style.display = 'block';
  updateConnectionStatus('error', 'Error de conexión');
}

function showLoading(text = 'Cargando...') {
  elements.loadingText.textContent = text;
  elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  elements.loadingOverlay.style.display = 'none';
}

function updateConnectionStatus(status, text) {
  elements.statusIndicator.className = `status-indicator ${status}`;
  elements.statusText.textContent = text;
}

function showNotification(message, type = 'info') {
  // Crear notificación temporal en el popup
  const notification = document.createElement('div');
  notification.className = `popup-notification popup-notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 12px;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remover después de 2 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2000);
}

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'authenticationChanged':
      checkAuthentication();
      break;
    case 'tabUpdated':
      getCurrentTabInfo();
      break;
    default:
      break;
  }
});

console.log('Popup ResumAI inicializado correctamente');
