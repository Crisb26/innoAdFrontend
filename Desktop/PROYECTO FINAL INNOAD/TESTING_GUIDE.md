# 🧪 GUÍA DE TESTING LOCAL - InnoAd Fase 4

## 📋 Pre-requisitos

```bash
# Sistema
- Java 21 (JDK)
- Node.js 18+ (npm)
- PostgreSQL 16
- Git
- Angular CLI 18 (npm i -g @angular/cli)
```

## 🏗️ Setup Local

### 1. Base de Datos

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE innoad;
CREATE USER innoad_user WITH PASSWORD 'innoad_pass';
GRANT ALL PRIVILEGES ON DATABASE innoad TO innoad_user;

# Restaurar schema (desde DATABASE-SCRIPT.sql)
psql -U innoad_user -d innoad < DATABASE-SCRIPT.sql

# Verificar tablas
psql -U innoad_user -d innoad -c "\dt"
```

### 2. Backend Setup

```bash
cd innoadBackend

# Limpiar build anterior
mvn clean

# Compilar
mvn compile

# Descargar dependencias
mvn dependency:resolve

# Ejecutar
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Puerto**: `http://localhost:8080`
**Swagger UI**: `http://localhost:8080/swagger-ui/index.html`

### 3. Frontend Setup

```bash
cd innoadFrontend

# Instalar dependencias
npm install

# Ejecutar dev server
ng serve --open

# O con proxy (si tienes proxy.conf.json)
ng serve --proxy-config proxy.conf.json
```

**Puerto**: `http://localhost:4200`

---

## 🧪 Tests de Funcionalidad

### Backend Tests

#### 1️⃣ Health Check
```bash
# Verificar que backend está running
curl http://localhost:8080/actuator/health

# Response esperado:
{
  "status": "UP"
}
```

#### 2️⃣ Swagger Documentation
```bash
# Abrir en navegador
http://localhost:8080/swagger-ui/index.html

# Deberías ver:
- /api/v1/campanas
- /api/v1/pantallas
- /api/v1/contenidos
- /api/v1/mantenimiento
```

#### 3️⃣ Test Campaña Module

```bash
# 1. POST - Crear campaña
curl -X POST http://localhost:8080/api/v1/campanas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "titulo": "Campaign 1",
    "descripcion": "Test campaign",
    "presupuesto": 1000.00,
    "fechaInicio": "2025-01-01T00:00:00Z",
    "fechaFin": "2025-01-31T23:59:59Z",
    "estado": "BORRADORA"
  }'

# 2. GET - Listar campañas
curl http://localhost:8080/api/v1/campanas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. GET - Obtener una específica
curl http://localhost:8080/api/v1/campanas/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. PUT - Actualizar
curl -X PUT http://localhost:8080/api/v1/campanas/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"titulo": "Updated Title"}'

# 5. PATCH - Cambiar estado
curl -X PATCH http://localhost:8080/api/v1/campanas/1/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"nuevoEstado": "ACTIVA"}'

# 6. DELETE - Eliminar
curl -X DELETE http://localhost:8080/api/v1/campanas/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4️⃣ Test Pantalla Module

```bash
# POST - Crear pantalla
curl -X POST http://localhost:8080/api/v1/pantallas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Pantalla-01",
    "ubicacion": "Entrada",
    "ipAddress": "192.168.1.100",
    "macAddress": "00:1A:2B:3C:4D:5E",
    "estado": "ACTIVA"
  }'

# GET - Pantallas conectadas
curl http://localhost:8080/api/v1/pantallas/conectadas/lista \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# PATCH - Actualizar conexión
curl -X PATCH http://localhost:8080/api/v1/pantallas/1/conexion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bateria": 85,
    "cpuTemperatura": 65.5,
    "estado": "ACTIVA"
  }'
```

#### 5️⃣ Test Contenido Module

```bash
# POST - Upload archivo
curl -X POST http://localhost:8080/api/v1/contenidos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "archivo=@/path/to/video.mp4" \
  -F "titulo=Mi Video" \
  -F "tipo=VIDEO"

# GET - Listar contenidos
curl http://localhost:8080/api/v1/contenidos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# GET - Obtener metadatos
curl http://localhost:8080/api/v1/contenidos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6️⃣ Test Mantenimiento Module

```bash
# GET - Estado (PÚBLICO - sin auth)
curl http://localhost:8080/api/v1/mantenimiento/estado

# POST - Verificar acceso (PÚBLICO)
curl -X POST http://localhost:8080/api/v1/mantenimiento/verificar-acceso \
  -H "Content-Type: application/json" \
  -d '{"contrasena": "Cris93022611184"}'

# POST - Activar (admin)
curl -X POST http://localhost:8080/api/v1/mantenimiento/activar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "motivo": "Actualizaciones del sistema",
    "fechaInicio": "2025-01-01T00:00:00Z",
    "fechaFin": "2025-01-01T06:00:00Z",
    "restricciones": {
      "graficos": true,
      "publicacion": false,
      "descargas": true
    }
  }'

# GET - Obtener último
curl http://localhost:8080/api/v1/mantenimiento/ultimo \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Frontend Tests

#### 1️⃣ Navegar a Mantenimiento

```typescript
// En navegador, ir a:
http://localhost:4200/mantenimiento

// Deberías ver:
✅ Spinner loading
✅ Panel de mantenimiento
✅ Campo de contraseña
✅ Botón verificar
✅ Barra de progreso
✅ Lista de restricciones
```

#### 2️⃣ Test Componente Mantenimiento

```typescript
// Pasos:
1. Navegar a /mantenimiento
2. Ver estado actual (GET /api/v1/mantenimiento/estado)
3. Ingresar contraseña incorrecta
   → Ver "Contraseña incorrecta. Intento 1 de 3"
