# 🔗 INTEGRACIÓN FRONTEND-BACKEND (Task 2 Completada)

## Status: ✅ HTTP Services Integradas

**Fecha:** 2024  
**Componentes:** Angular 19 ↔ Spring Boot 3.5 ↔ PostgreSQL  
**Orientación:** Feature HORIZONTAL/VERTICAL completamente conectada

---

## 📋 Resumen de Cambios

### Backend (Spring Boot) - Ya Existía ✅
```
✅ Entity: Pantalla.java 
   - Campo: private String orientacion = "HORIZONTAL"
   - Validación JPA con @Column

✅ DTOs: SolicitudPantalla, RespuestaPantalla
   - SolicitudPantalla: @Pattern(regexp = "^(HORIZONTAL|VERTICAL)$")
   - RespuestaPantalla: orientacion field en respuesta

✅ Service: ServicioPantalla.java
   - crearPantalla(): orientacion != null ? solicitudo.getOrientacion() : "HORIZONTAL"
   - actualizarPantalla(): maneja actualización de orientacion
   - Transaccional, logging, permission checks

✅ Controller: ControladorPantalla.java
   - POST /api/v1/pantallas - crear con orientacion
   - PUT /api/v1/pantallas/{id} - actualizar orientacion
   - GET /api/v1/pantallas - obtener todas
   - GET /api/v1/pantallas/{id} - obtener detalle
   - DELETE /api/v1/pantallas/{id} - eliminar
```

### Frontend (Angular) - Recién Conectado ✅

#### 1. Nuevo Servicio HTTP: `pantallas.service.ts`
```typescript
📄 src/app/core/servicios/pantallas.service.ts (NUEVO)

Interfaces:
- SolicitudPantalla: nombre, ubicacion, resolucion, orientacion, notas
- RespuestaPantalla: Complete response with ALL fields from backend
- RespuestaAPI<T>: Generic wrapper {exitoso, mensaje, datos}

BehaviorSubjects (Real-time sync):
- pantallasSubject: Observable<RespuestaPantalla[]>
- pantallaSeleccionadaSubject: Observable<RespuestaPantalla>

Métodos Públicos:
- obtenerPantallas(): Observable<RespuestaAPI<RespuestaPantalla[]>>
- cargarPantallas(): void (carga y actualiza BehaviorSubject)
- obtenerPantalla(id): Observable<RespuestaAPI<RespuestaPantalla>>
- crearPantalla(solicitud): Observable<RespuestaAPI<RespuestaPantalla>>
- actualizarPantalla(id, solicitud): Observable<RespuestaAPI<RespuestaPantalla>>
- eliminarPantalla(id): Observable<RespuestaAPI<void>>
- crearYActualizar(), actualizarYActualizar(), eliminarYActualizar()
  (Métodos combinados: hacen la petición HTTP + actualizan el BehaviorSubject)

Propiedades Públicas:
- pantallas$: Observable para suscribirse a cambios de lista
- pantallaSeleccionada$: Observable para pantalla en detalle
```

#### 2. Componente Formulario: `formulario-pantalla.component.ts` 
```typescript
📝 Cambios Principales:

✅ Inyectar PantallasService
✅ Input @Input pantalla: RespuestaPantalla | null
✅ Output @Output guardarExitoso: EventEmitter<void>
✅ Cambiar valores orientacion a MAYUSCULAS: "HORIZONTAL" | "VERTICAL"
✅ Form group sin campos innecesarios (codigoIdentificacion, tipoPantalla)
✅ Manejar carga con signal: cargando = signal(false)

Flujo:
1. Si @Input pantalla != null → edición (patchValue)
2. Si @Input pantalla == null → creación (form vacío)
3. guardar():
   - Validar form
   - Llamar servicio: actualizarPantalla() o crearPantalla()
   - Si exitoso: cargarPantallas() y emitir guardarExitoso
   - Si error: mostrar console.error
```

