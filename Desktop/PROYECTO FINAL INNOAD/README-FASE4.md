# 📱 InnoAd - Sistema Completo de Gestión de Publicidad Digital

**Estado del Proyecto**: 🟢 Producción (Fase 4 Completada)

## 📊 Estado Actual (Sesión #3)

### ✅ Backend - COMPLETADO (100%)
- **4 Módulos Principales Creados**:
  - ✅ **Campaña**: Gestión de campañas publicitarias (CRUD, estados, presupuesto)
  - ✅ **Pantalla**: Monitoreo de dispositivos digitales (battery%, CPU temp, conectividad)
  - ✅ **Contenido**: Upload de archivos multimedia (images, video, PDF, audio)
  - ✅ **Mantenimiento**: Sistema de mantenimiento con control de acceso y restricciones

- **Características Principales**:
  - Spring Boot 3.5.8 con Java 21
  - PostgreSQL 16 con índices optimizados
  - JWT para autenticación segura
  - Global ServletFilter para mantenimiento
  - Password hashing con bcrypt
  - ENUM types para estados
  - Transaccionales y validaciones

### ✅ Frontend - CASI COMPLETADO (95%)
- **Módulo Mantenimiento**: Componente UI completo
  - Componente TypeScript con lógica de verificación
  - Template HTML responsivo con animaciones
  - SCSS con gradientes y efectos glassmorphism
  - Reintentos con backoff exponencial

- **Servicios Mejorados**:
  - ✅ `ServicioMantenimiento`: Acceso a estado y verificación
  - ✅ `ServicioGraficos`: Reintentos exponenciales (1s, 2s, 4s)
  - ✅ `ServicioPublicacion`: Reintentos automáticos con timer
  - ✅ `ErrorInterceptor`: Manejo de 401/403/503/0 errores

- **Enhancements**:
  - Retry logic con exponential backoff
  - Manejo transaccional de errores de red
  - Auto-redirect en mantenimiento
  - Bloqueo temporal después de 3 fallos

## 🏗️ Arquitectura

### Backend Stack
```
Spring Boot 3.5.8 (Java 21)
├── JPA/Hibernate
├── Spring Security + JWT
├── Spring Data
├── PostgreSQL Driver
└── Validation Framework
```

### Frontend Stack
```
Angular 18 (TypeScript)
├── Standalone Components
├── RxJS (Observables)
├── HttpClient con Interceptores
├── FormsModule (Reactive)
└── SCSS (Variables + Mixins)
```

### Base de Datos
```
PostgreSQL 16
├── Enum Types (Estados)
├── JSONB Support
├── Foreign Keys (CASCADE)
└── Índices Optimizados
```

## 📁 Estructura de Archivos

### Backend Nueva Estructura
```
src/main/java/com/innoad/
├── modules/
│   ├── campanas/
│   │   ├── Campana.java (Entity)
│   │   ├── RepositorioCampanas.java (Repository)
│   │   ├── CampanaDTO.java (DTO)
│   │   ├── ServicioCampanas.java (Service)
│   │   └── ControladorCampanas.java (Controller)
│   ├── pantallas/
│   │   ├── Pantalla.java (Entity)
│   │   ├── RepositorioPantallas.java
│   │   ├── PantallaDTO.java
│   │   ├── ServicioPantallas.java
│   │   └── ControladorPantallas.java
│   ├── contenidos/
│   │   ├── Contenido.java
│   │   ├── RepositorioContenidos.java
│   │   ├── ContenidoDTO.java
│   │   ├── ServicioContenidos.java
│   │   └── ControladorContenidos.java
│   └── mantenimiento/
│       ├── Mantenimiento.java
│       ├── RepositorioMantenimiento.java
│       ├── MantenimientoDTO.java
│       ├── ServicioMantenimiento.java
│       ├── ControladorMantenimiento.java
│       ├── FiltroMantenimiento.java (Global)
│       └── ConfiguracionMantenimiento.java
```

