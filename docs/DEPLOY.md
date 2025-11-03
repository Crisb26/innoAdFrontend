# Despliegue end-to-end (Frontend + Backend)

Esta guía cubre despliegue local y productivo usando Docker Compose, y CI de imágenes en GitHub Container Registry (GHCR).

## 1) Prerrequisitos
- Docker Desktop 4.x (Windows) con soporte para `host.docker.internal`.
- Node 18 para builds locales (opcional si usas sólo Docker).
- Back-end Spring Boot accesible en puerto 8080 (o imagen de contenedor disponible).

## 2) Variables de entorno
Copia `.env.example` a `.env` y ajusta:

- FRONTEND_HTTP_PORT=8080 (puerto host para el frontend)
- BACKEND_HTTP_PORT=8081 (puerto host para el backend)
- BACKEND_IMAGE=innoad-backend:latest (o ghcr.io/<org>/innoad-backend:tag)
- BACKEND_INTERNAL_PORT=8080 (puerto interno del backend)
- SPRING_PROFILES_ACTIVE=prod
- JWT_SECRET=change-me (ajusta a tu secreto)
- CORS_ALLOWED_ORIGINS=... (dominios permitidos)
- FRONTEND_IMAGE (opcional)

## 3) Despliegue local con backend en contenedor (red interna)

```cmd
REM Construir y levantar ambos servicios
docker compose up --build -d

REM Ver estado
docker compose ps

REM Logs (salida en vivo)
docker compose logs -f frontend
```

- App: http://localhost:%FRONTEND_HTTP_PORT%
- Backend: http://localhost:%BACKEND_HTTP_PORT%

## 4) Despliegue local con backend corriendo en tu host
Si tu Spring Boot corre en http://localhost:8080 en tu máquina, usa el proxy de Nginx hacia `host.docker.internal`:

```cmd
docker compose -f docker-compose.external.yml up --build -d
```

## 5) Despliegue productivo (imágenes publicadas)
Con imágenes ya publicadas en GHCR u otro registry, usa `docker-compose.prod.yml`:

```cmd
REM Define las imágenes en .env (FRONTEND_IMAGE y BACKEND_IMAGE)
docker compose -f docker-compose.prod.yml up -d
```

## 6) CI/CD de Frontend en GitHub

- Workflow: `.github/workflows/frontend-ci.yml`.
- En cada push a `main` o tag `v*`:
  - Instala deps, lint y construye Angular (artifacts).
  - Construye y publica imagen Docker en GHCR: `ghcr.io/<owner>/innoad-frontend` con tags automáticos (rama, tag y sha).

Para usar un registry distinto, adapta `IMAGE_NAME` y el paso de login.

## 7) Desarrollo local sin Docker (opcional)

- Servidor Angular con proxy para evitar CORS:

```cmd
npm ci
npm run iniciar:proxy
```

El proxy reenvía `/api` y `/ws` a `http://localhost:8080`.

## 8) Salud, logs y redes
- Healthchecks incluidos en Compose.
- Redes: `innoad-net` por defecto.
- Nginx con headers de seguridad básicos, gzip, cache estática y SPA fallback.

## 9) Notas de backend
- Se espera endpoint `GET /actuator/health` para healthcheck.
- Base URL: `/api/v1` y websockets `/ws`.
- CORS debe permitir el dominio público del frontend en producción.

## 10) Troubleshooting
- 502 desde frontend: verifica que `backend` esté `healthy` y resolviendo DNS dentro de la red Compose.
- CORS en local: usa el proxy de Angular o la variante `docker-compose.external.yml`.
- WebSocket: confirma coincidencia de rutas (`/ws`) y soporte en backend.
