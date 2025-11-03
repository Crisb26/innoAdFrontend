/**
 * Modelo de Usuario del sistema InnoAd
 * Representa la información completa de un usuario registrado
 */
export interface Usuario {
  id: string;
  nombreUsuario: string;
  email: string;
  nombreCompleto: string;
  telefono?: string;
  avatarUrl?: string;
  rol: Rol;
  permisos: Permiso[];
  activo: boolean;
  verificado: boolean;
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  configuracion: ConfiguracionUsuario;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  nivel: number;
}

export interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  recurso: string;
  acciones: string[];
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
  usuario: Usuario;
  expiraEn: number;
}

export interface SolicitudLogin {
  emailOUsuario: string;
  contrasena: string;
  recordarme: boolean;
}

export interface SolicitudRegistro {
  nombreUsuario: string;
  email: string;
  nombreCompleto: string;
  contrasena: string;
  telefono?: string;
  aceptaTerminos: boolean;
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
