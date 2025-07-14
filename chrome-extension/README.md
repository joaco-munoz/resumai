# ResumAI Chrome Extension

Extensión de Chrome para automatizar la postulación a empleos en portales chilenos usando tus CVs de ResumAI.

## 🚀 Características

- **Autenticación segura** con tokens de Supabase
- **Detección automática** de formularios de postulación
- **Rellenado automático** de datos personales
- **Selección de CVs** desde tu cuenta de ResumAI
- **Adjuntar CVs** automáticamente (cuando sea posible)
- **Postulación con un clic** para máxima eficiencia

## 🌐 Sitios Compatibles

- **Trabajando.cl** - Portal de empleos líder en Chile
- **Laborum.com** - Plataforma de búsqueda de empleo
- **GetOnBoard.com** - Empleos en tecnología

## 📦 Instalación

### Método 1: Instalación Manual (Desarrollo)

1. **Descargar la extensión**
   ```bash
   # Si tienes el proyecto ResumAI clonado
   cd resumai-v0/chrome-extension
   ```

2. **Abrir Chrome y ir a extensiones**
   - Abre Chrome
   - Ve a `chrome://extensions/`
   - Activa el "Modo de desarrollador" (esquina superior derecha)

3. **Cargar la extensión**
   - Haz clic en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta `chrome-extension`
   - La extensión aparecerá en tu lista de extensiones

### Método 2: Instalación desde Chrome Web Store (Próximamente)

La extensión estará disponible en Chrome Web Store una vez completadas las pruebas.

## 🔧 Configuración

### 1. Obtener Token de Autenticación

**Opción A: Desde ResumAI Web**
1. Abre [ResumAI](https://resumai.vercel.app) en tu navegador
2. Inicia sesión con tu cuenta
3. Abre las herramientas de desarrollador (F12)
4. Ve a la pestaña "Application" → "Local Storage"
5. Busca la clave que contiene el token de Supabase
6. Copia el valor del token

**Opción B: Automática (Recomendado)**
1. Haz clic en el ícono de la extensión
2. Selecciona "Abrir ResumAI"
3. Inicia sesión normalmente
4. Regresa a la extensión y debería detectar automáticamente tu sesión

### 2. Configurar la Extensión

1. Haz clic en el ícono de ResumAI en la barra de herramientas
2. Pega tu token de autenticación o usa el método automático
3. Selecciona tu CV preferido de la lista
4. ¡Listo para usar!

## 📖 Cómo Usar

### Rellenar Formularios Automáticamente

1. **Navega a un sitio compatible** (trabajando.cl, laborum.com, getonboard.com)
2. **Busca una oferta de trabajo** que te interese
3. **Ve al formulario de postulación**
4. **Haz clic en el widget de ResumAI** que aparece automáticamente
5. **Selecciona "Rellenar Formulario"**

### Postular Automáticamente

1. **Sigue los pasos anteriores**
2. **Selecciona "Postular Automáticamente"**
3. **Confirma la acción** en el diálogo que aparece
4. **La extensión rellenará y enviará** el formulario por ti

### Usar el Popup

1. **Haz clic en el ícono** de la extensión en la barra de herramientas
2. **Verifica tu conexión** y datos de usuario
3. **Selecciona un CV** diferente si es necesario
4. **Usa los botones de acción** para rellenar o postular

## 🛠️ Desarrollo

### Estructura del Proyecto

```
chrome-extension/
├── manifest.json          # Configuración de la extensión
├── background.js          # Service Worker (lógica de fondo)
├── content.js            # Script que se ejecuta en las páginas
├── content.css           # Estilos para el widget
├── popup.html            # Interfaz del popup
├── popup.css             # Estilos del popup
├── popup.js              # Lógica del popup
├── icons/                # Iconos de la extensión
└── README.md             # Esta documentación
```

### APIs Utilizadas

- **Chrome Extensions API** - Funcionalidad de extensión
- **Supabase API** - Autenticación y datos de usuario
- **Chrome Storage API** - Almacenamiento local seguro
- **Chrome Tabs API** - Interacción con pestañas

### Debugging

1. **Habilitar modo debug** en la configuración de la extensión
2. **Abrir DevTools** en la página donde usas la extensión
3. **Ver logs** en la consola para información detallada
4. **Inspeccionar el popup** haciendo clic derecho → "Inspeccionar"

## 🔒 Seguridad y Privacidad

- **Tokens seguros**: Los tokens se almacenan localmente y se limpian automáticamente
- **Sin almacenamiento en servidores**: Toda la información se mantiene en tu navegador
- **Permisos mínimos**: Solo accede a los sitios necesarios
- **Código abierto**: Puedes revisar todo el código fuente

## 🐛 Solución de Problemas

### La extensión no aparece en sitios compatibles

1. Verifica que estés en un sitio compatible
2. Recarga la página
3. Verifica que la extensión esté habilitada

### Error de autenticación

1. Verifica que tu token sea válido
2. Inicia sesión nuevamente en ResumAI
3. Obtén un nuevo token

### Los formularios no se rellenan

1. Verifica que hayas seleccionado un CV
2. Algunos sitios pueden tener formularios no estándar
3. Usa el rellenado manual como alternativa

### No se pueden adjuntar CVs

1. Verifica que tu CV esté en formato PDF
2. Algunos sitios no permiten adjuntos automáticos
3. Adjunta manualmente después del rellenado

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:

1. **Revisa esta documentación** primero
2. **Verifica los logs** en la consola del navegador
3. **Reporta issues** en el repositorio del proyecto
4. **Contacta al equipo** de ResumAI

## 🔄 Actualizaciones

La extensión se actualiza automáticamente cuando:
- Se publican nuevas versiones
- Se agregan sitios compatibles
- Se corrigen errores

## 📝 Changelog

### v1.0.0 (Inicial)
- ✅ Soporte para trabajando.cl, laborum.com, getonboard.com
- ✅ Autenticación con Supabase
- ✅ Rellenado automático de formularios
- ✅ Selección de CVs
- ✅ Interfaz de popup completa
- ✅ Widget integrado en páginas

## 🤝 Contribuir

¿Quieres mejorar la extensión?

1. **Fork** el repositorio
2. **Crea una rama** para tu feature
3. **Implementa** tus cambios
4. **Prueba** thoroughly
5. **Envía un Pull Request**

## 📄 Licencia

Esta extensión es parte del proyecto ResumAI y sigue la misma licencia del proyecto principal.

---

**¡Hecho con ❤️ para la comunidad chilena de búsqueda de empleo!**
