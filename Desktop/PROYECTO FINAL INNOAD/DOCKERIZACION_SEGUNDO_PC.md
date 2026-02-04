# 🐳 PLAN: DOCKERIZACIÓN EN SEGUNDO PC

**Creado**: 1 Enero 2026  
**Objetivo**: Procedimiento detallado para levantar todo en otro PC con Docker  
**Duración estimada**: 1-2 horas (primero), 10 minutos (subsiguientes)

---

## 📋 FASES DEL PLAN

### FASE 0: PRE-REQUISITOS EN SEGUNDO PC
### FASE 1: PREPARAR CÓDIGO LIMPIO  
### FASE 2: DOCKER BUILD LOCAL
### FASE 3: DOCKER COMPOSE UP
### FASE 4: VALIDACIÓN E2E
### FASE 5: TROUBLESHOOTING & AJUSTES

---

## FASE 0: INSTALAR PRE-REQUISITOS EN SEGUNDO PC

### ✋ Software necesario

| Software | Versión | Por qué |
|----------|---------|--------|
| **Git** | 2.40+ | Clonar repo |
| **Docker** | 24.0+ | Containerizar |
| **Docker Compose** | 2.20+ | Orquestar servicios |
| **VS Code** | Latest | Editor (opcional, pero recomendado) |

### ✋ PASO 1: Instalar Docker Desktop (Windows)

1. Descarga: https://www.docker.com/products/docker-desktop
2. Instala como administrador
3. Reinicia Windows
4. Verifica:
```bash
docker --version
docker run hello-world
```

**Esperado**: ✅ hello-world image descargada y ejecutada

### ✋ PASO 2: Instalar Git (si no existe)

1. Descarga: https://git-scm.com/download/win
2. Instala con defaults
3. Verifica:
```bash
git --version
```

### ✋ PASO 3: Dar permisos a Docker

Si Docker Desktop no levanta servicios:
```powershell
# PowerShell como Admin:
wsl --update
wsl --set-default-version 2
```

---

## FASE 1: PREPARAR CÓDIGO LIMPIO

### ✋ OPCIÓN A: Clonar desde GitHub (RECOMENDADO)

```bash
cd C:\Users\<TuUsuario>\Desktop
git clone https://github.com/TU_USUARIO/innoad-project.git
cd innoad-project
```

**Esperado**: 
- ✅ Carpetas: `BACKEND/innoadBackend`, `FRONTEND/innoadFrontend`
- ✅ Archivos: `docker-compose.yml`, `.env.example`

### ✋ OPCIÓN B: Copiar código manualmente

Si no tienes GitHub, copia estas carpetas:
```
C:\ProyectoInnoAd\
├── BACKEND\
│   └── innoadBackend\
│       ├── src\
│       ├── pom.xml
│       ├── Dockerfile.optimizado
│       └── ...
├── FRONTEND\
│   └── innoadFrontend\
│       ├── src\
│       ├── package.json
│       ├── Dockerfile.optimizado
│       ├── nginx-prod.conf
│       └── ...
├── docker-compose.yml
└── .env
```

### ✋ PASO 1: Crear archivo `.env`

En la carpeta raíz del proyecto, crea `.env`:

```bash
# Basado en .env.example
# Copiar este contenido y adaptarlo:
```

```env
# Database
POSTGRES_USER=innoad_user
POSTGRES_PASSWORD=SecurePassword123!
POSTGRES_DB=innoad_db
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_PASSWORD=RedisPassword123!
REDIS_HOST=redis
REDIS_PORT=6379

# JWT & Security
JWT_SECRET=tu_jwt_secret_muy_largo_y_aleatorio_aqui_12345
JWT_EXPIRATION=86400

# Mercado Pago
MP_ACCESS_TOKEN=TEST_ACCESS_TOKEN_AQUI
MP_PUBLIC_KEY=APP_ID_AQUI

# OpenAI
OPENAI_API_KEY=sk-AQUI_tu_api_key
OPENAI_ORG_ID=org-AQUI_tu_org_id

# CORS
CORS_ORIGINS=http://localhost:4200,http://localhost:80,http://localhost:3000

# Build Info
BUILD_DATE=$(date)
VERSION=1.0.0
GIT_COMMIT=$(git rev-parse --short HEAD)
```

**Importante**: 
- ✅ `.env` NUNCA se sube a GitHub (está en `.gitignore`)
- ✅ Usar `.env.example` como referencia
- ✅ Cambiar valores dummy por valores reales

---

## FASE 2: DOCKER BUILD LOCAL

### ✋ PASO 1: Verificar estructura

```bash
cd C:\ProyectoInnoAd

# Listar archivos importantes:
dir /s docker-compose.yml
dir /s Dockerfile.optimizado
dir BACKEND\innoadBackend\Dockerfile.optimizado
dir FRONTEND\innoadFrontend\Dockerfile.optimizado
```

**Esperado**: Todos los archivos existen ✅

