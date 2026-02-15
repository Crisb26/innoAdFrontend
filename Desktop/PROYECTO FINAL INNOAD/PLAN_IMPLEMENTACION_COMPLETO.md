# PLAN DE IMPLEMENTACIÓN COMPLETO - InnoAd

**Fecha**: Febrero 15, 2026
**Objetivo**: Solucionar errores + Implementar todas las features faltantes

---

## 🔴 PROBLEMA IDENTIFICADO

**Error**: "El recurso solicitado no fue encontrado" (404)

**Causa**: Nginx NO está redirigiendo `/api/` al backend Java
- Nginx está tratando `/api/v1/auth/...` como un archivo estático
- Debería redirigir al backend en `http://127.0.0.1:8080`

**Solución inmediata**: Actualizar `/etc/nginx/sites-enabled/default`

---

## 📋 PLAN DE TRABAJO (ORDEN PRIORITARIO)

### **FASE 1: SOLUCIONAR ERROR 404** (Hoy, Sin interrupciones)

1. ✅ Diagnosticar error (HECHO)
2. 🔧 Actualizar configuración Nginx
3. 🧪 Probar que funcione
4. 📤 Push a GitHub main
5. ✅ Verificar en servidor

### **FASE 2: AUDITORÍA DE CONEXIONES** (2 horas)

1. Mapear todos los endpoints del backend
2. Mapear todos los botones/llamadas del frontend
3. Identificar conexiones anómalas
4. Documentar lo que falta

### **FASE 3: IMPLEMENTAR FEATURES** (Priorizado)

#### **Priority 1 - CRÍTICO (Debe funcionar ya)**
- [ ] Upload de fotos de perfil
- [ ] Creación de usuarios (registro)
- [ ] Email de verificación/recuperación
- [ ] Cambio de foto en perfil

#### **Priority 2 - IMPORTANTE (Próximas 24h)**
- [ ] Upload de contenido (publicidad, videos, fotos)
- [ ] Almacenamiento en servidor
- [ ] Visualización en Raspberry Pi

#### **Priority 3 - INTEGRACIÓN DE PAGOS (3-5 días)**
- [ ] PayPal integration
- [ ] PSE (Plataforma Segura Electronica)
- [ ] Bancos colombianos (Davivienda, Banco de Bogotá, etc.)
- [ ] Tarjeta débito/crédito
- [ ] Mastercard

#### **Priority 4 - REPORTES Y DATOS (2-3 días)**
- [ ] Descarga en PDF
- [ ] Formato especificado
- [ ] Información completa

#### **Priority 5 - AZURE READY (1 día)**
- [ ] Docker image
- [ ] Configuración espejo de servidor
- [ ] Listo para deployment

### **FASE 4: GITHUB + DOCUMENTACIÓN** (Final)

1. Push a GitHub main
2. Crear guía para compañero
3. Documentar sincronización servidor-GitHub

---

## 🔧 CONFIGURACIÓN CORRECTA NGINX

**Problema actual** (incorrecto):
```nginx
server {
    listen 80;
    root /var/www/innoad;
    try_files $uri $uri/ /index.html;
}
```

