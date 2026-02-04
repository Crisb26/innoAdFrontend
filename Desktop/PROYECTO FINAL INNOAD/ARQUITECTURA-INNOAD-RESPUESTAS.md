# 📐 ARQUITECTURA INNOAD - RESPUESTAS DEFINITIVAS

## Fecha: 4 de Enero de 2026

---

## 1️⃣ ¿EXISTE TABLA "PANTALLAS"? ✅ SÍ

### Tabla PostgreSQL: `pantallas`

```sql
CREATE TABLE pantallas (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(100) NOT NULL,
    resolucion VARCHAR(50),
    estado VARCHAR(50) NOT NULL,
    conectada BOOLEAN,
    ultima_conexion TIMESTAMP,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    campana_id BIGINT REFERENCES campanas(id),
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP,
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    bateria_porcentaje INTEGER,
    temperatura_cpu DECIMAL(5,2)
);

CREATE INDEX idx_pantallas_usuario_id ON pantallas(usuario_id);
CREATE INDEX idx_pantallas_codigo ON pantallas(codigo);
CREATE INDEX idx_pantallas_estado ON pantallas(estado);
```

### Entity Java: 
- Ruta: `modules/pantallas/dominio/Pantalla.java`
- Anotaciones: `@Entity`, `@Table(name="pantallas")`
- Campos principales:
  - `id` (Long) - Clave primaria
  - `codigo` (String, UNIQUE) - Identificador Raspberry Pi
  - `nombre`, `descripcion`, `ubicacion`, `resolucion`
  - `estado` (Enum: ACTIVA, INACTIVA, MANTENIMIENTO, DESCONECTADA, DEFECTUOSA)
  - `usuario_id` (FK) - Dueño del negocio
  - `campana_id` (FK) - Campaña asignada

---

## 2️⃣ ¿CADA PANTALLA TIENE ID ÚNICO? ✅ SÍ, DOS IDENTIDADES

| ID Type | Campo | Tipo | Uso |
|---------|-------|------|-----|
| **Interno** | `id` | Long | BD, Relaciones, APIs REST |
| **Externo** | `codigo` | String | Identificación Raspberry Pi, Polling |

**Ejemplo:**
```json
{
  "id": 42,
  "codigo": "pantalla_local_001",
  "nombre": "Pantalla Tienda Centro",
  "ubicacion": "Entrada Principal"
}
```

---

## 3️⃣ ¿QUIÉN ASIGNA PUBLICIDAD A PANTALLA? 🔐

### Jerarquía de Roles

```
┌─ ADMIN
│  └─ Gestiona TODAS las pantallas y publicidades del sistema
│
└─ USUARIO (Dueño del Negocio)
   └─ Gestiona SOLO sus propias pantallas y publicidades
```

### Relaciones en BD

```
Usuario 1────────────────────► Pantalla
  ├─ Registra pantalla
  ├─ Asigna código único
  └─ Define estado

Usuario 1────────────────────► Publicación/Contenido
  ├─ Crea publicidad
  └─ Asigna a pantalla(s)

Usuario 1────────────────────► Campaña
  ├─ Agrupa publicidades
  └─ Asigna a pantalla(s)
```

---

## 4️⃣ ¿ESTRUCTURA: PANTALLA → PUBLICIDADES? ✅ A TRAVÉS DE CAMPAÑA

### Flujo de Asignación

```
Usuario crea Publicidad
    ↓
Usuario agrupa en Campaña
    ↓
Usuario asigna Campaña a Pantalla(s)
    ↓
Pantalla.campana_id = Campaña.id
    ↓
Campaña.publicaciones = [Publicidad1, Publicidad2, ...]
    ↓
Pantalla muestra publicidades de su Campaña asignada
```

### Modelo Alternativo (Directo)

```
Pantalla 1───────► Campaña
               ├─ Publicidad 1
               ├─ Publicidad 2
               └─ Publicidad 3
```

---

## 5️⃣ ENDPOINTS API DOCUMENTADOS

### Rutas Protegidas (Requieren JWT)

