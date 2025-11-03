# 🚀 DESPLIEGUE COMPLETADO - Instrucciones Finales

## ✅ Estado actual del Frontend

El frontend Angular está:
- ✅ **Compilado** y listo para desplegar
- ✅ **Dockerizado** con Nginx optimizado
- ✅ **Configurado** con 3 modos de despliegue
- ✅ **Documentado** completamente

---

## 📦 Cómo desplegar el Frontend

### **Opción 1: Desarrollo local SIN Docker (Recomendado para ti)**

Si tu backend corre en tu máquina en `http://localhost:8080`:

```cmd
cd "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\innoadFrontend"
npm run iniciar:proxy
```

Abre: **http://localhost:4200**

El proxy Angular redirige `/api` y `/ws` a tu backend local (sin CORS).

---

### **Opción 2: Frontend en Docker + Backend en tu host**

Si quieres probar el frontend dockerizado pero tu backend sigue en localhost:

```cmd
cd "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\innoadFrontend"
docker compose -f docker-compose.external.yml up --build -d
```

Abre: **http://localhost:8080**

El frontend proxea a `host.docker.internal:8080` (tu backend).

---

### **Opción 3: Todo en Docker (para el equipo)**

Si tanto frontend como backend están en Docker:

```cmd
cd "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\innoadFrontend"
docker compose up --build -d
```

Abre: **http://localhost:8080** (frontend) y **http://localhost:8081** (backend directo)

**NOTA:** Necesitas ajustar el backend en `docker-compose.yml` (ver líneas 15-40).

---

## 📨 QUÉ DECIRLE AL BACKEND

### **Mensaje corto:**

> "El frontend está listo. Necesito que el backend Spring Boot:
> 1. **Corra en puerto 8080** con base path `/api/v1`
> 2. **Permita CORS** desde `http://localhost:4200` y `http://localhost:8080`
> 3. **Tenga health check** en `/actuator/health`
> 4. **Use el contrato `RespuestaAPI<T>`** en todas las respuestas:
>    ```json
>    { "exitoso": true, "mensaje": "...", "datos": {...} }
>    ```
> 5. **Login en** `POST /api/v1/autenticacion/iniciar-sesion` con esta respuesta:
>    ```json
>    {
>      "exitoso": true,
>      "datos": {
>        "token": "JWT",
>        "tokenActualizacion": "refresh",
>        "expiraEn": 3600,
>        "usuario": { "id", "nombreUsuario", "email", "rol", "permisos" }
>      }
>    }
>    ```
> 6. **Cree usuarios semilla:** admin/Admin123!, empresa/Empresa123!, usuario/Usuario123!
>
> **Documentación completa:** `docs/REQUISITOS-BACKEND.md` y `docs/MENSAJE-BACKEND.md`"

---

### **Documentos creados para el backend:**

1. **`docs/REQUISITOS-BACKEND.md`** (16 páginas)
   - Configuración detallada de CORS
   - Contrato completo de API
   - Estructura de JWT y refresh
   - Ejemplos de código Java
   - Dockerfile de ejemplo
   - Comandos curl para pruebas

2. **`docs/MENSAJE-BACKEND.md`** (resumen ejecutivo)
   - Checklist de 8 puntos esenciales
   - Ejemplos rápidos
   - Cómo probar con curl

3. **`docs/backend-ci-template.yml`** (CI/CD de GitHub Actions)
   - Build con Maven
   - Publicación en GHCR
   - Listo para copiar al repo del backend

---

## 🧪 Cómo validar que todo funciona

### **Paso 1: Verificar que el backend está UP**
```cmd
curl http://localhost:8080/actuator/health
```
Debe responder: `{"status":"UP"}`

### **Paso 2: Probar login**
```cmd
curl -X POST http://localhost:8080/api/v1/autenticacion/iniciar-sesion ^
  -H "Content-Type: application/json" ^
  -d "{\"nombreUsuarioOEmail\":\"admin\",\"contrasena\":\"Admin123!\",\"recordarme\":true}"
```

Debe devolver JSON con `token`, `tokenActualizacion`, `expiraEn` y `usuario`.

### **Paso 3: Iniciar frontend**
```cmd
npm run iniciar:proxy
```

### **Paso 4: Login en la UI**
1. Abre **http://localhost:4200**
2. Ingresa: **admin / Admin123!**
3. ✅ Debe entrar al dashboard sin errores

---

## 📁 Archivos importantes creados

| Archivo | Propósito |
|---------|-----------|
| `docs/REQUISITOS-BACKEND.md` | Especificación completa para el backend |
| `docs/MENSAJE-BACKEND.md` | Resumen ejecutivo (lo esencial) |
| `docs/DEPLOY.md` | Guía de despliegue completo |
| `docs/CHECKLIST.md` | Lista de verificación pre/post despliegue |
| `docs/backend-ci-template.yml` | CI/CD para Spring Boot |
| `.env.example` | Variables de entorno |
| `proxy.conf.json` | Proxy Angular para dev sin CORS |
| `docker-compose.yml` | Compose interno (front+back) |
| `docker-compose.external.yml` | Compose con backend externo |
| `docker-compose.prod.yml` | Compose para producción |
| `.github/workflows/frontend-ci.yml` | CI/CD del frontend |
| `README.md` | Documentación principal (actualizada) |

---

## 🎯 Resultado esperado final

1. ✅ Backend corriendo en `localhost:8080`
2. ✅ Frontend en `localhost:4200` (dev) o `localhost:8080` (Docker)
3. ✅ Login con **admin / Admin123!** funciona
4. ✅ Dashboard carga campañas, pantallas, estadísticas
5. ✅ Refresh automático de token cada ~50 minutos
6. ✅ Sin errores CORS ni 401 inesperados

---

## 🆘 Si hay problemas

### **CORS errors**
→ Backend debe permitir origin `http://localhost:4200` y `http://localhost:8080`

### **401 Unauthorized**
→ Verificar que el token JWT se genera correctamente y el header `Authorization: Bearer` se envía

### **Login no responde**
→ Verificar endpoint `POST /api/v1/autenticacion/iniciar-sesion` con curl

### **Refresh no funciona**
→ Verificar que `expiraEn` sea un número (segundos), no fecha ISO

### **Docker no levanta**
→ Reiniciar Docker Desktop; verificar que el daemon esté corriendo

---

## 📞 Próximos pasos

1. **Comparte** `docs/REQUISITOS-BACKEND.md` con el equipo de backend
2. **Valida** health check y login con curl
3. **Inicia** frontend con `npm run iniciar:proxy`
4. **Prueba** login en la UI
5. **Reporta** cualquier error específico (logs del backend, errores del frontend)

**¡El frontend está 100% listo para integrarse! 🚀**
