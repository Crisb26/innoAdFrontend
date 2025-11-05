# API Backend Requerida para InnoAd

Este documento describe todos los endpoints del backend que deben implementarse para que el frontend funcione correctamente.

## Base URL
```
/api/v1
```

## 1. Autenticación y Usuarios

### 1.1 Registro de Usuarios (NUEVO)
**Endpoint:** `POST /autenticacion/registrarse`

**Descripción:** Permite a nuevos usuarios crear una cuenta. Solo crea usuarios con rol "Usuario". Los roles de Admin, Técnico y Developer solo pueden ser creados por un Admin.

**Request Body:**
```json
{
  "nombreUsuario": "string (mínimo 4 caracteres, solo letras, números y guiones bajos)",
  "email": "string (email válido)",
  "nombreCompleto": "string (mínimo 3 caracteres)",
  "contrasena": "string (mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial)",
  "telefono": "string (opcional)",
  "aceptaTerminos": true
}
```

**Response (201 Created):**
```json
{
  "exitoso": true,
  "mensaje": "Usuario registrado exitosamente",
  "datos": {
    "token": "string (JWT)",
    "tokenActualizacion": "string (refresh token)",
    "usuario": {
      "id": "number",
      "nombreUsuario": "string",
      "email": "string",
      "nombreCompleto": "string",
      "telefono": "string",
      "rol": {
        "id": "string",
        "nombre": "Usuario",
        "descripcion": "string",
        "permisos": ["string"],
        "nivel": 1
      },
      "permisos": [],
      "activo": true,
      "verificado": false,
      "fechaCreacion": "date",
      "configuracion": {}
    },
    "expiraEn": 3600
  }
}
```

### 1.2 Recuperación de Contraseña (NUEVO)
**Endpoint:** `POST /autenticacion/recuperar-contrasena`

**Descripción:** Envía un correo electrónico al usuario con un enlace para restablecer su contraseña.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200 OK):**
```json
{
  "exitoso": true,
  "mensaje": "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña"
}
```

**Notas de implementación:**
- Generar un token único (UUID o JWT) con expiración de 1 hora
- Enviar correo con enlace: `https://tudominio.com/autenticacion/recuperar-contrasena?token={TOKEN}`
- Usar servicio de envío de correos (ej: SendGrid, AWS SES, Nodemailer)

### 1.3 Restablecer Contraseña (NUEVO)
**Endpoint:** `POST /autenticacion/restablecer-contrasena`

**Descripción:** Restablece la contraseña del usuario usando el token recibido por correo.

**Request Body:**
```json
{
  "token": "string (token recibido por correo)",
  "contrasenaNueva": "string (mínimo 8 caracteres)",
  "confirmarContrasena": "string"
}
```

**Response (200 OK):**
```json
{
  "exitoso": true,
  "mensaje": "Contraseña restablecida exitosamente"
}
```

**Errors:**
- `400`: Token inválido o expirado
- `400`: Las contraseñas no coinciden

### 1.4 Inicio de Sesión (YA EXISTE)
**Endpoint:** `POST /autenticacion/iniciar-sesion`

Ya implementado - Sin cambios.

## 2. Gestión de Usuarios por Admin (NUEVO)

### 2.1 Crear Usuario con Rol Específico
**Endpoint:** `POST /usuarios`

**Permisos:** Solo Admin

**Descripción:** Permite al Admin crear usuarios con roles específicos (Usuario, Técnico, Developer, Admin).

**Request Body:**
```json
{
  "nombreUsuario": "string",
  "email": "string",
  "nombreCompleto": "string",
  "contrasena": "string",
  "telefono": "string",
  "rol": "Usuario | Tecnico | Developer | Administrador"
}
```

**Response (201 Created):**
```json
{
  "exitoso": true,
  "mensaje": "Usuario creado exitosamente",
  "datos": {
    "id": "number",
    "nombreUsuario": "string",
    "email": "string",
    "rol": {
      "nombre": "string"
    }
  }
}
```

### 2.2 Listar Usuarios
**Endpoint:** `GET /usuarios`

**Permisos:** Admin

**Query Params:**
- `pagina`: number (default: 1)
- `tamaño`: number (default: 10)
- `busqueda`: string (opcional)
- `rol`: string (opcional)

