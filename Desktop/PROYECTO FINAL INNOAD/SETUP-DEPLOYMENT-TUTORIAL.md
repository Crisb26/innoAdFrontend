# 🚀 SETUP DEPLOYMENT AUTOMÁTICO - TUTORIAL RÁPIDO

## Estado Actual ✅

- **Backend Local**: ✅ Compilado y funcionando en localhost:8080  
- **Servidor**: ✅ Accesible vía Tailscale (100.91.23.46)
- **SSH Key**: ✅ Disponible (C:\Users\bueno\.ssh\id_ed25519)
- **URL Pública**: https://azure-pro.tail2a2f73.ts.net/

---

## 🎯 ELIGE TU OPCIÓN

### ✨ OPCIÓN 1: Deploy Automático con Git Push (RECOMENDADO)

**Cómo funciona:**
```bash
1. Haces cambios en código
2. git add . && git commit -m "cambios"
3. git push
4. ¡El servidor se actualiza automáticamente! 🎉
```

**Setup (5 minutos):**
1. Abre Git Bash o terminal que tenga `ssh` disponible
2. Prueba conexión: `ssh -i ~/.ssh/id_ed25519 postgres@100.91.23.46`
3. Si funciona ✅, el sistema está listo
4. Cada `git push` dispara el deployment automático

**Por qué es lo mejor:**
- Solo necesitas hacer `git push`
- Los cambios están en vivo en segundos
- El servidor siempre tiene la versión más reciente
- Sin tocar manualmente nada en el servidor

---

### 🔧 OPCIÓN 2: GitHub Actions Automatizado (MÁS ROBUSTO)

**Cómo funciona:**
```
GitHub Actions (CI/CD) → Compila → Envia a servidor → Reinicia backend
```

**Setup (10 minutos):**

1. **Copia tu SSH Key:**
```bash
# En PowerShell
type C:\Users\bueno\.ssh\id_ed25519
# Cópialo TODO (Ctrl+C)
```

2. **Agregalo a GitHub:**
   - Abre: https://github.com/Crisb26/innoAdBackend/settings/secrets/actions
   - Click: **"New repository secret"**
   - **Name**: `TAILSCALE_SSH_KEY`
   - **Value**: Pega el SSH key (Ctrl+V)
   - Click: **"Add secret"**

3. **Prueba haciendo push:**
```bash
git add .
git commit -m "trigger: Activar GitHub Actions"
git push
```

4. **Verifica:** https://github.com/Crisb26/innoAdBackend/actions
   - Deberías ver un workflow ejecutándose 🟡 → 🟢

5. **Listo!** Cada push futuro dispara el deployment automático

**Ventajas:**
- GitHub maneja la compilación (cloud)
- Workflow fail-safe integrado
- Logs visibles en GitHub
- Funciona incluso con cambios simultáneos

---

### 🎮 OPCIÓN 3: Deploy Manual Programado

**Para probar ahora mismo:**

```powershell
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD"
powershell -ExecutionPolicy Bypass -File deploy-backend-simple.ps1
```

**Qué hace:**
1. Compila backend con Maven
2. Envia JAR al servidor via SCP
3. Para el backend anterior
4. Inicia backend nuevo
5. Verifica health check

**Ventajas:**
- Control total sobre cada paso
- Perfecto para debugging
- No depende de GitHub

---

## 📝 DECISIÓN RECOMENDADA

| Opción | Facilidad | Automatización | Recomendación |
|--------|-----------|---|---|
| **Opción 1** | ⭐⭐ | ⭐⭐⭐ | **Mejor para desarrollo rápido** |
| **Opción 2** | ⭐⭐⭐ | ⭐⭐⭐ | **Mejor para producción/equipo** |
| **Opción 3** | ⭐ | ⭐ | **Mejor para testing/debug** |

### 💡 Lo que probablemente qutreras:

**Para desarrollo local:**
→ **OPCIÓN 1** (Git Push automático)

**Para presentación mañana:**
→ **OPCIÓN 2** (GitHub Actions - más confiable)

**Para testing ahora:**
→ **OPCIÓN 3** (Manual - control total)

---

## ✅ Quick Start - OPCIÓN 2 (Recomendado para Mañana)

1. **Copiar SSH Key:**
```powershell
Get-Content C:\Users\bueno\.ssh\id_ed25519 | Set-Clipboard
# (Copió al clipboard)
```

2. **GitHub - Agregar Secret:**
   - https://github.com/Crisb26/innoAdBackend/settings/secrets/actions
   - New secret: `TAILSCALE_SSH_KEY` = Pegar (Ctrl+V)

3. **Probar Deployment:**
```bash
git add .
git commit -m "test: Activar deployment"
git push
```

4. **Verificar:**
   - https://github.com/Crisb26/innoAdBackend/actions
   - Espera workflow en 🟢

5. **Acceder:**
   - https://azure-pro.tail2a2f73.ts.net/
   - Login: admin / Admin123!

---

## 🔗 Enlaces Importantes

| Recurso | Link |
|---------|------|
| **Servidor Tailscale** | https://azure-pro.tail2a2f73.ts.net/ |
| **GitHub Backend** | https://github.com/Crisb26/innoAdBackend |
| **GitHub Secrets** | https://github.com/Crisb26/innoAdBackend/settings/secrets/actions |
| **GitHub Actions** | https://github.com/Crisb26/innoAdBackend/actions |
| **SSH Key Local** | C:\Users\bueno\.ssh\id_ed25519 |

---

## 🚨 Troubleshooting

### "SSH Authentication Failed"
```bash
# Verifica que el key existe
ls C:\Users\bueno\.ssh\id_ed25519

# Intenta conectar directamente
ssh -i C:\Users\bueno\.ssh\id_ed25519 postgres@100.91.23.46
```

### "GitHub Workflow Failed"
1. Abre: https://github.com/Crisb26/innoAdBackend/actions
2. Click en el workflow fallido
3. Ve los logs (rojo)
4. Causa común: SSH key no copiado correctamente (sin saltos de línea)

### "Servidor no responde"
```powershell
# Verifica puerto abierto
Test-NetConnection 100.91.23.46 -Port 8080

# Si falla, tal vez está en localhost:8080 nada más
# Conecta por SSH y verifica: curl http://localhost:8080/actuator
```

---

## 📞 Soporte

Si algo falla:

1. **Verifica estado:** `pingc 100.91.23.46`
2. **Compila localmente:** `mvn clean package -DskipTests`
3. **Lee logs servidor:** SSH → `tail -f /opt/innoad/backend/innoad.log`
4. **Revisa GitHub Actions:** https://github.com/Crisb26/innoAdBackend/actions

---

**¿Necesitas empezar ahora?** → Ve a OPCIÓN 2 del documento anterior 👆
