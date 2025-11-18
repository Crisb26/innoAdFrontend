# 🎯 Mejores Prácticas - Docker para InnoAd Frontend

## 📋 Índice
1. [Seguridad](#seguridad)
2. [Optimización](#optimización)
3. [Versionado](#versionado)
4. [Monitoreo](#monitoreo)
5. [Backups](#backups)
6. [CI/CD](#cicd)

---

## 🔒 Seguridad

### 1. Tokens y Credenciales

#### ❌ NUNCA hacer:
```powershell
# NO incluir credenciales en el código
docker login -u usuario -p password123
```

#### ✅ Hacer:
```powershell
# Usar variables de entorno
$env:DOCKER_PASSWORD | docker login -u $env:DOCKER_USERNAME --password-stdin

# O login interactivo
docker login
```

### 2. Escaneo de Vulnerabilidades

```powershell
# Escanear imagen antes de subir
docker scan innoad-frontend:latest

# Usar Snyk (opcional)
snyk container test innoad-frontend:latest
```

### 3. Usuarios No-Root

El Dockerfile ya usa Nginx que ejecuta como usuario `nginx` (no root).

### 4. Secrets en GitHub Actions

Configurar en GitHub:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD` (o token de acceso)

---

## ⚡ Optimización

### 1. Tamaño de Imagen

#### Técnicas Implementadas:
- ✅ Multi-stage build
- ✅ Alpine Linux
- ✅ .dockerignore
- ✅ npm ci en lugar de npm install
- ✅ Limpiar cache de npm

#### Verificar Tamaño:
```powershell
docker images innoad-frontend --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

#### Meta: < 60 MB

### 2. Build Cache

```powershell
# Usar cache de Docker BuildX
docker buildx build \
  --cache-from=type=registry,ref=usuario/innoad-frontend:buildcache \
  --cache-to=type=registry,ref=usuario/innoad-frontend:buildcache \
  -t innoad-frontend:latest .
```

### 3. Layers

```powershell
# Analizar capas
docker history innoad-frontend:latest --human --no-trunc
```

---

## 🏷️ Versionado

### Estrategia de Tags

#### ✅ Recomendado:
```powershell
# Tag semántico
docker tag innoad-frontend:latest usuario/innoad-frontend:2.0.0

# Tag de versión minor
docker tag innoad-frontend:latest usuario/innoad-frontend:2.0

# Tag de versión major
docker tag innoad-frontend:latest usuario/innoad-frontend:2

# Tag latest (solo para última versión estable)
docker tag innoad-frontend:latest usuario/innoad-frontend:latest

# Tag de ambiente
docker tag innoad-frontend:latest usuario/innoad-frontend:production
```

#### ❌ Evitar:
```powershell
# No usar solo 'latest' en producción
docker pull usuario/innoad-frontend:latest  # ¿Qué versión es?
```

### Ejemplo de Flujo:

```powershell
# Desarrollo
usuario/innoad-frontend:develop
usuario/innoad-frontend:dev-abc1234

# Staging
usuario/innoad-frontend:staging
usuario/innoad-frontend:rc-2.0.0

# Producción
usuario/innoad-frontend:2.0.0
usuario/innoad-frontend:2.0
usuario/innoad-frontend:2
usuario/innoad-frontend:latest
usuario/innoad-frontend:stable
```

---

## 📊 Monitoreo

### 1. Health Checks

Ya implementado en Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

Verificar estado:
```powershell
docker inspect --format='{{.State.Health.Status}}' innoad-frontend
```

### 2. Logs

#### Centralizados:
```powershell
# Ver logs en tiempo real
docker logs -f innoad-frontend

# Últimas 100 líneas
docker logs --tail 100 innoad-frontend

# Con timestamps
docker logs -t innoad-frontend
```

#### Herramientas Recomendadas:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Grafana Loki
- Datadog
- New Relic

### 3. Métricas

```powershell
# Estadísticas en tiempo real
docker stats innoad-frontend

# Uso de recursos
docker inspect innoad-frontend --format='{{.HostConfig.Memory}}'
```

### 4. Alertas

Configurar alertas para:
- ❗ Contenedor detenido
- ⚠️ Alto uso de CPU/Memoria
- 🔴 Health check fallido
- 📉 Alto tiempo de respuesta

---

## 💾 Backups

### 1. Exportar Imagen

```powershell
# Exportar imagen
docker save innoad-frontend:latest | gzip > innoad-frontend-backup.tar.gz

# Importar imagen
gunzip -c innoad-frontend-backup.tar.gz | docker load
```

### 2. Volúmenes (si aplica)

```powershell
# Backup de volumen
docker run --rm \
  -v innoad-data:/data \
  -v ${PWD}:/backup \
  alpine tar czf /backup/data-backup.tar.gz /data

# Restaurar volumen
docker run --rm \
  -v innoad-data:/data \
  -v ${PWD}:/backup \
  alpine sh -c "cd /data && tar xzf /backup/data-backup.tar.gz --strip 1"
```

---

## 🔄 CI/CD

### GitHub Actions (Ya configurado)

Archivo: `.github/workflows/docker-build.yml`

### GitLab CI (.gitlab-ci.yml)

```yaml
docker-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
  script:
    - docker build -t $DOCKER_USERNAME/innoad-frontend:$CI_COMMIT_SHORT_SHA .
    - docker push $DOCKER_USERNAME/innoad-frontend:$CI_COMMIT_SHORT_SHA
  only:
    - main
```

### Jenkins (Jenkinsfile)

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t innoad-frontend:latest .'
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push innoad-frontend:latest'
                }
            }
        }
    }
}
```

---

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment

```powershell
# Versión actual (blue)
docker run -d -p 80:80 --name innoad-blue innoad-frontend:2.0.0

# Nueva versión (green)
docker run -d -p 8080:80 --name innoad-green innoad-frontend:2.1.0

# Probar green en puerto 8080
# Si todo OK, cambiar tráfico

# Detener blue
docker stop innoad-blue
docker rm innoad-blue

# Mover green a puerto 80
docker stop innoad-green
docker rm innoad-green
docker run -d -p 80:80 --name innoad-blue innoad-frontend:2.1.0
```

### 2. Rolling Update (con Docker Compose)

```yaml
services:
  frontend:
    image: innoad-frontend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      rollback_config:
        parallelism: 1
        delay: 5s
```

### 3. Canary Deployment

```nginx
# Nginx load balancer
upstream frontend {
    server frontend-v1:80 weight=90;
    server frontend-v2:80 weight=10;
}
```

---

## 📈 Performance Tips

### 1. Compresión

Ya configurado en `nginx.conf`:
- ✅ Gzip habilitado
- ✅ Tipos de contenido optimizados
- ✅ Nivel de compresión 6

### 2. Cache

```nginx
# Cache de assets estáticos (ya configurado)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN

Considerar usar CDN para assets:
- Cloudflare
- AWS CloudFront
- Azure CDN
- Google Cloud CDN

---

## 🔍 Troubleshooting

### Problema: Build lento

**Solución**: Usar cache de BuildX
```powershell
docker buildx create --use
docker buildx build --cache-from=type=registry,ref=usuario/innoad-frontend:cache .
```

### Problema: Imagen muy grande

**Verificación**:
```powershell
docker history innoad-frontend:latest
```

**Solución**: Verificar `.dockerignore`

### Problema: Contenedor consume mucha memoria

**Límites**:
```powershell
docker run -d \
  -p 80:80 \
  --memory="256m" \
  --memory-swap="512m" \
  innoad-frontend:latest
```

---

## ✅ Checklist Pre-Deploy

- [ ] Build exitoso localmente
- [ ] Tests pasando
- [ ] Escaneo de seguridad realizado
- [ ] Tamaño de imagen < 100MB
- [ ] Health check funcionando
- [ ] Variables de entorno configuradas
- [ ] Backup de versión anterior
- [ ] Plan de rollback definido
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

## 📚 Recursos

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Optimization](https://www.nginx.com/blog/tuning-nginx/)
- [Angular Deployment](https://angular.io/guide/deployment)
- [12 Factor App](https://12factor.net/)

---

## 🤝 Contribuir

Si encuentras formas de mejorar estas prácticas, ¡contribuye al proyecto!
