# 📌 ESTADO DE DESPLIEGUES - InnoAd 2.0.0

**Fecha:** Febrero 4, 2026  
**Estado:** Desarrollo Local (Azure y Netlify Bloqueados - No Eliminados)

---

## 🚀 ESTADO ACTUAL

### ✅ Desarrollo Local (GO-LIVE)

```
├── Backend: localhost:8080 (Maven - Cristóbal)
│           Docker (Compañeros)
├── Frontend: localhost:4200 (npm - Cristóbal)
│            localhost (Docker - Compañeros)
└── Base de Datos: H2 en memoria (Local)
```

**Status:** 🟢 ACTIVO - Todo funcionando localmente

---

### 🔒 Azure/Netlify (Bloqueado - No Eliminado)

```
├── Azure: Railway.json presente (listo para reactivar)
├── Netlify: netlify.toml presente (listo para reactivar)
├── Workflows: GitHub Actions presentes (.github/workflows/)
└── Configuración: Intacta y disponible
```

**Status:** 🟡 BLOQUEADO - Conservado para reactivación futura

---

## 📋 ARCHIVOS DE CONFIGURACIÓN (SIN ELIMINAR)

### Backend

```
innoadBackend/
├── ✅ railway.json ..................... Configuración Railway (Azure)
├── ✅ Dockerfile ...................... Listo para despliegue
├── ✅ docker-compose.yml ........... Orquestación local/contenedores
└── ✅ pom.xml ......................... Configuración Maven
```

### Frontend

```
innoadFrontend/
├── ✅ netlify.toml .................... Configuración Netlify
├── ✅ .github/workflows/
│   ├── deploy-netlify.yml ........... CI/CD Netlify
│   └── docker-build.yml ........... CI/CD Docker
├── ✅ Dockerfile ..................... Listo para despliegue
├── ✅ docker-compose.yml ......... Orquestación local/contenedores
└── ✅ nginx-prod.conf ................ Config para producción
```

---

## 🎯 CÓMO ESTÁ AHORA (TRABAJO LOCAL)

### Desarrollo Local - Sin Azure/Netlify

**Cristóbal:**
```bash
# Todo desde terminal
mvn spring-boot:run           # Backend
npm start                     # Frontend
```

**Compañeros:**
```bash
# Todo con Docker
docker-compose build && docker-compose up -d
```

**Base de datos:** H2 en memoria (local)

---

## 🔄 CÓMO REACTIVAR AZURE/NETLIFY (Cuando sea necesario)

### Opción 1: Reactivar Netlify (Frontend)

```bash
cd innoadFrontend

# 1. Conectar con Netlify
netlify connect

# 2. O hacer push a main (si está configurado)
git push origin main

# 3. Netlify automáticamente:
#    - Detecta netlify.toml
#    - Ejecuta: npm run build
#    - Deploya en https://innoad.netlify.app
```

**Archivo a usar:** `netlify.toml`

---

### Opción 2: Reactivar Azure (Backend)

```bash
cd innoadBackend

# 1. Configurar Railway
railway login
railway link

# 2. O configurar desde Azure Portal:
#    - Conectar repositorio GitHub
#    - Usar railway.json para configuración

# 3. Azure/Railway automáticamente:
#    - Detecta pom.xml
#    - Compila con Maven
#    - Deploya en Azure
```

**Archivo a usar:** `railway.json`

---

### Opción 3: GitHub Actions (CI/CD)

Los workflows siguen en `.github/workflows/`:

```
.github/workflows/
├── deploy-netlify.yml ........... Se dispara al hacer push
└── docker-build.yml ............ Se dispara al hacer push
```

**Estado:** Presentes pero no activos (sin webhook)

Para reactivarlos:
```bash
# 1. Conectar GitHub con Netlify/Azure
# 2. Agregar secretos en GitHub Settings/Secrets
# 3. Los workflows se activarán automáticamente en next push
```

---

## 📊 COMPARACIÓN: Antes vs Ahora

| Aspecto | Antes (Feb 3) | Ahora (Feb 4) |
|--------|-------------|-------------|
| **Despliegue** | Azure + Netlify | Local (Docker/Maven) |
| **Base de Datos** | Cloud | H2 Memoria |
| **Desarrollo** | Lento (esperar deploy) | Instantáneo |
| **Costo** | $$$ | Gratis |
| **Ambiente** | Producción | Desarrollo |
| **Configuración** | Conservada | Conservada |

---

## 🔐 CÓMO SE BLOQUEARON LOS DESPLIEGUES (Sin Eliminar)

