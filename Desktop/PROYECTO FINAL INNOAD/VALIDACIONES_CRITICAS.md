# 🔴 VALIDACIONES CRÍTICAS - MUST PASS ANTES DE DOCKERIZAR

**Estado**: Pendiente de ejecución
**Creado**: 1 Enero 2026
**Objetivo**: Identificar y resolver problemas ANTES de dockerizar en otro PC

---

## 1️⃣ CRÍTICA: BACKEND LEVANTA & RESPONDE

### ✋ PASO 1: Compilar Backend
```bash
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
mvn clean compile
```

**Esperado**: ✅ BUILD SUCCESS  
**Si falla**: 
- [ ] Revisar errores de compilación
- [ ] Falta alguna dependencia en pom.xml
- [ ] Java 21 está instalado: `java -version`
- [ ] Maven está en PATH: `mvn -version`

---

### ✋ PASO 2: Ejecutar Tests Backend
```bash
mvn test
```

**Esperado**: ✅ Tests pass (al menos 90%)  
**Si falla**:
- [ ] Ver qué tests fallan
- [ ] Errores de conexión a BD (check H2 en dev profile)
- [ ] Imports faltantes

---

### ✋ PASO 3: Iniciar Backend en DEV
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Esperado**:
- ✅ Compila sin errores
- ✅ Se ve: `Started InnoAdApplication in X seconds`
- ✅ Log muestra: `Application started on http://localhost:8080`
- ✅ No hay exceptions en rojo

**Si falla**:
- [ ] Puerto 8080 ocupado → `netstat -an | findstr 8080` → cambiar en properties
- [ ] H2 no inicia → check `application-dev.yml`
- [ ] Falta archivo de propiedades → check `src/main/resources/`
- [ ] Exception de beans → revisar @Configuration classes

---

### ✋ PASO 4: Verificar Health Check
```bash
# En otra terminal:
curl http://localhost:8080/actuator/health
```

**Esperado**: 
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" or "UNKNOWN" }
  }
}
```

**Si retorna 500**: Hay algo mal con la conexión

---

## 2️⃣ CRÍTICA: FRONTEND COMPILA & CARGA

### ✋ PASO 1: Instalar Dependencies
```bash
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend
npm install
```

**Esperado**: ✅ audited X packages  
**Si falla**:
- [ ] Node 20+ instalado: `node -v`
- [ ] npm 11+ instalado: `npm -v`
- [ ] Conexión internet (npm registry)
- [ ] package-lock.json corrupto → borrar y reintentar

---

### ✋ PASO 2: Compilar Angular (PRODUCTION)
```bash
ng build --configuration production
```

**Esperado**: ✅ Compilation successful  
**Si falla**:
- [ ] TypeScript errors → revisar `.ts` files
- [ ] Template errors → revisar `.html` files
- [ ] CSS errors → revisar `.scss` files
- [ ] Angular CLI version: `ng version`

---

### ✋ PASO 3: Iniciar Frontend en DEV
```bash
ng serve
```

**Esperado**:
- ✅ Se ve: `✔ Compiled successfully.`
- ✅ Browser abre http://localhost:4200
- ✅ Página de login aparece
- ✅ No hay red X en consola del navegador

**Si falla**:
- [ ] Puerto 4200 ocupado → `ng serve --port 4300`
- [ ] Assets no cargan → check `angular.json`
- [ ] CORS error → check backend configuration
- [ ] TypeError en consola → revisar componentes

---

## 3️⃣ CRÍTICA: LOGIN FUNCIONA (E2E MANUAL)

### ✋ PASO 1: Navegar a Login
1. Abrir http://localhost:4200 en navegador
2. **Esperado**: Ves página de login con campos "usuario" y "contraseña"

### ✋ PASO 2: Credenciales por Defecto
Backend debe tener user por defecto. Revisar en DB:

```bash
# En otro terminal, mientras backend corre:
# H2 Console: http://localhost:8080/h2-console
# Default creds: sa / (vacío)
SELECT * FROM USERS;
```

**Esperado**: Al menos 1 usuario de test

---

### ✋ PASO 3: Login Test
1. Escribe email: `test@innoad.com` (o el que encuentres en DB)
2. Escribe password: `password123` (o tu contraseña)
3. Click "Login"

**Esperado**:
- ✅ Redirecciona a dashboard
- ✅ Ve lista de campañas o menú
- ✅ Token en localStorage: Abre DevTools → Application → localStorage

**Si falla**:
- [ ] 401 error → credenciales mal
- [ ] 404 error → endpoint `/api/auth/login` no existe
- [ ] 500 error → error en backend (revisar logs)
- [ ] CORS error → revisa backend CORS config

---

## 4️⃣ CRÍTICA: ENDPOINTS RESPONDEN

### ✋ PASO 1: Health Backend
```bash
curl -X GET http://localhost:8080/actuator/health
```

**Esperado**: Status "UP"

---

### ✋ PASO 2: Swagger UI
```
Abre en navegador: http://localhost:8080/swagger-ui.html
```

**Esperado**: 
- ✅ Ves lista de endpoints
- ✅ Ves secciones: auth, usuarios, campanas, hardware, etc.
- ✅ Puedes expandir y ver parámetros

---

### ✋ PASO 3: Login Endpoint (Swagger)
1. Abre Swagger
2. Busca `POST /api/auth/login`
3. Click "Try it out"
4. En Body escribe:
```json
{
  "email": "test@innoad.com",
  "password": "password123"
}
```
5. Click "Execute"

**Esperado**: 
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "test@innoad.com",
    "roles": ["USER"]
  }
}
```

