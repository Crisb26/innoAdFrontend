# 🚀 Guía de Despliegue con Docker - InnoAd Frontend

**Versión:** 2.0.0  
**Última Actualización:** Febrero 4, 2026  
**Objetivo:** Permitir a los compañeros desplegar el frontend de InnoAd usando Docker de manera simple y estructurada.

---

## 📋 Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

- **Docker Desktop** (v20.10 o superior)
- **Docker Compose** (v2.0 o superior) - Viene incluido en Docker Desktop
- **Git** para clonar y actualizar el repositorio
- **Acceso a internet** para descargar dependencias

### Verificar instalación:

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version

# Verificar Git
git --version
```

---

## 🔄 Paso 1: Descargar el Código

Si aún no tienes el proyecto:

```bash
# Clonar el repositorio del frontend
git clone https://github.com/Crisb26/innoAdFrontend.git
cd innoAdFrontend/innoadFrontend

# O si ya lo tienes, actualizar cambios
git pull origin main
```

---

## ⚙️ Paso 2: Configurar Variables de Entorno (Opcional)

El frontend está configurado por defecto para apuntar a `localhost:8080`, pero puedes personalizar:

### Crear un archivo `.env.docker`

```env
# Si el backend está en otro servidor/puerto
BACKEND_URL=http://localhost:8080/api
WEBSOCKET_URL=ws://localhost:8080/ws

# Para producción con Docker
NODE_ENV=production
```

### Editar `src/environments/environment.compose.ts`

Este archivo está especialmente preparado para Docker:

```typescript
export const environment = {
  production: true,
  api: {
    gateway: 'http://localhost:8080/api',  // Ajusta según tu backend
    baseUrl: 'http://localhost:8080/api',
    wsUrl: 'ws://localhost:8080/ws'
  },
  // ... resto de configuración
};
```

---

## 🐳 Paso 3: Construcción de la Imagen Docker

Antes de ejecutar, debemos construir la imagen:

```bash
# Navegar a la carpeta del frontend
cd innoadFrontend

# Construir la imagen
docker-compose build

# O construir la imagen manualmente sin docker-compose
docker build -t innoad-frontend:latest .
```

**Esto puede tomar varios minutos** (5-15 min en la primera ejecución) porque:
1. Descarga Node 20-Alpine
2. Instala todas las dependencias npm
3. Compila la aplicación Angular para producción
4. Prepara la imagen Nginx

---

## ✅ Paso 4: Ejecutar el Frontend con Docker

### Opción A: Usar Docker Compose (RECOMENDADO)

```bash
# Iniciar el contenedor en modo foreground (puedes ver los logs)
docker-compose up

# O en modo background (sin ver logs)
docker-compose up -d

# Ver los logs si está en background
docker-compose logs -f frontend
```

### Opción B: Ejecutar contenedor manualmente

```bash
docker run -p 80:80 \
  -e NODE_ENV=production \
  innoad-frontend:latest
```

---

## 🛑 Paso 5: Detener el Frontend

Si deseas detener los contenedores:

```bash
# Detener sin eliminar (puedes volver a iniciar después)
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Eliminar también volúmenes (datos persistidos)
docker-compose down -v
```

---

## ✔️ Verificar que el Frontend está funcionando

Una vez iniciado, verifica que está disponible:

### 1. Acceder en tu navegador:

```
http://localhost
```

O si mapeaste a otro puerto (ejemplo puerto 3000):

```
http://localhost:3000
```

Deberías ver la página de InnoAd cargada.

### 2. Ver logs del contenedor:

```bash
docker-compose logs frontend

# O en tiempo real
docker-compose logs -f frontend
```

### 3. Listar contenedores activos:

```bash
docker ps

# Deberías ver algo como:
# CONTAINER ID  IMAGE                PORTS
# abc123...     innoad-frontend:latest  0.0.0.0:80->80/tcp
```

---

## 🔗 Integración con Backend

**Para que el Frontend funcione correctamente**, el Backend debe estar accesible.

### Si el Backend también corre en Docker:

Ambos estarán en la red `innoad-network` automáticamente:

```yaml
# docker-compose.yml (se conectan automáticamente)
services:
  frontend:
    networks:
      - innoad-network
  backend:
    networks:
      - innoad-network

networks:
  innoad-network:
```

### Si el Backend corre localmente (sin Docker):

Configura el Frontend para apuntar al Backend local:

```typescript
// En src/environments/environment.ts
api: {
  gateway: 'http://localhost:8080/api',
  baseUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws'
}
```

---

## 🐛 Solucionar Problemas

### Error: "Port 80 is already in use"

```bash
# Ver qué proceso usa el puerto 80
netstat -ano | findstr :80  # Windows
lsof -i :80  # Mac/Linux

# Solución: Cambiar puerto en docker-compose.yml
# ports:
#   - "3000:80"  # Puerto local 3000 -> Puerto contenedor 80
```

### Error: "Docker daemon is not running"

```bash
# Asegúrate de que Docker Desktop está iniciado
# En Windows/Mac: Abre Docker Desktop desde inicio
# En Linux: sudo systemctl start docker
```

### La página carga pero no conecta al Backend

Revisa que:
1. El Backend esté corriendo y accesible
2. Las URLs de API en `environment.ts` sean correctas
3. No haya problemas de CORS en el Backend
4. Los contenedores estén en la misma red (si usan Docker)

```bash
# Depuración: entra al contenedor y prueba conectividad
docker-compose exec frontend sh
wget http://backend:8080/actuator/health  # Si están en red Docker
exit
```

### El contenedor se detiene inmediatamente

Revisa los logs:
```bash
docker-compose logs frontend

