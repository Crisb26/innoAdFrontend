# GUÍA DE SINCRONIZACIÓN GITHUB - INNOAD

## Flujo Completo de Trabajo

### Fase 1: Desarrollo (Tu PC)

```bash
# Hacer cambios en código local
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND
# (editar archivos)

# Verificar cambios
git status

# Agregar cambios
git add .

# Commit (SIEMPRE sin emojis, solo lo esencial)
git commit -m "feat: agregar upload de fotos"

# Push a GitHub
git push origin main
```

### Fase 2: Servidor (Sincronización Automática)

**Opción A: Manual (Recomendada)**

```bash
# En el servidor (SSH)
ssh user@100.91.23.46

# Navegar al backend
cd /opt/innoad/backend

# Traer cambios desde GitHub
git pull origin main

# Compilar
mvn clean package -DskipTests

# Reiniciar servicio
systemctl restart innoad-backend

# Verificar status
systemctl status innoad-backend
```

**Opción B: Automática con Cron (Futuro)**

```bash
# En servidor, agregar a crontab
crontab -e

# Agregar línea:
*/30 * * * * cd /opt/innoad && ./auto-deploy.sh

# Donde auto-deploy.sh contiene:
#!/bin/bash
cd /opt/innoad/backend
git pull origin main
if [ $? -eq 0 ]; then
    mvn clean package -DskipTests
    systemctl restart innoad-backend
    echo "Deploy completado" | mail -s "InnoAd Deploy" admin@innoad.local
fi
```

### Fase 3: Verificación

```bash
# Probar que cambios están en vivo
curl https://azure-pro.tail2a2f73.ts.net/api/v1/auth/status

# Respuesta esperada:
# {"status":"UP","version":"2.0.0"}
```

---

## Estrategia de Branches

### Main Branch (Producción)
- Solo cambios verificados
- Siempre estable
- Push solo después de testing

### Development Branch (Futuro)
- Para features en desarrollo
- Testing antes de merge a main
- Pull requests para review

---

## Convención de Commits

### Formato
```
<tipo>: <descripción corta>

<descripción detallada opcional>
```

### Tipos
- feat: nueva funcionalidad
- fix: corrección de bug
- refactor: reorganización de código
- docs: cambios en documentación
- test: agregación de tests
- chore: cambios de configuración

### Ejemplos

CORRECTO:
```
feat: agregar upload de fotos de perfil
fix: corregir Nginx routing a backend
refactor: simplificar lógica de autenticación
```

INCORRECTO:
```
feat: 📸 agregar foto!!! [IMPORTANTE]
fix: arreglado el peo del endpoint 404
```

---

## Workflow Recomendado

### 1. Cada cambio
```bash
git pull origin main          # Asegurar que estás actualizado
git add .                     # Agregar cambios
git commit -m "tipo: descripcion"  # Commit claro
git push origin main          # Push a GitHub
```

### 2. En el servidor (cada hora o manual)
```bash
cd /opt/innoad/backend
git pull origin main
mvn clean package -DskipTests
systemctl restart innoad-backend
systemctl status innoad-backend
```

### 3. Verificar en vivo
```bash
curl https://azure-pro.tail2a2f73.ts.net/api/v1/auth/status
```

---

## Control de Versiones

### Backend - pom.xml
```xml
<version>2.0.0</version>  <!-- Actualizar cuando haya release major -->
```

### Frontend - package.json
```json
"version": "2.0.0"  <!-- Sincronizar con backend -->
```

### Git Tags (Para releases)
```bash
git tag -a v2.0.0 -m "Release 2.0.0"
git push origin v2.0.0
```

---

## Resolver Conflictos

Si hay conflicto al hacer pull:

```bash
git pull origin main
# Conflicto detectado

# Ver archivos con conflicto
git status

# Editar archivos y resolver
nano BACKEND/pom.xml

# Marcar como resuelto
git add BACKEND/pom.xml

# Completar merge
git commit -m "resolve: merge conflict"
git push origin main
```

---

## Rollback (Si algo sale mal)

```bash
# Ver historial
git log --oneline -10

# Revertir último commit (sin push)
git revert HEAD~1

# Revertir después de push (crea nuevo commit)
git revert <commit-hash>
git push origin main

# Reset total (CUIDADO - destruye cambios)
git reset --hard origin/main
```

---

## Checklist Antes de Push

- [ ] Código compilado sin errores
- [ ] Tests pasando (si existen)
- [ ] Sin emojis en mensajes
- [ ] Commit message claro y conciso
- [ ] No incluye credenciales
- [ ] Cambios testeados localmente

---

## Monitoreo después de Deploy

```bash
# 1. Verificar servicio está activo
systemctl status innoad-backend

# 2. Revisar logs
journalctl -u innoad-backend -f

# 3. Probar endpoint crítico
curl https://azure-pro.tail2a2f73.ts.net/api/v1/auth/status

# 4. Betho IA reporta status
curl https://azure-pro.tail2a2f73.ts.net/api/v1/admin/betho/status
```

---

## Sincronización con Azure (Cuando esté listo)

```bash
# En servidor
docker build -t innoad:latest .
docker tag innoad:latest azure.azurecr.io/innoad:latest
docker push azure.azurecr.io/innoad:latest

# Azure automáticamente despliega
# (Betho IA puede manejar esto)
```

---

## En Resumen

Tu flujo será:
1. Cambias código en tu PC
2. Haces git push origin main
3. Ejecutas comando en servidor para pull
4. Servidor recompila y reinicia
5. Cambios están en vivo

GitHub es el "respaldo", servidor es la "producción real".
