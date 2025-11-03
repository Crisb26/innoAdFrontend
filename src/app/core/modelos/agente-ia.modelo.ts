/**
 * Modelos para el Agente IA del sistema InnoAd
 * Representa el asistente virtual inteligente
 */
export interface MensajeChat {
  id: string;
  contenido: string;
  tipo: 'texto' | 'imagen' | 'codigo' | 'sugerencia' | 'error';
  remitente: 'usuario' | 'ia';
  timestamp: Date;
  leido: boolean;
  metadata?: MetadataMensaje;
}

export interface MetadataMensaje {
  accion?: AccionSugerida;
  datos?: any;
  referencias?: string[];
  confianza?: number;
}

export interface AccionSugerida {
  tipo: 'crear-campaña' | 'modificar-campaña' | 'analizar-datos' | 'generar-reporte' | 'optimizar-horarios' | 'diagnosticar-pantalla';
  descripcion: string;
  parametros: any;
  prioridad: 'baja' | 'media' | 'alta';
}

export interface SolicitudChat {
  mensaje: string;
  contexto?: ContextoChat;
  incluirHistorial: boolean;
}

export interface ContextoChat {
  usuarioId: string;
  pantallaActual: string; // ruta actual
  campanasAbiertas?: string[];
  pantallasSeleccionadas?: string[];
  datosRelevantes?: any;
}

export interface RespuestaChat {
  mensaje: string;
  sugerencias?: Sugerencia[];
  acciones?: AccionSugerida[];
  graficos?: DatosGrafico[];
  referencias?: Referencia[];
  metadatos: MetadatosRespuesta;
}

export interface Sugerencia {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'accion' | 'optimizacion' | 'alerta';
  prioridad: number;
  icono?: string;
  accion?: AccionSugerida;
}

export interface DatosGrafico {
  tipo: 'linea' | 'barra' | 'pastel' | 'area';
  titulo: string;
  datos: any;
  configuracion?: any;
}

export interface Referencia {
  tipo: 'campaña' | 'pantalla' | 'contenido' | 'usuario' | 'reporte';
  id: string;
  nombre: string;
  url?: string;
}

export interface MetadatosRespuesta {
  tiempoRespuesta: number;
  modeloUtilizado: string;
  confianza: number;
  fuentesDatos: string[];
  version: string;
}

export interface AnalisisPredictivo {
  id: string;
  tipo: 'rendimiento-campaña' | 'ocupacion-pantallas' | 'optimizacion-horarios' | 'tendencias-audiencia';
  titulo: string;
  descripcion: string;
  predicciones: Prediccion[];
  recomendaciones: Recomendacion[];
  confianza: number;
  fechaAnalisis: Date;
  validoHasta: Date;
}

export interface Prediccion {
  metrica: string;
  valorActual: number;
  valorPredicho: number;
  variacion: number; // porcentaje
  tendencia: 'ascendente' | 'descendente' | 'estable';
  probabilidad: number;
}

export interface Recomendacion {
  id: string;
  titulo: string;
  descripcion: string;
  impactoEstimado: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  accion: AccionSugerida;
  metricas: string[];
}

export interface SolicitudAnalisis {
  tipo: 'rendimiento-campaña' | 'ocupacion-pantallas' | 'optimizacion-horarios' | 'tendencias-audiencia';
  campanasIds?: string[];
  pantallasIds?: string[];
  fechaInicio?: Date;
  fechaFin?: Date;
  parametros?: any;
}

export interface EstadisticasAgenteIA {
  totalConsultas: number;
  consultasHoy: number;
  tiempoPromedioRespuesta: number;
  satisfaccionUsuarios: number;
  accionesEjecutadas: number;
  analisisRealizados: number;
  ultimaActualizacion: Date;
}

export interface ConfiguracionAgenteIA {
  habilitado: boolean;
  modoAprendizaje: boolean;
  nivelDetalle: 'basico' | 'intermedio' | 'avanzado';
  idioma: string;
  usarHistorial: boolean;
  sugerenciasAutomaticas: boolean;
  notificacionesProactivas: boolean;
}