### ✋ PASO 2: Build Backend Image

```bash
cd BACKEND\innoadBackend

# Build local (sin push a registry)
docker build -t innoad-backend:local -f Dockerfile.optimizado .
```

**Esperado**:
```
[+] Building 120.5s (15/15) FINISHED
 => => exporting to docker image
 => innoad-backend:local
```

**Si falla**:
- [ ] Maven build error → revisar `pom.xml`
- [ ] Java 21 no disponible en imagen → actualizar `pom.xml`
- [ ] Disk space bajo → liberar espacio
- [ ] Ver logs: `docker build ... --progress=plain`

### ✋ PASO 3: Build Frontend Image

```bash
cd ..\..\FRONTEND\innoadFrontend

docker build -t innoad-frontend:local -f Dockerfile.optimizado .
```

**Esperado**:
```
[+] Building 60.2s (12/12) FINISHED
 => => exporting to docker image
 => innoad-frontend:local
```

### ✋ PASO 4: Verificar imágenes

```bash
docker images | findstr innoad
```

**Esperado**:
```
innoad-backend    local    abc123    ...    150MB
innoad-frontend   local    def456    ...    50MB
```

---

## FASE 3: DOCKER COMPOSE UP

### ✋ PASO 1: Ir a carpeta raíz

```bash
cd C:\ProyectoInnoAd
```

Debe haber `docker-compose.yml` en esta carpeta.

### ✋ PASO 2: Validar configuración

```bash
docker-compose config
```

**Esperado**: ✅ Valida sin errores (mostrará la configuración procesada)

### ✋ PASO 3: LEVANTA SERVICIOS

```bash
# Opción A: En foreground (ver logs en terminal)
docker-compose up

# Opción B: En background (seguir usando terminal)
docker-compose up -d

# Ver logs después:
docker-compose logs -f
```

**Esperado** (primeras línadas):
```
Creating innoad-postgres_1  ... done
Creating innoad-redis_1     ... done
Creating innoad-backend_1   ... done
Creating innoad-frontend_1  ... done
```

**Esperar**: 30-60 segundos para que services inicien

### ✋ PASO 4: Verificar Health

```bash
# En otra terminal:
docker-compose ps
```

**Esperado**:
```
NAME              STATUS          PORTS
innoad-postgres   Up (healthy)    5432/tcp
innoad-redis      Up (healthy)    6379/tcp
innoad-backend    Up (healthy)    8080->8080/tcp
innoad-frontend   Up (healthy)    80->80/tcp, 443->443/tcp
```

Todos con `(healthy)` ✅

---

## FASE 4: VALIDACIÓN E2E

### ✋ PASO 1: Test Backend Health

```bash
curl http://localhost:8080/actuator/health
```

**Esperado**: 
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

### ✋ PASO 2: Test Swagger API

Abre en navegador: `http://localhost:8080/swagger-ui.html`

**Esperado**: ✅ API documentada, puedes expandir endpoints

### ✋ PASO 3: Test Frontend

Abre en navegador: `http://localhost`

**Esperado**: 
- ✅ Ves página de login
- ✅ Sin errores de conexión en F12 Console
- ✅ Frontend cargó exitosamente

### ✋ PASO 4: Login Test

1. Abre http://localhost
2. Login con credenciales de test (si existen en DB)
3. Deberías ver dashboard

**Esperado**: ✅ Redirecciona a dashboard/home

### ✋ PASO 5: Database Check

Acceder a BD desde dentro de container:

```bash
# Entrar al container de PostgreSQL
docker exec -it innoad-postgres psql -U innoad_user -d innoad_db

# Listar tablas:
\dt

# Ver usuarios:
SELECT * FROM users;

# Salir:
\q
```

---

## FASE 5: TROUBLESHOOTING & AJUSTES

### ⚠️ PROBLEMA: Container no levanta

```bash
# Ver logs:
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

**Soluciones comunes**:
- [ ] Base de datos no migró → ejecutar SQL script manualmente
- [ ] Variables `.env` incorrectas → revisar valores
- [ ] Puerto ocupado → cambiar en `docker-compose.yml`
- [ ] Imagen corrupta → `docker-compose down && docker system prune`

### ⚠️ PROBLEMA: Backend no conecta a PostgreSQL

Logs típico:
```
ERROR o.s.b.a.h.HikariPool : HikariPool-1 - Connection is not available, request timed out after 30000ms.
```

**Soluciones**:
```bash
# 1. Revisar que Postgres levantó:
docker-compose ps postgres
# Debe estar UP (healthy)

# 2. Revisar credenciales en .env:
cat .env | findstr POSTGRES

# 3. Probar conexión:
docker exec innoad-postgres psql -U innoad_user -d innoad_db -c "SELECT 1"
```

### ⚠️ PROBLEMA: Frontend carga pero no conecta a API

Logs de navegador (F12):
```
GET http://localhost/api/... 404 or 502
```

**Soluciones**:
```bash
# 1. Revisar que backend levantó:
docker-compose ps backend
# Debe estar UP (healthy)