4. Ingresar contraseña incorrecta 3 veces
   → Ver "Bloqueado por 5 minutos"
   → Botón deshabilitado
5. Después de 5 min (o esperar en dev)
   → Botón se habilita nuevamente
6. Ingresar contraseña correcta: `Cris93022611184`
   → Ver "Acceso concedido"
   → Redirect a /dashboard después de 2 segundos
```

#### 3️⃣ Test Error Interceptor

```typescript
// Simular error 401
1. Hacer logout
2. Intentar acceder a /dashboard
3. Ver: Redirect a /autenticacion/login

// Simular error 403
1. Login como usuario sin permisos
2. Navegar a ruta protegida
3. Ver: Redirect a /sin-permisos

// Simular error 503
1. Hacer request a endpoint
2. Si backend está down, ver: Redirect a /mantenimiento

// Simular error de red (0)
1. Offline navegador
2. Intentar fetch
3. Ver: Console warning "Error de conectividad"
```

#### 4️⃣ Test Servicios Gráficos

```typescript
// En consola del navegador:

// Ver reintentos en acción
localStorage.setItem('debug', 'app:*')

// Llamar a servicio
this.servicioGraficos.obtenerDatos().subscribe(
  data => console.log('Data:', data),
  error => console.error('Error:', error)
)

// Deberías ver:
[Gráficos] Reintentando en 1000ms (intento 1/3)
[Gráficos] Reintentando en 2000ms (intento 2/3)
[Gráficos] Datos obtenidos exitosamente
```

#### 5️⃣ Test Servicio Publicación

```typescript
// Sincronización automática c/2 minutos
1. Navegar a módulo de publicación
2. Esperar 2 minutos
3. Ver que se sincronizan datos
4. Ver alertas de nuevas publicaciones

// Reintentos en POST
1. Crear nueva publicación
2. Si hay error, ver reintento automático
3. Después de 3 intentos, mostrar error
```

---

## 🔍 Debugging

### Backend

```bash
# Activar logs detallados
# En application-dev.yml:
logging:
  level:
    com.innoad: DEBUG
    org.springframework: INFO
    org.hibernate.SQL: DEBUG

# Ver logs en consola
mvn spring-boot:run | grep -i "error\|warn\|debug"
```

### Frontend

```typescript
// Usar Angular DevTools Chrome Extension
1. Instalar: https://angular.io/guide/devtools
2. Abrir DevTools (F12)
3. Ir a "Angular" tab
4. Inspeccionar componentes y servicios

// Breakpoints en TypeScript
1. Abrir Sources en DevTools
2. Ir a "webpack://src/app"
3. Poner breakpoints en .ts files
4. Ejecutar paso a paso
```

---

## 📊 Performance Checks

### Backend

```bash
# Tiempo de respuesta
time curl http://localhost:8080/api/v1/campanas \
  -H "Authorization: Bearer TOKEN"

# Deberías ver < 200ms

# Memory usage
jps -l
# Buscar InnoAdApplication y ver memoria

# Conexiones DB
psql -U innoad_user -d innoad \
  -c "SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY datname, usename"
```

### Frontend

```typescript
// En Chrome DevTools Performance tab:
1. Performance → Start recording
2. Navegar a /mantenimiento
3. Stop recording
4. Ver tiempos:
   - FCP (First Contentful Paint): < 1s
   - LCP (Largest Contentful Paint): < 2.5s
   - CLS (Cumulative Layout Shift): < 0.1
```

---

## 📝 Test Results Template

```markdown
# Test Results - [Date]

## Backend
- [ ] Health check: ✅/❌
- [ ] Swagger: ✅/❌
- [ ] Campaña CRUD: ✅/❌
- [ ] Pantalla CRUD: ✅/❌
- [ ] Contenido Upload: ✅/❌
- [ ] Mantenimiento Password: ✅/❌

## Frontend
- [ ] Dev server compila: ✅/❌
- [ ] Mantenimiento component: ✅/❌
- [ ] Error interceptor: ✅/❌
- [ ] Servicios conectan: ✅/❌

## Performance
- [ ] Backend < 200ms: ✅/❌
- [ ] Frontend FCP < 1s: ✅/❌

## Issues Found
- [ ] Issue 1: Description
- [ ] Issue 2: Description

## Notes
...
```

---

## 🚨 Troubleshooting

### Backend no arranca
```bash
# Error: Port 8080 already in use
lsof -i :8080
kill -9 <PID>

# Error: DB connection refused
psql -U postgres -c "SELECT version()"
# Si está down, iniciar PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Error: JWT expired
# Token válido solo 24 horas
# Generar nuevo token en /login
```

### Frontend no carga
```bash
# Error: Port 4200 already in use
lsof -i :4200
kill -9 <PID>

# Error: Module not found
npm install --legacy-peer-deps

# Error: CORS
# Verificar backend tiene CORS configurado:
# @CrossOrigin(origins = "http://localhost:4200")
```

### API returns 401
```bash
# Token inválido o expirado
# Generar nuevo:
POST /api/autenticacion/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response:
{
  "token": "eyJhbGc...",
  "usuario": {...}
}

# Usar token en headers
Authorization: Bearer eyJhbGc...
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs (console + terminal)
2. Buscar en CHANGELOG-FASE4.md
3. Abrir issue en GitHub con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Environment info

---

**Última actualización**: 31-12-2025
**Versión**: 2.0.0
