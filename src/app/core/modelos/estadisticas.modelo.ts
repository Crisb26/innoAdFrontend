/**
 * Modelos para Estadísticas y Reportes del sistema InnoAd
 */
export interface EstadisticasGenerales {
  campanasActivas: number;
  pantallasConectadas: number;
  impresionesTotales: number;
  contenidosPublicados: number;
  usuariosActivos: number;
  presupuestoTotal: number;
  presupuestoGastado: number;
  tasaExito: number;
  periodo: PeriodoEstadisticas;
  ultimaActualizacion: Date;
}

export interface PeriodoEstadisticas {
  fechaInicio: Date;
  fechaFin: Date;
  tipo: 'hoy' | 'semana' | 'mes' | 'año' | 'personalizado';
}

export interface EstadisticasCampanas {
  totalCampanas: number;
  campanasActivas: number;
  campanasProgramadas: number;
  campanasFinalizadas: number;
  impresionesTotales: number;
  reproduccionesTotales: number;
  tiempoTotalReproduccion: number;
  topCampanas: ResumenCampana[];
  rendimientoPorDia: RendimientoDiario[];
  distribucionPorTipo: DistribucionTipo[];
}

export interface ResumenCampana {
  id: string;
  nombre: string;
  impresiones: number;
  reproducciones: number;
  tasaExito: number;
  presupuesto: number;
  presupuestoGastado: number;
  rentabilidad: number;
}

export interface RendimientoDiario {
  fecha: Date;
  impresiones: number;
  reproducciones: number;
  pantallasActivas: number;
  tiempoReproduccion: number;
}

export interface DistribucionTipo {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface EstadisticasPantallas {
  totalPantallas: number;
  pantallasConectadas: number;
  pantallasDesconectadas: number;
  pantallasEnError: number;
  tiempoEncendidoPromedio: number;
  tasaDisponibilidadPromedio: number;
  contenidosReproducidosTotal: number;
  distribucionGeografica: DistribucionGeografica[];
  topPantallas: ResumenPantalla[];
  estadoPorDia: EstadoDiarioPantallas[];
}

export interface DistribucionGeografica {
  ciudad: string;
  zona: string;
  cantidad: number;
  pantallasActivas: number;
  impresiones: number;
}

export interface ResumenPantalla {
  id: string;
  nombre: string;
  codigo: string;
  ubicacion: string;
  tiempoEncendido: number;
  contenidosReproducidos: number;
  tasaDisponibilidad: number;
}

export interface EstadoDiarioPantallas {
  fecha: Date;
  conectadas: number;
  desconectadas: number;
  enError: number;
  nuevas: number;
}

export interface EstadisticasContenidos {
  totalContenidos: number;
  imagenes: number;
  videos: number;
  html: number;
  tamañoTotal: number;
  vecesUtilizadosTotal: number;
  reproduccionesTotales: number;
  topContenidos: ResumenContenido[];
  distribucionPorCategoria: DistribucionTipo[];
}

export interface ResumenContenido {
  id: string;
  nombre: string;
  tipo: string;
  vecesUtilizado: number;
  reproducciones: number;
  campanasActivas: number;
}

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  estado: EstadoReporte;
  parametros: ParametrosReporte;
  datos: any;
  url?: string;
  creadoPor: string;
  fechaCreacion: Date;
  fechaGeneracion?: Date;
}

export type TipoReporte = 
  | 'campanas-general' 
  | 'campanas-detallado' 
  | 'pantallas-estado' 
  | 'pantallas-rendimiento' 
  | 'contenidos-uso' 
  | 'usuarios-actividad' 
  | 'financiero' 
  | 'personalizado';

export type FormatoReporte = 'pdf' | 'excel' | 'csv' | 'json' | 'html';
export type EstadoReporte = 'generando' | 'completado' | 'error' | 'eliminado';

export interface ParametrosReporte {
  fechaInicio: Date;
  fechaFin: Date;
  campanasIds?: string[];
  pantallasIds?: string[];
  incluirGraficos: boolean;
  incluirDetalles: boolean;
  agruparPor?: 'dia' | 'semana' | 'mes';
  filtros?: any;
}

export interface SolicitudGenerarReporte {
  titulo: string;
  descripcion?: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  parametros: ParametrosReporte;
  enviarPorEmail?: boolean;
  programar?: boolean;
  frecuencia?: 'diaria' | 'semanal' | 'mensual';
}

export interface DatosGraficoDashboard {
  tipo: 'linea' | 'barra' | 'pastel' | 'dona' | 'area';
  titulo: string;
  labels: string[];
  datasets: DatasetGrafico[];
  opciones?: any;
}

export interface DatasetGrafico {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface MetricaKPI {
  nombre: string;
  valor: number;
  unidad: string;
  variacion: number; // porcentaje
  tendencia: 'subiendo' | 'bajando' | 'estable';
  icono: string;
  color: string;
}

export interface FiltroEstadisticas {
  fechaInicio: Date;
  fechaFin: Date;
  campanasIds?: string[];
  pantallasIds?: string[];
  ciudades?: string[];
  zonas?: string[];
  tiposCampana?: string[];
  agruparPor?: 'dia' | 'semana' | 'mes';
}
