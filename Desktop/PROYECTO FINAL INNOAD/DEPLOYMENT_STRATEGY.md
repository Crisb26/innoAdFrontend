# 🚀 DEPLOYMENT STRATEGY - InnoAd Fase 4

## 📋 Pre-deployment Checklist

### Code Quality
- [x] Backend compila sin errores
- [x] Frontend builds sin errors  
- [x] Linting pass
- [x] No console warnings/errors
- [x] Git commits limpios

### Testing
- [ ] Unit tests 80%+
- [ ] Integration tests passed
- [ ] E2E tests passed
- [ ] Performance tests < 200ms
- [ ] Security scan passed

### Documentation
- [x] README.md actualizado
- [x] CHANGELOG.md completado
- [x] API endpoints documentados
- [x] Guía de deployment escrita
- [x] Credenciales documentadas

### Security
- [x] JWT configurado
- [x] Password hashing activado
- [x] CORS restringido
- [x] SQL injection mitigado
- [x] Secrets en environment variables

---

## 🏢 Opciones de Deployment

### Opción 1: LOCAL (Desarrollo)

```bash
# Backend
cd innoadBackend
mvn clean spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Frontend
cd innoadFrontend
ng serve --open

# Base de Datos
# PostgreSQL 16 en localhost:5432
```

**Casos de uso**: Development, testing local
**Ventajas**: Fácil, debug simple
**Desventajas**: No escalable, no HA

---

### Opción 2: DOCKER (Staging/Production)

#### 2.1 Build Images

```bash
# Backend
cd innoadBackend
docker build -t crisb26/innoad-backend:2.0.0 .
docker push crisb26/innoad-backend:2.0.0

# Frontend
cd innoadFrontend
docker build -t crisb26/innoad-frontend:2.0.0 .
docker push crisb26/innoad-frontend:2.0.0

# PostgreSQL
docker pull postgres:16
```

#### 2.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: innoad
      POSTGRES_USER: innoad_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./DATABASE-SCRIPT.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    image: crisb26/innoad-backend:2.0.0
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/innoad
      SPRING_DATASOURCE_USERNAME: innoad_user
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: 86400000
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: crisb26/innoad-frontend:2.0.0
    environment:
      API_URL: http://backend:8080
    ports:
      - "80:80"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:

networks:
  default:
    name: innoad_network
```

#### 2.3 Run Docker Compose

```bash
# Development
docker-compose -f docker-compose.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

**Puertos**:
- Backend: 8080
- Frontend: 80
- PostgreSQL: 5432

---

### Opción 3: RAILWAY (Recomendado para MVP)

#### 3.1 Setup Railway

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
railway link

# Setup variables
railway variables

# PostgreSQL
railway add postgres

# Deploy backend
cd innoadBackend
railway deploy

# Deploy frontend
cd innoadFrontend
railway deploy
```

#### 3.2 Railway Configuration

```toml
# railway.toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "java -jar target/innoad-backend-2.0.0.jar"
environmentVariables = [
  "SPRING_PROFILES_ACTIVE=prod",
  "SPRING_DATASOURCE_URL=$DATABASE_URL",
  "JWT_SECRET=$JWT_SECRET"
]

[[services]]
name = "postgres"
image = "postgres:16"
```

**Ventajas**:
- Setup simple
- Auto-scaling
- SSL certificado
- Git integration

**URLs**:
- Backend: `https://innoad-backend.railway.app`
- Frontend: `https://innoad-frontend.railway.app`

---

### Opción 4: AZURE (Producción)

#### 4.1 Setup Azure

```bash
# Install CLI
# https://docs.microsoft.com/cli/azure/install-azure-cli

az login
az account list
az account set --subscription "SUBSCRIPTION_ID"

# Create resource group
az group create \
  --name innoad-rg \
  --location eastus

# Create App Service Plan
az appservice plan create \
  --name innoad-plan \
  --resource-group innoad-rg \
  --sku B2 \
  --is-linux

# Create Web Apps
az webapp create \
  --resource-group innoad-rg \
  --plan innoad-plan \
  --name innoad-backend \
  --runtime "JAVA|21"

az webapp create \
  --resource-group innoad-rg \
  --plan innoad-plan \
  --name innoad-frontend \
  --runtime "NODE|18"

# Create PostgreSQL
az postgres flexible-server create \
  --resource-group innoad-rg \
  --name innoad-db \
  --admin-user innoad_user \
  --admin-password "${DB_PASSWORD}" \
  --sku-name Standard_B2s
```

#### 4.2 Deploy Backend

```bash
cd innoadBackend

# Build JAR
mvn clean package

# Create zip
zip -r innoad-backend.zip target/innoad-backend-2.0.0.jar

# Deploy
az webapp deployment source config-zip \
  --resource-group innoad-rg \
  --name innoad-backend \
  --src innoad-backend.zip

# Configure environment
az webapp config appsettings set \
  --resource-group innoad-rg \
  --name innoad-backend \
  --settings \
    SPRING_PROFILES_ACTIVE=prod \
    SPRING_DATASOURCE_URL="jdbc:postgresql://innoad-db.postgres.database.azure.com:5432/innoad" \
    SPRING_DATASOURCE_USERNAME="innoad_user" \
    JWT_SECRET="${JWT_SECRET}"
```

#### 4.3 Deploy Frontend

```bash
cd innoadFrontend

# Build
ng build --configuration=production

# Deploy
az webapp up \
  --resource-group innoad-rg \
  --name innoad-frontend \
  --runtime "NODE|18"

# Configure environment
az webapp config appsettings set \
  --resource-group innoad-rg \
  --name innoad-frontend \
  --settings \
    REACT_APP_API_URL="https://innoad-backend.azurewebsites.net"
```

