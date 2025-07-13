
// ResumAI Chrome Extension - Enhanced Popup Script

// Variables globales
let currentUser = null;
let currentCVs = [];
let selectedCV = null;
let userProfile = null;
let currentTab = null;
let appStats = { applications: 0, autoFills: 0 };

// Elementos del DOM
const elements = {
  // Auth elements
  authSection: document.getElementById('authSection'),
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  loginBtn: document.getElementById('loginBtn'),
  openResumAI: document.getElementById('openResumAI'),
  
  // Main elements
  mainSection: document.getElementById('mainSection'),
  connectionStatus: document.getElementById('connectionStatus'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  
  // User elements
  userAvatar: document.getElementById('userAvatar'),
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  settingsBtn: document.getElementById('settingsBtn'),
  
  // Page detection
  detectedSite: document.getElementById('detectedSite'),
  detectionStatus: document.getElementById('detectionStatus'),
  
  // CV elements
  cvSelect: document.getElementById('cvSelect'),
  refreshCVs: document.getElementById('refreshCVs'),
  cvPreview: document.getElementById('cvPreview'),
  cvTitle: document.getElementById('cvTitle'),
  cvDetails: document.getElementById('cvDetails'),
  
  // Profile elements
  profileCard: document.getElementById('profileCard'),
  profileForm: document.getElementById('profileForm'),
  profileName: document.getElementById('profileName'),
  profilePhone: document.getElementById('profilePhone'),
  profileLocation: document.getElementById('profileLocation'),
  profileNameInput: document.getElementById('profileNameInput'),
  profilePhoneInput: document.getElementById('profilePhoneInput'),
  profileLocationInput: document.getElementById('profileLocationInput'),
  editProfileBtn: document.getElementById('editProfileBtn'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  cancelProfileBtn: document.getElementById('cancelProfileBtn'),
  
  // Action elements
  autofillBtn: document.getElementById('autofillBtn'),
  autoApplyBtn: document.getElementById('autoApplyBtn'),
  
  // Stats elements
  statsApplications: document.getElementById('statsApplications'),
  statsAutoFills: document.getElementById('statsAutoFills'),
  
  // Loading
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText'),
  
  // Toast container
  toastContainer: document.getElementById('toastContainer')
};

// Inicialización
document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  console.log('🚀 Inicializando ResumAI Extension');
  
  setupEventListeners();
  await loadStoredData();
  await checkAuthentication();
  await getCurrentTabInfo();
  await detectCurrentSite();
}

function setupEventListeners() {
  // Auth events
  elements.loginBtn.addEventListener('click', handleLogin);
  elements.emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  elements.passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  elements.openResumAI.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://resumai.dev' });
  });
  
  // Main events
  elements.settingsBtn.addEventListener('click', showSettings);
  elements.refreshCVs.addEventListener('click', refreshCVs);
  elements.cvSelect.addEventListener('change', handleCVSelection);
  
  // Profile events
  elements.editProfileBtn.addEventListener('click', toggleProfileEdit);
  elements.saveProfileBtn.addEventListener('click', saveProfile);
  elements.cancelProfileBtn.addEventListener('click', cancelProfileEdit);
  
  // Action events
  elements.autofillBtn.addEventListener('click', performAutofill);
  elements.autoApplyBtn.addEventListener('click', performAutoApply);
}

async function loadStoredData() {
  try {
    const result = await chrome.storage.local.get([
      'authToken', 
      'user', 
      'userProfile', 
      'appStats'
    ]);
    
    currentUser = result.user || null;
    userProfile = result.userProfile || null;
    appStats = result.appStats || { applications: 0, autoFills: 0 };
    
    updateStatsDisplay();
  } catch (error) {
    console.error('Error loading stored data:', error);
  }
}

async function checkAuthentication() {
  showLoading('Verificando autenticación...');
  
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      showAuthSection();
      return;
    }
    
    // Simular verificación de token (en implementación real, verificar con ResumAI)
    currentUser = result.user;
    await loadMainInterface();
    
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    showToast('Error de autenticación', 'error');
    showAuthSection();
  } finally {
    hideLoading();
  }
}

async function handleLogin() {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  
  if (!email || !password) {
    showToast('Por favor ingresa email y contraseña', 'warning');
    return;
  }
  
  showLoading('Iniciando sesión...');
  elements.loginBtn.disabled = true;
  
  try {
    // Simular autenticación (en implementación real, conectar con ResumAI)
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      name: email.split('@')[0],
      avatar_url: null
    };
    
    await chrome.storage.local.set({
      authToken: 'mock_token_' + Date.now(),
      user: mockUser
    });
    
    currentUser = mockUser;
    await loadMainInterface();
    showToast('Sesión iniciada correctamente', 'success');
    
  } catch (error) {
    console.error('Error en login:', error);
    showToast('Error al iniciar sesión', 'error');
  } finally {
    elements.loginBtn.disabled = false;
    hideLoading();
  }
}

