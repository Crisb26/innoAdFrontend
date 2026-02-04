/**
 * Mejoras al Asistente IA de InnoAd
 * Este archivo contiene las mejoras implementadas para optimizar:
 * - Procesamiento de contexto por rol
 * - Mejora de prompts y respuestas
 * - Análisis de intención mejorado
 * - Integración con módulos específicos
 */

// Interfaces para mejoras de IA
export interface AnalizadorIntenciones {
  detectarIntención(mensaje: string): {
    tipo: 'navegacion' | 'creacion' | 'edicion' | 'reporte' | 'ayuda' | 'general';
    modulo?: 'contenidos' | 'pantallas' | 'campanas' | 'reportes' | 'general';
    accion?: string;
    confianza: number;
  };
}

export interface PromptOptimizado {
  generarPrompt(contexto: any, rol: string, intención: string): string;
  generarRespuesta(respuestaAPI: any, tipo: string): string;
}

export interface MejoradorContexto {
  enriquecerContexto(contexto: any, usuario: any, pagina: string): any;
  detectarRol(usuario: any): 'administrador' | 'agente' | 'usuario';
  obtenerModuloActual(): string;
}

/**
 * Mejoras clave implementadas:
 * 
 * 1. ANÁLISIS DE INTENCIONES MEJORADO:
 *    - Detecta automáticamente si el usuario quiere: navegar, crear, editar, ver reportes, etc.
 *    - Según la intención, adapta respuesta y sugerencias
 * 
 * 2. CONTEXTO POR ROL:
 *    - Admin: Acceso a reportes, gestión de pantallas, análisis financiero
 *    - Agente: Creación de campañas, gestión de contenidos
 *    - Usuario: Visualización de contenidos, acceso a reportes básicos
 * 
 * 3. PROMPTS OPTIMIZADOS:
 *    Cada respuesta ahora:
 *    - Incluye referencias al módulo actual
 *    - Sugiere acciones contextuales
 *    - Usa lenguaje adaptado al rol
 *    - Proporciona tutoriales cuando es necesario
 * 
 * 4. INTEGRACIÓN CON MÓDULOS:
 *    - Contenidos: Ayuda con upload, formatos, metadatos
 *    - Pantallas: Información sobre resoluciones, localización
 *    - Campañas: Planificación, calendario, análisis temporal
 *    - Reportes: Interpretación de métricas, recomendaciones
 */

export class MejoradorAsistenteIA {
  
  /**
   * Detecta la intención del usuario a partir del mensaje
   */
  static detectarIntención(mensaje: string): {
    tipo: 'navegacion' | 'creacion' | 'edicion' | 'reporte' | 'ayuda' | 'general';
    modulo?: string;
    confianza: number;
  } {
    const mensajeLower = mensaje.toLowerCase();
    
    // Patrones de navegación
    if (/quiero ir|ir a|navegarme|vamos a|abre|muéstram|vamos al/i.test(mensajeLower)) {
      return { tipo: 'navegacion', confianza: 0.9 };
    }
    
    // Patrones de creación
    if (/crear|nueva|nuevo|generar|hacer|añadir|agregar|subir|cargar|guardar/i.test(mensajeLower)) {
      return { tipo: 'creacion', confianza: 0.85 };
    }
    
    // Patrones de edición
    if (/editar|cambiar|modificar|actualizar|ajustar|corregir|cambiar el/i.test(mensajeLower)) {
      return { tipo: 'edicion', confianza: 0.85 };
    }
    
    // Patrones de reportes
    if (/reporte|estadística|métrica|análisis|datos|rendimiento|desempeño|comparar|evolución/i.test(mensajeLower)) {
      return { tipo: 'reporte', confianza: 0.9 };
    }
    
    // Patrones de ayuda
    if (/cómo|explica|ayuda|qué es|qué hace|instrucciones|tutorial|guía|pasos|problema|error/i.test(mensajeLower)) {
      return { tipo: 'ayuda', confianza: 0.95 };
    }
    
    return { tipo: 'general', confianza: 0.6 };
  }

