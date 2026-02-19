# MANUAL DEPLOYMENT - SOLUCIÓN MANUAL AL SERVIDOR

## Situación Actual
- SSH del servidor está funcionando
- Servidor pide contraseña de `postgres`
- Windows SSH Agent no está inicializado
- Necesitas hacer deployment urgente

## OPCIÓN 1: Deployment Manual (5 minutos)

### Paso 1: SSH al servidor
```bash
ssh postgres@100.91.23.46
# Te pedirá contraseña: postgres123 (o la que hayas configurado)
```

### Paso 2: En el servidor, ejecuta:
```bash
# Detener backend anterior
pkill -f "java.*innoad-backend" 2>/dev/null || true
sleep 2

# Ver que esté detenido
ps aux | grep java

# Mostrar ruta
echo "Preparando /opt/innoad/backend..."
mkdir -p /opt/innoad/backend
cd /opt/innoad/backend

# Ver que el directorio existe
ls -la /opt/innoad/backend
```

### Paso 3: En TU MÁQUINA (otra terminal), envía JAR
```bash
# Desde tu PC local
scp "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar" postgres@100.91.23.46:/opt/innoad/backend/

# Te pedirá contraseña: postgres123
```

### Paso 4: De vuelta en servidor, inicia backend
```bash
cd /opt/innoad/backend
java -jar innoad-backend-2.0.0.jar &
# O en background:
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &

# Verifica que inició
sleep 5
curl http://localhost:8080/actuator/health

# Si ves JSON = OK!
```

---

## OPCIÓN 2: Usando Betho (Si Betho puede acceder al servidor)

Si "Betho" tiene acceso directo al servidor, pidele:

1. Conectarse al servidor por SSH
2. Ejecutar estos comandos:
```bash
pkill -f java
sleep 2
mkdir -p /opt/innoad/backend

# Luego, tú envías el JAR:
scp BACKEND/target/innoad-backend-2.0.0.jar betho@SERVIDOR:/opt/innoad/backend/

# Betho ejecuta en servidor:
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &
sleep 5
curl http://localhost:8080/actuator/health
```

---

## OPCIÓN 3: Usar SSH con Contraseña Guardada

Si tienes `sshpass` instalado (Windows):

```bash
sshpass -p "postgres123" scp -o StrictHostKeyChecking=no "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar" postgres@100.91.23.46:/tmp/

sshpass -p "postgres123" ssh -o StrictHostKeyChecking=no postgres@100.91.23.46 "cd /opt/innoad/backend && nohup java -jar /tmp/innoad-backend-2.0.0.jar > innoad.log 2>&1 &"
```

Para instalar sshpass (en terminal):
```powershell
# Windows con Chocolatey:
choco install sshpass

# O descargar: https://sourceforge.net/projects/sshpass/
```

---

## VERIFICACIÓN FINAL

Una vez que el backend esté corriendo en el servidor:

```bash
# En servidor:
curl http://localhost:8080/actuator/health

# Debería retornar:
# {"status":"UP",...}
```

Luego:
1. Abre https://azure-pro.tail2a2f73.ts.net/
2. Recarga página: Ctrl+F5 (limpiar cache)
3. Login:
   - Usuario: admin
   - Contraseña: Admin123!

---

## Credenciales Reminder

- **Servidor SSH**: 100.91.23.46
- **Usuario**: postgres
- **Contraseña BD**: postgres123
- **JAR**: C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar
- **Directorio servidor**: /opt/innoad/backend

---

## Si algo falla

### Error: "Connection refused"
→ El backend no está corriendo. Intenta de nuevo el Paso 4

### Error: "404 Not Found"
→ El servidor aún corre el JAR viejo
→ Mata el proceso y copia el JAR nuevo
→ Inicia de nuevo

### Error: "Bad Request" en login
→ El JAR es viejo
→ La base de datos no está actualizada
→ Admin sigue bloqueado

**Solución**: Asegúrate de que copias el JAR **CORRECTO** del 16/02/2026 compilado hoy

### Error: "Credenciales inválidas"
→ Probablemente un admin/tecnico tiene datos conflictivos
→ Conecta a la BD y verifica:
```bash
psql -U postgres -d innoad_db -c "SELECT * FROM usuarios WHERE nombre_usuario = 'admin';"
```
