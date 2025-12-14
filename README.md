# InnoAd Frontend 🎨

Aplicación Angular para gestión de campañas publicitarias, autenticación JWT y dashboards en tiempo real.

## 🛠️ Stack Tecnológico

| Componente | Versión |
|-----------|---------|
| Angular | 18.2.x |
| TypeScript | 5.5.x |
| Node.js | 20+ LTS |
| npm | 11+ |
| SCSS | CSS avanzado |

## 📋 Requisitos

- **Node.js 20+**
- **npm 11+**
- **Git**

## 🚀 Instalación

```bash
# 1. Clonar/extraer proyecto
git clone <repo>
cd innoadFrontend

# 2. Instalar dependencias
npm install

# 3. Verificar instalación
npm --version
ng version
```

## 🏃 Ejecución Local

```bash
# Desarrollo (con hot reload)
npm start
# O
ng serve --open

# Build optimizado para producción
ng build --configuration production
```

**Aplicación disponible en**: http://localhost:4200

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── core/                 # Servicios, guards, interceptores
│   │   ├── guards/          # Autenticación y autorización
│   │   ├── interceptores/   # HTTP interceptors
│   │   ├── modelos/         # Interfaces y tipos
│   │   └── servicios/       # Servicios compartidos
│   ├── modulos/              # Módulos funcionales
│   │   ├── autenticacion/   # Login/Registro
│   │   ├── dashboard/       # Panel principal
│   │   ├── campanas/        # Gestión de campañas
│   │   ├── contenidos/      # Multimedia
│   │   ├── pantallas/       # Pantallas digitales
│   │   ├── reportes/        # Estadísticas
│   │   ├── chat/            # Chat con IA
│   │   ├── asistente-ia/    # Asistente IA
│   │   ├── admin/           # Panel de administración
│   │   └── mantenimiento/   # Modo mantenimiento
│   ├── shared/               # Componentes reutilizables
│   └── app.routes.ts         # Rutas principales
├── assets/                   # Imágenes y recursos
├── environments/             # Configuración por entorno
└── index.html
```

## ⚙️ Configuración de Entornos

### Desarrollo (`environment.ts`)
```typescript
api: {
  baseUrl: 'http://localhost:8080/api'
}
```

### Producción (`environment.prod.ts`)
```typescript
api: {
  baseUrl: 'https://innoad-backend.wonderfuldune-d0f51e2f.eastus2.azurecontainerapps.io/api'
}
```

## 📱 Rutas Principales

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | Público | Página de inicio |
| `/login` | Autenticación | Login |
| `/register` | Autenticación | Registro |
| `/dashboard` | Dashboard | Panel principal |
| `/campanas` | Campañas | Gestión de campañas |
| `/contenidos` | Contenidos | Gestión de multimedia |
| `/pantallas` | Pantallas | Gestión de pantallas |
| `/reportes` | Reportes | Estadísticas |
| `/chat` | Chat IA | Asistente con IA |
| `/admin/mantenimiento` | Admin | Control de mantenimiento |

## 🔐 Autenticación

- **Método**: JWT (tokens)
- **Almacenamiento**: LocalStorage
- **Guards**: Protección de rutas
- **Interceptores**: Inyección automática de JWT

## 🎨 Modo Mantenimiento

El sistema incluye un modo de mantenimiento futurista con 3 tipos:

```
🚨 EMERGENCIA    → Bloquea usuarios inmediatamente
📅 PROGRAMADO    → Mantenimiento planeado
⚠️  CRITICA      → Problema grave con acceso restringido
```

**Características**:
- Control granular de roles
- Desarrolladores siempre pueden acceder
- UI animada y responsiva
- Colores dinámicos según tipo

## 🌐 Proxy para Desarrollo

El archivo `proxy.conf.json` redirige `/api` al backend local:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t innoad-frontend:latest .

# Ejecutar contenedor
docker run -p 80:80 innoad-frontend:latest
```

## ☁️ Producción (Netlify)

```
URL: https://innoadfrontend.netlify.app
Status: Activo
Última actualización: Automática en cada push a main
```

## 📦 Build Optimizado

```bash
# Generar build optimizado (reducido ~70%)
ng build --configuration production --optimization

# Resultado
dist/innoad-frontend/browser/
├── index.html
├── main.js
├── styles.css
└── assets/
```

## ✅ Checklist de Conexiones

- ✅ API backend conectada (`api.config.ts`)
- ✅ Todas las rutas configuradas (`app.routes.ts`)
- ✅ Guards de autenticación activos
- ✅ Interceptores HTTP funcionales
- ✅ Modo mantenimiento integrado
- ✅ Chat IA conectado
- ✅ Reportes en tiempo real
- ✅ Responsivo en mobile/tablet/desktop

## 🛠️ Desarrollo

```bash
# Tests unitarios
ng test

# Linting
ng lint

# Build para desarrollo
ng build

# Build optimizado
ng build --configuration production
```

## 📖 Documentación

