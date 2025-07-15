
// ResumAI Chrome Extension - Enhanced Popup Script with Real Authentication

// Variables globales
let currentUser = null;
let currentCVs = [];
let selectedCV = null;
let userProfile = null;
let currentTab = null;
let appStats = { applications: 0, autoFills: 0 };
let isAuthenticated = false;
let authCheckTimeout = null;

// Elementos del DOM
const elements = {
  // Auth elements
  authSection: document.getElementById('authSection'),
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  loginBtn: document.getElementById('loginBtn'),
  loginBtnText: document.getElementById('loginBtnText'),
  loginSpinner: document.getElementById('loginSpinner'),
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
  signOutBtn: document.getElementById('signOutBtn'),
  
  // Navigation tabs
  autofillTab: document.getElementById('autofillTab'),
  profileTab: document.getElementById('profileTab'),
  autofillContent: document.getElementById('autofillContent'),
  profileContent: document.getElementById('profileContent'),
  
  // Page detection
  detectedSite: document.getElementById('detectedSite'),
  detectionStatus: document.getElementById('detectionStatus'),
  
  // CV elements
  cvSelect: document.getElementById('cvSelect'),
  refreshCVs: document.getElementById('refreshCVs'),
  cvPreview: document.getElementById('cvPreview'),
  cvTitle: document.getElementById('cvTitle'),
  cvDetails: document.getElementById('cvDetails'),
  
  // Profile display elements
  profileDisplay: document.getElementById('profileDisplay'),
  displayFullName: document.getElementById('displayFullName'),
  displayEmail: document.getElementById('displayEmail'),
  displayPhone: document.getElementById('displayPhone'),
  displayLocation: document.getElementById('displayLocation'),
  displayJobTitle: document.getElementById('displayJobTitle'),
  displayCompany: document.getElementById('displayCompany'),
  
  // Profile form elements
  profileForm: document.getElementById('profileForm'),
  profileFullName: document.getElementById('profileFullName'),
  profileEmail: document.getElementById('profileEmail'),
  profilePhone: document.getElementById('profilePhone'),
  profileLocation: document.getElementById('profileLocation'),
  profileJobTitle: document.getElementById('profileJobTitle'),
  profileCompany: document.getElementById('profileCompany'),
  editProfileBtn: document.getElementById('editProfileBtn'),
  saveProfileBtn: document.getElementById('saveProfileBtn'),
  saveProfileText: document.getElementById('saveProfileText'),
  saveSpinner: document.getElementById('saveSpinner'),
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
  elements.signOutBtn.addEventListener('click', handleSignOut);
  
  // Navigation events
  elements.autofillTab.addEventListener('click', () => switchTab('autofill'));
  elements.profileTab.addEventListener('click', () => switchTab('profile'));
  
  // Main events
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
      'user', 
      'authToken',
      'appStats'
    ]);
    
    currentUser = result.user || null;
    appStats = result.appStats || { applications: 0, autoFills: 0 };
    
    updateStatsDisplay();
  } catch (error) {
    console.error('Error loading stored data:', error);
  }
}

async function checkAuthentication() {
  console.log('🔍 Iniciando verificación de autenticación');
  showLoading('Verificando autenticación...');
  
  // Configurar timeout de 5 segundos para evitar bucles infinitos
  authCheckTimeout = setTimeout(() => {
    console.log('⚠️ Timeout en verificación de autenticación - mostrando pantalla de login');
    hideLoading();
    showAuthSection();
    updateConnectionStatus('error', 'Timeout de conexión');
  }, 5000);
  
  try {
    console.log('📡 Enviando mensaje checkAuth al background script');
    
    const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });
    
    // Limpiar timeout ya que obtuvimos respuesta
    if (authCheckTimeout) {
      clearTimeout(authCheckTimeout);
      authCheckTimeout = null;
    }
    
    console.log('✅ Respuesta recibida de background script:', response);
    
    if (response && response.success && response.authenticated) {
      console.log('🎉 Usuario autenticado:', response.user?.email);
      currentUser = response.user;
      isAuthenticated = true;
      await loadMainInterface();
    } else {
      console.log('❌ Usuario no autenticado');
      isAuthenticated = false;
      showAuthSection();
      updateConnectionStatus('disconnected', 'No conectado');
    }
    
  } catch (error) {
    // Limpiar timeout en caso de error
    if (authCheckTimeout) {
      clearTimeout(authCheckTimeout);
      authCheckTimeout = null;
    }
    
    console.error('💥 Error verificando autenticación:', error);
    isAuthenticated = false;
    showAuthSection();
    updateConnectionStatus('error', 'Error de conexión');
    showToast('Error al verificar la autenticación', 'error');
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
  
  // Mostrar spinner
  elements.loginBtn.disabled = true;
  elements.loginBtnText.style.display = 'none';
  elements.loginSpinner.style.display = 'block';
  
  try {
    console.log('🔐 Intentando autenticar con:', email);
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'authenticate',
      email: email,
      password: password
    });
    
    if (response && response.success && response.authenticated) {
      console.log('✅ Autenticación exitosa');
      currentUser = response.user;
      isAuthenticated = true;
      
      // Limpiar formulario
      elements.emailInput.value = '';
      elements.passwordInput.value = '';
      
      await loadMainInterface();
      showToast('Sesión iniciada correctamente', 'success');
    } else {
      console.error('❌ Error de autenticación:', response?.error);
      let errorMessage = response?.error || 'Error al iniciar sesión';
      showToast(errorMessage, 'error');
      isAuthenticated = false;
    }
    
  } catch (error) {
    console.error('💥 Error en login:', error);
    showToast('Error de conexión. Verifica tu internet.', 'error');
    isAuthenticated = false;
  } finally {
    elements.loginBtn.disabled = false;
    elements.loginBtnText.style.display = 'block';
    elements.loginSpinner.style.display = 'none';
  }
}

