# COORDINACIÓN DEPLOYMENT - BETHO + TÚ

## 🎯 OBJETIVO
Actualizar servidor con backend compilado que arregla login de admin.

## 📋 CHECKLIST DE COORDINACIÓN

### FASE 1: PREPARACIÓN (5 min)

**TÚ:**
- [x] Backend compilado ✅ (95 MB JAR listo)
- [ ] Envía `INSTRUCCIONES-PARA-BETHO.md` a Betho
- [ ] Espera confirmación de Betho

**BETHO:**
- [ ] Recibe instrucciones
- [ ] Lee `INSTRUCCIONES-PARA-BETHO.md`
- [ ] Confirma: "Listo para conectarme"

**Estado:** Esperando que Betho confirme

---

### FASE 2: SERVIDOR PREPARADO (5 min)

**BETHO:**
- [ ] Conecta: `ssh postgres@100.91.23.46`
- [ ] Ejecuta PASO 2 completo
- [ ] Verifica: `pwd` retorna `/opt/innoad/backend`
- [ ] **AVISA: "Listo para recibir JAR"**

**TÚ:**
- ⏳ Espera el mensaje de Betho

**Estado:** Esperando confirmación de Betho

---

### FASE 3: ENVIAR JAR (3 min)

**TÚ** (cuando Betho diga "Listo"):
```bash
scp "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar" postgres@100.91.23.46:/opt/innoad/backend/
# Contraseña: postgres123
```

- [ ] Comando ejecutado
- [ ] Ver progreso: `innoad-backend-2.0.0.jar 100% ... 01:15`
- [ ] Terminó sin errores
- [ ] **AVISA a Betho: "JAR enviado!"**

**BETHO:**
- ⏳ Espera mensaje

**Estado:** JAR en tránsito

---

### FASE 4: VERIFICAR ARCHIVO (1 min)

**BETHO** (cuando TÚ digas "JAR enviado"):
```bash
# Ejecuta PASO 3 - Verificar archivo
ls -lah /opt/innoad/backend/innoad-backend-2.0.0.jar
```

- [ ] Archivo visible
- [ ] Size ~95 MB
- [ ] **AVISA: "Archivo OK! Iniciando backend"**

**TÚ:**
- ⏳ Espera

**Estado:** Archivo verificado

---

### FASE 5: INICIAR BACKEND (1 min)

**BETHO** (ejecuta PASO 4):
```bash
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &
sleep 5
curl -s http://localhost:8080/actuator/health | head -c 100
```

- [ ] Backend inicia
- [ ] `curl` retorna JSON
- [ ] **AVISA: "Backend corriendo!"**

**TÚ:**
- [ ] Recibe confirmación

**Estado:** Backend activo

---

### FASE 6: VERIFICACIÓN FINAL (2 min)

**TÚ:**
```bash
curl http://100.91.23.46:8080/actuator/health
```

- [ ] Retorna JSON
- [ ] Abre navegador: https://azure-pro.tail2a2f73.ts.net/
- [ ] **Recarga: Ctrl+F5**
- [ ] Login: admin / Admin123!
- [ ] ✅ FUNCIONA

**BETHO:**
- ⏳ Espera confirmación

**Estado:** DEPLOYMENT EXITOSO! 🎉

---

## 💬 MENSAJES DE ESTADO

Puedes copiar/pegar estos mensajes para coordinar:

### BETHO → TÚ:
```
✓ Conectado al servidor
✓ PASO 2 completado
✓ Listo para recibir JAR
```

### TÚ → BETHO:
```
✓ Iniciando SCP...
✓ JAR enviado!
```

### BETHO → TÚ:
```
✓ Archivo verificado (95 MB)
✓ Iniciando backend
✓ Backend corriendo!
```

### TÚ → SYSTEM:
```
✓ Login de admin funciona!
✓ ¡DEPLOYMENT EXITOSO!
```

---

## 🚨 PLAN B - SI ALGO FALLA

### Si SCP falla:
- Betho intenta: `ssh paste` para recibir file por stdin
- O usar `nc` (netcat) para transferir

### Si backend no inicia:
- Betho: `tail -50 innoad.log`
- Buscar error específico
- Posibles causas: puerto usado, BD caída, JAR corrupto

### Si timeout:
- Betho intenta de nuevo: `pkill java; sleep 2; nohup java...`
- O verifica proceso: `ps aux | grep java`

---

## ✅ AHORA...

**Envíale a BETHO:**

Copia este texto:
```
Hola Betho! 

Necesito tu ayuda con deployment urgente al servidor.

Lee este archivo: 
INSTRUCCIONES-PARA-BETHO.md

Son 4 pasos simples. Te avisaremos en cada uno.

¿Conectado al servidor?
```

**Y comparte los archivos:**
- `INSTRUCCIONES-PARA-BETHO.md`
- Este archivo

---

## 📞 CONTACTO

| Necesidad | Acción |
|-----------|--------|
| Betho no responde | Busca otro acceso al servidor |
| SCP falla | Intenta FileZilla o WinSCP |
| Backend muere | Revisar logs del servidor |
| No funciona nada | Volver a compilar con `mvn clean package` |

---

**Estado:**  ⏳ ESPERANDO CONFIRMACIÓN DE BETHO
