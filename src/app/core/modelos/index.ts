/**
 * Índice de exportación de todos los modelos del sistema InnoAd
 */

// Modelos de Usuario y Autenticación
export * from './usuario.modelo';

// Modelos de Campañas
export * from './campana.modelo';

// Modelos de Pantallas
export * from './pantalla.modelo';

// Modelos de Contenidos
export * from './contenido.modelo';

// Modelos de Agente IA
export * from './agente-ia.modelo';

// Modelos de Estadísticas y Reportes
export * from './estadisticas.modelo';

// Modelos Compartidos
export interface RespuestaAPI<T> {
  exitoso: boolean;
  mensaje?: string;
  datos?: T;
  errores?: string[];
  metadatos?: MetadatosRespuesta;
}

export interface MetadatosRespuesta {
  total?: number;
  pagina?: number;
  tamaño?: number;
  totalPaginas?: number;
  timestamp?: Date;
}

export interface RespuestaPaginada<T> {
  contenido: T[];
  paginaActual: number;
  tamaño: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
  vacia: boolean;
}

export interface ErrorAPI {
  codigo: string;
  mensaje: string;
  detalles?: any;
  timestamp: Date;
}

export interface Notificacion {
  id: string;
  tipo: 'info' | 'exito' | 'advertencia' | 'error';
  titulo: string;
  mensaje: string;
  icono?: string;
  accion?: AccionNotificacion;
  leida: boolean;
  fecha: Date;
}

export interface AccionNotificacion {
  etiqueta: string;
  ruta?: string;
  callback?: () => void;
}

export interface OpcionFiltro {
  valor: any;
  etiqueta: string;
  icono?: string;
}

export interface ConfiguracionTabla {
  columnas: ColumnaTabla[];
  paginacion: boolean;
  tamaño: number;
  busqueda: boolean;
  exportar: boolean;
  acciones: boolean;
}

export interface ColumnaTabla {
  campo: string;
  titulo: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'booleano' | 'personalizado';
  ordenable: boolean;
  filtrable: boolean;
  ancho?: string;
  alineacion?: 'izquierda' | 'centro' | 'derecha';
  plantilla?: any;
}
