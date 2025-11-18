# 🚀 Guía de Despliegue - InnoAd Frontend

## 📋 Opciones de Despliegue GRATUITAS

### 🏆 Opción 1: Netlify (RECOMENDADO)

#### ✨ Ventajas:
- ✅ **100% Gratis** para proyectos personales
- ✅ CI/CD automático desde GitHub
- ✅ HTTPS gratis incluido
- ✅ CDN global ultra rápido
- ✅ Dominio gratis: `tu-app.netlify.app`
- ✅ Preview deployments en PRs
- ✅ Rollback instantáneo

#### 🎯 Método 1: Desde la Web (Más Fácil)

1. **Crear cuenta en Netlify**
   - Ve a https://app.netlify.com
   - Regístrate con GitHub (recomendado)

2. **Importar proyecto**
   - Click en "Add new site"
   - "Import an existing project"
   - Selecciona "GitHub"
   - Autoriza Netlify
   - Busca tu repo `innoAdFrontend`

3. **Configurar Build**
   ```
   Build command: npm run construir
   Publish directory: dist/innoad-frontend/browser
   ```

4. **Deploy**
   - Click "Deploy site"
   - ¡Listo! Tu app estará en `https://random-name.netlify.app`

5. **Cambiar nombre del sitio**
   - Site settings → Site details → Change site name
   - Ejemplo: `innoad-app.netlify.app`

#### 🎯 Método 2: Desde CLI

```powershell
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Inicializar (solo primera vez)
netlify init

# 4. Build local
npm run construir

# 5. Deploy
netlify deploy --prod
```

#### 🤖 Deploy Automático con GitHub Actions

Ya creé el archivo `.github/workflows/deploy-netlify.yml`

**Configuración:**
1. Ve a https://app.netlify.com/user/applications
2. Crea un nuevo token de acceso
3. En GitHub → Settings → Secrets → Actions
4. Añade:
   - `NETLIFY_AUTH_TOKEN`: Tu token
   - `NETLIFY_SITE_ID`: ID del sitio (en Site settings)

¡Ahora cada push a main desplegará automáticamente! 🎉

---

### 🚀 Opción 2: Vercel

#### ✨ Ventajas:
- ✅ Gratis ilimitado
- ✅ Muy rápido (Edge Network)
- ✅ Deploy automático
- ✅ HTTPS + dominio gratis

#### 🎯 Método 1: Desde la Web

1. Ve a https://vercel.com
2. "Add New" → "Project"
3. Import tu repo de GitHub
4. Vercel detecta Angular automáticamente
5. Click "Deploy"

#### 🎯 Método 2: Desde CLI

```powershell
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy a producción
vercel --prod
```

---

### 🎨 Opción 3: GitHub Pages

#### ✨ Ventajas:
- ✅ Totalmente gratis
- ✅ Integrado con GitHub
- ✅ Sin límites de ancho de banda

#### 📝 Setup:

```powershell
# 1. Instalar angular-cli-ghpages
npm install -g angular-cli-ghpages

# 2. Build con base href correcto
npm run construir -- --base-href /innoAdFrontend/

# 3. Deploy
npx angular-cli-ghpages --dir=dist/innoad-frontend/browser
```

Tu app estará en: `https://crisb26.github.io/innoAdFrontend/`

---

### ☁️ Opción 4: Render

#### ✨ Ventajas:
- ✅ Gratis con 100GB/mes
- ✅ HTTPS automático
- ✅ Deploy desde GitHub

#### 📝 Setup:

1. Ve a https://render.com
2. "New" → "Static Site"
3. Conecta GitHub repo
4. Configuración:
   ```
   Build Command: npm run construir
   Publish Directory: dist/innoad-frontend/browser
   ```

---

### 🐙 Opción 5: Cloudflare Pages

#### ✨ Ventajas:
- ✅ Gratis ilimitado
- ✅ CDN de Cloudflare
- ✅ Ultra rápido

#### 📝 Setup:

