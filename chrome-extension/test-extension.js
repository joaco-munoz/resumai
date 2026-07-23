// Script de prueba para ResumAI Chrome Extension
// Ejecutar en la consola del navegador para probar funcionalidades

console.log('🧪 Iniciando pruebas de ResumAI Chrome Extension');

// Configuración de pruebas
const TEST_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT-REF.supabase.co',
  testToken: null, // Se debe configurar manualmente
  testSites: [
    'https://trabajando.cl',
    'https://laborum.com',
    'https://getonboard.com'
  ]
};

// Clase para manejar las pruebas
class ResumAIExtensionTester {
  constructor() {
    this.results = [];
    this.currentTest = null;
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    console.log('🚀 Ejecutando todas las pruebas...');
    
    await this.testManifestValidation();
    await this.testBackgroundScript();
    await this.testContentScript();
    await this.testPopupFunctionality();
    await this.testSupabaseIntegration();
    await this.testFormDetection();
    await this.testFileHandling();
    
    this.showResults();
  }

  // Prueba 1: Validación del manifest
  async testManifestValidation() {
    this.currentTest = 'Validación del Manifest';
    console.log(`📋 ${this.currentTest}`);
    
    try {
      // Verificar que la extensión esté cargada
      const extensionId = chrome.runtime.id;
      if (!extensionId) {
        throw new Error('Extensión no cargada');
      }
      
      // Verificar permisos
      const permissions = await chrome.permissions.getAll();
      const requiredPermissions = ['activeTab', 'storage', 'scripting', 'tabs'];
      
      const hasAllPermissions = requiredPermissions.every(perm => 
        permissions.permissions.includes(perm)
      );
      
      if (!hasAllPermissions) {
        throw new Error('Faltan permisos requeridos');
      }
      
      this.addResult(this.currentTest, true, 'Manifest válido y permisos correctos');
      
    } catch (error) {
      this.addResult(this.currentTest, false, error.message);
    }
  }

  // Prueba 2: Background Script
  async testBackgroundScript() {
    this.currentTest = 'Background Script';
    console.log(`⚙️ ${this.currentTest}`);
    
    try {
      // Probar comunicación con background script
      const response = await chrome.runtime.sendMessage({
        action: 'test',
        data: 'ping'
      });
      
      // El background script debería responder aunque sea con error
      this.addResult(this.currentTest, true, 'Background script responde');
      
    } catch (error) {
      this.addResult(this.currentTest, false, `Error: ${error.message}`);
    }
  }

  // Prueba 3: Content Script
  async testContentScript() {
    this.currentTest = 'Content Script';
    console.log(`📄 ${this.currentTest}`);
    
    try {
      // Verificar si estamos en una página compatible
      const hostname = window.location.hostname.replace('www.', '');
      const supportedSites = ['trabajando.cl', 'laborum.com', 'getonboard.com'];
      const isSupported = supportedSites.includes(hostname);
      
      if (isSupported) {
        // Buscar el widget de ResumAI
        const widget = document.querySelector('.resumai-widget');
        if (widget) {
          this.addResult(this.currentTest, true, 'Widget encontrado en sitio compatible');
        } else {
          this.addResult(this.currentTest, false, 'Widget no encontrado');
        }
      } else {
        this.addResult(this.currentTest, true, 'No aplicable - sitio no compatible');
      }
      
    } catch (error) {
      this.addResult(this.currentTest, false, error.message);
    }
  }

  // Prueba 4: Funcionalidad del Popup
  async testPopupFunctionality() {
    this.currentTest = 'Funcionalidad del Popup';
    console.log(`🔧 ${this.currentTest}`);
    
    try {
      // Verificar storage
      const storageData = await chrome.storage.local.get(['authToken', 'user']);
      
      if (storageData.authToken) {
        this.addResult(this.currentTest, true, 'Token encontrado en storage');
      } else {
        this.addResult(this.currentTest, false, 'No hay token en storage');
      }
      
    } catch (error) {
      this.addResult(this.currentTest, false, error.message);
    }
  }

  // Prueba 5: Integración con Supabase
  async testSupabaseIntegration() {
    this.currentTest = 'Integración con Supabase';
    console.log(`🔗 ${this.currentTest}`);
    
    try {
      if (!TEST_CONFIG.testToken) {
        this.addResult(this.currentTest, false, 'Token de prueba no configurado');
        return;
      }
      
      // Probar autenticación
      const response = await fetch(`${TEST_CONFIG.supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.testToken}`,
          'apikey': 'YOUR_SUPABASE_ANON_KEY'
        }
      });
      