**URLs**:
- Backend: `https://innoad-backend.azurewebsites.net`
- Frontend: `https://innoad-frontend.azurewebsites.net`

---

### Opción 5: NETLIFY (Frontend Only)

#### 5.1 Build Frontend

```bash
cd innoadFrontend

# Build
ng build --configuration=production

# Output: dist/innoad-frontend/
```

#### 5.2 Deploy Netlify

```bash
# Install CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist/innoad-frontend

# Configure redirects
# _redirects file already included

# Environment variables
netlify env:set REACT_APP_API_URL "https://innoad-backend.azurewebsites.net"
```

**URL**: `https://innoad-frontend.netlify.app`

---

## 📊 Comparativa Opciones

| Aspecto | Docker | Railway | Azure | Netlify |
|---------|--------|---------|-------|---------|
| **Costo** | Free | $5-50/mes | $50-500/mes | Free-$99 |
| **Setup** | Fácil | Muy fácil | Medio | Muy fácil |
| **Escalabilidad** | Manual | Auto | Auto | Limitada |
| **SSL** | Manual | Auto | Auto | Auto |
| **Bases de datos** | Manual | Auto | Auto | ❌ |
| **Git integration** | Manual | ✅ | ✅ | ✅ |
| **Recomendación** | MVP | MVP | Prod | Frontend only |

---

## 🔒 Seguridad en Producción

### Environment Variables

```bash
# Backend (.env o Railway)
DB_PASSWORD=SecurePassword123!
JWT_SECRET=VeryLongRandomSecretKey...
JWT_EXPIRATION=86400000
SPRING_PROFILES_ACTIVE=prod

# Frontend (.env o Netlify)
REACT_APP_API_URL=https://api.innoad.com
REACT_APP_ENVIRONMENT=production
```

### SSL/TLS

```bash
# Railway/Netlify: Automático
# Azure: Automático con *.azurewebsites.net

# Custom domain:
az appservice domain create \
  --resource-group innoad-rg \
  --name innoad.com \
  --is-default true
```

### CORS

```java
// application-prod.yml
server:
  servlet:
    context-path: /api

cors:
  allowed-origins:
    - https://innoad.com
    - https://www.innoad.com
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - PATCH
  allowed-headers:
    - "*"
  expose-headers:
    - Authorization
  max-age: 3600
```

### Database Backups

```bash
# PostgreSQL automático
# Azure: Automated backups c/7 días
# Railway: Automated backups
# Manual:
pg_dump -U innoad_user -d innoad > backup.sql
```

---

## 📈 Monitoring

### Backend Monitoring

```bash
# Spring Boot Actuator
# Endpoints:
/actuator/health           # Health status
/actuator/metrics          # Metrics
/actuator/loggers          # Log levels
/actuator/prometheus       # Prometheus metrics

# Setup Prometheus
docker run -p 9090:9090 \
  -v /etc/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### Frontend Monitoring

```typescript
// Sentry integration
npm install @sentry/angular

// En main.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "https://YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1
});
```

### Logs

```bash
# Azure Application Insights
# Railway: Built-in logging
# Docker: 
docker logs -f container_name

# Structured logging
# Backend: Spring Cloud Sleuth + Zipkin
# Frontend: LogRocket
```

---

## 🚨 Post-Deployment Checks

### Health Checks

```bash
# Backend
curl https://innoad-backend.azurewebsites.net/actuator/health
# Response: {"status":"UP"}

# Frontend
curl https://innoad-frontend.azurewebsites.net/
# Response: HTML document

# Database
psql -h innoad-db.postgres.database.azure.com \
  -U innoad_user \
  -d innoad \
  -c "SELECT NOW()"
```

### Smoke Tests

```bash
# Login
POST /api/autenticacion/login
{
  "email": "admin@innoad.com",
  "password": "password"
}
# Response: Token

# Get campaigns
GET /api/v1/campanas
# Response: Array of campaigns

# Get maintenance status
GET /api/v1/mantenimiento/estado
# Response: Maintenance state
```

### Performance Checks

```bash
# Load test (ab - Apache Bench)
ab -n 1000 -c 100 https://innoad-backend.azurewebsites.net/api/v1/campanas

# Expected: 
# Requests per second: > 100
# Time per request: < 100ms
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          java-version: '21'
      
      - name: Build Backend
        run: |
          cd innoadBackend
          mvn clean test package
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Build Frontend
        run: |
          cd innoadFrontend
          npm install
          ng build --configuration=production

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Azure
        env:
          AZURE_CREDENTIALS: ${{ secrets.AZURE_CREDENTIALS }}
        run: |
          az login --service-principal ...
          az webapp up --resource-group innoad-rg ...
```

---

## 📋 Rollback Plan

### Si hay problema en producción

```bash
# 1. Revert frontend (Netlify)
netlify deploy --prod --dir=dist/innoad-frontend-PREVIOUS_VERSION

# 2. Revert backend (Azure)
az appservice deployment slot swap \
  --resource-group innoad-rg \
  --name innoad-backend \
  --slot staging

# 3. Check health
curl https://innoad-backend.azurewebsites.net/actuator/health

# 4. Notify users
# Email + In-app notification

# 5. Post-mortem
# Documentar qué salió mal y lecciones aprendidas
```

---

## 📞 Deployment Support

### Escalación de problemas

1. **Critical (Down)**: Rollback inmediato
2. **High (Errors)**: Fix + test + deploy
3. **Medium (Slow)**: Monitor + optimize
4. **Low (UI)**: Schedule fix

### Contacto
- On-call: +1-555-CALL-NOW
- Slack: #innoad-incidents
- GitHub: Issues

---

**Última actualización**: 31-12-2025
**Versión**: 2.0.0
**Recomendación**: Railway para MVP, Azure para producción