### Método 1: Environment Variables

Los despliegues están bloqueados porque falta configuración:

```bash
# En Azure/Netlify faltarían:
DATABASE_URL=... (no configurada)
API_KEY=... (no configurada)
ENVIRONMENT=production (no configurada)
```

**Cómo desbloquear:** Agregar variables en Azure/Netlify Portal

### Método 2: Webhook GitHub

GitHub Actions no está enviando eventos a Azure/Netlify.

**Cómo desbloquear:** Reconectar repositorio en Azure/Netlify

---

## 📝 CHECKLIST: Reactivación de Despliegues

Cuando quieras volver a usar Azure/Netlify:

### Para Netlify (Frontend)
- [ ] Conectar cuenta Netlify
- [ ] Autorizar GitHub
- [ ] Seleccionar repositorio `innoAdFrontend`
- [ ] Configurar variables de entorno
- [ ] Disparar build (push o manual)
- [ ] Verificar en https://app.netlify.com

### Para Azure (Backend)
- [ ] Crear cuenta Azure
- [ ] Conectar GitHub
- [ ] Crear App Service o Container Registry
- [ ] Configurar variables de entorno
- [ ] Configurar Railway.json
- [ ] Disparar build (push o manual)
- [ ] Verificar en Azure Portal

---

## 🚀 PROCESO CUANDO AVANCES

### Fase 1 (AHORA): Desarrollo Local
✅ Todo en localhost  
✅ Base de datos local  
✅ Desarrollo rápido  
✅ Compañeros con Docker

### Fase 2 (Próxima): Testing en Cloud
- [ ] Base de datos en MySQL Cloud
- [ ] Desplegar Frontend en Netlify
- [ ] Desplegar Backend en Azure
- [ ] Testing integral

### Fase 3 (Producción): Go-Live
- [ ] Dominio personalizado
- [ ] SSL/HTTPS
- [ ] Monitoreo
- [ ] Backups

---

## 🔗 Enlaces ÚTILES

### Plataformas (Cuando quieras reactivar)

- **Netlify:** https://app.netlify.com
- **Azure:** https://portal.azure.com
- **Railway:** https://railway.app
- **GitHub:** https://github.com/Crisb26/

### Archivos Clave

```
Backend:
├── railway.json ..................... Configuración deploy
├── Dockerfile ...................... Containerización
└── docker-compose.yml ......... Local development

Frontend:
├── netlify.toml .................... Configuración Netlify
├── .github/workflows/ ......... CI/CD workflows
├── Dockerfile ..................... Containerización
└── docker-compose.yml ........ Local development
```

---

## 💾 CÓMO ESTÁ GUARDADO TODO

```
GitHub (cloud) - Sincronizado
├── Backend: https://github.com/Crisb26/innoAdBackend
│   ├── ✅ railway.json (presente)
│   ├── ✅ Dockerfile (presente)
│   └── ✅ docker-compose.yml (presente)
│
└── Frontend: https://github.com/Crisb26/innoAdFrontend
    ├── ✅ netlify.toml (presente)
    ├── ✅ .github/workflows/ (presente)
    ├── ✅ Dockerfile (presente)
    └── ✅ docker-compose.yml (presente)
```

Todo está guardado. **Nada fue eliminado.**

---

## 🎯 RESUMEN

| Cuando | Dónde | Cómo |
|--------|-------|------|
| **Ahora (Desarrollo)** | localhost | Maven/npm/Docker |
| **Después (Testing)** | Azure/Netlify | Reactivar workflows |
| **Producción** | Azure/Netlify | Dominio + monitoreo |

---

## ✅ LO QUE TIENES AHORA

✅ **Configuración de desarrollo local:** Completa y funcional  
✅ **Docker:** Listo para compañeros  
✅ **Azure/Netlify:** Configurado, bloqueado (no eliminado)  
✅ **Base de datos:** Local H2 en memoria  
✅ **Documentación:** Completa y detallada  
✅ **Git:** Sincronizado y actualizado  

---

## 📞 CUANDO NECESITES REACTIVAR

1. Lee esta guía
2. Sigue el "CHECKLIST: Reactivación de Despliegues"
3. Contacta con Netlify/Azure si hay problemas
4. Los workflows en GitHub Actions se activarán automáticamente

---

**Estado:** 🟢 Go-Live Local Completado  
**Fecha:** Febrero 4, 2026  
**Versión:** 2.0.0

Todo está listo para empezar a trabajar localmente.  
Cuando avances, Azure y Netlify están ahí esperando. 🚀

