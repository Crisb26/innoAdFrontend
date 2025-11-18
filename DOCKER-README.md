# 🚀 Guía Rápida de Despliegue - InnoAd Frontend

## ⚡ Inicio Rápido (3 Pasos)

### 1️⃣ Construir la imagen
```powershell
docker build -t innoad-frontend:latest .
```

### 2️⃣ Ejecutar el contenedor
```powershell
docker run -d -p 80:80 --name innoad-frontend innoad-frontend:latest
```

### 3️⃣ Verificar
Abre tu navegador en: **http://localhost**

---

## 📦 Subir a Docker Hub

### Método 1: Script Automatizado (Recomendado)
```powershell
# En Windows
.\docker-deploy.ps1 -Version "2.0.0" -DockerUsername "tu-usuario"

# En Linux/Mac
chmod +x docker-deploy.sh
./docker-deploy.sh 2.0.0
```

### Método 2: Manual
```powershell
# 1. Login
docker login

# 2. Etiquetar
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:latest
docker tag innoad-frontend:latest tu-usuario/innoad-frontend:2.0.0

# 3. Subir
docker push tu-usuario/innoad-frontend:latest
docker push tu-usuario/innoad-frontend:2.0.0
```

---

## 🎯 Comandos Útiles

### Gestión Básica
```powershell
# Ver logs
docker logs -f innoad-frontend

# Detener
docker stop innoad-frontend

# Reiniciar
docker restart innoad-frontend

# Eliminar
docker rm -f innoad-frontend
```

### Usando NPM Scripts
```powershell
# Construir
npm run docker:build

# Ejecutar
npm run docker:run

# Ver logs
npm run docker:logs

# Detener
npm run docker:stop
```

### Usando Docker Compose
```powershell
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir
docker-compose up -d --build
```

---

## 📊 Optimización de Tamaño

La imagen está optimizada con:
- ✅ Multi-stage build
- ✅ Alpine Linux (imagen base ligera)
- ✅ Nginx optimizado
- ✅ Archivos innecesarios excluidos

**Tamaño aproximado:** 40-60 MB

### Ver tamaño
```powershell
docker images innoad-frontend
```

### Limpiar espacio
```powershell
# Limpiar imágenes no usadas
docker image prune -a

# Limpiar todo el sistema
docker system prune -a
```

---

## 🌐 Desplegar en Servidor

### Opción 1: Pull desde Docker Hub
```bash
# En tu servidor Linux
docker pull tu-usuario/innoad-frontend:latest
docker run -d -p 80:80 --restart unless-stopped tu-usuario/innoad-frontend:latest
```

### Opción 2: Con Docker Compose
```bash
# Subir docker-compose.yml a tu servidor
docker-compose up -d
```

### Opción 3: Con HTTPS (Nginx Proxy)
```nginx
server {
    listen 443 ssl;
    server_name tudominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
    }
}
```

---

## 🔧 Variables de Entorno (Opcional)

Si necesitas configuración dinámica:

```powershell
docker run -d \
  -p 80:80 \
  -e API_URL=https://api.tudominio.com \
  -e NODE_ENV=production \
  innoad-frontend:latest
```

---

## 📝 Configurar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Añade estos secrets:
   - `DOCKER_USERNAME`: Tu usuario de Docker Hub
   - `DOCKER_PASSWORD`: Tu contraseña o token de Docker Hub

Ahora cada push a `main` construirá y subirá la imagen automáticamente.

---

## 🐛 Troubleshooting

### Error: Puerto 80 en uso
```powershell
# Windows
netstat -ano | findstr :80
taskkill /F /PID [PID]

# Linux/Mac
sudo lsof -i :80
sudo kill [PID]
```

### Error: Imagen muy grande
Verifica que `.dockerignore` existe y contiene:
```
node_modules/
dist/
.angular/
```

### Error al construir
```powershell
# Limpiar cache y reconstruir
docker build --no-cache -t innoad-frontend:latest .
```

### Contenedor no inicia
```powershell
# Ver logs detallados
docker logs innoad-frontend

# Inspeccionar contenedor
docker inspect innoad-frontend
```

---

## 📚 Documentación Completa

Para más detalles, consulta: [DOCKER-GUIDE.md](./DOCKER-GUIDE.md)

---

## ✅ Checklist de Despliegue

- [ ] Construir imagen localmente
- [ ] Probar localmente (http://localhost)
- [ ] Login a Docker Hub
- [ ] Etiquetar imagen
- [ ] Subir a Docker Hub
- [ ] Probar pull desde Docker Hub
- [ ] Desplegar en servidor de producción
- [ ] Configurar HTTPS
- [ ] Configurar monitoreo

---

## 💡 Consejos

1. **Usa versiones específicas** en producción, no solo `latest`
2. **Implementa health checks** (ya incluidos)
3. **Configura backups** de tus datos
4. **Monitorea logs** con herramientas como ELK Stack
5. **Actualiza regularmente** las dependencias de seguridad

---

¿Necesitas ayuda? Revisa [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) para documentación detallada.