  /**
   * Detecta el módulo al que se refiere el usuario
   */
  static detectarModulo(mensaje: string): string | null {
    const contenidosPatterns = /contenido|biblioteca|video|imagen|texto|multimedia|archivo|subir/i;
    const pantallasPatterns = /pantalla|dispositivo|raspberry|monitor|resolución|ubicación/i;
    const campanasPatterns = /campaña|publicidad|promoción|anuncio|descuento|oferta/i;
    const reportesPatterns = /reporte|estadística|métrica|análisis|datos|gráfico|chart/i;
    
    if (contenidosPatterns.test(mensaje)) return 'contenidos';
    if (pantallasPatterns.test(mensaje)) return 'pantallas';
    if (campanasPatterns.test(mensaje)) return 'campanas';
    if (reportesPatterns.test(mensaje)) return 'reportes';
    return null;
  }

  /**
   * Genera prompt optimizado según contexto y rol
   */
  static generarPromptOptimizado(
    mensaje: string,
    rol: 'administrador' | 'agente' | 'usuario',
    moduloActual: string
  ): string {
    let prompt = '';

    // Base del prompt según rol
    switch (rol) {
      case 'administrador':
        prompt = `Eres un asistente experto en gestión de plataformas de publicidad digital InnoAd.
        El usuario es administrador y tiene acceso a todas las funciones.
        Módulo actual: ${moduloActual}.
        Proporciona respuestas técnicas con opciones de gestión, análisis y configuración.`;
        break;
      case 'agente':
        prompt = `Eres un asistente para agentes de publicidad digital en InnoAd.
        El usuario puede crear y gestionar campañas, contenidos y pantallas.
        Módulo actual: ${moduloActual}.
        Enfócate en ayudar con creación de contenidos y campañas, y consultas sobre desempeño.`;
        break;
      case 'usuario':
        prompt = `Eres un asistente amigable para usuarios de InnoAd.
        El usuario puede visualizar contenidos y acceder a reportes básicos.
        Módulo actual: ${moduloActual}.
        Proporciona respuestas simples y navega hacia información útil.`;
        break;
    }

    // Agregar contexto del módulo
    if (moduloActual === 'contenidos') {
      prompt += `\nSobre CONTENIDOS: Ayuda con gestión de archivos multimedia (video, imagen, texto, HTML).
      Puedes asesorar sobre formatos recomendados, tamaños, duración, y subida de archivos.`;
    } else if (moduloActual === 'pantallas') {
      prompt += `\nSobre PANTALLAS: Ayuda con gestión de dispositivos digitales y su configuración.
      Puedes asesorar sobre resoluciones, ubicación, identificación de pantallas y conectividad.`;
    } else if (moduloActual === 'campanas') {
      prompt += `\nSobre CAMPAÑAS: Ayuda con creación y gestión de campañas publicitarias.
      Puedes asesorar sobre planificación temporal, asignación de pantallas, contenidos y métricas.`;
    } else if (moduloActual === 'reportes') {
      prompt += `\nSobre REPORTES: Ayuda con interpretación de datos y métricas.
      Puedes explicar indicadores: reproducciones, usuarios, conversión, ingresos, y tendencias.`;
    }

    prompt += `\n\nPregunta del usuario: "${mensaje}"`;
    prompt += `\nResponde de forma clara, concisa y útil. Si detectas que el usuario quiere ir a otro módulo, sugiérelo.`;
    
    return prompt;
  }

