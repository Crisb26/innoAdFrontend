import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';
import { environment } from '@environments/environment';
import { ServicioAutenticacion } from './autenticacion.servicio';

// Interfaces para el asistente IA
export interface MensajeChat {
  id: string;
  tipo: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: Date;
  metadata?: {
    confianza?: number;
    contexto?: string;
    accionSugerida?: AccionSugerida;
    sentimiento?: 'positivo' | 'neutral' | 'negativo';
    tipoRespuesta?: 'informativa' | 'accion' | 'tutorial' | 'humor';
  };
}

export interface AccionSugerida {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  accion: () => void;
  categoria: 'navegacion' | 'configuracion' | 'ayuda' | 'accion';
}

export interface EstadoAsistente {
  activo: boolean;
  escribiendo: boolean;
  escuchando: boolean;
  animacion: 'idle' | 'hablando' | 'escuchando' | 'pensando' | 'celebrando' | 'confundido';
  emocion: 'feliz' | 'neutral' | 'concentrado' | 'sorprendido' | 'preocupado';
  nivelEnergia: number; // 0-100
}

export interface ConfiguracionAsistente {
  nombre: string;
  personalidad: 'profesional' | 'amigable' | 'gracioso' | 'tecnico';
  velocidadHabla: number;
  usarVoz: boolean;
  mostrarSugerencias: boolean;
  modoTutorial: boolean;
  temaAvatar: 'robot' | 'humano' | 'abstracto';
  idioma: 'es' | 'en';
}

export interface ContextoConversacion {
  paginaActual: string;
  usuarioActual?: any;
  accionesRecientes: string[];
  moduloActivo: string;
  historialNavegacion: string[];
  preferenciasUsuario: any;
}

export interface CapacidadIA {
  id: string;
  nombre: string;
  descripcion: string;
  ejemplos: string[];
  categoria: 'analisis' | 'automatizacion' | 'recomendaciones' | 'tutoriales' | 'soporte';
}

@Injectable({
  providedIn: 'root'
})
export class AsistenteIAServicio {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly apiUrl = `${environment.urlApi}/asistente-ia`;

  // Estado del asistente
  private readonly _estadoAsistente = signal<EstadoAsistente>({
    activo: false,
    escribiendo: false,
    escuchando: false,
    animacion: 'idle',
    emocion: 'neutral',
    nivelEnergia: 85
  });

  // Configuración
  private readonly _configuracion = signal<ConfiguracionAsistente>({
    nombre: 'InnoBot',
    personalidad: 'amigable',
    velocidadHabla: 1.0,
    usarVoz: true,
    mostrarSugerencias: true,
    modoTutorial: false,
    temaAvatar: 'robot',
    idioma: 'es'
  });

  // Chat y conversación
  private readonly _historialChat = signal<MensajeChat[]>([]);
  private readonly _contextoActual = signal<ContextoConversacion>({
    paginaActual: '/',
    accionesRecientes: [],
    moduloActivo: 'dashboard',
    historialNavegacion: [],
    preferenciasUsuario: {}
  });

  // Sugerencias y acciones
  private readonly _sugerenciasActivas = signal<AccionSugerida[]>([]);
  private readonly _capacidades = signal<CapacidadIA[]>([]);

  // Observables privados
  private readonly _nuevoMensaje$ = new Subject<MensajeChat>();
  private readonly _estadoCambiado$ = new Subject<EstadoAsistente>();
  private readonly _accionEjecutada$ = new Subject<AccionSugerida>();

  // Reconocimiento de voz (comentado hasta implementar correctamente)
  // private reconocimientoVoz?: SpeechRecognition;
  // private sintesisVoz?: SpeechSynthesis;

  // Análisis de sentimientos y contexto
  private analizadorSentimientos = new Map<string, number>();
  private patronesConversacion = new Map<string, string[]>();

  constructor() {
    this.inicializarAsistente();
    // this.configurarReconocimientoVoz();
    this.cargarCapacidades();
    this.iniciarMonitoreoContexto();
  }

