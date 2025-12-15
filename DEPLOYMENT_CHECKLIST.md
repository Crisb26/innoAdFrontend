# 🚀 Deployment Checklist - Garantizar que cambios se reflejen

## Problema: Los cambios se suben a GitHub pero NO aparecen en producción

### SOLUCIÓN PASO A PASO

#### 1️⃣ VERIFICAR COMPILACIÓN LOCAL (PRE-PUSH)
- [ ] `npm run build` o `ng build --configuration production`
- [ ] Verificar que la carpeta `dist/` se actualiza
- [ ] Verificar que NO hay errores de compilación
- [ ] Verificar tamaño de archivos en dist/

```bash
# En el terminal, ejecutar:
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
ng build --configuration production
```

#### 2️⃣ VERIFICAR CAMBIOS ANTES DE PUSH
- [ ] `git status` - Ver qué archivos cambiaron
- [ ] `git diff` - Revisar cambios específicos
- [ ] `git add .`
- [ ] `git commit -m "descripción clara del cambio"`

```bash
git status
git diff
git add -A
git commit -m "FIX: Arreglar jsPDF y reflejar cambios en producción"
git push origin main
```

#### 3️⃣ VERIFICAR EN GITHUB
- [ ] Ir a https://github.com/Crisb26/innoAdFrontend
- [ ] Verificar que el commit aparece en la rama `main`
- [ ] Verificar que GitHub Actions se ejecutó (si están configuradas)
- [ ] Ver el commit hash

#### 4️⃣ FORZAR NETLIFY A REDEPLOY
**Opción A: Dashboard de Netlify (Recomendado)**
- [ ] Ir a https://app.netlify.com/
- [ ] Seleccionar proyecto `innoAdFrontend`
- [ ] Pestaña "Deployments"
- [ ] Botón "Trigger deploy" > "Deploy site"
- [ ] Esperar a que el deploy termine (indicador verde)

**Opción B: Limpiar Cache de Netlify**
- [ ] Settings > Build & Deploy
- [ ] "Delete deploy preview"
- [ ] "Clear cache"
- [ ] Push a GitHub para disparar nuevo build

**Opción C: Comando Git**
```bash
git commit --allow-empty -m "Trigger Netlify deploy"
git push origin main
```

#### 5️⃣ VERIFICAR EN NAVEGADOR (DESPUÉS DEL DEPLOY)
- [ ] Ir a https://innoad-frontend.netlify.app (o tu URL)
- [ ] Presionar `Ctrl + Shift + Delete` (limpiar cache)
- [ ] Presionar `Ctrl + F5` (reload forzado)
- [ ] Abrir DevTools (F12) > Network > desactivar cache
- [ ] Recargar página
- [ ] Verificar que los cambios aparecen

**Señales de que el deploy fue exitoso:**
- ✅ URL cambia o carga nueva versión
- ✅ Fecha de última modificación es reciente
- ✅ CSS/HTML con cambios está visible
- ✅ Console (F12) NO muestra errores 404

#### 6️⃣ SI AÚN NO FUNCIONA: TROUBLESHOOTING

**Problema: Netlify dice "Deploy successful" pero cambios no aparecen**

Soluciones:
1. Limpiar cache del navegador completamente:
   - Chrome: Settings > Privacy > Clear browsing data (All time)
   - Firefox: History > Clear Recent History
   - Safari: Develop > Empty caches

2. Verificar que Git push fue exitoso:
   ```bash
   git log --oneline -5
   git remote -v
   ```

3. Verificar URL de deployment:
   - Netlify debería mostrar: `https://[site-name].netlify.app`
   - O tu dominio personalizado si lo tienes

4. Ver logs de Netlify:
   - Settings > Build & Deploy > Deploy logs
   - Verificar que `ng build` no tiene errores

**Problema: Error de compilación en Netlify**

Causas comunes:
- [ ] Falta alguna dependencia en `package.json`
- [ ] Versión de Node incompatible
- [ ] Variable de entorno no configurada
- [ ] Import incorrecto (como el que acabamos de arreglar)

Solución:
```bash
npm install
ng build --configuration production
# Comprobar que NO hay errores antes de push
```

---

## 📝 RESUMEN PARA ESTE PROYECTO

### Cambios hechos hoy:
1. ✅ Agregado jsPDF CDN en `index.html`
2. ✅ Refactorizado 4 componentes (CSS/HTML externos)
3. ✅ Re-habilitada ruta de developer-dashboard
4. ✅ Compilación local: 55.606 segundos ✓ SIN ERRORES

### Pasos siguientes:
1. ✅ Compilar en local (está en progreso)
2. ⏳ Push a GitHub
3. ⏳ Forzar deploy en Netlify
4. ⏳ Verificar cambios en producción

### URLs críticas:
- GitHub: https://github.com/Crisb26/innoAdFrontend
- Netlify Dashboard: https://app.netlify.com/
- Sitio en producción: https://innoad-frontend.netlify.app

---

## 🔧 COMANDOS RÁPIDOS

```bash
# Compilar
ng build --configuration production

# Ver cambios pendientes
git status
git diff

# Subir cambios
git add -A
git commit -m "mensaje descriptivo"
git push origin main

# Limpiar cache del navegador programáticamente
# (En la consola del navegador F12)
location.reload(true)
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

| Problema | Causa | Solución |
|----------|-------|----------|
| "ng build" falla | Sintaxis TypeScript error | Revisar consola, corregir error, reintentar |
| Página en blanco | CSS no cargado | Revisar Network en F12, verificar dist/ |
| Botones no funciona | JS event listeners perdidos | Hard refresh (Ctrl+F5), limpiar cache |
| Estilos antiguos | Cache del navegador | Ctrl+Shift+Delete, limpiar todo |
| jsPDF no funciona | Librería no cargada | Verificar que CDN está en index.html |

---

## 📊 ESTADO ACTUAL

| Componente | Estado | Acción |
|------------|--------|--------|
| seleccionar-ubicaciones | ✅ Refactorizado + Compilado | Listo |
| publicacion-crear | ✅ Refactorizado + Compilado | Listo |
| usuario-dashboard | ✅ Refactorizado + Compilado | Listo |
| developer-dashboard | ✅ Refactorizado + En compilación | Verificar |
| jsPDF fix | ✅ CDN agregado | Listo |
| Reportes | 🔧 En testing | Verificar después de deploy |

**Siguiente: DEPLOY A NETLIFY → VERIFICAR EN NAVEGADOR**
