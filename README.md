# InnoAd Frontend – Sistema de Gestión de Publicidad Digital

![Angular](https://img.shields.io/badge/Angular-18-red) 
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) 
![Docker](https://img.shields.io/badge/Docker-ready-blue)

## Descripción
Frontend Angular 18 para InnoAd, integrando autenticación JWT, gestión de campañas, pantallas, contenidos, dashboards y reportes. Comunicación con backend Spring Boot mediante `RespuestaAPI<T>` estándar y refresh automático de tokens.

## Características Principales
- Gestión de campañas publicitarias
- Administración de contenidos multimedia
- Control de pantallas digitales
- Dashboard de estadísticas en tiempo real
- Sistema de autenticación y autorización con refresh automático
- Generación de reportes
- Integración con IA para optimización de contenidos

## Stack Técnico
- **Framework:** Angular 18 (standalone components)
- **Lenguaje:** TypeScript 5.5
- **Estilo:** SCSS, Bootstrap 5
- **Gráficas:** Chart.js + ng2-charts
- **Mapas:** Leaflet
- **Estado:** RxJS + Signals, @ngrx/store
- **Servidor de prod:** Nginx (Docker multi-stage)

## Requisitos
- Node.js 18+
- npm (incluido con Node.js)
- Git
- Docker Desktop (para despliegue con contenedores)
- Visual Studio Code (recomendado)

## Instalación y Desarrollo Local (sin Docker)

### 1. Clonar el repositorio
\`\`\`cmd
git clone https://github.com/Crisb26/innoAdFrontend.git
cd innoAdFrontend
\`\`\`

### 2. Instalar dependencias
\`\`\`cmd
npm ci
\`\`\`

### 3. Configurar variables de entorno
Edita `src/environments/environment.ts` para apuntar a tu backend:
\`\`\`typescript
export const environment = {
  production: false,
  urlApi: 'http://localhost:8080/api/v1',
  urlWebSocket: 'ws://localhost:8080/ws',
  // ...
};
\`\`\`

### 4. Iniciar servidor de desarrollo
\`\`\`cmd
npm run iniciar
\`\`\`
Abre http://localhost:4200.

### 5. Iniciar con proxy (evita CORS)
\`\`\`cmd
npm run iniciar:proxy
\`\`\`
Proxy reenvía `/api` y `/ws` a `http://localhost:8080`.

## Build para Producción
\`\`\`cmd
npm run construir
\`\`\`
Salida en `dist/innoad-frontend/`.

## Despliegue con Docker

### Opción 1: Frontend + Backend en red interna (Compose)
\`\`\`cmd
docker compose up --build -d
\`\`\`
- Frontend: http://localhost:8080
- Backend: http://localhost:8081

### Opción 2: Frontend contenedor + Backend en host
\`\`\`cmd
docker compose -f docker-compose.external.yml up --build -d
\`\`\`

### Opción 3: Producción con imágenes publicadas
Edita `.env` con URLs de GHCR y ejecuta:
\`\`\`cmd
docker compose -f docker-compose.prod.yml up -d
\`\`\`

Ver más detalles en [docs/DEPLOY.md](docs/DEPLOY.md).

## Variables de Entorno
Copia `.env.example` a `.env` y personaliza:
- `FRONTEND_HTTP_PORT`, `BACKEND_HTTP_PORT`
- `BACKEND_IMAGE`
- `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`

## Scripts Disponibles
- `npm run iniciar` → Dev server (Angular CLI)
- `npm run iniciar:proxy` → Dev con proxy reverse para API
- `npm run construir` → Build optimizado
- `npm run observar` → Build watch en dev
- `npm test` → Tests unitarios (Karma)
- `npm run lint` → Lint (si configurado)
- `npm run servir-produccion` → Sirve build con http-server

## Estructura del Proyecto
\`\`\`
src/
├── app/
│   ├── core/          # servicios, interceptors, guards, modelos
│   ├── modulos/       # lazy routes (autenticación, campañas, pantallas, contenidos, reportes)
│   └── shared/        # componentes reutilizables
├── environments/      # environment.ts, environment.prod.ts, environment.compose.ts
└── assets/            # iconos, imágenes, videos
\`\`\`

## Integración con Backend
- Base URL: `environment.urlApi` (dev: `http://localhost:8080/api/v1`, prod: `https://api.innoad.com/api/v1`)
- Contrato: `RespuestaAPI<T>` (`exitoso`, `mensaje`, `datos`)
- Autenticación: JWT con refresh automático; endpoints bajo `/autenticacion/`
- Roles y permisos: guards de `@core/guards` y `route.data.permisos`

## Credenciales de Prueba (backend semilla)
- **Administrador:** admin / Admin123!
- **Empresa:** empresa / Empresa123!
- **Usuario estándar:** usuario / Usuario123!

## Documentación Adicional
- [Guía de despliegue completo](docs/DEPLOY.md)
- [Checklist de despliegue](docs/CHECKLIST.md)
- [Instrucciones para agentes de IA](.github/copilot-instructions.md)
- [Contribuir](GUIA-COLABORADORES.md)

## Módulos Principales

### Autenticación
Login, registro, recuperación de contraseña con JWT + refresh.

### Dashboard
Panel principal con resumen de estadísticas y accesos rápidos.

### Campañas
Administración de campañas publicitarias (creación, edición, asignación de contenidos, programación).

### Pantallas
Control de dispositivos de visualización con estado en tiempo real.

### Contenidos
Biblioteca de recursos multimedia (imágenes, videos, HTML) con optimización IA.

### Reportes
Análisis y estadísticas (métricas de campañas, rendimiento de pantallas, exportación de datos).

## CI/CD
Workflow en `.github/workflows/frontend-ci.yml` construye, testea y publica imagen Docker en GHCR en cada push a `main` o tag `v*`. Revisa [docs/DEPLOY.md](docs/DEPLOY.md) para detalles de backend.

## Mantenimiento
- **Errores 503:** Redirige a `/mantenimiento`
- **Errores 401:** Cierra sesión automáticamente
- **Health checks:** Docker healthcheck en `GET /` (frontend) y `GET /actuator/health` (backend)

## Contribución
1. Crear rama desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Commits descriptivos: `git commit -m "..."`
3. Push y PR para revisión.

## Licencia
Propiedad del equipo InnoAd. Uso interno.

### Despliegue con Docker

1. Construir imagen Docker:
```bash
docker build -t innoad-frontend .
```

2. Ejecutar contenedor:
```bash
docker run -p 8080:80 innoad-frontend
```

## Estructura del Proyecto

```
innoadFrontend/
├── src/
│   ├── app/
│   │   ├── core/                  # Servicios principales y configuración
│   │   │   ├── guards/           # Guardias de autenticación y permisos
│   │   │   ├── interceptores/    # Interceptores HTTP (auth, errores)
│   │   │   ├── modelos/          # Interfaces y tipos TypeScript
│   │   │   └── servicios/        # Servicios Angular (API, auth, etc.)
│   │   ├── modulos/              # Módulos funcionales
│   │   │   ├── autenticacion/   # Login, registro, recuperación
│   │   │   ├── dashboard/       # Panel principal
│   │   │   ├── campanas/        # Gestión de campañas
│   │   │   ├── pantallas/       # Gestión de pantallas
│   │   │   ├── contenidos/      # Biblioteca de medios
│   │   │   ├── reportes/        # Estadísticas y reportes
│   │   │   └── mantenimiento/   # Página de mantenimiento
│   │   ├── shared/              # Componentes compartidos
│   │   ├── app.component.ts     # Componente raíz
│   │   ├── app.config.ts        # Configuración de la aplicación
│   │   └── app.routes.ts        # Configuración de rutas
│   ├── assets/                   # Recursos estáticos
│   ├── environments/             # Variables de entorno (dev/prod)
│   ├── index.html               # HTML principal
│   ├── main.ts                  # Punto de entrada
│   └── styles.scss              # Estilos globales
├── angular.json                  # Configuración de Angular CLI
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
├── Dockerfile                    # Configuración Docker
├── .dockerignore                 # Archivos excluidos de Docker
└── .gitignore                    # Archivos excluidos de Git
```

## Conexiones y Configuración

### Configuración del Backend

El frontend se conecta al backend mediante:
- API REST: `http://localhost:8080/api/v1`
- WebSocket: `ws://localhost:8080/ws`

### Endpoints Principales

- `POST /api/v1/autenticacion/iniciar-sesion`: Autenticación de usuario
- `POST /api/v1/autenticacion/refrescar-token`: Renovación de token
- `GET /api/v1/campanas`: Listado de campañas
- `GET /api/v1/pantallas`: Listado de pantallas
- `GET /api/v1/contenidos`: Listado de contenidos
- `GET /api/v1/estadisticas`: Estadísticas del sistema

## Seguridad

El sistema implementa:
- Autenticación JWT con tokens de acceso y refresco
- Guardias de ruta para proteger módulos
- Interceptores HTTP para inyección automática de tokens
- Control de permisos por rol de usuario
- Manejo centralizado de errores HTTP

## Módulos Principales

### 1. Autenticación
Gestión completa de sesiones de usuario:
- Inicio de sesión con email/usuario y contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña
- Cierre de sesión

### 2. Dashboard
Panel principal con resumen de estadísticas y accesos rápidos a las funcionalidades principales.

### 3. Campañas
Administración de campañas publicitarias:
- Creación y edición de campañas
- Asignación de contenidos
- Programación de horarios
- Vinculación con pantallas

### 4. Pantallas
Control de dispositivos de visualización:
- Listado de pantallas activas
- Estado de conexión en tiempo real
- Configuración de pantallas
- Asignación de campañas

### 5. Contenidos
Biblioteca de recursos multimedia:
- Gestión de imágenes, videos y contenido HTML
- Carga de archivos
- Previsualización de contenidos
- Optimización con IA

### 6. Reportes
Análisis y estadísticas:
- Visualización de métricas de campañas
- Reportes de rendimiento de pantallas
- Estadísticas de reproducción de contenidos
- Exportación de datos

## Scripts Disponibles

- `npm run start`: Inicia el servidor de desarrollo en puerto 4200
- `npm run construir`: Genera build optimizado para producción
- `npm run observar`: Build en modo watch (reconstruye automáticamente)
- `npm run servir-produccion`: Sirve el build de producción en puerto 8080
- `npm test`: Ejecuta pruebas unitarias
- `npm run lint`: Analiza el código en busca de errores

## Tecnologías Utilizadas

- Angular 18.2.0
- TypeScript 5.5
- RxJS para programación reactiva
- Signals de Angular para gestión de estado
- SCSS para estilos
- HttpClient para comunicación con API
- WebSockets para actualizaciones en tiempo real

## Contribución

Para contribuir al proyecto:

1. Crear una rama desde main:
```bash
git checkout -b feature/nueva-funcionalidad
```

2. Realizar cambios y commits descriptivos:
```bash
git add .
git commit -m "Descripción clara del cambio realizado"
```

3. Enviar cambios al repositorio:
```bash
git push origin feature/nueva-funcionalidad
```

4. Crear Pull Request para revisión

## Notas de Desarrollo

- El proyecto utiliza arquitectura modular con lazy loading
- Los servicios están centralizados en el directorio core
- Las rutas están protegidas con guardias de autenticación
- Los interceptores gestionan automáticamente tokens y errores
- La aplicación está preparada para despliegue en contenedores Docker

## Licencia

Este proyecto es parte del trabajo final de InnoAd. Todos los derechos reservados.