async function handleSignOut() {
  try {
    await chrome.runtime.sendMessage({ action: 'signOut' });
    
    // Limpiar estado local
    currentUser = null;
    isAuthenticated = false;
    currentCVs = [];
    selectedCV = null;
    userProfile = null;
    
    showAuthSection();
    showToast('Sesión cerrada correctamente', 'success');
    
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    showToast('Error al cerrar sesión', 'error');
  }
}

async function loadMainInterface() {
  console.log('🏠 Cargando interfaz principal');
  updateUserInfo();
  updateConnectionStatus('connected', 'Conectado a ResumAI');
  await loadUserCVs();
  await loadUserProfile();
  showMainSection();
}

function updateUserInfo() {
  if (!currentUser) return;
  
  const displayName = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
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
    console.log('📄 Cargando CVs del usuario...');
    
    const response = await chrome.runtime.sendMessage({ action: 'getUserCVs' });
    
    if (response && response.success) {
      currentCVs = response.data || [];
      console.log('✅ CVs cargados:', currentCVs.length);
      updateCVSelector();
    } else {
      console.error('❌ Error cargando CVs:', response?.error);
      showToast('Error al cargar CVs', 'error');
    }
    
  } catch (error) {
    console.error('💥 Error cargando CVs:', error);
    showToast('Error al cargar CVs', 'error');
  }
}

function updateCVSelector() {
  elements.cvSelect.innerHTML = '<option value="">Seleccionar CV...</option>';
  
  if (currentCVs.length === 0) {
    elements.cvSelect.innerHTML = '<option value="">No hay CVs disponibles</option>';
    return;
  }
  
  currentCVs.forEach(cv => {
    const option = document.createElement('option');
    option.value = cv.id;
    option.textContent = `${cv.is_favorite ? '⭐ ' : ''}${cv.title}`;
    elements.cvSelect.appendChild(option);
  });
  
  // Auto-seleccionar CV favorito o el primero
  const favoriteCV = currentCVs.find(cv => cv.is_favorite);
  const cvToSelect = favoriteCV || currentCVs[0];
  if (cvToSelect) {
    elements.cvSelect.value = cvToSelect.id;
    handleCVSelection();
  }
}

async function handleCVSelection() {
  const selectedCVId = elements.cvSelect.value;
  
  if (!selectedCVId) {
    elements.cvPreview.style.display = 'none';
    selectedCV = null;
    elements.autofillBtn.disabled = true;
    elements.autoApplyBtn.disabled = true;
    return;
  }
  
  selectedCV = currentCVs.find(cv => cv.id === selectedCVId);
  
  if (selectedCV) {
    elements.cvTitle.textContent = selectedCV.title;
    elements.cvDetails.textContent = `Creado: ${new Date(selectedCV.created_at).toLocaleDateString('es-ES')}`;
    elements.cvPreview.style.display = 'block';
    
    // Verificar detección de sitio para habilitar botones
    await detectCurrentSite();
  }
}

async function loadUserProfile() {
  try {
    console.log('👤 Cargando perfil del usuario...');
    
    const response = await chrome.runtime.sendMessage({ action: 'getUserProfile' });
    
    if (response && response.success && response.data) {
      userProfile = response.data;
      console.log('✅ Perfil cargado:', userProfile);
      updateProfileDisplay();
    } else {
      console.log('ℹ️ No hay perfil disponible, creando perfil básico');
      // Crear perfil básico con datos del usuario
      userProfile = {
        full_name: currentUser?.user_metadata?.full_name || '',
        email: currentUser?.email || '',
        phone: '',
        city: '',
        country: '',
        job_title: '',
        company: ''
      };
      updateProfileDisplay();
    }
    
  } catch (error) {
    console.error('💥 Error cargando perfil:', error);
  }
}

