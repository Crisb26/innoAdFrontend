import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { RespuestaAPI } from '@core/modelos';

export interface Contenido {
  id?: number;
  titulo: string;
  descripcion?: string;
  tipo: 'IMAGEN' | 'VIDEO' | 'TEXTO' | 'HTML' | 'PDF';
  url: string;
  urlMiniatura?: string;
  pantallaId: number;
  pantallaNombre?: string;
  usuarioId?: number;
  duracion?: number;
  activo?: boolean;
  orden?: number;
  metaData?: Record<string, any>;
  fechaRegistro?: Date;
  fechaModificacion?: Date;
}

export interface SolicitudCrearContenido extends Partial<Contenido> {
  archivo?: File;
}

export interface RespuestaContenido {
  exito: boolean;
  mensaje: string;
  datos?: Contenido;
}

export interface RespuestaListaContenidos {
  exito: boolean;
  mensaje: string;
  datos?: Contenido[];
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioContenidosAvanzado {
  private readonly http = inject(HttpClient);
  
  private readonly BASE_URL = `${environment.apiUrl}/contenidos`;
  private readonly CONTENIDOS_CACHE_KEY = 'contenidos_cache';
  
  // Signals
  private contenidosSignal = signal<Contenido[]>([]);
  private contenidoSeleccionadoSignal = signal<Contenido | null>(null);
  private cargandoSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  public readonly contenidos = this.contenidosSignal.asReadonly();
  public readonly contenidoSeleccionado = this.contenidoSeleccionadoSignal.asReadonly();
  public readonly cargando = this.cargandoSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  public readonly totalContenidos = computed(() => this.contenidosSignal().length);

  // Cache
  private cache$ = new BehaviorSubject<Contenido[]>([]);
  public cache = this.cache$.asObservable();

  constructor() {
    this.cargarCacheLocal();
  }

  /**
   * Carga contenidos desde el cache local
   */
  private cargarCacheLocal(): void {
    try {
      const cache = localStorage.getItem(this.CONTENIDOS_CACHE_KEY);
      if (cache) {
        const contenidos = JSON.parse(cache);
        this.contenidosSignal.set(contenidos);
        this.cache$.next(contenidos);
      }
    } catch (e) {
      console.warn('Error cargando cache local:', e);
    }
  }

  /**
   * Obtiene todos los contenidos del usuario
   */
  public obtenerContenidos(filtro?: { pantallaId?: number; tipo?: string; estado?: string }): Observable<RespuestaListaContenidos> {
    this.cargandoSignal.set(true);
    return this.http.get<RespuestaListaContenidos>(
      this.BASE_URL,
      { params: filtro || {} }
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.contenidosSignal.set(respuesta.datos);
          this.cache$.next(respuesta.datos);
          localStorage.setItem(this.CONTENIDOS_CACHE_KEY, JSON.stringify(respuesta.datos));
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al obtener contenidos');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene contenidos de una pantalla específica
   */
  public obtenerContenidosPorPantalla(pantallaId: number): Observable<RespuestaListaContenidos> {
    return this.http.get<RespuestaListaContenidos>(
      `${this.BASE_URL}/pantalla/${pantallaId}`
    ).pipe(
      catchError(err => {
        this.errorSignal.set(`Error al obtener contenidos de la pantalla ${pantallaId}`);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene un contenido por ID
   */
  public obtenerContenido(id: number): Observable<RespuestaContenido> {
    return this.http.get<RespuestaContenido>(`${this.BASE_URL}/${id}`).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.contenidoSeleccionadoSignal.set(respuesta.datos);
        }
      }),
      catchError(err => {
        this.errorSignal.set('Error al obtener contenido');
        return throwError(() => err);
      })
    );
  }

  /**
   * Crea un nuevo contenido
   */
  public crearContenido(solicitud: SolicitudCrearContenido): Observable<RespuestaContenido> {
    this.cargandoSignal.set(true);
    
    // Si hay archivo, subir primero
    if (solicitud.archivo) {
      return this.subirArchivo(solicitud.archivo).pipe(
        switchMap(respuestaSubida => {
          if (respuestaSubida.exito) {
            solicitud.url = respuestaSubida.datos?.urlArchivo || '';
            solicitud.urlMiniatura = respuestaSubida.datos?.urlMiniatura;
          }
          return this.crearContenidoSinArchivo(solicitud);
        })
      );
    } else {
      return this.crearContenidoSinArchivo(solicitud);
    }
  }

  /**
   * Crea contenido sin archivo
   */
  private crearContenidoSinArchivo(solicitud: SolicitudCrearContenido): Observable<RespuestaContenido> {
    const { archivo, ...datosContenido } = solicitud;
    
    return this.http.post<RespuestaContenido>(
      this.BASE_URL,
      datosContenido
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          const contenidosActuales = this.contenidosSignal();
          this.contenidosSignal.set([...contenidosActuales, respuesta.datos]);
          this.cache$.next(this.contenidosSignal());
          localStorage.setItem(this.CONTENIDOS_CACHE_KEY, JSON.stringify(this.contenidosSignal()));
          this.errorSignal.set(null);
        } else {
          this.errorSignal.set(respuesta.mensaje || 'Error al crear contenido');
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al crear contenido');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza un contenido existente
   */
  public actualizarContenido(id: number, datos: Partial<Contenido>): Observable<RespuestaContenido> {
    this.cargandoSignal.set(true);
    
    return this.http.put<RespuestaContenido>(
      `${this.BASE_URL}/${id}`,
      datos
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.actualizarContenidoEnCache(respuesta.datos);
          this.errorSignal.set(null);
        } else {
          this.errorSignal.set(respuesta.mensaje || 'Error al actualizar contenido');
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al actualizar contenido');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Elimina un contenido
   */
  public eliminarContenido(id: number): Observable<RespuestaContenido> {
    this.cargandoSignal.set(true);
    
    return this.http.delete<RespuestaContenido>(
      `${this.BASE_URL}/${id}`
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          const contenidosActuales = this.contenidosSignal();
          this.contenidosSignal.set(contenidosActuales.filter(c => c.id !== id));
          this.cache$.next(this.contenidosSignal());
          localStorage.setItem(this.CONTENIDOS_CACHE_KEY, JSON.stringify(this.contenidosSignal()));
          this.errorSignal.set(null);
        } else {
          this.errorSignal.set(respuesta.mensaje || 'Error al eliminar contenido');
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al eliminar contenido');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Sube un archivo
   */
  public subirArchivo(archivo: File): Observable<RespuestaAPI<{ urlArchivo: string; urlMiniatura?: string }>> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post<RespuestaAPI<{ urlArchivo: string; urlMiniatura?: string }>>(
      `${this.BASE_URL}/upload`,
      formData
    ).pipe(
      catchError(err => {
        this.errorSignal.set('Error al subir archivo');
        return throwError(() => err);
      })
    );
  }

  /**
   * Cambia el orden de contenidos
   */
  public cambiarOrden(contenidoId: number, nuevoOrden: number): Observable<RespuestaContenido> {
    return this.http.patch<RespuestaContenido>(
      `${this.BASE_URL}/${contenidoId}/orden`,
      { orden: nuevoOrden }
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.actualizarContenidoEnCache(respuesta.datos);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Activa/Desactiva un contenido
   */
  public alternarActivo(id: number, activo: boolean): Observable<RespuestaContenido> {
    return this.http.patch<RespuestaContenido>(
      `${this.BASE_URL}/${id}/activo`,
      { activo }
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.actualizarContenidoEnCache(respuesta.datos);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Actualiza un contenido en la cache local
   */
  private actualizarContenidoEnCache(contenido: Contenido): void {
    const contenidosActuales = this.contenidosSignal();
    const index = contenidosActuales.findIndex(c => c.id === contenido.id);
    if (index !== -1) {
      contenidosActuales[index] = contenido;
      this.contenidosSignal.set([...contenidosActuales]);
      localStorage.setItem(this.CONTENIDOS_CACHE_KEY, JSON.stringify(contenidosActuales));
    }
    if (this.contenidoSeleccionadoSignal()?.id === contenido.id) {
      this.contenidoSeleccionadoSignal.set(contenido);
    }
  }

  /**
   * Limpia la cache
   */
  public limpiarCache(): void {
    localStorage.removeItem(this.CONTENIDOS_CACHE_KEY);
    this.contenidosSignal.set([]);
  }
}
