# 📖 ÍNDICE DE DOCUMENTACIÓN - InnoAd 2.0.0

**Última actualización:** Febrero 4, 2026  
**Estado:** ✅ PROYECTO LISTO PARA TRABAJAR

---

## 🚀 COMIENZA AQUÍ

Elige tu rol y comienza:

### 👨‍💻 Si eres **Cristóbal** (Desarrollo Local sin Docker)

1. **Leer primero:** [`INICIO_RAPIDO.md`](./INICIO_RAPIDO.md) - 3 minutos
2. **Entender contexto:** [`GUIA_TRABAJO_COLABORATIVO.md`](./GUIA_TRABAJO_COLABORATIVO.md) - Sección "OPCIÓN 1" - 10 minutos
3. **Documentación detallada:** 
   - Backend: [`BACKEND/innoadBackend/README.md`](./BACKEND/innoadBackend/README.md)
   - Frontend: [`FRONTEND/innoadFrontend/README.md`](./FRONTEND/innoadFrontend/README.md)

**Tus comandos principales:**
```bash
# Backend (Terminal 1)
cd BACKEND/innoadBackend && mvn spring-boot:run

# Frontend (Terminal 2)
cd FRONTEND/innoadFrontend && npm install && npm start
```

---

### 🐳 Si eres un **Compañero** (Desarrollo con Docker)

1. **Leer primero:** [`TARJETA_REFERENCIA_DOCKER.md`](./TARJETA_REFERENCIA_DOCKER.md) - 5 minutos
2. **Guía completa:**
   - Backend: [`BACKEND/innoadBackend/DESPLIEGUE_CON_DOCKER.md`](./BACKEND/innoadBackend/DESPLIEGUE_CON_DOCKER.md)
   - Frontend: [`FRONTEND/innoadFrontend/DESPLIEGUE_CON_DOCKER.md`](./FRONTEND/innoadFrontend/DESPLIEGUE_CON_DOCKER.md)
3. **Entender cómo colaborar:** [`GUIA_TRABAJO_COLABORATIVO.md`](./GUIA_TRABAJO_COLABORATIVO.md) - Sección "OPCIÓN 2" - 10 minutos

**Tus comandos principales:**
```bash
# Backend
cd BACKEND/innoadBackend
docker-compose build
docker-compose up -d

# Frontend
cd FRONTEND/innoadFrontend
docker-compose build
docker-compose up -d
```

---

## 📚 DOCUMENTACIÓN COMPLETA

### 🔴 DOCUMENTACIÓN NUEVA (Created Feb 4, 2026)

| Archivo | Propósito | Lectura | Para |
|---------|----------|---------|------|
| **INICIO_RAPIDO.md** | Comandos esenciales y resumen | 3 min | Cristóbal |
| **GUIA_TRABAJO_COLABORATIVO.md** | Cómo trabajar en el proyecto (2 enfoques) | 15 min | Todos |
| **TARJETA_REFERENCIA_DOCKER.md** | Comandos Docker (tarjeta rápida) | 5 min | Compañeros |
| **RESUMEN_CAMBIOS_REALIZADOS.md** | Qué se hizo el Feb 4 | 5 min | Todos |
| **BACKEND/innoadBackend/DESPLIEGUE_CON_DOCKER.md** | Guía completa Backend con Docker | 20 min | Compañeros |
| **FRONTEND/innoadFrontend/DESPLIEGUE_CON_DOCKER.md** | Guía completa Frontend con Docker | 20 min | Compañeros |

### 🟢 DOCUMENTACIÓN EXISTENTE

| Archivo | Propósito | Ubicación |
|---------|----------|-----------|
| **README.md** (Backend) | Documentación principal Backend | `BACKEND/innoadBackend/README.md` |
| **README.md** (Frontend) | Documentación principal Frontend | `FRONTEND/innoadFrontend/README.md` |
| **Dockerfile** (Backend) | Containerización Backend | `BACKEND/innoadBackend/Dockerfile` |
| **Dockerfile** (Frontend) | Containerización Frontend | `FRONTEND/innoadFrontend/Dockerfile` |
| **docker-compose.yml** (Backend) | Orquestación Backend | `BACKEND/innoadBackend/docker-compose.yml` |
| **docker-compose.yml** (Frontend) | Orquestación Frontend | `FRONTEND/innoadFrontend/docker-compose.yml` |

---

## 🎯 FLUJOS DE TRABAJO

### Cristóbal: Desarrollo Local

```
1. git pull origin main      (descargar cambios)
   ↓
2. mvn spring-boot:run      (Backend automáticamente reinicia)
   ↓
3. npm start                (Frontend automáticamente recarga)
   ↓
4. Editas código...
   ↓
5. Ver cambios instantáneamente en navegador
   ↓
6. git push origin main      (compartir cambios)
```

### Compañeros: Con Docker

```
1. git pull origin main          (descargar cambios)
   ↓
2. docker-compose build          (reconstruir imágenes)
   ↓
3. docker-compose down           (detener anterior)
   ↓
4. docker-compose up -d          (iniciar nuevo)
   ↓
5. Ver cambios en contenedor
   ↓
6. Usar normalmente
```

