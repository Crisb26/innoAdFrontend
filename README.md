# InnoAd Frontend

Aplicación Angular para gestión de campañas publicitarias digitales con IA integrada.

## Stack Tecnológico

- **Framework**: Angular 18.2.x
- **TypeScript**: 5.5.x
- **Estado**: Signals + RxJS
- **Estilos**: SCSS personalizado
- **Autenticación**: JWT
- **Alertas**: SweetAlert2

## Requisitos

- Node.js 20+ LTS
- npm 11+
- Angular CLI 18

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

Aplicación disponible en: http://localhost:4200

## Configuración

### Entornos

**Desarrollo** (environment.ts):
```typescript
api: {
  baseUrl: 'http://localhost:8080/api'
}
```

**Producción** (environment.prod.ts):
```typescript
api: {
  baseUrl: 'https://innoad-backend.wonderfuldune-d0f51e2f.eastus2.azurecontainerapps.io/api'
}
```

## Build

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