### 2.3 Actualizar Usuario
**Endpoint:** `PUT /usuarios/{id}`

**Permisos:** Admin

### 2.4 Eliminar/Desactivar Usuario
**Endpoint:** `DELETE /usuarios/{id}`

**Permisos:** Admin

## 3. Sistema Raspberry Pi - Pantallas Digitales

### 3.1 Registrar Nueva Pantalla
**Endpoint:** `POST /pantallas`

**Permisos:** Admin, Técnico

**Request Body:**
```json
{
  "codigo": "string (código único de la pantalla)",
  "nombre": "string",
  "descripcion": "string",
  "ubicacion": {
    "direccion": "string",
    "ciudad": "string",
    "pais": "string",
    "codigoPostal": "string",
    "latitud": number,
    "longitud": number,
    "zona": "string",
    "referencia": "string"
  },
  "especificaciones": {
    "resolucion": "1920x1080",
    "orientacion": "horizontal | vertical",
    "tamañoPulgadas": number,
    "tipoPantalla": "LED | LCD | OLED",
    "modeloDispositivo": "string",
    "versionSistema": "string",
    "espacioDisponible": number,
    "soportaAudio": boolean
  },
  "configuracion": {
    "brillo": number (0-100),
    "volumen": number (0-100),
    "horariosEncendido": [
      {
        "diaSemana": number (0-6),
        "horaEncendido": "HH:mm",
        "horaApagado": "HH:mm",
        "activo": boolean
      }
    ],
    "modoEnergia": "normal | ahorro",
    "reinicioAutomatico": boolean,
    "horaReinicio": "HH:mm",
    "reportarErrores": boolean,
    "frecuenciaReporte": number
  }
}
```

**Response (201 Created):**
```json
{
  "exitoso": true,
  "mensaje": "Pantalla registrada exitosamente",
  "datos": {
    "id": "string",
    "codigo": "string",
    "nombre": "string",
    "estado": "desconectada",
    "tokenDispositivo": "string (JWT para autenticar la Raspberry Pi)"
  }
}
```

### 3.2 Listar Pantallas
**Endpoint:** `GET /pantallas`

**Permisos:** Usuario, Admin, Técnico

**Query Params:**
- `pagina`: number
- `tamaño`: number
- `estado`: "conectada | desconectada | error | mantenimiento | inactiva"
- `ciudad`: string
- `zona`: string
- `busqueda`: string

**Response:**
```json
{
  "exitoso": true,
  "datos": {
    "items": [
      {
        "id": "string",
        "codigo": "string",
        "nombre": "string",
        "estado": "string",
        "ubicacion": {},
        "ultimaConexion": "date",
        "estadisticas": {
          "tiempoEncendido": number,
          "contenidosReproducidos": number,
          "campañasActivas": number
        }
      }
    ],
    "total": number,
    "pagina": number,
    "totalPaginas": number
  }
}
```

### 3.3 Obtener Detalles de Pantalla
**Endpoint:** `GET /pantallas/{id}`

### 3.4 Actualizar Pantalla
**Endpoint:** `PUT /pantallas/{id}`

**Permisos:** Admin, Técnico

### 3.5 Eliminar Pantalla
**Endpoint:** `DELETE /pantallas/{id}`

**Permisos:** Admin

### 3.6 Enviar Comando a Pantalla
**Endpoint:** `POST /pantallas/{id}/comandos`

**Permisos:** Admin, Técnico

**Request Body:**
```json
{
  "comando": "reiniciar | apagar | encender | sincronizar | actualizar",
  "parametros": {}
}
```

### 3.7 Obtener Estado de Conexión en Tiempo Real
**Endpoint:** `GET /pantallas/{id}/estado-conexion`

**Response:**
```json
{
  "exitoso": true,
  "datos": {
    "pantallaId": "string",
    "conectada": boolean,
    "latencia": number,
    "ultimoPing": "date",
    "version": "string"
  }
}
```

## 4. Gestión de Contenido para Pantallas

### 4.1 Publicar Contenido
**Endpoint:** `POST /contenidos`

**Permisos:** Usuario, Admin