---

## 🔗 ENLACES RÁPIDOS

### Repositorios
- **Backend:** https://github.com/Crisb26/innoAdBackend.git
- **Frontend:** https://github.com/Crisb26/innoAdFrontend.git

### URLs de Trabajo
- **Backend (Todos):** `http://localhost:8080`
- **Frontend (Cristóbal):** `http://localhost:4200`
- **Frontend (Compañeros):** `http://localhost`

### Verificaciones de Salud
```bash
# Backend
curl http://localhost:8080/actuator/health

# Frontend
# Abre en navegador: http://localhost:4200 (Cristóbal)
#                    http://localhost (Compañeros)
```

---

## 🆘 SOLUCIÓN RÁPIDA DE PROBLEMAS

### "¿Por dónde empiezo?"
→ Lee [`INICIO_RAPIDO.md`](./INICIO_RAPIDO.md)

### "¿Cómo trabajo con Docker?"
→ Lee [`TARJETA_REFERENCIA_DOCKER.md`](./TARJETA_REFERENCIA_DOCKER.md)

### "¿Cómo colaboramos entre nosotros?"
→ Lee [`GUIA_TRABAJO_COLABORATIVO.md`](./GUIA_TRABAJO_COLABORATIVO.md)

### "Tengo un problema técnico"
- Backend: [`BACKEND/innoadBackend/DESPLIEGUE_CON_DOCKER.md`](./BACKEND/innoadBackend/DESPLIEGUE_CON_DOCKER.md) - Sección "Troubleshooting"
- Frontend: [`FRONTEND/innoadFrontend/DESPLIEGUE_CON_DOCKER.md`](./FRONTEND/innoadFrontend/DESPLIEGUE_CON_DOCKER.md) - Sección "Troubleshooting"

### "¿Qué cambios se realizaron?"
→ Lee [`RESUMEN_CAMBIOS_REALIZADOS.md`](./RESUMEN_CAMBIOS_REALIZADOS.md)

---

## 📊 ARQUITECTURA DEL PROYECTO

```
PROYECTO FINAL INNOAD/
│
├── 📂 BACKEND/
│   └── 📂 innoadBackend/
│       ├── 📄 README.md (documentación principal)
│       ├── 📄 DESPLIEGUE_CON_DOCKER.md (guía Docker)
│       ├── 🐳 Dockerfile + docker-compose.yml
│       ├── 📜 pom.xml (Maven config)
│       └── 📂 src/ (código fuente Java)
│
├── 📂 FRONTEND/
│   └── 📂 innoadFrontend/
│       ├── 📄 README.md (documentación principal)
│       ├── 📄 DESPLIEGUE_CON_DOCKER.md (guía Docker)
│       ├── 🐳 Dockerfile + docker-compose.yml
│       ├── 📜 package.json (npm config)
│       ├── 📜 angular.json (Angular config)
│       └── 📂 src/ (código fuente Angular)
│
└── 📚 DOCUMENTACIÓN (en raíz)
    ├── INICIO_RAPIDO.md
    ├── GUIA_TRABAJO_COLABORATIVO.md
    ├── TARJETA_REFERENCIA_DOCKER.md
    ├── RESUMEN_CAMBIOS_REALIZADOS.md
    └── DOCUMENTACION_INDEX.md (este archivo)
```

---

## ✅ CHECKLIST: Estoy Listo Para Empezar

### Preparación General
- [ ] Leí [`INICIO_RAPIDO.md`](./INICIO_RAPIDO.md)
- [ ] Git actualizado (`git --version`)

### Para Cristóbal
- [ ] Java 21 instalado (`java -version`)
- [ ] Maven instalado (`mvn --version`)
- [ ] Node.js 20 instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Puertos 8080 y 4200 disponibles

### Para Compañeros
- [ ] Docker Desktop instalado (`docker --version`)
- [ ] Docker Compose incluido (`docker-compose --version`)
- [ ] Puerto 8080 disponible
- [ ] Puerto 80 disponible (o configurado alterno)

---

## 🚀 PRIMEROS 5 MINUTOS

### Cristóbal
```bash
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
mvn spring-boot:run
# En otra terminal:
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
npm install
npm start
# Abre navegador: http://localhost:4200
```

### Compañeros
```bash
cd innoAdBackend/innoadBackend
docker-compose build
docker-compose up -d

# En otra terminal:
cd innoAdFrontend/innoadFrontend
docker-compose build
docker-compose up -d

# Abre navegador: http://localhost
```

---

## 📞 SOPORTE

Si tienes dudas:

1. **Primero:** Busca en la documentación de tu rol
2. **Luego:** Revisa la sección "Troubleshooting" en la guía correspondiente
3. **Finalmente:** Contacta a Cristóbal con detalles específicos

---

## 🎉 ¡TODO LISTO!

El proyecto está 100% configurado y documentado para ambos enfoques.

**Fecha de setup:** Febrero 4, 2026  
**Versión:** 2.0.0  
**Estado:** ✅ OPERACIONAL

---

**¿Preguntas?** Consulta la documentación correspondiente a tu rol. ¡Buena suerte!

