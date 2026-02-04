/**
 * Modelo de Contenido multimedia
 * Representa archivos de imagen, video o HTML para campañas
 */
export interface Contenido {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoContenido;
  url: string;
  thumbnailUrl?: string;
  tamaño: number; // en bytes
  duracion?: number; // en segundos (para videos)
  dimensiones: DimensionesContenido;
  formato: string; // ej: 'jpg', 'mp4', 'html'
  etiquetas: string[];
  categoria: string;
  estado: EstadoContenido;
  visibilidad: 'publico' | 'privado' | 'compartido';
  estadisticas: EstadisticasContenido;
  metadatos: MetadatosContenido;
  creadoPor: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export type TipoContenido = 'imagen' | 'video' | 'html' | 'html-interactivo';
export type EstadoContenido = 'procesando' | 'disponible' | 'error' | 'archivado';

export interface DimensionesContenido {
  ancho: number;
  alto: number;
  relacionAspecto: string; // ej: "16:9"
}

export interface EstadisticasContenido {
  vecesUtilizado: number;
  campañasActivas: number;
  reproducciones: number;
  tiempoTotalReproduccion: number;
  ultimoUso?: Date;
}

export interface MetadatosContenido {
  autor?: string;
  copyright?: string;
  fechaCaptura?: Date;
  ubicacionCaptura?: string;
  camara?: string;
  software?: string;
  version?: string;
  colorSpace?: string;
  [key: string]: any;
}

export interface SolicitudSubirContenido {
  nombre: string;
  descripcion: string;
  tipo: TipoContenido;
  archivo: File;
  etiquetas: string[];
  categoria: string;
  visibilidad: 'publico' | 'privado' | 'compartido';
  duracion?: number;
}

export interface SolicitudActualizarContenido {
  id: string;
  nombre?: string;
  descripcion?: string;
  etiquetas?: string[];
  categoria?: string;
  visibilidad?: 'publico' | 'privado' | 'compartido';
  estado?: EstadoContenido;
}

export interface FiltroContenidos {
  tipo?: TipoContenido;
  categoria?: string;
  etiquetas?: string[];
  estado?: EstadoContenido;
  visibilidad?: 'publico' | 'privado' | 'compartido';
  busqueda?: string;
  pagina: number;
  tamaño: number;
  ordenarPor?: 'nombre' | 'fechaCreacion' | 'tamaño' | 'vecesUtilizado';
  direccion?: 'asc' | 'desc';
}

export interface ProgresoSubida {
  contenidoId: string;
  porcentaje: number;
  bytesSubidos: number;
  bytesTotales: number;
  velocidad: number; // bytes por segundo
  tiempoRestante: number; // en segundos
}

export interface ResultadoValidacionContenido {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  dimensiones?: DimensionesContenido;
  duracion?: number;
  tamaño: number;
  formato: string;
}
