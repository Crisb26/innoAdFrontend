# 📦 InnoAd Frontend - Configuración Docker Completa

## ✅ Archivos Creados

```
📁 innoAdFrontend/
├── 🐳 Dockerfile                    # Configuración Docker optimizada
├── 📝 docker-compose.yml            # Orquestación de contenedores
├── 🚫 .dockerignore                 # Archivos excluidos del build
├── ⚙️  nginx.conf                    # Configuración Nginx optimizada
├── 💻 docker-deploy.sh              # Script Linux/Mac (automatización)
├── 💻 docker-deploy.ps1             # Script PowerShell (automatización)
├── 📄 .env.docker                   # Variables de entorno ejemplo
├── 📚 DOCKER-README.md              # Guía rápida
├── 📖 DOCKER-GUIDE.md               # Guía completa detallada
├── 🎯 DOCKER-BEST-PRACTICES.md      # Mejores prácticas
└── 📁 .github/
    └── 📁 workflows/
        └── docker-build.yml         # CI/CD automatizado
```

## 🚀 Inicio Rápido - 3 Comandos

### Opción 1: Local
```powershell
# 1. Construir
docker build -t innoad-frontend:latest .

# 2. Ejecutar
docker run -d -p 80:80 --name innoad-frontend innoad-frontend:latest

# 3. Verificar
# Abrir: http://localhost
```

### Opción 2: Con Compose
```powershell
docker-compose up -d
```

### Opción 3: Con NPM
```powershell
npm run docker:build
npm run docker:run
```

## 📤 Subir a Docker Hub

### Método Automático (Recomendado)
```powershell
# Windows
.\docker-deploy.ps1 -Version "2.0.0" -DockerUsername "tu-usuario"

# Linux/Mac
chmod +x docker-deploy.sh
./docker-deploy.sh 2.0.0
```

### Método Manual
```powershell
# 1. Login
docker login

# 2. Etiquetar
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:2.0.0
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:latest

# 3. Subir
docker push tu-usuario/innoad-frontend:2.0.0
docker push tu-usuario/innoad-frontend:latest
```

## 📊 Características de Optimización

### ✅ Multi-Stage Build
- **Etapa 1**: Build con Node.js 20
- **Etapa 2**: Runtime con Nginx Alpine

### ✅ Tamaño Optimizado
- Sin optimización: ~1.2 GB
- **Con optimización: 40-60 MB** 🎉

### ✅ Performance
- Compresión Gzip
- Cache de assets estáticos
- Headers de seguridad
- Health checks

### ✅ Seguridad
- Usuario no-root (nginx)
- Headers de seguridad
- HTTPS ready
- Escaneo de vulnerabilidades

## 🎯 Comandos NPM Disponibles

```json
"docker:build"         - Construir imagen
"docker:build:prod"    - Construir para producción
"docker:build:compose" - Construir para compose
"docker:run"           - Ejecutar contenedor
"docker:stop"          - Detener contenedor
"docker:restart"       - Reiniciar contenedor
"docker:logs"          - Ver logs
"docker:shell"         - Acceder al shell
"docker:clean"         - Limpiar sistema
"docker:size"          - Ver tamaño de imagen

"compose:up"           - Iniciar con compose
"compose:down"         - Detener compose
"compose:logs"         - Ver logs de compose
"compose:restart"      - Reiniciar servicios
"compose:rebuild"      - Reconstruir y reiniciar
```

## 🔄 CI/CD Automatizado (GitHub Actions)

Ya configurado en `.github/workflows/docker-build.yml`

### Configuración:
1. Ve a GitHub → Settings → Secrets
2. Añade:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

### Funcionamiento:
- ✅ Build automático en cada push a `main`
- ✅ Tests de la imagen
- ✅ Push automático a Docker Hub
- ✅ Tags versionados

## 📖 Documentación Disponible

### 📄 DOCKER-README.md
- ⚡ Guía rápida
- 🚀 Comandos esenciales
- 🌐 Despliegue básico
- 🐛 Troubleshooting común

### 📖 DOCKER-GUIDE.md
- 📋 Guía completa y detallada
- 🔨 Construcción avanzada
- 📦 Gestión de Docker Hub
- 📊 Análisis y optimización
- 🌐 Deployment en producción
- 🔍 Troubleshooting avanzado

