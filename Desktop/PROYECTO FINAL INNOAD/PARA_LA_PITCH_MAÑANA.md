# 🚀 InnoAd - LISTO PARA PITCH MAÑANA ✅

**Fecha:** 16 de Febrero 2026
**Estado:** ✅ **100% LISTO PARA DEMOSTRACIÓN**

---

## ⚡ INICIO RÁPIDO (Hacer ESTO primero)

### **Opción 1: AUTOMÁTICO (Recomendado - Sin riesgo)**

Haz doble clic en este archivo:
```
📁 PROYECTO FINAL INNOAD
  └─ INICIAR_INNOAD.bat ← AQUÍ
```

**Eso es todo.** Espera 15 segundos y abre: `http://localhost:4200`

---

### **Opción 2: Manual (Si necesitas ver logs)**

Abre 3 terminales (CMD o PowerShell):

**Terminal 1 - Backend:**
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND"
java -jar target\innoad-backend-2.0.0.jar --spring.profiles.active=server
```
Espera a ver: `Application started successfully` ✅

**Terminal 2 - Frontend:**
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
ng serve
```
Espera a ver: `Local: http://localhost:4200` ✅

**Terminal 3 - PostgreSQL (Solo si no está corriendo):**
```bash
powershell -Command "Get-Service -Name 'postgresql*' | Start-Service"
```

---

## 🔐 CREDENCIALES PARA LOGIN

| Rol | Usuario | Contraseña | Acceso |
|-----|---------|-----------|---------|
| 👑 **Admin** | `admin` | `Admin123!` | Todo el sistema |
| 🔧 **Técnico** | `tecnico` | `Tecnico123!` | Panel técnico + pantallas |
| 👤 **Usuario** | `usuario` | `Usuario123!` | Campañas + contenido |

---

## 🎯 QUÉ VERIFICAR DESPUÉS DE INICIAR

### ✅ Checklist Pre-Pitch (30 segundos)

- [ ] Backend corriendo: `http://localhost:8080/actuator/health` → status: UP
- [ ] Frontend cargando: `http://localhost:4200` → sin errores rojos en consola
- [ ] Puedo loguearme con `admin / Admin123!`
- [ ] Veo toggle 🌙☀️ en esquina derecha del navbar
- [ ] Puedo ir a `/tecnico` y ver 5 pestañas sin errores

---

## 🎬 DEMO SCRIPT PARA MAÑANA (8 minutos)

### **1️⃣ Inicio (30 seg)**
```
1. Mostrar landing page
2. Mencionar: "InnoAd - Plataforma de publicidad digital"
3. Click "Entrar" o "Login"
```

### **2️⃣ Autenticación (1 min)**
```
1. Login como ADMIN: admin / Admin123!
2. Mostrar dashboard
3. ⭐ TOGGLE DARK MODE: Click en 🌙 (esquina derecha navbar)
   - Muestra: "Implementé tema claro/oscuro con persistencia"
```

### **3️⃣ Panel Técnico (2 min)**
```
1. Click en "Panel Técnico" en navbar
2. Mostrar 5 pestañas:
   ✓ 📋 Revisar Contenido (vacío es normal)
   ✓ 📺 Pantallas Conectadas (3 pantallas de ejemplo)
   ✓ 🗺️ Mapa de Ubicaciones (mapa de Quindío)
   ✓ 📦 Inventario (equipos disponibles)
   ✓ 💬 Chat Soporte (usuario en línea)
```

### **4️⃣ Sistema de Pagos (2 min)**
```
1. Ir a "Campañas"
2. Click en "Agregar al Carrito"
3. Mostrar carrito:
   - Cálculo automático: Subtotal + IVA (19%)
   - 4 métodos de pago:
     • Tarjeta de crédito
     • Transferencia bancaria
     • Nequi/Daviplata
     • 🔑 Código de Pago (NUEVO - cambio realizado)
```

### **5️⃣ Perfil de Usuario (1 min)**
```
1. Click en avatar (esquina derecha dropdown)
2. Click "Editar Mi Perfil"
3. Mostrar:
   - Subir foto de perfil
   - Editar email/teléfono/dirección
   - SCROLL DOWN para ver botón "Guardar Cambios"
```

### **6️⃣ Dark Mode (30 seg)**
```
1. Click toggle 🌙 en navbar
2. Muestra: "Modo oscuro con transiciones suaves"
3. Click ☀️ para volver a claro
4. Mencionar: "Se guarda automáticamente en navegador"
```

**Total: ~8 minutos de demostración impactante**

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────┐
│  FRONTEND (Angular 18.2.14)             │
│  - Standalone components                │
│  - Signals para state reactivo          │
│  - Dark mode con CSS variables          │
│  - RolGuard para protección de rutas    │
└──────────┬──────────────────────────────┘
           │ HTTP + JWT
           ↓
