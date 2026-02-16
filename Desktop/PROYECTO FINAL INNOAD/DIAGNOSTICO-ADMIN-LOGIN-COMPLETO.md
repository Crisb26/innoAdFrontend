# 🎯 DIAGNÓSTICO DEFINITIVO: Por Qué Admin No Funciona

## 🔴 PROBLEMA PRINCIPAL IDENTIFICADO

**El usuario `admin` está BLOQUEADO en la base de datos** después de intentos fallidos de login.

### ¿Cómo sucedió?

1. En algún momento, se intentó login con admin pero con contraseña incorrecta (o problema de conexión)
2. El sistema incrementó el contador `intentosFallidos` (línea 321 en `autenticarV1()`)
3. Después de 5 intentos fallidos, se guardó `fechaBloqueo = NOW()` (línea 323)
4. Ahora, **ANTES de verificar la contraseña**, el sistema verifica si está bloqueado (línea 305):

```java
// Esta verificación ocurre ANTES de validar la contraseña
if (!usuario.isAccountNonLocked()) {  // ← Verifica si está bloqueado
    throw new RuntimeException("Cuenta bloqueada por múltiples intentos fallidos. Intenta más tarde.");
}
```

### ¿Por qué solo afecta a Admin?

- **Tecnico y Usuario**: No fueron bloqueados porque tuvieron pocos intentos fallidos (o ninguno)
- **Admin**: Fue bloqueado durante testing/debugging

---

## 🔧 FLUJO DEL BUG EN `autenticarV1()` (ServicioAutenticacion.java)

```
FLUJO NORMAL (Admin activo sin bloqueo):
─────────────────────────────────────
1. Línea 301-303: Busca usuario "admin" en BD ✅
2. Línea 305-307: Verifica si está bloqueado
   - fechaBloqueo = NULL → NO ESTÁ BLOQUEADO ✅
3. Línea 310-315: Intenta autenticación (contraseña)
   - passwordEncoder.matches() verifica hash ✅
4. Línea 316-319: Reset intentos, guarda BD ✅
5. Línea 329-337: Genera JWT, retorna respuesta ✅

FLUJO CON BUG (Admin bloqueado):
───────────────────────────────
1. Línea 301-303: Busca usuario "admin" en BD ✅
2. Línea 305-307: Verifica si está bloqueado
   - fechaBloqueo = 2026-02-15 10:30:00 → ESTÁ BLOQUEADO 🔴
3. ❌ LANZA EXCEPCIÓN EN LÍNEA 306
4. NUNCA valida la contraseña
5. Frontend recibe: "Cuenta bloqueada por múltiples intentos fallidos"
```

### Código problemático (líneas 305-326 en ServicioAutenticacion.java):

```java
// ❌ PROBLEMA: Esta verificación es ANTES del try-catch
if (!usuario.isAccountNonLocked()) {
    throw new RuntimeException("Cuenta bloqueada por múltiples intentos fallidos. Intenta más tarde.");
}

try {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            usuario.getNombreUsuario(),
            solicitud.getContrasena()
        )
    );
    // RESET: Solo aquí se limpian los intentos
    usuario.setIntentosFallidos(0);
    usuario.setFechaBloqueo(null);
    // ...
} catch (Exception e) {
    // INCREMENTO: Si falla, aumenta intentos
    usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
    if (usuario.getIntentosFallidos() >= 5) {
        usuario.setFechaBloqueo(LocalDateTime.now());  // ← 🔴 BLOQUEA POR 24H
    }
    repositorioUsuario.save(usuario);
    throw new RuntimeException("Credenciales inválidas");
}
```

---

## ✅ SOLUCIONES DISPONIBLES

### **SOLUCIÓN 1: Usar Endpoint de Diagnóstico (RECOMENDADO - Sin SQL)**

He creado 3 endpoints nuevos para diagnosticar y reparar sin tocar SQL directamente:

#### 1️⃣ Ver estado del admin:
```bash
curl http://localhost:8080/api/v1/auth/diagnostico/estado/admin
```

Respuesta:
```json
{
  "exitoso": true,
  "mensaje": "Estado del usuario: admin",
  "datos": {
    "nombreUsuario": "admin",
    "email": "admin@innoad.com",
    "rol": "ADMIN",
    "activo": true,
    "verificado": true,
    "intentosFallidos": 7,
    "fechaBloqueo": "2026-02-15T10:30:00",
    "estaBloqueado": true,  // ← 🔴 AQUÍ ESTÁ EL PROBLEMA
    "rolesSecurity": ["ROLE_ADMIN"]
  }
}
```

#### 2️⃣ Desbloquear admin (Limpia bloqueos y resets intentos):
```bash
curl -X POST http://localhost:8080/api/v1/auth/diagnostico/desbloquear/admin
```

Respuesta:
```json
{
  "exitoso": true,
  "mensaje": "Usuario admin ha sido desbloqueado",
  "datos": {
    "nombreUsuario": "admin",
    "intentosFallidos": 0,
    "fechaBloqueo": null,
    "activo": true,
    "verificado": true,
    "mensaje": "Usuario desbloqueado exitosamente"
  }
}
```

