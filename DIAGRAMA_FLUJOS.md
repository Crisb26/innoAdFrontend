📊 DIAGRAMA DE FLUJOS CONECTADOS - SISTEMA USUARIO

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                        🚀 FLUJO 1: CREAR PUBLICIDAD                        │
└─────────────────────────────────────────────────────────────────────────────┘

1. ACCESO AL PANEL
   └─ Usuario autenticado (rol: USUARIO)
      └─ Accede a: /usuario/dashboard
         └─ Verificación: RolGuard valida USUARIO
            └─ Carga: UsuarioDashboardComponent

2. SELECCIONAR UBICACIONES
   └─ Usuario hace clic: "Crear Nueva Publicidad"
      └─ Navega a: /publicacion/seleccionar-ubicaciones
         └─ Carga: SeleccionarUbicacionesComponent
            ├─ UbicacionServicio.obtenerCiudades$() → Cargar ciudades
            ├─ Usuario selecciona Ciudad
            ├─ UbicacionServicio.obtenerLugaresPorCiudad(ciudadId)
            ├─ Usuario selecciona Lugar(es)
            ├─ Usuario selecciona Piso(s)
            ├─ Sistema calcula: costoPorDia × duracionDias × cantidadPisos
            └─ Usuario continúa con: SeleccionUbicacion[]

3. CREAR PUBLICIDAD
   └─ Navega a: /publicacion/crear (con state)
      └─ Carga: PublicacionCrearComponent
         ├─ Recupera estado: ubicacionesSeleccionadas (pre-llenad)
         ├─ Usuario completa:
         │  ├─ Título (requerido, max 100 caracteres)
         │  ├─ Descripción (requerido, max 500 caracteres)
         │  ├─ Tipo de contenido: VIDEO | IMAGEN
         │  ├─ Upload archivo (drag-drop o click)
         │  │  ├─ Validación tamaño: VIDEO 100MB, IMAGEN 20MB
         │  │  └─ Preview antes de enviar
         │  └─ Duración: 1-365 días
         ├─ Sistema muestra: Costo total en panel lateral
         └─ Usuario envía: PublicacionServicio.enviarParaAprobacion()

4. RESPUESTA
   └─ Backend recibe POST /api/publicaciones
      └─ Guarda publicidad con estado: PENDIENTE
         └─ Usuario es redirigido a: /usuario/dashboard
            └─ Publicidad aparece en lista con badge "⏳ En Revisión"

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                  👨‍💻 FLUJO 2: TÉCNICO REVISA PUBLICIDADES                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. MONITOREO AUTOMÁTICO
   └─ PublicacionServicio inicia: setInterval cada 2 minutos
      └─ Busca publicidades con estado PENDIENTE
         └─ Si hay nuevas:
            └─ Genera AlertaBanner en TecnicoDashboardComponent
               └─ Mensaje: "Se acaba de detectar X publicación(es), favor verificar"

2. REVISIÓN
   └─ Técnico accede a: /tecnico/publicaciones
      └─ Carga: PublicacionRevisarComponent
         ├─ Muestra grid de publicidades PENDIENTE
         ├─ Técnico hace clic en publicidad
         ├─ Se abre modal con detalles completos:
         │  ├─ Título, descripción
         │  ├─ Contenido preview (video/imagen)
         │  ├─ Ubicaciones y costo
         │  ├─ Fecha creación
         │  └─ Botones: Aprobar | Rechazar
         └─ Técnico elige:
            ├─ APROBAR
            │  └─ PublicacionServicio.aprobarPublicacion(id)
            │     └─ Backend actualiza estado: APROBADO
            │        └─ Grid actualiza automáticamente
            │
            └─ RECHAZAR (requiere motivo)
               └─ PublicacionServicio.rechazarPublicacion(id, motivo)
                  └─ Backend actualiza estado: RECHAZADO + motivo
                     └─ Grid actualiza automáticamente

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                 🎬 FLUJO 3: FEED PÚBLICO (SIN AUTENTICACIÓN)               │
└─────────────────────────────────────────────────────────────────────────────┘

1. ACCESO PÚBLICO
   └─ Usuario no autenticado accede a: / (inicio público)
      └─ Carga: FeedPublicoComponent
         ├─ PublicacionServicio obtiene publicidades PUBLICADAS
         ├─ Muestra: Video o Imagen grande
         │  ├─ Encima: Nombre del cliente
         │  └─ Abajo: Ubicación (Ciudad - Lugar)
         ├─ Auto-rotación cada 30 segundos
         │  └─ Efecto transición suave
         └─ CTA Buttons:
            ├─ "Ver Más" → Abre detalles (modal)
            └─ "Registrarse" → Navega a /autenticacion/registro

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                  💬 FLUJO 4: CHAT USUARIO ↔ TÉCNICO                        │
└─────────────────────────────────────────────────────────────────────────────┘