  // Getters para las señales
  get estadoAsistente() { return this._estadoAsistente.asReadonly(); }
  get configuracion() { return this._configuracion.asReadonly(); }
  get historialChat() { return this._historialChat.asReadonly(); }
  get contextoActual() { return this._contextoActual.asReadonly(); }
  get sugerenciasActivas() { return this._sugerenciasActivas.asReadonly(); }
  get capacidades() { return this._capacidades.asReadonly(); }

  // Observables para eventos
  get nuevoMensaje$(): Observable<MensajeChat> { return this._nuevoMensaje$.asObservable(); }
  get estadoCambiado$(): Observable<EstadoAsistente> { return this._estadoCambiado$.asObservable(); }
  get accionEjecutada$(): Observable<AccionSugerida> { return this._accionEjecutada$.asObservable(); }

  /**
   * Inicializar el asistente con configuración por defecto
   */
  inicializar(): void {
    // this.configurarVoz();
    this.generarSugerenciasContextuales();
    console.log('Asistente IA inicializado correctamente');
  }
  private inicializarAsistente(): void {
    // Mensaje de bienvenida
    const mensajeBienvenida: MensajeChat = {
      id: this.generarId(),
      tipo: 'asistente',
      contenido: '¡Hola! 👋 Soy InnoBot, tu asistente inteligente para InnoAd. Estoy aquí para ayudarte con todo lo que necesites. ¿En qué puedo asistirte hoy?',
      timestamp: new Date(),
      metadata: {
        confianza: 1.0,
        contexto: 'bienvenida',
        tipoRespuesta: 'informativa',
        sentimiento: 'positivo'
      }
    };

    this._historialChat.update(chat => [mensajeBienvenida, ...chat]);
  }

  /**
   * Activar/desactivar el asistente
   */
  toggleAsistente(): void {
    const estadoActual = this._estadoAsistente();
    const nuevoEstado = {
      ...estadoActual,
      activo: !estadoActual.activo,
      animacion: !estadoActual.activo ? 'celebrando' as const : 'idle' as const
    };
    
    this._estadoAsistente.set(nuevoEstado);
    this._estadoCambiado$.next(nuevoEstado);

    if (nuevoEstado.activo) {
      this.generarSugerenciasContextuales();
    }
  }

  /**
   * Enviar mensaje al asistente
   */
  async enviarMensaje(contenido: string): Promise<void> {
    // Agregar mensaje del usuario
    const mensajeUsuario: MensajeChat = {
      id: this.generarId(),
      tipo: 'usuario',
      contenido,
      timestamp: new Date()
    };

    this._historialChat.update(chat => [...chat, mensajeUsuario]);
    this._nuevoMensaje$.next(mensajeUsuario);

    // Mostrar que el asistente está pensando
    this.cambiarEstado({
      escribiendo: true,
      animacion: 'pensando',
      emocion: 'concentrado'
    });

    try {
      // Analizar el mensaje y generar respuesta
      const respuesta = await this.procesarMensaje(contenido);
      
      // Simular tiempo de procesamiento para realismo
      await this.delay(800 + Math.random() * 1200);

      // Agregar respuesta del asistente
      const mensajeAsistente: MensajeChat = {
        id: this.generarId(),
        tipo: 'asistente',
        contenido: respuesta.contenido,
        timestamp: new Date(),
        metadata: respuesta.metadata
      };

      this._historialChat.update(chat => [...chat, mensajeAsistente]);
      this._nuevoMensaje$.next(mensajeAsistente);

      // Ejecutar acciones sugeridas si las hay
      if (respuesta.metadata?.accionSugerida) {
        this._sugerenciasActivas.update(sugerencias => [
          respuesta.metadata!.accionSugerida!,
          ...sugerencias.slice(0, 2)
        ]);
      }

      // Actualizar estado
      this.cambiarEstado({
        escribiendo: false,
        animacion: 'hablando',
        emocion: respuesta.metadata?.sentimiento === 'positivo' ? 'feliz' : 'neutral'
      });

      // Sintetizar voz si está habilitada
      if (this._configuracion().usarVoz) {
        this.hablarTexto(respuesta.contenido);
      }

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      
      const mensajeError: MensajeChat = {
        id: this.generarId(),
        tipo: 'asistente',
        contenido: '🤔 Hmm, parece que tengo un pequeño problema técnico. ¿Podrías reformular tu pregunta?',
        timestamp: new Date(),
        metadata: {
          confianza: 0.5,
          contexto: 'error',
          tipoRespuesta: 'informativa',
          sentimiento: 'neutral'
        }
      };

      this._historialChat.update(chat => [...chat, mensajeError]);
      this.cambiarEstado({
        escribiendo: false,
        animacion: 'confundido',
        emocion: 'preocupado'
      });
    }
  }

