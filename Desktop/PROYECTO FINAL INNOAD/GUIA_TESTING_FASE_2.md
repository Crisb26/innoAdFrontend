# 🧪 GUÍA DE TESTING - FASE 2

## Introducción

Esta guía te ayuda a validar que toda la FASE 2 funcione correctamente antes de desplegar a producción.

---

## 1️⃣ Testing Manual - Frontend

### 1.1 Verificar Compilación
```bash
cd FRONTEND/innoadFrontend
npm run construir

# Debe terminar con:
# ✔ Compilation successful
```

### 1.2 Acceder a Centro de Alertas
```
URL: http://localhost:4200/mantenimiento/alertas-tiempo-real
```

**Verificar:**
- [ ] Página carga sin errores
- [ ] Título "Centro de Alertas en Tiempo Real" visible
- [ ] 4 cards de estadísticas (Críticas, Advertencias, Info, Éxito)
- [ ] 3 filtros funcionales (Tipo, Estado, Búsqueda)
- [ ] Botones: Reconectar, Limpiar
- [ ] Indicador de estado WebSocket

### 1.3 Probar Navegación
```
Hacer clic en: Navegación Mantenimiento
```

**Verificar:**
- [ ] Aparecen 6 opciones de menú
- [ ] Links redirigen correctamente:
  - Dashboard Principal → /mantenimiento
  - Centro de Alertas en Tiempo Real → /mantenimiento/alertas-tiempo-real
  - Configuración → /mantenimiento/configuracion
  - Gestor Raspberry Pi → /mantenimiento/raspberrypi
  - Centro de Alertas → /mantenimiento/alertas
  - Historial → /mantenimiento/historial

### 1.4 Probar Filtros
```
1. Seleccionar "CRITICA" en dropdown "Tipo de Alerta"
2. Deben mostrar solo alertas críticas

3. Seleccionar "RESUELTA" en dropdown "Estado"
4. Deben mostrar solo alertas resueltas

5. Escribir texto en "Buscar"
6. Deben filtrar por título en tiempo real
```

### 1.5 Probar Responsive
```
Abrir herramientas de desarrollador (F12)
Cambiar tamaño de pantalla:
- Desktop (1920x1080) ✓
- Tablet (768x1024) ✓
- Mobile (375x667) ✓
```

**Verificar:**
- [ ] Layout se adapta correctamente
- [ ] Elementos no se superponen
- [ ] Texto es legible en todos los tamaños
- [ ] Botones clickeables en móvil

---

## 2️⃣ Testing Manual - Backend

### 2.1 Verificar Compilación
```bash
cd BACKEND/innoadBackend
mvn clean install -DskipTests

# Debe terminar con:
# BUILD SUCCESS
```

### 2.2 Iniciar Servidor
```bash
mvn spring-boot:run

# Debe mostrar:
# Started Application in X seconds
# Server is running on http://localhost:8080
```

### 2.3 Probar REST API

#### 2.3.1 Obtener Alertas Activas
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/activas"

# Respuesta esperada:
# [
#   {
#     "id": 1,
#     "tipo": "CRITICA",
#     "titulo": "Fallo de Conexión",
#     "estado": "ACTIVA",
#     "prioridad": 4
#   }
# ]
```

#### 2.3.2 Obtener Alertas Críticas
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/criticas"

# Debe retornar solo alertas con prioridad >= 4 y estado ACTIVA
```

#### 2.3.3 Obtener Una Alerta por ID
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/1"

# Respuesta: Objeto alerta completo
```

#### 2.3.4 Crear una Alerta
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "tipo=ADVERTENCIA&titulo=Test&descripcion=Alerta de prueba&origen=TEST&prioridad=2" \
  "http://localhost:8080/api/v1/mantenimiento/alertas"

# Respuesta: Alerta creada con ID asignado
```

#### 2.3.5 Resolver una Alerta
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/1/resolver?usuarioId=user@example.com&descripcion=Problema%20resuelto"

# Respuesta: Alerta con estado RESUELTA
```

#### 2.3.6 Escalar una Alerta
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/1/escalar"

# Respuesta: Alerta con prioridad aumentada
```

#### 2.3.7 Ignorar una Alerta
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/1/ignorar"