# Busca mensajes de error relacionados con:
# - Sintaxis de Nginx
# - Permisos de archivos
# - Problemas de construcción Angular
```

---

## 📊 Monitoreo del Contenedor

### Ver uso de recursos:

```bash
docker stats

# O específicamente el frontend
docker stats innoad-frontend
```

### Ejecutar comandos dentro del contenedor:

```bash
docker-compose exec frontend sh

# Dentro del contenedor puedes hacer:
ls -la /usr/share/nginx/html
nginx -t  # Verificar que Nginx está bien configurado
```

---

## 🔄 Actualizar el Código

Si hay cambios nuevos en el repositorio:

```bash
# 1. Descargar cambios
git pull origin main

# 2. Reconstruir la imagen (IMPORTANTE!)
docker-compose build

# 3. Reiniciar los contenedores
docker-compose down
docker-compose up -d
```

---

## 📦 Arquitectura del Contenedor Frontend

```
┌─────────────────────────────────────┐
│      Docker Container (Frontend)    │
│  ┌──────────────────────────────┐   │
│  │   Nginx (Alpine Linux)       │   │
│  │  - Sirve archivos estáticos  │   │
│  │  - Puerto 80                 │   │
│  └──────────────────────────────┘   │
│           ↓                          │
│  ┌──────────────────────────────┐   │
│  │   Archivos compilados        │   │
│  │  (HTML, CSS, JS - bundle)    │   │
│  │  /usr/share/nginx/html       │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Ventajas:**
- Nginx es ultra-ligero (~5MB)
- Sirve contenido estático rápidamente
- Perfecto para producción
- Consume pocos recursos

---

## 🔐 Configuración de Seguridad (Nginx)

El archivo `nginx.conf` está configurado con:

- ✅ Compresión Gzip para archivos
- ✅ Headers de seguridad
- ✅ Caché de archivos estáticos
- ✅ Soporte para rutas Angular (SPA)
- ✅ Redirecciones HTTPS preparadas

---

## 📝 Troubleshooting Adicional

### El contenedor consume demasiada memoria

```bash
# Limitar recursos en docker-compose.yml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Necesito ver los archivos servidos por Nginx

```bash
docker-compose exec frontend ls /usr/share/nginx/html
docker-compose exec frontend cat /etc/nginx/nginx.conf
```

### Cambiar el puerto de escucha

En `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Escucha en 3000, redirige a 80 del contenedor
```

Luego accede: `http://localhost:3000`

---

## 🚀 Resumen Rápido

Si solo quieres los comandos principales:

```bash
# 1. Primero una sola vez: Construir
docker-compose build

# 2. Ejecutar (cada que quieras iniciar)
docker-compose up -d

# 3. Acceder en navegador
# http://localhost

# 4. Ver logs
docker-compose logs -f

# 5. Detener
docker-compose down
```

---

## 🔀 Diferencia: Desarrollo Local vs Docker

### Desarrollo Local (Sin Docker):

```bash
# Terminal 1: Instalar dependencias
npm install

# Terminal 2: Compilar y servir
npm start
# Accede a: http://localhost:4200

# Cambios en código se reflejan al instante (HMR)
```

### Con Docker:

```bash
# 1. Construir
docker-compose build

# 2. Ejecutar
docker-compose up -d

# Accede a: http://localhost
# Cambios requieren rebuild
```

---

## 📊 Comparación: Tu Entorno vs Entorno con Docker

### Cristóbal (Sin Docker - Desarrollo Local):

```
Tu PC
  └─ Node 20 instalado localmente
  └─ npm ejecutándose
  └─ Angular CLI compilando
  └─ Dev server en puerto 4200
  └─ IDE (VS Code / WebStorm)
```

**Ventaja:** Desarrollo más rápido con HMR  
**Desventaja:** Depende del SO, requiere Node/npm

### Compañeros (Con Docker - Contenedorizado):

```
Docker Desktop
  └─ Contenedor Frontend
      └─ Node 20-Alpine dentro del contenedor
      └─ Build pre-compilado
      └─ Nginx sirviendo en puerto 80
      └─ TODO AISLADO - no afecta tu sistema
```

**Ventaja:** Mismo entorno en cualquier PC, igual a producción  
**Desventaja:** Sin HMR, más lento desarrollar

---

## 📞 Preguntas Frecuentes

**P: ¿Debo tener Node.js instalado localmente si uso Docker?**  
R: No, todo está dentro del contenedor.

**P: ¿Puedo modificar código y ver cambios al instante?**  
R: No como en desarrollo local. Después de cambios, debes hacer `docker-compose build`.

**P: ¿Qué archivo sirve Nginx como página principal?**  
R: `/usr/share/nginx/html/index.html` (la compilación de Angular)

**P: ¿Puedo tener múltiples versiones del frontend corriendo?**  
R: Sí, en puertos diferentes. Edita `docker-compose.yml`.

**P: ¿Cómo depurar desde Docker?**  
R: Los logs de Nginx estarán disponibles con `docker-compose logs -f`. Los errores de JavaScript aparecen en la consola del navegador.

---

**¡Listo! Tu frontend está dockerizado y listo para compartir.** 🎉