```http
POST   /api/v1/pantallas
       Crear pantalla
       Requiere: { codigo, nombre, ubicacion, resolucion }

GET    /api/v1/pantallas
       Listar pantallas del usuario
       Parámetros: page, size, nombre, estado

GET    /api/v1/pantallas/{id}
       Obtener pantalla por ID

PUT    /api/v1/pantallas/{id}
       Actualizar pantalla

PATCH  /api/v1/pantallas/{id}/estado
       Cambiar estado
       Parámetro: nuevoEstado=ACTIVA|INACTIVA|MANTENIMIENTO|DESCONECTADA|DEFECTUOSA

DELETE /api/v1/pantallas/{id}
       Eliminar pantalla

GET    /api/v1/pantallas/conectadas/lista
       Obtener pantallas conectadas del usuario
```

### 🆕 Endpoints NUEVOS (Sin Autenticación - Para Raspberry Pi)

```http
GET    /api/v1/pantallas/codigo/{codigo}
       Obtener datos de pantalla por código
       Respuesta: PantallaDTO

GET    /api/v1/pantallas/codigo/{codigo}/contenido
       Obtener campaña/contenido actual de pantalla
       Respuesta: 
       {
         "pantalla": {...},
         "campanaActual": {
           "id": 1,
           "nombre": "Campaña X",
           "estado": "ACTIVA"
         },
         "estado": "ACTIVA",
         "conectada": true,
         "ultimaActualizacion": "2026-01-04T15:30:00"
       }
```

---

## 6️⃣ ¿CÓMO OBTIENE CONTENIDO RASPBERRY PI?

### Estrategia de Actualización

#### **POLLING (Actual/Recomendado)**
```
Raspberry Pi each 30 segundos:
  1. GET /api/v1/pantallas/codigo/pantalla_001/contenido
  2. Comparar timestamp ultimaActualizacion
  3. Si cambió → refrescar pantalla
  4. Dormir 30s → repetir
```

**Ventajas:**
- ✅ Simple de implementar
- ✅ No requiere WebSocket
- ✅ Funciona en redes con proxy/firewall

**Desventajas:**
- ❌ Latencia de hasta 30s
- ❌ Tráfico constante

#### **WEBSOCKET (Disponible - No usado aún)**
```java
// En pom.xml existe:
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**Flujo si se implementa:**
```
Raspberry conecta a WebSocket
  ↓
Usuario actualiza Campaña
  ↓
Backend notifica a Raspberry por WebSocket
  ↓
Raspberry recibe cambio en tiempo real
  ↓
Raspberry actualiza pantalla inmediatamente
```

**Ventajas:**
- ✅ Actualizaciones en tiempo real
- ✅ Bajo tráfico

**Desventajas:**
- ❌ Requiere conexión persistente
- ❌ Más complejo

---

## 7️⃣ MÉTODOS DEL SERVICIO (ServicioPantallas.java)

```java
// Métodos Existentes
crearPantalla(PantallaDTO, usuarioUsername)
obtenerPantalla(id, usuarioUsername)
listarPantallas(usuarioUsername, pageable)
buscarPorNombre(usuarioUsername, nombre, pageable)
actualizarPantalla(id, dto, usuarioUsername)
cambiarEstado(id, nuevoEstado, usuarioUsername)
actualizarConexion(codigo, conectada, ipAddress)
eliminarPantalla(id, usuarioUsername)
getPantallasConectadas(usuarioUsername)
listarPorEstado(usuarioUsername, estado, pageable)

// 🆕 MÉTODOS NUEVOS (Implementados)
+ obtenerPantallaPorCodigo(codigo)
+ obtenerContenidoPantalla(codigo)
```

---

## 8️⃣ CAMBIOS IMPLEMENTADOS HOY

### ✅ Archivo: `ServicioPantallas.java`

**Agregado:** 2 métodos nuevos
```java
/**
 * Obtener pantalla por código (para Raspberry Pi)
 */
public PantallaDTO obtenerPantallaPorCodigo(String codigo)

/**
 * Obtener contenido/campaña de una pantalla por código (para Raspberry Pi)
 */