async function loadMainInterface() {
  updateUserInfo();
  updateConnectionStatus('connected', 'Conectado a ResumAI');
  await loadUserCVs();
  await loadUserProfile();
  showMainSection();
}

function updateUserInfo() {
  if (!currentUser) return;
  
  const displayName = currentUser.name || currentUser.email.split('@')[0];
  const initials = displayName.substring(0, 2).toUpperCase();
  
  elements.userAvatar.textContent = initials;
  elements.userName.textContent = displayName;
  elements.userEmail.textContent = currentUser.email;
}

function updateConnectionStatus(status, text) {
  elements.statusDot.className = `status-dot ${status}`;
  elements.statusText.textContent = text;
}

async function loadUserCVs() {
  try {
    // Simular carga de CVs (en implementación real, obtener de ResumAI API)
    const mockCVs = [
      {
        id: 'cv1',
        title: 'CV Desarrollador Full Stack',
        created_at: new Date().toISOString(),
        content: {
          personalInfo: {
            fullName: 'Juan Pérez',
            email: 'juan@email.com',
            phone: '+56 9 1234 5678',
            location: 'Santiago, Chile'
          }
        }
      },
      {
        id: 'cv2',
        title: 'CV Marketing Digital',
        created_at: new Date().toISOString(),
        content: {
          personalInfo: {
            fullName: 'María González',
            email: 'maria@email.com',
            phone: '+56 9 8765 4321',
            location: 'Valparaíso, Chile'
          }
        }
      }
    ];
    
    currentCVs = mockCVs;
    updateCVSelector();
    
  } catch (error) {
    console.error('Error cargando CVs:', error);
    showToast('Error al cargar CVs', 'error');
  }
}

function updateCVSelector() {
  elements.cvSelect.innerHTML = '<option value="">Seleccionar CV...</option>';
  
  currentCVs.forEach(cv => {
    const option = document.createElement('option');
    option.value = cv.id;
    option.textContent = cv.title;
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
  
  selectedCV = currentCVs.find(cv => cv.id === selectedCVId);
  
  if (selectedCV) {
    elements.cvTitle.textContent = selectedCV.title;
    elements.cvDetails.textContent = `Creado: ${new Date(selectedCV.created_at).toLocaleDateString()}`;
    elements.cvPreview.style.display = 'block';
    
    // Habilitar botones de acción
    elements.autofillBtn.disabled = false;
    elements.autoApplyBtn.disabled = false;
  }
}

async function loadUserProfile() {
  try {
    // Simular carga de perfil (en implementación real, obtener de ResumAI)
    const mockProfile = userProfile || {
      fullName: currentUser?.name || '',
      phone: '',
      location: ''
    };
    
    userProfile = mockProfile;
    updateProfileDisplay();
    
  } catch (error) {
    console.error('Error cargando perfil:', error);
  }
}

function updateProfileDisplay() {
  if (!userProfile) return;
  
  elements.profileName.textContent = userProfile.fullName || '-';
  elements.profilePhone.textContent = userProfile.phone || '-';
  elements.profileLocation.textContent = userProfile.location || '-';
}

function toggleProfileEdit() {
  const isEditing = elements.profileForm.style.display !== 'none';
  
  if (isEditing) {
    cancelProfileEdit();
  } else {
    // Llenar formulario con datos actuales
    elements.profileNameInput.value = userProfile?.fullName || '';
    elements.profilePhoneInput.value = userProfile?.phone || '';
    elements.profileLocationInput.value = userProfile?.location || '';
    
    elements.profileCard.style.display = 'none';
    elements.profileForm.style.display = 'block';
    elements.editProfileBtn.textContent = 'Cancelar';
  }
}

async function saveProfile() {
  const newProfile = {
    fullName: elements.profileNameInput.value.trim(),
    phone: elements.profilePhoneInput.value.trim(),
    location: elements.profileLocationInput.value.trim()
  };
  
  try {
    // Guardar en storage
    await chrome.storage.local.set({ userProfile: newProfile });
    userProfile = newProfile;
    
    updateProfileDisplay();
    cancelProfileEdit();
    showToast('Perfil actualizado correctamente', 'success');
    
  } catch (error) {
    console.error('Error guardando perfil:', error);
    showToast('Error al guardar perfil', 'error');
  }
}

function cancelProfileEdit() {
  elements.profileCard.style.display = 'block';
  elements.profileForm.style.display = 'none';
  elements.editProfileBtn.textContent = 'Editar';
}

async function getCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
  } catch (error) {
    console.error('Error obteniendo tab info:', error);
  }
}

