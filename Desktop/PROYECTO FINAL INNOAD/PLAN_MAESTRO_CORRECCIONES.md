# 🎯 PLAN MAESTRO - CORRECCIONES Y MEJORAS INNOAD

## 📊 ANÁLISIS DE BUGS REPORTADOS

### 🔴 BUGS CRÍTICOS (Nivel 1 - Impactan experiencia)

#### 1. **CREAR CAMPAÑA - Layout desalineado**
- **Síntoma:** El formulario está corrido en la pantalla
- **Causa:** Probablemente CSS en `formulario-campana.component.scss`
- **Archivo:** `src/app/modulos/campanas/componentes/formulario-campana.component.scss`
- **Solución:** Revisar posicionamiento del modal y alineación con fechas

#### 2. **SELECCIONAR PANTALLAS - Solo 1, 3, 5, 8, 10+ (NO HAY 2)**
- **Síntoma:** Dropdown sin opción de 2 pantallas
- **Causa:** Opciones hardcodeadas en `formulario-campana.component.ts`
- **Archivo:** `src/app/modulos/campanas/componentes/formulario-campana.component.ts`
- **Solución:** Agregar opción "2 pantallas" en el dropdown

#### 3. **CREAR PANTALLA - No se guarda**
- **Síntoma:** Llena formulario pero no crea pantalla
- **Causa:** Posible error en servicio backend o request mal formado
- **Archivos:** 
  - Frontend: `src/app/modulos/pantallas/**`
  - Backend: `src/main/java/com/innoad/modules/*/controlador/Controlador*.java`
- **Solución:** Verificar request/response, añadir logging

#### 4. **CREAR CONTENIDO - Error al guardar (después de cargar imagen)**
- **Síntoma:** Carga imagen OK, pero falla al hacer click en "Crear"
- **Causa:** Posible error en upload de imagen o validación backend
- **Archivos:**
  - Frontend: `src/app/modulos/contenidos/**`
  - Backend: `/modules/contenidos/**`
- **Solución:** Verificar servicio de upload y endpoint POST

#### 5. **VER GRÁFICOS - Cierra sesión sin aviso**
- **Síntoma:** Click en "Ver Gráficos" → Logout automático
- **Causa:** Error 401 no capturado o fallo en llamada a API
- **Archivos:**
  - Frontend: `src/app/modulos/reportes/**` o `src/app/modulos/dashboard/**`
  - Backend: Endpoint `/api/v1/graficos` o similar
- **Solución:** Añadir manejo de errores y refresh de token

#### 6. **PUBLICAR AHORA - Igual a gráficos (logout)**
- **Síntoma:** Mismo que gráficos
- **Causa:** Probablemente mismo endpoint con issue de autenticación
- **Solución:** Revisar interceptor de errores 401

#### 7. **DESCARGAR PDF REPORTES - Error "No disponible"**
- **Síntoma:** Click en descargar PDF → error, CSV sí funciona
- **Causa:** Endpoint PDF diferente o no implementado correctamente
- **Archivos:**
  - Backend: Controlador de reportes
  - Frontend: Servicio de reportes
- **Solución:** Verificar endpoint `/api/v1/reportes/pdf` y Apache POI

#### 8. **CSV FUNCIONA PERO INFO CORTA**
- **Síntoma:** CSV se descarga pero sin todos los datos
- **Causa:** Posible paginación limitada o query incompleta
- **Solución:** Revisar generación de CSV, agregar todos los registros

#### 9. **IA/CHATBOT - Crear campaña → Logout**
- **Síntoma:** En módulo IA, opción crear campaña cierra sesión
- **Causa:** Posible ruta incorrecta o permiso denegado (403/401)
- **Archivos:**
  - Frontend: `src/app/modulos/asistente-ia/**`
- **Solución:** Verificar rutas y permisos por rol

---

## 🎨 MEJORAS DE UI/UX

### 1. **LOGIN - Animación de carga**
- Agregar spinner bonito mientras se valida credenciales
- Efectos de fade-in/fade-out
- Validaciones visuales (✓ usuario existe, etc)

### 2. **Formularios - Validaciones en tiempo real**
- Mostrar errores inline
- Colores de validación (rojo/verde/amarillo)

### 3. **Botones - Efectos hover/click**
- Efectos de presión (ripple effect)
- Transiciones suaves

### 4. **Animaciones generales**
- Loading spinners en todas las llamadas async
- Transiciones de página smooth
- Skeleton screens mientras carga datos

---

## 🔐 SISTEMA DE MANTENIMIENTO (CRÍTICO)

### Especificaciones:
- **URL:** `/administrador/mantenimiento`
- **Contraseña:** `Cris93022611184` (única, solo ADMIN)
- **Funcionalidades:**
  1. Mensaje visible para usuarios en mantenimiento
  2. Fecha/Hora de inicio
  3. Fecha/Hora de fin
  4. Activar/Desactivar mantenimiento
  5. Ver cuántos usuarios están conectados
  6. Página de mantenimiento bonita (no simple)

