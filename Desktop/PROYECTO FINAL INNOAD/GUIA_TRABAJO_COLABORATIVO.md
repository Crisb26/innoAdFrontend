# 📚 Guía de Trabajo del Proyecto InnoAd - Dos Enfoques

**Versión:** 2.0.0  
**Fecha:** Febrero 4, 2026  
**Propósito:** Documentar cómo trabajar en InnoAd según tu rol y herramientas disponibles

---

## 🎯 Resumen Ejecutivo

El proyecto InnoAd está configurado para funcionar de **DOS formas diferentes**:

| Aspecto | Cristóbal (Tú) | Compañeros |
|--------|----------------|-----------|
| **Entorno** | Desarrollo Local | Docker Containers |
| **Setup** | Java 21 + Maven + Node 20 | Docker Desktop solamente |
| **Comando Inicio** | Maven (cmd) + npm start | docker-compose up |
| **Puertos** | Backend: 8080, Frontend: 4200 | Backend: 8080, Frontend: 80 |
| **Tiempo Compilación** | Rápido (cambios al instante) | Lento (rebuild completo) |
| **Reproducibilidad** | Depende del SO | Igual en todos lados |
| **Documentación** | [DESARROLLO_LOCAL.md](#desarrollo-local) | [DESPLIEGUE_CON_DOCKER.md](#despliegue-con-docker) |

---

## 👨‍💻 OPCIÓN 1: Desarrollo Local (Para Cristóbal)

### ✅ Ventajas

- ⚡ **Desarrollo rápido** - Los cambios se reflejan instantáneamente (HMR)
- 🔧 **Flexibilidad** - Editas código y ves cambios sin rebuild
- 🐛 **Debugging fácil** - Puedes usar el debugger de Java/Angular directamente
- 📚 **Ideal para desarrollo** - Entorno optimizado para programar

### ⚠️ Desventajas

- 🖥️ **Requiere instalación local** - Java 21, Maven, Node.js
- 🔗 **Dependiente del SO** - Puede variar entre Windows/Mac/Linux
- 📦 **Control manual** - Debes iniciar/detener servicios manualmente

### 🚀 Cómo Trabajar (Cristóbal)

#### 1. Clonar/Actualizar el Repositorio

```bash
# Backend
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
git pull origin main

# Frontend
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
git pull origin main
```

#### 2. Iniciar el Backend

```bash
# En PowerShell o CMD
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"

# Compilar y ejecutar
mvn spring-boot:run

# O si quieres buildear primero
mvn clean package
java -jar target/innoad-backend-2.0.0.jar
```

El backend estará en: `http://localhost:8080`

#### 3. Iniciar el Frontend

```bash
# En otra terminal (PowerShell o CMD)
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"

# Instalar dependencias (primera vez o después de cambios)
npm install

# Compilar y servir
npm start
```

El frontend estará en: `http://localhost:4200`

#### 4. Desarrollo

```typescript
// Editas archivos como siempre
// src/app/core/servicios/autenticacion.servicio.ts
// Los cambios se ven instantáneamente en el navegador
```

#### 5. Detener

- Backend: `Ctrl+C` en la terminal de Maven
- Frontend: `Ctrl+C` en la terminal de npm

#### 6. Compilación Final

```bash
# Backend - Crear JAR para distribución
cd innoadBackend
mvn clean package

# Frontend - Crear build para producción
cd innoadFrontend
npm run build
```

---

## 🐳 OPCIÓN 2: Con Docker (Para Compañeros)

### ✅ Ventajas

- 🌍 **Portabilidad** - Funciona igual en cualquier computadora
- 📦 **Aislamiento** - No afecta el sistema local
- 🚀 **Producción-ready** - El contenedor es similar a producción
- ⚙️ **Una línea de comando** - Todo configurado

### ⚠️ Desventajas

- ⏱️ **Más lento** - Rebuild completo cada cambio (~5-15 min)
- 💾 **Consume recursos** - Memoria y disco para Docker
- 🔄 **Menos HMR** - Sin cambios instantáneos
- 🐛 **Debugging más difícil** - Menos acceso directo

### 🚀 Cómo Trabajar (Compañeros)

#### 1. Instalación de Docker

- Descargar e instalar [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Iniciarlo y verificar: `docker --version`

#### 2. Clonar/Actualizar el Repositorio

```bash
# Backend
git clone https://github.com/Crisb26/innoAdBackend.git
cd innoAdBackend/innoadBackend
git pull origin main

# Frontend
git clone https://github.com/Crisb26/innoAdFrontend.git
cd innoAdFrontend/innoadFrontend
git pull origin main
```

#### 3. Iniciar Backend con Docker

```bash
cd innoadBackend

# Construir la imagen (primera vez)
docker-compose build

# Ejecutar
docker-compose up -d

# Verificar
curl http://localhost:8080/actuator/health

# Ver logs
docker-compose logs -f backend
```

Backend en: `http://localhost:8080`

#### 4. Iniciar Frontend con Docker

```bash
cd innoadFrontend

# Construir la imagen (primera vez)
docker-compose build

# Ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f frontend
```

Frontend en: `http://localhost`

#### 5. Detener

```bash
# Backend
cd innoadBackend
docker-compose down

# Frontend
cd innoadFrontend
docker-compose down
```

#### 6. Actualizar Código

```bash
# Descargar cambios
git pull origin main

# IMPORTANTE: Reconstruir
docker-compose build

# Reiniciar
docker-compose down
docker-compose up -d
```

---

## 🔄 Trabajo Colaborativo: Sincronización

### Cuando Cristóbal hace cambios y comparte:

```bash
# 1. Cristóbal: Pushea su código
cd BACKEND
git add .
git commit -m "Implementación de nuevo endpoint"
git push origin main

cd ../FRONTEND
git add .
git commit -m "Nuevo componente"
git push origin main

# 2. Compañeros: Actualizan su código
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

### Cuando compañeros hacen cambios y comparten:

Igual, pero Cristóbal NO necesita `docker-compose build`:

```bash
# Cristóbal: Solo descarga cambios
cd BACKEND && git pull origin main
cd FRONTEND && git pull origin main

# Reinicia Maven/npm si es necesario
# Los cambios se ven inmediatamente
```

---

## 📊 Arquitectura del Proyecto

```
PROYECTO FINAL INNOAD/
├── BACKEND/
│   ├── innoadBackend/
│   │   ├── src/
│   │   ├── pom.xml (configuración Maven)
│   │   ├── Dockerfile (para Docker)
│   │   ├── docker-compose.yml (orquestación)
│   │   ├── README.md (principal)
│   │   └── DESPLIEGUE_CON_DOCKER.md (guía Docker)
│   └── ...
│
├── FRONTEND/
│   ├── innoadFrontend/
│   │   ├── src/
│   │   ├── angular.json (configuración Angular)
│   │   ├── package.json (dependencias npm)
│   │   ├── Dockerfile (para Docker)
│   │   ├── docker-compose.yml (orquestación)
│   │   ├── README.md (principal)
│   │   └── DESPLIEGUE_CON_DOCKER.md (guía Docker)
│   └── ...
│
└── (Otros archivos de documentación - ELIMINADOS para limpieza)
```

---

## 🔒 ESTADO: Azure y Netlify (Bloqueados - No Eliminados)

⚠️ **Importante:** 

Los despliegues de Azure y Netlify están **bloqueados ahora** (no eliminados):
- ✅ Configuración guardada
- ✅ Archivos presentes
- ✅ Listos para reactivar cuando avances

**Documentación:** Ver [`ESTADO_DESPLIEGUES.md`](../ESTADO_DESPLIEGUES.md)

---

### Cristóbal ↔ Compañeros en Desarrollo

```
Cristóbal en su PC (Sin Docker)
    ↓
    → Modifica código
    → Testing local rápido
    → git push
    ↓
Compañeros en sus PCs (Con Docker)
    ↓
    → git pull
    → docker-compose build (construye todo)
    → docker-compose up (inicia)
    → Prueban cambios en contenedores
```

### Integración entre Backend y Frontend

```
Frontend (Angular)
    ↓ (HTTP + WebSocket)
    ↓ http://localhost:8080/api
Backend (Spring Boot)
    ↓ (Respuestas JSON)
Base de Datos
```

---

## 🔧 Configuraciones Importantes

### Environment Files (Frontend)

```
src/environments/
├── environment.ts           (Desarrollo local - 4200)
├── environment.compose.ts   (Desarrollo con Docker - 80)
└── environment.prod.ts      (Producción)
```

**Cristóbal usa:** `environment.ts`
```typescript
api: {
  gateway: 'http://localhost:8080/api',
  baseUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws'
}
```

**Compañeros usan:** `environment.compose.ts` (automático en Docker)

### Application Config (Backend)

```properties
# application.yml
server.port: 8080
spring.datasource.url: jdbc:h2:mem:innoad_db
```

Todos usan la misma configuración base.

---

## 📋 Checklist de Instalación

### Para Cristóbal ✅

- [ ] Java 21 JDK instalado (`java -version`)
- [ ] Maven instalado (`mvn --version`)
- [ ] Node.js 20 instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Git instalado (`git --version`)
- [ ] Repositorios clonados localmente
- [ ] Puertos 8080 y 4200 libres

### Para Compañeros ✅

- [ ] Docker Desktop instalado (`docker --version`)
- [ ] Docker Compose incluido (`docker-compose --version`)
- [ ] Git instalado (`git --version`)
- [ ] Repositorios clonados localmente
- [ ] Puertos 8080 y 80 libres

---

## 🆘 Troubleshooting Rápido

### Cristóbal

| Problema | Solución |
|----------|----------|
| Backend no inicia | Verifica Java 21: `java -version` |
| Cambios no se ven | Revisa consola de npm, Ctrl+C y `npm start` |
| Puerto 8080 ocupado | `netstat -ano \| findstr :8080` (Windows) |
| npm install falla | Borra `node_modules` y `package-lock.json`, reinicia |

### Compañeros

| Problema | Solución |
|----------|----------|
| Docker no inicia | Abre Docker Desktop desde inicio |
| Contenedor se detiene | Ver logs: `docker-compose logs` |
| Puerto 80 ocupado | Cambia en `docker-compose.yml`: `"3000:80"` |
| Build muy lento | Es normal primera vez, paciencia (15-30 min) |

---

## 🚀 Resumen Rápido de Comandos

### Cristóbal (Desarrollo Local)

```bash
# Backend
cd BACKEND/innoadBackend
mvn spring-boot:run

# Frontend (otra terminal)
cd FRONTEND/innoadFrontend
npm install
npm start
```

### Compañeros (Docker)

```bash
# Backend
cd BACKEND/innoadBackend
docker-compose build
docker-compose up -d

# Frontend (otra terminal)
cd FRONTEND/innoadFrontend
docker-compose build
docker-compose up -d
```

---

## 📞 Preguntas Frecuentes Generales

**P: ¿Puede Cristóbal usar Docker?**  
R: Sí, pero es innecesario. Docker es para reproducibilidad, Cristóbal necesita velocidad de desarrollo.

**P: ¿Pueden los compañeros trabajar sin Docker?**  
R: Sí, pero necesitarían instalar Java 21, Maven, Node.js. Docker lo hace más fácil.

**P: ¿Qué pasa si alguien pushea código sin compilar?**  
R: Backend: maven fallará. Frontend: npm fallará. Todos verán el error.

**P: ¿Las bases de datos se sincronizan?**  
R: Cada quien tiene su BD local (H2 en memoria). Para sincronizar datos, usan endpoints de API.

**P: ¿Puedo tener Backend local y Frontend en Docker?**  
R: Sí, pero debes configurar la URL de API en el Frontend para que apunte a tu Backend.

---

## 📖 Referencias

- [Backend: DESPLIEGUE_CON_DOCKER.md](./BACKEND/innoadBackend/DESPLIEGUE_CON_DOCKER.md)
- [Frontend: DESPLIEGUE_CON_DOCKER.md](./FRONTEND/innoadFrontend/DESPLIEGUE_CON_DOCKER.md)
- [Backend: README.md](./BACKEND/innoadBackend/README.md)
- [Frontend: README.md](./FRONTEND/innoadFrontend/README.md)

---

**¡Tu proyecto está listo para el trabajo colaborativo!** 🎉

Cristóbal trabaja local y rápido. Los compañeros trabajan en Docker y reproducible.

