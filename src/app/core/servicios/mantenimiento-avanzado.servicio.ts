import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, throwError } from 'rxjs';
import { switchMap, tap, catchError, startWith, shareReplay } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { HttpBaseService } from './http-base.servicio';
import { ServicioWebSocketAlertas, Alerta as AlertaWebSocket } from './websocket-alertas.servicio';
import {
  ConfiguracionMantenimiento,
  Alerta,
  EstadoSistema,
  ConfiguracionRaspberryPi,
  EventoMantenimiento,
  DatosMonitoreo,
  RespuestaConfiguracionMantenimiento,
  AccionAlerta,
  TipoAlerta,
  EstadoAlerta
} from '@modulos/mantenimiento/modelos/mantenimiento.modelo';
import { RespuestaAPI } from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioMantenimientoAvanzado {
  private readonly http = inject(HttpClient);
  private readonly httpBase = inject(HttpBaseService);

  private readonly BASE_URL = `${environment.apiUrl}/mantenimiento`;
  
  // Estado reactivo
  private configuracionSignal = signal<ConfiguracionMantenimiento | null>(null);
  private alertasSignal = signal<Alerta[]>([]);
  private estadoSistemaSignal = signal<EstadoSistema | null>(null);
  private dispositivosSignal = signal<ConfiguracionRaspberryPi[]>([]);
  private monitoreoSignal = signal<DatosMonitoreo | null>(null);
  private modoMantenimientoActivoSignal = signal<boolean>(false);
  private cargandoSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed para dashboard
  public readonly configuracion = this.configuracionSignal.asReadonly();
  public readonly alertas = this.alertasSignal.asReadonly();
  public readonly estadoSistema = this.estadoSistemaSignal.asReadonly();
  public readonly dispositivos = this.dispositivosSignal.asReadonly();
  public readonly monitoreo = this.monitoreoSignal.asReadonly();
  public readonly modoMantenimientoActivo = this.modoMantenimientoActivoSignal.asReadonly();
  public readonly cargando = this.cargandoSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();

  // Computed avanzados
  public readonly alertasCriticas = computed(() => 
    this.alertasSignal().filter(a => a.tipo === TipoAlerta.CRITICA).length
  );
  public readonly alertasAdvertencia = computed(() => 
    this.alertasSignal().filter(a => a.tipo === TipoAlerta.ADVERTENCIA).length
  );
  public readonly dispositivosConectados = computed(() => 
    this.dispositivosSignal().filter(d => d.estadoConexion === 'CONECTADO').length
  );
  public readonly saludSistema = computed(() => 
    this.estadoSistemaSignal()?.salud ?? 0
  );

  // Subject para WebSocket en tiempo real
  private alertasEnTiempoRealSubject = new BehaviorSubject<Alerta[]>([]);
  public alertasEnTiempoReal$ = this.alertasEnTiempoRealSubject.asObservable();

  // Demonio de verificación
  private demonioVerificacionIntervalo: any;
  private demonioActivo = false;

  constructor() {
    this.inicializarDemonio();
  }

  /**
   * Inicializa el demonio de verificación del sistema
   */
  private inicializarDemonio(): void {
    if (!this.demonioActivo && this.modoMantenimientoActivoSignal()) {
      this.iniciarDemonio();
    }
  }

  /**
   * Inicia el demonio de verificación
   */
  public iniciarDemonio(): void {
    if (this.demonioActivo) return;

    this.demonioActivo = true;
    const intervaloSegundos = this.configuracionSignal()?.intervaloVerificacion || 30;

    this.demonioVerificacionIntervalo = interval(intervaloSegundos * 1000)
      .pipe(
        startWith(0),
        switchMap(() => this.verificarSistema()),
        shareReplay(1)
      )
      .subscribe({
        next: (datos) => {
          this.actualizarEstado(datos);
          this.verificarAlertas(datos);
        },
        error: (err) => {
          this.errorSignal.set('Error en el demonio de verificación');
          console.error('Error en demonio:', err);
          this.demonioActivo = false;
        }
      });
  }

  /**
   * Detiene el demonio de verificación
   */
  public detenerDemonio(): void {
    if (this.demonioVerificacionIntervalo) {
      this.demonioVerificacionIntervalo.unsubscribe();
    }
    this.demonioActivo = false;
  }

  /**
   * Carga la configuración inicial de mantenimiento
   */
  public cargarConfiguracionMantenimiento(): Observable<RespuestaConfiguracionMantenimiento> {
    this.cargandoSignal.set(true);
    return this.http.get<RespuestaAPI<RespuestaConfiguracionMantenimiento>>(
      `${this.BASE_URL}/configuracion`
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          const datos = respuesta.datos;
          this.configuracionSignal.set(datos.configuracion);
          this.estadoSistemaSignal.set(datos.estadoSistema);
          this.alertasSignal.set(datos.alertasActivas);
          this.dispositivosSignal.set(datos.dispositivos);
          this.monitoreoSignal.set(datos.ultimoMonitoreo);
          this.modoMantenimientoActivoSignal.set(datos.configuracion.modoActivo);
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al cargar configuración');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Verifica el estado actual del sistema
   */
  public verificarSistema(): Observable<RespuestaConfiguracionMantenimiento> {
    return this.http.get<RespuestaAPI<RespuestaConfiguracionMantenimiento>>(
      `${this.BASE_URL}/verificar`
    ).pipe(
      catchError(err => {
        console.error('Error verificando sistema:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza el estado basado en datos de verificación
   */
  private actualizarEstado(datos: RespuestaConfiguracionMantenimiento): void {
    this.estadoSistemaSignal.set(datos.estadoSistema);
    this.monitoreoSignal.set(datos.ultimoMonitoreo);
    
    if (datos.alertasActivas.length > 0) {
      this.alertasSignal.set(datos.alertasActivas);
    }
    
    if (datos.dispositivos.length > 0) {
      this.dispositivosSignal.set(datos.dispositivos);
    }
  }

  /**
   * Verifica alertas y emite notificaciones
   */
  private verificarAlertas(datos: RespuestaConfiguracionMantenimiento): void {
    const alertasActivas = datos.alertasActivas || [];
    
    if (alertasActivas.length > 0) {
      this.alertasEnTiempoRealSubject.next(alertasActivas);
      
      // Emitir notificaciones según tipo
      alertasActivas.forEach(alerta => {
        if (alerta.tipo === TipoAlerta.CRITICA) {
          this.notificarAlerta(alerta, 'Alerta Crítica');
        } else if (alerta.tipo === TipoAlerta.ADVERTENCIA) {
          this.notificarAlerta(alerta, 'Advertencia del Sistema');
        }
      });
    }
  }

  /**
   * Notifica al usuario sobre una alerta
   */
  private notificarAlerta(alerta: Alerta, titulo: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, {
        body: alerta.descripcion,
        icon: '/assets/iconos/alerta.png',
        badge: '/assets/iconos/badge.png',
        tag: `alerta-${alerta.id}`
      });
    }
  }

  /**
   * Activa/Desactiva el modo de mantenimiento
   */
  public cambiarModoMantenimiento(activo: boolean): Observable<RespuestaAPI<ConfiguracionMantenimiento>> {
    const url = `${this.BASE_URL}/modo-mantenimiento/${activo ? 'activar' : 'desactivar'}`;
    return this.http.post<RespuestaAPI<ConfiguracionMantenimiento>>(url, {}).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          this.modoMantenimientoActivoSignal.set(activo);
          if (activo) {
            this.iniciarDemonio();
          } else {
            this.detenerDemonio();
          }
          this.errorSignal.set(null);
        }
      }),
      catchError(err => {
        this.errorSignal.set('Error al cambiar modo de mantenimiento');
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene todas las alertas activas
   */
  public obtenerAlertas(estado?: EstadoAlerta): Observable<RespuestaAPI<Alerta[]>> {
    const params = estado ? { estado } : {};
    return this.http.get<RespuestaAPI<Alerta[]>>(
      `${this.BASE_URL}/alertas`,
      { params }
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.alertasSignal.set(respuesta.datos);
        }
      }),
      catchError(err => {
        this.errorSignal.set('Error al obtener alertas');
        return throwError(() => err);
      })
    );
  }

  /**
   * Resuelve una alerta
   */
  public resolverAlerta(alertaId: number, descripcion: string): Observable<RespuestaAPI<Alerta>> {
    return this.http.post<RespuestaAPI<Alerta>>(
      `${this.BASE_URL}/alertas/${alertaId}/resolver`,
      { descripcion }
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          this.actualizarAletaLocal(respuesta.datos!);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Ejecuta una acción en una alerta
   */
  public ejecutarAccionAlerta(alertaId: number, accion: AccionAlerta): Observable<RespuestaAPI<Alerta>> {
    return this.http.post<RespuestaAPI<Alerta>>(
      `${this.BASE_URL}/alertas/${alertaId}/acciones`,
      accion
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Obtiene dispositivos Raspberry Pi conectados
   */
  public obtenerDispositivos(): Observable<RespuestaAPI<ConfiguracionRaspberryPi[]>> {
    return this.http.get<RespuestaAPI<ConfiguracionRaspberryPi[]>>(
      `${this.BASE_URL}/dispositivos`
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.dispositivosSignal.set(respuesta.datos);
        }
      }),
      catchError(err => {
        this.errorSignal.set('Error al obtener dispositivos');
        return throwError(() => err);
      })
    );
  }

  /**
   * Agrega un nuevo dispositivo Raspberry Pi
   */
  public agregarDispositivo(config: Partial<ConfiguracionRaspberryPi>): Observable<RespuestaAPI<ConfiguracionRaspberryPi>> {
    return this.http.post<RespuestaAPI<ConfiguracionRaspberryPi>>(
      `${this.BASE_URL}/dispositivos`,
      config
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          const dispositivosActuales = this.dispositivosSignal();
          this.dispositivosSignal.set([...dispositivosActuales, respuesta.datos!]);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Actualiza un dispositivo Raspberry Pi
   */
  public actualizarDispositivo(id: number, config: Partial<ConfiguracionRaspberryPi>): Observable<RespuestaAPI<ConfiguracionRaspberryPi>> {
    return this.http.put<RespuestaAPI<ConfiguracionRaspberryPi>>(
      `${this.BASE_URL}/dispositivos/${id}`,
      config
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          this.actualizarDispositivoLocal(respuesta.datos!);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Elimina un dispositivo Raspberry Pi
   */
  public eliminarDispositivo(id: number): Observable<RespuestaAPI<void>> {
    return this.http.delete<RespuestaAPI<void>>(
      `${this.BASE_URL}/dispositivos/${id}`
    ).pipe(
      tap(() => {
        const dispositivosActuales = this.dispositivosSignal();
        this.dispositivosSignal.set(dispositivosActuales.filter(d => d.id !== id));
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Obtiene el historial de eventos de mantenimiento
   */
  public obtenerHistorial(limites?: { pagina?: number; tamaño?: number }): Observable<RespuestaAPI<EventoMantenimiento[]>> {
    return this.http.get<RespuestaAPI<EventoMantenimiento[]>>(
      `${this.BASE_URL}/historial`,
      { params: limites || {} }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Obtiene datos de monitoreo en tiempo real
   */
  public obtenerMonitoreoRealtime(): Observable<DatosMonitoreo> {
    return this.http.get<RespuestaAPI<DatosMonitoreo>>(
      `${this.BASE_URL}/monitoreo/realtime`
    ).pipe(
      switchMap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.monitoreoSignal.set(respuesta.datos);
          return new Observable(obs => {
            obs.next(respuesta.datos);
            obs.complete();
          });
        }
        return throwError(() => new Error('Sin datos'));
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Actualiza la alerta en el estado local
   */
  private actualizarAletaLocal(alertaActualizada: Alerta): void {
    const alertasActuales = this.alertasSignal();
    const index = alertasActuales.findIndex(a => a.id === alertaActualizada.id);
    if (index !== -1) {
      alertasActuales[index] = alertaActualizada;
      this.alertasSignal.set([...alertasActuales]);
    }
  }

  /**
   * Actualiza el dispositivo en el estado local
   */
  private actualizarDispositivoLocal(dispositivoActualizado: ConfiguracionRaspberryPi): void {
    const dispositivosActuales = this.dispositivosSignal();
    const index = dispositivosActuales.findIndex(d => d.id === dispositivoActualizado.id);
    if (index !== -1) {
      dispositivosActuales[index] = dispositivoActualizado;
      this.dispositivosSignal.set([...dispositivosActuales]);
    }
  }

  /**
   * Solicita permisos para notificaciones
   */
  public solicitarPermisosNotificaciones(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  /**
   * Destruye los recursos cuando el servicio se destruye
   */
  ngOnDestroy(): void {
    this.detenerDemonio();
  }
}
