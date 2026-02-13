# 🚀 GUÍA DE EJECUCIÓN - INNOAD LOCAL

## ✅ ESTADO ACTUAL

✅ Backend compilado correctamente (0 errores)  
✅ Frontend configurado y listo  
✅ Todas las dependencias actualizadas  
✅ CORS configurado para localhost:4200  
✅ API Gateway apuntando a puerto 8080

---

## 📱 INICIAR APLICACIÓN

### Opción 1: Script Automático (RECOMENDADO)

1. **Abre Explorer** y navega a:
   ```
   c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\
   ```

2. **Haz doble click en:**
   ```
   DEPLOY.bat
   ```

3. **El script automáticamente:**
   - Limpia compilaciones anteriores
   - Compila el backend
   - Abre el backend en una ventana (puerto 8080)
   - Abre el frontend en otra ventana (puerto 4200)
   - Espera 60 segundos para stabilización

---

### Opción 2: Manual en PowerShell

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
ng serve --port 4200
```

---

## 🌐 URLS DISPONIBLES

| Componente | URL | Descripción |
|-----------|-----|-------------|
| **Frontend** | http://localhost:4200 | Aplicación web |
| **Backend API** | http://localhost:8080/api | API REST |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | Documentación |
| **Health Check** | http://localhost:8080/api/health | Estado del backend |
| **WebSocket** | ws://localhost:8080/ws | WebSocket |

---

## ✅ VERIFICACIÓN POST-INICIO

### 1. Backend Listo (Espera este mensaje)
```
Started InnoAdBackendApplication in X.XXX seconds (process running)
```

### 2. Frontend Listo (Espera este mensaje)
```
✔ Compiled successfully.
Application bundle generation complete.
```

### 3. Prueba rápida en navegador
- Abre: http://localhost:4200
- Deberías ver la página de login

---

## 🧪 TEST E2E

Una vez que todo está corriendo:

```
1. Abre http://localhost:4200
2. Click en "Iniciar Sesión"
3. Ingresa credenciales:
   - Usuario/Email: (según tu DB)
   - Contraseña: (según tu DB)
4. Verifica acceso al Dashboard
5. Navega por:
   - ✅ Campañas
   - ✅ Pantallas  
   - ✅ Contenidos
   - ✅ Reportes
   - ✅ Hardware
   - ✅ Mantenimiento
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### "Puerto 8080 en uso"
```powershell
# Encuentra el proceso
netstat -ano | findstr :8080

# Mata el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### "No se encuentra ng"
```powershell
npm install -g @angular/cli@19
```

### "Error: EADDRINUSE 4200"
```powershell
# Matando procesos Node
taskkill /F /IM node.exe

# O especifica otro puerto
ng serve --port 4201
```

### "CORS errors en consola"
- Verifica que `application.yml` tiene `localhost:4200`
- Verifica que `environment.ts` tiene `http://localhost:8080/api`
- Recarga la página (Ctrl+F5)

### "Base de datos no conecta"
- Verifica PostgreSQL está corriendo: `SELECT 1;` en pgAdmin
- Revisa credenciales en `application.yml`
- Ejecuta `DATABASE-SCRIPT.sql` si es necesario

---

## 📋 CHECKLIST POST-DESPLIEGUE

- [ ] Backend escuchando en puerto 8080
- [ ] Frontend escuchando en puerto 4200
- [ ] Puedes abrir http://localhost:4200 sin errores CORS
- [ ] Puedes hacer login
- [ ] Dashboard carga sin errores
- [ ] Puedes navegar a todos los módulos
- [ ] No hay errores en consola del navegador (F12)
- [ ] API health check: http://localhost:8080/api/health retorna UP

---

## 📚 DOCUMENTACIÓN

Dentro del proyecto encontrarás:

- **RESUMEN-FINAL-SESION.md** - Resumen de todos los cambios
- **DESPLIEGUE-LOCAL-GUIA.md** - Guía detallada
- **README.md** - En cada carpeta (backend/frontend)

---

## 🎯 PRÓXIMOS PASOS (Después de validar local)

1. **Despliegue a Azure:**
   - Azure Container Registry (ACR)
   - App Service o Container Apps
   - PostgreSQL Database
   - Key Vault

2. **CI/CD Pipeline:**
   - GitHub Actions
   - Build automático
   - Tests automáticos
   - Deployment automático

3. **Monitoreo:**
   - Application Insights
   - Log Analytics
   - Alertas

---

## ✉️ CONTACTO Y SOPORTE

**Versión:** InnoAd 2.0.0  
**Fecha:** 3 de Enero de 2026  
**Java:** 21 LTS  
**Spring Boot:** 3.5.8  
**Angular:** 19.x  
**Base Datos:** PostgreSQL 17.6

---

## 🎉 LISTO PARA DESPLIEGUE

Tu aplicación está completamente configurada y lista para:
- ✅ Desarrollo local
- ✅ Testing
- ✅ Despliegue a Azure

¡Éxito en tu proyecto InnoAd! 🚀
