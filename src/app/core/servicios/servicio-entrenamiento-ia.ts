/**
 * 🤖 SERVICIO DE ENTRENAMIENTO DE IA
 * Maneja búsquedas en FAQ local, cálculo de similitud y gestión de conocimiento
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

import {
  EntrenamientoIA,
  ArticuloEntrenamiento,
  ResultadoBusquedaFAQ,
  ConfiguracionEntrenamiento,
  RespuestaGeneracionCampana,
  ParametrosGeneracionCampana,
  MetricasIA,
  RetroalimentacionUsuario,
  EstadisticasCalidadIA
} from '@core/modelos/ia-training.modelo';

@Injectable({
  providedIn: 'root'
})
export class ServicioEntrenamientoIA {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ia`;

  // Estado de entrenamiento
  private entrenamientoCargado$ = new BehaviorSubject<boolean>(false);
  private metricas$ = new BehaviorSubject<MetricasIA | null>(null);
  private estadisticasCalidad$ = new BehaviorSubject<EstadisticasCalidadIA | null>(null);

  // Cache de entrenamiento local
  private datosEntrenamiento: EntrenamientoIA | null = null;
  private mapaPalabrasyArticulos: Map<string, ArticuloEntrenamiento[]> = new Map();

  // Configuración
  private configuracion: ConfiguracionEntrenamiento = {
    usarFAQLocal: true,
    usarOpenAI: false,
    minConfianzaFAQ: 0.85,
    minConfianzaOpenAI: 0.75,
    modeloOpenAI: 'gpt-4-mini',
    temperaturaOpenAI: 0.7,
    maxTokensOpenAI: 2000,
    tiempooutRespuestaOpenAI: 30000,
    idioma: 'es'
  };

  constructor() {
    this.cargarEntrenamientoLocal();
  }

  /**
   * Cargar datos de entrenamiento desde JSON
   */
  private cargarEntrenamientoLocal(): void {
    this.http
      .get<EntrenamientoIA>('/assets/ia-training-data.json')
      .subscribe(
        (datos) => {
          this.datosEntrenamiento = datos;
          this.construirMapaPalabras();
          this.entrenamientoCargado$.next(true);
          console.log('✓ Entrenamiento de IA cargado:', datos.basesConocimiento.length, 'bases');
        },
        (error) => {
          console.error('✗ Error cargando entrenamiento:', error);
          this.entrenamientoCargado$.next(false);
        }
      );
  }

  /**
   * Construir mapa de palabras clave para búsqueda rápida
   */
  private construirMapaPalabras(): void {
    if (!this.datosEntrenamiento) return;

    this.mapaPalabrasyArticulos.clear();

    this.datosEntrenamiento.basesConocimiento.forEach((base) => {
      base.articulos.forEach((articulo) => {
        articulo.palabrasClave.forEach((palabra) => {
          const palabraLower = palabra.toLowerCase();

          if (!this.mapaPalabrasyArticulos.has(palabraLower)) {
            this.mapaPalabrasyArticulos.set(palabraLower, []);
          }

          this.mapaPalabrasyArticulos.get(palabraLower)!.push(articulo);
        });
      });
    });
  }

  /**
   * Buscar respuesta en FAQ local
   * @param pregunta Pregunta del usuario
   * @returns Resultado de búsqueda con artículo encontrado
   */
  buscarEnFAQ(pregunta: string): ResultadoBusquedaFAQ {
    const inicio = performance.now();

    if (!this.datosEntrenamiento) {
      return {
        encontrado: false,
        confianza: 0,
        tiempoMs: performance.now() - inicio
      };
    }

    const preguntaLower = pregunta.toLowerCase();
    const palabrasClave = preguntaLower.split(/\s+/);

    let mejorArticulo: ArticuloEntrenamiento | null = null;
    let mejorConfianza = 0;

    // Buscar coincidencias por palabras clave
    palabrasClave.forEach((palabra) => {
      const articulosRelacionados = this.mapaPalabrasyArticulos.get(palabra) || [];

      articulosRelacionados.forEach((articulo) => {
        const similitud = this.calcularSimilitud(pregunta, articulo);

        if (similitud > mejorConfianza) {
          mejorConfianza = similitud;
          mejorArticulo = articulo;
        }
      });
    });

    // Buscar en ejemplos
    if (!mejorArticulo || mejorConfianza < 0.7) {
      this.datosEntrenamiento.basesConocimiento.forEach((base) => {
        base.articulos.forEach((articulo) => {
          articulo.ejemplos.forEach((ejemplo) => {
            const similitud = this.calcularSimilitud(pregunta, ejemplo);

            if (similitud > mejorConfianza) {
              mejorConfianza = similitud;
              mejorArticulo = articulo;
            }
          });
        });
      });
    }

    const tiempoMs = performance.now() - inicio;

    if (mejorConfianza >= this.configuracion.minConfianzaFAQ && mejorArticulo) {
      return {
        encontrado: true,
        articulo: mejorArticulo,
        confianza: mejorConfianza,
        tiempoMs
      };
    }

    return {
      encontrado: false,
      confianza: mejorConfianza,
      tiempoMs
    };
  }

  /**
   * Calcular similitud entre dos textos (algoritmo Levenshtein mejorado)
   */
  private calcularSimilitud(texto1: string, texto2: string): number {
    const t1 = texto1.toLowerCase();
    const t2 = texto2.toLowerCase();

    if (t1 === t2) return 1.0;

    // Similitud por palabras comunes
    const palabras1 = new Set(t1.split(/\s+/));
    const palabras2 = new Set(t2.split(/\s+/));

    const comunas = [...palabras1].filter((p) => palabras2.has(p)).length;
    const total = Math.max(palabras1.size, palabras2.size);

    const similitudPorPalabras = comunas / total;

    // Levenshtein distance normalizado
    const distancia = this.distanciaLevenshtein(t1, t2);
    const maxLongitud = Math.max(t1.length, t2.length);
    const similitudLevenshtein = 1 - distancia / maxLongitud;

    // Combinación ponderada
    return similitudPorPalabras * 0.6 + similitudLevenshtein * 0.4;
  }

  /**
   * Calcular distancia de Levenshtein
   */
  private distanciaLevenshtein(str1: string, str2: string): number {
    const matriz: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matriz[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matriz[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matriz[i][j] = matriz[i - 1][j - 1];
        } else {
          matriz[i][j] = Math.min(
            matriz[i - 1][j - 1] + 1,
            matriz[i][j - 1] + 1,
            matriz[i - 1][j] + 1
          );
        }
      }
    }

    return matriz[str2.length][str1.length];
  }

  /**
   * Generar campaña automáticamente con IA
   */
  generarCampanaAutomatica(
    parametros: ParametrosGeneracionCampana
  ): Observable<RespuestaGeneracionCampana> {
    return this.http.post<RespuestaGeneracionCampana>(
      `${this.apiUrl}/generar-campana`,
      parametros
    );
  }

  /**
   * Obtener acciones rápidas contextuales
   */
  obtenerAccionesRapidas(): Observable<any[]> {
    if (!this.datosEntrenamiento) {
      return new Observable((obs) => obs.next([]));
    }

    return new Observable((obs) => {
      obs.next(this.datosEntrenamiento!.accionesRapidas);
      obs.complete();
    });
  }

  /**
   * Registrar retroalimentación del usuario
   */
  registrarRetroalimentacion(feedback: RetroalimentacionUsuario): Observable<any> {
    return this.http.post(`${this.apiUrl}/retroalimentacion`, feedback);
  }

  /**
   * Obtener estadísticas de calidad
   */
  obtenerEstadisticasCalidad(): Observable<EstadisticasCalidadIA> {
    return this.http.get<EstadisticasCalidadIA>(`${this.apiUrl}/estadisticas-calidad`);
  }

  /**
   * Obtener métricas de uso
   */
  obtenerMetricas(): Observable<MetricasIA> {
    return this.http.get<MetricasIA>(`${this.apiUrl}/metricas`);
  }

  /**
   * Configurar entrenamiento
   */
  configurarEntrenamiento(config: Partial<ConfiguracionEntrenamiento>): void {
    this.configuracion = { ...this.configuracion, ...config };
  }

  /**
   * Obtener configuración actual
   */
  obtenerConfiguracion(): ConfiguracionEntrenamiento {
    return { ...this.configuracion };
  }

  /**
   * Observable de estado de entrenamiento
   */
  get entrenamientoCargado(): Observable<boolean> {
    return this.entrenamientoCargado$.asObservable();
  }

  /**
   * Observable de métricas
   */
  get metricas(): Observable<MetricasIA | null> {
    return this.metricas$.asObservable();
  }

  /**
   * Observable de estadísticas de calidad
   */
  get estadisticasCalidad(): Observable<EstadisticasCalidadIA | null> {
    return this.estadisticasCalidad$.asObservable();
  }

  /**
   * Obtener datos de entrenamiento completos
   */
  obtenerDatosEntrenamiento(): EntrenamientoIA | null {
    return this.datosEntrenamiento;
  }
}
