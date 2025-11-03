# RESUMEN: Qué decirle al equipo de Backend

## 🎯 Mensaje corto para el backend

> **"El frontend Angular está listo y desplegado. Necesitamos que el backend Spring Boot esté disponible en `http://localhost:8080/api/v1` con estos requisitos:**

---

## ✅ **Checklist mínima (lo ESENCIAL)**

### 1. **Puerto y CORS**
```yaml
# application.yml
server:
  port: 8080

# Permitir CORS desde:
# - http://localhost:4200 (dev Angular)
# - http://localhost:8080 (frontend Docker)
```

### 2. **Health check**
```
GET http://localhost:8080/actuator/health
→ Debe responder: {"status":"UP"}
```

### 3. **Formato de respuesta (CRÍTICO)**
**TODAS** las respuestas deben usar este wrapper:
```json
{
  "exitoso": true,
  "mensaje": "Operación exitosa",
  "datos": { ... }
}
```

### 4. **Login endpoint**
```
POST /api/v1/autenticacion/iniciar-sesion
Body: {
  "nombreUsuarioOEmail": "admin",
  "contrasena": "Admin123!",
  "recordarme": true
}

Respuesta esperada:
{
  "exitoso": true,
  "mensaje": "Login exitoso",
  "datos": {
    "token": "JWT-aqui",
    "tokenActualizacion": "refresh-token",
    "expiraEn": 3600,
    "usuario": {
      "id": 1,
      "nombreUsuario": "admin",
      "email": "admin@innoad.com",
      "rol": { "id": 1, "nombre": "Administrador" },
      "permisos": [
        { "id": 1, "nombre": "ADMIN_PANEL_VER" }
      ]
    }
  }
}
```

### 5. **Refresh token**
```
POST /api/v1/autenticacion/refrescar-token
Body: { "tokenActualizacion": "..." }

Respuesta:
{
  "exitoso": true,
  "mensaje": "Token refrescado",
  "datos": {
    "token": "nuevo-JWT",
    "tokenActualizacion": "nuevo-refresh",
    "expiraEn": 3600
  }
}
```

### 6. **Usuarios de prueba (semilla)**
Crear en BD si no existen:
- **admin** / Admin123! (rol: Administrador)
- **empresa** / Empresa123! (rol: Empresa)
- **usuario** / Usuario123! (rol: Usuario)

### 7. **Autorización**
- Todas las rutas protegidas deben aceptar: `Authorization: Bearer {token}`
- **NO** proteger: `/api/v1/autenticacion/**` y `/actuator/health`
- Si token inválido → devolver **401**

### 8. **Endpoints mínimos**
```
GET  /api/v1/campanas
POST /api/v1/campanas
GET  /api/v1/pantallas
GET  /api/v1/contenidos
GET  /api/v1/estadisticas/dashboard
```

**Todos con `RespuestaAPI<T>` wrapper.**

---

## 📄 Documentación completa

He creado un documento detallado con:
- Configuración completa de CORS
- Contrato de API con ejemplos
- Estructura de JWT y refresh
- Ejemplos de usuarios semilla
- Endpoints esperados
- Dockerfile de ejemplo
- Comandos curl para pruebas

**📁 Ubicación:** `docs/REQUISITOS-BACKEND.md`

---

## 🧪 Cómo probarlo

Una vez que el backend esté corriendo:

```cmd
REM 1. Verificar salud
curl http://localhost:8080/actuator/health

REM 2. Probar login
curl -X POST http://localhost:8080/api/v1/autenticacion/iniciar-sesion ^
  -H "Content-Type: application/json" ^
  -d "{\"nombreUsuarioOEmail\":\"admin\",\"contrasena\":\"Admin123!\",\"recordarme\":true}"
```

Si ambos funcionan → el frontend podrá conectarse sin problemas.

---

## 🚀 Resultado esperado

1. Usuario abre **http://localhost:8080**
2. Ingresa **admin / Admin123!**
3. Login exitoso → Dashboard cargado
4. Sin errores CORS ni 401

---

## 📞 Si hay problemas

Revisar:
- ✅ Backend en puerto 8080
- ✅ CORS permite localhost:4200 y localhost:8080
- ✅ Respuestas usan `{ exitoso, mensaje, datos }`
- ✅ Campo `expiraEn` es número (segundos), no fecha ISO
- ✅ Usuario `admin` existe con contraseña `Admin123!`

**El frontend está 100% listo. Solo falta que el backend implemente estos requisitos.** 🎯