1. Ve a https://pages.cloudflare.com
2. "Create a project"
3. Conecta GitHub
4. Configuración:
   ```
   Build command: npm run construir
   Build output directory: dist/innoad-frontend/browser
   ```

---

## 🎯 MI RECOMENDACIÓN

### Para empezar: **Netlify**
Es el más fácil y completo para Angular.

### Pasos exactos:

```powershell
# 1. Asegúrate de que el build funciona
npm run construir

# 2. Sube tu código a GitHub (si no lo has hecho)
git add .
git commit -m "Preparado para deploy"
git push origin main

# 3. Ve a https://app.netlify.com
# 4. "Add new site" → "Import from Git" → GitHub
# 5. Selecciona tu repo
# 6. Configuración:
#    Build command: npm run construir
#    Publish directory: dist/innoad-frontend/browser
# 7. Deploy!
```

**Tu app estará live en 2-3 minutos** 🚀

---

## 🔧 Configuración de Entorno

### Variables de Entorno en Netlify

1. Site settings → Environment variables
2. Añade las que necesites:
   ```
   API_URL=https://tu-backend.com/api
   NODE_ENV=production
   ```

### En Vercel

```powershell
# Desde CLI
vercel env add API_URL production
```

O desde dashboard: Project Settings → Environment Variables

---

## 🌍 Dominios Personalizados

### En Netlify (Gratis):
1. Site settings → Domain management
2. "Add custom domain"
3. Sigue las instrucciones de DNS

### En Vercel (Gratis):
1. Project Settings → Domains
2. Add domain
3. Configura DNS

---

## 📊 Comparación Rápida

| Característica | Netlify | Vercel | GitHub Pages | Cloudflare |
|---------------|---------|--------|--------------|------------|
| **Gratis** | ✅ | ✅ | ✅ | ✅ |
| **HTTPS** | ✅ | ✅ | ✅ | ✅ |
| **CDN Global** | ✅ | ✅ | ❌ | ✅ |
| **Deploy auto** | ✅ | ✅ | ⚠️ | ✅ |
| **Preview PRs** | ✅ | ✅ | ❌ | ✅ |
| **Fácil setup** | 🏆 | ✅ | ⚠️ | ✅ |
| **Analytics** | ✅ | ✅ | ❌ | ✅ |

---

## 🎬 Video Tutorial

Para Netlify, sigue estos pasos visuales:

1. **Build local** ✅
   ```powershell
   npm run construir
   ```

2. **Verificar** ✅
   ```powershell
   ls dist/innoad-frontend/browser
   ```
   Debe contener: `index.html`, carpetas `assets/`, archivos `.js`, `.css`

3. **Drag & Drop** en Netlify ✅
   - Alternativa rápida: arrastra la carpeta `dist/innoad-frontend/browser` directamente a netlify.com/drop

---

## 🐛 Troubleshooting

### Problema: Rutas de Angular no funcionan (404)

**Solución**: Asegúrate que el archivo `netlify.toml` existe con:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Problema: Build falla

**Solución**: Verifica que `package.json` tenga todas las dependencias:
```powershell
npm install
npm run construir
```

### Problema: Variables de entorno no funcionan

**Solución**: Angular no lee variables de entorno en runtime. Usa archivos `environment.*.ts`

---

## 🚀 Próximos Pasos

1. ✅ Despliega en Netlify
2. ✅ Configura dominio personalizado (opcional)
3. ✅ Configura CI/CD con GitHub Actions
4. ✅ Añade analytics
5. ✅ Configura el backend

---

## 📞 Ayuda

Si tienes problemas:
- Netlify: https://docs.netlify.com
- Vercel: https://vercel.com/docs
- GitHub Pages: https://pages.github.com

---

## ✨ Resumen Ejecutivo

**Opción más fácil**: Netlify desde web (5 minutos)
**Opción más rápida**: Vercel CLI
**Opción más integrada**: GitHub Pages

**Mi recomendación**: **Netlify** 🏆

¡Éxito con tu despliegue! 🎉
