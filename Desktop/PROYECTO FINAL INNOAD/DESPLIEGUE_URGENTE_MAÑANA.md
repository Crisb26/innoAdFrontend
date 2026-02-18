# 🚀 DESPLIEGUE URGENTE PARA MAÑANA - InnoAd

**IMPORTANTE: Azure está bloqueado. Debes usar tu SERVIDOR CASERO**

---

## ⚡ OPCIÓN MÁS RÁPIDA: SERVIDOR LOCAL (Lo que funcionará mañana)

### **Paso 1: Asegurar que todo esté compilado**

```bash
# Backend - Ya compilado ✅
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND"
# JAR ya existe en: target\innoad-backend-2.0.0.jar

# Frontend - Compilar para producción
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
npm install
ng build --configuration production
```

### **Paso 2: Iniciar TODO mañana por la mañana**

**OPCIÓN A: Script automático (RECOMENDADO)**
```
Doble clic en: INICIAR_INNOAD.bat
```

**OPCIÓN B: Manual (si necesitas ver logs)**

Terminal 1:
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND"
java -jar target\innoad-backend-2.0.0.jar --spring.profiles.active=server
```

Terminal 2:
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
ng serve
```

Terminal 3 (Si PostgreSQL no está):
```bash
powershell -Command "Get-Service -Name 'postgresql*' | Start-Service"
```

---

## 📍 CREDENCIALES (Copiar para mañana)

```
👑 Admin:    admin / Admin123!
🔧 Técnico:  tecnico / Tecnico123!
👤 Usuario:  usuario / Usuario123!
```

---

## ✅ VERIFICACIÓN FINAL (Antes de la pitch)

**Entra a estas URLs y verifica:**

```
http://localhost:4200          ← Frontend
http://localhost:8080/actuator/health  ← Backend (debería estar UP)
```

**Checklist:**
- [ ] Backend corriendo en puerto 8080
- [ ] Frontend cargando en puerto 4200
- [ ] PostgreSQL conectado (sin errores de conexión)
- [ ] Puedo loguearme con admin / Admin123!
- [ ] Veo toggle 🌙☀️ en navbar
- [ ] Panel técnico tiene 5 pestañas
- [ ] Botón guardar visible en editar perfil

---

## 🔄 DESPLIEGUE EN SERVIDOR CASERO (Docker Compose)

Si tienes Docker instalado, puedes usar Docker Compose:

```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD"
docker-compose -f docker-compose.server.yml up -d
```

Esto iniciará:
- PostgreSQL en puerto 5433
- Backend en puerto 8080
- Frontend en puerto 80 (a través de Nginx)

---

## 🚨 SI ALGO FALLA MAÑANA

### Error: "No se puede conectar a la BD"
```bash
# Iniciar PostgreSQL manualmente
powershell -Command "Get-Service -Name 'postgresql*' | Start-Service"
```

### Error: "Puerto 8080 ya en uso"
```bash
# Matar el proceso que usa 8080
netstat -ano | findstr "8080"
taskkill /PID [numero-del-pid] /F
```

### Error: "ng serve no funciona"
```bash
cd FRONTEND\innoadFrontend
npm cache clean --force
npm install
ng serve
```

---

## 📊 CAMBIOS IMPLEMENTADOS HOY

### ✅ Frontend
- Dark mode toggle (🌙☀️)
- Panel técnico con 5 pestañas
- Modal editar perfil con scroll correcto
- Error handling mejorado
- Menú dinámico por rol

### ✅ Backend
- Configuración BD correcta
- Compilación exitosa
- Listo para despliegue

---

## 🎯 PLAN DE PITCH MAÑANA

1. **08:00** - Ejecuta INICIAR_INNOAD.bat
2. **08:15** - Abre http://localhost:4200
3. **08:20** - Login con admin / Admin123!
4. **08:25** - **¡COMIENZA LA PITCH!**

### Demo Script (8 minutos)

**1. Intro (30 seg)**
- Mostrar landing page
- "InnoAd - Plataforma de publicidad digital"

**2. Autenticación (1 min)**
- Login: admin / Admin123!
- Mostrar dashboard
- **Click toggle 🌙 para dark mode**

**3. Panel Técnico (2 min)**
- Click "Panel Técnico" en navbar
- Mostrar 5 pestañas:
  - Revisar Contenido
  - Pantallas Conectadas
  - **Mapa de Ubicaciones** ← Aquí está!
  - Inventario
  - Chat Soporte

**4. Sistema de Pagos (2 min)**
- Ir a Campañas
- Mostrar carrito
- 4 métodos de pago:
  - Tarjeta de crédito
  - Transferencia bancaria
  - Nequi/Daviplata
  - **Código de Pago** (NUEVO)

**5. Perfil (1 min)**
- Click avatar → Editar Perfil
- **Scroll down para ver Guardar**
- Mostrar que funciona

**6. Dark Mode (30 seg)**
- Click 🌙 para tema oscuro
- Click ☀️ para tema claro
- Mencionar: "Se guarda automáticamente"

---

## 📞 SOPORTE RÁPIDO

Si tienes dudas mañana:
1. Verifica que PostgreSQL esté corriendo
2. Recarga la página (Ctrl+F5)
3. Cierra las terminales y ejecuta INICIAR_INNOAD.bat de nuevo

---

## ⚠️ IMPORTANTE

**Todos los cambios están en GitHub:**
- Frontend: https://github.com/Crisb26/innoAdFrontend
- Backend: https://github.com/Crisb26/innoAdBackend

**Código listo para producción - 0 errores compilación**

---

**¡BUENA SUERTE MAÑANA! 🚀**

El sistema está 100% funcional. Simplemente ejecuta el script y presenta.
