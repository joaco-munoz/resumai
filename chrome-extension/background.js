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
      handleAuthentication(request.token)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Mantener el canal abierto para respuesta asíncrona
      
    case 'getUserData':
      getUserData(request.token)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'getUserCVs':
      getUserCVs(request.token)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'getCVContent':
      getCVContent(request.cvId, request.token)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'downloadCV':
      downloadCV(request.cvId, request.token)
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
    
    if (SUPPORTED_SITES.includes(hostname)) {
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
        // El script ya está inyectado o hay un error
        console.log('Content script ya inyectado o error:', err);
      });
    }
  }
});

// Funciones de API para Supabase

async function handleAuthentication(token) {
  try {
    // Verificar el token con Supabase
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Token inválido');
    }
    
    const user = await response.json();
    
    // Guardar el token en storage
    await chrome.storage.local.set({ 
      authToken: token,
      user: user,
      lastAuth: Date.now()
    });
    
    return { user, authenticated: true };
  } catch (error) {
    console.error('Error en autenticación:', error);
    throw error;
  }
}

async function getUserData(token) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario');
    }
    
    const profiles = await response.json();
    return profiles[0] || null;
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    throw error;
  }
}

async function getUserCVs(token) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/cvs?select=*&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener CVs');
    }
    
    const cvs = await response.json();
    return cvs;
  } catch (error) {
    console.error('Error obteniendo CVs:', error);
    throw error;
  }
}

async function getCVContent(cvId, token) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/cvs?id=eq.${cvId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener contenido del CV');
    }
    
    const cvs = await response.json();
    return cvs[0] || null;
  } catch (error) {
    console.error('Error obteniendo contenido del CV:', error);
    throw error;
  }
}

async function downloadCV(cvId, token) {
  try {
    // Obtener la URL del archivo del CV desde Supabase Storage
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/cvs/${cvId}.pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn: 3600 }) // 1 hora
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener URL del CV');
    }
    
    const { signedURL } = await response.json();
    
    // Descargar el archivo
    const fileResponse = await fetch(signedURL);
    if (!fileResponse.ok) {
      throw new Error('Error al descargar el CV');
    }
    
    const blob = await fileResponse.blob();
    const arrayBuffer = await blob.arrayBuffer();
    
    return {
      data: Array.from(new Uint8Array(arrayBuffer)),
      filename: `cv_${cvId}.pdf`,
      mimeType: 'application/pdf'
    };
  } catch (error) {
    console.error('Error descargando CV:', error);
    throw error;
  }
}

// Limpiar datos expirados
chrome.alarms.create('cleanupExpiredData', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupExpiredData') {
    chrome.storage.local.get(['lastAuth'], (result) => {
      const lastAuth = result.lastAuth || 0;
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - lastAuth > oneDay) {
        // Limpiar datos expirados
        chrome.storage.local.clear();
        console.log('Datos de autenticación limpiados por expiración');
      }
    });
  }
});
