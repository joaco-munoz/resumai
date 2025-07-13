
// Background Service Worker para ResumAI Chrome Extension

// Configuración de Supabase
const SUPABASE_URL = "https://jwitsagioonykrabioku.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aXRzYWdpb29ueWtyYWJpb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzI3MDUsImV4cCI6MjA2NTE0ODcwNX0.RJsdYdmkCTIigypfPXWhb8xsZXycVbiNytPXUJAkN9M";

// Sitios web compatibles
const SUPPORTED_SITES = [
  'trabajando.cl',
  'laborum.com',
  'getonboard.com'
];

// Inicialización de la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('ResumAI Job Assistant instalado correctamente');
});

// Escuchar mensajes del content script y popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Mensaje recibido:', request);
  
  switch (request.action) {
    case 'authenticate':
      handleAuthentication(request.email, request.password)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'refreshAuth':
      refreshAuthentication()
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'getUserCVs':
      getUserCVs()
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'getUserProfile':
      getUserProfile()
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'updateProfile':
      updateProfile(request.profileData)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'signOut':
      signOut()
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    default:
      sendResponse({ success: false, error: 'Acción no reconocida' });
  }
});

// Detectar cuando el usuario navega a un sitio compatible
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname.replace('www.', '');
    
    if (SUPPORTED_SITES.some(site => hostname.includes(site))) {
      // Activar el ícono de la extensión
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          "16": "icons/icon16-active.png",
          "32": "icons/icon32-active.png",
          "48": "icons/icon48-active.png",
          "128": "icons/icon128-active.png"
        }
      });
      
      // Inyectar el content script si no está ya inyectado
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => {
        console.log('Content script ya inyectado o error:', err);
      });
    }
  }
});

// Funciones de autenticación y API

async function handleAuthentication(email, password) {
  try {
    console.log('Iniciando autenticación con Supabase');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.message || 'Error de autenticación');
    }

    console.log('Autenticación exitosa');

    // Guardar tokens y datos del usuario
    await chrome.storage.local.set({
      authToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
      expiresAt: Date.now() + (data.expires_in * 1000),
      lastAuth: Date.now()
    });

    return { 
      user: data.user, 
      authenticated: true,
      token: data.access_token
    };
  } catch (error) {
    console.error('Error en autenticación:', error);
    throw error;
  }
}

async function refreshAuthentication() {
  try {
    const result = await chrome.storage.local.get(['refreshToken', 'expiresAt']);
    
    if (!result.refreshToken) {
      throw new Error('No hay token de refresh disponible');
    }

    // Verificar si el token aún es válido
    if (result.expiresAt && Date.now() < result.expiresAt - 60000) { // 1 minuto de margen
      const userResult = await chrome.storage.local.get(['user', 'authToken']);
      return { 
        user: userResult.user, 
        authenticated: true,
        token: userResult.authToken
      };
    }

    console.log('Refrescando token de autenticación');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        refresh_token: result.refreshToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.message || 'Error al refrescar token');
    }

    // Actualizar tokens
    await chrome.storage.local.set({
      authToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
      expiresAt: Date.now() + (data.expires_in * 1000),
      lastAuth: Date.now()
    });

    return { 
      user: data.user, 
      authenticated: true,
      token: data.access_token
    };
  } catch (error) {
    console.error('Error refrescando autenticación:', error);
    // Limpiar datos si hay error
    await chrome.storage.local.clear();
    throw error;
  }
}

async function getUserCVs() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('Obteniendo CVs del usuario');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/cvs?user_id=eq.${result.user.id}&cv_source=eq.editor&select=id,title,created_at,content,is_favorite&order=is_favorite.desc,created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener CVs');
    }

    const cvs = await response.json();
    console.log('CVs obtenidos:', cvs.length);
    
    return cvs;
  } catch (error) {
    console.error('Error obteniendo CVs:', error);
    throw error;
  }
}

async function getUserProfile() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('Obteniendo perfil del usuario');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${result.user.id}&select=*`, {
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener perfil');
    }

    const profiles = await response.json();
    console.log('Perfil obtenido:', profiles[0]);
    
    return profiles[0] || null;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw error;
  }
}

async function updateProfile(profileData) {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('Actualizando perfil del usuario');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${result.user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ...profileData,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar perfil');
    }

    console.log('Perfil actualizado correctamente');
    return true;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
}

async function signOut() {
  try {
    const result = await chrome.storage.local.get(['authToken']);
    
    if (result.authToken) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${result.authToken}`,
          'apikey': SUPABASE_ANON_KEY
        }
      });
    }
    
    // Limpiar storage local
    await chrome.storage.local.clear();
    console.log('Sesión cerrada correctamente');
    
    return true;
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    // Limpiar storage aunque haya error
    await chrome.storage.local.clear();
    return true;
  }
}

// Limpiar datos expirados
chrome.alarms.create('cleanupExpiredData', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupExpiredData') {
    chrome.storage.local.get(['expiresAt'], (result) => {
      if (result.expiresAt && Date.now() > result.expiresAt) {
        console.log('Token expirado, limpiando datos');
        chrome.storage.local.clear();
      }
    });
  }
});