1. USUARIO INICIA CHAT
   └─ Usuario (rol USUARIO) accede a: /chat
      └─ Carga: ChatListaComponent
         ├─ Muestra lista de conversaciones
         ├─ Button: "Nuevo Chat"
         └─ Modal: Seleccionar Técnico
            └─ Usuario selecciona Técnico
               └─ ChatServicio.iniciarChat(usuarioId, tecnicoId)
                  └─ Backend crea conversación (estado: ACTIVO)
                     └─ Se abre ChatDetalleComponent

2. CONVERSACIÓN
   └─ ChatDetalleComponent (view detalle)
      ├─ Muestra mensajes previos
      ├─ Usuario escribe mensaje
      ├─ Usuario envía: ChatServicio.enviarMensaje(chatId, mensaje)
      │  └─ Backend guarda en tabla MENSAJES
      │     └─ Component recibe actualización (RxJS)
      │        └─ Mensaje aparece en lista
      │
      ├─ Técnico responde en su dashboard
      │  └─ Recibe notificación
      │  └─ Responde: enviarMensaje(chatId, mensaje)
      │     └─ Usuario lo ve en tiempo real
      │
      └─ Admin puede ver conversación (ADMIN_CHAT_ID = chat_id)

3. CIERRE
   └─ Admin cierra chat: ChatServicio.cerrarChat(chatId)
      └─ Backend actualiza estado: CERRADO
         └─ Usuario:
            ├─ Ve historial (mensajes anteriores) ✓
            └─ NO PUEDE enviar nuevos mensajes ✗

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│               🖥️  FLUJO 5: DISPOSITIVOS - MONITOREO TÉCNICO               │
└─────────────────────────────────────────────────────────────────────────────┘

1. MONITOREO AUTOMÁTICO
   └─ DispositivoServicio inicia: setInterval cada 5 minutos
      └─ Envía request: GET /api/dispositivos/salud
         ├─ Verifica cada Raspberry Pi (Pantalla)
         │  ├─ Status: CONECTADO | DESCONECTADO | ERROR
         │  ├─ Uptime calculado
         │  └─ Última comunicación
         │
         ├─ Si hay desconexión:
         │  └─ Genera alerta automática
         │     └─ TecnicoDispositivosComponent muestra alerta roja
         │
         └─ Si hay error:
            └─ Registra error en historial
               └─ TecnicoDispositivosComponent muestra badge rojo

2. DASHBOARD TÉCNICO
   └─ Técnico accede a: /tecnico/dispositivos
      └─ Carga: TecnicoDispositivosComponent
         ├─ Tablero con cards por dispositivo:
         │  ├─ Nombre del dispositivo
         │  ├─ Status: 🟢 CONECTADO | 🔴 DESCONECTADO | 🟡 ERROR
         │  ├─ Uptime: Días, horas, minutos
         │  ├─ Última comunicación (timestamp)
         │  └─ Gráfico de uptime
         │
         ├─ Sección de alertas:
         │  ├─ Desconexiones recientes
         │  ├─ Errores registrados
         │  └─ Acciones sugeridas
         │
         └─ Pueden hacer clic para:
            ├─ Ver historial completo
            ├─ Reiniciar dispositivo
            └─ Ver logs detallados

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│            📊 FLUJO 6: DASHBOARD USUARIO - SEGUIMIENTO PUBLICIDADES       │
└─────────────────────────────────────────────────────────────────────────────┘

1. ACCESO PANEL
   └─ Usuario accede a: /usuario/dashboard
      └─ Carga: UsuarioDashboardComponent
         ├─ Header con nombre usuario
         ├─ Navegación: Crear | Mis publicidades | Estadísticas | Facturación
         │
         └─ 4 TARJETAS DE ACCIONES RÁPIDAS:
            │
            ├─ TARJETA 1: "Crear Nueva Publicidad"
            │  └─ Click → /publicacion/seleccionar-ubicaciones
            │
            ├─ TARJETA 2: "Mis Publicidades" (cantidad)
            │  └─ Click → /usuario/mis-publicidades
            │     └─ Muestra todas con filtros por estado
            │
            ├─ TARJETA 3: "Estadísticas"
            │  └─ Click → /usuario/estadisticas
            │     └─ Gráficos de desempeño
            │
            └─ TARJETA 4: "Facturación" (saldo pendiente)
               └─ Click → /usuario/facturacion
                  └─ Historial de pagos y facturas