- **Rutas**: Ver `src/app/app.routes.ts`
- **Modelos**: Ver `src/app/core/modelos/`
- **Servicios**: Ver `src/app/core/servicios/`
- **Componentes**: Cada módulo en `src/app/modulos/`

## ✅ Status

- ✅ Compilación: OK
- ✅ Conexión backend: OK
- ✅ Autenticación: OK
- ✅ Modo mantenimiento: OK
- ✅ Responsive: OK
- ✅ Producción: OK
│   │   └── admin/              # Panel admin
│   └── shared/                 # Componentes compartidos
├── assets/                     # Recursos estáticos
└── environments/               # Configuraciones
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm start                    # Inicia dev server (puerto 4200)

# Build
npm run build               # Build desarrollo
npm run build:prod          # Build producción

# Testing
npm test                    # Ejecutar tests unitarios
npm run test:coverage       # Tests con cobertura

# Linting
npm run lint                # Verificar código
npm run lint:fix            # Corregir automáticamente

# Análisis
npm run analyze             # Analizar bundle size
```

## ☁️ Despliegue

- **Prod actual**: Netlify (`https://innoadfrontend.netlify.app`)
- Backend prod: Azure Container Apps (`https://innoad-backend.wonderfuldune-d0f51e2f.eastus2.azurecontainerapps.io`)
- Para redeploy manual: `netlify deploy --prod --dir=dist/innoad-frontend/browser`

## 🆕 Cambios recientes

- Limpieza de documentación legacy y guías Docker antiguas.
- URLs de producción actualizadas a Azure Container Apps.
- Fix de login: el backend ahora usa `JWT_SECRET` Base64 válido y CORS activo para Netlify.

O desde el dashboard de Vercel:
- Framework: **Angular**
- Build Command: `npm run build -- --configuration production`
- Output Directory: `dist/innoad-frontend/browser`

### Netlify

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Desplegar
netlify deploy --prod
```

**Archivos de configuración incluidos**:
- ✅ `vercel.json`
- ✅ `netlify.toml`

### Variables de Entorno en Producción

**IMPORTANTE**: Actualizar `environment.prod.ts` con la URL del backend Railway:

```typescript
api: {
  baseUrl: 'https://tu-backend.up.railway.app/api'
}
```

## 🎯 Funcionalidades Principales

### Autenticación
- ✅ Login/Registro con JWT
- ✅ Registro con cédula
- ✅ Refresh token automático
- ✅ Guards de protección
- ✅ Perfil de usuario editable

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Gráficos interactivos
- ✅ Vista general del sistema

### Campañas
- ✅ Crear/Editar/Eliminar campañas
- ✅ Programación de contenidos
- ✅ Asignación a pantallas
- ✅ Vista calendario

### Contenidos
- ✅ Subir imágenes/videos
- ✅ Vista previa
- ✅ Gestión de biblioteca

### Pantallas
- ✅ Monitoreo en tiempo real
- ✅ Control remoto
- ✅ Geolocalización
- ✅ Estado de conexión

### IA Asistente
- ✅ Chat inteligente
- ✅ Comandos de voz
- ✅ Cierre de sesión por comando
- ✅ Permisos por rol

## 🔐 Seguridad

- JWT almacenado en localStorage
- Interceptors para tokens
- Guards en rutas protegidas
- Validación de permisos por rol

## 🎨 Componentes Destacados

### Navegación Autenticada
- Avatar circular con dropdown
- Menú dinámico por rol
- Perfil editable con foto

### Modal Editar Perfil
- Subida de avatar
- Validación de formularios
- Actualización en tiempo real

### Asistente IA
- Botón flotante
- Chat interactivo
- Memoria contextual

## 🐛 Troubleshooting

### Proxy no funciona
```bash
# Asegurarse de usar --proxy-config
ng serve --proxy-config proxy.conf.json
```

### Error de CORS
- Verificar que el backend permite `http://localhost:4200`
- Revisar configuración CORS en Spring Boot

### Build de producción falla
```bash
# Limpiar caché
rm -rf node_modules dist .angular
npm install
npm run build:prod
```

## 📖 Documentación Adicional

- [Angular Docs](https://angular.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [RxJS Guide](https://rxjs.dev/guide/overview)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Proyecto privado y propietario.

## 👥 Autores

- **Equipo InnoAd**

## 🆘 Soporte

- GitHub Issues
- Email: soporte@innoad.com

---

**Versión**: 2.0.0  
**Última actualización**: Noviembre 2025

### environment.prod.ts (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com',
  apiUrlVersioned: 'https://tu-dominio.com/api/v1'
};
```

## Estructura del Proyecto

```
src/app/
├── core/                          # Núcleo de la aplicación
│   ├── config/                   # Configuración (API endpoints)
│   ├── guards/                   # Guards de autenticación y permisos
│   ├── interceptores/            # Interceptores HTTP (auth, error)
│   ├── modelos/                  # Interfaces TypeScript
│   └── servicios/                # Servicios singleton
│
├── modulos/                       # Módulos funcionales
│   ├── autenticacion/            # Login, registro, recuperación
│   ├── dashboard/                # Panel principal
│   ├── campanas/                 # Gestión de campañas
│   ├── contenidos/               # Gestión de multimedia
│   ├── pantallas/                # Gestión de pantallas LED
│   ├── reportes/                 # Estadísticas y reportes
│   ├── admin/                    # Panel de administración
│   ├── asistente-ia/             # Asistente inteligente
│   └── player/                   # Reproductor de contenido
│
└── shared/                        # Componentes compartidos
    └── componentes/
        ├── navegacion-autenticada/
        ├── editar-perfil/
        └── ...
