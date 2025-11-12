# Preparación para Migración a Microservicios

## 📋 Resumen

El frontend de InnoAd ya está preparado para una futura migración a arquitectura de microservicios. Los cambios implementados permiten una transición suave sin necesidad de reescribir el código.

---

## 🏗️ Arquitectura Actual vs Futura

### Estado Actual (Monolito Modular)
```
Frontend Angular
    ↓
API Gateway (Nginx)
    ↓
Backend Monolito (Puerto 8080)
```

### Migración Futura (Microservicios)
```
Frontend Angular
    ↓
API Gateway (Nginx/Kong/AWS API Gateway)
    ↓
├── Auth Service (Puerto 3001)
├── Users Service (Puerto 3002)
├── Campaigns Service (Puerto 3003)
├── Contents Service (Puerto 3004)
├── Screens Service (Puerto 3005)
├── Analytics Service (Puerto 3006)
└── Notifications Service (Porto 3007)
```

---

## ✅ Cambios Implementados

### 1. **Configuración de Environments Preparada**

#### `environment.ts` (Desarrollo)
```typescript
api: {
  gateway: '/api/v1',  // Gateway principal
  services: {
    auth: '/api/v1/auth',
    users: '/api/v1/users',
    campaigns: '/api/v1/campaigns',
    contents: '/api/v1/contents',
    screens: '/api/v1/screens',
    analytics: '/api/v1/analytics',
    notifications: '/api/v1/notifications',
    system: '/api/v1/system'
  }
}
```

#### `environment.prod.ts` (Producción)
```typescript
api: {
  gateway: 'https://api.innoad.com/api/v1',
  services: {
    auth: 'https://api.innoad.com/api/v1/auth',  // Cambiar a: https://auth.innoad.com
    users: 'https://api.innoad.com/api/v1/users', // Cambiar a: https://users.innoad.com
    // ... etc
  }
}
```

### 2. **Servicio API Gateway Centralizado**

Archivo: `src/app/core/servicios/api-gateway.servicio.ts`

**Funciones principales:**
- `getServiceUrl(serviceName)`: Obtiene URL de cualquier microservicio
- `buildUrl(serviceName, endpoint)`: Construye URLs completas
- `getAuthUrl()`, `getUsersUrl()`, etc.: Helpers específicos por dominio

**Ejemplo de uso:**
```typescript
// En cualquier servicio
constructor(private apiGateway: ApiGatewayService) {}

// Obtener URL del servicio de autenticación
const authUrl = this.apiGateway.getAuthUrl('/login');
// Resultado: https://api.innoad.com/api/v1/auth/login
```

### 3. **Servicios Actualizados**

#### ✅ `http-base.servicio.ts`
- Usa `ApiGatewayService` para resolver URLs
- Manejo centralizado de errores y reintentos

#### ✅ `autenticacion.servicio.ts`
- Usa `apiGateway.getAuthUrl()` para endpoints de autenticación
- Listo para apuntar a microservicio independiente

### 4. **Estructura Modular Existente**

Ya tienes módulos bien separados:
```
src/app/modulos/
├── autenticacion/      → Futuro: Auth Service
├── campanas/           → Futuro: Campaigns Service
├── contenidos/         → Futuro: Contents Service
├── pantallas/          → Futuro: Screens Service
├── admin/              → Futuro: Users/System Service
└── asistente-ia/       → Futuro: AI Service
```

---

## 🔧 Pasos para Migrar (Cuando el Backend Esté Listo)

### Paso 1: Backend Despliega Microservicios

El equipo backend despliega servicios en puertos/dominios separados:
```
Auth Service:     http://localhost:3001
Users Service:    http://localhost:3002
Campaigns Service: http://localhost:3003
etc...
```

### Paso 2: Actualizar Environment (Solo URLs)

**Desarrollo (`environment.ts`):**
```typescript
api: {
  gateway: '/api/v1',  // API Gateway sigue siendo el punto de entrada
  services: {
    auth: 'http://localhost:3001',        // ← Cambio
    users: 'http://localhost:3002',       // ← Cambio
    campaigns: 'http://localhost:3003',   // ← Cambio
    // ...
  }
}
```

**Producción (`environment.prod.ts`):**
```typescript
api: {
  gateway: 'https://api.innoad.com',
  services: {
    auth: 'https://auth.innoad.com',      // ← Cambio
    users: 'https://users.innoad.com',    // ← Cambio
    campaigns: 'https://campaigns.innoad.com', // ← Cambio
    // ...
  }
}
```

### Paso 3: Actualizar Proxy (Desarrollo)

**`proxy.conf.json`:**
```json
{
  "/api/v1/auth": {
    "target": "http://localhost:3001",
    "pathRewrite": { "^/api/v1/auth": "" }
  },
  "/api/v1/users": {
    "target": "http://localhost:3002",
    "pathRewrite": { "^/api/v1/users": "" }
  },
  "/api/v1/campaigns": {
    "target": "http://localhost:3003",
    "pathRewrite": { "^/api/v1/campaigns": "" }
  }
}
```

