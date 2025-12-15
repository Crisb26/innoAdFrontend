import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

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
        switchMap(() => this.http.get<Publicacion[]>('/api/publicaciones/pendientes'))
      )
      .subscribe(publicaciones => {
        this.publicacionesPendientes$.next(publicaciones);
        this.generarAlertas(publicaciones);
      });

    // Primera carga inmediata
    this.cargarPublicacionesPendientes();
  }

  /**
   * Cargar publicaciones pendientes de aprobación
   */
  cargarPublicacionesPendientes(): void {
    this.http.get<Publicacion[]>('/api/publicaciones/pendientes')
      .pipe(
        tap(publicaciones => {
          this.publicacionesPendientes$.next(publicaciones);
          this.generarAlertas(publicaciones);
        })
      )
      .subscribe();
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
    return this.http.get<Publicacion>(`/api/publicaciones/${id}`);
  }

  /**
   * Crear nueva publicación
   */
  crearPublicacion(datos: any): Observable<Publicacion> {
    return this.http.post<Publicacion>('/api/publicaciones', datos)
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Aprobar una publicación
   */
  aprobarPublicacion(id: number, notas?: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`/api/publicaciones/${id}/aprobar`, { notas })
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Rechazar una publicación
   */
  rechazarPublicacion(id: number, motivo: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`/api/publicaciones/${id}/rechazar`, { motivo })
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
      );
  }

  /**
   * Publicar una publicación aprobada
   */
  publicarPublicacion(id: number, datosPublicacion: any): Observable<Publicacion> {
    return this.http.post<Publicacion>(`/api/publicaciones/${id}/publicar`, datosPublicacion)
      .pipe(
        tap(() => this.cargarPublicacionesPendientes())
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
    return this.http.get<Publicacion[]>(`/api/publicaciones/usuario/${usuarioId}`);
  }

  /**
   * Obtener todas las publicaciones publicadas (para feed público)
   */
  obtenerPublicacionesPublicadas(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>('/api/publicaciones/publicadas');
  }

  /**
   * Obtener estadísticas de una publicación
   */
  obtenerEstadisticas(publicacionId: number): Observable<any> {
    return this.http.get(`/api/publicaciones/${publicacionId}/estadisticas`);
  }
}
