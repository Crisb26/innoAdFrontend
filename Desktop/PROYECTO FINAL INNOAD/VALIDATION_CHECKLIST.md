# 📋 CHECKLIST PRE-DOCKERIZACIÓN - INNOAD PROJECT

**Objetivo**: Validar que TODO funciona correctamente antes de dockerizar desde otro PC

**Generado**: 1 Enero 2026  
**Estado Inicial**: 9/9 FASES COMPLETAS  
**Siguiente**: Docker + Deployment en segundo PC

---

## 🔍 SECCIÓN 1: VALIDACIONES DE CONEXIÓN

### 1.1 Base de Datos - PostgreSQL
- [ ] **Conexión PostgreSQL local (H2 en dev)**
  - [ ] Profile dev usa H2 en memoria ✓
  - [ ] Profile prod conecta a PostgreSQL
  - [ ] Credenciales en properties están correctas
  - [ ] Timeout de conexión: 30s
  
- [ ] **Migraciones de Base de Datos**
  - [ ] `DATABASE-SCRIPT.sql` ejecuta sin errores
  - [ ] Todas las tablas se crean correctamente
  - [ ] Índices están creados
  - [ ] Constraints de FK funcionan
  - [ ] Data de prueba inserta sin problemas

- [ ] **Validar Queries**
  - [ ] `select 1` funciona
  - [ ] `select * from users` retorna registros
  - [ ] Joins entre tablas funcionan
  - [ ] Paginación funciona
  - [ ] Búsquedas funcionan

### 1.2 Redis - Cache
- [ ] **Conexión Redis**
  - [ ] Redis local escucha en puerto 6379
  - [ ] Password configurado (si aplica)
  - [ ] TTL de cache configurado (default: 1h)
  - [ ] Redis CLI conecta: `redis-cli PING` → PONG

- [ ] **Operaciones de Cache**
  - [ ] Set/Get funciona
  - [ ] Delete funciona
  - [ ] TTL expira correctamente
  - [ ] Serialización JSON correcta
  - [ ] No hay memory leaks

### 1.3 Backend - Spring Boot
- [ ] **Servidor levanta**
  - [ ] `mvn spring-boot:run` compila sin errores
  - [ ] Aplicación inicia en Puerto 8080
  - [ ] Health check: `GET http://localhost:8080/actuator/health` → UP
  - [ ] No hay NullPointerExceptions en logs
  - [ ] No hay exceptions de conexión sin resolver

- [ ] **Endpoints Básicos**
  - [ ] `GET /api/health` → 200 OK
  - [ ] `GET /swagger-ui.html` → carga interfaz
  - [ ] `GET /actuator` → muestra endpoints disponibles
  - [ ] `GET /api/ping` → PONG (si existe)

### 1.4 Frontend - Angular
- [ ] **Build sin errores**
  - [ ] `npm install` no da warnings críticos
  - [ ] `ng build` compila exitosamente
  - [ ] `ng build --configuration production` compila sin errores
  - [ ] No hay archivos .spec.ts sin ejecutarse en tests
  - [ ] TypeScript compila sin errores (strict mode)

- [ ] **Servidor dev levanta**
  - [ ] `ng serve` inicia en http://localhost:4200
  - [ ] No hay errores en consola (solo warnings menores)
  - [ ] Página de login carga
  - [ ] Assets (imágenes, iconos) cargan correctamente

---

## 🔐 SECCIÓN 2: VALIDACIONES DE AUTENTICACIÓN & SEGURIDAD

### 2.1 Autenticación JWT
- [ ] **Login funciona**
  - [ ] POST `/api/auth/login` con credenciales correctas retorna JWT
  - [ ] Token almacenado en localStorage
  - [ ] Token incluido en headers `Authorization: Bearer <token>`
  - [ ] Refresh token funciona (si existe)
  - [ ] Logout limpia token

- [ ] **Autorización por Roles**
  - [ ] Rutas admin requieren rol ADMIN
  - [ ] Rutas user permiten solo USER
  - [ ] 401 si no autenticado
  - [ ] 403 si rol insuficiente
  - [ ] Guards protegen rutas

- [ ] **Validación de Contraseña**
  - [ ] Contraseña hasheada con BCrypt (rounds: 12)
  - [ ] Cambio de contraseña funciona
  - [ ] Reset password por email funciona
  - [ ] Contraseña no se loguea nunca

