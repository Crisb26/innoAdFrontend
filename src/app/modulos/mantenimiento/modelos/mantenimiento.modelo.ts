/**
 * Modelos para el módulo de Mantenimiento de InnoAd
 * Gestiona alertas, demonio, y estado del sistema
 */

export interface ConfiguracionMantenimiento {
  id: number;
  modoActivo: boolean;
  intervaloVerificacion: number; // En segundos
  notificacionesActivas: boolean;
  registroAuditoriaActivo: boolean;
  limpiezaAutomatica: boolean;
  frecuenciaLimpieza: 'diaria' | 'semanal' | 'mensual';
  horarioLimpieza: string; // HH:mm
  tamanoMaximoRegistros: number; // En MB
  alertasCriticas: boolean;
  alertasAdvertencia: boolean;
  alertasInfo: boolean;
}

export enum TipoAlerta {
  CRITICA = 'CRITICA',
  ADVERTENCIA = 'ADVERTENCIA',
  INFO = 'INFO',
  EXITO = 'EXITO'
}

export enum EstadoAlerta {
  ACTIVA = 'ACTIVA',
  RESUELTA = 'RESUELTA',
  IGNORADA = 'IGNORADA',
  ESCALADA = 'ESCALADA'
}

export interface Alerta {
  id: number;
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  estado: EstadoAlerta;
  origen: string; // Sistema, RaspberryPi, Base de datos, etc
  fechaCreacion: Date;
  fechaResolucion?: Date;
  detalles?: {
    stackTrace?: string;
    codigo?: string;
    usuarioAfectado?: string;
    impacto?: string;
  };
  acciones?: AccionAlerta[];
}

export interface AccionAlerta {
  id: number;
  tipo: 'REINICIAR' | 'ESCALAR' | 'DOCUMENTAR' | 'CONTACTAR_SOPORTE' | 'RESTAURAR';
  descripcion: string;
  estado: 'PENDIENTE' | 'EJECUTANDO' | 'COMPLETADA' | 'FALLIDA';
  resultado?: string;
}

export interface ConfiguracionRaspberryPi {
  id: number;
  nombre: string;
  ipAddress: string;
  puerto: number;
  token: string; // Token de autenticación
  estadoConexion: 'CONECTADO' | 'DESCONECTADO' | 'INACTIVO';
  ultimaActividad: Date;
  sensores: SensorDisposivo[];
  ubicacion: string;
  descripcion: string;
  activa: boolean;
  versionFirmware: string;
  ultimaActualizacion: Date;
}

export interface SensorDisposativo {
  id: number;
  nombre: string;
  tipo: 'TEMPERATURA' | 'HUMEDAD' | 'MOVIMIENTO' | 'LUZ' | 'SONIDO' | 'CUSTOM';
  activo: boolean;
  ultimaLectura: number;
  unidad: string;
  rango: {
    minimo: number;
    maximo: number;
  };
  alertasActivas: boolean;
  limiteAlerta: number;
}

export interface EstadoSistema {
  estadoGeneral: 'NORMAL' | 'ADVERTENCIA' | 'CRITICO';
  salud: number; // 0-100
  porcentajeUso: {
    cpu: number;
    memoria: number;
    almacenamiento: number;
  };
  procesosCriticos: ProcesoSistema[];
  dispositivosConectados: number;
  ultimaVerificacion: Date;
  proxiMaVerificacion: Date;
}

export interface ProcesoSistema {
  id: string;
  nombre: string;
  estado: 'CORRIENDO' | 'DETENIDO' | 'ERROR';
  uso: {
    cpu: number;
    memoria: number;
  };
  ultimaActividad: Date;
  critico: boolean;
}

export interface EventoMantenimiento {
  id: number;
  tipo: 'INICIO_SESION' | 'CAMBIO_CONFIG' | 'ALERTA_GENERADA' | 'ACCION_EJECUTADA' | 'DISPOSITIVO_CONECTADO' | 'DISPOSITIVO_DESCONECTADO';
  descripcion: string;
  usuario: string;
  dispositivo?: string;
  fecha: Date;
  detalles: Record<string, any>;
  impacto: 'BAJO' | 'MEDIO' | 'ALTO';
}

export interface DatosMonitoreo {
  timestamp: Date;
  cpu: number;
  memoria: number;
  almacenamiento: number;
  ancho_banda: number;
  latencia: number;
  peticionesHora: number;
  erroresHora: number;
  usuariosActivos: number;
  dispositivosActivos: number;
}

export interface RespuestaConfiguracionMantenimiento {
  configuracion: ConfiguracionMantenimiento;
  estadoSistema: EstadoSistema;
  alertasActivas: Alerta[];
  dispositivos: ConfiguracionRaspberryPi[];
  ultimoMonitoreo: DatosMonitoreo;
}