```

## Funcionalidades Principales

### Autenticación y Seguridad
- Login con email/password
- Registro con verificación por email
- JWT con refresh automático (cada 58 minutos)
- Guards de rutas basados en roles
- Manejo centralizado de errores

### Perfil de Usuario
- **Menú de usuario** con avatar en barra superior
- **Modal de edición** con formulario reactivo
- Campos editables: email, teléfono, dirección
- Cambio de foto de perfil con preview
- Validación de archivos (máx 5MB, JPG/PNG/GIF)

### Gestión de Campañas
- Crear, editar y eliminar campañas
- Programación temporal
- Asignación de contenidos
- Filtros avanzados

### Gestión de Contenido
- Subida de imágenes, videos y HTML5
- Preview en tiempo real
- Organización por categorías

### Gestión de Pantallas
- Registro de pantallas LED
- Monitoreo de estado (online/offline)
- Geolocalización con mapas
- Agrupación por ubicaciones

### Dashboard
- Métricas en tiempo real
- Gráficos de rendimiento
- Estado de pantallas activas
- Alertas y notificaciones

## Rutas Principales

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Página de inicio |
| `/login` | Público | Iniciar sesión |
| `/dashboard` | Autenticado | Panel principal |
| `/campanas` | Autenticado | Gestión de campañas |
| `/contenidos` | Autenticado | Gestión de contenido |
| `/pantallas` | Autenticado | Gestión de pantallas |
| `/reportes` | Gerente+ | Estadísticas |
| `/admin` | Admin | Panel administrativo |

## Scripts Disponibles

```bash
npm start              # Inicia servidor de desarrollo
npm run build          # Build de producción
ng serve --open        # Inicia y abre en navegador
ng build --configuration production  # Build optimizado
npm test               # Ejecuta tests unitarios
```

## Desarrollo Reciente

### Sistema de Perfil de Usuario

**Componentes Creados:**

1. **EditarPerfilComponent**
   - Modal completo con formulario reactivo
   - Validación de campos (email, teléfono, dirección)
   - Preview y cambio de avatar
   - Manejo de estado con Signals
   - Responsive design

2. **NavegacionAutenticadaComponent Actualizado**
   - Avatar del usuario en barra superior
   - Dropdown con información del usuario
   - Opciones: Editar Perfil, Cerrar Sesión

**Servicios Actualizados:**
- `UsuariosServicio`: Métodos `actualizarPerfil()` y `subirAvatar()`
- `ServicioAutenticacion`: Método `actualizarUsuarioActual()`

**Modelos Extendidos:**
- `Usuario`: Agregados campos `cedula`, `direccion`, `avatarUrl`
- `SolicitudActualizarPerfil`: Nuevo DTO

### Problemas Resueltos

1. **Actualización de Estado de Usuario**
   - Implementación de Signals para actualización reactiva
   - Sincronización automática entre componentes

2. **Validación de Avatar**
   - Tamaño máximo: 5MB
   - Formatos: JPG, PNG, GIF
   - Preview antes de subir

## Estado del Proyecto

**✅ Completado:**
- Sistema de autenticación completo
- Dashboard con métricas
- CRUD de campañas, contenidos y pantallas
- Perfil de usuario editable
- Guards y permisos por rol
- Responsive design

**🔄 En Desarrollo:**
- Asistente IA con recomendaciones
- Notificaciones push
- Modo offline

**📋 Pendiente:**
- Tests E2E
- Internacionalización (i18n)
- Tema oscuro/claro

## Proxy Configuration

El archivo `proxy.conf.json` evita problemas de CORS:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Usar con:
```bash
ng serve --proxy-config proxy.conf.json
```

## Build para Producción

```bash
# Compilar
ng build --configuration production

# Los archivos estarán en dist/innoad-frontend/
```

## Troubleshooting

### Puerto 4200 en uso
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# O usar otro puerto
ng serve --port 4300
```

### Backend no responde
1. Verificar backend en puerto 8080
2. Revisar `environment.ts`
3. Usar proxy si hay CORS

### Error de módulos
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contacto

- **Repositorio**: https://github.com/Crisb26/innoAdFrontend
- **Backend**: https://github.com/Crisb26/innoadBackend

## Licencia

MIT License