# Respuesta: Alerta con estado IGNORADA
```

#### 2.3.8 Obtener Estadísticas
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/estadisticas/general"

# Respuesta:
# {
#   "total_activas": 3,
#   "total_resueltas": 5,
#   "criticas_activas": 1,
#   "advertencias_activas": 2
# }
```

### 2.4 Probar WebSocket

#### 2.4.1 Conectar a WebSocket
```javascript
// En consola del navegador con DevTools abierto

const socket = new SockJS('http://localhost:8080/ws/alertas');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('✓ Conectado al WebSocket');
    console.log('Frame:', frame);
});
```

#### 2.4.2 Suscribirse a Alertas
```javascript
stompClient.subscribe('/topic/alertas', function(message) {
    const alerta = JSON.parse(message.body);
    console.log('✓ Alerta recibida:', alerta);
});
```

#### 2.4.3 Crear Alerta desde Backend (Mientras escuchas en Frontend)
```bash
# En terminal diferente, crear una alerta
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "tipo=CRITICA&titulo=Test WebSocket&descripcion=Prueba WS&origen=TEST&prioridad=5" \
  "http://localhost:8080/api/v1/mantenimiento/alertas"

# RESULTADO ESPERADO: En consola del navegador debes ver:
# ✓ Alerta recibida: {...}
```

#### 2.4.4 Desconectar
```javascript
stompClient.disconnect(function() {
    console.log('✓ Desconectado del WebSocket');
});
```

---

## 3️⃣ Testing Base de Datos

### 3.1 Conectarse a PostgreSQL
```bash
psql -U postgres -d nombre_base_datos
```

### 3.2 Verificar Tablas
```sql
-- Ver todas las tablas de alertas
\dt alertas* auditoria* plantillas*

-- Resultado esperado:
--                    List of relations
-- Schema |        Name         | Type  | Owner
-- --------+--------------------+-------+-------
-- public | alertas_sistema     | table | postgres
-- public | auditoria_alertas   | table | postgres
-- public | plantillas_alertas  | table | postgres
```

### 3.3 Verificar Datos
```sql
-- Ver alertas creadas
SELECT id, tipo, titulo, estado, prioridad FROM alertas_sistema ORDER BY id DESC LIMIT 5;

-- Ver plantillas
SELECT id, nombre, tipo, prioridad FROM plantillas_alertas;

-- Ver auditoría
SELECT alerta_id, accion, usuario_id, fecha_accion FROM auditoria_alertas ORDER BY fecha_accion DESC LIMIT 5;
```

### 3.4 Verificar Índices
```sql
-- Ver índices creados
SELECT indexname FROM pg_indexes WHERE tablename IN ('alertas_sistema', 'auditoria_alertas');

-- Resultado esperado:
--              indexname
-- ------+----------------------------
--  idx_alertas_estado
--  idx_alertas_tipo
--  idx_alertas_tipo_estado
--  idx_alertas_prioridad
--  idx_alertas_fecha_creacion
--  idx_alertas_dispositivo_id
--  idx_alertas_usuario_id
--  idx_alertas_origen
```

### 3.5 Verificar Vistas
```sql
-- Ver vistas disponibles
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'VIEW';

-- Resultado esperado:
--     table_name
-- ----+--------------------------
--  vista_alertas_activas
--  vista_alertas_criticas
--  vista_estadisticas_alertas
```

### 3.6 Probar Vistas
```sql
-- Alertas activas
SELECT * FROM vista_alertas_activas LIMIT 5;

-- Alertas críticas
SELECT * FROM vista_alertas_criticas LIMIT 5;

-- Estadísticas
SELECT * FROM vista_estadisticas_alertas;
```

---

## 4️⃣ Testing Integración (End-to-End)

### 4.1 Flujo Completo

**Preparación:**
1. Backend ejecutándose en localhost:8080
2. Frontend ejecutándose en localhost:4200
3. Base de datos conectada
4. WebSocket conectado

**Pasos:**
1. [ ] Abrir Centro de Alertas en Frontend
2. [ ] Crear alerta desde Backend (CLI)
3. [ ] Verificar que aparece en tiempo real en Frontend
4. [ ] Resolver desde Frontend
5. [ ] Verificar que BD se actualiza
6. [ ] Verificar auditoría en BD

**Validación:**
- [ ] Alerta aparece en <1 segundo
- [ ] Estado se actualiza al resolver
- [ ] Auditoría registra el cambio
- [ ] No hay errores en consola

