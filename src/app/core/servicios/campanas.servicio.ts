import { Injectable, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, timer } from 'rxjs';
import { map, tap, shareReplay, catchError, switchMap } from 'rxjs/operators';
import { HttpBaseServicio } from './http-base.servicio';
import { Campana } from '../modelos/campana.modelo';
import { API_ENDPOINTS } from '../config/api.config';

export interface FiltroCampanas {
  busqueda?: string;
  estado?: 'activa' | 'pausada' | 'programada' | 'finalizada';
  fechaInicioDesde?: Date;
  fechaInicioHasta?: Date;
  fechaFinDesde?: Date;
  fechaFinHasta?: Date;
  creadorId?: string;
  tags?: string[];
  pagina?: number;
  limite?: number;
  ordenPor?: string;
  orden?: 'asc' | 'desc';
}

export interface CrearCampanaRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'activa' | 'pausada' | 'programada';
  configuracion: {
    transiciones: {
      tipo: 'automatica' | 'manual';
      duracion?: number;
      efectos?: string[];
    };
    horarios: {
      lunes?: { inicio: string; fin: string };
      martes?: { inicio: string; fin: string };
      miercoles?: { inicio: string; fin: string };
      jueves?: { inicio: string; fin: string };
      viernes?: { inicio: string; fin: string };
      sabado?: { inicio: string; fin: string };
      domingo?: { inicio: string; fin: string };
    };
    prioridad: number;
    repetir?: boolean;
    notificaciones?: boolean;
  };
  contenidos: string[]; // IDs de contenidos
  pantallas: string[]; // IDs de pantallas
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ActualizarCampanaRequest {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: 'activa' | 'pausada' | 'programada' | 'finalizada';
  configuracion?: {
    transiciones?: {
      tipo: 'automatica' | 'manual';
      duracion?: number;
      efectos?: string[];
    };
    horarios?: {
      lunes?: { inicio: string; fin: string };
      martes?: { inicio: string; fin: string };
      miercoles?: { inicio: string; fin: string };
      jueves?: { inicio: string; fin: string };
      viernes?: { inicio: string; fin: string };
      sabado?: { inicio: string; fin: string };
      domingo?: { inicio: string; fin: string };
    };
    prioridad?: number;
    repetir?: boolean;
    notificaciones?: boolean;
  };
  contenidos?: string[];
  pantallas?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface RespuestaPaginadaCampanas {
  campanas: Campana[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface EstadisticasCampanas {
  total: number;
  activas: number;
  pausadas: number;
  programadas: number;
  finalizadas: number;
  reproductividad: {
    campanaId: string;
    nombre: string;
    reproducciones: number;
    tiempoTotal: number;
    pantallasActivas: number;
  }[];
  tendencias: {
    fecha: string;
    nuevas: number;
    activas: number;
    reproducciones: number;
  }[];
}

export interface ReproduccionCampana {
  campanaId: string;
  pantallaId: string;
  inicio: Date;
  fin?: Date;
  contenidoActual?: string;
  estado: 'reproduciendo' | 'pausada' | 'error';
  progreso: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampanasServicio {
  private readonly httpBase = inject(HttpBaseServicio);

  // Signals para estado reactivo
  private readonly campanasSignal = signal<Campana[]>([]);
  private readonly campanaSeleccionadaSignal = signal<Campana | null>(null);
  private readonly estadisticasSignal = signal<EstadisticasCampanas | null>(null);
  private readonly reproduccionesSignal = signal<ReproduccionCampana[]>([]);
  private readonly cargandoSignal = signal<boolean>(false);
  private readonly monitoreoActivoSignal = signal<boolean>(false);

  // Subjects para filtros y estados
  private readonly filtrosSubject = new BehaviorSubject<FiltroCampanas>({
    pagina: 1,
    limite: 20,
    ordenPor: 'fechaCreacion',
    orden: 'desc'
  });

  // Observables públicos
  readonly campanas$ = this.campanasSignal.asReadonly();
  readonly campanaSeleccionada$ = this.campanaSeleccionadaSignal.asReadonly();
  readonly estadisticas$ = this.estadisticasSignal.asReadonly();
  readonly reproducciones$ = this.reproduccionesSignal.asReadonly();
  readonly cargando$ = this.cargandoSignal.asReadonly();
  readonly filtros$ = this.filtrosSubject.asObservable();
  readonly monitoreoActivo$ = this.monitoreoActivoSignal.asReadonly();

  constructor() {
    // Auto-cargar campañas cuando cambian los filtros
    this.filtros$.subscribe(filtros => {
      this.cargarCampanas(filtros);
    });
  }

  // ===== MÉTODOS PÚBLICOS DE GESTIÓN =====

  /**
   * Obtener todas las campañas con filtros
   */
  obtenerCampanas(filtros?: FiltroCampanas): Observable<RespuestaPaginadaCampanas> {
    this.cargandoSignal.set(true);
    
    const params = this.construirParametrosConsulta(filtros);
    
    return this.httpBase.get<RespuestaPaginadaCampanas>(API_ENDPOINTS.campaigns.list, { params }).pipe(
      tap(respuesta => {
        this.campanasSignal.set(respuesta.campanas);
        this.cargandoSignal.set(false);
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtener campaña por ID
   */
  obtenerCampanaPorId(id: string): Observable<Campana> {
    return this.httpBase.get<Campana>(`${API_ENDPOINTS.campaigns.get}/${id}`, {
      cacheKey: `campana_${id}`,
      cacheTTL: 5 * 60 * 1000 // 5 minutos
    }).pipe(
      tap(campana => this.campanaSeleccionadaSignal.set(campana))
    );
  }

  /**
   * Crear nueva campaña
   */
  crearCampana(datos: CrearCampanaRequest): Observable<Campana> {
    this.cargandoSignal.set(true);
    
    return this.httpBase.post<Campana>(API_ENDPOINTS.campaigns.create, datos).pipe(
      tap(nuevaCampana => {
        // Actualizar la lista local
        const campanasActuales = this.campanasSignal();
        this.campanasSignal.set([nuevaCampana, ...campanasActuales]);
        this.cargandoSignal.set(false);
        
        // Invalidar cache relacionado
        this.httpBase.invalidarCache('campanas_*');
        this.httpBase.invalidarCache('estadisticas_campanas');
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Actualizar campaña existente
   */
  actualizarCampana(id: string, datos: ActualizarCampanaRequest): Observable<Campana> {
    this.cargandoSignal.set(true);
    
    return this.httpBase.put<Campana>(`${API_ENDPOINTS.campaigns.update}/${id}`, datos).pipe(
      tap(campanaActualizada => {
        // Actualizar en la lista local
        const campanas = this.campanasSignal().map(c => 
          c.id === id ? campanaActualizada : c
        );
        this.campanasSignal.set(campanas);
        
        // Actualizar campaña seleccionada si coincide
        if (this.campanaSeleccionadaSignal()?.id === id) {
          this.campanaSeleccionadaSignal.set(campanaActualizada);
        }
        
        this.cargandoSignal.set(false);
        
        // Invalidar cache relacionado
        this.httpBase.invalidarCache(`campana_${id}`);
        this.httpBase.invalidarCache('campanas_*');
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Eliminar campaña
   */
  eliminarCampana(id: string): Observable<boolean> {
    this.cargandoSignal.set(true);
    
    return this.httpBase.delete<boolean>(`${API_ENDPOINTS.campaigns.delete}/${id}`).pipe(
      tap(eliminada => {
        if (eliminada) {
          // Remover de la lista local
          const campanas = this.campanasSignal().filter(c => c.id !== id);
          this.campanasSignal.set(campanas);
          
          // Limpiar selección si coincide
          if (this.campanaSeleccionadaSignal()?.id === id) {
            this.campanaSeleccionadaSignal.set(null);
          }
          
          // Invalidar cache relacionado
          this.httpBase.invalidarCache(`campana_${id}`);
          this.httpBase.invalidarCache('campanas_*');
        }
        this.cargandoSignal.set(false);
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      })
    );
  }

  // ===== MÉTODOS DE CONTROL DE REPRODUCCIÓN =====

  /**
   * Iniciar campaña
   */
  iniciarCampana(id: string): Observable<boolean> {
    return this.httpBase.post<boolean>(`${API_ENDPOINTS.campaigns.start}/${id}`, {}).pipe(
      tap(() => {
        this.actualizarEstadoCampanaLocal(id, 'activa');
        this.httpBase.invalidarCache(`campana_${id}`);
      })
    );
  }

  /**
   * Pausar campaña
   */
  pausarCampana(id: string): Observable<boolean> {
    return this.httpBase.post<boolean>(`${API_ENDPOINTS.campaigns.pause}/${id}`, {}).pipe(
      tap(() => {
        this.actualizarEstadoCampanaLocal(id, 'pausada');
        this.httpBase.invalidarCache(`campana_${id}`);
      })
    );
  }

  /**
   * Detener campaña
   */
  detenerCampana(id: string): Observable<boolean> {
    return this.httpBase.post<boolean>(`${API_ENDPOINTS.campaigns.stop}/${id}`, {}).pipe(
      tap(() => {
        this.actualizarEstadoCampanaLocal(id, 'finalizada');
        this.httpBase.invalidarCache(`campana_${id}`);
      })
    );
  }

  /**
   * Programar campaña
   */
  programarCampana(id: string, fechaInicio: Date): Observable<boolean> {
    return this.httpBase.post<boolean>(`${API_ENDPOINTS.campaigns.schedule}/${id}`, { 
      fechaInicio: fechaInicio.toISOString() 
    }).pipe(
      tap(() => {
        this.actualizarEstadoCampanaLocal(id, 'programada');
        this.httpBase.invalidarCache(`campana_${id}`);
      })
    );
  }

  /**
   * Duplicar campaña
   */
  duplicarCampana(id: string, nuevoNombre?: string): Observable<Campana> {
    return this.httpBase.post<Campana>(`${API_ENDPOINTS.campaigns.duplicate}/${id}`, { 
      nuevoNombre 
    }).pipe(
      tap(campanaDuplicada => {
        // Agregar a la lista local
        const campanasActuales = this.campanasSignal();
        this.campanasSignal.set([campanaDuplicada, ...campanasActuales]);
        
        // Invalidar cache
        this.httpBase.invalidarCache('campanas_*');
      })
    );
  }

  // ===== MÉTODOS DE MONITOREO Y ESTADÍSTICAS =====

  /**
   * Obtener estadísticas de campañas
   */
  obtenerEstadisticas(): Observable<EstadisticasCampanas> {
    return this.httpBase.get<EstadisticasCampanas>(API_ENDPOINTS.campaigns.stats, {
      cacheKey: 'estadisticas_campanas',
      cacheTTL: 5 * 60 * 1000 // 5 minutos
    }).pipe(
      tap(stats => this.estadisticasSignal.set(stats))
    );
  }

  /**
   * Obtener estado de reproducción en tiempo real
   */
  obtenerEstadoReproduccion(): Observable<ReproduccionCampana[]> {
    return this.httpBase.get<ReproduccionCampana[]>(`${API_ENDPOINTS.campaigns.playback}/status`).pipe(
      tap(reproducciones => this.reproduccionesSignal.set(reproducciones))
    );
  }

  /**
   * Iniciar monitoreo en tiempo real
   */
  iniciarMonitoreo(): void {
    if (this.monitoreoActivoSignal()) return;
    
    this.monitoreoActivoSignal.set(true);
    
    // Actualizar cada 30 segundos
    timer(0, 30000).pipe(
      switchMap(() => this.obtenerEstadoReproduccion()),
      tap(() => {
        if (!this.monitoreoActivoSignal()) {
          // Detener el timer si el monitoreo se desactiva
          return;
        }
      })
    ).subscribe({
      error: (error) => {
        console.error('Error en monitoreo:', error);
        this.monitoreoActivoSignal.set(false);
      }
    });
  }

  /**
   * Detener monitoreo en tiempo real
   */
  detenerMonitoreo(): void {
    this.monitoreoActivoSignal.set(false);
  }

  /**
   * Obtener logs de reproducción de una campaña
   */
  obtenerLogsReproduccion(id: string, filtros?: any): Observable<any[]> {
    const params = filtros ? this.construirParametrosConsulta(filtros) : {};
    
    return this.httpBase.get<any[]>(`${API_ENDPOINTS.campaigns.logs}/${id}`, {
      params,
      cacheKey: `logs_campana_${id}`,
      cacheTTL: 2 * 60 * 1000 // 2 minutos
    });
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====

  /**
   * Buscar campañas por término
   */
  buscarCampanas(termino: string): Observable<Campana[]> {
    if (!termino.trim()) {
      return this.httpBase.of([]);
    }
    
    return this.httpBase.get<Campana[]>(API_ENDPOINTS.campaigns.search, {
      params: { q: termino },
      cacheKey: `busqueda_campanas_${termino}`,
      cacheTTL: 2 * 60 * 1000 // 2 minutos
    });
  }

  /**
   * Obtener campañas por estado
   */
  obtenerCampanasPorEstado(estado: string): Observable<Campana[]> {
    return this.httpBase.get<Campana[]>(`${API_ENDPOINTS.campaigns.list}/by-status/${estado}`, {
      cacheKey: `campanas_estado_${estado}`,
      cacheTTL: 3 * 60 * 1000 // 3 minutos
    });
  }

  /**
   * Obtener campañas programadas para hoy
   */
  obtenerCampanasHoy(): Observable<Campana[]> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.httpBase.get<Campana[]>(`${API_ENDPOINTS.campaigns.list}/today`, {
      cacheKey: `campanas_hoy_${hoy}`,
      cacheTTL: 10 * 60 * 1000 // 10 minutos
    });
  }

  // ===== MÉTODOS DE EXPORTACIÓN E IMPORTACIÓN =====

  /**
   * Exportar campañas
   */
  exportarCampanas(formato: 'csv' | 'excel' = 'csv', filtros?: FiltroCampanas): Observable<Blob> {
    const params = {
      ...this.construirParametrosConsulta(filtros),
      formato
    };
    
    return this.httpBase.get<Blob>(`${API_ENDPOINTS.campaigns.export}`, {
      params,
      responseType: 'blob' as any
    });
  }

  /**
   * Exportar programación de campañas
   */
  exportarProgramacion(fechaDesde: Date, fechaHasta: Date): Observable<Blob> {
    return this.httpBase.get<Blob>(`${API_ENDPOINTS.campaigns.schedule}/export`, {
      params: {
        fechaDesde: fechaDesde.toISOString(),
        fechaHasta: fechaHasta.toISOString(),
        formato: 'pdf'
      },
      responseType: 'blob' as any
    });
  }

  // ===== MÉTODOS DE FILTRADO Y PAGINACIÓN =====

  /**
   * Actualizar filtros
   */
  actualizarFiltros(nuevosFiltros: Partial<FiltroCampanas>): void {
    const filtrosActuales = this.filtrosSubject.value;
    this.filtrosSubject.next({ ...filtrosActuales, ...nuevosFiltros });
  }

  /**
   * Resetear filtros
   */
  resetearFiltros(): void {
    this.filtrosSubject.next({
      pagina: 1,
      limite: 20,
      ordenPor: 'fechaCreacion',
      orden: 'desc'
    });
  }

  /**
   * Ir a página específica
   */
  irAPagina(pagina: number): void {
    this.actualizarFiltros({ pagina });
  }

  // ===== MÉTODOS DE GESTIÓN DE ESTADO =====

  /**
   * Seleccionar campaña
   */
  seleccionarCampana(campana: Campana | null): void {
    this.campanaSeleccionadaSignal.set(campana);
  }

  /**
   * Recargar campañas
   */
  recargarCampanas(): void {
    const filtrosActuales = this.filtrosSubject.value;
    this.cargarCampanas(filtrosActuales);
  }

  /**
   * Limpiar cache
   */
  limpiarCache(): void {
    this.httpBase.invalidarCache('campanas_*');
    this.httpBase.invalidarCache('campana_*');
    this.httpBase.invalidarCache('estadisticas_campanas');
  }

  // ===== MÉTODOS PRIVADOS =====

  private cargarCampanas(filtros: FiltroCampanas): void {
    this.obtenerCampanas(filtros).subscribe({
      error: (error) => {
        console.error('Error cargando campañas:', error);
        this.cargandoSignal.set(false);
      }
    });
  }

  private actualizarEstadoCampanaLocal(id: string, nuevoEstado: string): void {
    const campanas = this.campanasSignal().map(c => 
      c.id === id ? { ...c, estado: nuevoEstado } : c
    );
    this.campanasSignal.set(campanas);
    
    if (this.campanaSeleccionadaSignal()?.id === id) {
      const campanaSeleccionada = this.campanaSeleccionadaSignal();
      if (campanaSeleccionada) {
        this.campanaSeleccionadaSignal.set({
          ...campanaSeleccionada,
          estado: nuevoEstado
        });
      }
    }
  }

  private construirParametrosConsulta(filtros?: FiltroCampanas): any {
    if (!filtros) return {};
    
    const params: any = {};
    
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.fechaInicioDesde) params.fechaInicioDesde = filtros.fechaInicioDesde.toISOString();
    if (filtros.fechaInicioHasta) params.fechaInicioHasta = filtros.fechaInicioHasta.toISOString();
    if (filtros.fechaFinDesde) params.fechaFinDesde = filtros.fechaFinDesde.toISOString();
    if (filtros.fechaFinHasta) params.fechaFinHasta = filtros.fechaFinHasta.toISOString();
    if (filtros.creadorId) params.creadorId = filtros.creadorId;
    if (filtros.tags?.length) params.tags = filtros.tags.join(',');
    if (filtros.pagina) params.pagina = filtros.pagina.toString();
    if (filtros.limite) params.limite = filtros.limite.toString();
    if (filtros.ordenPor) params.ordenPor = filtros.ordenPor;
    if (filtros.orden) params.orden = filtros.orden;
    
    return params;
  }
}