### 2.2 Seguridad HTTP
- [ ] **Headers de Seguridad**
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: SAMEORIGIN`
  - [ ] `Content-Security-Policy` configurado
  - [ ] `Strict-Transport-Security` (HSTS) en prod
  - [ ] `X-XSS-Protection` habilitado

- [ ] **CORS**
  - [ ] CORS configurado solo para dominios permitidos
  - [ ] POST/PUT/DELETE requieren preflight
  - [ ] No hay wildcard `*` en prod
  - [ ] Credenciales se envían correctamente

### 2.3 Variables Sensibles
- [ ] **No existen secretos en código**
  - [ ] JWT_SECRET no está en GitHub
  - [ ] API keys (OpenAI, Mercado Pago) están en `.env`
  - [ ] Database credentials no están en código
  - [ ] Redis password no está en código
  - [ ] `.env` está en `.gitignore`

---

## 📡 SECCIÓN 3: VALIDACIONES DE ENDPOINTS

### 3.1 Autenticación
- [ ] `POST /api/auth/login` → Retorna JWT ✓
- [ ] `POST /api/auth/register` → Crea usuario ✓
- [ ] `POST /api/auth/refresh` → Nuevo JWT ✓
- [ ] `POST /api/auth/logout` → Limpia sesión ✓
- [ ] `GET /api/auth/me` → Datos usuario actual ✓

### 3.2 Usuarios
- [ ] `GET /api/usuarios` → Lista (admin only)
- [ ] `GET /api/usuarios/{id}` → Usuario específico
- [ ] `PUT /api/usuarios/{id}` → Actualiza
- [ ] `DELETE /api/usuarios/{id}` → Borra (admin only)
- [ ] `PUT /api/usuarios/{id}/rol` → Cambia rol (admin only)

### 3.3 Campañas
- [ ] `GET /api/campanas` → Lista con paginación
- [ ] `POST /api/campanas` → Crea nueva
- [ ] `GET /api/campanas/{id}` → Detalle
- [ ] `PUT /api/campanas/{id}` → Actualiza
- [ ] `DELETE /api/campanas/{id}` → Borra
- [ ] `GET /api/campanas/by-estado/{estado}` → Filtra

### 3.4 Pantallas/Hardware
- [ ] `GET /api/hardware/dispositivos` → Lista
- [ ] `POST /api/hardware/dispositivos` → Registra
- [ ] `GET /api/hardware/dispositivos/{id}` → Detalle
- [ ] `POST /api/hardware/dispositivos/{id}/comando` → Ejecuta comando
- [ ] `GET /api/hardware/dispositivos/{id}/estadisticas` → Métricas

### 3.5 IA - Chat
- [ ] `POST /api/ia/chat` → Envía pregunta
- [ ] `GET /api/ia/historial` → Obtiene conversación
- [ ] `DELETE /api/ia/historial` → Limpia
- [ ] `GET /api/ia/sugerencias` → Obtiene sugerencias
- [ ] `POST /api/ia/contexto` → Actualiza contexto

### 3.6 Integraciones Externas
- [ ] `POST /api/pagos/crear-orden` → Mercado Pago
- [ ] `GET /api/pagos/estado/{id}` → Status pago
- [ ] Webhook de Mercado Pago procesa correctamente
- [ ] Email se envía correctamente
- [ ] OpenAI API retorna respuestas

### 3.7 Mantenimiento (FASE 4)
- [ ] `GET /api/admin/mantenimiento` → Estado
- [ ] `POST /api/admin/mantenimiento/activar` → Activa modo
- [ ] `POST /api/admin/mantenimiento/desactivar` → Desactiva
- [ ] Página `/mantenimiento` muestra UI amigable
- [ ] Guards bloquean acceso si no es admin

---

## ⚙️ SECCIÓN 4: VALIDACIONES DE FUNCIONALIDAD

### 4.1 Frontend - Login & Navegación
- [ ] Login página carga
- [ ] Credenciales inválidas muestran error
- [ ] Credenciales válidas redirigen a dashboard
- [ ] Logout funciona y vuelve a login
- [ ] Rutas protegidas redirigen si no autenticado
- [ ] Menu navega correctamente
- [ ] Responsive design funciona en móvil

### 4.2 Frontend - Campañas
- [ ] Lista de campañas carga
- [ ] Paginación funciona
- [ ] Filtros funcionan (estado, fecha, etc.)
- [ ] Buscar por nombre funciona
- [ ] Crear campaña abre modal
- [ ] Formulario valida campos
- [ ] Editar campaña funciona
- [ ] Borrar campaña muestra confirmación
- [ ] Confirmación ejecuta delete

### 4.3 Frontend - Hardware/Pantallas
- [ ] Lista de dispositivos carga
- [ ] Icono del dispositivo muestra estado (online/offline)
- [ ] Click en dispositivo muestra detalles
- [ ] Botones de control responden (play, pause, restart)
- [ ] Asignar contenido abre selector
- [ ] Estadísticas se actualizan
- [ ] WebSocket conecta y recibe updates en tiempo real

### 4.4 Frontend - IA Chat
- [ ] Chat box se abre
- [ ] Escribir y enviar funciona
- [ ] Respuesta de IA aparece
- [ ] Historial se guarda
- [ ] Context (rol, dispositivos) se aplica
- [ ] Sugerencias aparecen
- [ ] Exports (PDF, CSV) funcionan

### 4.5 Backend - Lógica de Negocio
- [ ] Campanas solo accesibles por propietario (RBAC)
- [ ] Cambio de estado valida transiciones
- [ ] Notificaciones se envían en eventos
- [ ] Archivos se guardan en carpeta correcta
- [ ] Cálculos de estadísticas son correctos
- [ ] No hay race conditions en operaciones
- [ ] Rollbacks funcionan en errores

---

## 🧪 SECCIÓN 5: VALIDACIONES DE TESTING

### 5.1 Tests Unitarios
- [ ] Backend: `mvn test` ejecuta sin fallos
- [ ] Frontend: `ng test` ejecuta sin fallos
- [ ] Coverage >= 85%
- [ ] No hay tests skipped (x)
- [ ] No hay errores en imports
- [ ] Mocks funcionan correctamente

### 5.2 Tests E2E
- [ ] Cypress tests lanzan sin errores
- [ ] Login test pasa
- [ ] Navigation test pasa
- [ ] Crear/editar/borrar test pasan
- [ ] Scenario completo funciona
- [ ] No hay timeout errors

---

## 🐳 SECCIÓN 6: VALIDACIONES DOCKER-READY

### 6.1 Dockerfile Backend
- [ ] Dockerfile.optimizado existe
- [ ] Multi-stage build configurado
- [ ] BUILD stage: Maven compila sin errores
- [ ] RUNTIME stage: OpenJDK inicia
- [ ] Health check definido
- [ ] Non-root user creado
- [ ] Ports expuestos: 8080, 8443

### 6.2 Dockerfile Frontend
- [ ] Dockerfile.optimizado existe
- [ ] Multi-stage build configurado
- [ ] BUILD stage: Angular compila en prod
- [ ] RUNTIME stage: Nginx levanta
- [ ] Nginx config incluida
- [ ] Health check definido
- [ ] Ports expuestos: 80, 443

### 6.3 docker-compose.yml
- [ ] Archivo existe y es válido YAML
- [ ] PostgreSQL service definido
- [ ] Redis service definido
- [ ] Backend service definido
- [ ] Frontend service definido
- [ ] Health checks configurados
- [ ] Networks creadas
- [ ] Volumes definidos

### 6.4 Configuration
- [ ] `.env.example` existe con todas las variables
- [ ] Variables están documentadas
- [ ] Secrets no están en `.env.example`
- [ ] Archivo `.env` actual está en `.gitignore`

---

## 📊 SECCIÓN 7: VALIDACIONES DE PERFORMANCE

### 7.1 Backend Performance
- [ ] Response time < 500ms (sin IA)
- [ ] Response time < 2s (con IA)
- [ ] Memory usage estable
- [ ] No hay memory leaks (jvisualvm)
- [ ] Logs no se llenan de warnings

### 7.2 Frontend Performance
- [ ] Lighthouse score >= 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size < 2MB

### 7.3 Database Performance
- [ ] Queries ejecutan en < 100ms
- [ ] Índices están en lugar (EXPLAIN)
- [ ] No hay N+1 queries
- [ ] Paginación funciona eficientemente
- [ ] Full-text search rápido (si existe)

---

## 🔄 SECCIÓN 8: VALIDACIONES DE INTEGRACIONES

### 8.1 Mercado Pago
- [ ] Credenciales configuradas
- [ ] Crear orden devuelve init_point
- [ ] IPN (webhook) funciona
- [ ] Status de transacción se actualiza
- [ ] Fallo de pago maneja error

### 8.2 OpenAI
- [ ] API key válida
- [ ] Llamadas retornan respuestas
- [ ] Timeout configurado
- [ ] Manejo de errores de API
- [ ] Cost tracking (si aplica)

### 8.3 Email
- [ ] Provider SMTP configurado
- [ ] Emails se envían correctamente
- [ ] Templates renderean bien
- [ ] Attachments funcionan (si aplica)
- [ ] Bounce handling (si aplica)

### 8.4 AWS/Azure (si aplica)
- [ ] Credentials válidas
- [ ] S3/Blob Storage conecta
- [ ] Subida de archivos funciona
- [ ] Descarga de archivos funciona
- [ ] Expiraciones de URLs funcionan

---

## 📝 SECCIÓN 9: VALIDACIONES DE DOCUMENTACIÓN

### 9.1 README files
- [ ] [BACKEND README](README.md) actualizado
- [ ] [FRONTEND README](../innoadFrontend/README.md) actualizado
- [ ] Instrucciones de setup son claras
- [ ] Comandos están correctos
- [ ] Links funcionan

### 9.2 API Documentation
- [ ] Swagger/OpenAPI disponible en `/swagger-ui.html`
- [ ] Todos los endpoints documentados
- [ ] Parámetros descritos
- [ ] Response examples incluidos
- [ ] Error codes documentados

### 9.3 Guides FASE
- [ ] FASE_8_DOCKER_CONTAINERIZATION.md existe
- [ ] FASE_9_DEPLOYMENT_CICD.md existe
- [ ] PROYECTO_INNOAD_COMPLETACION.md existe
- [ ] Instrucciones son claras

---

## ✅ SECCIÓN 10: VALIDACIONES FINALES

### 10.1 Git & Version Control
- [ ] Último commit contiene cambios correctos
- [ ] No hay cambios unstaged importantes
- [ ] `.gitignore` contiene: `.env`, `node_modules/`, `target/`, `dist/`
- [ ] No hay archivos grandes (> 50MB) en repo
- [ ] History es limpio

### 10.2 Dependencies
- [ ] `pom.xml` versiones son estables (no SNAPSHOT en prod)
- [ ] `package.json` versiones pinned o ~
- [ ] No hay deprecation warnings críticos
- [ ] CVEs auditadas: `npm audit`, `mvn dependency:check`
- [ ] Actualizaciones seguras aplicadas

### 10.3 Environment Setup
- [ ] `.env` local existe y funciona
- [ ] `.env.example` documenta todas las variables
- [ ] Dev env usa H2/SQLite (sin conexión externa)
- [ ] Prod env usa PostgreSQL (con credenciales)
- [ ] Profiles están correctamente separados (dev/prod)

### 10.4 Comprobación Final
- [ ] Backend compila: `mvn clean compile` ✓
- [ ] Backend tests pasan: `mvn test` ✓
- [ ] Frontend compila: `npm run build` ✓
- [ ] Frontend tests pasan: `ng test --watch=false` ✓
- [ ] Docker compila: `docker build -t innoad-backend .` ✓

---

## 🚀 PRÓXIMOS PASOS (DESPUÉS DE VALIDAR TODO)

1. **En este PC**:
   - [ ] Ejecutar COMPLETO este checklist
   - [ ] Resolver cualquier item NO CHECKADO
   - [ ] Documenter issues encontrados en `VALIDATION_ISSUES.md`
   - [ ] Commit final: "Validación pre-dockerización completada"

2. **Preparar para segundo PC**:
   - [ ] Crear repo limpio o clonar desde GitHub
   - [ ] Verificar que `.gitignore` funciona (sin `.env`, `node_modules`, etc.)
   - [ ] Crear `.env` de ejemplo con valores dummy
   - [ ] Documentar setup instrucciones en [SETUP_NUEVO_PC.md](./SETUP_NUEVO_PC.md)

3. **En segundo PC**:
   - [ ] Clonar repo
   - [ ] Copiar `.env` desde `.env.example`
   - [ ] Ejecutar este checklist nuevamente
   - [ ] Levantar con `docker-compose up`

4. **Dockerización**:
   - [ ] Build local: `docker-compose build`
   - [ ] Test local: `docker-compose up` (verificar logs)
   - [ ] Push a registry: Docker Hub o Azure Container Registry
   - [ ] Deploy a servidor: Azure App Service o Kubernetes

---

## 📊 ESTADÍSTICAS

| Sección | Items | Status |
|---------|-------|--------|
| 1. Conexiones | 25 | ⬜ |
| 2. Seguridad | 15 | ⬜ |
| 3. Endpoints | 30 | ⬜ |
| 4. Funcionalidad | 35 | ⬜ |
| 5. Testing | 15 | ⬜ |
| 6. Docker-Ready | 20 | ⬜ |
| 7. Performance | 10 | ⬜ |
| 8. Integraciones | 15 | ⬜ |
| 9. Documentación | 10 | ⬜ |
| 10. Finales | 15 | ⬜ |
| **TOTAL** | **190 items** | **⬜ 0%** |

---

**Notas**:
- Marcar cada item con `[x]` cuando esté verificado
- Documentar cualquier issue en sección "Problemas encontrados" abajo
- Si un item falla, documentar el error y la solución

## Problemas Encontrados

(Se completará durante la validación)

```
Problema 1: [DESCRIPCIÓN]
- Ubicación: [ARCHIVO/LÍNEA]
- Causa: [POR QUÉ]
- Solución: [CÓMO ARREGLARLO]
- Status: ⬜ PENDIENTE / 🟡 EN PROGRESO / ✅ RESUELTO

```

---

**Última actualización**: 1 Enero 2026  
**Próximo check**: Antes de dockerizar en segundo PC