### 4.2 Prueba de Estrés

**Crear múltiples alertas rapidamente:**
```bash
for i in {1..20}; do
  curl -X POST \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "tipo=ADVERTENCIA&titulo=Test $i&origen=STRESS&prioridad=$((RANDOM % 5 + 1))" \
    "http://localhost:8080/api/v1/mantenimiento/alertas"
  sleep 0.1
done
```

**Verificar:**
- [ ] Todas las alertas se reciben en Frontend
- [ ] Filtros siguen funcionando
- [ ] No hay lag significativo
- [ ] WebSocket no se desconecta

### 4.3 Prueba de Reconexión

**Desconectar y reconectar WebSocket:**
1. Abrir DevTools (F12)
2. Ir a Network
3. Desactivar caché (checkbox en Network)
4. Hacer clic en botón "Reconectar" en Centro de Alertas
5. Verificar que aparece en Network: /ws/alertas
6. WebSocket debe mostrar estado: OPEN

---

## 5️⃣ Checklist Final

### Backend
- [ ] Maven compilation: SUCCESS
- [ ] Spring Boot inicia sin errores
- [ ] Todos los 8 endpoints responden (200 OK)
- [ ] JWT auth requerida y funciona
- [ ] WebSocket STOMP conecta exitosamente
- [ ] CORS configurado correctamente

### Frontend
- [ ] ng build compilation: SUCCESS (0 errors)
- [ ] Centro de Alertas carga
- [ ] WebSocket conecta al inicializar
- [ ] Filtros funcionan
- [ ] Modales abren/cierran correctamente
- [ ] Notificaciones visuales aparecen
- [ ] Responsive en móvil, tablet, desktop

### Base de Datos
- [ ] Tablas existen
- [ ] Índices creados
- [ ] Vistas disponibles
- [ ] Datos iniciales cargados
- [ ] Triggers funcionan
- [ ] Performance aceptable

### Integración
- [ ] Alertas se crean en BD
- [ ] Alertas llegan a Frontend en tiempo real
- [ ] Acciones desde Frontend se guardan en BD
- [ ] Auditoría registra cambios
- [ ] Reconexión automática funciona

---

## 6️⃣ Troubleshooting

### WebSocket no conecta
```
Error: Failed to connect
Solución:
1. Verificar que Backend está ejecutándose
2. Verificar que puerto 8080 está disponible
3. Revisar CORS en ConfiguracionWebSocket
4. Ver logs en Backend: grep -i websocket
```

### Alertas no se reciben
```
Error: No hay alertas en Frontend
Solución:
1. Crear alerta manualmente desde CLI
2. Revisar que JWT token es válido
3. Verificar que usuario tiene permisos (ADMINISTRADOR o TECNICO)
4. Revisar base de datos: SELECT COUNT(*) FROM alertas_sistema;
```

### Errores 401 Unauthorized
```
Solución:
1. Obtener nuevo JWT token: /api/v1/auth/login
2. Pasar token en header: Authorization: Bearer TOKEN
3. Verificar que token no ha expirado
```

### Errores 403 Forbidden
```
Solución:
1. Verificar que usuario tiene rol ADMINISTRADOR o TECNICO
2. Revisar tabla roles en BD
3. Verificar JWT payload contiene roles
```

---

## 7️⃣ Resultados Esperados

### Compilación
```
✅ Backend: BUILD SUCCESS
✅ Frontend: Compilation successful (0 errors)
```

### REST API
```
✅ GET /alertas/activas: [Lista de alertas]
✅ POST /alertas: {id: 123, titulo: "..."}
✅ PUT /alertas/{id}/resolver: Alerta resuelta
```

### WebSocket
```
✅ Conexión: STOMP/1.2
✅ Suscripción: /topic/alertas OK
✅ Mensajes: Recibidos en tiempo real
```

### Base de Datos
```
✅ Tabla alertas_sistema: 1000+ registros
✅ Auditoría: Registros de cambios
✅ Vistas: Funcionando correctamente
```

---

## 🎯 Conclusión

Si todos los tests pasan, la FASE 2 está lista para producción. 

**¿Necesitas ayuda con algo específico?**

---

**Actualizado:** 15 de diciembre de 2024  
**Versión:** FASE 2 v2.0.0
