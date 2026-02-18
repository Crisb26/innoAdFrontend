/**
 * []� SERVICIO DE AGENTE IA - INNOAD ASSISTANT
 * Servicio para conversación inteligente con memoria y contexto
 * Integración con OpenAI GPT-4 mini (configurado en backend)
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface MensajeIA {
  id: string;
  contenido: string;
  esUsuario: boolean;
  timestamp: Date;
  tipoRespuesta?: 'texto' | 'recomendacion' | 'accion' | 'error';
  datosAdicionales?: Record<string, any>;
}

export interface ContextoConversacion {
  usuarioId: string;
  rol: string;
  historial: MensajeIA[];
  ultimaInteraccion: Date;
  sesionId: string;
}

export interface RespuestaIA {
  respuesta: string;
  tipoRespuesta: 'texto' | 'recomendacion' | 'accion' | 'error';
  confianza: number;
  intenciones: string[];
  entidades: string[];
  sugerencias: string[];
  datosAdicionales?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class ServicioAgenteIA {
  private apiUrl = `${environment.apiUrl}/asistente-ia`;
  private historialSubject = new BehaviorSubject<MensajeIA[]>([]);
  private cargandoSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');
  private metricsSubject = new Subject<{
    preguntasProcessadas: number;
    tiempoPromedio: number;
    confianzaPromedia: number;
  }>();

  public historial$ = this.historialSubject.asObservable();
  public cargando$ = this.cargandoSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public metrics$ = this.metricsSubject.asObservable();

  private contexto: ContextoConversacion;
  private sesionId: string = this.generarSesionId();
  private cache: Map<string, RespuestaIA> = new Map();
  private tiemposRespuesta: number[] = [];

  constructor(private http: HttpClient) {
    this.contexto = {
      usuarioId: '',
      rol: '',
      historial: [],
      ultimaInteraccion: new Date(),
      sesionId: this.sesionId,
    };
  }

  /**
   * Inicializar sesión de IA
   */
  inicializarSesion(usuarioId: string, rol: string): void {
    this.contexto = {
      usuarioId,
      rol,
      historial: [],
      ultimaInteraccion: new Date(),
      sesionId: this.sesionId,
    };

    // Enviar bienvenida basada en rol
    this.enviarMensajeBienvenida(rol);
  }

  /**
   * Enviar pregunta al agente IA
   */
  enviarPregunta(pregunta: string): Observable<RespuestaIA> {
    if (!pregunta || pregunta.trim().length === 0) {
      return throwError(() => new Error('Pregunta vacía'));
    }

    // Agregar pregunta al historial
    this.agregarMensaje({
      id: this.generarId(),
      contenido: pregunta,
      esUsuario: true,
      timestamp: new Date(),
    });

    this.cargandoSubject.next(true);
    this.errorSubject.next('');

    const inicio = Date.now();

    // Verificar cache
    const cacheKey = pregunta.toLowerCase();
    if (this.cache.has(cacheKey)) {
      const respuestaCacheada = this.cache.get(cacheKey)!;
      this.procesarRespuesta(respuestaCacheada, inicio);
      return new Observable((observer) => {
        observer.next(respuestaCacheada);
        observer.complete();
      });
    }

    // Preparar payload
    const payload = {
      pregunta,
      contexto: {
        usuarioId: this.contexto.usuarioId,
        rol: this.contexto.rol,
        historialReciente: this.contexto.historial.slice(-5), // Últimas 5 preguntas
      },
      sesionId: this.sesionId,
    };

    return this.http.post<RespuestaIA>(`${this.apiUrl}/procesar-pregunta`, payload).pipe(
      tap((respuesta) => {
        this.procesarRespuesta(respuesta, inicio);
        this.cache.set(cacheKey, respuesta);
      }),
      catchError((error) => {
        const mensajeError = error?.error?.message || 'Error al procesar pregunta';
        this.errorSubject.next(mensajeError);
        this.cargandoSubject.next(false);

        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Procesamiento de respuesta
   */
  private procesarRespuesta(respuesta: RespuestaIA, tiempoInicio: number): void {
    const tiempoRespuesta = Date.now() - tiempoInicio;
    this.tiemposRespuesta.push(tiempoRespuesta);

    // Agregar respuesta al historial
    this.agregarMensaje({
      id: this.generarId(),
      contenido: respuesta.respuesta,
      esUsuario: false,
      timestamp: new Date(),
      tipoRespuesta: respuesta.tipoRespuesta,
      datosAdicionales: {
        confianza: respuesta.confianza,
        intenciones: respuesta.intenciones,
        entidades: respuesta.entidades,
        sugerencias: respuesta.sugerencias,
      },
    });

    // Actualizar contexto
    this.contexto.ultimaInteraccion = new Date();

    // Actualizar métricas
    const tiempoPromedio = this.tiemposRespuesta.reduce((a, b) => a + b, 0) / this.tiemposRespuesta.length;
    const confianzaPromedia =
      this.contexto.historial.reduce((sum, m) => sum + (m.datosAdicionales?.confianza || 0), 0) /
      (this.contexto.historial.length || 1);

    this.metricsSubject.next({
      preguntasProcessadas: this.contexto.historial.filter((m) => m.esUsuario).length,
      tiempoPromedio: Math.round(tiempoPromedio),
      confianzaPromedia: Math.round(confianzaPromedia * 100) / 100,
    });

    this.cargandoSubject.next(false);
  }

  /**
   * Agregar mensaje al historial
   */
  private agregarMensaje(mensaje: MensajeIA): void {
    const historialActual = this.historialSubject.value;
    this.historialSubject.next([...historialActual, mensaje]);
    this.contexto.historial.push(mensaje);
  }

  /**
   * Obtener sugerencias de preguntas desde backend (personalizadas por rol)
   */
  obtenerSugerencias(contexto?: string): Observable<string[]> {
    // Cambiar a usar el nuevo endpoint del backend que usa BaseConocimientoInnoAd
    return this.http.get<{ sugerencias: string[] }>(`${this.apiUrl}/sugerencias`).pipe(
      map((res) => res.sugerencias),
      catchError((error) => {
        console.error('Error al obtener sugerencias:', error);
        // Fallback a sugerencias genéricas si falla
        return of([
          '¿Cómo creo una campaña?',
          '¿Cómo subo contenido?',
          '¿Cómo veo mis estadísticas?',
          '¿Cómo contacto soporte?'
        ]);
      })
    );
  }

  /**
   * Ejecutar acción recomendada por IA
   */
  ejecutarAccion(accion: string, parametros?: Record<string, any>): Observable<any> {
    const payload = {
      accion,
      parametros,
      contexto: {
        usuarioId: this.contexto.usuarioId,
        rol: this.contexto.rol,
      },
    };

    return this.http.post(`${this.apiUrl}/ejecutar-accion`, payload).pipe(
      catchError((error) => {
        const mensajeError = error?.error?.message || 'Error al ejecutar acción';
        this.errorSubject.next(mensajeError);
        return throwError(() => new Error(mensajeError));
      })
    );
  }

  /**
   * Limpiar historial
   */
  limpiarHistorial(): void {
    this.historialSubject.next([]);
    this.contexto.historial = [];
    this.cache.clear();
    this.tiemposRespuesta = [];
    this.sesionId = this.generarSesionId();
  }

  /**
   * Obtener contexto actual
   */
  obtenerContexto(): ContextoConversacion {
    return this.contexto;
  }

  /**
   * Actualizar perfil de usuario
   */
  actualizarPerfil(usuarioId: string, rol: string): void {
    this.contexto.usuarioId = usuarioId;
    this.contexto.rol = rol;
  }

  /**
   * Exportar conversación
   */
  exportarConversacion(formato: 'json' | 'txt' | 'pdf' = 'json'): string | Blob {
    const contenido = this.contexto.historial.map((m) => ({
      usuario: m.esUsuario ? 'Yo' : 'IA',
      contenido: m.contenido,
      fecha: m.timestamp.toISOString(),
    }));

    switch (formato) {
      case 'json':
        return JSON.stringify(contenido, null, 2);

      case 'txt':
        const texto = contenido
          .map((msg) => `[${msg.fecha}] ${msg.usuario}:\n${msg.contenido}\n`)
          .join('\n---\n');
        return new Blob([texto], { type: 'text/plain' });

      case 'pdf':
        // Implementar PDF generation con jsPDF
        return new Blob([JSON.stringify(contenido)], { type: 'application/json' });

      default:
        return JSON.stringify(contenido);
    }
  }

  /**
   * Obtener respuestas frecuentes (FAQ)
   */
  obtenerFAQ(categoria?: string): Observable<Array<{ pregunta: string; respuesta: string }>> {
    return this.http
      .get<Array<{ pregunta: string; respuesta: string }>>(`${this.apiUrl}/faq`, {
        params: categoria ? { categoria } : {},
      })
      .pipe(
        catchError(() => {
          console.error('Error al obtener FAQ');
          return throwError(() => new Error('No se pudieron obtener preguntas frecuentes'));
        })
      );
  }

  /**
   * Entrenar modelo con feedback
   */
  registrarFeedback(respuestaId: string, helpful: boolean, comentario?: string): Observable<any> {
    const payload = {
      respuestaId,
      helpful,
      comentario,
      sesionId: this.sesionId,
    };

    return this.http.post(`${this.apiUrl}/feedback`, payload).pipe(
      tap(() => {
        // Actualizar cache basado en feedback
        if (!helpful) {
          this.cache.clear();
        }
      }),
      catchError((error) => {
        console.error('Error al registrar feedback:', error);
        return throwError(() => new Error('Error al registrar feedback'));
      })
    );
  }

  /**
   * Enviar mensaje de bienvenida
   */
  private enviarMensajeBienvenida(rol: string): void {
    const mensajes = {
      admin: '¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte con la administración del sistema?',
      profesional:
        '¡Bienvenido! Como profesional publicitario, estoy aquí para ayudarte a crear y gestionar campañas efectivas.',
      usuario: '¡Hola! ¿Tienes preguntas sobre tus campañas o cómo usar la plataforma?',
    };

    const mensaje = mensajes[rol] || mensajes.usuario;

    this.agregarMensaje({
      id: this.generarId(),
      contenido: mensaje,
      esUsuario: false,
      timestamp: new Date(),
      tipoRespuesta: 'texto',
    });
  }

  /**
   * Generar ID único
   */
  private generarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generar ID de sesión
   */
  private generarSesionId(): string {
    return `sesion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
