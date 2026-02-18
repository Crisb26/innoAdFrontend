/**
 * 🤖 MODELO DE ENTRENAMIENTO DE IA
 * Define las interfaces para el sistema de entrenamiento y respuestas de la IA
 * 
 * Estructura utilizada para:
 * - FAQ local (respuestas rápidas sin OpenAI)
 * - Acciones sugeridas contextuales
 * - Entrenamientos dinámicos
 */

/**
 * Acción sugerida que la IA puede proponer
 */
export interface AccionIA {
  id: string;
  titulo: string;
  icono: string;
  tipo: 'navegacion' | 'accion' | 'dialogo' | 'popup';
  destino?: string;
  funcionalidad?: string;
  permisosRequeridos?: string[];
}

/**
 * Artículo individual de conocimiento
 */
export interface ArticuloEntrenamiento {
  id: string;
  titulo: string;
  palabrasClave: string[];
  contenido: string;
  ejemplos: string[];
  confianza: number; // 0-1
  accionSugerida?: AccionIA;
  relacionadas?: string[];
}

/**
 * Base de conocimiento agrupada por categoría
 */
export interface BaseConocimiento {
  id: string;
  nombre: string;
  prioridad: number;
  articulos: ArticuloEntrenamiento[];
}

/**
 * Estructura completa de entrenamiento
 */
export interface EntrenamientoIA {
  version: string;
  ultimaActualizacion: Date;
  descripcionSistema: string;
  basesConocimiento: BaseConocimiento[];
  accionesRapidas: AccionIA[];
}

/**
 * Resultado de búsqueda en FAQ
 */
export interface ResultadoBusquedaFAQ {
  encontrado: boolean;
  articulo?: ArticuloEntrenamiento;
  base?: BaseConocimiento;
  confianza: number;
  tiempoMs: number;
}

/**
 * Respuesta contextual del asistente
 */
export interface RespuestaContextual {
  id: string;
  contenido: string;
  tipo: 'faq' | 'openai' | 'hibrida' | 'error';
  confianza: number;
  fuente: 'FAQ Local' | 'GPT-4 Mini' | 'GPT-4 Turbo' | 'Hibrida';
  tiempoRespuestaMs: number;
  accionSugerida?: AccionIA;
  enlacesRelacionados?: string[];
  sugerenciasAlternativas?: string[];
}

/**
 * Métricas de uso de la IA
 */
export interface MetricasIA {
  preguntasProcessadas: number;
  respuestasExitosas: number;
  respuestasConError: number;
  tiempoPromedioRespuesta: number;
  confianzaPromedia: number;
  utilizacionFAQ: number; // Porcentaje
  utilizacionOpenAI: number; // Porcentaje
  ultimaActualizacion: Date;
}

/**
 * Configuración de entrenamiento
 */
export interface ConfiguracionEntrenamiento {
  usarFAQLocal: boolean;
  usarOpenAI: boolean;
  minConfianzaFAQ: number; // 0-1
  minConfianzaOpenAI: number; // 0-1
  modeloOpenAI: 'gpt-4-mini' | 'gpt-4-turbo' | 'gpt-4';
  temperaturaOpenAI: number; // 0-2
  maxTokensOpenAI: number;
  tiempooutRespuestaOpenAI: number; // millisegundos
  idioma: 'es' | 'en' | 'pt' | 'fr';
  regionsGeograficas?: string[];
}

/**
 * Sesión de entrenamiento
 */
export interface SesionEntrenamiento {
  id: string;
  usuarioId: string;
  fechaInicio: Date;
  fechaFin?: Date;
  preguntasRealizadas: number;
  respuestasUtiles: number;
  feedback: Array<{
    pregunta: string;
    respuesta: string;
    util: boolean;
    comentario?: string;
  }>;
  metasinformacion?: Record<string, any>;
}

/**
 * Dato de entrenamiento para Fine-Tuning en OpenAI
 */
export interface DatoEntrenamientoOpenAI {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  weight?: number;
}

/**
 * Parámetros para generar campañas automáticamente
 */
export interface ParametrosGeneracionCampana {
  nombreProducto: string;
  descripcionProducto: string;
  publicoObjetivo: string;
  tipoContenido: 'imagen' | 'video' | 'texto' | 'mixto';
  estiloDeseado?: 'moderno' | 'clasico' | 'divertido' | 'profesional' | 'minimalista';
  plataformas?: string[];
  presupuesto?: number;
  idioma?: string;
}

/**
 * Respuesta de generación de campaña
 */
export interface RespuestaGeneracionCampana {
  id: string;
  titulo: string;
  descripcion: string;
  callToAction: string;
  hashtags: string[];
  imaguesGeneradas?: string[];
  videoSugerido?: string;
  confianza: number;
  alternativas?: RespuestaGeneracionCampana[];
}

/**
 * Estado de retroalimentación (feedback)
 */
export interface RetroalimentacionUsuario {
  id: string;
  preguntaId: string;
  respuestaId: string;
  calificacion: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  esUtil: boolean;
  timestamp: Date;
  usuarioId: string;
}

/**
 * Estadísticas de calidad de respuestas
 */
export interface EstadisticasCalidadIA {
  totalRespuestas: number;
  respuestasCalificadas: number;
  calificacionPromedia: number;
  tasaUtilidad: number; // Porcentaje
  tasaRechazo: number; // Porcentaje
  tendencia: 'mejorando' | 'estable' | 'empeorando';
  ultimaActualizacion: Date;
}
