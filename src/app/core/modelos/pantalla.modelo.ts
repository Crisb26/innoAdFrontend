/**
 * Modelo de Pantalla (Dispositivo Raspberry Pi)
 * Representa una pantalla digital conectada al sistema InnoAd
 */
export interface Pantalla {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  ubicacion: UbicacionPantalla;
  estado: EstadoPantalla;
  especificaciones: EspecificacionesPantalla;
  configuracion: ConfiguracionPantalla;
  estadisticas: EstadisticasPantalla;
  ultimaConexion: Date;
  ultimaSincronizacion: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type EstadoPantalla = 'conectada' | 'desconectada' | 'error' | 'mantenimiento' | 'inactiva';

export interface UbicacionPantalla {
  direccion: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
  latitud: number;
  longitud: number;
  zona: string;
  referencia?: string;
}

export interface EspecificacionesPantalla {
  resolucion: string; // ej: "1920x1080"
  orientacion: 'horizontal' | 'vertical';
  tamañoPulgadas: number;
  tipoPantalla: 'LED' | 'LCD' | 'OLED';
  modeloDispositivo: string;
  versionSistema: string;
  espacioDisponible: number; // en MB
  soportaAudio: boolean;
}

export interface ConfiguracionPantalla {
  brillo: number; // 0-100
  volumen: number; // 0-100
  horariosEncendido: HorarioEncendido[];
  modoEnergia: 'normal' | 'ahorro';
  reinicioAutomatico: boolean;
  horaReinicio?: string;
  reportarErrores: boolean;
  frecuenciaReporte: number; // en minutos
}

export interface HorarioEncendido {
  diaSemana: number; // 0-6
  horaEncendido: string; // HH:mm
  horaApagado: string; // HH:mm
  activo: boolean;
}

export interface EstadisticasPantalla {
  tiempoEncendido: number; // en horas
  contenidosReproducidos: number;
  campañasActivas: number;
  erroresTotales: number;
  ultimoError?: string;
  fechaUltimoError?: Date;
  tasaDisponibilidad: number; // porcentaje
  ultimaActualizacion: Date;
}

export interface SolicitudCrearPantalla {
  codigo: string;
  nombre: string;
  descripcion: string;
  ubicacion: UbicacionPantalla;
  especificaciones: EspecificacionesPantalla;
  configuracion: ConfiguracionPantalla;
}

export interface SolicitudActualizarPantalla extends Partial<SolicitudCrearPantalla> {
  id: string;
  estado?: EstadoPantalla;
}

export interface ComandoPantalla {
  pantallaId: string;
  comando: 'reiniciar' | 'apagar' | 'encender' | 'sincronizar' | 'actualizar';
  parametros?: any;
}

export interface EstadoConexionPantalla {
  pantallaId: string;
  conectada: boolean;
  latencia: number; // en ms
  ultimoPing: Date;
  version: string;
}

export interface FiltroPantallas {
  estado?: EstadoPantalla;
  ciudad?: string;
  zona?: string;
  busqueda?: string;
  pagina: number;
  tamaño: number;
  ordenarPor?: 'nombre' | 'fechaCreacion' | 'ultimaConexion';
  direccion?: 'asc' | 'desc';
}
