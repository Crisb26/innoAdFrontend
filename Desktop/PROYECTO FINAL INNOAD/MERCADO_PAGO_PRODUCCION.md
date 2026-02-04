# 🚀 FASE 3.7: Mercado Pago - Guía de Producción

## 📋 Requisitos Previos

### Backend (Java/Spring Boot)
- ✅ Java 21+
- ✅ Maven 3.8+
- ✅ PostgreSQL 16
- ✅ Mercado Pago SDK instalado (pom.xml)

### Frontend (Angular)
- ✅ Node.js 18+
- ✅ Angular 18+
- ✅ npm/yarn

---

## 🔐 Configuración de Mercado Pago

### 1. Obtener Credenciales

Ir a [Mercado Pago Dashboard](https://www.mercadopago.com.co/developers/dashboard):

1. Crear cuenta empresarial
2. En **Configuración → Credenciales**, obtener:
   - **Access Token** (Sandbox y Producción)
   - **Public Key** (para el frontend)
   - **Private Key** (para webhooks)
   - **Client ID** y **Client Secret**

### 2. Variables de Entorno

Crear archivo `.env` en la raíz del backend:

```bash
# Mercado Pago - Producción
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_XXXXXXXXXXXXXXXXXXXXXXXXX
MERCADO_PAGO_PUBLIC_KEY=APP_USR_XXXXXXXXXXXXXXXXXXXXXXXXX
MERCADO_PAGO_PRIVATE_KEY=XXXXXXXXXXXXXXXXXXXXXXXXX
MERCADO_PAGO_WEBHOOK_SECRET=webhook_secret_key
MERCADO_PAGO_WEBHOOK_URL=https://tu-dominio.com/api/v1/pagos/webhook/mercado-pago
MERCADO_PAGO_CLIENT_ID=XXXXXXXXX
MERCADO_PAGO_CLIENT_SECRET=XXXXXXXXXXXXXXXXX

# Base de Datos (PostgreSQL)
DB_HOST=your-postgres-host.azure.com
DB_PORT=5432
DB_NAME=innoad_db
DB_USER=admininnoad
DB_PASSWORD=your_secure_password

# Correo (Gmail/Sendgrid)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your_app_password

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# CORS
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

---

## 🏗️ Estructura de Mercado Pago

### Backend Endpoints

```
POST   /api/v1/pagos                    - Crear pago
GET    /api/v1/pagos/{id}              - Obtener pago
GET    /api/v1/pagos                   - Listar mis pagos
GET    /api/v1/pagos/estado/{estado}   - Listar por estado (admin)
POST   /api/v1/pagos/{id}/reembolsar   - Reembolsar pago (admin)
POST   /api/v1/pagos/webhook/mercado-pago  - Webhook de MP
```

### Webhook de Mercado Pago

**Configurar en [Mercado Pago Dashboard](https://www.mercadopago.com.co/developers/dashboard/webhooks)**:

```
URL: https://tu-dominio.com/api/v1/pagos/webhook/mercado-pago
Eventos a suscribirse:
  ✓ payment.created
  ✓ payment.updated
  ✓ payment.pending
  ✓ payment.approved
  ✓ payment.rejected
```

---

## ✅ Testing

### 1. Test Unitarios

```bash
# Backend
cd innoadBackend
mvn test -Dtest=ServicioWebhookMercadoPagoTest

# Frontend
cd innoadFrontend
ng test
```

### 2. Test E2E - Flujo Completo

**Datos de Prueba Mercado Pago (Sandbox)**:

```
Tarjeta VISA: 4111 1111 1111 1111
Mes: 11
Año: 25 (cualquier futuro)
CVV: 123
Titular: APRO
```

**Flujo de Prueba**:
1. Abrir `http://localhost:4200/pagos`
2. Seleccionar plan (Básico: $9.99)
3. Ingresar email y nombre
4. Click en "Procesar Pago"
5. Será redirigido a Mercado Pago
6. Usar tarjeta de prueba arriba
7. Confirmar pago
8. Ver confirmación

### 3. Validación de Webhook

```bash
# Simular webhook desde postman o curl
curl -X POST http://localhost:8080/api/v1/pagos/webhook/mercado-pago \
  -H "Content-Type: application/json" \
  -H "X-Signature: tu-firma-aqui" \
  -H "X-Request-Id: test-request-123" \
  -H "X-Request-Timestamp: $(date +%s)" \
  -d '{
    "type": "payment",
    "action": "payment.approved",
    "data": {
      "id": "123456789",
      "status": "approved",
      "external_reference": "TEST-001"
    }
  }'
```

---

## 🐳 Deployment con Docker

### 1. Build Backend

```bash
cd innoadBackend
mvn clean package -DskipTests -Pprod
docker build -t innoad-backend:1.0 .
docker run -d \
  -p 8080:80 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e MERCADO_PAGO_ACCESS_TOKEN=$MERCADO_PAGO_ACCESS_TOKEN \
  -e DB_HOST=$DB_HOST \
  --name innoad-backend \
  innoad-backend:1.0
```

### 2. Build Frontend

```bash
cd innoadFrontend
ng build --configuration production
docker build -f Dockerfile -t innoad-frontend:1.0 .
docker run -d \
  -p 80:80 \
  --name innoad-frontend \
  innoad-frontend:1.0
```

### 3. Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoreo

### Logs

```bash
# Backend
docker logs -f innoad-backend

# Frontend (Nginx)
docker logs -f innoad-frontend
```

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

---

## 🔒 Seguridad - Checklist

- ✅ Webhook signature validado con HMAC SHA256
- ✅ HTTPS obligatorio en producción
- ✅ Variables de entorno para credenciales (no hardcoded)
- ✅ CORS restringido a dominio permitido
- ✅ Rate limiting en endpoints sensibles
- ✅ Log de transacciones sin datos sensibles
- ✅ Tokens JWT con expiración
- ✅ PostgreSQL con SSL connection

---

## 📈 Performance

**Mercado Pago Sandbox → Producción**:
- ✅ Cambiar `sandbox.mercadopago.com.co` por `www.mercadopago.com.co`
- ✅ Usar tokens de producción
- ✅ Verificar webhook URL (debe ser HTTPS)
- ✅ Monitorear rate limits (100 req/min por defecto)

---

## 🆘 Troubleshooting

### Webhook no se recibe

```
1. Verificar URL webhook en MP Dashboard es HTTPS
2. Verificar que IP pública del servidor está permitida en firewall
3. Revisar logs: docker logs innoad-backend
4. Validar signature HMAC (incluir headers X-*)
```

### Pago rechazado en producción pero aprobado en sandbox

```
1. Verificar que tarjeta no tenga límite de moneda
2. Validar que monto sea permitido (mínimo suele ser $1)
3. Verificar cuenta bancaria esté verificada
4. Contactar Mercado Pago support
```

### Comprobante no se descarga

```
1. Implementar endpoint GET /api/v1/pagos/{id}/comprobante
2. Generar PDF con pdfkit o itext
3. Devolver como application/pdf
```

---

## ✨ Próximos Pasos

- [ ] FASE 4: UI/UX Profesional (Colores Índigo, Púrpura, Rosa)
- [ ] FASE 5: Service Agent IA
- [ ] FASE 6: Hardware API (Raspberry Pi)
- [ ] FASE 7-9: Testing integral y Deployment

---

**Última actualización**: 1 de enero de 2026
**Estado**: ✅ COMPLETO - Listo para producción