┌─────────────────────────────────────────┐
│  BACKEND (Java 21 / Spring Boot 3.5.8)  │
│  - REST API con 13+ endpoints           │
│  - JWT authentication                   │
│  - Transacciones ACID                   │
│  - Role-based access control            │
└──────────┬──────────────────────────────┘
           │ JDBC
           ↓
┌─────────────────────────────────────────┐
│  DATABASE (PostgreSQL en puerto 5433)    │
│  - Usuarios, Roles, Pagos               │
│  - Campañas, Contenidos, Pantallas      │
│  - Índices de optimización              │
└─────────────────────────────────────────┘
```

---

## ✨ FUNCIONALIDADES IMPLEMENTADAS HOY

| Característica | Estado | Detalles |
|---|---|---|
| **Dark Mode Toggle** | ✅ | 🌙☀️ en navbar, persiste en localStorage |
| **Sistema de Pagos** | ✅ | 4 métodos: tarjeta, transferencia, Nequi, código |
| **Panel Técnico** | ✅ | 5 pestañas: contenido, pantallas, mapa, inventario, chat |
| **Editar Perfil** | ✅ | Foto, email, teléfono, dirección con scroll correcto |
| **Error Handling** | ✅ | 404s silenciosos para endpoints opcionales |
| **Autenticación** | ✅ | 3 roles con permisos diferenciados |

---

## 🚨 SI ALGO FALLA (Plan B)

### **"No se puede acceder a este sitio"**
```
1. Verifica que Backend esté corriendo (Terminal debería mostrar "Application started")
2. Verifica PostgreSQL: powershell -Command "Get-Service postgresql* | Start-Service"
3. Espera 10 segundos y recarga la página
```

### **"El recurso solicitado no fue encontrado"**
```
✓ Esto es NORMAL - son endpoints viejos que se ignoran automáticamente
✓ No afecta la funcionalidad del sistema
```

### **"No tienes permisos para acceder"**
```
1. Verifica que estés logueado como el rol correcto
2. Panel Técnico: solo TECNICO y ADMIN pueden entrar
3. Intenta con: tecnico / Tecnico123!
```

### **Dark Mode no se ve**
```
1. Abre DevTools (F12)
2. Ve a Application → LocalStorage
3. Busca "tema-innoad"
4. Recarga la página (Ctrl+F5)
```

---

## 📋 LISTA DE VERIFICACIÓN FINAL (Antes de la demo)

30 minutos antes de empezar:

```
☐ PostgreSQL corriendo (Terminal dice "Running")
☐ Backend en puerto 8080 (URL: http://localhost:8080/actuator/health)
☐ Frontend en puerto 4200 (URL: http://localhost:4200)
☐ Puedo loguearme con admin / Admin123!
☐ Veo el toggle 🌙☀️ en la esquina derecha
☐ Puedo ir a /tecnico y ver 5 pestañas sin errores
☐ Puedo editar perfil y scrollear hasta el botón Guardar
☐ Puedo ver carrito y los 4 métodos de pago
☐ Internet está funcionando (para mostrar app en tiempo real)
☐ Micrófono y cámara funcionan (si vas a hacer presentación por video)
```

---

## 💻 ACCESOS RÁPIDOS

| Recurso | URL/Comando |
|---|---|
| **Frontend** | http://localhost:4200 |
| **Backend Health** | http://localhost:8080/actuator/health |
| **pgAdmin4** | http://localhost:5050 |
| **Iniciar todo** | Doble clic en `INICIAR_INNOAD.bat` |
| **Verificar sistema** | Doble clic en `VERIFICAR_SISTEMA.bat` |

---

## 🎓 NOTAS IMPORTANTES

1. **Métodos de Pago**: No están integrados con gateways reales (Stripe, Nequi, etc.) - esto es MVP esperado.

2. **Base de Datos**: Los datos persisten en PostgreSQL. Si cierras el backend, los datos se mantienen.

3. **Tokens JWT**: Duración limitada. Si expira durante demo, simplemente logout y login de nuevo.

4. **Dark Mode**: Se guarda en localStorage. Funciona sin refresco.

5. **Panel Técnico**: Solo TECNICO y ADMIN pueden acceder. Usa credenciales correctas.

---

## 🏆 RESUMEN FINAL

✅ Sistema compilado sin errores
✅ Backend y Frontend funcionan juntos
✅ PostgreSQL conectado correctamente
✅ Autenticación con 3 roles implementada
✅ Dark mode con persistencia
✅ Panel Técnico con 5 pestañas
✅ Sistema de Pagos con 4 métodos
✅ Editar Perfil con scroll correcto
✅ Error handling mejorado

---

## 📞 SOPORTE RÁPIDO

Si algo falla:
1. Cierra todas las ventanas
2. Ejecuta `INICIAR_INNOAD.bat` nuevamente
3. Espera 20 segundos
4. Abre http://localhost:4200

---

**¡Buena suerte con tu pitch mañana! 🚀**

El sistema está 100% listo. Simplemente ejecuta el script, espera 15 segundos y demuestra.