# 2. Test directo al backend:
curl http://localhost:8080/actuator/health

# 3. Revisar nginx config en frontend:
docker exec innoad-frontend cat /etc/nginx/nginx.conf | grep "proxy_pass"
```

### ⚠️ PROBLEMA: Build falla

Típicamente Maven o npm:

**Backend**:
```bash
# Ver log detallado:
docker build -t innoad-backend:local -f Dockerfile.optimizado . --progress=plain

# Si error de Maven:
# - Revisar pom.xml
# - Revisar conexión internet
# - Aumentar timeout: MAVEN_OPTS="-Dhttp.connectionManager.timeout=60000"
```

**Frontend**:
```bash
# Ver log detallado:
docker build -t innoad-frontend:local -f Dockerfile.optimizado . --progress=plain

# Si error de npm:
# - Revisar package.json
# - Revisar conexión internet
# - Limpiar cache: npm cache clean --force
```

---

## 🔄 CICLO DE DESARROLLO CON DOCKER

Una vez validado, para cambios futuros:

### Opción 1: Cambios en Frontend (rápido)

```bash
# 1. Editar código en FRONTEND\innoadFrontend\src\
# 2. Rebuild solo frontend:
docker-compose down frontend
docker build -t innoad-frontend:local -f Dockerfile.optimizado FRONTEND\innoadFrontend\
docker-compose up -d frontend
# 3. Abre navegador: http://localhost
```

### Opción 2: Cambios en Backend (requiere rebuild)

```bash
# 1. Editar código en BACKEND\innoadBackend\src\
# 2. Rebuild:
docker-compose down backend
docker build -t innoad-backend:local -f Dockerfile.optimizado BACKEND\innoadBackend\
docker-compose up -d backend
# 3. Test: curl http://localhost:8080/actuator/health
```

### Opción 3: Cambios en .env (sin rebuild)

```bash
# 1. Editar .env
# 2. Restart servicios:
docker-compose restart
```

### Opción 4: Limpiar y empezar

```bash
# Para borrar TODO y empezar limpio:
docker-compose down --volumes
# Luego:
docker-compose up
```

---

## 📊 COMANDOS ÚTILES

```bash
# Ver todos los containers:
docker ps -a

# Ver logs en tiempo real:
docker-compose logs -f

# Logs de un servicio específico:
docker-compose logs -f backend

# Entrar a un container:
docker exec -it innoad-backend bash
docker exec -it innoad-postgres psql -U innoad_user -d innoad_db

# Detener todo:
docker-compose down

# Detener y borrar volúmenes:
docker-compose down --volumes

# Rebuild sin cache:
docker-compose build --no-cache

# Ver tamaño de imágenes:
docker images

# Limpiar imágenes sin usar:
docker image prune

# Ver red:
docker network ls
docker network inspect innoad-network

# Ver volúmenes:
docker volume ls
docker volume inspect innoad-postgres_data
```

---

## ✅ CHECKLIST FINAL

Cuando todo funcione:

```
PRE-REQUISITOS
✅ Docker Desktop instalado
✅ Git instalado
✅ WSL 2 configurado (Windows)

CÓDIGO
✅ Clonado o copiado correctamente
✅ .env creado con valores válidos
✅ docker-compose.yml presente

DOCKER BUILD
✅ Backend imagen compilada (150MB)
✅ Frontend imagen compilada (50MB)
✅ Imágenes aparecen en `docker images`

DOCKER COMPOSE
✅ Validación YAML sin errores
✅ Todos los containers UP (healthy)
✅ Redes creadas
✅ Volúmenes creados

VALIDACIÓN
✅ Backend health: http://localhost:8080/actuator/health
✅ Swagger API: http://localhost:8080/swagger-ui.html
✅ Frontend: http://localhost
✅ Login funciona
✅ Database responde

RESULTADO: 🟢 LISTO PARA PRODUCCIÓN
```

---

## 🚀 SIGUIENTE PASO: DEPLOYMENT A AZURE

Una vez validado localmente, puedes:

1. **Subir imágenes a Azure Container Registry**:
```bash
az acr build --registry MiRegistro \
  --image innoad-backend:1.0 BACKEND\innoadBackend\

az acr build --registry MiRegistro \
  --image innoad-frontend:1.0 FRONTEND\innoadFrontend\
```

2. **Deploy a Azure App Service**:
```bash
# Usar Bicep o Terraform (disponible en FASE_9_DEPLOYMENT_CICD.md)
```

3. **Deploy a Azure Container Instances** (simple):
```bash
# Para pruebas rápidas
docker run -d -p 8080:8080 myregistry.azurecr.io/innoad-backend:1.0
```

---

**Próximas actualizaciones**: Agregar GitHub Actions para CI/CD automático  
**Tiempo total esta FASE**: 1-2 horas (primero), 10 min (subsiguientes)  
**Última actualización**: 1 Enero 2026
