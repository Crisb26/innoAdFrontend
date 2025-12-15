# InnoAd Frontend 🎨

Aplicación Angular profesional para gestión de campañas publicitarias digitales con IA integrada, sistema de roles y pantallas en tiempo real.

## 🛠️ Stack Tecnológico

| Componente | Versión |
|-----------|---------|
| Angular | 18.2.x |
| TypeScript | 5.5.x |
| Node.js | 20+ LTS |
| npm | 11+ |
| SCSS | Personalizado |
| Autenticación | JWT + Spring Security |
| Notificaciones | NotifyX |
| Exportación | jsPDF + CSV |

## 📋 Requisitos

- **Node.js 20+** LTS
- **npm 11+**
- **Angular CLI 18+**
- **Backend API** corriendo en http://localhost:8080

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Build para producción
npm run build
```

Aplicación disponible en: http://localhost:4200

## 📁 Estructura del Proyecto

```
src/app/
├── core/                    # Servicios, guards, interceptores
│   ├── config/             # Configuración centralizada
│   ├── guards/             # Seguridad de rutas
│   ├── interceptores/      # HTTP interceptores
│   ├── modelos/            # Interfaces TypeScript
│   └── servicios/          # Servicios HTTP
├── modulos/                 # Módulos funcionales
│   ├── autenticacion/      # Login, registro, recuperar contraseña
│   ├── dashboard/          # Dashboard principal
│   ├── campanas/           # Gestión de campañas
│   ├── contenidos/         # Almacenamiento multimedia
│   ├── pantallas/          # Gestión de pantallas
│   ├── admin/              # Panel administrativo
│   ├── reportes/           # Estadísticas y reportes
│   ├── chat/               # Chat con IA
│   └── publica/            # Landing page
└── shared/                  # Componentes reutilizables
```

## 🔐 Configuración de Autenticación

### Entornos

**Desarrollo** (environment.ts):
```typescript
api: {
  baseUrl: 'http://localhost:8080/api',
  services: {
    auth: 'http://localhost:8080/api/auth'
  }
}
```

**Producción** (environment.prod.ts):
```typescript
api: {
  baseUrl: 'https://innoad-backend.wonderfuldune-d0f51e2f.eastus2.azurecontainerapps.io/api',
  services: {
    auth: 'https://innoad-backend.../api/auth'
  }
}
```

## 📚 Módulos Principales

### 🔐 Autenticación (`modulos/autenticacion/`)
- ✅ Registrarse con validaciones avanzadas
- ✅ Iniciar sesión con JWT
- ✅ Recuperar contraseña
- ✅ Verificación de email
- ✅ Cambio de contraseña

### 🎯 Campañas (`modulos/campanas/`)
- ✅ Crear, editar, eliminar campañas
- ✅ Drag & drop multimedia
- ✅ Programación de fechas
- ✅ Estados y publicación

### 📱 Contenidos (`modulos/contenidos/`)
- ✅ Subir archivos multimedia
- ✅ Drag & drop avanzado
- ✅ Previsualización de contenido
- ✅ Categorización

### 📺 Pantallas (`modulos/pantallas/`)
- ✅ Monitoreo en tiempo real
- ✅ Estados de dispositivos
- ✅ Asignación de contenido
- ✅ Health check

### 👑 Admin Dashboard (`modulos/admin/`)
- ✅ **Sistema de Roles**: CRUD completo
  - 10 colores predefinidos
  - 10 iconos personalizables
  - 20+ permisos configurables
- ✅ **Modo Mantenimiento**: Activar/desactivar
  - Login administrativo con contraseña
  - Mensaje personalizado
  - Página de espera profesional
- ✅ **Gestión de Usuarios**: Panel completo
- ✅ **Logs de Auditoría**: Rastreo de cambios
- ✅ **Monitoreo de Sistema**: Salud de servicios

### 📊 Reportes (`modulos/reportes/`)
- ✅ Estadísticas en tiempo real
- ✅ Exportar a PDF
- ✅ Exportar a CSV
- ✅ Gráficos interactivos

### 🤖 Chat IA (`modulos/asistente-ia/`)
- ✅ Asistente inteligente global
- ✅ Recomendaciones personalizadas
- ✅ Disponible en toda la app

## 🆕 Características Nuevas (Fase 4)

### 1. **Sistema de Roles Avanzado**
```typescript
// Crear rol personalizado
- Nombre y descripción
- 10 opciones de color (#00D4FF variants)
- 10 iconos predefinidos
- 20+ permisos seleccionables
- CRUD completo en panel admin
```

### 2. **Modo Mantenimiento Profesional**
**Página Pública** (`pagina-mantenimiento-login.component.ts`):
- Login administrativo seguro
- Contraseña: 93022611184
- Acceso restringido a administradores
- Interfaz profesional animada

**Panel Administrativo** (`pagina-mantenimiento.component.ts`):
- Activar/desactivar modo mantenimiento
- Mensaje personalizado
- Historial de eventos
- Notificaciones a usuarios

### 3. **Exportación de Reportes**
- ✅ PDF con jsPDF
- ✅ CSV con formato correcto
- ✅ Datos formateados
- ✅ Descargas automáticas

### 4. **Mejoras UI/UX**
- ✅ Modal editar-perfil scrollable
- ✅ Cierre de modales mejorado
- ✅ Animaciones fluidas
- ✅ Notificaciones mejoradas

## 🛡️ Seguridad

- **Guards**: Autenticación y permisos
- **Interceptores**: JWT automático en headers
- **Validación**: Formularios reactivos avanzados
- **Hashing**: BCrypt en backend
- **CORS**: Configurado en backend

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^18.2.0",
  "@angular/router": "^18.2.0",
  "@angular/common": "^18.2.0",
  "rxjs": "^7.8.0",
  "jspdf": "^2.5.1",
  "notifyx": "^1.0.0",
  "typescript": "^5.5.0"
}
```

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar dev server
npm start

# Build producción
npm run build

# Tests
npm test

# Linting
npm run lint

# Análisis de bundle
npm run analyze
```

## 📊 Estructura de Datos

### Usuario
```typescript
{
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  permisos: string[];
  token: string;
}
```

### Rol
```typescript
{
  id: number;
  nombre: string;
  color: string;
  icono: string;
  permisos: string[];
  activo: boolean;
}
```

## ☁️ Deploy en Netlify

```bash
# Build automático desde GitHub
# Branch: main
# Build command: npm run build
# Publish directory: dist/innoadFrontend
```

**URL**: https://innoad.netlify.app

## 🛠️ Desarrollo

```bash
# Hot reload activo en dev
npm start

# Cambios automáticos detectados
# No requiere reinicio manual
```

## 📋 Checklist Funcional

- [x] Autenticación JWT
- [x] Sistema de roles completo
- [x] Modo mantenimiento
- [x] CRUD campañas
- [x] Multimedia drag & drop
- [x] Exportación PDF/CSV
- [x] Panel administrativo
- [x] Estadísticas en vivo
- [x] Chat IA integrado
- [x] Notificaciones del sistema
- [x] Guards y permisos
- [x] Responsive design

## ✅ Status

- ✅ Angular: v18.2.x
- ✅ TypeScript: Strict mode
- ✅ Autenticación: JWT + Guards
- ✅ Roles y Permisos: Implementados
- ✅ Mantenimiento: Activo
- ✅ Reportes: Exportación PDF/CSV
- ✅ Netlify: Desplegado
- ✅ API: Integrada

## 🎯 Próximas Mejoras

- [ ] Internacionalización (i18n)
- [ ] Dark mode
- [ ] Offline support
- [ ] PWA features
- [ ] WebSocket real-time
- [ ] File upload mejorado
- [ ] Caché local

## 👥 Contribuciones

Reportar issues o mejoras via GitHub.

## 📄 Licencia

Propietario - InnoAd 2025


```bash
# Build de producción
npm run build

# Output en: dist/innoad-frontend
```

## Características

- Autenticación JWT con guards
- Dashboard interactivo
- Gestión de campañas publicitarias
- Gestión de pantallas digitales
- Gestión de contenidos
- Asistente IA integrado
- Panel de administración
- Alertas visuales personalizadas con SweetAlert2
- Tema futurista responsive

## Estructura

```
src/
 app/
    core/          # Servicios, guards, interceptores
    modulos/       # Módulos de funcionalidad
    shared/        # Componentes compartidos
    app.routes.ts  # Rutas principales
 assets/            # Recursos estáticos
 environments/      # Configuración por entorno
 styles.scss        # Estilos globales
```

## Scripts Disponibles

- 
pm start - Desarrollo
- 
pm run build - Build producción
- 
pm run build:prod - Build optimizado
- 
pm test - Tests unitarios
- 
pm run lint - Linter

## Licencia

Propietario - InnoAd 2025