**Request Body:**
```json
{
  "titulo": "string",
  "descripcion": "string",
  "tipo": "imagen | video | texto | html",
  "archivoUrl": "string (URL de Cloudinary u otro CDN)",
  "duracion": number (segundos, para videos e imágenes),
  "configuracion": {
    "efectoTransicion": "fade | slide | zoom | none",
    "repetir": boolean,
    "prioridad": number (1-10)
  },
  "pantallasAsignadas": ["string"] (IDs de pantallas)
}
```

**Response (201 Created):**
```json
{
  "exitoso": true,
  "mensaje": "Contenido publicado exitosamente",
  "datos": {
    "id": "string",
    "titulo": "string",
    "estado": "activo",
    "fechaCreacion": "date"
  }
}
```

### 4.2 Listar Contenidos del Usuario
**Endpoint:** `GET /contenidos`

**Permisos:** Usuario (solo ve sus contenidos), Admin (ve todos)

**Query Params:**
- `pagina`: number
- `tamaño`: number
- `tipo`: string
- `estado`: "activo | inactivo | programado"

### 4.3 Actualizar Contenido
**Endpoint:** `PUT /contenidos/{id}`

### 4.4 Eliminar Contenido
**Endpoint:** `DELETE /contenidos/{id}`

### 4.5 Asignar Contenido a Pantallas
**Endpoint:** `POST /contenidos/{id}/asignar-pantallas`

**Request Body:**
```json
{
  "pantallasIds": ["string"],
  "programacion": {
    "fechaInicio": "date",
    "fechaFin": "date",
    "horariosActivos": [
      {
        "diaSemana": number,
        "horaInicio": "HH:mm",
        "horaFin": "HH:mm"
      }
    ]
  }
}
```

## 5. API para Raspberry Pi (Player)

### 5.1 Autenticación del Dispositivo
**Endpoint:** `POST /dispositivos/autenticar`

**Request Body:**
```json
{
  "codigo": "string (código único de la pantalla)",
  "tokenDispositivo": "string (JWT generado al registrar)"
}
```

**Response:**
```json
{
  "exitoso": true,
  "datos": {
    "tokenAcceso": "string (JWT con larga duración)",
    "configuracion": {},
    "urlWebSocket": "string"
  }
}
```

### 5.2 Obtener Playlist de Contenidos
**Endpoint:** `GET /dispositivos/playlist`

**Headers:** `Authorization: Bearer {tokenDispositivo}`

**Response:**
```json
{
  "exitoso": true,
  "datos": {
    "contenidos": [
      {
        "id": "string",
        "titulo": "string",
        "tipo": "imagen | video | html",
        "url": "string",
        "duracion": number,
        "orden": number,
        "configuracion": {}
      }
    ],
    "ultimaActualizacion": "date"
  }
}
```

### 5.3 Reportar Estado del Dispositivo
**Endpoint:** `POST /dispositivos/estado`

**Headers:** `Authorization: Bearer {tokenDispositivo}`

**Request Body:**
```json
{
  "estado": "conectada | error",
  "cpu": number (porcentaje),
  "memoria": number (porcentaje),
  "temperatura": number,
  "contenidoActual": "string (ID)",
  "errores": ["string"]
}
```

### 5.4 Registrar Reproducción
**Endpoint:** `POST /dispositivos/reproduccion`

**Headers:** `Authorization: Bearer {tokenDispositivo}`

**Request Body:**
```json
{
  "contenidoId": "string",
  "fechaInicio": "date",
  "fechaFin": "date",
  "completada": boolean
}
```

## 6. WebSocket para Actualizaciones en Tiempo Real

### 6.1 Conexión WebSocket
**URL:** `ws://tudominio.com/ws`

**Autenticación:** Query param `?token={JWT}`

### 6.2 Eventos que el servidor debe emitir:

#### Para Pantallas (Raspberry Pi):
```javascript
{
  "tipo": "ACTUALIZAR_PLAYLIST",
  "datos": {
    "contenidos": []
  }
}

{
  "tipo": "COMANDO",
  "datos": {
    "comando": "reiniciar",
    "parametros": {}
  }
}
```

#### Para Dashboard (Usuarios):
```javascript
{
  "tipo": "ESTADO_PANTALLA",
  "datos": {
    "pantallaId": "string",
    "estado": "conectada",
    "timestamp": "date"
  }
}

{
  "tipo": "NUEVA_REPRODUCCION",
  "datos": {
    "contenidoId": "string",
    "pantallaId": "string"
  }
}
```