  /**
   * Procesar mensaje del usuario y generar respuesta inteligente
   */
  private async procesarMensaje(mensaje: string): Promise<{
    contenido: string;
    metadata: MensajeChat['metadata'];
  }> {
    const contexto = this._contextoActual();
    const configuracion = this._configuracion();
    
    // Análisis de sentimiento
    const sentimiento = this.analizarSentimiento(mensaje);
    
    // Detectar intención del usuario
    const intencion = this.detectarIntencion(mensaje);
    
    // Generar respuesta contextual
    const respuesta = await this.generarRespuesta(mensaje, intencion, contexto);
    
    return {
      contenido: respuesta.texto,
      metadata: {
        confianza: respuesta.confianza,
        contexto: intencion.categoria,
        accionSugerida: respuesta.accionSugerida,
        sentimiento: sentimiento,
        tipoRespuesta: respuesta.tipo
      }
    };
  }

  /**
   * Detectar la intención del usuario en el mensaje
   */
  private detectarIntencion(mensaje: string): {
    categoria: string;
    intencion: string;
    confianza: number;
    parametros: any;
  } {
    const mensajeLower = mensaje.toLowerCase();
    
    // Patrones de intención
    const patrones = {
      sesion: [
        { regex: /(?:cerrar|salir|logout|desconectar).*(sesión|sesion|cuenta)/i, accion: 'cerrar_sesion' },
        { regex: /(?:quiero|voy a).*(salir|irme|cerrar)/i, accion: 'cerrar_sesion' }
      ],
      email: [
        { regex: /(?:enviar|mandar).*(correo|email|mensaje).*(a|al|para)\s*(\w+)/i, accion: 'enviar_correo' },
        { regex: /(?:correo|email|mensaje)\s*(?:para|a)\s*(\w+)/i, accion: 'enviar_correo' }
      ],
      navegacion: [
        { regex: /(?:ir|navegar|abrir|mostrar).*(dashboard|inicio|campañas|contenidos|pantallas|reportes|admin)/i, accion: 'navegar' },
        { regex: /(?:cómo|donde).*(llegar|encontrar|ubicar)/i, accion: 'encontrar' }
      ],
      ayuda: [
        { regex: /(?:ayuda|help|auxilio|socorro)/i, accion: 'solicitar_ayuda' },
        { regex: /(?:cómo|como).*(hacer|crear|configurar|usar)/i, accion: 'tutorial' },
        { regex: /(?:qué|que).*(es|significa|hace)/i, accion: 'explicar' }
      ],
      configuracion: [
        { regex: /(?:configurar|ajustar|cambiar|modificar)/i, accion: 'configurar' },
        { regex: /(?:preferencias|opciones|ajustes)/i, accion: 'preferencias' }
      ],
      acciones: [
        { regex: /(?:crear|añadir|agregar).*(campaña|contenido|pantalla|usuario)/i, accion: 'crear' },
        { regex: /(?:eliminar|borrar|quitar)/i, accion: 'eliminar' },
        { regex: /(?:editar|modificar|cambiar)/i, accion: 'editar' }
      ],
      analisis: [
        { regex: /(?:mostrar|ver|análisis|estadísticas|reportes)/i, accion: 'mostrar_datos' },
        { regex: /(?:rendimiento|métricas|kpi)/i, accion: 'analizar_rendimiento' }
      ]
    };

    // Buscar coincidencias
    for (const [categoria, patronesCategoria] of Object.entries(patrones)) {
      for (const patron of patronesCategoria) {
        const match = mensajeLower.match(patron.regex);
        if (match) {
          const parametros: any = {};
          // Extraer destinatario para correos
          if (patron.accion === 'enviar_correo' && match[3]) {
            parametros.destinatario = match[3];
          }
          return {
            categoria,
            intencion: patron.accion,
            confianza: 0.8 + (match[0].length / mensaje.length) * 0.2,
            parametros
          };
        }
      }
    }

    // Intención por defecto
    return {
      categoria: 'conversacion',
      intencion: 'conversar',
      confianza: 0.5,
      parametros: {}
    };
  }

