/**
 * ARQUITECTURA DE ROLES Y PERMISOS - InnoAd Sistema
 * Documento estratégico de definición de permisos por rol
 * 
 * Principios:
 * 1. Principio de Menor Privilegio (PoLP)
 * 2. Separación de Responsabilidades
 * 3. Auditoría completa de acciones
 * 4. Granularidad en permisos
 */

// ============================================================================
// 1. ESTRUCTURA DE ROLES
// ============================================================================

ROLES DEFINIDOS:
├─ SUPER_ADMIN        (Nivel 5) - Control total del sistema
├─ ADMIN              (Nivel 4) - Administrador de cuenta
├─ GERENTE            (Nivel 3) - Gestor de campañas y reportes
├─ OPERADOR           (Nivel 2) - Gestor de contenidos y pantallas
└─ USUARIO            (Nivel 1) - Usuario estándar (lectura)

// ============================================================================
// 2. MATRIZ DE PERMISOS POR ROL
// ============================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ PERMISO                          │ SUPER_ADMIN │ ADMIN │ GERENTE │ OPERADOR │ USUARIO │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ SISTEMA                                                                         │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ MODO_MANTENIMIENTO_VER           │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ MODO_MANTENIMIENTO_ACTIVAR       │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ CONFIGURACION_SISTEMA            │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ LOGS_AUDITORIA_VER               │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ LOGS_AUDITORIA_EXPORTAR          │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ BACKUPS_VER                      │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ BACKUPS_CREAR                    │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ BACKUPS_RESTAURAR                │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│                                  │             │       │         │          │         │
│ ROLES Y PERMISOS                                                               │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ ROLES_VER                        │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ ROLES_CREAR                      │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ ROLES_EDITAR                     │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ ROLES_ELIMINAR                   │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ PERMISOS_VER                     │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ PERMISOS_ASIGNAR                 │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│                                  │             │       │         │          │         │
│ GESTIÓN DE USUARIOS                                                            │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ USUARIOS_VER                     │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ USUARIOS_CREAR                   │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ USUARIOS_EDITAR                  │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ USUARIOS_ELIMINAR                │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ USUARIOS_CAMBIAR_ROL             │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ USUARIOS_DESACTIVAR              │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ USUARIOS_EXPORTAR                │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ PERFIL_VER_PROPIO                │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ PERFIL_EDITAR_PROPIO             │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ PERFIL_CAMBIAR_CONTRASENA        │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ PERFIL_VER_OTROS                 │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│                                  │             │       │         │          │         │
│ GESTIÓN DE CAMPAÑAS                                                            │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ CAMPANAS_VER                     │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ CAMPANAS_VER_PROPIAS             │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ CAMPANAS_CREAR                   │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ CAMPANAS_EDITAR                  │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ CAMPANAS_ELIMINAR                │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ CAMPANAS_PUBLICAR                │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ CAMPANAS_DESPUBLICAR             │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ CAMPANAS_PROGRAMAR               │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ CAMPANAS_CLONAR                  │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│                                  │             │       │         │          │         │
│ GESTIÓN DE CONTENIDOS                                                          │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ CONTENIDOS_VER                   │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ CONTENIDOS_VER_PROPIOS           │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ CONTENIDOS_CREAR                 │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ CONTENIDOS_EDITAR                │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ CONTENIDOS_ELIMINAR              │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ CONTENIDOS_SUBIR_MULTIMEDIA      │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ CONTENIDOS_APROBAR               │      ✅     │  ✅   │   ❌    │    ❌    │   ❌    │
│ CONTENIDOS_RECHAZAR              │      ✅     │  ✅   │   ❌    │    ❌    │   ❌    │
│ CONTENIDOS_VER_VERSIONES         │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ CONTENIDOS_EXPORTAR              │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│                                  │             │       │         │          │         │
│ GESTIÓN DE PANTALLAS                                                           │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ PANTALLAS_VER                    │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ PANTALLAS_CREAR                  │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ PANTALLAS_EDITAR                 │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ PANTALLAS_ELIMINAR               │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ PANTALLAS_ASIGNAR_CONTENIDO      │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ PANTALLAS_PROGRAMAR              │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│ PANTALLAS_MONITOREAR             │      ✅     │  ✅   │   ✅    │    ✅    │   ✅    │
│ PANTALLAS_CONTROL_REMOTO         │      ✅     │  ✅   │   ❌    │    ✅    │   ❌    │
│                                  │             │       │         │          │         │
│ REPORTES Y ESTADÍSTICAS                                                        │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ REPORTES_VER                     │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ REPORTES_VER_PROPIOS             │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ REPORTES_CREAR                   │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ REPORTES_PERSONALIZADO           │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ REPORTES_EXPORTAR_PDF            │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ REPORTES_EXPORTAR_CSV            │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ REPORTES_PROGRAMAR_ENVIO         │      ✅     │  ✅   │   ✅    │    ❌    │   ❌    │
│ ESTADISTICAS_VER                 │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│ ESTADISTICAS_TIEMPO_REAL         │      ✅     │  ✅   │   ✅    │    ❌    │   ✅    │
│                                  │             │       │         │          │         │
│ INTEGRACIONES Y API                                                            │
├──────────────────────────────────┼─────────────┼───────┼─────────┼──────────┼─────────┤
│ INTEGRACIONES_VER                │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ INTEGRACIONES_CREAR              │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ INTEGRACIONES_EDITAR             │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ INTEGRACIONES_ELIMINAR           │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ API_KEYS_VER                     │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ API_KEYS_CREAR                   │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
│ API_KEYS_REGENERAR               │      ✅     │  ✅   │    ❌   │    ❌    │   ❌    │
└─────────────────────────────────┴─────────────┴───────┴─────────┴──────────┴─────────┘