  /**
   * Mejora las sugerencias contextuales según el módulo
   */
  static generarSugerenciasModulo(moduloActual: string): string[] {
    const sugerencias: { [key: string]: string[] } = {
      contenidos: [
        'Crear nuevo contenido',
        'Ver mi biblioteca',
        'Subir archivo multimedia',
        'Buscar contenido específico',
        'Editar metadatos',
        'Ver estadísticas de uso'
      ],
      pantallas: [
        'Registrar nueva pantalla',
        'Ver estatus de pantallas',
        'Configurar resolución',
        'Asignar contenidos',
        'Verificar conectividad',
        'Ver historiadel de actividad'
      ],
      campanas: [
        'Crear campaña',
        'Ver campañas activas',
        'Programar nuevas campañas',
        'Asignar pantallas a campaña',
        'Ver desempeño',
        'Duplicar campaña existente'
      ],
      reportes: [
        'Ver reportes de hoy',
        'Comparar períodos',
        'Exportar datos',
        'Analizar tendencias',
        'Ver KPIs principales',
        'Generar informe PDF'
      ]
    };

    return sugerencias[moduloActual] || sugerencias['contenidos'];
  }

  /**
   * Mejora la respuesta del asistente con contexto
   */
  static formatearRespuestaIA(
    respuesta: string,
    tipo: 'navegacion' | 'creacion' | 'edicion' | 'reporte' | 'ayuda' | 'general',
    moduloActual: string
  ): string {
    let respuestaFormateada = respuesta;

    // Agregar contexto según tipo de intención
    if (tipo === 'navegacion') {
      respuestaFormateada += '\n\nPuedes usar los botones de navegación en la parte superior o decirme a qué módulo quieres ir.';
    } else if (tipo === 'creacion') {
      respuestaFormateada += '\n\nUsa el botón "Crear" o "Nuevo" en la barra superior para comenzar.';
    } else if (tipo === 'reporte') {
      respuestaFormateada += '\n\nPuedes cambiar el período de análisis (Hoy, Semana, Mes) en la parte superior de Reportes.';
    } else if (tipo === 'ayuda') {
      respuestaFormateada += '\n\nSi necesitas más ayuda, no dudes en preguntarme específicamente sobre funciones.';
    }

    return respuestaFormateada;
  }

  /**
   * Genera recomendaciones inteligentes basadas en acciones recientes
   */
  static generarRecomendaciones(
    accionesRecientes: string[],
    moduloActual: string
  ): { titulo: string; descripcion: string; accion: string }[] {
    const recomendaciones: any[] = [];

    // Si acaba de crear contenido, sugerir asignarlo a campaña
    if (accionesRecientes.includes('crear-contenido') && moduloActual !== 'campanas') {
      recomendaciones.push({
        titulo: 'Asignar a Campaña',
        descripcion: 'Coloca el contenido en una campaña para distribuirlo',
        accion: 'ir-a-campanas'
      });
    }

    // Si acaba de crear campaña, sugerir asignar pantallas
    if (accionesRecientes.includes('crear-campana') && moduloActual !== 'pantallas') {
      recomendaciones.push({
        titulo: 'Asignar Pantallas',
        descripcion: 'Selecciona dónde mostrar tu campaña',
        accion: 'ir-a-pantallas'
      });
    }

    // Si acaba de asignar pantallas, sugerir ver reportes
    if (accionesRecientes.includes('asignar-pantallas') && moduloActual !== 'reportes') {
      recomendaciones.push({
        titulo: 'Ver Desempeño',
        descripcion: 'Monitora el rendimiento en tiempo real',
        accion: 'ir-a-reportes'
      });
    }

    return recomendaciones;
  }
}

/**
 * Ejemplo de uso en componentes:
 * 
 * En asistente-ia.component.ts:
 * ```
 * const intención = MejoradorAsistenteIA.detectarIntención(mensaje);
 * const módulo = MejoradorAsistenteIA.detectarModulo(mensaje);
 * const prompt = MejoradorAsistenteIA.generarPromptOptimizado(
 *   mensaje,
 *   this.rolUsuario,
 *   this.moduloActual
 * );
 * const sugerencias = MejoradorAsistenteIA.generarSugerenciasModulo(this.moduloActual);
 * ```
 */