### 🎯 DOCKER-BEST-PRACTICES.md
- 🔒 Seguridad
- ⚡ Optimización
- 🏷️ Versionado
- 📊 Monitoreo
- 💾 Backups
- 🔄 CI/CD strategies

## 🌐 Desplegar en Producción

### Servidor Linux
```bash
# Pull desde Docker Hub
docker pull tu-usuario/innoad-frontend:latest

# Ejecutar
docker run -d \
  -p 80:80 \
  --name innoad-frontend \
  --restart unless-stopped \
  tu-usuario/innoad-frontend:latest
```

### Con Docker Compose
```bash
# Subir docker-compose.yml al servidor
docker-compose up -d
```

### Con Kubernetes (avanzado)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: innoad-frontend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: frontend
        image: tu-usuario/innoad-frontend:latest
        ports:
        - containerPort: 80
```

## 🔧 Configuración de Entorno

### Variables disponibles (`.env.docker`)
```env
DOCKER_USERNAME=tu-usuario
API_GATEWAY_URL=https://api.innoad.com
NODE_ENV=production
FRONTEND_PORT=80
```

## 📊 Monitoreo

### Health Check
```powershell
# Verificar estado
docker inspect --format='{{.State.Health.Status}}' innoad-frontend

# Endpoint de salud
curl http://localhost/health
```

### Logs
```powershell
# Ver logs en tiempo real
docker logs -f innoad-frontend

# Últimas 100 líneas
docker logs --tail 100 innoad-frontend
```

### Métricas
```powershell
# Estadísticas en vivo
docker stats innoad-frontend
```

## 🎨 Estructura de Nginx

### Características:
- ✅ Compresión Gzip (nivel 6)
- ✅ Cache de assets (1 año)
- ✅ Angular routing (SPA support)
- ✅ Headers de seguridad
- ✅ Health check endpoint
- ✅ Optimización de performance

### Endpoints:
- `http://localhost/` → Aplicación Angular
- `http://localhost/health` → Health check

## 🔐 Seguridad

### Headers implementados:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
```

### Recomendaciones adicionales:
- Usar HTTPS en producción
- Escanear imagen: `docker scan innoad-frontend:latest`
- Actualizar dependencias regularmente
- Revisar logs de seguridad

## 💡 Tips y Trucos

### Reducir tiempo de build
```powershell
# Usar cache de BuildX
docker buildx create --use
docker buildx build --cache-from=type=registry,ref=usuario/innoad-frontend:cache .
```

### Comprimir imagen para transferencia
```powershell
docker save innoad-frontend:latest | gzip > innoad-frontend.tar.gz
```

### Ejecutar comando dentro del contenedor
```powershell
docker exec -it innoad-frontend sh
```

### Ver configuración de Nginx
```powershell
docker exec innoad-frontend cat /etc/nginx/nginx.conf
```

## 🆘 Soporte

### Problemas comunes:

#### Puerto 80 ocupado
```powershell
# Cambiar puerto
docker run -d -p 8080:80 --name innoad-frontend innoad-frontend:latest
```

#### Imagen muy grande
```powershell
# Verificar .dockerignore
# Analizar capas
docker history innoad-frontend:latest
```

#### Error al construir
```powershell
# Limpiar cache
docker build --no-cache -t innoad-frontend:latest .
```

## 📞 Contacto y Contribución

- 📧 Email: support@innoad.com
- 🐛 Issues: GitHub Issues
- 💬 Discusiones: GitHub Discussions
- 📝 Wiki: [GitHub Wiki](link)

## 📜 Licencia

Este proyecto está bajo la licencia [TU_LICENCIA].

---

## 🎉 ¡Listo para Producción!

Tu frontend InnoAd está completamente dockerizado y optimizado:
- ✅ Imagen ligera (40-60 MB)
- ✅ Multi-stage build
- ✅ Nginx optimizado
- ✅ CI/CD configurado
- ✅ Scripts de automatización
- ✅ Documentación completa
- ✅ Mejores prácticas implementadas

### Próximos pasos:
1. Construir y probar localmente
2. Subir a Docker Hub
3. Configurar CI/CD en GitHub
4. Desplegar en producción
5. Configurar monitoreo

**¡Éxito con tu despliegue!** 🚀
