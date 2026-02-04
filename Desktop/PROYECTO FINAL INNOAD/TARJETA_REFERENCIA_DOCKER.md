# 🐳 TARJETA DE REFERENCIA - DESPLIEGUE CON DOCKER

**Para: Compañeros del proyecto InnoAd**  
**Fecha:** Febrero 4, 2026  
**Versión:** 2.0.0

---

## 🚀 COMANDO RÁPIDO (Primera Vez)

### Backend
```bash
cd innoAdBackend/innoadBackend
docker-compose build      # ⏱️ Toma 15-30 minutos (primera vez)
docker-compose up -d      # Inicia en background
curl http://localhost:8080/actuator/health  # Verifica
```

### Frontend
```bash
cd innoAdFrontend/innoadFrontend
docker-compose build      # ⏱️ Toma 5-15 minutos (primera vez)
docker-compose up -d      # Inicia en background
# Abre navegador: http://localhost
```

---

## ⏱️ COMANDO RÁPIDO (Después)

### Descargar cambios nuevos
```bash
# Backend
cd innoAdBackend/innoadBackend
git pull origin main
docker-compose build      # ⚠️ IMPORTANTE
docker-compose down
docker-compose up -d

# Frontend (en otra terminal)
cd innoAdFrontend/innoadFrontend
git pull origin main
docker-compose build      # ⚠️ IMPORTANTE
docker-compose down
docker-compose up -d
```

---

## 📋 REQUISITOS PREVIOS

```bash
✅ Docker Desktop instalado
✅ Docker Compose incluido
✅ Puerto 8080 disponible
✅ Puerto 80 disponible (o cambia en docker-compose.yml)
✅ Git instalado
```

**Verificar:**
```bash
docker --version
docker-compose --version
git --version
```

---

## 🔍 VERIFICACIONES

### Backend funcionando
```bash
curl http://localhost:8080/actuator/health
# Esperado: {"status":"UP"}
```

### Frontend funcionando
```bash
# Abre en navegador
http://localhost
# Deberías ver la página de InnoAd
```

### Ver logs
```bash
# Backend
cd innoadBackend
docker-compose logs -f backend

# Frontend
cd innoadFrontend
docker-compose logs -f frontend
```

---

## ⚙️ DETENER SERVICIOS

```bash
# En la carpeta del servicio
docker-compose down

# O eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

---

## 🔧 CAMBIAR PUERTOS

Si los puertos están ocupados, edita `docker-compose.yml`:

```yaml
# Antes
ports:
  - "8080:8080"  # Backend

# Después (si 8080 está ocupado)
ports:
  - "9000:8080"  # Accede en localhost:9000
```

---

## 🆘 PROBLEMAS COMUNES

| Problema | Solución |
|----------|----------|
| Build muy lento | Es normal primera vez. Paciencia (15-30 min) |
| Contenedor se detiene | Ver logs: `docker-compose logs` |
| Puerto ocupado | Cambia en `docker-compose.yml` |
| Docker no inicia | Abre Docker Desktop desde inicio |
| Cambios no se reflejan | Ejecuta `docker-compose build` después de `git pull` |
| No conecta al frontend | Verifica que el backend esté corriendo |

---

## 📊 ARQUITECTURA

```
┌─────────────────────────────────┐
│   Tu Computadora               │
│  ┌───────────────────────────┐  │
│  │   Docker Desktop          │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ Contenedor Backend  │  │  │
│  │  │ (Puerto 8080)       │  │  │
│  │  └─────────────────────┘  │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ Contenedor Frontend │  │  │
│  │  │ (Puerto 80)         │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│          Network innoad         │
│      (conectados internamente)   │
└─────────────────────────────────┘
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- Backend: `innoadBackend/DESPLIEGUE_CON_DOCKER.md` 
- Frontend: `innoadFrontend/DESPLIEGUE_CON_DOCKER.md`
- Guía colaborativa: `GUIA_TRABAJO_COLABORATIVO.md` (raíz)

---

## 🎯 WORKFLOW TÍPICO

### Día 1: Setup inicial
```bash
# Clonar
git clone https://github.com/Crisb26/innoAdBackend.git
git clone https://github.com/Crisb26/innoAdFrontend.git

# Construir
cd innoAdBackend/innoadBackend && docker-compose build
cd innoAdFrontend/innoadFrontend && docker-compose build

# Ejecutar
cd innoAdBackend/innoadBackend && docker-compose up -d
cd innoAdFrontend/innoadFrontend && docker-compose up -d

# Verificar
curl http://localhost:8080/actuator/health
# Abre navegador: http://localhost
```

### Día 2+: Trabajar con cambios
```bash
# Descargar cambios de Cristóbal
git pull origin main

# Reconstruir
docker-compose build

# Reiniciar
docker-compose down
docker-compose up -d

# Verifica que funcione
curl http://localhost:8080/actuator/health
# Abre navegador: http://localhost
```

---

## 💡 TIPS

1. **Build en background:** Usa `docker-compose build &` para que no bloquee
2. **Ver procesos Docker:** `docker ps` (muestra contenedores activos)
3. **Acceso al contenedor:** `docker-compose exec backend sh` (entra al contenedor)
4. **Limpiar todo:** `docker-compose down -v && docker system prune` (cuidado!)
5. **Más rápido:** Los rebuilds subsecuentes son más rápidos

---

## 📞 ¿PREGUNTAS?

Lee la documentación completa en tu carpeta:
- Backend: `innoadBackend/DESPLIEGUE_CON_DOCKER.md`
- Frontend: `innoadFrontend/DESPLIEGUE_CON_DOCKER.md`

---

**¡Buena suerte con Docker!** 🚀