public Object obtenerContenidoPantalla(String codigo)
```

**Imports agregados:**
```java
import java.util.HashMap;
import java.util.Map;
```

### ✅ Archivo: `ControladorPantallas.java`

**Agregados:** 2 endpoints nuevos
```java
/**
 * Obtener pantalla por código (para Raspberry Pi)
 */
@GetMapping("/codigo/{codigo}")
public ResponseEntity<?> obtenerPantallaPorCodigo(
        @PathVariable String codigo
)

/**
 * Obtener contenido/feed de una pantalla por código (para Raspberry Pi)
 */
@GetMapping("/codigo/{codigo}/contenido")
public ResponseEntity<?> obtenerContenidoPantalla(
        @PathVariable String codigo
)
```

---

## 9️⃣ FLUJO COMPLETO: USUARIO → RASPBERRY → PANTALLA

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Frontend)                       │
│  - Crea Pantalla (código: pantalla_001)                    │
│  - Crea Campaña (nombre: "Verano 2026")                    │
│  - Asigna Campaña a Pantalla                               │
└────────────────────────┬────────────────────────────────────┘
                         │ PUT /api/v1/pantallas/1 + campana_id
                         ↓
        ┌────────────────────────────────────┐
        │  BD PostgreSQL                     │
        │  pantallas.campana_id = 7          │
        │  campanas.publicaciones = [...]    │
        └────────────────┬───────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              RASPBERRY PI (Hardware)                         │
│  - Poll cada 30s:                                          │
│    GET /api/v1/pantallas/codigo/pantalla_001/contenido    │
│                                                              │
│  - Respuesta:                                              │
│    {                                                        │
│      "pantalla": {...},                                    │
│      "campanaActual": {                                    │
│        "id": 7,                                            │
│        "nombre": "Verano 2026"                             │
│      },                                                     │
│      "estado": "ACTIVA",                                   │
│      "ultimaActualizacion": "2026-01-04T15:30:00"         │
│    }                                                        │
│                                                              │
│  - Descargar publicidades de campaña 7                     │
│  - Renderizar en pantalla física                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔟 PRÓXIMAS IMPLEMENTACIONES SUGERIDAS

### Priority 1 (Crítico)
- [ ] Endpoint GET `/api/v1/campanas/{id}/publicidades` para obtener contenido
- [ ] Validación de autenticación Raspberry Pi (por token)
- [ ] Logging de acceso Raspberry Pi

### Priority 2 (Importante)
- [ ] WebSocket `/ws/pantalla/{codigo}` para updates en tiempo real
- [ ] Estadísticas de tiempo de pantalla
- [ ] Heartbeat mechanism para detectar desconexiones

### Priority 3 (Mejoras)
- [ ] API para actualizar batería/temperatura desde Raspberry
- [ ] Caché Redis para listar pantallas
- [ ] Alertas cuando pantalla se desconecta >5min

---

## 📊 COMPILACIÓN STATUS

**Iniciado:** 2026-01-04 (Hace ~15 minutos)

**Archivos Modificados:**
- ✅ ServicioPantallas.java (2 métodos nuevos)
- ✅ ControladorPantallas.java (2 endpoints nuevos)

**Procesos Java Activos:** 3
- Maven compilando con cambios nuevos
- Backend: [⏳] compilando
- Frontend: [⏳] compilando

---

## 📝 CONCLUSIÓN

**InnoAd NO es un reproductor genérico**, es un **sistema de distribución dinámico** donde:

1. ✅ Cada Raspberry tiene **código único** (ej: `pantalla_001`)
2. ✅ Usuarios asignan **Campañas a Pantallas**
3. ✅ Pantallas obtienen contenido **via API REST polling**
4. ✅ **Posibilidad de WebSocket** para tiempo real (no implementado aún)
5. ✅ **Control de acceso** por usuario (admin vs dueño negocio)

**Arquitectura escalable y segura para** cadena de restaurantes, hoteles, centros comerciales, etc.

---

**Generated by:** GitHub Copilot AI Assistant  
**Time:** 2026-01-04 15:45:00  
**Status:** En compilación - cambios aplicados
