# 🚀 Guía de Inicio Rápido - InnoAd Frontend

## Primeros Pasos (5 minutos)

### 1. Instalar Dependencias
\`\`\`bash
npm install
# Entra en la carpeta del proyecto. Si git clonó `innoad-frontend` usa esa; si tu carpeta local se llama
# `innoadFrontend` usa ese nombre.
cd innoad-frontend
npm install
\`\`\`

### 2. Configurar el Backend
Editar \`src/environments/environment.ts\`:
\`\`\`typescript
urlApi: 'http://localhost:8080/api/v1',  // Tu URL de backend
\`\`\`

### 3. Iniciar la Aplicación
\`\`\`bash
npm run iniciar
\`\`\`

### 4. Abrir en el Navegador
- URL: \`http://localhost:4200\`
- Usuario de prueba: \`admin@innoad.com\`
- Contraseña: \`admin123\`

## ✅ Verificación

Si todo está correcto, deberías ver:
1. Página de login con diseño futurista
2. Poder iniciar sesión (si el backend está corriendo)
3. Dashboard con métricas y accesos rápidos

## 🔧 Próximos Pasos

1. **Completar el Login**:
   - Conectar con tu backend real
   - Configurar las credenciales correctas

2. **Desarrollar Módulos**:
   - Campañas
   - Pantallas
   - Contenidos
   - Reportes

3. **Personalizar Diseño**:
   - Cambiar colores en \`src/styles.scss\`
   - Agregar tu logo en \`src/assets/imagenes/\`

## 📞 ¿Necesitas Ayuda?

- Lee el \`README.md\` completo
- Revisa los comentarios en el código
- Consulta la documentación de Angular

¡Éxito con tu proyecto! 🎉