  /**
   * Generar respuesta inteligente basada en la intención
   */
  private async generarRespuesta(
    mensaje: string,
    intencion: any,
    contexto: ContextoConversacion
  ): Promise<{
    texto: string;
    confianza: number;
    tipo: 'informativa' | 'accion' | 'tutorial' | 'humor';
    accionSugerida?: AccionSugerida;
  }> {
    
    switch (intencion.categoria) {
      case 'sesion':
        return this.generarRespuestaSesion(intencion, contexto);
      
      case 'email':
        return this.generarRespuestaEmail(intencion, contexto);
      
      case 'navegacion':
        return this.generarRespuestaNavegacion(intencion, contexto);
      
      case 'ayuda':
        return this.generarRespuestaAyuda(intencion, mensaje);
      
      case 'configuracion':
        return this.generarRespuestaConfiguracion(intencion);
      
      case 'acciones':
        return this.generarRespuestaAcciones(intencion, contexto);
      
      case 'analisis':
        return this.generarRespuestaAnalisis(intencion, contexto);
      
      default:
        return this.generarRespuestaConversacional(mensaje, contexto);
    }
  }

  /**
   * Generar respuesta para cerrar sesión
   */
  private generarRespuestaSesion(intencion: any, contexto: ContextoConversacion): Promise<any> {
    if (intencion.intencion === 'cerrar_sesion') {
      return Promise.resolve({
        texto: "👋 ¡Hasta pronto! Cerrando tu sesión y regresándote a la página principal...",
        confianza: 0.95,
        tipo: 'accion' as const,
        accionSugerida: {
          id: 'cerrar-sesion',
          titulo: 'Cerrar Sesión',
          descripcion: 'Cerrar tu sesión actual',
          icono: '🚪',
          accion: () => {
            setTimeout(() => {
              this.servicioAuth.cerrarSesion();
            }, 1500);
          },
          categoria: 'accion' as const
        }
      });
    }

    return Promise.resolve({
      texto: "🤔 No entendí bien qué quieres hacer con tu sesión.",
      confianza: 0.5,
      tipo: 'informativa' as const
    });
  }

  /**
   * Generar respuesta para enviar correos
   */
  private generarRespuestaEmail(intencion: any, contexto: ContextoConversacion): Promise<any> {
    const usuario = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol?.nombre || (usuario?.rol as any) || 'Usuario';
    
    // Verificar si el usuario es Usuario (no puede enviar correos)
    if (rol === 'Usuario' || rol === 'USUARIO') {
      return Promise.resolve({
        texto: "⚠️ Lo siento, pero los usuarios con rol 'Usuario' no tienen permisos para enviar correos. Esta funcionalidad está disponible solo para Administradores, Editores y Creadores.",
        confianza: 0.9,
        tipo: 'informativa' as const
      });
    }

    const destinatario = intencion.parametros?.destinatario || 'un destinatario';

    return Promise.resolve({
      texto: `📧 ¡Perfecto! Como ${rol}, puedes enviar correos. Para enviar un correo a ${destinatario}, ve a la sección de mensajería o dime el contenido del mensaje y yo lo procesaré.`,
      confianza: 0.85,
      tipo: 'accion' as const,
      accionSugerida: {
        id: 'enviar-correo',
        titulo: 'Enviar Correo',
        descripcion: `Redactar correo para ${destinatario}`,
        icono: '✉️',
        accion: () => {
          // Aquí iría la lógica para abrir un modal de enviar correo
          console.log(`Abrir modal para enviar correo a ${destinatario}`);
        },
        categoria: 'accion' as const
      }
    });
  }