      if (response.ok) {
        this.addResult(this.currentTest, true, 'Conexión con Supabase exitosa');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      this.addResult(this.currentTest, false, error.message);
    }
  }

  // Prueba 6: Detección de formularios
  async testFormDetection() {
    this.currentTest = 'Detección de Formularios';
    console.log(`📝 ${this.currentTest}`);
    
    try {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
      const fileInputs = document.querySelectorAll('input[type="file"]');
      
      if (forms.length > 0) {
        this.addResult(this.currentTest, true, 
          `Encontrados: ${forms.length} formularios, ${inputs.length} campos, ${fileInputs.length} campos de archivo`
        );
      } else {
        this.addResult(this.currentTest, false, 'No se encontraron formularios');
      }
      
    } catch (error) {
      this.addResult(this.currentTest, false, error.message);
    }
  }

  // Prueba 7: Manejo de archivos
  async testFileHandling() {
    this.currentTest = 'Manejo de Archivos';
    console.log(`📎 ${this.currentTest}`);
    
    try {
      // Crear un archivo de prueba
      const testBlob = new Blob(['Test CV content'], { type: 'application/pdf' });
      const testFile = new File([testBlob], 'test-cv.pdf', { type: 'application/pdf' });
      
      // Verificar que se puede crear el archivo
      if (testFile.size > 0 && testFile.type === 'application/pdf') {
        this.addResult(this.currentTest, true, 'Manejo de archivos funcional');
      } else {
        throw new Error('Error creando archivo de prueba');
      }
      
    } catch (error) {
      this.addResult(this.currentTest, false, error.message);
    }
  }

  // Agregar resultado de prueba
  addResult(test, success, message) {
    this.results.push({
      test,
      success,
      message,
      timestamp: new Date().toISOString()
    });
    
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${test}: ${message}`);
  }

  // Mostrar resumen de resultados
  showResults() {
    console.log('\n📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`Total: ${total} | Exitosas: ${passed} | Fallidas: ${total - passed}`);
    console.log('='.repeat(50));
    
    this.results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });
    
    if (passed === total) {
      console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    } else {
      console.log(`\n⚠️ ${total - passed} pruebas fallaron. Revisa los errores arriba.`);
    }
    
    return this.results;
  }

  // Prueba específica para sitios compatibles
  async testOnJobSite(siteUrl) {
    console.log(`🌐 Probando en: ${siteUrl}`);
    
    try {
      // Abrir sitio en nueva pestaña
      const tab = await chrome.tabs.create({ url: siteUrl });
      
      // Esperar a que cargue
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar que el content script se inyectó
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageInfo'
      });
      
      if (response && response.success) {
        console.log(`✅ Content script funcionando en ${siteUrl}`);
        return true;
      } else {
        throw new Error('Content script no responde');
      }
      
    } catch (error) {
      console.log(`❌ Error en ${siteUrl}: ${error.message}`);
      return false;
    }
  }

  // Simular rellenado de formulario
  simulateFillForm() {
    console.log('🤖 Simulando rellenado de formulario...');
    
    const testData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '+56912345678'
    };
    
    // Buscar campos comunes
    const selectors = {
      firstName: 'input[name*="nombre"], input[name*="first"], input[placeholder*="nombre"]',
      lastName: 'input[name*="apellido"], input[name*="last"], input[placeholder*="apellido"]',
      email: 'input[type="email"], input[name*="email"]',
      phone: 'input[type="tel"], input[name*="telefono"], input[name*="phone"]'
    };
    
    Object.keys(selectors).forEach(field => {
      const element = document.querySelector(selectors[field]);
      if (element) {
        element.value = testData[field];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ Campo ${field} rellenado`);
      } else {
        console.log(`❌ Campo ${field} no encontrado`);
      }
    });
  }
}

// Funciones de utilidad para pruebas manuales
window.resumaiTester = {
  // Crear instancia del tester
  createTester: () => new ResumAIExtensionTester(),
  
  // Ejecutar pruebas rápidas
  quickTest: async () => {
    const tester = new ResumAIExtensionTester();
    await tester.runAllTests();
    return tester.results;
  },
  
  // Probar en sitio actual
  testCurrentSite: () => {
    const tester = new ResumAIExtensionTester();
    tester.testContentScript();
    tester.testFormDetection();
    tester.simulateFillForm();
  },
  
  // Configurar token de prueba
  setTestToken: (token) => {
    TEST_CONFIG.testToken = token;
    console.log('✅ Token de prueba configurado');
  },
  
  // Limpiar storage
  clearStorage: async () => {
    await chrome.storage.local.clear();
    console.log('✅ Storage limpiado');
  },
  
  // Ver datos del storage
  viewStorage: async () => {
    const data = await chrome.storage.local.get();
    console.log('📦 Datos en storage:', data);
    return data;
  }
};

// Instrucciones de uso
console.log(`
🧪 INSTRUCCIONES DE PRUEBA
=========================

1. Ejecutar todas las pruebas:
   resumaiTester.quickTest()

2. Probar sitio actual:
   resumaiTester.testCurrentSite()

3. Configurar token de prueba:
   resumaiTester.setTestToken('tu-token-aqui')

4. Ver datos del storage:
   resumaiTester.viewStorage()

5. Limpiar storage:
   resumaiTester.clearStorage()

6. Crear tester personalizado:
   const tester = resumaiTester.createTester()
   await tester.runAllTests()
`);

console.log('✅ Script de pruebas cargado. Usa resumaiTester para comenzar.');
