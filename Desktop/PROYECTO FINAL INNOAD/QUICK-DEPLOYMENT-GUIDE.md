# DEPLOYMENT INMEDIATO - PASOS PARA HOY

## 🎯 OBJETIVO
Admin puede loginear (case-insensitive) mañana en la presentación.

---

## STEP 1: COMPARTIR CON BETHO ✅

```bash
# Envíale por Slack/Email:

Archivos:
1. INSTRUCCIONES-PARA-BETHO.md
2. COORDINACION-DEPLOYMENT.md

Mensaje:
"Hola Betho, necesito que conectes al servidor para un deployment urgente.
Lee INSTRUCCIONES-PARA-BETHO.md y avísame cuando esté lista la infraestructura.
Gracias!"
```

**Status:** ⏳ Esperando "Listo" de Betho

---

## STEP 2: BETHO PREPARA SERVIDOR

Betho debe ejecutar en terminal:

```bash
ssh postgres@100.91.23.46
# password: postgres123

# Kill old java:
pkill java
sleep 2

# Create directory:
mkdir -p /opt/innoad/backend
cd /opt/innoad/backend
pwd  # Should show: /opt/innoad/backend

# Message back: "Listo para recibir JAR"
```

**Status:** ⏳ Esperando confirmación de Betho

---

## STEP 3: TÚ ENVÍAS JAR (cuando Betho diga "Listo")

En PowerShell en tu máquina:

```powershell
scp "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar" postgres@100.91.23.46:/opt/innoad/backend/
# Password when prompted: postgres123
```

Verás:
```
innoad-backend-2.0.0.jar          | 95 MB | 01:15
```

**Status:** ⏳ Archivo transferiendo (~2-3 min)

---

## STEP 4: BETHO VERIFICA ARCHIVO

```bash
ls -lah /opt/innoad/backend/innoad-backend-2.0.0.jar
# Should show: ~95 MB, timestamp = now

# Message back: "Archivo OK! Iniciando backend"
```

**Status:** ⏳ Archivo verificado

---

## STEP 5: BETHO INICIA BACKEND

```bash
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &
sleep 5

# Verify it started:
curl http://localhost:8080/actuator/health

# Should return JSON like:
# {"status":"UP","components":{"db":{"status":"UP"},...}}

# Message back: "Backend corriendo! Status: UP"
```

**Status:** ⏳ Backend iniciando (~10-15 sec)

---

## STEP 6: TÚ VERIFICAS VÍA CURL

```powershell
# Check backend health from your PC:
curl http://100.91.23.46:8080/actuator/health
```

Expected: JSON with `"status":"UP"`

**Status:** ✅ Backend respondiendo

---

## STEP 7: TÚ PRUEBAS LOGIN EN WEB UI

1. Abre navegador: https://azure-pro.tail2a2f73.ts.net/
2. Presiona: **Ctrl+F5** (fuerza reload sin cache)
3. Login con:
   - Username: `admin`
   - Password: `Admin123!`

Expected: 
- ✅ NO error 400
- ✅ Dashboard carga
- ✅ Ves menú principal

**Status:** ✅ DEPLOYMENT EXITOSO!

---

## TIMELINE TOTAL

| Paso | Quién | Duración | Acumulado |
|------|-------|----------|-----------|
| 1. Compartir | TÚ | <1 min | <1 min |
| 2. Prep servidor | BETHO | 2 min | 2 min |
| 3. Enviar JAR | TÚ | 3 min | 5 min |
| 4. Verificar | BETHO | 1 min | 6 min |
| 5. Iniciar | BETHO | 1 min | 7 min |
| 6. Verificar curl | TÚ | 1 min | 8 min |
| 7. Web test | TÚ | 2 min | 10 min |

**TOTAL: ~10-15 minutos** from start to admin login working ✅

---

## 🚨 TROUBLESHOOTING

### "SCP: Permission denied"
- Verify password: `postgres123`
- Betho must have created directory `/opt/innoad/backend`
- Try: `ssh postgres@100.91.23.46 "ls -la /opt/innoad/backend"`

### "Backend doesn't start"
- Betho checks logs: `tail -50 innoad.log`
- Look for error message
- Kill it: `pkill java`
- Restart: `cd /opt/innoad/backend && nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &`

### "Login still returns 400"
- Clear browser cache: **Ctrl+F5**
- Check if JAR file is actually 95 MB: `ls -lah *.jar`
- If <10 MB, SCP transfer failed, redo step 3

### "Can't reach server"
- Verify Tailscale: `tailscale status | findstr azure-pro`
- Should show: `100.91.23.46    azure-pro    ...    active`
- If not, restart Tailscale or reconnect

---

## 📋 QUICK CHECKBOX

```
ANTES DE INICIAR:
☐ Betho tiene acceso al servidor
☐ JAR está compilado (95 MB)
☐ Tienes contraseña servidor: postgres123

DURANTE COORDINACIÓN:
☐ Enviaste instrucciones a Betho
☐ Betho confirmó "Listo"
☐ SCP transfirió sin errores
☐ Betho verificó archivo OK
☐ Backend iniciado

DESPUÉS:
☐ curl health check = UP
☐ Web UI carga (Ctrl+F5)
☐ Admin login funciona
☐ ¡LISTO PARA MAÑANA!
```

---

## 💡 PRO TIPS

1. **Mantén Betho informado**: Envíale mensajes cortos en cada paso
2. **Mira los logs si falla**: `tail -50 innoad.log` es tu amigo
3. **Timeout normal**: Transferencia de 95 MB puede tomar 2-3 minutos
4. **Backend need time**: Después de iniciar, espera 10-15 seg antes de probar
5. **Cache es el enemigo**: SIEMPRE Ctrl+F5 en navegador después de deployment

---

**Creado:** Hoy para presentación mañana
**Status:** ✅ Listo para ejecutar
**Next:** ¡Contacta a Betho ahora mismo!
