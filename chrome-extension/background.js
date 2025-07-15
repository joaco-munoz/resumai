
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
  console.log('✅ ResumAI Job Assistant instalado correctamente');
});

// Escuchar mensajes del content script y popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Mensaje recibido en background:', request.action);
  
  switch (request.action) {
    case 'authenticate':
      console.log('🔐 Procesando autenticación...');
      handleAuthentication(request.email, request.password)
        .then(result => {
          console.log('✅ Autenticación completada:', result.authenticated);
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Error en autenticación:', error.message);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    case 'checkAuth':
      console.log('🔍 Verificando estado de autenticación...');
      checkAuthentication()
        .then(result => {
          console.log('📊 Estado de auth:', result.authenticated ? 'autenticado' : 'no autenticado');
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Error verificando auth:', error.message);
          sendResponse({ success: false, error: error.message, data: { authenticated: false } });
        });
      return true;
      
    case 'getUserCVs':
      console.log('📄 Obteniendo CVs del usuario...');
      getUserCVs()
        .then(result => {
          console.log('✅ CVs obtenidos:', result.length);
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Error obteniendo CVs:', error.message);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    case 'getUserProfile':
      console.log('👤 Obteniendo perfil del usuario...');
      getUserProfile()
        .then(result => {
          console.log('✅ Perfil obtenido');
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Error obteniendo perfil:', error.message);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    case 'updateProfile':
      console.log('💾 Actualizando perfil del usuario...');
      updateProfile(request.profileData)
        .then(result => {
          console.log('✅ Perfil actualizado');
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Error actualizando perfil:', error.message);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    case 'signOut':
      console.log('🚪 Cerrando sesión...');
      signOut()
        .then(result => {
          console.log('✅ Sesión cerrada');
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Error cerrando sesión:', error.message);
          sendResponse({ success: false, error: error.message });
        });
      return true;
      
    default:
      console.log('❓ Acción no reconocida:', request.action);
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
    console.log('🔐 Iniciando autenticación con Supabase para:', email);
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error_description || data.message || 'Error de autenticación';
      console.error('❌ Error en respuesta de autenticación:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ Autenticación exitosa con Supabase');

    // Guardar tokens y datos del usuario
    const authData = {
      authToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
      expiresAt: Date.now() + (data.expires_in * 1000),
      lastAuth: Date.now()
    };

    await chrome.storage.local.set(authData);
    console.log('💾 Datos de autenticación guardados en storage');

    return { 
      user: data.user, 
      authenticated: true,
      token: data.access_token
    };
  } catch (error) {
    console.error('💥 Error en handleAuthentication:', error);
    throw error;
  }
}

async function checkAuthentication() {
  try {
    console.log('🔍 Verificando autenticación almacenada...');
    
    const result = await chrome.storage.local.get(['authToken', 'refreshToken', 'user', 'expiresAt']);
    
    if (!result.authToken || !result.user) {
      console.log('❌ No hay token o usuario guardado');
      return { authenticated: false };
    }

    // Verificar si el token ha expirado
    const now = Date.now();
    const expirationBuffer = 60000; // 1 minuto de margen
    
    if (result.expiresAt && now > (result.expiresAt - expirationBuffer)) {
      console.log('⏰ Token expirado, intentando refrescar...');
      if (result.refreshToken) {
        return await refreshToken(result.refreshToken);
      } else {
        console.log('❌ No hay refresh token disponible');
        await chrome.storage.local.clear();
        return { authenticated: false };
      }
    }

    console.log('✅ Token válido, usuario autenticado:', result.user.email);
    return { 
      user: result.user, 
      authenticated: true,
      token: result.authToken
    };
    
  } catch (error) {
    console.error('💥 Error en checkAuthentication:', error);
    // En caso de error, limpiar storage y devolver no autenticado
    await chrome.storage.local.clear();
    return { authenticated: false };
  }
}

async function refreshToken(refreshToken) {
  try {
    if (!refreshToken) {
      throw new Error('No hay token de refresh disponible');
    }

    console.log('🔄 Refrescando token de autenticación...');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.message || 'Error al refrescar token');
    }

    console.log('✅ Token refrescado exitosamente');

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
    console.error('💥 Error refrescando token:', error);
    // Limpiar datos si hay error
    await chrome.storage.local.clear();
    return { authenticated: false };
  }
}

async function getUserCVs() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('📄 Obteniendo CVs del usuario:', result.user.email);

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
    console.log('✅ CVs obtenidos exitosamente:', cvs.length);
    
    return cvs;
  } catch (error) {
    console.error('💥 Error en getUserCVs:', error);
    throw error;
  }
}

async function getUserProfile() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('👤 Obteniendo perfil del usuario:', result.user.email);

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
    console.log('✅ Perfil obtenido exitosamente');
    
    return profiles[0] || null;
  } catch (error) {
    console.error('💥 Error en getUserProfile:', error);
    throw error;
  }
}

async function updateProfile(profileData) {
  try {
    const result = await chrome.storage.local.get(['authToken', 'user']);
    
    if (!result.authToken || !result.user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('💾 Actualizando perfil del usuario:', result.user.email);

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

    console.log('✅ Perfil actualizado correctamente');
    return true;
  } catch (error) {
    console.error('💥 Error en updateProfile:', error);
    throw error;
  }
}

async function signOut() {
  try {
    const result = await chrome.storage.local.get(['authToken']);
    
    if (result.authToken) {
      console.log('🚪 Cerrando sesión en Supabase...');
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${result.authToken}`,
            'apikey': SUPABASE_ANON_KEY
          }
        });
      } catch (logoutError) {
        console.log('⚠️ Error en logout de Supabase (continuando):', logoutError);
      }
    }
    
    // Limpiar storage local
    await chrome.storage.local.clear();
    console.log('✅ Storage local limpiado');
    
    return true;
  } catch (error) {
    console.error('💥 Error en signOut:', error);
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
        console.log('🧹 Token expirado, limpiando datos automáticamente');
        chrome.storage.local.clear();
      }
    });
  }
});

console.log('✅ Background script inicializado correctamente');