  /**
   * Generar respuestas para navegación
   */
  private generarRespuestaNavegacion(intencion: any, contexto: ContextoConversacion): Promise<any> {
    const respuestas = {
      dashboard: {
        texto: "🏠 Te llevo al dashboard principal donde puedes ver un resumen de toda tu actividad en InnoAd.",
        accion: () => window.location.href = '/dashboard'
      },
      campañas: {
        texto: "📢 Vamos a la sección de campañas donde puedes crear y gestionar tus campañas publicitarias.",
        accion: () => window.location.href = '/campanas'
      }
    };

    const destino = intencion.parametros.destino || 'dashboard';
    const respuesta = respuestas[destino as keyof typeof respuestas] || respuestas.dashboard;

    return Promise.resolve({
      texto: respuesta.texto,
      confianza: 0.9,
      tipo: 'accion' as const,
      accionSugerida: {
        id: `nav-${destino}`,
        titulo: `Ir a ${destino}`,
        descripcion: 'Navegar a la sección solicitada',
        icono: '🧭',
        accion: respuesta.accion,
        categoria: 'navegacion' as const
      }
    });
  }

  /**
   * Generar respuestas de ayuda
   */
  private generarRespuestaAyuda(intencion: any, mensaje: string): Promise<any> {
    return Promise.resolve({
      texto: "🤝 ¡Estoy aquí para ayudarte! Puedo asistirte con campañas, contenidos, pantallas y más.",
      confianza: 0.8,
      tipo: 'informativa' as const
    });
  }

  /**
   * Generar respuestas de configuración
   */
  private generarRespuestaConfiguracion(intencion: any): Promise<any> {
    return Promise.resolve({
      texto: "⚙️ Te puedo ayudar a configurar tu cuenta y preferencias.",
      confianza: 0.85,
      tipo: 'informativa' as const
    });
  }

  /**
   * Generar respuestas para acciones
   */
  private generarRespuestaAcciones(intencion: any, contexto: ContextoConversacion): Promise<any> {
    return Promise.resolve({
      texto: "🎯 ¡Listo para ayudarte con cualquier acción que necesites!",
      confianza: 0.8,
      tipo: 'accion' as const
    });
  }

  /**
   * Generar respuestas para análisis
   */
  private generarRespuestaAnalisis(intencion: any, contexto: ContextoConversacion): Promise<any> {
    return Promise.resolve({
      texto: "📈 ¡Los datos son fascinantes! Puedo mostrarte análisis detallados.",
      confianza: 0.9,
      tipo: 'informativa' as const
    });
  }