## 7. Estadísticas y Reportes

### 7.1 Estadísticas del Usuario
**Endpoint:** `GET /estadisticas/usuario`

**Response:**
```json
{
  "exitoso": true,
  "datos": {
    "totalContenidos": number,
    "reproducciones": number,
    "pantallasActivas": number,
    "tiempoTotalReproduccion": number
  }
}
```

### 7.2 Estadísticas por Contenido
**Endpoint:** `GET /estadisticas/contenido/{id}`

### 7.3 Estadísticas por Pantalla
**Endpoint:** `GET /estadisticas/pantalla/{id}`

## Configuración de Correo Electrónico

Para el envío de correos (recuperación de contraseña), configurar:

**Opción 1: SendGrid**
```env
SENDGRID_API_KEY=tu_api_key
FROM_EMAIL=noreply@innoad.com
```

**Opción 2: Nodemailer con Gmail/SMTP**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_app
FROM_EMAIL=noreply@innoad.com
```

## Plantilla de Correo para Recuperación

**Asunto:** Recuperación de Contraseña - InnoAd

**Cuerpo:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Recuperar Contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); padding: 40px; border-radius: 10px; text-align: center;">
        <h1 style="color: #00d9ff; margin-bottom: 20px;">InnoAd</h1>
        <h2 style="color: #ffffff;">Recuperación de Contraseña</h2>
        <p style="color: #b4b8d0; font-size: 16px; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        </p>
        <p style="color: #b4b8d0; font-size: 16px; line-height: 1.6;">
            Haz clic en el botón de abajo para crear una nueva contraseña:
        </p>
        <a href="{{enlace_recuperacion}}"
           style="display: inline-block; margin: 30px 0; padding: 15px 40px; background: linear-gradient(135deg, #00d9ff, #ff006a); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Restablecer Contraseña
        </a>
        <p style="color: #b4b8d0; font-size: 14px;">
            O copia y pega este enlace en tu navegador:
        </p>
        <p style="color: #00d9ff; font-size: 12px; word-break: break-all;">
            {{enlace_recuperacion}}
        </p>
        <p style="color: #ff4444; font-size: 14px; margin-top: 30px;">
            Este enlace expirará en 1 hora.
        </p>
        <p style="color: #b4b8d0; font-size: 12px; margin-top: 30px;">
            Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
        </p>
    </div>
</body>
</html>
```

## Seguridad y Consideraciones

1. **Rate Limiting:** Implementar límites de tasa para endpoints sensibles:
   - Login: 5 intentos por minuto
   - Registro: 3 por hora por IP
   - Recuperación: 3 por hora por email

2. **Validación de Datos:** Sanitizar todas las entradas del usuario

3. **CORS:** Configurar CORS apropiadamente

4. **HTTPS:** Todos los endpoints deben usar HTTPS en producción

5. **Tokens JWT:**
   - Token de acceso: 1 hora
   - Refresh token: 7 días
   - Token de recuperación: 1 hora

6. **Hash de Contraseñas:** Usar bcrypt con salt rounds >= 10

## Prioridad de Implementación

### Alta Prioridad (Para funcionamiento básico):
1. ✅ Registro de usuarios (`POST /autenticacion/registrarse`)
2. ✅ Recuperación de contraseña (`POST /autenticacion/recuperar-contrasena`)
3. ✅ Restablecer contraseña (`POST /autenticacion/restablecer-contrasena`)
4. Gestión de pantallas (`POST, GET, PUT, DELETE /pantallas`)
5. Publicación de contenido (`POST, GET /contenidos`)
6. API para Raspberry Pi (`POST /dispositivos/autenticar`, `GET /dispositivos/playlist`)

### Media Prioridad:
7. WebSocket para actualizaciones en tiempo real
8. Comandos a pantallas
9. Estadísticas básicas

### Baja Prioridad:
10. Reportes avanzados
11. Programación de contenidos
12. Gestión de campañas

## Notas Finales

- Todos los endpoints deben devolver respuestas consistentes con el formato `RespuestaAPI<T>`
- Implementar logging apropiado para debugging
- Considerar implementar un dashboard de monitoreo para las Raspberry Pi
- Documentar la API con Swagger/OpenAPI
