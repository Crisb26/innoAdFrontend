# 🚀 DESPLIEGUE A TAILSCALE SERVER (azure-pro) - URGENTE

## ⚠️ SITUACIÓN ACTUAL

✅ Cambios implementados localmente y pusheados a GitHub:
- Dark mode toggle (🌙☀️)
- Panel técnico reparado
- Perfil editable mejorado
- Método de pago actualizado
- Errores 404 reducidos

❌ PERO: Los cambios NO están en producción (https://azure-pro.tail2a2f73.ts.net/)

**Razón**: No hay pipeline de deployment automático a Tailscale. Solo están configurados:
- Netlify (para staging, no producción)
- Docker Compose manual

---

## 🔧 SOLUCIÓN: Configurar GitHub Actions para Tailscale

### PASO 1: Obtener SSH Key

Tu SSH key ya existe en: `C:\Users\bueno\.ssh\id_ed25519`

**Para obtener el contenido:**
```bash
# En PowerShell o Git Bash:
type C:\Users\bueno\.ssh\id_ed25519

# En WSL o Linux:
cat ~/.ssh/id_ed25519
```

Deberías ver algo como:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[contenido aquí]
-----END OPENSSH PRIVATE KEY-----
```

⚠️ **IMPORTANTE**:
- Este archivo contiene tu clave privada SSH
- NUNCA la compartas públicamente
- NUNCA la commits a GitHub en archivos de código
- Solo úsala como secret en GitHub Actions

---

### PASO 2: Agregar SSH Key a GitHub Secrets

#### 2.1 Ir a tu repositorio en GitHub

1. Abre: https://github.com/Crisb26/innoAdFrontend
2. Ve a: **Settings** → **Secrets and variables** → **Actions**

#### 2.2 Crear nuevo Secret

1. Click en **"New repository secret"**
2. **Name**: `TAILSCALE_SSH_KEY`
3. **Value**: Copia todo el contenido del SSH key (desde `-----BEGIN` hasta `-----END`)
4. Click **"Add secret"**

#### 2.3 Verificar

Deberías ver `TAILSCALE_SSH_KEY` en la lista de secrets.

---

### PASO 3: ✅ Workflows ya están en GitHub

✅ **COMPLETADO**: Los workflows ya han sido creados, committeados y pusheados:

**Frontend Workflow:**
- 📍 Ubicación: `.github/workflows/deploy-tailscale.yml`
- 🔗 GitHub: https://github.com/Crisb26/innoAdFrontend/blob/develop/.github/workflows/deploy-tailscale.yml
- 📝 Commit: https://github.com/Crisb26/innoAdFrontend/commit/323d700

**Backend Workflow:**
- 📍 Ubicación: `.github/workflows/deploy-tailscale.yml`
- 🔗 GitHub: https://github.com/Crisb26/innoAdBackend/blob/develop/.github/workflows/deploy-tailscale.yml
- 📝 Commit: https://github.com/Crisb26/innoAdBackend/commit/599b906

---

### PASO 4: Verificar que todo esté funcionando

**IMPORTANTE: Los workflows están en la rama `develop`, NO en `main`**

1. Ve a tu repositorio en GitHub (Frontend o Backend)
2. Asegúrate de estar viendo la rama **develop**
3. Click en la pestaña **Actions**
4. Deberías ver los workflows cuando hagas push a develop

**Estados posibles:**
- 🟡 **En progreso**: Está desplegando
- 🟢 **Éxito**: Despliegue completado
- 🔴 **Error**: Algo falló (revisar logs)

---

## 📋 CHECKLIST PARA MAÑANA

Antes de la presentación:

- [ ] SSH Key agregada a GitHub Secrets (`TAILSCALE_SSH_KEY`)
- [ ] Workflows committeados y pusheados
- [ ] GitHub Actions ejecutó exitosamente
- [ ] Acceder a https://azure-pro.tail2a2f73.ts.net/ y verificar:
  - [ ] Dark mode toggle (🌙☀️) visible en navbar
  - [ ] Panel técnico con 5 pestañas
  - [ ] Perfil editable con botón guardar visible
  - [ ] Método de pago como "código de pago"
  - [ ] Poder loguear con admin/Admin123!
  - [ ] Sistema funcionando sin errores

---

## 🆘 SI FALLA EL DEPLOYMENT

### Error: "Permission denied (publickey)"

**Causa**: SSH key no está en GitHub Secrets correctamente

**Solución**:
1. Verifica que copiaste TODO el key (incluyendo `-----BEGIN` y `-----END`)
2. No debe haber espacios extra al principio o final
3. Re-crea el secret

### Error: "Host key verification failed"

**Causa**: Tailscale machine no está en known_hosts

**Solución**: El workflow lo hace automáticamente, pero si falla:

```bash
ssh-keyscan -H 100.91.23.46 >> ~/.ssh/known_hosts
```

### Error: "Service not found" o "404"

**Causa**: El servicio se reinició pero aún no está lista

**Solución**: Espera 30-60 segundos y recarga la página

---

## ⚡ DESPLIEGUE MANUAL (Si GitHub Actions falla)

Si GitHub Actions no funciona, puedes desplegar manualmente:

```bash
# 1. SSH al servidor Tailscale
ssh vboxuser@100.91.23.46

# 2. Dentro del servidor, actualizar código
cd /home/vboxuser/innoad
git pull origin main

# 3. Reconstruir frontend
cd FRONTEND/innoadFrontend
npm install
npm run build

# 4. Reconstruir backend
cd ../../BACKEND
mvn clean package -DskipTests

# 5. Reiniciar servicios
docker-compose -f ../../docker-compose.server.yml restart

# O si no usas Docker:
sudo systemctl restart innoad-frontend innoad-backend
```

---

## 📍 DIRECCIONES IMPORTANTES

**Producción (Tailscale Funnel)**:
- URL: https://azure-pro.tail2a2f73.ts.net/
- IP Tailscale: 100.91.23.46
- Usuario SSH: vboxuser
- SSH Key: ~/.ssh/id_ed25519

**Desarrollo Local**:
- Frontend: http://localhost:4200
- Backend: http://localhost:8080

---

## ✅ RESUMEN DE LOS CAMBIOS IMPLEMENTADOS

### 1. Dark Mode (🌙☀️)
- Implementado con Angular Signals
- Persiste en localStorage
- Detección automática de preferencia del sistema

### 2. Panel Técnico Reparado
- Ya no redirige a home
- Muestra 5 pestañas funcionales
- Acceso correcto por rol

### 3. Perfil Editable Mejorado
- Botón guardar ahora visible
- Scroll funcionando correctamente
- Upload de foto funcional

### 4. Método de Pago Actualizado
- Cambio de "contra entrega" a "código de pago"
- Integración con carrito de compras
- Validación de pagos actualizada

### 5. Errores 404 Reducidos
- Endpoints opcionales no muestran alertas
- Solo alertas para endpoints críticos
- Mejor UX sin spam de errores

---

## 🎯 PRÓXIMOS PASOS

1. **HOY**: Agregar SSH key a GitHub Secrets
2. **HOY**: Commit de workflows y push
3. **MAÑANA TEMPRANO**: Verificar que despliegue fue exitoso
4. **MAÑANA**: Acceder a https://azure-pro.tail2a2f73.ts.net/ y hacer demo
5. **MAÑANA**: Presentar a instructor con todos los cambios en vivo

---

## 📞 SOPORTE

Si algo falla:

1. Revisa los logs en GitHub Actions
2. Verifica que Tailscale está corriendo en la máquina
3. Verifica que el SSH key es correcto
4. Intenta deployment manual si es necesario

**Importante**: La SSH key debe estar EXACTAMENTE como está en el archivo, sin espacios extra ni caracteres agregados.
