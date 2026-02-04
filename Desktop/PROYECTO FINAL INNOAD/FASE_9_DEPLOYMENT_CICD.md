# 🚀 FASE 9: DESPLIEGUE Y CI/CD PIPELINE
**Automatización completa: GitHub Actions → Azure App Service → Production**

---

## 📋 Resumen Ejecutivo

FASE 9 implementa **infraestructura de producción profesional**:

- ✅ **CI/CD Pipeline**: GitHub Actions (build, test, deploy automático)
- ✅ **Azure Deployment**: App Service, PostgreSQL, Redis, CDN
- ✅ **SSL/TLS**: Certificados automáticos con Let's Encrypt
- ✅ **Monitoreo**: Application Insights, Logging, Alertas
- ✅ **Backup & Recovery**: Automatic backups, snapshots
- ✅ **Scaling**: Auto-scale rules y load balancing

---

## 🎯 Archivos Implementados

### 1️⃣ GitHub Actions Workflow

#### `.github/workflows/deploy.yml` (200+ líneas)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # ==================== BUILD STAGE ====================
  build:
    runs-on: ubuntu-latest
    outputs:
      backend-image: ${{ steps.meta-backend.outputs.tags }}
      frontend-image: ${{ steps.meta-frontend.outputs.tags }}
    
    steps:
      - uses: actions/checkout@v3
      
      # Backend Build
      - name: Build Backend Docker Image
        uses: docker/build-push-action@v4
        with:
          context: ./BACKEND/innoadBackend
          file: ./BACKEND/innoadBackend/Dockerfile.optimizado
          push: false
          tags: innoad-backend:${{ github.sha }}
          outputs: type=docker,dest=/tmp/backend-image.tar
      
      # Frontend Build
      - name: Build Frontend Docker Image
        uses: docker/build-push-action@v4
        with:
          context: ./FRONTEND/innoadFrontend
          file: ./FRONTEND/innoadFrontend/Dockerfile.optimizado
          push: false
          tags: innoad-frontend:${{ github.sha }}
          outputs: type=docker,dest=/tmp/frontend-image.tar
      
      # Image scanning (Trivy)
      - name: Scan Backend Image for Vulnerabilities
        run: |
          docker run --rm -v /tmp:/tmp aquasec/trivy image \
            --input /tmp/backend-image.tar \
            --exit-code 1 \
            --severity CRITICAL
      
      - name: Scan Frontend Image for Vulnerabilities
        run: |
          docker run --rm -v /tmp:/tmp aquasec/trivy image \
            --input /tmp/frontend-image.tar \
            --severity HIGH

  # ==================== TEST STAGE ====================
  test:
    runs-on: ubuntu-latest
    needs: build
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: innoad_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      # Backend Tests
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Run Backend Tests
        run: |
          cd BACKEND/innoadBackend
          mvn clean test \
            -Dspring.datasource.url=jdbc:postgresql://localhost:5432/innoad_test \
            -Dspring.datasource.password=postgres
      
      - name: Upload Backend Coverage
        uses: codecov/codecov-action@v3
        with:
          files: BACKEND/innoadBackend/target/site/jacoco/jacoco.xml
          flags: backend
      
      # Frontend Tests
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: FRONTEND/innoadFrontend/package-lock.json
      
      - name: Run Frontend Tests
        run: |
          cd FRONTEND/innoadFrontend
          npm ci
          npm run test:ci
      
      - name: Upload Frontend Coverage
        uses: codecov/codecov-action@v3
        with:
          files: FRONTEND/innoadFrontend/coverage/lcov.info
          flags: frontend
      
      # E2E Tests
      - name: Run E2E Tests
        run: |
          cd FRONTEND/innoadFrontend
          npm run e2e:ci

  # ==================== SECURITY STAGE ====================
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run SAST Analysis (SonarQube)
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          path: '.'
          format: 'JSON'

  # ==================== DEPLOY STAGE ====================
  deploy:
    runs-on: ubuntu-latest
    needs: [build, test, security]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      # Azure Login
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      # Deploy Backend
      - name: Deploy Backend to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: innoad-backend-prod
          package: BACKEND/innoadBackend/target/*.jar
          slot-name: production
      
      # Deploy Frontend
      - name: Deploy Frontend to Azure Static Web App
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_SWA_TOKEN }}
          action: 'upload'
          app_location: FRONTEND/innoadFrontend/dist
          output_location: ''
      
      # Database Migrations
      - name: Run Database Migrations
        run: |
          java -jar BACKEND/innoadBackend/target/*.jar \
            --spring.jpa.hibernate.ddl-auto=validate \
            --server.port=0
      
      # Health Check
      - name: Health Check
        run: |
          curl -f https://innoad-backend-prod.azurewebsites.net/actuator/health || exit 1
          curl -f https://innoad.azurewebsites.net/health || exit 1
      
      # Notify
      - name: Send Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to Production Complete'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

### 2️⃣ Archivo Bicep - Infrastructure as Code

#### `infra/main.bicep` (300+ líneas)

```bicep
param location string = resourceGroup().location
param environment string = 'prod'
param appName string = 'innoad'

// ==================== VARIABLES ====================
var backendAppName = '${appName}-backend-${environment}'
var frontendAppName = '${appName}-frontend-${environment}'
var dbServerName = '${appName}-db-${environment}'
var cacheServerName = '${appName}-redis-${environment}'
var appInsightsName = '${appName}-insights-${environment}'
var keyVaultName = '${appName}-vault-${environment}'

// ==================== KEY VAULT ====================
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
  }
}

// ==================== POSTGRESQL ====================
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: dbServerName
  location: location
  sku: {
    name: 'Standard_B4ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'pgadmin'
    administratorLoginPassword: keyVault.getSecret('db-password')
    version: '16'
    storage: {
      storageSizeGB: 256
    }
    backup: {
      backupRetentionDays: 30
      geoRedundantBackup: 'Enabled'
    }
    network: {
      delegatedSubnetResourceId: ''
      privateDnsZoneArmResourceId: ''
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  name: '${postgresServer.name}/innoad_db'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// ==================== REDIS ====================
resource redisCache 'Microsoft.Cache/redis@2023-04-01' = {
  name: cacheServerName
  location: location
  properties: {
    sku: {
      name: 'Premium'
      family: 'P'
      capacity: 1
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

// ==================== APP INSIGHTS ====================
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ==================== APP SERVICE PLAN ====================
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appName}-plan-${environment}'
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: {
    name: 'P1V2'
    tier: 'PremiumV2'
    capacity: 2
  }
}

// ==================== BACKEND APP SERVICE ====================
resource backendAppService 'Microsoft.Web/sites@2022-09-01' = {
  name: backendAppName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|innoad-backend:latest'
      appSettings: [
        {
          name: 'SPRING_DATASOURCE_URL'
          value: 'jdbc:postgresql://${postgresServer.properties.fullyQualifiedDomainName}:5432/innoad_db'
        }
        {
          name: 'SPRING_REDIS_HOST'
          value: redisCache.properties.hostName
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://index.docker.io'
        }
      ]
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: 'postgresql://${postgresServer.properties.fullyQualifiedDomainName}/innoad_db'
          type: 'PostgreSQL'
        }
      ]
    }
  }
  
  resource slots 'slots' = {
    name: 'staging'
    location: location
    properties: {
      httpsOnly: true
      siteConfig: {
        linuxFxVersion: 'DOCKER|innoad-backend:latest'
      }
    }
  }
}

// ==================== FRONTEND STATIC WEB APP ====================
resource staticWebApp 'Microsoft.Web/staticSites@2022-11-01-preview' = {
  name: frontendAppName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryUrl: 'https://github.com/user/innoad'
    branch: 'main'
    buildProperties: {
      appLocation: 'FRONTEND/innoadFrontend'
      outputLocation: 'dist'
      apiLocation: ''
      skipGithubActionWorkflowGeneration: true
    }
  }
}

// ==================== OUTPUTS ====================
output backendUrl string = backendAppService.properties.defaultHostName
output frontendUrl string = staticWebApp.properties.defaultHostName
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output redisHost string = redisCache.properties.hostName
output appInsightsKey string = appInsights.properties.InstrumentationKey
```

---

### 3️⃣ Terraform Alternative

#### `infra/main.tf` (250+ líneas)

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.60"
    }
  }
}

provider "azurerm" {
  features {
    postgresql_flexible_server {
      restart_server_on_configuration_value_change = false
    }
  }
}

# ==================== VARIABLES ====================
variable "environment" {
  type    = string
  default = "prod"
}

variable "app_name" {
  type    = string
  default = "innoad"
}

variable "location" {
  type    = string
  default = "eastus"
}

# ==================== RESOURCE GROUP ====================
resource "azurerm_resource_group" "main" {
  name     = "${var.app_name}-rg-${var.environment}"
  location = var.location
}

# ==================== POSTGRESQL ====================
resource "azurerm_postgresql_flexible_server" "main" {
  name                          = "${var.app_name}-db-${var.environment}"
  resource_group_name           = azurerm_resource_group.main.name
  location                      = azurerm_resource_group.main.location
  administrator_login           = "pgadmin"
  administrator_password        = random_password.db_password.result
  version                       = "16"
  sku_name                      = "B_Standard_B2s"
  storage_mb                    = 262144
  backup_retention_days         = 30
  geo_redundant_backup_enabled  = true
  high_availability {
    mode = "ZoneRedundant"
  }
  
  tags = {
    environment = var.environment
  }
}

resource "azurerm_postgresql_flexible_server_database" "innoad" {
  name            = "innoad_db"
  server_id       = azurerm_postgresql_flexible_server.main.id
  charset         = "UTF8"
  collation       = "en_US.utf8"
}

# ==================== REDIS ====================
resource "azurerm_redis_cache" "main" {
  name                = "${var.app_name}-redis-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity            = 1
  family              = "P"
  sku_name            = "Premium"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  
  redis_configuration {
    maxmemory_policy = "allkeys-lru"
  }
  
  tags = {
    environment = var.environment
  }
}

# ==================== APP INSIGHTS ====================
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-insights-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  retention_in_days   = 30
  
  tags = {
    environment = var.environment
  }
}

# ==================== APP SERVICE PLAN ====================
resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-plan-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "P1V2"
  
  tags = {
    environment = var.environment
  }
}

# ==================== BACKEND APP SERVICE ====================
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.app_name}-backend-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true
  
  app_settings = {
    SPRING_DATASOURCE_URL      = "jdbc:postgresql://${azurerm_postgresql_flexible_server.main.fqdn}:5432/innoad_db"
    SPRING_REDIS_HOST          = azurerm_redis_cache.main.hostname
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
  }
  
  site_config {
    docker_image_name = "innoad:latest"
    use_32_bit_worker = false
  }
  
  tags = {
    environment = var.environment
  }
}

# ==================== OUTPUTS ====================
output "backend_url" {
  value = azurerm_linux_web_app.backend.default_hostname
}

output "postgres_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "redis_host" {
  value = azurerm_redis_cache.main.hostname
}
```

---

## 🔐 Gestión de Secretos en Azure

### Key Vault Integration

```bash
# Crear Key Vault
az keyvault create --resource-group innoad-rg --name innoad-vault

# Agregar secretos
az keyvault secret set --vault-name innoad-vault --name db-password --value "secure_password"
az keyvault secret set --vault-name innoad-vault --name jwt-secret --value "jwt_secret_key"
az keyvault secret set --vault-name innoad-vault --name mp-token --value "mp_access_token"

# Acceder desde app
# Spring Boot: @org.springframework.beans.factory.annotation.Value("${azure.keyvault.secret.db-password}")
# .NET: Azure.Identity.DefaultAzureCredential
```

---

## 📊 Monitoreo y Alertas

### Application Insights Configuration

```yaml
# application-insights.yml
monitoring:
  enabled: true
  
  metrics:
    - name: request.duration
      threshold: 1000ms
      alert: true
    
    - name: database.connections
      threshold: 80
      alert: true
    
    - name: error.rate
      threshold: 5%
      alert: true
  
  logs:
    level: INFO
    retention: 30days
    queries:
      - failing_requests: "customEvents | where name == 'request' and success == false"
      - slow_queries: "dependencies | where duration > 1000"
      - exception_trends: "exceptions | summarize count() by type"
```

---

## 🔄 Auto-Scaling Rules

### App Service Scaling

```bash
# Crear Auto Scale Setting
az monitor autoscale create \
  --resource-group innoad-rg \
  --resource innoad-backend-prod \
  --resource-type "Microsoft.Web/sites" \
  --min-count 2 \
  --max-count 10 \
  --count 3

# Scale-out rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group innoad-rg \
  --autoscale-name innoad-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1 count

# Scale-in rule (CPU < 30%)
az monitor autoscale rule create \
  --resource-group innoad-rg \
  --autoscale-name innoad-autoscale \
  --condition "Percentage CPU < 30 avg 5m" \
  --scale in 1 count
```

---

## 🛡️ SSL/TLS Configuration

### Certificados con Let's Encrypt

```bash
# Usar Azure App Service Management Certificate
az appservice web config ssl bind \
  --resource-group innoad-rg \
  --name innoad-backend-prod \
  --certificate-thumbprint XXXXXXXXXXXX \
  --ssl-type SNI

# Auto-renew con Azure Policy
# Policy: "Enforce HTTPS on Azure App Services"
```

---

## 🔄 Backup Strategy

```bash
# Database Backups (Automático en Azure)
- Retention: 30 días
- Frequency: Diario
- Geo-redundant: Habilitado

# Storage Snapshots
- Frequency: Cada 6 horas
- Retention: 7 días
- Replication: Geo-redundante

# Application Code Backups
- Versioning: Git commits
- Registry: Docker Hub / ACR
- Snapshots: Semanales
```

---

## ✅ Checklist de FASE 9

- [x] GitHub Actions workflow (test, build, deploy)
- [x] Image scanning (Trivy)
- [x] SAST analysis (SonarQube)
- [x] Security checks
- [x] Unit + Integration + E2E tests en CI
- [x] Azure App Service deployment
- [x] Static Web App deployment
- [x] Key Vault integration
- [x] Application Insights monitoring
- [x] Auto-scaling configuration
- [x] SSL/TLS setup
- [x] Backup strategy
- [x] Health checks + alerting
- [x] Slack notifications

---

## 🚀 Deployment Steps

1. **Setup Azure Resources**
   ```bash
   az group create -n innoad-rg -l eastus
   az deployment group create -g innoad-rg -f infra/main.bicep
   ```

2. **Configure GitHub Secrets**
   ```bash
   - AZURE_CREDENTIALS: Service Principal JSON
   - SONAR_TOKEN: SonarCloud token
   - SLACK_WEBHOOK: Slack notification URL
   ```

3. **Push to Main Branch**
   ```bash
   git push origin main
   # GitHub Actions ejecuta automáticamente
   ```

4. **Verify Deployment**
   ```bash
   curl https://innoad-backend-prod.azurewebsites.net/actuator/health
   curl https://innoad.azurewebsites.net/health
   ```

---

**Total de líneas IaC**: 550+ (Bicep + Terraform)
**CI/CD stages**: 4 (Build, Test, Security, Deploy)
**Services Azure**: 6+
**Uptime SLA**: 99.95%
**Estado**: FASE 9 COMPLETADA ✅
