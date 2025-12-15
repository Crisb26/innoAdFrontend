# 🔌 ENDPOINTS REQUERIDOS - BACKEND JAVA SPRING BOOT

## Ubicaciones

### GET /api/ubicaciones/ciudades
Obtiene lista de todas las ciudades disponibles.

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Quito",
    "cantidadLugares": 5
  },
  {
    "id": 2,
    "nombre": "Guayaquil",
    "cantidadLugares": 3
  }
]
```

### GET /api/ubicaciones/ciudades/{ciudadId}/lugares
Obtiene lugares/negocios de una ciudad específica.

**Parámetros:**
- `ciudadId` (integer, path)

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "ciudadId": 1,
    "nombre": "Centro Comercial X",
    "pisos": 4,
    "costoBase": 200.00,
    "disponible": true
  },
  {
    "id": 2,
    "ciudadId": 1,
    "nombre": "Centro Comercial Y",
    "pisos": 3,
    "costoBase": 150.00,
    "disponible": true
  }
]
```

### GET /api/ubicaciones/lugares/{lugarId}/pisos
Obtiene información de pisos disponibles en un lugar.

**Parámetros:**
- `lugarId` (integer, path)

**Respuesta (200 OK):**
```json
[
  {
    "numero": 1,
    "disponible": true,
    "costoPorDia": 50.00
  },
  {
    "numero": 2,
    "disponible": true,
    "costoPorDia": 50.00
  },
  {
    "numero": 3,
    "disponible": false,
    "costoPorDia": 50.00
  },
  {
    "numero": 4,
    "disponible": true,
    "costoPorDia": 50.00
  }
]
```

### POST /api/ubicaciones/seleccionar
Guarda la selección de ubicaciones del usuario (opcional - para persistencia).

**Body:**
```json
{
  "usuarioId": 123,
  "duracionDias": 30,
  "ubicaciones": [
    {
      "ciudadId": 1,
      "lugarId": 1,
      "pisos": [1, 2, 4],
      "costoPorDia": 150.00
    },
    {
      "ciudadId": 1,
      "lugarId": 2,
      "pisos": [1, 3],
      "costoPorDia": 100.00
    }
  ],
  "costoTotal": 7500.00
}
```

**Respuesta (201 Created):**
```json
{
  "id": 456,
  "mensaje": "Ubicaciones guardadas exitosamente"
}
```

---

## Publicaciones

### POST /api/publicaciones
Crea una nueva publicación (publicidad).

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "titulo": "Gran Promoción de Verano",
  "descripcion": "Descuentos hasta 50% en todos nuestros productos",
  "tipoContenido": "VIDEO",
  "duracionDias": 30,
  "archivoUrl": "https://cdn.ejemplo.com/video.mp4",
  "ubicaciones": [
    {
      "ciudadId": 1,
      "lugarId": 1,
      "pisos": [1, 2, 4]
    },
    {
      "ciudadId": 1,
      "lugarId": 2,
      "pisos": [1, 3]
    }
  ],
  "costoTotal": 7500.00
}
```

**Respuesta (201 Created):**
```json
{
  "id": 789,
  "titulo": "Gran Promoción de Verano",
  "estado": "PENDIENTE",
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "usuarioId": 123
}
```

### GET /api/publicaciones/usuario/{usuarioId}
Obtiene todas las publicaciones del usuario.

**Parámetros:**
- `usuarioId` (integer, path)

**Query Params (opcionales):**
- `estado` (PENDIENTE, APROBADO, RECHAZADO, PUBLICADO, FINALIZADO)
- `pagina` (default: 1)
- `limite` (default: 10)

**Respuesta (200 OK):**
```json
{
  "data": [
    {
      "id": 789,
      "titulo": "Gran Promoción de Verano",
      "descripcion": "Descuentos hasta 50%...",
      "estado": "PENDIENTE",
      "tipoContenido": "VIDEO",
      "duracionDias": 30,
      "ubicaciones": 2,
      "costoTotal": 7500.00,
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "progreso": 20
    }
  ],
  "total": 15,
  "pagina": 1,
  "limit": 10
}
```

### GET /api/publicaciones/{publicacionId}
Obtiene detalles completos de una publicación.

**Parámetros:**
- `publicacionId` (integer, path)

**Respuesta (200 OK):**
```json
{
  "id": 789,
  "titulo": "Gran Promoción de Verano",
  "descripcion": "Descuentos hasta 50% en todos nuestros productos",
  "estado": "PENDIENTE",
  "tipoContenido": "VIDEO",
  "duracionDias": 30,
  "archivoUrl": "https://cdn.ejemplo.com/video.mp4",
  "usuarioId": 123,
  "costoTotal": 7500.00,
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "ubicaciones": [
    {
      "id": 1,
      "ciudad": "Quito",
      "lugar": "Centro Comercial X",
      "pisos": [1, 2, 4]
    }
  ]
}
```

### GET /api/publicaciones/pendientes
Obtiene publicaciones pendientes de aprobación (TECNICO).

**Headers:**
- `Authorization: Bearer {token}`

**Query Params:**
- `pagina` (default: 1)
- `limite` (default: 20)

**Respuesta (200 OK):**
```json
{
  "data": [
    {
      "id": 789,
      "titulo": "Publicidad 1",
      "usuario": "Cliente A",
      "estado": "PENDIENTE",
      "fechaCreacion": "2024-01-15T10:30:00Z",
      "ubicaciones": 2,
      "costoTotal": 7500.00
    }
  ],
  "total": 5
}
```

### PUT /api/publicaciones/{publicacionId}/aprobar
Aprueba una publicación (TECNICO/ADMIN).

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
{
  "id": 789,
  "estado": "APROBADO",
  "fechaAprobacion": "2024-01-15T11:00:00Z",
  "mensaje": "Publicación aprobada exitosamente"
}
```