function updateProfileDisplay() {
  if (!userProfile) return;
  
  elements.displayFullName.textContent = userProfile.full_name || '-';
  elements.displayEmail.textContent = userProfile.email || '-';
  elements.displayPhone.textContent = userProfile.phone || '-';
  
  const location = [userProfile.city, userProfile.country].filter(Boolean).join(', ');
  elements.displayLocation.textContent = location || '-';
  
  elements.displayJobTitle.textContent = userProfile.job_title || '-';
  elements.displayCompany.textContent = userProfile.company || '-';
}

function switchTab(tabName) {
  // Actualizar tabs
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  if (tabName === 'autofill') {
    elements.autofillTab.classList.add('active');
    elements.autofillContent.classList.add('active');
  } else if (tabName === 'profile') {
    elements.profileTab.classList.add('active');
    elements.profileContent.classList.add('active');
  }
}

function toggleProfileEdit() {
  const isEditing = elements.profileForm.style.display !== 'none';
  
  if (isEditing) {
    cancelProfileEdit();
  } else {
    // Llenar formulario con datos actuales
    elements.profileFullName.value = userProfile?.full_name || '';
    elements.profileEmail.value = userProfile?.email || '';
    elements.profilePhone.value = userProfile?.phone || '';
    
    const location = [userProfile?.city, userProfile?.country].filter(Boolean).join(', ');
    elements.profileLocation.value = location || '';
    
    elements.profileJobTitle.value = userProfile?.job_title || '';
    elements.profileCompany.value = userProfile?.company || '';
    
    elements.profileDisplay.style.display = 'none';
    elements.profileForm.style.display = 'block';
    elements.editProfileBtn.textContent = 'Cancelar';
  }
}

async function saveProfile() {
  // Mostrar spinner
  elements.saveProfileBtn.disabled = true;
  elements.saveProfileText.style.display = 'none';
  elements.saveSpinner.style.display = 'block';
  
  try {
    const locationParts = elements.profileLocation.value.split(',').map(part => part.trim());
    const city = locationParts[0] || '';
    const country = locationParts[1] || '';

    const profileData = {
      full_name: elements.profileFullName.value.trim(),
      email: elements.profileEmail.value.trim(),
      phone: elements.profilePhone.value.trim(),
      city: city,
      country: country,
      job_title: elements.profileJobTitle.value.trim(),
      company: elements.profileCompany.value.trim()
    };
    
    console.log('💾 Guardando perfil:', profileData);
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'updateProfile',
      profileData: profileData
    });
    
    if (response && response.success) {
      userProfile = { ...userProfile, ...profileData };
      updateProfileDisplay();
      cancelProfileEdit();
      showToast('Perfil actualizado correctamente', 'success');
    } else {
      console.error('❌ Error actualizando perfil:', response?.error);
      showToast('Error al actualizar perfil', 'error');
    }
    
  } catch (error) {
    console.error('💥 Error guardando perfil:', error);
    showToast('Error al guardar perfil', 'error');
  } finally {
    elements.saveProfileBtn.disabled = false;
    elements.saveProfileText.style.display = 'block';
    elements.saveSpinner.style.display = 'none';
  }
}

function cancelProfileEdit() {
  elements.profileDisplay.style.display = 'block';
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
    if (selectedCV && isAuthenticated) {
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
  if (!selectedCV || !currentTab || !isAuthenticated) {
    showToast('Selecciona un CV primero', 'warning');
    return;
  }
  
  showLoading('Rellenando formulario...');
  
  try {
    // Combinar datos del CV y perfil
    const autofillData = {
      personalInfo: selectedCV.content?.personalInfo || {},
      profile: userProfile || {}
    };
    
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'autofill',
      data: autofillData
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
  if (!selectedCV || !currentTab || !isAuthenticated) {
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
    // Combinar datos del CV y perfil
    const applicationData = {
      personalInfo: selectedCV.content?.personalInfo || {},
      profile: userProfile || {}
    };
    
    // Enviar mensaje al content script
    await chrome.tabs.sendMessage(currentTab.id, {
      action: 'autoApply',
      data: applicationData
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

// Funciones de UI
function showAuthSection() {
  console.log('🔐 Mostrando sección de autenticación');
  elements.authSection.style.display = 'flex';
  elements.mainSection.style.display = 'none';
  updateConnectionStatus('error', 'No conectado');
}

function showMainSection() {
  console.log('🏠 Mostrando sección principal');
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
  console.log('📨 Mensaje recibido en popup:', request);
  
  switch (request.action) {
    case 'authenticationChanged':
      console.log('🔄 Estado de autenticación cambió');
      checkAuthentication();
      break;
    case 'tabUpdated':
      console.log('🔄 Tab actualizada');
      getCurrentTabInfo().then(() => detectCurrentSite());
      break;
    default:
      console.log('❓ Acción no reconocida:', request.action);
      break;
  }
  
  sendResponse({ received: true });
});

console.log('✅ ResumAI Extension Popup inicializado');
