# Requisitos del Backend para Integración con Frontend InnoAd

## 📋 Resumen ejecutivo
El frontend Angular está desplegado y espera que el backend Spring Boot esté disponible en:
- **Base URL:** `http://localhost:8080/api/v1`
- **WebSocket:** `ws://localhost:8080/ws`
- **Health check:** `http://localhost:8080/actuator/health`

---

## 🔧 1. Configuración requerida del Backend

### 1.1 Puerto y Base Path
```yaml
# application.yml o application.properties
server:
  port: 8080
  servlet:
    context-path: /  # Sin prefijo adicional

# Base de todos los endpoints REST
# Controladores deben estar en: @RequestMapping("/api/v1/...")
```

### 1.2 CORS (Critical)
El backend **debe** permitir solicitudes desde:
- `http://localhost:4200` (dev Angular CLI)
- `http://localhost:8080` (frontend Docker)
- Tu dominio de producción

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:4200",
                "http://localhost:8080",
                "https://tu-dominio-prod.com"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 1.3 Actuator Health Endpoint
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: when-authorized
```

Debe responder en: `GET http://localhost:8080/actuator/health`
```json
{
  "status": "UP"
}
```

---

## 📡 2. Contrato de API REST

### 2.1 Wrapper estándar: `RespuestaAPI<T>`
**TODAS** las respuestas del backend deben seguir este formato:

```java
public class RespuestaAPI<T> {
    private boolean exitoso;
    private String mensaje;
    private T datos;
    
    // Constructor de éxito
    public static <T> RespuestaAPI<T> exito(T datos, String mensaje) {
        return new RespuestaAPI<>(true, mensaje, datos);
    }
    
    // Constructor de error
    public static <T> RespuestaAPI<T> error(String mensaje) {
        return new RespuestaAPI<>(false, mensaje, null);
    }
}
```

**Ejemplo de respuesta exitosa:**
```json
{
  "exitoso": true,
  "mensaje": "Campañas obtenidas correctamente",
  "datos": [
    { "id": 1, "nombre": "Campaña 1", ... }
  ]
}
```

**Ejemplo de respuesta con error:**
```json
{
  "exitoso": false,
  "mensaje": "Usuario no encontrado",
  "datos": null
}
```

---

## 🔐 3. Autenticación JWT (CRÍTICO)

### 3.1 Endpoints de Autenticación
Deben estar disponibles bajo `/api/v1/autenticacion/`:

#### `POST /api/v1/autenticacion/iniciar-sesion`
**Request:**
```json
{
  "nombreUsuarioOEmail": "admin",
  "contrasena": "Admin123!",
  "recordarme": true
}
```

**Response exitosa:**
```json
{
  "exitoso": true,
  "mensaje": "Inicio de sesión exitoso",
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenActualizacion": "refresh-token-aqui",
    "expiraEn": 3600,
    "usuario": {
      "id": 1,
      "nombreUsuario": "admin",
      "email": "admin@innoad.com",
      "rol": {
        "id": 1,
        "nombre": "Administrador"
      },
      "permisos": [
        { "id": 1, "nombre": "ADMIN_PANEL_VER" },
        { "id": 2, "nombre": "CAMPANAS_CREAR" }
      ]
    }
  }
}
```

**Campos clave:**
- `token`: JWT de acceso (Bearer)
- `tokenActualizacion`: Refresh token
- `expiraEn`: Segundos hasta expiración (usado para refresh automático)
- `usuario.rol.nombre`: Roles como `"Administrador"`, `"Empresa"`, `"Usuario"`
- `usuario.permisos[].nombre`: Array de strings con permisos

#### `POST /api/v1/autenticacion/refrescar-token`
**Request:**
```json
{
  "tokenActualizacion": "refresh-token-aqui"
}
```

**Response:**
```json
{
  "exitoso": true,
  "mensaje": "Token refrescado",
  "datos": {
    "token": "nuevo-jwt-aqui",
    "tokenActualizacion": "nuevo-refresh-token",
    "expiraEn": 3600
  }
}
```

