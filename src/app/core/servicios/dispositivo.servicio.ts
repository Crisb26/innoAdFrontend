import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Dispositivo {
  id: number;
  nombre: string;
  codigo: string;
  ubicacion: {
    ciudad: string;
    lugar: string;
  };
  estado: 'ACTIVO' | 'INACTIVO' | 'ERROR';
  ultimaPrueba: Date;
  ultimaRespuesta?: Date;
  errorMessage?: string;
  emitiendo: boolean;
  publicacionActual?: {
    id: number;
    titulo: string;
    cliente: string;
  };
  estadisticas: {
    uptime: number; // porcentaje
    ultimoError?: string;
    errorCount: number;
  };
}

export interface AlertaDispositivo {
  id: number;
  dispositivoId: number;
  dispositivoNombre: string;
  tipo: 'DESCONEXION' | 'ERROR' | 'FUERA_DE_LINEA';
  mensaje: string;
  timestamp: Date;
  resuelta: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DispositivoServicio {
  private dispositivos$ = new BehaviorSubject<Dispositivo[]>([]);
  private alertas$ = new BehaviorSubject<AlertaDispositivo[]>([]);
  private dispositivoSeleccionado$ = new BehaviorSubject<Dispositivo | null>(null);

  private intervaloPrueba = 5 * 60 * 1000; // 5 minutos para producción (configurable)

  constructor(private http: HttpClient) {
    this.iniciarMonitoreo();
  }

  /**
   * Iniciar monitoreo automático de dispositivos
   */
  private iniciarMonitoreo(): void {
    // Cargar dispositivos inmediatamente
    this.cargarDispositivos();

    // Hacer prueba de salud cada intervalo
    interval(this.intervaloPrueba)
      .pipe(
        switchMap(() => this.realizarPruebasSalud())
      )
      .subscribe();
  }

  /**
   * Cargar lista de dispositivos
   */
  cargarDispositivos(): void {
    this.http.get<Dispositivo[]>('/api/dispositivos')
      .pipe(
        tap(dispositivos => {
          this.dispositivos$.next(dispositivos);
        }),
        catchError(() => {
          // Si hay error, mantener los dispositivos anteriores
          return of(this.dispositivos$.value);
        })
      )
      .subscribe();
  }

  /**
   * Realizar prueba de salud a todos los dispositivos
   * Envía "¿Estás bien?" a cada Raspberry Pi
   */
  realizarPruebasSalud(): Observable<any> {
    return this.http.post('/api/dispositivos/health-check', {})
      .pipe(
        tap((resultados: any) => {
          this.procesarResultadosPruebas(resultados);
        }),
        catchError(error => {
          console.error('Error en prueba de salud', error);
          return of(null);
        })
      );
  }

  /**
   * Procesar resultados de pruebas de salud
   */
  private procesarResultadosPruebas(resultados: any): void {
    const dispositivos = this.dispositivos$.value;
    const ahora = new Date();
    const alertasNuevas: AlertaDispositivo[] = [];

    dispositivos.forEach(dispositivo => {
      const resultado = resultados[dispositivo.id];
      
      if (!resultado || !resultado.respondio) {
        // Dispositivo no respondió
        const estadoAnterior = dispositivo.estado;
        dispositivo.estado = 'INACTIVO';
        dispositivo.ultimaPrueba = ahora;
        dispositivo.errorMessage = resultado?.error || 'Sin respuesta';
        dispositivo.estadisticas.errorCount++;

        if (estadoAnterior !== 'INACTIVO') {
          alertasNuevas.push({
            id: Math.random(),
            dispositivoId: dispositivo.id,
            dispositivoNombre: dispositivo.nombre,
            tipo: 'DESCONEXION',
            mensaje: `Dispositivo ${dispositivo.nombre} desconectado`,
            timestamp: ahora,
            resuelta: false
          });
        }
      } else {
        // Dispositivo respondió correctamente
        dispositivo.estado = 'ACTIVO';
        dispositivo.ultimaRespuesta = ahora;
        dispositivo.ultimaPrueba = ahora;
        dispositivo.errorMessage = undefined;

        // Si había alertas sin resolver, marcarlas como resueltas
        const alertas = this.alertas$.value;
        alertas
          .filter(a => a.dispositivoId === dispositivo.id && !a.resuelta)
          .forEach(a => a.resuelta = true);
      }
    });

    // Actualizar dispositivos
    this.dispositivos$.next([...dispositivos]);

    // Agregar nuevas alertas
    if (alertasNuevas.length > 0) {
      const alertasActuales = this.alertas$.value;
      this.alertas$.next([...alertasActuales, ...alertasNuevas]);
    }
  }

  /**
   * Obtener lista de dispositivos
   */
  obtenerDispositivos$(): Observable<Dispositivo[]> {
    return this.dispositivos$.asObservable();
  }

  /**
   * Obtener un dispositivo específico
   */
  obtenerDispositivo$(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`/api/dispositivos/${id}`)
      .pipe(
        tap(dispositivo => {
          this.dispositivoSeleccionado$.next(dispositivo);
        })
      );
  }

