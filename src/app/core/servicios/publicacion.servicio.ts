import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, throwError } from 'rxjs';
import { tap, switchMap, retryWhen, mergeMap, timer } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Publicacion {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  titulo: string;
  descripcion: string;
  contenido: {
    tipo: 'VIDEO' | 'IMAGEN';
    url: string;
  };
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO';
  ubicaciones: {
    ciudad: string;
    ubicacion: string;
  }[];
  fechaCreacion: Date;
  fechaAprobacion?: Date;
  fechaPublicacion?: Date;
  costo?: number;
  duracionDias?: number;
}

export interface AlertaPublicacion {
  id: number;
  publicacionId: number;
  usuarioNombre: string;
  titulo: string;
  fechaCreacion: Date;
  ultimaAlerta: Date;
  vistaPor?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PublicacionServicio {
  private publicacionesPendientes$ = new BehaviorSubject<Publicacion[]>([]);
  private alertas$ = new BehaviorSubject<AlertaPublicacion[]>([]);
  private todasPublicaciones$ = new BehaviorSubject<Publicacion[]>([]);
  private readonly API_URL = `${environment.urlApi}/publicaciones`;
  private readonly maxIntentos = 3;

  constructor(private http: HttpClient) {
    // Cargar publicaciones pendientes cada 2 minutos (como requiere el sistema)
    this.iniciarSincronizacion();
  }

  /**
   * Iniciar sincronización automática de publicaciones pendientes cada 2 minutos
   */
  private iniciarSincronizacion(): void {
    interval(2 * 60 * 1000) // 2 minutos
      .pipe(
        switchMap(() => this.obtenerPublicacionesPendientesConReintentos())
      )
      .subscribe({
        next: (publicaciones) => {
          this.publicacionesPendientes$.next(publicaciones);
          this.generarAlertas(publicaciones);
        },
        error: (error) => {
          console.error('Error al sincronizar publicaciones:', error);
        }
      });

    // Primera carga inmediata
    this.cargarPublicacionesPendientes();
  }

  /**
   * Obtener publicaciones con reintentos exponenciales
   */
  private obtenerPublicacionesPendientesConReintentos(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.API_URL}/pendientes`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503 || error.status === 504) &&
              index < this.maxIntentos
            ) {
              const delayMs = Math.pow(2, index) * 1000;
              console.warn(
                `[Publicaciones] Reintentando en ${delayMs}ms (intento ${index + 1}/${this.maxIntentos})`
              );
              return timer(delayMs);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }

  /**
   * Cargar publicaciones pendientes de aprobación
   */
  cargarPublicacionesPendientes(): void {
    this.obtenerPublicacionesPendientesConReintentos()
      .pipe(
        tap(publicaciones => {
          this.publicacionesPendientes$.next(publicaciones);
          this.generarAlertas(publicaciones);
        })
      )
      .subscribe({
        error: (error) => console.error('Error al cargar publicaciones:', error)
      });
  }

  /**
   * Generar alertas para publicaciones pendientes
   */
  private generarAlertas(publicaciones: Publicacion[]): void {
    const alertas = publicaciones.map(pub => ({
      id: pub.id,
      publicacionId: pub.id,
      usuarioNombre: pub.usuarioNombre,
      titulo: pub.titulo,
      fechaCreacion: pub.fechaCreacion,
      ultimaAlerta: new Date(),
      vistaPor: []
    }));

    this.alertas$.next(alertas);
  }

  /**
   * Obtener publicaciones pendientes
   */
  obtenerPublicacionesPendientes$(): Observable<Publicacion[]> {
    return this.publicacionesPendientes$.asObservable();
  }

  /**
   * Obtener alertas de publicaciones
   */
  obtenerAlertas$(): Observable<AlertaPublicacion[]> {
    return this.alertas$.asObservable();
  }

  /**
   * Obtener una publicación específica
   */
  obtenerPublicacion(id: number): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.API_URL}/${id}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503) &&
              index < this.maxIntentos
            ) {
              return timer(Math.pow(2, index) * 1000);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }

  /**
   * Crear nueva publicación
   */
  crearPublicacion(datos: any): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}`, datos)
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Aprobar una publicación
   */
  aprobarPublicacion(id: number, notas?: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${id}/aprobar`, { notas })
      .pipe(
        tap(() => this.cargarPublicacionesPendientes()),
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              if (
                (error.status === 0 || error.status === 503) &&
                index < this.maxIntentos
              ) {
                return timer(Math.pow(2, index) * 1000);
              }
              return throwError(() => error);
            })
          )
        )
      );
  }

  /**
   * Rechazar una publicación
   */
  rechazarPublicacion(id: number, motivo: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${id}/rechazar`, { motivo })
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Publicar una publicación aprobada
   */
  publicarPublicacion(id: number, datosPublicacion: any): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/${id}/publicar`, datosPublicacion)
      .pipe(
        tap(() => this.cargarPublicacionesPendientes()),
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              if (
                (error.status === 0 || error.status === 503) &&
                index < this.maxIntentos
              ) {
                return timer(Math.pow(2, index) * 1000);
              }
              return throwError(() => error);
            })
          )
        )
      );
  }

  /**
   * Marcar alerta como vista
   */
  marcarAlertaVista(alertaId: number, usuarioNombre: string): void {
    this.http.post(`/api/publicaciones/alerta/${alertaId}/vista`, { usuarioNombre })
      .subscribe();

    // Actualizar localmente
    const alertas = this.alertas$.value;
    const alerta = alertas.find(a => a.id === alertaId);
    if (alerta) {
      if (!alerta.vistaPor) alerta.vistaPor = [];
      if (!alerta.vistaPor.includes(usuarioNombre)) {
        alerta.vistaPor.push(usuarioNombre);
      }
      this.alertas$.next([...alertas]);
    }
  }

  /**
   * Obtener publicaciones de un usuario
   */
  obtenerPublicacionesUsuario(usuarioId: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.API_URL}/usuario/${usuarioId}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503) &&
              index < this.maxIntentos
            ) {
              return timer(Math.pow(2, index) * 1000);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }

  /**
   * Obtener todas las publicaciones publicadas (para feed público)
   */
  obtenerPublicacionesPublicadas(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.API_URL}/publicadas`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503) &&
              index < this.maxIntentos
            ) {
              return timer(Math.pow(2, index) * 1000);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }

  /**
   * Obtener estadísticas de una publicación
   */
  obtenerEstadisticas(publicacionId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${publicacionId}/estadisticas`).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503) &&
              index < this.maxIntentos
            ) {
              return timer(Math.pow(2, index) * 1000);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }

  /**
   * Guardar publicación como borrador
   */
  guardarBorrador(datos: any): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}/borrador`, datos)
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Enviar publicación para aprobación
   */
  enviarParaAprobacion(datos: any): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.API_URL}`, datos)
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Obtener mis publicaciones del usuario autenticado
   */
  obtenerMisPublicaciones(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.API_URL}/mis`)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              if (
                (error.status === 0 || error.status === 503) &&
                index < this.maxIntentos
              ) {
                return timer(Math.pow(2, index) * 1000);
              }
              return throwError(() => error);
            })
          )
        )
      );
  }
}