**Debería ser**:
```nginx
server {
    listen 80;

    # FRONTEND (archivos estáticos)
    location / {
        root /var/www/innoad;
        try_files $uri $uri/ /index.html;
    }

    # API ROUTING (IMPORTANTE)
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 📂 ESTRUCTURA DE ARCHIVOS A CREAR/MODIFICAR

### **Backend**

```
BACKEND/src/main/java/com/innoad/
├── modules/
│   ├── auth/
│   │   └── controller/ControladorAutenticacion.java (ACTUALIZAR)
│   │
│   ├── user/
│   │   ├── controller/ControladorUsuario.java (CREAR)
│   │   ├── service/ServicioUsuario.java (CREAR)
│   │   └── dto/
│   │       ├── CrearUsuarioRequest.java (CREAR)
│   │       └── UsuarioResponse.java (CREAR)
│   │
│   ├── upload/
│   │   ├── controller/ControladorUpload.java (CREAR)
│   │   ├── service/ServicioUpload.java (CREAR)
│   │   └── dto/UploadResponse.java (CREAR)
│   │
│   ├── profile/
│   │   ├── controller/ControladorPerfil.java (CREAR)
│   │   ├── service/ServicioPerfil.java (CREAR)
│   │   └── dto/ActualizarPerfilRequest.java (CREAR)
│   │
│   ├── pagos/
│   │   ├── controller/ControladorPagos.java (CREAR)
│   │   ├── service/
│   │   │   ├── ServicioPagos.java (CREAR)
│   │   │   ├── ServicioPayPal.java (CREAR)
│   │   │   ├── ServicioPSE.java (CREAR)
│   │   │   └── ServicioBancos.java (CREAR)
│   │   └── dto/PagoRequest.java (CREAR)
│   │
│   └── reportes/
│       ├── controller/ControladorReportes.java (CREAR)
│       ├── service/ServicioReportes.java (CREAR)
│       └── export/ExportadorPDF.java (CREAR)
│
└── config/
    ├── ConfiguracionSeguridad.java (ACTUALIZAR)
    ├── ConfiguracionUpload.java (CREAR)
    ├── ConfiguracionPagos.java (CREAR)
    └── ConfiguracionCorreo.java (CREAR)
```

### **Frontend**

```
FRONTEND/innoadFrontend/src/
├── app/
│   ├── components/
│   │   ├── profile/profile.component.ts (ACTUALIZAR - foto)
│   │   ├── user-create/user-create.component.ts (CREAR)
│   │   ├── upload/upload.component.ts (CREAR)
│   │   ├── payment/payment.component.ts (CREAR)
│   │   └── reports/reports.component.ts (CREAR)
│   │
│   └── services/
│       ├── upload.service.ts (CREAR)
│       ├── user.service.ts (ACTUALIZAR)
│       ├── payment.service.ts (CREAR)
│       └── report.service.ts (CREAR)
│
└── environments/
    └── environment.prod.ts (ACTUALIZAR endpoints)
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Semana 1
- [ ] Solucionar error 404 (Nginx)
- [ ] Push a GitHub
- [ ] Auditar conexiones anómalas
- [ ] Implementar upload de fotos de perfil
- [ ] Implementar creación de usuarios
- [ ] Implementar email de verificación

### Semana 2
- [ ] Upload de contenido (publicidad)
- [ ] Almacenamiento en servidor
- [ ] Visualización en Raspberry Pi
- [ ] PayPal integration
- [ ] PSE integration

### Semana 3
- [ ] Bancos colombianos
- [ ] Tarjetas (débito/crédito)
- [ ] Descarga en PDF
- [ ] Azure Docker image
- [ ] Documentación final

---

## 🔗 CÓMO SE ACTUALIZA EL SERVIDOR DESDE GITHUB

### **Opción 1: Manual (Recomendada para pruebas)**

```bash
# En el servidor
cd /opt/innoad/backend
git pull origin main
mvn clean package -DskipTests
systemctl restart innoad-backend

# Verificar
systemctl status innoad-backend
```

### **Opción 2: Automática (CI/CD - Futura)**

```yaml
# .github/workflows/deploy.yml (A crear)
name: Deploy to Home Server
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@100.91.23.46 'cd /opt/innoad && ./deploy.sh'
```

---

## 📊 ORDEN DE PRIORIDAD PARA IMPLEMENTACIÓN

1. **URGENTE** (Hoy): Solucionar error 404
2. **IMPORTANTE** (Mañana): Upload fotos + Usuarios + Email
3. **REQUERIDO** (Esta semana): Contenido + Pagos
4. **FINAL** (Siguiente): Azure + Documentación

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. Revisa este plan
2. Confirma prioridades
3. Empezamos con error 404
4. Luego upload de fotos
5. Luego usuarios
6. Luego pagos

**¿Listo para empezar?**