### Frontend Nueva Estructura
```
src/app/
├── core/
│   ├── interceptores/
│   │   └── error.interceptor.ts (MEJORADO)
│   └── servicios/
│       ├── graficos.service.ts (NUEVO)
│       ├── publicacion.servicio.ts (MEJORADO)
│       └── mantenimiento.service.ts (NUEVO)
└── modulos/
    └── mantenimiento/
        ├── mantenimiento.component.ts
        ├── mantenimiento.component.html
        ├── mantenimiento.component.scss
        ├── servicios/
        │   └── mantenimiento.service.ts
        └── app.routes.ts (ACTUALIZADO)
```

## 🚀 Cómo Ejecutar

### Backend
```bash
cd innoadBackend
mvn clean package
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

**Puerto**: `8080`
**Base de Datos**: PostgreSQL en `localhost:5432`

### Frontend
```bash
cd innoadFrontend
npm install
ng serve --open
# o para producción
ng build --configuration=production
```

**Puerto**: `4200`

## 🔐 Seguridad

### Credenciales Mantenimiento
- **Ruta**: `/api/v1/mantenimiento/verificar-acceso`
- **Contraseña**: `Cris93022611184` (hashed con bcrypt)
- **Intento Máximo**: 3 intentos
- **Bloqueo**: 5 minutos después de 3 fallos
- **Métodos HTTP**: GET/POST según endpoint

### JWT
- **Ubicación**: Header `Authorization: Bearer <token>`
- **Duración**: 24 horas (configurable)
- **Refresh**: Token automático en cada request exitoso

### Roles
- `ADMINISTRADOR`: Acceso total
- `TECNICO`: Gestión de pantallas y contenido
- `DESARROLLADOR`: Debug y estadísticas
- `USUARIO`: Publicación de contenido
- `VISITANTE`: Solo lectura

## 📊 Endpoints API Nuevos

### Campaña
```
POST   /api/v1/campanas              # Crear
GET    /api/v1/campanas              # Listar (user-scoped)
GET    /api/v1/campanas/{id}         # Obtener
PUT    /api/v1/campanas/{id}         # Actualizar
DELETE /api/v1/campanas/{id}         # Eliminar
GET    /api/v1/campanas/activas/lista # Listar activas
PATCH  /api/v1/campanas/{id}/estado  # Cambiar estado
```

### Pantalla
```
POST   /api/v1/pantallas             # Crear
GET    /api/v1/pantallas             # Listar
GET    /api/v1/pantallas/{id}        # Obtener
PUT    /api/v1/pantallas/{id}        # Actualizar
DELETE /api/v1/pantallas/{id}        # Eliminar
PATCH  /api/v1/pantallas/{id}/conexion # Actualizar conexión
GET    /api/v1/pantallas/conectadas/lista # Listadas activas
```

### Contenido
```
POST   /api/v1/contenidos            # Crear (multipart)
GET    /api/v1/contenidos            # Listar
GET    /api/v1/contenidos/{id}       # Obtener
PUT    /api/v1/contenidos/{id}       # Actualizar
DELETE /api/v1/contenidos/{id}       # Eliminar
POST   /api/v1/contenidos/upload     # Upload archivo
```

### Mantenimiento
```
GET    /api/v1/mantenimiento/estado  # Estado actual (público)
POST   /api/v1/mantenimiento/verificar-acceso # Verificar password (público)
POST   /api/v1/mantenimiento/activar # Activar (admin)
POST   /api/v1/mantenimiento/desactivar # Desactivar (admin)
GET    /api/v1/mantenimiento/ultimo  # Último registro (admin)
```

## 🛠️ Mecanismos de Resiliencia

### Error Interceptor
```typescript
// Reintentos automáticos para:
// - 0 (conexión)
// - 503 (servicio no disponible)
// - 504 (gateway timeout)