### PUT /api/publicaciones/{publicacionId}/rechazar
Rechaza una publicación (TECNICO/ADMIN).

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "motivo": "Calidad de video insuficiente"
}
```

**Respuesta (200 OK):**
```json
{
  "id": 789,
  "estado": "RECHAZADO",
  "motivo": "Calidad de video insuficiente",
  "fechaRechazo": "2024-01-15T11:00:00Z"
}
```

### GET /api/publicaciones/publicadas
Obtiene publicaciones publicadas (feed público).

**Query Params:**
- `pagina` (default: 1)
- `limite` (default: 10)
- `ciudad` (opcional, filtro)

**Respuesta (200 OK):**
```json
[
  {
    "id": 789,
    "titulo": "Gran Promoción",
    "archivoUrl": "https://cdn.ejemplo.com/video.mp4",
    "tipoContenido": "VIDEO",
    "usuario": "Mi Negocio",
    "ciudad": "Quito",
    "lugar": "Centro Comercial X"
  }
]
```

---

## Chat

### GET /api/chat
Obtiene lista de conversaciones del usuario autenticado.

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "participanteNombre": "Técnico Carlos",
    "ultimoMensaje": "Vamos a revisar tu publicidad...",
    "estado": "ACTIVO",
    "noLeidos": 2,
    "ultimoMensajeTimestamp": "2024-01-15T15:30:00Z"
  }
]
```

### POST /api/chat
Inicia una nueva conversación.

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "usuarioId": 123,
  "tecnicoId": 456,
  "asunto": "Consulta sobre publicidad"
}
```

**Respuesta (201 Created):**
```json
{
  "id": 1,
  "estado": "ACTIVO",
  "mensaje": "Conversación iniciada"
}
```

### GET /api/chat/{chatId}/mensajes
Obtiene mensajes de una conversación.

**Parámetros:**
- `chatId` (integer, path)

**Respuesta (200 OK):**
```json
[
  {
    "id": 101,
    "chatId": 1,
    "remitente": "Usuario",
    "mensaje": "Hola, tengo una duda",
    "timestamp": "2024-01-15T15:20:00Z",
    "leido": true
  },
  {
    "id": 102,
    "chatId": 1,
    "remitente": "Técnico",
    "mensaje": "Claro, ¿en qué puedo ayudarte?",
    "timestamp": "2024-01-15T15:25:00Z",
    "leido": true
  }
]
```

### POST /api/chat/{chatId}/mensajes
Envía un mensaje en una conversación.

**Parámetros:**
- `chatId` (integer, path)

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "mensaje": "Perfecto, gracias por tu ayuda"
}
```

**Respuesta (201 Created):**
```json
{
  "id": 103,
  "chatId": 1,
  "remitente": "Usuario",
  "mensaje": "Perfecto, gracias por tu ayuda",
  "timestamp": "2024-01-15T15:30:00Z"
}
```

### PUT /api/chat/{chatId}/cerrar
Cierra una conversación (ADMIN).

**Parámetros:**
- `chatId` (integer, path)

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "estado": "CERRADO",
  "mensaje": "Chat cerrado. El usuario puede ver el historial."
}
```

---

## Dispositivos

### GET /api/dispositivos
Obtiene lista de todos los dispositivos (pantallas).

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Pantalla Centro Comercial X - Piso 1",
    "ubicacion": "Quito - Centro Comercial X",
    "estado": "CONECTADO",
    "uptime": "45 días, 3 horas, 15 minutos",
    "ultimaConexion": "2024-01-15T15:45:00Z",
    "ip": "192.168.1.100"
  }
]
```