#### 3. Componente Lista: `lista-pantallas.component.ts`
```typescript
📋 Cambios Principales:

✅ Inyectar PantallasService
✅ Suscribirse a pantallasService.pantallas$ en constructor
✅ ngOnInit(): cargarPantallas()
✅ pantallas = signal<RespuestaPantalla[]>([])
✅ Usar RespuestaPantalla en filtros
✅ Cambiar campos:
   - orientacion: .orientacion.toLowerCase() (para comparar con CSS class)
   - estado: .estado.toLowerCase()
   - contenidos → cantidadContenidos
   - fecha → ultimaConexion
✅ Pasar pantalla al formulario: [pantalla]="pantallaEnEdicion()"
✅ abrirFormulario(pantalla), cerrarFormulario()
✅ verDetalle(pantalla) → establecerPantallaSeleccionada()

Filtros Funcionales:
- Búsqueda por nombre/ubicación
- Filtro por estado: todos | ACTIVA | INACTIVA
- Eliminar con confirmación
```

---

## 🔌 Flujo de Conexión (Paso a Paso)

### Escenario 1: Crear Nueva Pantalla

```
1. Usuario hace click en "Nueva Pantalla"
   ↓
2. abrirFormulario(null) → mostrarFormulario.set(true)
   ↓
3. FormularioPantallaComponent se muestra sin datos
   ↓
4. Usuario completa:
   - Nombre: "Pantalla Lobby"
   - Ubicación: "Recepción"
   - Resolución: "1920x1080"
   - Orientación: "HORIZONTAL" ← CAMPO INTEGRADO
   - Descripción: "Entrada principal"
   ↓
5. Usuario clickea "Crear"
   ↓
6. form.valid() → sí ✓
   ↓
7. cargando.set(true)
   ↓
8. pantallasService.crearPantalla(solicitud)
   ├─ solicitud = {nombre, ubicacion, resolucion, orientacion, descripcion}
   ├─ HTTP POST /api/v1/pantallas
   └─ Authorization: Bearer {JWT_TOKEN}
   ↓
9. Backend recibe POST
   ├─ ControladorPantalla.crearPantalla()
   ├─ Valida @NotBlank nombre, @Pattern orientacion
   ├─ Llama ServicioPantalla.crearPantalla()
   ├─ Pantalla.builder()
   │  .nombre(solicitud.nombre)
   │  .orientacion(solicitud.orientacion != null ? solicitud.orientacion : "HORIZONTAL")
   │  .usuarioId(usuario.getId())
   │  .save() → PostgreSQL INSERT
   └─ Retorna RespuestaAPI<RespuestaPantalla> con status 200 OK
   ↓
10. Frontend recibe respuesta
    ├─ response.exitoso == true ✓
    ├─ cargando.set(false)
    ├─ pantallasService.cargarPantallas()
    │  └─ HTTP GET /api/v1/pantallas → actualiza BehaviorSubject
    ├─ lista-pantallas.component observable se actualiza
    └─ emisorGardarExitoso.emit() → cerrarFormulario()
    ↓
11. Lista se refresca con nueva pantalla
    └─ Tabla muestra:
       | Pantalla Lobby | Recepción | 1920x1080 | 📺 Horizontal | ... |
```

### Escenario 2: Editar Pantalla - Cambiar Orientación

```
1. Usuario clickea "Editar" en fila de pantalla
   ↓
2. abrirFormulario(pantalla) 
   └─ pantallaEnEdicion.set(pantalla)
   └─ mostrarFormulario.set(true)
   ↓
3. FormularioPantallaComponent detecta @Input pantalla != null
   ├─ esEdicion = true
   └─ form.patchValue({
      nombre: "Pantalla Lobby",
      ubicacion: "Recepción",
      resolucion: "1920x1080",
      orientacion: "HORIZONTAL" ← ACTUAL
      descripcion: "..."
    })
    ↓
4. Usuario cambia: orientacion → "VERTICAL"
   ↓
5. Usuario clickea "Actualizar"
   ↓
6. form.valid() → sí ✓
   ↓
7. cargando.set(true)
   ↓
8. pantallasService.actualizarPantalla(id, solicitud)
   ├─ solicitud = {..., orientacion: "VERTICAL"}
   ├─ HTTP PUT /api/v1/pantallas/{id}
   └─ Authorization: Bearer {JWT_TOKEN}
   ↓
9. Backend recibe PUT
   ├─ ControladorPantalla.actualizarPantalla(id, solicitud)
   ├─ Valida permiso: usuario.id == pantalla.usuario_id
   ├─ Llama ServicioPantalla.actualizarPantalla()
   ├─ Pantalla.setOrientacion("VERTICAL")
   ├─ save() → PostgreSQL UPDATE
   └─ Retorna RespuestaAPI<RespuestaPantalla> actualizada
   ↓
10. Frontend recibe respuesta exitosa
    ├─ pantallasService.cargarPantallas()
    ├─ BehaviorSubject se actualiza
    ├─ Lista se refresca
    └─ Tabla ahora muestra:
       | Pantalla Lobby | Recepción | 1920x1080 | 📱 Vertical | ... |
```