  /**
   * Obtener alertas de dispositivos
   */
  obtenerAlertas$(): Observable<AlertaDispositivo[]> {
    return this.alertas$.asObservable();
  }

  /**
   * Obtener dispositivo seleccionado
   */
  obtenerDispositivoSeleccionado$(): Observable<Dispositivo | null> {
    return this.dispositivoSeleccionado$.asObservable();
  }

  /**
   * Contar alertas sin resolver
   */
  contarAlertasSinResolver$(): Observable<number> {
    return this.alertas$.asObservable();
  }

  /**
   * Marcar alerta como resuelta
   */
  marcarAlertaResuelta(alertaId: number): Observable<void> {
    return this.http.post<void>(`/api/dispositivos/alertas/${alertaId}/resolver`, {})
      .pipe(
        tap(() => {
          const alertas = this.alertas$.value;
          const alerta = alertas.find(a => a.id === alertaId);
          if (alerta) {
            alerta.resuelta = true;
            this.alertas$.next([...alertas]);
          }
        })
      );
  }

  /**
   * Registrar nuevo dispositivo
   */
  registrarDispositivo(datos: any): Observable<Dispositivo> {
    return this.http.post<Dispositivo>('/api/dispositivos/registrar', datos)
      .pipe(
        tap(dispositivo => {
          const dispositivos = this.dispositivos$.value;
          this.dispositivos$.next([...dispositivos, dispositivo]);
        })
      );
  }

  /**
   * Actualizar nombre/ubicación de dispositivo
   */
  actualizarDispositivo(id: number, datos: any): Observable<Dispositivo> {
    return this.http.put<Dispositivo>(`/api/dispositivos/${id}`, datos)
      .pipe(
        tap(dispositivo => {
          const dispositivos = this.dispositivos$.value;
          const index = dispositivos.findIndex(d => d.id === id);
          if (index !== -1) {
            dispositivos[index] = dispositivo;
            this.dispositivos$.next([...dispositivos]);
          }
        })
      );
  }

  /**
   * Eliminar dispositivo
   */
  eliminarDispositivo(id: number): Observable<void> {
    return this.http.delete<void>(`/api/dispositivos/${id}`)
      .pipe(
        tap(() => {
          const dispositivos = this.dispositivos$.value.filter(d => d.id !== id);
          this.dispositivos$.next(dispositivos);
        })
      );
  }

  /**
   * Obtener estadísticas de un dispositivo
   */
  obtenerEstadisticas(id: number): Observable<any> {
    return this.http.get(`/api/dispositivos/${id}/estadisticas`);
  }

  /**
   * Obtener historial de errores
   */
  obtenerHistorialErrores(id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/dispositivos/${id}/errores`);
  }

  /**
   * Forzar prueba de salud inmediata
   */
  forzarPruebaSalud(id: number): Observable<any> {
    return this.http.post(`/api/dispositivos/${id}/prueba-salud`, {})
      .pipe(
        tap((resultado: any) => {
          this.procesarResultadosPruebas({ [id]: resultado });
        })
      );
  }

  /**
   * Obtener estado general del sistema
   */
  obtenerEstadoGeneral(): Observable<{
    totalDispositivos: number;
    activosCount: number;
    inactivosCount: number;
    errorCount: number;
    uptimePromedio: number;
  }> {
    const dispositivos = this.dispositivos$.value;
    return new Observable(observer => {
      const estadoGeneral = {
        totalDispositivos: dispositivos.length,
        activosCount: dispositivos.filter(d => d.estado === 'ACTIVO').length,
        inactivosCount: dispositivos.filter(d => d.estado === 'INACTIVO').length,
        errorCount: dispositivos.filter(d => d.estado === 'ERROR').length,
        uptimePromedio: dispositivos.length > 0
          ? dispositivos.reduce((sum, d) => sum + d.estadisticas.uptime, 0) / dispositivos.length
          : 0
      };
      observer.next(estadoGeneral);
      observer.complete();
    });
  }
}
