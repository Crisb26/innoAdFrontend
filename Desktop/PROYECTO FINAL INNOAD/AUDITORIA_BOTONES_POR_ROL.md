## AUDITORÍA DE BOTONES POR ROL
**Fecha**: 2026-01-02
**Estado**: En Progreso

### ROLES IDENTIFICADOS
1. **USUARIO** - Usuario regular del sistema
2. **ADMIN** - Administrador del sistema
3. **TECNICO** - Técnico/profesional
4. **DESARROLLADOR** - Desarrollador (probablemente para debug)

---

## USUARIO - Botones accesibles (Nivel 1)
**Rutas permitidas**: `/dashboard`, `/campanas`, `/contenidos`, `/reportes`, `/pagos`, `/asistente-ia`, `/chat`
**Permisos**:
- VER_CAMPANA, CREAR_CONTENIDO, VER_CONTENIDO, VER_REPORTES, VER_PAGOS, PROCESAR_PAGO, VER_HISTORIAL_PAGOS, USAR_ASISTENTE_IA, USAR_CHAT, CREAR_CAMPANA_CON_IA

### Botones en Usuario Dashboard:
1. **btn-action (Crear Publicidad)** → `irACrearPublicidad()` → `/publicacion/crear`
   - Endpoint: POST `/api/publicaciones/crear` (esperado)
   - Rol requerido: USUARIO ✅
   - Status: ⏳ Verificar

2. **btn-action (Mis Publicidades)** → `irAMisPublicidades()` → `/publicacion/mis`
   - Endpoint: GET `/api/publicaciones/mis` (esperado)
   - Rol requerido: USUARIO ✅
   - Status: ⏳ Verificar

3. **btn-action (Estadísticas)** → `irAEstadisticas()` → `/dashboard/estadisticas`
   - Endpoint: GET `/api/estadisticas` (esperado)
   - Rol requerido: USUARIO ✅
   - Status: ⏳ Verificar

4. **btn-action (Facturación)** → `irAFacturacion()` → `/pagos`
   - Endpoint: GET `/api/pagos/historial` (esperado)
   - Rol requerido: USUARIO ✅
   - Status: ⏳ Verificar

5. **btn-logout** → `logout()` → Cierra sesión
   - Endpoint: POST `/api/auth/logout` (esperado)
   - Status: ⏳ Verificar

6. **btn-ver-detalles (Publicidades)** → `verDetalles(pub.id)` → Abre modal/detalles
   - Endpoint: GET `/api/publicaciones/{id}` (esperado)
   - Status: ⏳ Verificar

### Botones en Publicacion-Crear:
7. **btn-cambiar-archivo** → `fileInput.click()` → Abre selector de archivo
   - Status: ✅ Frontend solo
   
8. **btn-link (Seleccionar Ubicaciones)** → `irASeleccionarUbicaciones()` → `/publicacion/ubicaciones`
   - Endpoint: GET `/api/ubicaciones` (esperado)
   - Status: ⏳ Verificar

9. **btn-guardar-borrador** → `guardarBorrador()` (implícito)
   - Endpoint: POST `/api/publicaciones/borrador` (esperado)
   - Status: ⏳ Verificar

10. **btn-enviar-aprobacion** → `enviarAprobacion()` (implícito)
    - Endpoint: POST `/api/publicaciones/aprobar` (esperado)
    - Status: ⏳ Verificar

11. **btn-volver** → `volver()` → Vuelve atrás
    - Status: ✅ Frontend solo

### Botones en Seleccionar Ubicaciones:
12. **Botones de ciudades** → `seleccionarCiudad(ciudad)` (implícito)
    - Endpoint: Actualiza estado local
    - Status: ✅ Frontend solo

13. **Botones de pisos** → `seleccionarPiso(piso)` (implícito)
    - Endpoint: Actualiza estado local
    - Status: ✅ Frontend solo

14. **btn-quitar** → `quitarUbicacion(ubicacion.lugarId)` → Elimina ubicación
    - Endpoint: No requiere (actualiza local)
    - Status: ✅ Frontend only

15. **btn-limpiar** → `limpiarUbicaciones()` → Limpia selección
    - Status: ✅ Frontend only

16. **btn-continuar** → `continuar()` o navega
    - Status: ⏳ Verificar

### Botones en Chat/Asistente-IA:
17. **btn-enviar-normal** (Chat) → `enviarMensaje()` → POST mensaje
    - Endpoint: POST `/api/chat/enviar` (esperado)
    - Rol requerido: USUARIO ✅
    - Status: ⏳ Verificar