**Si retorna 401/500**: Problema en backend

---

## 5️⃣ CRÍTICA: BASE DE DATOS FUNCIONA

### ✋ PASO 1: Crear un usuario nuevo (Backend)

```bash
# Usando Swagger o CURL:
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@innoad.com",
    "password": "securePass123!",
    "nombre": "Nuevo Usuario"
  }'
```

**Esperado**: ✅ 201 Created con usuario creado

---

### ✋ PASO 2: Verificar en Base de Datos

```bash
# H2 Console o psql si es PostgreSQL:
SELECT * FROM USERS ORDER BY CREATED_AT DESC LIMIT 1;
```

**Esperado**: ✅ Ves el usuario creado

---

## 6️⃣ CRÍTICA: WEBPACK BUNDLE VÁLIDO

### ✋ PASO 1: Analizar bundle (Frontend)
```bash
ng build --configuration production --stats-json
```

**Esperado**: Genera `/dist/innoadFrontend/stats.json`

### ✋ PASO 2: Ver tamaño
```bash
# En Windows:
dir dist\innoadFrontend\browser | find /c /v ""
# o simplemente:
dir /s dist\innoadFrontend\browser
```

**Esperado**: 
- ✅ main.js < 1MB
- ✅ Total < 2MB
- ✅ Gzipped < 500KB (en Nginx)

---

## 7️⃣ CRÍTICA: DOCKERFILES VÁLIDOS

### ✋ PASO 1: Validar sintaxis
```bash
# Backend
docker build -t innoad-backend:test -f Dockerfile.optimizado .
# Si compila:
docker image rm innoad-backend:test

# Frontend
cd ..\innoadFrontend
docker build -t innoad-frontend:test -f Dockerfile.optimizado .
# Si compila:
docker image rm innoad-frontend:test
```

**Esperado**: ✅ Build successful (ambos)

---

## 8️⃣ CRÍTICA: docker-compose VÁLIDO

### ✋ PASO 1: Validar YAML
```bash
docker-compose config
```

**Esperado**: ✅ Valida sin errores

### ✋ PASO 2: Test levanta
```bash
# Solo verificar que los containers se crean (no correr):
docker-compose up --dry-run
```

---

## 📋 RESUMEN RÁPIDO

Para validar TODO en 15 minutos, ejecuta estos comandos en orden:

**Terminal 1 - Backend**:
```bash
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
# Espera hasta ver "Started InnoAdApplication"
```

**Terminal 2 - Verificar Backend**:
```bash
timeout /t 3  # Espera 3 segundos
curl http://localhost:8080/actuator/health
# Esperado: {"status":"UP"...}
```

**Terminal 3 - Frontend**:
```bash
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend
npm install
ng serve
# Espera hasta ver "Compiled successfully"
```

**Terminal 4 - Manual Test**:
```
1. Abre http://localhost:4200 en navegador
2. Ves login page ✓
3. Login con credenciales ✓
4. Ves dashboard ✓
```

---

## ❌ SI ALGO FALLA

| Problema | Diagnóstico |
|----------|-----------|
| `mvn` no existe | Installar Maven 3.9.x, agregar a PATH |
| Compilación falla | Ver errores en consola, buscar `ERROR` en logs |
| Puerto 8080 ocupado | `netstat -an \| findstr 8080`, matar proceso |
| npm install falla | Borrar `node_modules/` y `package-lock.json`, reintentar |
| ng serve no carga | Abrir http://localhost:4200, revisar consola (F12) |
| Login no funciona | Swagger test de `/api/auth/login` manualmente |
| Docker build falla | Ver error específico, revisar Dockerfile |
| CORS error | Backend CORS permitir localhost:4200 |

---

## ✅ CHECKLIST FINAL

Cuando TODO funcione, puedes marcar así:

```
VALIDACIONES CRÍTICAS - ESTADO FINAL
===================================

✅ Backend compila (mvn compile)
✅ Backend levanta (mvn spring-boot:run)
✅ Health check responde
✅ Frontend npm install
✅ Frontend compila (ng build)
✅ Frontend levanta (ng serve)
✅ Login funciona (E2E manual)
✅ Swagger endpoints responden
✅ Database CRUD funciona
✅ Docker images compilas
✅ docker-compose.yml válido

RESULTADO: 🟢 LISTO PARA DOCKERIZAR EN OTRO PC
```

---

**Tiempo estimado**: 30-45 minutos  
**Siguientes pasos**: Crear SETUP_NUEVO_PC.md con instrucciones paso a paso  
**Última actualización**: 1 Enero 2026
