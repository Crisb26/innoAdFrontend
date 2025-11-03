# Lista de verificación para despliegue frontend + backend

## Pre-despliegue
- [ ] Repositorio de backend cuenta con Dockerfile, healthcheck (`/actuator/health`) y config CORS.
- [ ] Variables de entorno `.env` (frontend) configuradas con secreto JWT real y CORS actualizado.
- [ ] Imágenes de contenedor etiquetadas o disponibles en registry (GHCR u otro).

## Local – Desarrollo
- [ ] Backend corriendo en `http://localhost:8080` ó `docker compose -f docker-compose.external.yml up`.
- [ ] Frontend en `npm run iniciar:proxy` (dev) ó Docker externo.
- [ ] Login exitoso con credenciales de prueba (admin / Admin123!).

## Local – Integración (Docker)
- [ ] `docker compose up -d --build` levanta frontend + backend.
- [ ] Healthchecks pasan: `docker compose ps` marca ambos `healthy`.
- [ ] Logs `docker compose logs -f` sin errores de conexión.
- [ ] App accesible en http://localhost:8080, backend en http://localhost:8081.

## CI/CD
- [ ] Workflow `.github/workflows/frontend-ci.yml` en el repo front.
- [ ] Workflow `.github/workflows/backend-ci.yml` en el repo back (o usa plantilla `docs/backend-ci-template.yml`).
- [ ] Push a `main` dispara build, test, publicación de imagen en GHCR.
- [ ] Tags `v*` también construyen y publican imágenes (opcional).

## Producción
- [ ] Usar `docker-compose.prod.yml` con imágenes publicadas (no build local).
- [ ] `JWT_SECRET`, CORS y HTTPS correctos.
- [ ] Reverse proxy (Traefik/Nginx) y SSL opcional en host/VM real.
- [ ] Monitoreo y backups de BD configurados.

## Post-despliegue
- [ ] Login desde interfaz web → se genera JWT → refresh funciona.
- [ ] Endpoints de salud: `GET /actuator/health` (backend) y `GET /` (frontend).
- [ ] Logs accesibles para debugging (`docker compose logs`).
- [ ] Documentación actualizada en `docs/DEPLOY.md`.