### GET /api/dispositivos/salud
Check de salud de todos los dispositivos (polling).

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Pantalla X",
    "estado": "CONECTADO",
    "uptime": "45d 3h 15m",
    "ultimaConexion": "2024-01-15T15:45:00Z"
  },
  {
    "id": 2,
    "nombre": "Pantalla Y",
    "estado": "DESCONECTADO",
    "uptime": "0d 0h 0m",
    "ultimaConexion": "2024-01-14T10:30:00Z"
  }
]
```

### GET /api/dispositivos/{dispositivoId}
Obtiene detalles de un dispositivo específico.

**Parámetros:**
- `dispositivoId` (integer, path)

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "nombre": "Pantalla Centro Comercial X - Piso 1",
  "ubicacion": "Quito - Centro Comercial X",
  "estado": "CONECTADO",
  "uptime": "45 días, 3 horas, 15 minutos",
  "ultimaConexion": "2024-01-15T15:45:00Z",
  "ip": "192.168.1.100",
  "resolucion": "1920x1080",
  "ultimosErrores": [
    {
      "timestamp": "2024-01-14T20:15:00Z",
      "tipo": "CONEXION_PERDIDA",
      "descripcion": "Pérdida de conexión por 2 minutos"
    }
  ]
}
```

### GET /api/dispositivos/{dispositivoId}/historial
Obtiene historial de errores y estado de un dispositivo.

**Parámetros:**
- `dispositivoId` (integer, path)

**Query Params:**
- `dias` (default: 7)

**Respuesta (200 OK):**
```json
{
  "dispositivo": "Pantalla X",
  "registros": [
    {
      "timestamp": "2024-01-15T15:45:00Z",
      "evento": "CONEXION_EXITOSA",
      "descripcion": "Pantalla conectada"
    },
    {
      "timestamp": "2024-01-14T20:15:00Z",
      "evento": "ERROR",
      "descripcion": "Pérdida de conexión por 2 minutos"
    }
  ]
}
```

---

## Autenticación & Usuario

### POST /api/auth/login
Autentica un usuario (Ya implementado).

### GET /api/usuario-actual
Obtiene información del usuario autenticado.

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
{
  "id": 123,
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "rol": "USUARIO",
  "empresa": "Mi Negocio",
  "activo": true
}
```

### GET /api/usuarios
Obtiene lista de usuarios (ADMIN).

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
[
  {
    "id": 123,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "USUARIO",
    "activo": true
  }
]
```

### PUT /api/usuarios/{usuarioId}/rol
Cambia el rol de un usuario (ADMIN).

**Parámetros:**
- `usuarioId` (integer, path)

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "nuevoRol": "TECNICO"
}
```

**Respuesta (200 OK):**
```json
{
  "id": 123,
  "nombre": "Juan Pérez",
  "rol": "TECNICO",
  "mensaje": "Rol actualizado exitosamente"
}
```

---

## Admin

### GET /api/admin/mantenimiento
Obtiene estado del modo mantenimiento.

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
{
  "activo": false,
  "mensaje": "Sistema en mantenimiento",
  "horaInicio": "2024-01-16T02:00:00Z",
  "horaFin": "2024-01-16T06:00:00Z"
}
```

### PUT /api/admin/mantenimiento/activar
Activa el modo mantenimiento (ADMIN).

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "mensaje": "Actualizando sistema",
  "duracionMinutos": 240
}
```

**Respuesta (200 OK):**
```json
{
  "activo": true,
  "mensaje": "Actualizando sistema",
  "horaFin": "2024-01-16T06:00:00Z"
}
```

### PUT /api/admin/mantenimiento/desactivar
Desactiva el modo mantenimiento (ADMIN).

**Headers:**
- `Authorization: Bearer {token}`

**Respuesta (200 OK):**
```json
{
  "activo": false,
  "mensaje": "Sistema operativo"
}
```

---

## Upload de Archivos

### POST /api/upload
Sube archivo de publicidad (video o imagen).

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
- `archivo` (file, required)
- `tipo` (VIDEO | IMAGEN, required)

**Respuesta (201 Created):**
```json
{
  "url": "https://cdn.ejemplo.com/uploads/video-abc123.mp4",
  "tipo": "VIDEO",
  "tamano": 52428800,
  "duracion": "00:02:30",
  "mensaje": "Archivo cargado exitosamente"
}
```

---

## Estado Esperado de Respuestas

| Código | Significado |
|--------|------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Notas Importantes

1. **Todos los endpoints protegidos requieren `Authorization: Bearer {token}`**
2. **Validaciones en backend:**
   - Email único
   - Rol válido (ADMIN, TECNICO, DEVELOPER, USUARIO)
   - Archivo no excede límite de tamaño
   - Duración entre 1-365 días
   - Título máximo 100 caracteres
   - Descripción máxima 500 caracteres

3. **Estados de publicación:**
   - PENDIENTE: Esperando revisión técnica
   - APROBADO: Aprobada, esperando publicación
   - RECHAZADO: No fue aprobada
   - PUBLICADO: En transmisión en pantallas
   - FINALIZADO: Período finalizado

4. **Eventos automáticos:**
   - Cambio de estado → Notificación al usuario
   - Desconexión dispositivo → Alerta técnico
   - Nueva publicación → Alerta técnico cada 2 min
