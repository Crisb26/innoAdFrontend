# 🐳 Guía de Docker para InnoAd Frontend

## 📋 Contenido
- [Construcción de Imágenes](#construcción-de-imágenes)
- [Ejecución Local](#ejecución-local)
- [Docker Hub](#docker-hub)
- [Optimización](#optimización)
- [Troubleshooting](#troubleshooting)

## 🔨 Construcción de Imágenes

### Construcción básica
```powershell
# Construcción estándar (producción)
docker build -t innoad-frontend:latest .

# Construcción para compose
docker build --build-arg BUILD_CONFIGURATION=compose -t innoad-frontend:compose .

# Construcción con tag específico
docker build -t innoad-frontend:2.0.0 .
```

### Verificar la imagen construida
```powershell
# Ver tamaño y detalles
docker images innoad-frontend

# Inspeccionar la imagen
docker inspect innoad-frontend:latest

# Ver historial de capas
docker history innoad-frontend:latest
```

## 🚀 Ejecución Local

### Usando Docker directamente
```powershell
# Ejecutar contenedor
docker run -d -p 80:80 --name innoad-frontend innoad-frontend:latest

# Ver logs
docker logs -f innoad-frontend

# Detener contenedor
docker stop innoad-frontend

# Eliminar contenedor
docker rm innoad-frontend
```

### Usando Docker Compose (Recomendado)
```powershell
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Acceder a la aplicación
Una vez ejecutado, accede a: `http://localhost`

## 📦 Docker Hub - Subir y Gestionar Imágenes

### 1. Iniciar sesión en Docker Hub
```powershell
# Login a Docker Hub
docker login

# O con credenciales directas
docker login -u tu-usuario
```

### 2. Etiquetar la imagen
```powershell
# Formato: docker tag imagen-local usuario/repositorio:tag
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:latest
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:2.0.0
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:stable
```

### 3. Subir imagen a Docker Hub
```powershell
# Subir versión latest
docker push tu-usuario/innoad-frontend:latest

# Subir versión específica
docker push tu-usuario/innoad-frontend:2.0.0

# Subir todas las versiones etiquetadas
docker push tu-usuario/innoad-frontend --all-tags
```

### 4. Descargar imagen desde Docker Hub
```powershell
# Descargar imagen
docker pull tu-usuario/innoad-frontend:latest

# Ejecutar desde Docker Hub
docker run -d -p 80:80 tu-usuario/innoad-frontend:latest
```

## 📊 Optimización de Tamaño

### Técnicas implementadas en el Dockerfile:
1. **Multi-stage build**: Separa construcción de runtime
2. **Alpine Linux**: Imagen base ultraligera (~5MB vs ~900MB)
3. **npm ci**: Instalación optimizada de dependencias
4. **Cache cleaning**: Limpieza de cache de npm
5. **.dockerignore**: Excluye archivos innecesarios

### Reducir aún más el tamaño
```powershell
# Ver capas de la imagen
docker history innoad-frontend:latest

# Analizar tamaño
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep innoad

# Limpiar imágenes no utilizadas
docker image prune -a

# Comprimir imagen para transferencia
docker save innoad-frontend:latest | gzip > innoad-frontend.tar.gz
```

### Comparación de tamaños esperados:
- **Sin optimización**: ~1.2 GB
- **Con multi-stage**: ~150 MB
- **Con Alpine + optimización**: ~40-60 MB ✅

## 🔧 Comandos Útiles

### Gestión de contenedores
```powershell
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores
docker ps -a

# Estadísticas en tiempo real
docker stats innoad-frontend

# Ejecutar comando dentro del contenedor
docker exec -it innoad-frontend sh

# Ver configuración de Nginx
docker exec innoad-frontend cat /etc/nginx/nginx.conf
```

### Gestión de imágenes
```powershell
# Listar todas las imágenes
docker images

# Eliminar imagen específica
docker rmi innoad-frontend:latest

# Eliminar imágenes huérfanas
docker image prune

# Eliminar todas las imágenes no utilizadas
docker image prune -a
```

### Limpieza del sistema
```powershell
# Limpiar todo lo no utilizado
docker system prune -a

# Limpiar solo imágenes
docker image prune -a

# Ver espacio utilizado
docker system df
```

## 🌐 Deployment en Producción

### 1. Servidor Linux (Ubuntu/Debian)
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Ejecutar aplicación
docker run -d \
  --name innoad-frontend \
  --restart unless-stopped \
  -p 80:80 \
  tu-usuario/innoad-frontend:latest
```

### 2. Con Docker Compose en servidor
```bash
# Crear archivo docker-compose.yml en el servidor
# Luego ejecutar:
docker-compose up -d
```

### 3. Con Nginx como proxy reverso
```nginx
server {
    listen 80;
    server_name innoad.tudominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Con HTTPS (usando Let's Encrypt)
```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d innoad.tudominio.com
```

## 🔍 Troubleshooting

### Problema: Imagen muy grande
**Solución**: Verifica que estés usando multi-stage build y Alpine
```powershell
docker history innoad-frontend:latest --no-trunc
```

### Problema: Error al construir
**Solución**: Limpia cache y reconstruye
```powershell
docker build --no-cache -t innoad-frontend:latest .
```

### Problema: Contenedor se detiene
**Solución**: Ver logs para identificar el error
```powershell
docker logs innoad-frontend
docker inspect innoad-frontend
```

### Problema: No se puede acceder a la aplicación
**Solución**: Verifica que el puerto esté expuesto
```powershell
docker port innoad-frontend
netstat -ano | findstr :80
```

## 📝 Variables de Entorno (Opcional)

Si necesitas configuración dinámica, puedes usar variables de entorno:

```powershell
docker run -d \
  -p 80:80 \
  -e API_URL=https://api.tudominio.com \
  innoad-frontend:latest
```

## 🎯 Best Practices

1. **Usa tags específicos**: No solo `latest`
2. **Implementa health checks**: Ya incluidos en el Dockerfile
3. **Logs centralizados**: Considera usar un sistema de logging
4. **Monitoreo**: Implementa Prometheus/Grafana para métricas
5. **Seguridad**: Escanea imágenes con `docker scan innoad-frontend:latest`
6. **CI/CD**: Automatiza el build y push con GitHub Actions

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Angular Deployment Guide](https://angular.io/guide/deployment)

---

## 🚀 Quick Start

```powershell
# 1. Construir
docker build -t innoad-frontend:latest .

# 2. Ejecutar
docker run -d -p 80:80 --name innoad-frontend innoad-frontend:latest

# 3. Verificar
docker logs innoad-frontend
# Abrir http://localhost en el navegador

# 4. Subir a Docker Hub
docker login
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:latest
docker push tu-usuario/innoad-frontend:latest
```

¡Listo! 🎉