// ============================================================================
// 3. DESCRIPCIONES DETALLADAS DE CADA ROL
// ============================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ SUPER_ADMIN (Nivel 5)                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Descripción:
  Acceso total al sistema. Solo debe haber 1-2 super administradores.
  Responsable de control general, seguridad y configuraciones críticas.

Responsabilidades Principales:
  ✓ Gestión de modos mantenimiento
  ✓ Control de backups y restauraciones
  ✓ Gestión de administradores
  ✓ Auditoría del sistema
  ✓ Configuraciones de seguridad
  ✓ Gestión de integraciones y API keys

Permisos Clave:
  • 50+ permisos sin restricciones
  • Acceso a todas las funciones
  • Posibilidad de eliminar datos críticos
  • Control total de logs

Casos de Uso:
  - Restaurar de backups después de fallo
  - Activar modo mantenimiento en emergencia
  - Cambiar roles críticos de usuarios
  - Investigar brechas de seguridad

Restricciones:
  ❌ No puede haber limitaciones de acceso
  ⚠️  AUDITAR todas las acciones


┌─────────────────────────────────────────────────────────────────────────────┐
│ ADMIN (Nivel 4)                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Descripción:
  Administrador de cuenta. Gestiona usuarios, configuración y seguridad
  a nivel de operación. Delega tareas operativas a Gerentes y Operadores.

Responsabilidades Principales:
  ✓ Gestión completa de usuarios
  ✓ Asignación de roles y permisos
  ✓ Control de mantenimiento
  ✓ Visualización de logs de auditoría
  ✓ Gestión de campañas críticas
  ✓ Aprobación de contenidos

Permisos Clave:
  • Usuarios: CRUD completo
  • Roles: Crear y editar
  • Campañas: Ver todas y editar críticas
  • Contenidos: Aprobar/rechazar
  • Reportes: Ver todas

Casos de Uso:
  - Crear nuevo usuario con rol específico
  - Cambiar rol de operador a gerente
  - Activar/desactivar usuario suspicaz
  - Aprobar contenidos de múltiples proveedores
  - Visualizar auditoría de cambios

Restricciones:
  ❌ No puede eliminar la única cuenta Super Admin
  ❌ No puede restaurar backups
  ✓ Puede auditar a otros admins


┌─────────────────────────────────────────────────────────────────────────────┐
│ GERENTE (Nivel 3)                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

Descripción:
  Responsable de campañas y reportes. Dirige la estrategia publicitaria,
  crea campañas y analiza resultados. NO gestiona usuarios.

Responsabilidades Principales:
  ✓ Crear y editar campañas
  ✓ Publicar/despublicar campañas
  ✓ Programar fechas de campañas
  ✓ Visualizar estadísticas
  ✓ Generar reportes
  ✓ Exportar datos (PDF/CSV)

Permisos Clave:
  • Campañas: CRUD completo
  • Contenidos: Lectura solamente
  • Pantallas: Visualizar + monitoreo
  • Reportes: Ver y crear
  • Perfil: Editar propio

Casos de Uso:
  - Crear nueva campaña navideña
  - Programar activación de campaña para fecha específica
  - Generar reporte de ROI de última campaña
  - Exportar datos a Excel para presentación
  - Ver monitoreo de pantallas en tiempo real

Restricciones:
  ❌ NO puede crear/editar usuarios
  ❌ NO puede crear/editar contenidos
  ❌ NO puede gestionar pantallas
  ❌ NO puede ver logs de auditoría
  ✓ Solo ve sus propias campañas (puede configurarse)


┌─────────────────────────────────────────────────────────────────────────────┐
│ OPERADOR (Nivel 2)                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

Descripción:
  Responsable de contenidos y pantallas. Ejecuta las campañas creadas
  por gerentes. Sube multimedia, gestiona pantallas y realiza control remoto.

