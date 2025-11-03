/**
 * Modelo de Campaña publicitaria
 * Representa una campaña de publicidad digital en el sistema InnoAd
 */
export interface Campana {
  id: string;
  nombre: string;
  descripcion: string;
  cliente: string;
  estado: EstadoCampana;
  tipo: TipoCampana;
  prioridad: number;
  presupuesto: number;
  presupuestoGastado: number;
  fechaInicio: Date;
  fechaFin: Date;
  horarios: HorarioCampana[];
  pantallas: string[]; // IDs de pantallas asignadas
  contenidos: ContenidoCampana[];
  estadisticas: EstadisticasCampana;
  configuracion: ConfiguracionCampana;
  etiquetas: string[];
  creadoPor: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type EstadoCampana = 'borrador' | 'programada' | 'activa' | 'pausada' | 'finalizada' | 'cancelada';
export type TipoCampana = 'imagen' | 'video' | 'html' | 'mixta';

export interface HorarioCampana {
  diaSemana: number; // 0-6 (domingo-sábado)
  horaInicio: string; // formato HH:mm
  horaFin: string;
  activo: boolean;
}

export interface ContenidoCampana {
  id: string;
  nombre: string;
  tipo: 'imagen' | 'video' | 'html';
  url: string;
  duracion: number; // en segundos
  orden: number;
  activo: boolean;
}

export interface EstadisticasCampana {
  impresiones: number;
  reproducciones: number;
  tiempoTotalReproduccion: number;
  alcance: number;
  pantallasActivas: number;
  tasaExito: number;
  ultimaActualizacion: Date;
}

export interface ConfiguracionCampana {
  rotacionAutomatica: boolean;
  tiempoRotacion: number;
  repetirIndefinidamente: boolean;
  numeroRepeticiones?: number;
  transicionEntreContenidos: 'ninguna' | 'fundido' | 'deslizar';
  volumenAudio: number; // 0-100
  pausarEnError: boolean;
}

export interface SolicitudCrearCampana {
  nombre: string;
  descripcion: string;
  cliente: string;
  tipo: TipoCampana;
  prioridad: number;
  presupuesto: number;
  fechaInicio: Date;
  fechaFin: Date;
  horarios: HorarioCampana[];
  pantallas: string[];
  contenidos: string[];
  configuracion: ConfiguracionCampana;
  etiquetas: string[];
}

export interface SolicitudActualizarCampana extends Partial<SolicitudCrearCampana> {
  id: string;
  estado?: EstadoCampana;
}

export interface FiltroCampanas {
  estado?: EstadoCampana;
  tipo?: TipoCampana;
  cliente?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  busqueda?: string;
  pagina: number;
  tamaño: number;
  ordenarPor?: 'nombre' | 'fechaCreacion' | 'fechaInicio' | 'presupuesto';
  direccion?: 'asc' | 'desc';
}