### Paso 4: Actualizar Nginx (Docker/Producción)

**`nginx.conf`:**
```nginx
# Auth Service
location /api/v1/auth {
    proxy_pass http://auth-service:3001;
}

# Users Service
location /api/v1/users {
    proxy_pass http://users-service:3002;
}

# Campaigns Service
location /api/v1/campaigns {
    proxy_pass http://campaigns-service:3003;
}
```

### Paso 5: Testing

```bash
# Verificar que todos los servicios responden
npm run test:e2e

# Verificar configuración en consola del navegador
apiGatewayService.logConfiguration();
```

---

## 🚀 Ventajas de Esta Arquitectura

### ✅ **Preparado para Microservicios**
- Cambio de URLs sin tocar código de negocio
- Servicios desacoplados desde el diseño

### ✅ **Fácil Testing**
```typescript
// Mockear un microservicio específico
spyOn(apiGateway, 'getAuthUrl').and.returnValue('http://mock-auth-service');
```

### ✅ **Rollback Seguro**
Si un microservicio falla, puedes volver al monolito cambiando solo las URLs:
```typescript
services: {
  auth: '/api/v1/auth',  // ← Volver a monolito
}
```

### ✅ **Migración Gradual**
Puedes migrar servicio por servicio:
```typescript
services: {
  auth: 'https://auth.innoad.com',     // ← Ya migrado
  users: '/api/v1/users',              // ← Sigue en monolito
  campaigns: '/api/v1/campaigns',      // ← Sigue en monolito
}
```

---

## 📊 Compatibilidad con Docker Compose

### Configuración Actual (Funcional)

**`nginx.conf` en el contenedor frontend:**
```nginx
location /api {
    proxy_pass http://backend:8080;  # ← Nombre del servicio Docker
}
```

### Configuración Futura (Microservicios)

**`docker-compose.yml`:**
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "4200:80"
    depends_on:
      - auth-service
      - users-service
      - campaigns-service

  auth-service:
    build: ./backend/auth-service
    ports:
      - "3001:3001"

  users-service:
    build: ./backend/users-service
    ports:
      - "3002:3002"

  campaigns-service:
    build: ./backend/campaigns-service
    ports:
      - "3003:3003"
```

**`nginx.conf` actualizado:**
```nginx
location /api/v1/auth {
    proxy_pass http://auth-service:3001;
}

location /api/v1/users {
    proxy_pass http://users-service:3002;
}

location /api/v1/campaigns {
    proxy_pass http://campaigns-service:3003;
}
```

---

## 🔍 Verificación de Compatibilidad

### ¿El cambio de Docker afecta al frontend?

**Respuesta: NO directamente, pero verifica:**

1. **URLs Relativas**: ✅ Funcionan (Nginx hace proxy)
   ```typescript
   '/api/v1/auth/login' → Nginx → Backend
   ```

2. **WebSockets**: ✅ Verificar configuración
   ```nginx
   location /ws {
       proxy_pass http://backend:8080;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **CORS**: ✅ Manejado por Nginx (mismo origen)

4. **Variables de Entorno**: Revisar si Docker Compose pasa variables correctas

---

## 🎯 Próximos Pasos Recomendados

### Corto Plazo (Ya hecho ✅)
- [x] Configurar `api.services` en environments
- [x] Crear `ApiGatewayService`
- [x] Actualizar servicios principales (auth, http-base)
- [x] Documentar arquitectura

### Mediano Plazo (Cuando backend migre)
- [ ] Actualizar `proxy.conf.json` para desarrollo
- [ ] Actualizar `nginx.conf` para Docker
- [ ] Configurar variables de entorno por servicio
- [ ] Testing E2E con microservicios

### Largo Plazo (Optimizaciones futuras)
- [ ] Implementar Circuit Breaker pattern
- [ ] Agregar Service Discovery (Consul/Eureka)
- [ ] Implementar API Gateway dedicado (Kong/Traefik)
- [ ] Monitoring distribuido (Zipkin/Jaeger)

---

## 🛠️ Comandos Útiles

### Verificar Configuración Actual
```typescript
// En la consola del navegador
inject(ApiGatewayService).logConfiguration();
```

### Desarrollo Local con Microservicios
```bash
# Terminal 1: Auth Service
cd backend/auth-service && npm start

# Terminal 2: Users Service
cd backend/users-service && npm start

# Terminal 3: Frontend
cd frontend && npm start
```

### Docker Compose (Monolito Actual)
```bash
docker-compose up --build
```

### Docker Compose (Futuro con Microservicios)
```bash
docker-compose -f docker-compose.microservices.yml up --build
```

---

## 📞 Contacto y Soporte

**¿Dudas sobre la migración?**
- Revisa este documento
- Consulta `api-gateway.servicio.ts`
- Usa `apiGateway.logConfiguration()` para debugging

**Mantenido por:** Equipo InnoAd Frontend
**Última actualización:** 12 de noviembre de 2025
