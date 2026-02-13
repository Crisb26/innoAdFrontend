# 🚀 INICIO RÁPIDO - InnoAd 2.0.0

**Última actualización:** Febrero 4, 2026

---

## ⚡ TÚ (Cristóbal) - Desarrollo Local

### 🔄 Actualizar código
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
git pull origin main

cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
git pull origin main
```

### ▶️ Iniciar Backend (Terminal 1)
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
mvn spring-boot:run
```
✅ Backend en: `http://localhost:8080`

### ▶️ Iniciar Frontend (Terminal 2)
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
npm install
npm start
```
✅ Frontend en: `http://localhost:4200`

### 🛑 Detener
- Backend: Ctrl+C en su terminal
- Frontend: Ctrl+C en su terminal

---

## 🐳 TÚS COMPAÑEROS - Con Docker

### 🔄 Actualizar código
```bash
# Backend
cd innoAdBackend/innoadBackend
git pull origin main
docker-compose build  # ⚠️ IMPORTANTE
docker-compose down
docker-compose up -d

# Frontend
cd innoAdFrontend/innoadFrontend
git pull origin main
docker-compose build  # ⚠️ IMPORTANTE
docker-compose down
docker-compose up -d
```

### ▶️ Primera vez: Iniciar Backend
```bash
cd innoAdBackend/innoadBackend
docker-compose build  # Esto toma 15-30 min
docker-compose up -d
curl http://localhost:8080/actuator/health
docker-compose logs -f backend
```

### ▶️ Primera vez: Iniciar Frontend
```bash
cd innoAdFrontend/innoadFrontend
docker-compose build  # Esto toma 5-15 min
docker-compose up -d
docker-compose logs -f frontend
```

### 🛑 Detener
```bash
docker-compose down
```

---

## 📚 Documentación Completa

### Para Cristóbal:
- ✅ Backend: `innoadBackend/README.md`
- ✅ Frontend: `innoadFrontend/README.md`

### Para Compañeros con Docker:
- ✅ Backend: `innoadBackend/DESPLIEGUE_CON_DOCKER.md`
- ✅ Frontend: `innoadFrontend/DESPLIEGUE_CON_DOCKER.md`

### Para Todos:
- ✅ Guía Colaborativa: `GUIA_TRABAJO_COLABORATIVO.md` (raíz del proyecto)

---

## ✔️ Verificaciones

### Backend funcionando:
```
GET http://localhost:8080/actuator/health
Response: {"status":"UP"}
```

### Frontend funcionando:
```
GET http://localhost:4200 (Cristóbal)
GET http://localhost (Compañeros)
Deberías ver la página de InnoAd
```

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Puerto ocupado | Ver [GUIA_TRABAJO_COLABORATIVO.md](./GUIA_TRABAJO_COLABORATIVO.md#troubleshooting-rápido) |
| Git errors | `git status` para ver qué cambió |
| npm install falla | Borra `node_modules`, reinicia |
| Docker no inicia | Abre Docker Desktop |
| Build falla | Revisa logs: `docker-compose logs` |

---

## 📞 ¿Necesitas ayuda?

Lee la documentación correspondiente a tu enfoque:
- **Cristóbal:** `GUIA_TRABAJO_COLABORATIVO.md` → Sección "OPCIÓN 1: Desarrollo Local"
- **Compañeros:** `DESPLIEGUE_CON_DOCKER.md` en tu carpeta

---

**¡Todo está listo para empezar!** 🎉

