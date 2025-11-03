# Guía de Configuración para Colaboradores

## Requisitos Previos

Antes de comenzar a trabajar con el proyecto, asegúrate de tener instalado:

### Software Obligatorio

1. **Node.js** (versión 18.x o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **Git**
   - Descargar desde: https://git-scm.com/
   - Verificar instalación: `git --version`

3. **Visual Studio Code**
   - Descargar desde: https://code.visualstudio.com/

4. **Docker Desktop** (opcional, para despliegue en contenedores)
   - Descargar desde: https://www.docker.com/products/docker-desktop

### Extensiones Recomendadas para VS Code

Instalar las siguientes extensiones para mejorar la experiencia de desarrollo:

1. **Angular Language Service** (Angular.ng-template)
   - Autocompletado y validación de templates Angular

2. **ESLint** (dbaeumer.vscode-eslint)
   - Análisis de código y detección de errores

3. **Prettier - Code formatter** (esbenp.prettier-vscode)
   - Formateo automático de código

4. **Docker** (ms-azuretools.vscode-docker)
   - Soporte para trabajar con contenedores

5. **GitLens** (eamodio.gitlens)
   - Herramientas avanzadas de Git

## Pasos para Configurar el Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Crisb26/innoAdFrontend.git
cd innoAdFrontend
```

### 2. Instalar Dependencias

```bash
npm install
```

Este proceso puede tomar varios minutos. Descargará todas las librerías necesarias especificadas en `package.json`.

### 3. Configurar Variables de Entorno

Editar el archivo `src/environments/environment.ts` con la configuración del backend:

```typescript
export const environment = {
  produccion: false,
  urlApi: 'http://localhost:8080/api/v1',  // URL del backend
  urlWebSocket: 'ws://localhost:8080/ws',
  tiempoExpiracionToken: 3600000,
  tiempoRefrescoToken: 300000
};
```

**Importante:** No modificar `environment.prod.ts` a menos que sea necesario para producción.

### 4. Ejecutar el Proyecto en Desarrollo

```bash
npm run start
```

La aplicación estará disponible en: `http://localhost:4200`

### 5. Verificar que Funciona

Abre el navegador y accede a `http://localhost:4200`. Deberías ver la página de inicio de sesión de INNOAD.

## Flujo de Trabajo con Git

### Antes de Empezar a Trabajar

1. Asegúrate de tener la última versión del código:
```bash
git pull origin main
```

2. Crea una rama para tu funcionalidad:
```bash
git checkout -b feature/nombre-funcionalidad
```

Ejemplos:
- `feature/dashboard-estadisticas`
- `feature/formulario-campanas`
- `fix/error-autenticacion`

### Durante el Desarrollo

1. Haz commits frecuentes con mensajes descriptivos:
```bash
git add .
git commit -m "Descripción clara del cambio realizado"
```

Ejemplo de buenos mensajes de commit:
- "Implementa formulario de creación de campañas"
- "Corrige error en el servicio de autenticación"
- "Agrega validaciones al formulario de registro"

### Al Terminar tu Trabajo

1. Sube tus cambios al repositorio:
```bash
git push origin feature/nombre-funcionalidad
```

2. Crea un Pull Request en GitHub para revisión

## Scripts Disponibles

- `npm run start`: Inicia servidor de desarrollo (puerto 4200)
- `npm run construir`: Genera build de producción
- `npm run servir-produccion`: Sirve build de producción (puerto 8080)
- `npm test`: Ejecuta pruebas unitarias
- `npm run lint`: Analiza código en busca de errores

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/              # Servicios, guardias, interceptores
│   ├── modulos/           # Módulos funcionales (dashboard, campañas, etc.)
│   ├── shared/            # Componentes compartidos
│   └── app.routes.ts      # Configuración de rutas
├── assets/                # Recursos estáticos (imágenes, iconos, videos)
├── environments/          # Configuración de entornos
└── styles.scss            # Estilos globales
```

## Módulos del Sistema

1. **Autenticación** (`/autenticacion`)
   - Inicio de sesión
   - Registro
   - Recuperación de contraseña

2. **Dashboard** (`/dashboard`)
   - Panel principal con estadísticas

3. **Campañas** (`/campanas`)
   - Lista de campañas
   - Crear/editar campañas
   - Programación de horarios

4. **Pantallas** (`/pantallas`)
   - Lista de dispositivos
   - Estado de conexión
   - Configuración

5. **Contenidos** (`/contenidos`)
   - Biblioteca multimedia
   - Carga de archivos
   - Gestión de medios

6. **Reportes** (`/reportes`)
   - Estadísticas
   - Generación de reportes

## Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 4200 is already in use"
```bash
# Opción 1: Usar otro puerto
ng serve --port 4201

# Opción 2: Matar el proceso que usa el puerto 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID [número_de_proceso] /F
```

### Error de compilación
```bash
ng cache clean
npm run construir
```

### Problemas con Git
```bash
# Ver estado actual
git status

# Descartar cambios locales
git checkout -- .

# Obtener última versión
git pull origin main
```

## Buenas Prácticas

1. **Código Limpio**
   - Usar nombres descriptivos para variables y funciones
   - Comentar código complejo
   - Seguir las convenciones de Angular

2. **Commits**
   - Hacer commits pequeños y frecuentes
   - Escribir mensajes claros y descriptivos
   - No hacer commit de archivos generados (node_modules, dist)

3. **Ramas**
   - Nunca trabajar directamente en `main`
   - Usar ramas descriptivas: `feature/`, `fix/`, `hotfix/`
   - Mantener las ramas actualizadas con `main`

4. **Código**
   - Probar cambios antes de hacer commit
   - Revisar el código antes de crear Pull Request
   - No dejar console.log en código de producción

## Contacto y Soporte

Si tienes dudas o problemas:

1. Revisa primero esta documentación
2. Consulta el README.md del proyecto
3. Busca en issues cerrados de GitHub
4. Crea un nuevo issue si el problema persiste

## Recursos Adicionales

- Documentación Angular: https://angular.io/docs
- Guía de TypeScript: https://www.typescriptlang.org/docs/
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf
- VS Code Tips: https://code.visualstudio.com/docs