### Escenario 3: Cargar Pantallas al Iniciar

```
1. Usuario accede a /pantallas
   ↓
2. ListaPantallasComponent.ngOnInit()
   ├─ cargando.set(true)
   └─ pantallasService.cargarPantallas()
   ↓
3. cargarPantallas():
   ├─ HTTP GET /api/v1/pantallas
   ├─ Authorization: Bearer {JWT_TOKEN}
   └─ Backend retorna List<RespuestaPantalla>
   ↓
4. response.exitoso == true
   ├─ pantallasSubject.next(response.datos)
   ├─ lista-pantallas observable detecta cambio
   └─ lista se redibuja con BehaviorSubject
   ↓
5. Para cada pantalla:
   ├─ Mostrar nombre, ubicación, resolución
   ├─ Badge orientación: "📺 Horizontal" o "📱 Vertical"
   ├─ Botones: Ver, Editar, Eliminar
   └─ cargando.set(false)
```

---

## 📡 Endpoints Conectados

### Base URL
```
Development:  http://localhost:8080/api/v1
Production:   https://backend.innoad.com/api/v1
```

### Pantallas API
| Método | Endpoint | Parámetros | Respuesta |
|--------|----------|-----------|----------|
| GET | `/pantallas` | Auth: JWT | List<RespuestaPantalla> |
| GET | `/pantallas/{id}` | id, Auth: JWT | RespuestaPantalla |
| POST | `/pantallas` | SolicitudPantalla, Auth: JWT | RespuestaPantalla |
| PUT | `/pantallas/{id}` | id, SolicitudPantalla, Auth: JWT | RespuestaPantalla |
| DELETE | `/pantallas/{id}` | id, Auth: JWT | Success/Error |

### SolicitudPantalla (Request Body)
```json
{
  "nombre": "Pantalla Lobby",
  "ubicacion": "Recepción",
  "resolucion": "1920x1080",
  "orientacion": "HORIZONTAL",
  "descripcion": "Pantalla entrada principal",
  "notas": "Conectada a red LAN"
}
```

### RespuestaPantalla (Response)
```json
{
  "id": 1,
  "nombre": "Pantalla Lobby",
  "descripcion": "Pantalla entrada principal",
  "codigoIdentificacion": "PANTALLA-001",
  "estado": "ACTIVA",
  "ubicacion": "Recepción",
  "resolucion": "1920x1080",
  "orientacion": "HORIZONTAL",
  "usuarioId": 5,
  "nombreUsuario": "Juan",
  "fechaRegistro": "2024-12-20T10:30:00",
  "ultimaConexion": "2024-12-21T15:45:00",
  "ultimaSincronizacion": "2024-12-21T15:45:00",
  "direccionIp": "192.168.1.100",
  "versionSoftware": "1.0.0",
  "informacionSistema": "Raspberry Pi 4 - 4GB RAM",
  "notas": "Conectada a red LAN",
  "estaConectada": true,
  "cantidadContenidos": 3
}
```

---

## 🧪 Testing Manual