#### `POST /api/v1/autenticacion/cerrar-sesion`
**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "exitoso": true,
  "mensaje": "Sesión cerrada correctamente",
  "datos": null
}
```

### 3.2 Validación de Token
El backend debe:
1. **Aceptar** header `Authorization: Bearer {token}` en TODAS las rutas protegidas.
2. **Excluir** autenticación en:
   - `/api/v1/autenticacion/**` (login, registro, recuperación)
   - `/actuator/health`
3. **Retornar 401** si el token es inválido/expirado.

---

## 👥 4. Usuarios Semilla (Requeridos)

El backend debe crear estos usuarios al iniciar (si no existen):

```java
// Usuario 1: Administrador
{
  "nombreUsuario": "admin",
  "email": "admin@innoad.com",
  "contrasena": "Admin123!",  // BCrypt hash
  "rol": "Administrador",
  "permisos": ["ADMIN_PANEL_VER", "CAMPANAS_CREAR", "CAMPANAS_EDITAR", 
               "PANTALLAS_CREAR", "CONTENIDOS_CREAR", "REPORTES_VER"]
}

// Usuario 2: Empresa
{
  "nombreUsuario": "empresa",
  "email": "empresa@innoad.com",
  "contrasena": "Empresa123!",
  "rol": "Empresa",
  "permisos": ["CAMPANAS_CREAR", "CAMPANAS_EDITAR", "CONTENIDOS_CREAR"]
}

// Usuario 3: Usuario estándar
{
  "nombreUsuario": "usuario",
  "email": "usuario@innoad.com",
  "contrasena": "Usuario123!",
  "rol": "Usuario",
  "permisos": ["CAMPANAS_VER", "CONTENIDOS_VER"]
}
```

---

## 📦 5. Endpoints adicionales esperados

### Campañas
- `GET /api/v1/campanas` → Lista todas las campañas
- `POST /api/v1/campanas` → Crea una campaña
- `GET /api/v1/campanas/{id}` → Obtiene campaña por ID
- `PUT /api/v1/campanas/{id}` → Actualiza campaña
- `DELETE /api/v1/campanas/{id}` → Elimina campaña

### Pantallas
- `GET /api/v1/pantallas` → Lista todas las pantallas
- `POST /api/v1/pantallas` → Registra una pantalla
- `GET /api/v1/pantallas/{id}` → Obtiene pantalla por ID
- `PUT /api/v1/pantallas/{id}` → Actualiza pantalla
- `DELETE /api/v1/pantallas/{id}` → Elimina pantalla

### Contenidos
- `GET /api/v1/contenidos` → Lista todos los contenidos
- `POST /api/v1/contenidos` → Sube un contenido (multipart/form-data)
- `GET /api/v1/contenidos/{id}` → Obtiene contenido por ID
- `DELETE /api/v1/contenidos/{id}` → Elimina contenido

### Estadísticas
- `GET /api/v1/estadisticas/dashboard` → Stats del dashboard
- `GET /api/v1/estadisticas/campanas/{id}` → Stats de una campaña
- `GET /api/v1/estadisticas/pantallas/{id}` → Stats de una pantalla

### Agente IA (opcional)
- `POST /api/v1/agente-ia/optimizar-contenido` → Optimiza contenido con IA
- `POST /api/v1/agente-ia/sugerir-horarios` → Sugiere horarios óptimos

**Todas las respuestas deben usar `RespuestaAPI<T>`.**

---

## 🚀 6. Despliegue del Backend con Docker (recomendado)

### Opción A: Backend independiente
Tu backend corre en `http://localhost:8080`, el frontend proxea desde Docker.

### Opción B: Backend + Frontend en Compose
Añade el backend al `docker-compose.yml` del frontend:

```yaml
services:
  backend:
    build:
      context: ../innoadBackend  # Ruta a tu repo de backend
      dockerfile: Dockerfile
    image: innoad-backend:latest
    container_name: innoad-backend
    environment:
      - SERVER_PORT=8080
      - SPRING_PROFILES_ACTIVE=prod
      - INNOAD_JWT_SECRET=${JWT_SECRET}
      - INNOAD_CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
    ports:
      - "8081:8080"
    expose:
      - "8080"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 5
```

### Dockerfile del Backend (ejemplo)
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## ✅ 7. Checklist de verificación

Antes de decir que el backend está listo:

- [ ] El backend arranca en puerto **8080** sin errores
- [ ] `GET http://localhost:8080/actuator/health` devuelve `{"status":"UP"}`
- [ ] CORS permite `http://localhost:4200` y `http://localhost:8080`
- [ ] Endpoint `POST /api/v1/autenticacion/iniciar-sesion` funciona con `admin / Admin123!`
- [ ] Respuesta de login incluye `token`, `tokenActualizacion`, `expiraEn` y objeto `usuario`
- [ ] Refresh token funciona: `POST /api/v1/autenticacion/refrescar-token`
- [ ] Todas las rutas protegidas aceptan `Authorization: Bearer {token}`
- [ ] Respuestas siguen formato `RespuestaAPI<T>` (`exitoso`, `mensaje`, `datos`)
- [ ] Usuarios semilla (admin, empresa, usuario) existen en BD
- [ ] Endpoints de campañas, pantallas, contenidos y estadísticas responden correctamente

---

## 🧪 8. Pruebas con curl

```cmd
REM 1. Health check
curl -i http://localhost:8080/actuator/health

REM 2. Login
curl -i -X POST http://localhost:8080/api/v1/autenticacion/iniciar-sesion ^
  -H "Content-Type: application/json" ^
  -d "{\"nombreUsuarioOEmail\":\"admin\",\"contrasena\":\"Admin123!\",\"recordarme\":true}"

REM 3. Obtener campañas (reemplaza TOKEN)
curl -i http://localhost:8080/api/v1/campanas ^
  -H "Authorization: Bearer {TOKEN}"
```

---

## 📞 Contacto y soporte

Si encuentran problemas:
1. Revisar logs del backend: errores de CORS, JWT, rutas no encontradas.
2. Validar que el contrato `RespuestaAPI<T>` se cumple en TODAS las respuestas.
3. Confirmar que los usuarios semilla tienen las contraseñas exactas (`Admin123!`, etc.).
4. Verificar que `expiraEn` sea un número (segundos), no una fecha ISO.

**Plantilla CI/CD para backend:** `docs/backend-ci-template.yml`

---

## 🎯 Resultado esperado

Una vez implementado lo anterior:
1. Usuario abre http://localhost:8080
2. Ingresa `admin / Admin123!`
3. Login exitoso → Token almacenado → Refresh automático cada ~50 minutos
4. Dashboard carga campañas, pantallas y estadísticas
5. Sin errores CORS ni 401 inesperados

**¡El frontend está listo y esperando! 🚀**