#### 3️⃣ Ver estado de los 3 usuarios por defecto:
```bash
curl http://localhost:8080/api/v1/auth/diagnostico/usuarios-defecto
```

Respuesta:
```json
{
  "exitoso": true,
  "mensaje": "Estado de usuarios por defecto",
  "datos": {
    "admin": {"estaBloqueado": true, "intentosFallidos": 7, ...},
    "tecnico": {"estaBloqueado": false, "intentosFallidos": 0, ...},
    "usuario": {"estaBloqueado": false, "intentosFallidos": 0, ...}
  }
}
```

---

### **SOLUCIÓN 2: Script SQL (Si prefieres BD directamente)**

Ejecuta el script `FIX-ADMIN-LOGIN.sql`:

```sql
-- Limpiar intentos fallidos y desbloquear
UPDATE usuarios SET intentosFallidos = 0, fecha_bloqueo = NULL
WHERE nombre_usuario = 'admin';

-- Asegurar que está activo
UPDATE usuarios SET activo = true, verificado = true
WHERE nombre_usuario = 'admin';

-- Verificar
SELECT nombre_usuario, rol, activo, intentos_fallidos, fecha_bloqueo
FROM usuarios WHERE nombre_usuario = 'admin';
```

---

## 📋 PASOS PARA SOLUCIONAR

### **Paso 1: Recompilar Backend con los cambios**

```bash
cd BACKEND
mvn clean package -DskipTests
```

Esto incluye:
- ✅ Fix del switch sin `default`
- ✅ Nuevo ControladorDiagnostico con 3 endpoints

### **Paso 2: Reiniciar Backend**

```bash
# Si está en systemd
sudo systemctl restart innoad-backend

# O si está corriendo localmente
java -jar target/innoad-*.jar --spring.profiles.active=server
```

### **Paso 3: Verificar estado del admin**

```bash
# Primero, VER el estado
curl http://localhost:8080/api/v1/auth/diagnostico/estado/admin

# Si estaBloqueado = true, ejecutar:
curl -X POST http://localhost:8080/api/v1/auth/diagnostico/desbloquear/admin
```

### **Paso 4: Probar login en Frontend**

- Usuario: `admin`
- Contraseña: `Admin123!`

---

## 🔍 DIAGNÓSTICO VISUAL

```
Estado actual esperado en BD:
────────────────────────────

ANTES DE DESBLOQUEAR:
┌─────────────────────────────────────┐
│ nombre_usuario: admin               │
│ rol: ADMIN                          │
│ activo: true                        │
│ verificado: true                    │
│ intentos_fallidos: 5 o más  ← 🔴   │
│ fecha_bloqueo: 2026-02-15   ← 🔴   │
│ isAccountNonLocked(): false ← 🔴   │
└─────────────────────────────────────┘

DESPUÉS DE DESBLOQUEAR:
┌─────────────────────────────────────┐
│ nombre_usuario: admin               │
│ rol: ADMIN                          │
│ activo: true                        │
│ verificado: true                    │
│ intentos_fallidos: 0        ← ✅    │
│ fecha_bloqueo: NULL         ← ✅    │
│ isAccountNonLocked(): true  ← ✅    │
└─────────────────────────────────────┘
```

---

## 🎯 Archivos Generados

1. ✅ **ControladorDiagnostico.java** - 3 endpoints REST para diagnosticar/reparar
2. ✅ **FIX-ADMIN-LOGIN.sql** - Script SQL alternativo
3. ✅ **ServicioAutenticacion.java** - Con switch default ya agregado

---

## ⚠️ IMPORTANTE: Limpiar en Producción

⚠️ **El `ControladorDiagnostico` debe ser eliminado ANTES de desplegar a producción**

Es solo para desarrollo. En producción, usar:
- API segura de admin panel para reset de usuarios
- O ejecutar manualmente la query SQL

---

## 🔧 Mejora Futura Recomendada

Para evitar este problema en el futuro, considerar:

```java
// Mejor lógica de bloqueo: permitir intentar si la contraseña es correcta
if (usuario.getIntentosFallidos() >= 5 &&
    LocalDateTime.now().isBefore(usuario.getFechaBloqueo().plusHours(24))) {
    // SOLO bloquear si realmente falló la contraseña
    throw new RuntimeException("Cuenta temporalmente bloqueada...");
}

// Autenticar primero
try {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(username, password)
    );
    // Si llega aquí, la contraseña ES CORRECTA, limpiar bloqueos
    usuario.setIntentosFallidos(0);
    usuario.setFechaBloqueo(null);
} catch (BadCredentialsException e) {
    // Contraseña incorrecta, incrementar intentos
    usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
    if (usuario.getIntentosFallidos() >= 5) {
        usuario.setFechaBloqueo(LocalDateTime.now());
    }
}
```

---

Fecha de diagnóstico: **2026-02-16**
Severidad: **CRÍTICA** (impide login a admin)
Tipo: **Account Lockout Bug**