### Elementos de la página de mantenimiento:
- Animación de construcción o engranajes
- Mensaje personalizado
- Countdown hasta que termine el mantenimiento
- Colores futuristas
- Sistema de alertas

---

## 👥 PERMISOS POR PERFIL

### ADMINISTRADOR
- ✅ Crear/editar/eliminar campañas
- ✅ Crear/editar/eliminar pantallas
- ✅ Crear/editar/eliminar contenidos
- ✅ Ver reportes (PDF + CSV)
- ✅ Ver gráficos
- ✅ Acceso a mantenimiento (protegido)
- ✅ Entrenar chatbot
- ✅ Gestionar usuarios y roles
- ✅ Acceso a todas las funciones IA

### TÉCNICO
- ✅ Ver campañas (no crear)
- ✅ Crear/editar/eliminar pantallas
- ✅ Ver contenidos (no crear)
- ✅ Ver reportes básicos
- ✅ Soporte a usuarios
- ❌ No acceso a mantenimiento
- ❌ No entrenar chatbot

### OPERADOR/USUARIO
- ✅ Ver mis campañas
- ✅ Ver mis pantallas
- ✅ Ver mis contenidos
- ✅ Usar chatbot
- ✅ Ver reportes básicos
- ❌ No crear (solo visualizar)
- ❌ No acceso técnico

### USUARIO ESTÁNDAR
- ✅ Usar chatbot
- ✅ Ver publicaciones
- ✅ Acceso limitado a player
- ❌ Todo lo demás

---

## 🤖 CHATBOT → AGENTE DE SERVICIO

### Cambios requeridos:
1. **Nombre:** "Asistente InnoAd" en lugar de "Chatbot"
2. **Funcionalidades de agente:**
   - Responder preguntas frecuentes
   - Guiar en creación de campaña
   - Soporte técnico
   - Escalado a humano
   - Historial de conversaciones
3. **Entrenamiento básico:**
   - FAQ sobre plataforma
   - Guías de uso
   - Troubleshooting
4. **Integración:**
   - Con usuarios por rol
   - Respuestas personalizadas según rol
   - Acceso a datos del usuario

---

## 🎯 PLAN DE ACCIÓN

### Fase 1: Arreglar Bugs (2-3 horas)
1. [ ] Campaña - Layout y opción 2 pantallas
2. [ ] Pantalla - Debug creación
3. [ ] Contenido - Debug upload/guardado
4. [ ] Gráficos - Manejar error 401
5. [ ] Publicar - Mismo fix que gráficos
6. [ ] PDF - Verificar endpoint
7. [ ] CSV - Agregar todos los registros
8. [ ] IA - Crear campaña (permisos)

### Fase 2: Sistema de Mantenimiento (1-2 horas)
1. [ ] Crear componente de mantenimiento
2. [ ] Implementar protección con contraseña
3. [ ] Diseñar página de mantenimiento
4. [ ] Backend: crear endpoint `/api/v1/mantenimiento/**`
5. [ ] Frontend: guardia de ruta

### Fase 3: Permisos por Perfil (1-2 horas)
1. [ ] Revisar guardias de ruta
2. [ ] Actualizar RolGuard.ts
3. [ ] Ocultar opciones por rol
4. [ ] Backend: validar permisos en cada endpoint

### Fase 4: Mejorar UI/UX (2-3 horas)
1. [ ] Login - Agregar animaciones
2. [ ] Formularios - Validaciones visuales
3. [ ] Botones - Efectos hover/ripple
4. [ ] Spinners - En llamadas async
5. [ ] Colores - Mantener futuristas

### Fase 5: Chatbot → Agente (1-2 horas)
1. [ ] Renombrar componente
2. [ ] Agregar funcionalidades de agente
3. [ ] Entrenar con FAQ básicas
4. [ ] Personalizar por rol

### Fase 6: Testing en todos los perfiles (1-2 horas)
1. [ ] Login como ADMIN - Verificar todo
2. [ ] Login como TÉCNICO - Verificar permisos
3. [ ] Login como OPERADOR - Verificar limitaciones
4. [ ] Reportar y corregir issues

### Fase 7: Commit y Deploy (30 min)
1. [ ] Commit a GitHub
2. [ ] Verificar deploy en Azure (BD) + Netlify (Frontend)
3. [ ] Testing en producción

---

## 📋 NOTAS IMPORTANTES

- **Mantener colores futuristas** - Azules, purpuras, gradientes
- **Compatibilidad:** Azure (BD) + Netlify (FE) + Spring Boot 3.5.7 (BE)
- **Seguridad:** Validar en backend TODOS los permisos
- **Alertas:** Mantener sistema actual, solo mejorar
- **Password Mantenimiento:** `Cris93022611184` - Almacenar hasheado en BD
- **Datos sensibles:** No harcodear en frontend

---

## 🚀 ESTIMACIÓN TOTAL
- **Tiempo:** 8-15 horas (dependiendo de complejidad)
- **Prioridad:** 1) Bugs, 2) Mantenimiento, 3) Permisos, 4) UI
- **Riesgo:** Bajo (cambios aislados por módulo)