// Manejo especial:
// - 401: Logout + redirect login
// - 403: Redirect sin-permisos
// - 503: Redirect mantenimiento
```

### Servicios de Datos
```typescript
// Gráficos
- Reintentos: 3 (1s, 2s, 4s)
- Solo GET
- Logging de intentos

// Publicación
- Reintentos: 3 (exponencial)
- Sincronización c/2 minutos
- Alertas en tiempo real

// Mantenimiento
- GET /estado: Sin auth
- POST /verificar: Sin auth
- Password protection: 3 intentos + 5 min lockout
```

## 📋 Cambios Principales (Sesión #3)

### Backend ✅
1. ✅ **Módulo Campaña**: Entity, Repository, DTO, Service, Controller
   - 5 estados: BORRADORA, ACTIVA, PAUSADA, FINALIZADA, CANCELADA
   - Validación de fechas
   - User-scoped queries

2. ✅ **Módulo Pantalla**: IoT monitoring
   - Battery %, CPU temp, IP/MAC
   - Conexión status tracking
   - Última conexión timestamp

3. ✅ **Módulo Contenido**: File upload
   - Multipart support
   - UUID naming (seguridad)
   - Size validation (100MB max)
   - MIME type validation

4. ✅ **Módulo Mantenimiento**: Global filtering
   - Bloqueo de endpoints
   - Modo lectura
   - Password protection
   - Restricciones selectivas

### Frontend ✅
1. ✅ **Error Interceptor**: Retry logic
   - Exponential backoff
   - 401/403/503/0 handling
   - Network error resilience

2. ✅ **Mantenimiento Component**: UI completa
   - TypeScript: Password verification, progress tracking
   - HTML: Responsive template con loader
   - SCSS: Gradientes, animaciones, glassmorphism

3. ✅ **Servicios Mejorados**: Reintentos
   - `ServicioGraficos`: 3 reintentos
   - `ServicioPublicacion`: Sincronización automática
   - `ServicioMantenimiento`: Acceso estado + verificación

4. ✅ **Routing**: Ruta pública mantenimiento
   - Sin guards de autenticación
   - Redirige automáticamente si no hay mantenimiento
   - Acceso protegido con password

## 🐛 Problemas Conocidos & Soluciones

### Problema #1: 401 en Gráficos
- **Causa**: Token expirado o timeout en GET
- **Solución**: Reintentos automáticos + error interceptor
- **Estado**: ✅ RESUELTO

### Problema #2: Publicación sin actualizar
- **Causa**: Error en sincronización c/2 minutos
- **Solución**: Error handling en intervalo + logging
- **Estado**: ✅ RESUELTO

### Problema #3: Caracteres especiales en archivos
- **Causa**: Rutas Windows con backslash
- **Solución**: UTF-8 encoding + UUID naming
- **Estado**: ✅ MITIGADO

## 🔍 Testing

### Backend
```bash
# Compile
mvn clean compile

# Test
mvn test

# Build JAR
mvn clean package
```

### Frontend
```bash
# Lint
ng lint

# Test
ng test

# Build
ng build
```

## 📱 Deployment

### Docker (Ambos)
```bash
# Backend
docker build -t innoad-backend .
docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/innoad innoad-backend

# Frontend
docker build -t innoad-frontend .
docker run -p 80:80 innoad-frontend
```

### Railway / Azure
```bash
# Backend a Railway
railway link
railway up

# Frontend a Netlify
netlify deploy --prod --dir=dist/innoad-frontend
```

## 📞 Soporte

Para reportar bugs o solicitar features:
1. Abre un issue en GitHub
2. Incluye logs y pasos para reproducir
3. Especifica ambiente (dev/prod)

## 📄 Licencia

Propietario - InnoAd (2025)

---

**Última actualización**: 31 Diciembre 2025
**Versión**: 2.0.0
**Rama**: main