### 1. Verificar Creación
```bash
# En frontend, abrir consola y crear pantalla
# Luego verificar en PostgreSQL:
psql -U admin -d innoad_db -c "SELECT id, nombre, orientacion FROM pantalla ORDER BY id DESC LIMIT 1;"

# Esperado:
# id | nombre | orientacion
# 1  | Pantalla Lobby | HORIZONTAL
```

### 2. Verificar Actualización
```bash
# Editar en UI, cambiar orientación a VERTICAL
# Luego verificar en BD:
psql -U admin -d innoad_db -c "SELECT nombre, orientacion FROM pantalla WHERE nombre = 'Pantalla Lobby';"

# Esperado:
# nombre | orientacion
# Pantalla Lobby | VERTICAL
```

### 3. Verificar Lista
```bash
# Abrir Network tab en DevTools (F12)
# Ir a /pantallas
# Ver petición GET /api/v1/pantallas
# Response debe tener array con todas las pantallas + orientacion field
```

---

## 🔐 Autenticación Integrada

El servicio usa el **Auth Interceptor** automáticamente:
- Cada petición HTTP incluye header: `Authorization: Bearer {JWT_TOKEN}`
- Si token expira → RefreshInterceptor obtiene uno nuevo
- Si error 401 → redirecciona a login

```typescript
// En pantallas.service.ts - HttpClient automáticamente:
private http: HttpClient  // Ya tiene interceptores aplicados globalmente

// No necesitas agregar header manualmente, el interceptor lo hace:
POST /api/v1/pantallas
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  Content-Type: "application/json"
}
```

---

## 🔄 Real-time Updates (WebSocket - Próximo Paso)

Actualmente: Polling (cargarPantallas cada vez que se crea/edita)
Próximamente: WebSocket para actualizaciones inmediatas

```typescript
// Lo que viene después (Task 3):
this.websocket.on('pantalla:actualizada', (pantalla) => {
  this.pantallasSubject.next(...); // actualizar lista
});
```

---

## 📋 Checklist de Integración

- [x] Backend Entity con orientacion field
- [x] Backend Service con CRUD orientacion
- [x] Backend Controller con endpoints REST
- [x] Backend DTOs con validación
- [x] Frontend PantallasService creado
- [x] Frontend Formulario conectado al servicio
- [x] Frontend Lista conectada al servicio
- [x] HTTP POST /api/v1/pantallas funcionando
- [x] HTTP PUT /api/v1/pantallas/{id} funcionando
- [x] HTTP GET /api/v1/pantallas funcionando
- [x] HTTP DELETE /api/v1/pantallas/{id} funcionando
- [x] Autenticación JWT aplicada
- [ ] WebSocket para real-time updates
- [ ] Servicios HTTP para Contenidos
- [ ] Servicios HTTP para Campañas
- [ ] Servicios HTTP para Reportes
- [ ] RPi conectado al backend

---

## ⚙️ Variables de Entorno

### Frontend (`environment.ts`)
```typescript
export const environment = {
  apiUrl: 'http://localhost:8080',  // Development
  jwtTokenKey: 'jwt_token',
  refreshTokenKey: 'refresh_token',
  production: false
};
```

### Backend (`application-dev.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/innoad_db
    username: admin
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
```

---

## 📚 Próximos Pasos

1. **Task 3:** Implementar WebSocket para real-time updates
2. **Task 4:** Crear DisplayManager Python para RPi
3. **Task 5:** Conectar RPi al backend
4. **Task 6:** Dashboard de monitoreo de RPi
5. **Task 7:** Autenticación JWT en WebSocket

---

## 🆘 Debugging

### Si el formulario no guarda:
1. Abrir DevTools (F12)
2. Ir a Console
3. Buscar errores
4. Verificar que auth token es válido

### Si la lista no carga:
1. DevTools → Network tab
2. Buscar GET /api/v1/pantallas
3. Ver response status (200, 401, 500, etc)
4. Si 401: token expirado, hacer logout/login

### Si hay CORS error:
Backend tiene @CrossOrigin configurado:
```
origins = {"http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"}
```
Asegurar que frontend corre en uno de estos puertos.

---

**Status:** ✅ Integración Frontend-Backend COMPLETADA y FUNCIONAL
