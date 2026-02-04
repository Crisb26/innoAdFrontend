/**
 * 🔌 SERVICIO HARDWARE API - CONTROL DE RASPBERRY PI
 * Endpoints para gestionar dispositivos IoT y contenido remoto
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { throwError } from 'rxjs';

export interface DispositivoIoT {
  id: string;
  nombre: string;
  tipo: 'raspberry_pi' | 'digital_signage' | 'speaker' | 'camera';
  estado: 'online' | 'offline' | 'error';
  ubicacion: string;
  ipAddress: string;
  macAddress: string;
  ultimaConexion: Date;
  versionSoftware: string;
  especificaciones: {
    procesador: string;
    memoria: string;
    almacenamiento: string;
    resolucion?: string;
  };
  sensores?: {
    temperatura: number;
    humedad: number;
    presion: number;
  };
}

export interface ContenidoRemoto {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'video' | 'imagen' | 'audio' | 'presentacion';
  url: string;
  duracion?: number; // segundos
  tamaño: number; // bytes
  fechaCreacion: Date;
  dispositivos: string[]; // IDs de dispositivos asignados
  estado: 'programado' | 'en_ejecucion' | 'completado';
  progreso: number; // 0-100
}

export interface ComandoDispositivo {
  id: string;
  dispositivoId: string;
  tipo: 'reproducir' | 'pausar' | 'detener' | 'reiniciar' | 'actualizar' | 'personalizado';
  parametros: Record<string, any>;
  estado: 'pendiente' | 'ejecutado' | 'error';
  respuesta?: any;
  timestamp: Date;
}

export interface EstadisticasDispositivo {
  dispositivoId: string;
  tiempoActividad: number; // horas
  confiabilidad: number; // porcentaje
  commandosEjecutados: number;
  ultimoError?: string;
  anchodeBanda: number; // Mbps
  usoCPU: number; // porcentaje
  usoMemoria: number; // porcentaje
  temperatura: number; // celsius
}

@Injectable({
  providedIn: 'root',
})
export class ServicioHardwareAPI {
  private apiUrl = `${environment.apiUrl}/hardware`;
  private dispositivosSubject = new BehaviorSubject<DispositivoIoT[]>([]);
  private contenidoSubject = new BehaviorSubject<ContenidoRemoto[]>([]);
  private estadoConexionSubject = new BehaviorSubject<boolean>(false);
  private metricsSubject = new Subject<EstadisticasDispositivo[]>();

  public dispositivos$ = this.dispositivosSubject.asObservable();
  public contenido$ = this.contenidoSubject.asObservable();
  public estadoConexion$ = this.estadoConexionSubject.asObservable();
  public metrics$ = this.metricsSubject.asObservable();

  private wsConexion?: WebSocket;
  private reconectarIntento = 0;
  private maxReconectar = 5;

  constructor(private http: HttpClient) {
    this.inicializarConexion();
  }

  /**
   * Inicializar conexión WebSocket para tiempo real
   */
  private inicializarConexion(): void {
    const protocolo = environment.apiUrl.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${protocolo}://${window.location.host}/hardware/ws`;

    try {
      this.wsConexion = new WebSocket(wsUrl);

      this.wsConexion.onopen = () => {
        console.log('WebSocket conectado');
        this.estadoConexionSubject.next(true);
        this.reconectarIntento = 0;
      };

      this.wsConexion.onmessage = (event) => {
        const datos = JSON.parse(event.data);
        this.procesarMensajeWS(datos);
      };

      this.wsConexion.onerror = (error) => {
        console.error('Error WebSocket:', error);
        this.estadoConexionSubject.next(false);
      };

      this.wsConexion.onclose = () => {
        console.log('WebSocket desconectado');
        this.estadoConexionSubject.next(false);
        this.intentarReconectar();
      };
    } catch (error) {
      console.error('Error al inicializar WebSocket:', error);
    }
  }

  /**
   * Procesar mensajes WebSocket
   */
  private procesarMensajeWS(datos: any): void {
    switch (datos.tipo) {
      case 'estado_dispositivo':
        this.actualizarEstadoDispositivo(datos.dispositivo);
        break;

      case 'progreso_contenido':
        this.actualizarProgresoContenido(datos.contenido);
        break;

      case 'metricas':
        this.metricsSubject.next(datos.metricas);
        break;

      case 'alerta':
        console.warn('Alerta del dispositivo:', datos.mensaje);
        break;
    }
  }

  /**
   * Intentar reconectar WebSocket
   */
  private intentarReconectar(): void {
    if (this.reconectarIntento < this.maxReconectar) {
      this.reconectarIntento++;
      const delay = Math.pow(2, this.reconectarIntento) * 1000;
      setTimeout(() => this.inicializarConexion(), delay);
    }
  }

  /**
   * DISPOSITIVOS - Obtener lista
   */
  obtenerDispositivos(): Observable<DispositivoIoT[]> {
    return this.http.get<DispositivoIoT[]>(`${this.apiUrl}/dispositivos`).pipe(
      tap((dispositivos) => {
        this.dispositivosSubject.next(dispositivos);
      }),
      catchError((error) => {
        console.error('Error al obtener dispositivos:', error);
        return throwError(() => new Error('No se pudieron obtener dispositivos'));
      })
    );
  }

  /**
   * DISPOSITIVOS - Obtener uno específico
   */
  obtenerDispositivo(dispositivoId: string): Observable<DispositivoIoT> {
    return this.http.get<DispositivoIoT>(`${this.apiUrl}/dispositivos/${dispositivoId}`).pipe(
      catchError((error) => {
        console.error('Error al obtener dispositivo:', error);
        return throwError(() => new Error('No se pudo obtener el dispositivo'));
      })
    );
  }

  /**
   * DISPOSITIVOS - Registrar nuevo
   */
  registrarDispositivo(dispositivo: Partial<DispositivoIoT>): Observable<DispositivoIoT> {
    return this.http.post<DispositivoIoT>(`${this.apiUrl}/dispositivos`, dispositivo).pipe(
      tap((nuevoDispositivo) => {
        const dispositivos = this.dispositivosSubject.value;
        this.dispositivosSubject.next([...dispositivos, nuevoDispositivo]);
      }),
      catchError((error) => {
        console.error('Error al registrar dispositivo:', error);
        return throwError(() => new Error('No se pudo registrar el dispositivo'));
      })
    );
  }

  /**
   * DISPOSITIVOS - Actualizar información
   */
  actualizarDispositivo(dispositivoId: string, datos: Partial<DispositivoIoT>): Observable<DispositivoIoT> {
    return this.http.put<DispositivoIoT>(`${this.apiUrl}/dispositivos/${dispositivoId}`, datos).pipe(
      tap((dispositivo) => {
        const dispositivos = this.dispositivosSubject.value.map((d) =>
          d.id === dispositivoId ? dispositivo : d
        );
        this.dispositivosSubject.next(dispositivos);
      }),
      catchError((error) => {
        console.error('Error al actualizar dispositivo:', error);
        return throwError(() => new Error('No se pudo actualizar el dispositivo'));
      })
    );
  }

  /**
   * DISPOSITIVOS - Eliminar
   */
  eliminarDispositivo(dispositivoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dispositivos/${dispositivoId}`).pipe(
      tap(() => {
        const dispositivos = this.dispositivosSubject.value.filter((d) => d.id !== dispositivoId);
        this.dispositivosSubject.next(dispositivos);
      }),
      catchError((error) => {
        console.error('Error al eliminar dispositivo:', error);
        return throwError(() => new Error('No se pudo eliminar el dispositivo'));
      })
    );
  }

  /**
   * COMANDOS - Ejecutar comando en dispositivo
   */
  ejecutarComando(dispositivoId: string, tipo: string, parametros?: Record<string, any>): Observable<ComandoDispositivo> {
    const payload = { tipo, parametros };

    return this.http.post<ComandoDispositivo>(`${this.apiUrl}/dispositivos/${dispositivoId}/comando`, payload).pipe(
      catchError((error) => {
        console.error('Error al ejecutar comando:', error);
        return throwError(() => new Error('No se pudo ejecutar el comando'));
      })
    );
  }

  /**
   * COMANDOS - Reproducir contenido
   */
  reproducirContenido(dispositivoId: string, contenidoId: string): Observable<ComandoDispositivo> {
    return this.ejecutarComando(dispositivoId, 'reproducir', { contenidoId });
  }

  /**
   * COMANDOS - Pausar reproducción
   */
  pausarDispositivo(dispositivoId: string): Observable<ComandoDispositivo> {
    return this.ejecutarComando(dispositivoId, 'pausar');
  }

  /**
   * COMANDOS - Detener reproducción
   */
  detenerDispositivo(dispositivoId: string): Observable<ComandoDispositivo> {
    return this.ejecutarComando(dispositivoId, 'detener');
  }

  /**
   * COMANDOS - Reiniciar dispositivo
   */
  reiniciarDispositivo(dispositivoId: string): Observable<ComandoDispositivo> {
    return this.ejecutarComando(dispositivoId, 'reiniciar');
  }

  /**
   * COMANDOS - Actualizar software
   */
  actualizarSoftware(dispositivoId: string): Observable<ComandoDispositivo> {
    return this.ejecutarComando(dispositivoId, 'actualizar');
  }

  /**
   * CONTENIDO - Obtener lista
   */
  obtenerContenido(): Observable<ContenidoRemoto[]> {
    return this.http.get<ContenidoRemoto[]>(`${this.apiUrl}/contenido`).pipe(
      tap((contenido) => {
        this.contenidoSubject.next(contenido);
      }),
      catchError((error) => {
        console.error('Error al obtener contenido:', error);
        return throwError(() => new Error('No se pudo obtener contenido'));
      })
    );
  }

  /**
   * CONTENIDO - Subir nuevo contenido
   */
  subirContenido(archivo: File, metadata: Partial<ContenidoRemoto>): Observable<ContenidoRemoto> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('metadata', JSON.stringify(metadata));

    return this.http.post<ContenidoRemoto>(`${this.apiUrl}/contenido`, formData).pipe(
      tap((contenido) => {
        const contenidos = this.contenidoSubject.value;
        this.contenidoSubject.next([...contenidos, contenido]);
      }),
      catchError((error) => {
        console.error('Error al subir contenido:', error);
        return throwError(() => new Error('No se pudo subir el contenido'));
      })
    );
  }

  /**
   * CONTENIDO - Asignar a dispositivos
   */
  asignarContenidoADispositivos(
    contenidoId: string,
    dispositivoIds: string[],
    programacion?: { fechaInicio: Date; fechaFin?: Date }
  ): Observable<ContenidoRemoto> {
    const payload = { dispositivoIds, programacion };

    return this.http.post<ContenidoRemoto>(`${this.apiUrl}/contenido/${contenidoId}/asignar`, payload).pipe(
      catchError((error) => {
        console.error('Error al asignar contenido:', error);
        return throwError(() => new Error('No se pudo asignar contenido'));
      })
    );
  }

  /**
   * CONTENIDO - Eliminar
   */
  eliminarContenido(contenidoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contenido/${contenidoId}`).pipe(
      tap(() => {
        const contenido = this.contenidoSubject.value.filter((c) => c.id !== contenidoId);
        this.contenidoSubject.next(contenido);
      }),
      catchError((error) => {
        console.error('Error al eliminar contenido:', error);
        return throwError(() => new Error('No se pudo eliminar el contenido'));
      })
    );
  }

  /**
   * ESTADÍSTICAS - Obtener métricas de dispositivo
   */
  obtenerEstadisticas(dispositivoId: string): Observable<EstadisticasDispositivo> {
    return this.http.get<EstadisticasDispositivo>(`${this.apiUrl}/dispositivos/${dispositivoId}/estadisticas`).pipe(
      catchError((error) => {
        console.error('Error al obtener estadísticas:', error);
        return throwError(() => new Error('No se pudieron obtener estadísticas'));
      })
    );
  }

  /**
   * SINCRONIZACIÓN - Forzar sincronización
   */
  sincronizar(dispositivoId: string): Observable<{ mensaje: string; timestamp: Date }> {
    return this.http.post<{ mensaje: string; timestamp: Date }>(`${this.apiUrl}/dispositivos/${dispositivoId}/sincronizar`, {}).pipe(
      catchError((error) => {
        console.error('Error en sincronización:', error);
        return throwError(() => new Error('Error en sincronización'));
      })
    );
  }

  /**
   * DIAGNÓSTICO - Ejecutar test de conexión
   */
  testConexion(dispositivoId: string): Observable<{ conectado: boolean; latencia: number; mensajes?: string[] }> {
    return this.http
      .get<{ conectado: boolean; latencia: number; mensajes?: string[] }>(
        `${this.apiUrl}/dispositivos/${dispositivoId}/test`
      )
      .pipe(
        catchError((error) => {
          console.error('Error en test de conexión:', error);
          return throwError(() => new Error('Error en test de conexión'));
        })
      );
  }

  /**
   * Actualizar estado de dispositivo (local)
   */
  private actualizarEstadoDispositivo(dispositivo: DispositivoIoT): void {
    const dispositivos = this.dispositivosSubject.value.map((d) => (d.id === dispositivo.id ? dispositivo : d));
    this.dispositivosSubject.next(dispositivos);
  }

  /**
   * Actualizar progreso de contenido (local)
   */
  private actualizarProgresoContenido(contenido: ContenidoRemoto): void {
    const contenidos = this.contenidoSubject.value.map((c) => (c.id === contenido.id ? contenido : c));
    this.contenidoSubject.next(contenidos);
  }

  /**
   * Desconectar WebSocket
   */
  desconectar(): void {
    if (this.wsConexion) {
      this.wsConexion.close();
    }
  }
}
