# 🚀 Guía de Instalación - ResumAI Chrome Extension

Esta guía te llevará paso a paso para instalar y configurar la extensión de Chrome de ResumAI.

## 📋 Requisitos Previos

- **Google Chrome** versión 88 o superior
- **Cuenta activa en ResumAI** ([resumai.vercel.app](https://resumai.vercel.app))
- **CVs creados** en tu cuenta de ResumAI

## 🔧 Instalación

### Paso 1: Preparar la Extensión

1. **Ubicar la carpeta de la extensión**
   ```
   resumai-v0/chrome-extension/
   ```

2. **Verificar archivos necesarios**
   - ✅ `manifest.json`
   - ✅ `background.js`
   - ✅ `content.js`
   - ✅ `content.css`
   - ✅ `popup.html`
   - ✅ `popup.css`
   - ✅ `popup.js`
   - ✅ `injected.js`
   - ✅ Carpeta `icons/`

### Paso 2: Crear Iconos (Temporal)

Como los iconos no están incluidos, necesitas crear iconos temporales:

1. **Crear iconos básicos**
   ```bash
   # En la carpeta chrome-extension/icons/
   # Puedes usar cualquier imagen PNG de 16x16, 32x32, 48x48, 128x128
   # O usar iconos temporales de internet
   ```

2. **Iconos requeridos:**
   - `icon16.png` (16x16 píxeles)
   - `icon32.png` (32x32 píxeles)
   - `icon48.png` (48x48 píxeles)
   - `icon128.png` (128x128 píxeles)
   - `icon16-active.png` (versión activa)
   - `icon32-active.png` (versión activa)
   - `icon48-active.png` (versión activa)
   - `icon128-active.png` (versión activa)

### Paso 3: Instalar en Chrome

1. **Abrir Chrome**
   - Inicia Google Chrome

2. **Ir a Extensiones**
   - Escribe en la barra de direcciones: `chrome://extensions/`
   - O ve a Menú → Más herramientas → Extensiones

3. **Activar Modo Desarrollador**
   - En la esquina superior derecha, activa "Modo de desarrollador"

4. **Cargar Extensión**
   - Haz clic en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta `chrome-extension`
   - Haz clic en "Seleccionar carpeta"

5. **Verificar Instalación**
   - La extensión "ResumAI Job Assistant" debería aparecer en la lista
   - Verifica que esté habilitada (toggle azul)

## 🔑 Configuración Inicial

### Método 1: Autenticación Automática (Recomendado)

1. **Abrir ResumAI**
   - Ve a [resumai.vercel.app](https://resumai.vercel.app)
   - Inicia sesión con tu cuenta

2. **Activar la Extensión**
   - Haz clic en el ícono de ResumAI en la barra de herramientas
   - Selecciona "Abrir ResumAI" si no estás logueado
   - La extensión debería detectar automáticamente tu sesión

### Método 2: Token Manual

1. **Obtener Token de Supabase**
   - Abre ResumAI e inicia sesión
   - Presiona F12 para abrir DevTools
   - Ve a la pestaña "Application"
   - En el panel izquierdo, expande "Local Storage"
   - Busca la entrada de Supabase que contenga el token JWT
   - Copia el valor del token

2. **Configurar en la Extensión**
   - Haz clic en el ícono de la extensión
   - Pega el token en el campo correspondiente
   - Haz clic en "Conectar"

## 🧪 Verificar Instalación

### Prueba Básica

1. **Abrir un sitio compatible**
   - Ve a [trabajando.cl](https://trabajando.cl)
   - O [laborum.com](https://laborum.com)
   - O [getonboard.com](https://getonboard.com)

2. **Verificar Widget**
   - Busca una oferta de trabajo
   - Ve al formulario de postulación
   - Deberías ver el widget de ResumAI aparecer

3. **Probar Funcionalidad**
   - Haz clic en el ícono de la extensión
   - Verifica que muestre "Conectado a ResumAI"
   - Selecciona un CV de la lista
   - Prueba "Rellenar Formulario"

### Prueba Avanzada

1. **Ejecutar Script de Pruebas**
   - Abre DevTools (F12) en cualquier página
   - Ve a la pestaña "Console"
   - Copia y pega el contenido de `test-extension.js`
   - Ejecuta: `resumaiTester.quickTest()`

## 🔧 Solución de Problemas

### La extensión no aparece

**Problema:** No veo el ícono de ResumAI en la barra de herramientas

**Solución:**
1. Ve a `chrome://extensions/`
2. Verifica que "ResumAI Job Assistant" esté habilitada
3. Haz clic en el ícono de extensiones (puzzle) en la barra
4. Fija ResumAI haciendo clic en el pin

### Error de permisos

**Problema:** "Esta extensión no tiene permisos"

**Solución:**
1. Ve a `chrome://extensions/`
2. Haz clic en "Detalles" de ResumAI
3. Verifica que todos los permisos estén habilitados
4. Si no, habilítalos manualmente

### No se conecta a ResumAI

**Problema:** "Error de autenticación" o "Token inválido"

**Solución:**
1. Verifica que tengas una cuenta activa en ResumAI
2. Inicia sesión nuevamente en ResumAI
3. Obtén un nuevo token siguiendo el Método 2
4. O usa el botón "Abrir ResumAI" para autenticación automática

### Widget no aparece en sitios

**Problema:** No veo el widget en trabajando.cl, laborum.com, etc.

**Solución:**
1. Recarga la página completamente (Ctrl+F5)
2. Verifica que estés en una página de postulación de trabajo
3. Abre DevTools y busca errores en la consola
4. Verifica que la extensión tenga permisos para el sitio

### Formularios no se rellenan

**Problema:** El botón "Rellenar Formulario" no funciona

**Solución:**
1. Verifica que hayas seleccionado un CV
2. Asegúrate de que tu CV tenga datos completos
3. Algunos sitios tienen formularios no estándar
4. Prueba rellenar manualmente después de usar la extensión

## 📱 Uso Diario

### Flujo Típico

1. **Buscar Trabajo**
   - Ve a trabajando.cl, laborum.com o getonboard.com
   - Busca ofertas que te interesen

2. **Postular**
   - Haz clic en "Postular" en la oferta
   - El widget de ResumAI aparecerá automáticamente
   - O haz clic en el ícono de la extensión

3. **Rellenar y Enviar**
   - Selecciona tu CV preferido
   - Haz clic en "Rellenar Formulario"
   - Revisa los datos rellenados
   - Envía la postulación

### Consejos de Uso

- **Mantén tus CVs actualizados** en ResumAI
- **Revisa siempre** los datos antes de enviar
- **Usa diferentes CVs** para diferentes tipos de trabajo
- **Verifica** que el CV se adjunte correctamente

## 🔄 Actualizaciones

### Actualizar la Extensión

1. **Descargar nueva versión**
   - Obtén la nueva versión de la carpeta `chrome-extension`

2. **Reemplazar archivos**
   - Reemplaza los archivos en tu carpeta local

3. **Recargar en Chrome**
   - Ve a `chrome://extensions/`
   - Haz clic en el ícono de recarga de ResumAI

### Mantener Actualizado

- **Revisa regularmente** si hay nuevas versiones
- **Actualiza** cuando se agreguen nuevos sitios compatibles
- **Reporta problemas** para mejoras futuras

## 📞 Soporte

### Si necesitas ayuda:

1. **Revisa esta guía** completamente
2. **Ejecuta las pruebas** con `test-extension.js`
3. **Verifica la consola** del navegador para errores
4. **Contacta al equipo** de ResumAI con detalles específicos

### Información útil para soporte:

- Versión de Chrome
- Sistema operativo
- Sitio web donde ocurre el problema
- Mensajes de error específicos
- Pasos para reproducir el problema

---

**¡Listo! 🎉 Ya tienes ResumAI Chrome Extension instalada y configurada.**

**¿Problemas?** Revisa la sección de solución de problemas o contacta al soporte.