2. PUBLICIDADES RECIENTES (máximo 3)
   └─ Tabla/grid con últimas 3 publicidades:
      ├─ Título + Descripción (primeros 80 caracteres)
      ├─ Estado con badge de color:
      │  ├─ 🟠 PENDIENTE = Naranja (#ff922b)
      │  ├─ 🟢 APROBADO = Verde (#51cf66)
      │  ├─ 🟡 RECHAZADO = Rojo (#ff6b6b)
      │  ├─ 🔵 PUBLICADO = Azul (#1a5490)
      │  └─ ⚪ FINALIZADO = Gris (#868e96)
      ├─ Ubicaciones (cantidad)
      ├─ Costo total
      ├─ Fecha creación
      ├─ Barra de progreso (0-100%)
      └─ Botón: "Ver detalles"

3. RESUMEN ACTIVIDAD
   └─ 4 Cards informativos:
      ├─ Total Publicidades: suma
      ├─ En Revisión: count(PENDIENTE)
      ├─ Publicadas: count(PUBLICADO)
      └─ Costo Total: sum(costos)

4. INFORMACIÓN ÚTIL
   └─ 3 Cards con info:
      ├─ "¿Cómo crear una publicidad?" - paso a paso
      ├─ "Proceso de aprobación" - tiempo y criterios
      └─ "Costos" - cómo se calcula

═══════════════════════════════════════════════════════════════════════════════

📡 FLUJO DE DATOS EN TIEMPO REAL
───────────────────────────────────────────────────────────────────────────────

                          ┌────────────────┐
                          │     Backend    │
                          │  (API REST)    │
                          └────────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼─────┐  ┌────▼──────┐  ┌──▼─────────┐
            │ Publicaciones│  │   Chats   │  │ Dispositivos│
            └──────┬──────┘  └────┬──────┘  └──┬──────────┘
                   │              │            │
         ┌─────────┴──────────────┼────────────┴──────┐
         │                        │                    │
    ┌────▼────────┐      ┌───────▼────────┐   ┌──────▼─────┐
    │   RxJS      │      │   RxJS         │   │  setInterval│
    │ BehaviorSub │      │ BehaviorSub    │   │   polling   │
    │  Subject    │      │  Subject       │   │             │
    └────┬────────┘      └───────┬────────┘   └──────┬──────┘
         │                       │                   │
    ┌────▼──────────────────────┴───────────────────▼───┐
    │     COMPONENTES SUSCRITOS (takeUntil)            │
    │  - SeleccionarUbicaciones                         │
    │  - PublicacionCrear                              │
    │  - PublicacionRevisar                            │
    │  - ChatLista / ChatDetalle                       │
    │  - TecnicoDispositivos                           │
    │  - UsuarioDashboard                              │
    │  - FeedPublico                                   │
    └───────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

🔐 GUARDIAS DE SEGURIDAD EN CADA RUTA
───────────────────────────────────────────────────────────────────────────────

┌──────────────────────┬──────────────────┬─────────────────────────┐
│      RUTA            │   Guardia        │    Rol Requerido        │
├──────────────────────┼──────────────────┼─────────────────────────┤
│ /usuario             │ guardAutenticacion+ │ USUARIO              │
│ /usuario/dashboard   │ RolGuard           │ USUARIO              │
│ /publicacion/*       │ guardAutenticacion+ │ USUARIO|ADMIN|TECNICO│
│                      │ RolGuard           │                      │
│ /chat                │ guardAutenticacion │ Cualquier rol        │
│ /admin               │ guardAutenticacion+ │ ADMIN                │
│                      │ RolGuard           │                      │
│ /tecnico             │ guardAutenticacion+ │ TECNICO              │
│                      │ RolGuard           │                      │
│ /developer           │ guardAutenticacion+ │ DEVELOPER            │
│                      │ RolGuard           │                      │
│ /                    │ Ninguna (pública)  │ Ninguno              │
│ /inicio              │ Ninguna (pública)  │ Ninguno              │
└──────────────────────┴──────────────────┴─────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

✅ VERIFICACIÓN DE CONEXIONES
───────────────────────────────────────────────────────────────────────────────

SERVICIOS INYECTADOS:
 ✓ UbicacionServicio → SeleccionarUbicaciones + PublicacionCrear
 ✓ PublicacionServicio → PublicacionCrear + PublicacionRevisar + UsuarioDashboard
 ✓ ChatServicio → ChatLista + ChatDetalle
 ✓ DispositivoServicio → TecnicoDispositivos
 ✓ PermisosServicio → TODOS (verificar rol)
 ✓ Router → TODOS (navegación)

FLUJOS DE DATOS:
 ✓ SeleccionarUbicaciones → PublicacionCrear (via state)
 ✓ PublicacionCrear → Backend (POST /api/publicaciones)
 ✓ Backend → UsuarioDashboard (GET publicidades usuario)
 ✓ TecnicoDashboard → PublicacionRevisar (link/navegación)
 ✓ ChatDetalle → Backend (WebSocket o polling)
 ✓ TecnicoDispositivos → DispositivoServicio polling

OBSERVABLES & SUBSCRIPCIONES:
 ✓ Todos usan takeUntil(destroy$) para limpiar
 ✓ RxJS BehaviorSubjects para estado
 ✓ Async pipes en templates donde sea posible
 ✓ OnDestroy implementado en componentes

═══════════════════════════════════════════════════════════════════════════════

NOTA IMPORTANTE: Los diagramas muestran la arquitectura lógica.
La implementación real requiere endpoints backend correspondientes para ser
completamente funcional en producción.

═══════════════════════════════════════════════════════════════════════════════