Responsabilidades Principales:
  ✓ Subir y gestionar contenidos multimedia
  ✓ Crear y editar pantallas
  ✓ Asignar contenido a pantallas
  ✓ Programar reproducción
  ✓ Control remoto de pantallas
  ✓ Monitoreo de dispositivos

Permisos Clave:
  • Contenidos: CRUD completo
  • Pantallas: CRUD completo
  • Campañas: Lectura solamente
  • Reportes: Ver solo propios
  • Perfil: Editar propio

Casos de Uso:
  - Subir video de publicidad para campaña
  - Crear nueva zona de pantalla en tienda
  - Asignar video a pantalla específica
  - Programar inicio de reproducción
  - Hacer control remoto para reiniciar pantalla
  - Ver monitoreo de salud de dispositivos

Restricciones:
  ❌ NO puede crear/editar campañas
  ❌ NO puede crear/editar usuarios
  ❌ NO puede aprobar contenidos (Admin)
  ❌ NO puede generar reportes
  ❌ NO puede ver configuración del sistema
  ✓ Solo ve/edita sus propios contenidos


┌─────────────────────────────────────────────────────────────────────────────┐
│ USUARIO (Nivel 1)                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

Descripción:
  Usuario estándar con acceso de lectura. Puede ver campañas, estadísticas
  y contenidos publicados. Perfil de "observador" o "cliente final".

Responsabilidades Principales:
  ✓ Ver campañas publicitarias
  ✓ Ver estadísticas de campañas propias
  ✓ Ver contenidos publicados
  ✓ Exportar reportes básicos
  ✓ Gestionar perfil personal

Permisos Clave:
  • Campañas: Lectura + propias
  • Contenidos: Lectura + propias
  • Pantallas: Lectura + monitoreo
  • Reportes: Lectura + exportar
  • Perfil: Editar propio

Casos de Uso:
  - Ver todas las campañas activas
  - Ver estadísticas de su propia campaña
  - Ver pantallas activas
  - Exportar reporte de su campaña
  - Cambiar contraseña propia

Restricciones:
  ❌ NO puede crear/editar nada
  ❌ NO puede ver usuarios
  ❌ NO puede ver configuración
  ❌ NO puede ver logs
  ✓ Solo lectura + perfil propio

// ============================================================================
// 4. MATRIZ DE VISIBILIDAD DE DATOS
// ============================================================================

¿QUÉ VE CADA ROL EN LISTADOS?

CAMPAÑAS:
  • SUPER_ADMIN: Todas
  • ADMIN:       Todas
  • GERENTE:     Todas (o solo propias según configuración)
  • OPERADOR:    Ninguna (pero ve asignaciones en pantallas)
  • USUARIO:     Solo propias

CONTENIDOS:
  • SUPER_ADMIN: Todos
  • ADMIN:       Todos
  • GERENTE:     Solo aprobados
  • OPERADOR:    Todos (propios + asignados)
  • USUARIO:     Solo propios

USUARIOS:
  • SUPER_ADMIN: Todos
  • ADMIN:       Todos
  • GERENTE:     Ninguno
  • OPERADOR:    Ninguno
  • USUARIO:     Solo a sí mismo

PANTALLAS:
  • SUPER_ADMIN: Todas
  • ADMIN:       Todas
  • GERENTE:     Todas (monitoreo)
  • OPERADOR:    Todas (gestión)
  • USUARIO:     Todas (lectura)

REPORTES:
  • SUPER_ADMIN: Todos
  • ADMIN:       Todos
  • GERENTE:     Todos
  • OPERADOR:    Ninguno
  • USUARIO:     Solo propios

// ============================================================================
// 5. IMPLEMENTACIÓN EN CÓDIGO
// ============================================================================

BACKEND (Java/Spring):

@Transactional
public List<Campana> obtenerCampanasParaUsuario(Usuario usuario) {
    RolUsuario rol = usuario.getRol();
    
    return switch(rol) {
        case SUPER_ADMIN, ADMIN -> repositorio.findAll();
        case GERENTE -> repositorio.findByEstado(EstadoCampana.ACTIVA);
        case OPERADOR -> List.of(); // No ve campañas
        case USUARIO -> repositorio.findByCreadorId(usuario.getId());
    };
}

FRONTEND (Angular):

private tienePermiso(permiso: string): boolean {
    return this.usuarioActual()?.permisos.includes(permiso) ?? false;
}

private puedeVer(recurso: string): boolean {
    const rol = this.usuarioActual()?.rol;
    return this.matrizPermisos[rol]?.[recurso] ?? false;
}

// Uso en componente:
<button *ngIf="puedeVer('CAMPANAS_CREAR')" (click)="crearCampana()">
  Crear Campaña
</button>

// ============================================================================
// 6. REGLAS ESPECIALES
// ============================================================================