async function detectCurrentSite() {
  if (!currentTab) return;
  
  const url = new URL(currentTab.url);
  const hostname = url.hostname.replace('www.', '');
  
  const supportedSites = {
    'trabajando.cl': 'Trabajando.cl',
    'laborum.com': 'Laborum',
    'getonboard.com': 'GetOnBoard'
  };
  
  const detectedSite = Object.keys(supportedSites).find(site => 
    hostname.includes(site)
  );
  
  if (detectedSite) {
    elements.detectedSite.textContent = supportedSites[detectedSite];
    elements.detectionStatus.innerHTML = '<span class="status-badge" style="background: #dcfce7; color: #166534;">✓ Compatible</span>';
    
    // Habilitar acciones si hay CV seleccionado
    if (selectedCV) {
      elements.autofillBtn.disabled = false;
      elements.autoApplyBtn.disabled = false;
    }
  } else {
    elements.detectedSite.textContent = 'Sitio no compatible';
    elements.detectionStatus.innerHTML = '<span class="status-badge" style="background: #fef3c7; color: #92400e;">⚠ No compatible</span>';
    
    // Deshabilitar acciones
    elements.autofillBtn.disabled = true;
    elements.autoApplyBtn.disabled = true;
  }
}

async function performAutofill() {
  if (!selectedCV || !currentTab) {
    showToast('Selecciona un CV primero', 'warning');
    return;
  }
  
  showLoading('Rellenando formulario...');
  
  try {
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'autofill',
      cvData: selectedCV.content,
      profileData: userProfile
    });
    
    // Actualizar estadísticas
    appStats.autoFills++;
    await updateStats();
    
    showToast('Formulario rellenado correctamente', 'success');
    
  } catch (error) {
    console.error('Error en autofill:', error);
    showToast('Error al rellenar formulario', 'error');
  } finally {
    hideLoading();
  }
}

async function performAutoApply() {
  if (!selectedCV || !currentTab) {
    showToast('Selecciona un CV primero', 'warning');
    return;
  }
  
  const confirmed = confirm(
    '¿Estás seguro de que quieres postular automáticamente?\n\n' +
    'Esta acción enviará el formulario con los datos de tu CV.'
  );
  
  if (!confirmed) return;
  
  showLoading('Postulando automáticamente...');
  
  try {
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'autoApply',
      cvData: selectedCV.content,
      profileData: userProfile
    });
    
    // Actualizar estadísticas
    appStats.applications++;
    await updateStats();
    
    showToast('¡Postulación enviada exitosamente!', 'success');
    
  } catch (error) {
    console.error('Error en auto apply:', error);
    showToast('Error al enviar postulación', 'error');
  } finally {
    hideLoading();
  }
}

async function updateStats() {
  await chrome.storage.local.set({ appStats });
  updateStatsDisplay();
}

function updateStatsDisplay() {
  elements.statsApplications.textContent = appStats.applications;
  elements.statsAutoFills.textContent = appStats.autoFills;
}

async function refreshCVs() {
  elements.refreshCVs.disabled = true;
  elements.refreshCVs.textContent = '⟳';
  
  try {
    await loadUserCVs();
    showToast('CVs actualizados', 'success');
  } catch (error) {
    showToast('Error actualizando CVs', 'error');
  } finally {
    elements.refreshCVs.disabled = false;
    elements.refreshCVs.textContent = '↻';
  }
}

function showSettings() {
  // Implementar modal de configuración
  showToast('Configuración próximamente', 'info');
}

// Funciones de UI
function showAuthSection() {
  elements.authSection.style.display = 'flex';
  elements.mainSection.style.display = 'none';
  updateConnectionStatus('error', 'No conectado');
}

function showMainSection() {
  elements.authSection.style.display = 'none';
  elements.mainSection.style.display = 'block';
}

function showLoading(text = 'Cargando...') {
  elements.loadingText.textContent = text;
  elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  elements.loadingOverlay.style.display = 'none';
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  elements.toastContainer.appendChild(toast);
  
  // Auto-remove después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'authenticationChanged':
      checkAuthentication();
      break;
    case 'tabUpdated':
      getCurrentTabInfo().then(() => detectCurrentSite());
      break;
    default:
      break;
  }
  
  sendResponse({ received: true });
});

console.log('✅ ResumAI Extension Popup inicializado');