  /**
   * Generar respuestas conversacionales
   */
  private generarRespuestaConversacional(mensaje: string, contexto: ContextoConversacion): Promise<any> {
    const mensajeLower = mensaje.toLowerCase();
    const usuario = contexto.usuarioActual;
    
    // Preguntas sobre el usuario actual
    if (mensajeLower.includes('quién soy') || mensajeLower.includes('quien soy') || mensajeLower.includes('mi nombre')) {
      if (usuario) {
        return Promise.resolve({
          texto: `📋 Eres ${usuario.nombre}, y tu rol en el sistema es ${usuario.rol}. Tu correo registrado es ${usuario.email}.`,
          confianza: 1.0,
          tipo: 'informativa' as const
        });
      }
    }

    // Preguntas sobre rol
    if (mensajeLower.includes('mi rol') || mensajeLower.includes('qué rol') || mensajeLower.includes('que rol')) {
      if (usuario) {
        const permisosRol: {[key: string]: string} = {
          'Administrador': 'Tienes acceso completo: gestionar usuarios, campañas, contenidos, pantallas, configuración del sistema y enviar correos.',
          'Editor': 'Puedes crear y editar campañas, contenidos, gestionar pantallas y enviar correos.',
          'Creador': 'Puedes crear contenidos, campañas básicas y enviar correos.',
          'Usuario': 'Puedes ver contenidos y pantallas. No puedes enviar correos.'
        };

        const descripcion = permisosRol[usuario.rol] || 'Tienes permisos básicos en el sistema.';
        
        return Promise.resolve({
          texto: `👤 Tu rol es ${usuario.rol}. ${descripcion}`,
          confianza: 1.0,
          tipo: 'informativa' as const
        });
      }
    }

    // Preguntas sobre otros usuarios (solo para no-usuarios)
    if ((mensajeLower.includes('usuarios') || mensajeLower.includes('quién') || mensajeLower.includes('quien')) && 
        usuario && usuario.rol !== 'Usuario') {
      return Promise.resolve({
        texto: `👥 Como ${usuario.rol}, tienes acceso a la lista de usuarios del sistema. Ve a la sección Admin > Usuarios para ver todos los usuarios registrados y sus roles.`,
        confianza: 0.85,
        tipo: 'informativa' as const,
        accionSugerida: {
          id: 'ver-usuarios',
          titulo: 'Ver Usuarios',
          descripcion: 'Ir a la lista de usuarios',
          icono: '👥',
          accion: () => this.router.navigate(['/admin/usuarios']),
          categoria: 'navegacion' as const
        }
      });
    }

    const respuestas = [
      "😊 ¡Qué interesante! Cuéntame más sobre lo que necesitas.",
      "🤔 Entiendo. ¿Hay algo específico de InnoAd en lo que pueda ayudarte?",
      `👋 Hola ${usuario?.nombre || ''}! ¿En qué puedo asistirte hoy?`
    ];

    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

    return Promise.resolve({
      texto: respuesta,
      confianza: 0.7,
      tipo: 'humor' as const
    });
  }

  /**
   * Análisis de sentimiento básico
   */
  private analizarSentimiento(texto: string): 'positivo' | 'neutral' | 'negativo' {
    const palabrasPositivas = ['genial', 'excelente', 'perfecto', 'bueno', 'gracias'];
    const palabrasNegativas = ['malo', 'terrible', 'problema', 'error', 'fallo'];
    
    const textoLower = texto.toLowerCase();
    let puntuacion = 0;

    palabrasPositivas.forEach(palabra => {
      if (textoLower.includes(palabra)) puntuacion += 1;
    });

    palabrasNegativas.forEach(palabra => {
      if (textoLower.includes(palabra)) puntuacion -= 1;
    });

    if (puntuacion > 0) return 'positivo';
    if (puntuacion < 0) return 'negativo';
    return 'neutral';
  }

  /**
   * Cambiar estado del asistente
   */
  private cambiarEstado(cambios: Partial<EstadoAsistente>): void {
    const estadoActual = this._estadoAsistente();
    const nuevoEstado = { ...estadoActual, ...cambios };
    this._estadoAsistente.set(nuevoEstado);
    this._estadoCambiado$.next(nuevoEstado);
  }

  /**
   * Configurar reconocimiento de voz
   * TODO: Implementar correctamente con tipos de TypeScript
   */
  private configurarReconocimientoVoz(): void {
    /* Comentado temporalmente - Requiere tipado correcto de Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.reconocimientoVoz = new SpeechRecognition();
      
      this.reconocimientoVoz.continuous = true;
      this.reconocimientoVoz.interimResults = true;
      this.reconocimientoVoz.lang = 'es-ES';

      this.reconocimientoVoz.onresult = (event: any) => {
        const resultado = event.results[event.results.length - 1];
        if (resultado.isFinal) {
          this.enviarMensaje(resultado[0].transcript);
        }
      };
    }

    if ('speechSynthesis' in window) {
      this.sintesisVoz = window.speechSynthesis;
    }
    */
  }

