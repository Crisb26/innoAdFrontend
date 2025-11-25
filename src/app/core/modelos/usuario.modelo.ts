/**
 * Modelo de Usuario del sistema InnoAd
 * Representa la información completa de un usuario registrado
 */
export interface Usuario {
  id: number | string; // Backend envía number; mantenemos compatibilidad
  nombreUsuario: string;
  email: string;
  nombreCompleto: string;
  cedula?: string; // Nuevo campo
  telefono?: string;
  direccion?: string; // Nuevo campo
  avatarUrl?: string;
  rol: Rol | RolSimple; // Permitir ambos tipos para compatibilidad
  permisos?: Permiso[] | PermisoSimple[]; // Hacer opcional y permitir ambos tipos
  activo?: boolean;
  verificado?: boolean;
  ultimoAcceso?: Date;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  configuracion?: ConfiguracionUsuario;
}

export interface Rol {
  id?: string;
  nombre: string;
  descripcion?: string;
  permisos?: string[];
  nivel?: number;
}

// Rol simplificado del backend
export interface RolSimple {
  nombre: string;
}

export interface Permiso {
  id?: string;
  nombre: string;
  descripcion?: string;
  recurso?: string;
  acciones?: string[];
}

// Permiso simplificado del backend
export interface PermisoSimple {
  nombre: string;
}

export interface ConfiguracionUsuario {
  idioma: string;
  zonaHoraria: string;
  temaOscuro: boolean;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  frecuenciaReportes: 'diaria' | 'semanal' | 'mensual' | 'nunca';
}

export interface RespuestaLogin {
  token: string;
  tokenActualizacion: string;
  usuario: Usuario; // Usamos Usuario ya que ahora es compatible con lo que envía el backend
  expiraEn: number;
}

export interface SolicitudLogin {
  nombreUsuarioOEmail: string; // Alineado con contrato del backend
  contrasena: string;
  recordarme: boolean;
}

export interface SolicitudRegistro {
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  email: string;
  cedula: string;
  contrasena: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
}

export interface SolicitudCambioContrasena {
  contrasenaActual: string;
  contrasenaNueva: string;
  confirmarContrasena: string;
}
export interface SolicitudRecuperarContrasena {
  email: string;
}
export interface SolicitudRestablecerContrasena {
  token: string;
  contrasenaNueva: string;
  confirmarContrasena: string;
}

export interface SolicitudActualizarPerfil {
  email?: string;
  telefono?: string;
  direccion?: string;
  avatarUrl?: string;
}