1. DELEGACIÓN DE OPERACIONES
   ├─ Admin delega a Gerentes: Campañas
   ├─ Gerentes delegan a Operadores: Contenidos/Pantallas
   └─ Operadores = Ejecución operativa

2. ESCALADO EN CADENA
   ├─ Problema Usuario → Operador → Gerente → Admin → Super Admin
   └─ Cada nivel resuelve su ámbito

3. AUDITORÍA VINCULADA A ROLES
   ├─ Super Admin: Todas las acciones del sistema
   ├─ Admin: Todas las acciones de usuarios/config
   ├─ Gerente: Todas sus campañas
   ├─ Operador: Todos sus contenidos
   └─ Usuario: Solo acciones propias

4. ELIMINACIÓN DE DATOS
   ├─ Super Admin + Admin: Pueden eliminar
   ├─ Otros roles: Solo "marcar como inactivo"
   └─ Soft delete recomendado

5. CAMBIOS DE ROL
   ├─ Requiere autenticación de 2 factores
   ├─ Se audita como evento crítico
   ├─ Solo Admin+ pueden hacer
   └─ Notificación al usuario afectado

// ============================================================================
// 7. IMPLEMENTACIÓN DE FILTROS EN QUERIES
// ============================================================================

// Base de datos - Vistas por rol
CREATE VIEW campanas_visibles AS
  SELECT c.* FROM campanas c
  WHERE 
    c.creador_id = CURRENT_USER_ID  -- Propias
    OR c.estado = 'PUBLICA'          -- Públicas
    OR CURRENT_USER_ROL IN ('ADMIN', 'SUPER_ADMIN'); -- Admins ven todas

// JPA Specification
public class CampanaSpecifications {
    public static Specification<Campana> visiblesParaUsuario(Usuario usuario) {
        return (root, query, cb) -> {
            if (usuario.esAdmin()) {
                return cb.conjunction(); // Sin filtro
            } else if (usuario.esGerente()) {
                return cb.equal(root.get("estado"), EstadoCampana.ACTIVA);
            } else {
                return cb.equal(root.get("creador"), usuario);
            }
        };
    }
}

// ============================================================================
// 8. CHECKLIST DE SEGURIDAD
// ============================================================================

✓ Todo usuario debe tener un rol
✓ Todo rol debe tener permisos definidos
✓ Toda acción debe ser auditada
✓ Cambios de rol requieren approval
✓ Soft delete para datos sensibles
✓ Validación de permisos en backend (NO confiar en frontend)
✓ Logs de intentos fallidos
✓ Bloqueo temporal después de N intentos
✓ Notificaciones de actividades sospechosas
✓ Expiración automática de roles inactivos (90 días)

// ============================================================================
// 9. TABLA DE VALORES NUMÉRICOS DE PERMISOS
// ============================================================================

Para implementar con bitwise operations (si es necesario):

USUARIO_VER = 1 << 0    // 1
USUARIO_CREAR = 1 << 1  // 2
USUARIO_EDITAR = 1 << 2 // 4
USUARIO_ELIMINAR = 1 << 3 // 8

CAMPANA_VER = 1 << 4    // 16
CAMPANA_CREAR = 1 << 5  // 32
CAMPANA_EDITAR = 1 << 6 // 64
CAMPANA_ELIMINAR = 1 << 7 // 128

// Asignar permisos: permisosBitwise = USUARIO_VER | USUARIO_EDITAR = 1 | 4 = 5
// Validar permiso: (permisosBitwise & USUARIO_VER) != 0

// ============================================================================
// 10. MIGRACIÓN DESDE SISTEMA ACTUAL
// ============================================================================

Paso 1: Mapear usuarios actuales a roles
  - Revisar acciones históricas
  - Determinar rol más apropiado
  - Validar con propietario

Paso 2: Crear estructura de Rol en BD
  - Ejecutar migrations
  - Crear valores por defecto
  - Validar integridad referencial

Paso 3: Actualizar código
  - Implementar Guards de permisos
  - Actualizar Controllers con @PreAuthorize
  - Ocultar UI según permisos

Paso 4: Testing exhaustivo
  - Test cada rol x permiso
  - Validar filtrado de datos
  - Verificar logs de auditoría

Paso 5: Rollout graduado
  - Fase 1: Super Admin + Admin
  - Fase 2: Gerentes
  - Fase 3: Operadores
  - Fase 4: Usuarios finales

// ============================================================================
// CONCLUSIÓN
// ============================================================================

Esta arquitectura provee:
✓ Seguridad granular
✓ Escalabilidad
✓ Cumplimiento normativo
✓ Auditoría completa
✓ Facilidad de mantenimiento
✓ Experiencia de usuario adecuada por rol

Todos los permisos son ADITIVOS (un rol tiene más permisos que el anterior).
No hay "permisos inversivos" (negar específicamente).

