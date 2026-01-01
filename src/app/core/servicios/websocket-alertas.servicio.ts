import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alerta {
  id?: number;
  tipo: 'CRITICA' | 'ADVERTENCIA' | 'INFO' | 'EXITO';
  titulo: string;
  descripcion?: string;
  estado: 'ACTIVA' | 'RESUELTA' | 'IGNORADA' | 'ESCALADA' | 'EN_INVESTIGACION';
  origen: string;
  fechaCreacion?: Date;
  fechaResolucion?: Date;
  usuarioResolucion?: string;
  descripcionResolucion?: string;
  detalles?: Record<string, any>;
  prioridad: number;
  dispositivoId?: string;
  usuarioId?: string;
  notificadoAUsuario?: boolean;
  fechaNotificacion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioWebSocketAlertas {
  private apiUrl = `${environment.apiUrl}/mantenimiento/alertas`;
  private stompClient: any = null;
  private conectado = signal(false);
  private alertasActualesSignal = signal<Alerta[]>([]);
  private alertasCriticasSignal = signal<Alerta[]>([]);

  private nuevaAlertaSubject = new BehaviorSubject<Alerta | null>(null);
  private resolucionAlertaSubject = new BehaviorSubject<Alerta | null>(null);
  private escalamientoAlertaSubject = new BehaviorSubject<Alerta | null>(null);

  readonly alertasActuales = this.alertasActualesSignal.asReadonly();
  readonly alertasCriticas = this.alertasCriticasSignal.asReadonly();
  readonly conectadoWebSocket = this.conectado.asReadonly();

  constructor(private http: HttpClient) {
    this.inicializarWebSocket();
  }

  /**
   * Inicializa la conexión WebSocket
   */
  private inicializarWebSocket(): void {
    try {
      const socket = new SockJS(`${environment.apiUrl}/ws/alertas`);
      this.stompClient = Stomp.over(socket);

      this.stompClient.connect(
        {},
        (frame: any) => {
          this.conectado.set(true);
          console.log('WebSocket conectado:', frame);
          this.suscribirseAAlertas();
          this.suscribirseAAlertas Criticas();
          this.suscribirseAResolucionesAlertas();
          this.suscribirseAEscalamientosAlertas();
        },
        (error: any) => {
          console.error('Error en WebSocket:', error);
          this.conectado.set(false);
          setTimeout(() => this.inicializarWebSocket(), 5000);
        }
      );
    } catch (error) {
      console.error('Error inicializando WebSocket:', error);
    }
  }

  /**
   * Se suscribe a alertas en tiempo real
   */
  private suscribirseAAlertas(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe('/topic/alertas', (message: any) => {
        const alerta = JSON.parse(message.body);
        this.procesarNuevaAlerta(alerta);
        this.nuevaAlertaSubject.next(alerta);
      });
    }
  }

  /**
   * Se suscribe a alertas críticas en tiempo real
   */
  private suscribirseAAlertas Criticas(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe('/topic/alertas/criticas', (message: any) => {
        const alerta = JSON.parse(message.body);
        const criticas = this.alertasCriticasSignal();
        this.alertasCriticasSignal.set([alerta, ...criticas]);
      });
    }
  }

  /**
   * Se suscribe a resoluciones de alertas
   */
  private suscribirseAResolucionesAlertas(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe('/topic/alertas/resueltas', (message: any) => {
        const alerta = JSON.parse(message.body);
        this.resolucionAlertaSubject.next(alerta);
        this.actualizarAlertaEnLista(alerta);
      });
    }
  }

  /**
   * Se suscribe a escalamientos de alertas
   */
  private suscribirseAEscalamientosAlertas(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe('/topic/alertas/escaladas', (message: any) => {
        const alerta = JSON.parse(message.body);
        this.escalamientoAlertaSubject.next(alerta);
        this.actualizarAlertaEnLista(alerta);
      });
    }
  }

  /**
   * Procesa una nueva alerta
   */
  private procesarNuevaAlerta(alerta: Alerta): void {
    const actuales = this.alertasActualesSignal();
    if (!actuales.find(a => a.id === alerta.id)) {
      this.alertasActualesSignal.set([alerta, ...actuales]);
    }
  }

  /**
   * Actualiza una alerta en la lista
   */
  private actualizarAlertaEnLista(alerta: Alerta): void {
    const actuales = this.alertasActualesSignal();
    const index = actuales.findIndex(a => a.id === alerta.id);
    if (index !== -1) {
      actuales[index] = alerta;
      this.alertasActualesSignal.set([...actuales]);
    }
  }

  /**
   * Obtiene todas las alertas activas
   */
  obtenerAlertasActivas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/activas`);
  }

  /**
   * Obtiene alertas críticas
   */
  obtenerAlertasCriticas(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(`${this.apiUrl}/criticas`);
  }

  /**
   * Obtiene una alerta por ID
   */
  obtenerAlerta(id: number): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/${id}`);
  }

  /**
   * Resuelve una alerta
   */
  resolverAlerta(id: number, usuarioId: string, descripcion?: string): Observable<Alerta> {
    return this.http.put<Alerta>(`${this.apiUrl}/${id}/resolver`, null, {
      params: {
        usuarioId,
        descripcion: descripcion || ''
      }
    });
  }

  /**
   * Escala una alerta
   */
  escalarAlerta(id: number): Observable<Alerta> {
    return this.http.put<Alerta>(`${this.apiUrl}/${id}/escalar`, null);
  }

  /**
   * Ignora una alerta
   */
  ignorarAlerta(id: number): Observable<Alerta> {
    return this.http.put<Alerta>(`${this.apiUrl}/${id}/ignorar`, null);
  }

  /**
   * Observable para nuevas alertas
   */
  public nuevaAlerta$(): Observable<Alerta | null> {
    return this.nuevaAlertaSubject.asObservable();
  }

  /**
   * Observable para resoluciones
   */
  public resolucionAlerta$(): Observable<Alerta | null> {
    return this.resolucionAlertaSubject.asObservable();
  }

  /**
   * Observable para escalamientos
   */
  public escalamientoAlerta$(): Observable<Alerta | null> {
    return this.escalamientoAlertaSubject.asObservable();
  }

  /**
   * Desconecta WebSocket
   */
  desconectar(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        this.conectado.set(false);
        console.log('WebSocket desconectado');
      });
    }
  }

  /**
   * Reconecta WebSocket
   */
  reconectar(): void {
    this.desconectar();
    setTimeout(() => this.inicializarWebSocket(), 1000);
  }
}
