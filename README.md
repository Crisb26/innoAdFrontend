# INNOAD Frontend

## Descripción del Proyecto

INNOAD Frontend es una aplicación web desarrollada en Angular 18 que proporciona una interfaz de usuario moderna y eficiente para la gestión y visualización de campañas publicitarias digitales. El sistema permite la administración de pantallas digitales, contenidos multimedia y el análisis de estadísticas en tiempo real.

## Características Principales

- Gestión de campañas publicitarias
- Administración de contenidos multimedia
- Control de pantallas digitales
- Dashboard de estadísticas en tiempo real
- Sistema de autenticación y autorización
- Generación de reportes
- Integración con IA para optimización de contenidos

## Requisitos Técnicos

### Software Necesario

- Node.js (versión 18.x o superior)
- npm (incluido con Node.js)
- Git
- Docker Desktop
- Visual Studio Code

### Extensiones Recomendadas para VS Code

- Angular Language Service
- ESLint
- Prettier
- Docker
- GitLens

## Configuración del Entorno

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/tu-usuario/innoad-frontend.git
# Entra en la carpeta creada por git (por defecto `innoad-frontend`).
# Si tu carpeta local ya tiene otro nombre, usa ese en su lugar (por ejemplo `innoadFrontend`).
cd innoad-frontend
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
Editar el archivo \`src/environments/environment.ts\` con tu configuración:
\`\`\`typescript
export const environment = {
  urlApi: 'http://localhost:8080/api/v1',  // URL de tu backend
  urlWebSocket: 'ws://localhost:8080/ws',
  // ... otras configuraciones
};
\`\`\`

### 4. Ejecutar en desarrollo
\`\`\`bash
npm run iniciar
# o
ng serve
\`\`\`

La aplicación estará disponible en: \`http://localhost:4200\`

### Desarrollo Local

1. Clonar el repositorio:
```bash
git clone https://github.com/Crisb26/innoAdFrontend.git
cd innoAdFrontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Editar el archivo `src/environments/environment.ts` según la configuración del backend:
```typescript
export const environment = {
  urlApi: 'http://localhost:8080/api/v1',
  urlWebSocket: 'ws://localhost:8080/ws',
  tiempoExpiracionToken: 3600000,
  tiempoRefrescoToken: 300000
};
```

4. Iniciar servidor de desarrollo:
```bash
npm run start
```
La aplicación estará disponible en `http://localhost:4200`

### Build para Producción

```bash
npm run construir
```
Los archivos compilados estarán en `dist/innoad-frontend`

### Servir Build de Producción

```bash
npm run servir-produccion
```
La aplicación estará disponible en `http://localhost:8080`

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