  /**
   * Hablar texto usando síntesis de voz
   * TODO: Implementar correctamente con tipos de TypeScript
   */
  private hablarTexto(texto: string): void {
    /* Comentado temporalmente - Requiere tipado correcto de Web Speech API
    if (this.sintesisVoz && this._configuracion().usarVoz) {
      const textoLimpio = texto.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');
      
      const utterance = new SpeechSynthesisUtterance(textoLimpio);
      utterance.lang = 'es-ES';
      utterance.rate = this._configuracion().velocidadHabla;
      
      this.sintesisVoz.speak(utterance);
    }
    */
  }

  /**
   * Generar sugerencias contextuales
   */
  private generarSugerenciasContextuales(): void {
    const sugerencias: AccionSugerida[] = [
      {
        id: 'crear-campana',
        titulo: 'Crear nueva campaña',
        descripcion: 'Comienza una campaña publicitaria',
        icono: '🎯',
        accion: () => window.location.href = '/campanas/nueva',
        categoria: 'accion'
      }
    ];

    this._sugerenciasActivas.set(sugerencias);
  }

  /**
   * Cargar capacidades del asistente
   */
  private cargarCapacidades(): void {
    const capacidades: CapacidadIA[] = [
      {
        id: 'navegacion-inteligente',
        nombre: 'Navegación Inteligente',
        descripcion: 'Te llevo directamente donde necesites ir',
        ejemplos: ['Llévame al dashboard', 'Quiero ver mis campañas'],
        categoria: 'tutoriales'
      }
    ];

    this._capacidades.set(capacidades);
  }

  /**
   * Monitoreo de contexto en tiempo real
   */
  private iniciarMonitoreoContexto(): void {
    const observarRuta = () => {
      const rutaActual = window.location.pathname;
      const usuario = this.servicioAuth.usuarioActual();
      
      this._contextoActual.update(ctx => ({
        ...ctx,
        paginaActual: rutaActual,
        usuarioActual: usuario ? {
          id: usuario.id,
          nombre: usuario.nombreCompleto || usuario.nombreUsuario,
          rol: usuario.rol?.nombre || usuario.rol || 'Usuario',
          email: usuario.email
        } : undefined
      }));
    };

    interval(2000).subscribe(observarRuta);
    observarRuta();
  }

  /**
   * Iniciar escucha por voz
   * TODO: Implementar cuando se corrija el reconocimiento de voz
   */
  iniciarEscucha(): void {
    /* Comentado temporalmente
    if (this.reconocimientoVoz) {
      this.reconocimientoVoz.start();
      this.cambiarEstado({
        escuchando: true,
        animacion: 'escuchando'
      });
    }
    */
  }

  /**
   * Detener escucha por voz
   * TODO: Implementar cuando se corrija el reconocimiento de voz
   */
  detenerEscucha(): void {
    /* Comentado temporalmente
    if (this.reconocimientoVoz) {
      this.reconocimientoVoz.stop();
      this.cambiarEstado({
        escuchando: false,
        animacion: 'idle'
      });
    }
    */
  }

  /**
   * Actualizar configuración
   */
  actualizarConfiguracion(nuevaConfig: Partial<ConfiguracionAsistente>): void {
    this._configuracion.update(config => ({ ...config, ...nuevaConfig }));
  }

  /**
   * Limpiar historial de chat
   */
  limpiarChat(): void {
    this._historialChat.set([]);
  }

  /**
   * Ejecutar acción sugerida
   */
  ejecutarAccion(accion: AccionSugerida): void {
    try {
      accion.accion();
      this._accionEjecutada$.next(accion);
    } catch (error) {
      console.error('Error ejecutando acción:', error);
    }
  }

  /**
   * Utilidades
   */
  private generarId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