18. **btn-toggle-historial** (Asistente-IA) → `toggleHistorial()` → Muestra/oculta sidebar
    - Status: ✅ Frontend only

19. **btn-reutilizar** (Asistente-IA) → `reutilizarRespuesta()` 
    - Status: ⏳ Verificar

20. **btn-descargar** (Asistente-IA) → `descargarRespuesta()`
    - Endpoint: GET `/api/asistente-ia/exportar` (esperado)
    - Status: ⏳ Verificar

21. **btn-limpiar** (Asistente-IA) → `limpiarHistorial()`
    - Status: ✅ Frontend only

22. **btn-enviar-normal** (Asistente-IA) → `procesarPregunta()`
    - Endpoint: POST `/api/asistente-ia/procesar-pregunta` ✅
    - Rol requerido: USUARIO ✅
    - Status: ⏳ Conectado, verificar JWT

---

## ADMINISTRADOR - Botones de administración (Nivel 4)
**Rutas permitidas**: Todas
**Permisos**: Todos los permisos

### Botones en Admin Panel:
- [ ] Admin: Gestionar usuarios
- [ ] Admin: Ver logs
- [ ] Admin: Configurar sistema

### Status: ⏳ Buscar componentes

---

## TECNICO - Botones de mantenimiento (Nivel 3)
**Rutas permitidas**: `/dashboard`, `/campanas`, `/pantallas`, `/contenidos`, `/reportes`, `/asistente-ia`, `/chat`, `/mantenimiento`
**Permisos**: TODOS menos ADMIN

### Botones en Mantenimiento:
1. **btn-reconectar** → `reconectar()` → Reconecta WebSocket
   - Endpoint: POST `/api/mantenimiento/reconectar` (esperado)
   - Rol requerido: TECNICO ✅
   - Status: ⏳ Verificar

2. **Botones de alertas (tiempo real)**:
   - **btn-resolver** → `abrirModalResolver(alerta)` → Abre modal para resolver
   - **btn-escalar** → `escalarAlerta(alerta.id)` → Escala alerta
   - **btn-ignorar** → `ignorarAlerta(alerta.id)` → Ignora alerta
   - **btn-detalles** → `mostrarDetalles(alerta)` → Muestra detalles
   
   Endpoints esperados:
   - POST `/api/mantenimiento/alertas/{id}/resolver`
   - POST `/api/mantenimiento/alertas/{id}/escalar`
   - POST `/api/mantenimiento/alertas/{id}/ignorar`
   - GET `/api/mantenimiento/alertas/{id}`
   
   Status: ⏳ Verificar

3. **Modal de resolver alerta**:
   - **Cancelar** → `dismissModal()`
   - **Confirmar resolver** → `confirmarResolver()`
   
   Status: ⏳ Verificar

4. **btn-reconectarWebSocket** → `reconectarWebSocket()` → Reconecta WebSocket
   - Status: ✅ Frontend only (WebSocket)

5. **btn-limpiarAlertas** → `limpiarAlertas()` → Limpia todas las alertas
   - Status: ✅ Frontend only

---

## OPERADOR - Botones de operación (Nivel 2)
**Rutas permitidas**: `/dashboard`, `/campanas`, `/pantallas`, `/contenidos`, `/reportes`, `/asistente-ia`, `/chat`
**Permisos**: VER_CAMPANA, EDITAR_CAMPANA, PUBLICAR_CAMPANA, VER_PANTALLA, CONTROLAR_PANTALLA, VER_CONTENIDO, VER_REPORTES, VER_GRAFICOS, USAR_ASISTENTE_IA, USAR_CHAT`

### Botones: Similar a USUARIO, pero con permisos adicionales de edición y control

---

## ROLES CONFIRMADOS EN SISTEMA
✅ ADMINISTRADOR (nivel 4)
✅ TECNICO (nivel 3)
✅ OPERADOR (nivel 2)  
✅ USUARIO (nivel 1)
❌ DESARROLLADOR (no existe en sistema)

---

## STATUS DE AUDITORÍA

### Compilación Backend
- Status: EN PROGRESO
- Tarea: Ejecutar mvn clean compile
- Objetivo: Verificar que no hay errores de compilación

### Auditoría de Botones
- Pendiente: Mapear botones a endpoints
- Pendiente: Verificar autenticación por rol
- Pendiente: Verificar payloads request/response

### Modales/Ventanas
- Pendiente: Identificar botones que abren modales
- Pendiente: Crear componentes modales
- Pendiente: Wired a handlers

---

## NOTAS
- Se deben verificar permisos/guards de cada botón
- Cada botón debe estar asociado a un endpoint backend específico
- Verificar tokens JWT y autenticación
- Documentar payloads esperados
