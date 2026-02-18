/**
 * Configuración centralizada de Roles y Permisos para InnoAd
 * Define la estructura jerárquica de roles y sus permisos asociados
 */

export enum Rol {
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  USUARIO = 'USUARIO'
}

export interface ConfiguracionRol {
  nombre: Rol;
  descripcion: string;
  nivel: number; // Para jerarquía: ADMINISTRADOR=4, TECNICO=3, OPERADOR=2, USUARIO=1
  permisos: Set<Permiso>;
  rutas: string[];
}

export enum Permiso {
  // Campañas
  CREAR_CAMPANA = 'CREAR_CAMPANA',
  VER_CAMPANA = 'VER_CAMPANA',
  EDITAR_CAMPANA = 'EDITAR_CAMPANA',
  ELIMINAR_CAMPANA = 'ELIMINAR_CAMPANA',
  PUBLICAR_CAMPANA = 'PUBLICAR_CAMPANA',

  // Pantallas
  CREAR_PANTALLA = 'CREAR_PANTALLA',
  VER_PANTALLA = 'VER_PANTALLA',
  EDITAR_PANTALLA = 'EDITAR_PANTALLA',
  ELIMINAR_PANTALLA = 'ELIMINAR_PANTALLA',
  CONTROLAR_PANTALLA = 'CONTROLAR_PANTALLA',

  // Contenidos
  CREAR_CONTENIDO = 'CREAR_CONTENIDO',
  VER_CONTENIDO = 'VER_CONTENIDO',
  EDITAR_CONTENIDO = 'EDITAR_CONTENIDO',
  ELIMINAR_CONTENIDO = 'ELIMINAR_CONTENIDO',
  APROBAR_CONTENIDO = 'APROBAR_CONTENIDO',

  // Reportes y Análisis
  VER_REPORTES = 'VER_REPORTES',
  EXPORTAR_REPORTES = 'EXPORTAR_REPORTES',
  VER_GRAFICOS = 'VER_GRAFICOS',

  // Pagos
  VER_PAGOS = 'VER_PAGOS',
  PROCESAR_PAGO = 'PROCESAR_PAGO',
  VER_HISTORIAL_PAGOS = 'VER_HISTORIAL_PAGOS',
  REEMBOLSAR = 'REEMBOLSAR',

  // Admin
  ADMINISTRAR_USUARIOS = 'ADMINISTRAR_USUARIOS',
  ADMINISTRAR_ROLES = 'ADMINISTRAR_ROLES',
  VER_AUDITORIA = 'VER_AUDITORIA',
  ADMINISTRAR_CONFIGURACION = 'ADMINISTRAR_CONFIGURACION',

  // IA y Chat
  USAR_ASISTENTE_IA = 'USAR_ASISTENTE_IA',
  USAR_CHAT = 'USAR_CHAT',
  CREAR_CAMPANA_CON_IA = 'CREAR_CAMPANA_CON_IA',

  // Mantenimiento
  VER_MANTENIMIENTO = 'VER_MANTENIMIENTO',
  PROGRAMAR_MANTENIMIENTO = 'PROGRAMAR_MANTENIMIENTO'
}

/**
 * Configuración de permisos por rol
 */
export const CONFIGURACION_ROLES: Record<Rol, ConfiguracionRol> = {
  [Rol.ADMIN]: {
    nombre: Rol.ADMIN,
    descripcion: 'Control total del sistema. Acceso a todas las funcionalidades.',
    nivel: 3,
    permisos: new Set(Object.values(Permiso)),
    rutas: ['/', '/dashboard', '/admin', '/campanas', '/pantallas', '/contenidos', '/reportes', '/pagos', '/asistente-ia', '/chat', '/mantenimiento']
  },

  [Rol.TECNICO]: {
    nombre: Rol.TECNICO,
    descripcion: 'Gestión técnica de pantallas y contenidos. Monitoreo y control de hardware.',
    nivel: 2,
    permisos: new Set([
      // Campañas - lectura
      Permiso.VER_CAMPANA,
      
      // Pantallas - todas
      Permiso.CREAR_PANTALLA,
      Permiso.VER_PANTALLA,
      Permiso.EDITAR_PANTALLA,
      Permiso.ELIMINAR_PANTALLA,
      Permiso.CONTROLAR_PANTALLA,
      
      // Contenidos - todas
      Permiso.CREAR_CONTENIDO,
      Permiso.VER_CONTENIDO,
      Permiso.EDITAR_CONTENIDO,
      Permiso.ELIMINAR_CONTENIDO,
      Permiso.APROBAR_CONTENIDO,
      
      // Reportes
      Permiso.VER_REPORTES,
      Permiso.VER_GRAFICOS,
      
      // IA
      Permiso.USAR_ASISTENTE_IA,
      Permiso.USAR_CHAT,
      
      // Mantenimiento
      Permiso.VER_MANTENIMIENTO,
      Permiso.PROGRAMAR_MANTENIMIENTO
    ]),
    rutas: ['/dashboard', '/campanas', '/pantallas', '/contenidos', '/reportes', '/asistente-ia', '/chat', '/mantenimiento']
  },

  [Rol.USUARIO]: {
    nombre: Rol.USUARIO,
    descripcion: 'Usuario básico. Acceso limitado a funcionalidades de lectura y creación de contenido.',
    nivel: 1,
    permisos: new Set([
      // Campañas - lectura
      Permiso.VER_CAMPANA,
      
      // Contenidos - crear y ver
      Permiso.CREAR_CONTENIDO,
      Permiso.VER_CONTENIDO,
      
      // Reportes
      Permiso.VER_REPORTES,
      
      // Pagos
      Permiso.VER_PAGOS,
      Permiso.PROCESAR_PAGO,
      Permiso.VER_HISTORIAL_PAGOS,
      
      // IA
      Permiso.USAR_ASISTENTE_IA,
      Permiso.USAR_CHAT,
      Permiso.CREAR_CAMPANA_CON_IA
    ]),
    rutas: ['/dashboard', '/campanas', '/contenidos', '/reportes', '/pagos', '/asistente-ia', '/chat']
  }
};

/**
 * Validar si un rol tiene un permiso específico
 */
export function tienePermiso(rol: Rol, permiso: Permiso): boolean {
  const config = CONFIGURACION_ROLES[rol];
  return config?.permisos.has(permiso) || false;
}

/**
 * Validar si un rol tiene acceso a una ruta
 */
export function tieneAccesoRuta(rol: Rol, ruta: string): boolean {
  const config = CONFIGURACION_ROLES[rol];
  return config?.rutas.some(r => ruta.startsWith(r)) || false;
}

/**
 * Obtener descripción de rol
 */
export function obtenerDescripcionRol(rol: Rol): string {
  return CONFIGURACION_ROLES[rol]?.descripcion || 'Rol desconocido';
}

/**
 * Obtener nivel jerárquico del rol
 */
export function obtenerNivelRol(rol: Rol): number {
  return CONFIGURACION_ROLES[rol]?.nivel || 0;
}

/**
 * Comparar jerarquía de roles
 * @returns true si rol1 tiene mayor o igual jerarquía que rol2
 */
export function tieneJerarquiaMayor(rol1: Rol, rol2: Rol): boolean {
  return obtenerNivelRol(rol1) >= obtenerNivelRol(rol2);
}
