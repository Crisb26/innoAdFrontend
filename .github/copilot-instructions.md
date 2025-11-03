# Instrucciones para agentes de IA en este repositorio

Estas pautas te permiten ser productivo desde el minuto 1 en este frontend Angular. Resume arquitectura, flujos, convenciones y cómo integrar con el backend.

## Panorama general
- Framework: Angular 18 (standalone components), TypeScript 5.5, SCSS. Proyecto único `innoad-frontend` (ver `angular.json`).
- Arquitectura modular con lazy loading: rutas en `src/app/app.routes.ts` cargan módulos en `src/app/modulos/**`.
- Núcleo común en `src/app/core`: servicios HTTP, interceptores, guards y modelos.
- Entornos: `src/environments/environment.ts` (dev) y `environment.prod.ts` (prod). La URL del backend se inyecta en build (no en runtime).

## Comunicación con backend
- Base URL: `environment.urlApi`, p.ej. `http://localhost:8080/api/v1`.
- Interceptor de Auth (`core/interceptores/auth.interceptor.ts`) añade `Authorization: Bearer <token>` a todas las peticiones excepto las de `/autenticacion/`.
- Interceptor de errores (`core/interceptores/error.interceptor.ts`): 401 → cierra sesión; 503 → redirige a `/mantenimiento`.
- Contratos de API: todas las respuestas siguen `RespuestaAPI<T>` definido en `core/modelos/index.ts` y los servicios hacen `map(r => r.datos!)`.
- Autenticación (`core/servicios/autenticacion.servicio.ts`):
  - Endpoints esperados: `/autenticacion/iniciar-sesion`, `/registrarse`, `/cerrar-sesion`, `/refrescar-token`, recuperación/cambio/restablecer contraseña.
  - Login espera `RespuestaLogin` con `token`, `tokenActualizacion` y `usuario` (modelo `Usuario`).
  - “Recordarme” guarda tokens en `localStorage` (si no, `sessionStorage`). Refresco automático de token cada ~50 min.
- Autorización: `guardAutenticacion` protege rutas; `guardPermisos` usa `route.data.permisos` y privilegia rol `Administrador`.

## Convenciones del proyecto
- Servicios: `core/servicios/*.servicio.ts` con `API_URL = `${environment.urlApi}/<recurso>`` y acceso por `HttpClient`.
- Modelos: en `core/modelos/**`; el índice `core/modelos/index.ts` reexporta tipos para importación desde `@core/modelos`.
- Nombres y comentarios en español; roles y permisos usan `Usuario.rol.nombre` y `Usuario.permisos[].nombre`.
- Patrón de mapeo en servicios: `this.http.<verbo><RespuestaAPI<T>>(...).pipe(map(r => r.datos!))`.

## Rutas clave (ejemplos)
- `app.routes.ts`: `dashboard`, `campanas`, `pantallas`, `contenidos`, `reportes` con `canActivate: [guardAutenticacion]`.
- Autenticación: módulo en `modulos/autenticacion/**` con componentes `iniciar-sesion`, `registrarse`, `recuperar-contrasena`.

## Workflows de desarrollo
- Scripts (ver `package.json`):
  - `npm run iniciar`: dev server (Angular CLI).
  - `npm run construir`: build de producción → `dist/innoad-frontend`.
  - `npm run servir-produccion`: sirve el build con `http-server` en `http://localhost:8080`.
- Nota: no existe `npm run start` por defecto; usa `npm run iniciar`.

## Despliegue del frontend
- Contenedor Nginx: `Dockerfile` (multi-stage). Construye con Node 18 y sirve con Nginx (config en `nginx.conf`, SPA fallback con `try_files`).
- Para apuntar al backend correcto en producción, ajusta `src/environments/environment.prod.ts` antes de construir.

## Integración con el backend (checklist)
- Confirma `environment.urlApi` y `urlWebSocket` acordes al backend.
- Habilita CORS en backend para `http://localhost:4200` (dev) y el dominio de producción.
- Verifica endpoints y contrato `RespuestaAPI<T>` para: autenticación, campañas, pantallas, contenidos, estadísticas, agente-ia.
- Provee cuentas semilla (admin y otros roles) y credenciales para validación end‑to‑end.

## Ejemplos prácticos
- Nuevo servicio API (patrón): crea `core/servicios/xxx.servicio.ts` con `API_URL` y métodos que devuelven `map(r => r.datos!)`.
- Ruta con permisos: `{ path: 'admin', canActivate: [guardAutenticacion, guardPermisos], data: { permisos: ['ADMIN_PANEL_VER'] }, loadComponent: ... }`.

Si algo no cuadra (p. ej., respuestas sin `datos`, rutas o scripts), alinea el contrato del backend o actualiza el servicio correspondiente. Mantén estas reglas al día al cambiar arquitectura o scripts.