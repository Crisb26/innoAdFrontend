import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RxStomp } from '@stomp/rx-stomp';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicioChat } from '../../servicios/servicio-chat.service';

/**
 * Interfaz para mensajes de chat
 */
interface Mensaje {
  id?: number;
  idChat: number;
  idUsuario: number;
  nombreUsuario: string;
  contenido: string;
  timestamp: number;
  leido: boolean;
  estado: 'ENVIANDO' | 'ENVIADO' | 'ERROR';
  tipo?: string;
}

/**
 * Interfaz para notificaciones de presencia
 */
interface NotificacionPresencia {
  idChat: number;
  idUsuario: number;
  nombreUsuario: string;
  tipo: 'ESCRIBIENDO' | 'PARAR_ESCRIBIR';
}

/**
 * Componente de Chat con WebSocket en tiempo real
 */
@Component({
  selector: 'app-panel-chat',
  templateUrl: './panel-chat.component.html',
  styleUrls: ['./panel-chat.component.scss']
})
export class PanelChatComponent implements OnInit, OnDestroy {
  
  // ViewChild para scroll automático
  @ViewChild('contenedorMensajes') contenedorMensajes: ElementRef<HTMLDivElement>;
  
  // Datos de la conversación
  idChat: number;
  idUsuarioActual: number;
  nombreUsuarioActual: string = 'Tú';
  
  // Lista de mensajes
  mensajes: Mensaje[] = [];
  mensajeNuevo: string = '';
  
  // Estado de la conexión
  conectado: boolean = false;
  cargando: boolean = false;
  error: string = null;
  
  // WebSocket
  private rxStomp: RxStomp;
  private suscripcionMensajes: Subscription;
  private suscripcionPresencia: Subscription;
  
  // Para destruir suscripciones
  private destruir$ = new Subject<void>();
  
  // Usuarios escribiendo
  usuariosEscribiendo: Set<number> = new Set();
  
  // Timeout para indicador de escritura
  private timeoutEscritura: any;
  
  constructor(
    private ruta: ActivatedRoute,
    private servicioChat: ServicioChat
  ) {
    this.rxStomp = new RxStomp();
  }
  
  ngOnInit(): void {
    // Obtener ID del chat de la ruta
    this.idChat = parseInt(this.ruta.snapshot.paramMap.get('idChat'), 10);
    
    // Obtener datos del usuario actual (desde session storage o servicio)
    this.idUsuarioActual = parseInt(sessionStorage.getItem('idUsuario'), 10);
    this.nombreUsuarioActual = sessionStorage.getItem('nombreUsuario') || 'Usuario';
    
    // Cargar historial inicial
    this.cargarHistorialMensajes();
    
    // Conectar WebSocket
    this.conectarWebSocket();
  }
  
  /**
   * Carga el historial de mensajes del servidor
   */
  private cargarHistorialMensajes(): void {
    this.cargando = true;
    
    this.servicioChat.obtenerMensajes(this.idChat, 0, 50)
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (respuesta: any) => {
          // Convertir mensajes de BD a formato de componente
          this.mensajes = respuesta.content.map((msg: any) => ({
            id: msg.id,
            idChat: msg.idChatUsuario,
            idUsuario: msg.idUsuarioRemitente,
            nombreUsuario: msg.nombreUsuario || 'Usuario',
            contenido: msg.contenido,
            timestamp: new Date(msg.fechaCreacion).getTime(),
            leido: msg.leido,
            estado: 'ENVIADO'
          }));
          
          this.cargando = false;
          this.desplazarAlFinal();
        },
        (error) => {
          console.error('Error cargando historial:', error);
          this.error = 'Error cargando el historial de mensajes';
          this.cargando = false;
        }
      );
  }
  
  /**
   * Conecta al WebSocket
   */
  private conectarWebSocket(): void {
    this.rxStomp.configure({
      brokerURL: `${this.obtenerUrlWebSocket()}/ws/chat`,
      connectHeaders: {
        login: sessionStorage.getItem('token') || ''
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 5000,
      debug: (msg: string) => console.log(msg)
    });
    
    this.rxStomp.activate().then(
      () => {
        this.conectado = true;
        this.error = null;
        console.log('WebSocket conectado');
        
        // Suscribirse a mensajes del chat
        this.suscribirMensajes();
        
        // Suscribirse a notificaciones de presencia
        this.suscribirPresencia();
        
      },
      (error) => {
        this.conectado = false;
        this.error = 'Error conectando WebSocket: ' + error;
        console.error('Error WebSocket:', error);
        
        // Reintentar en 5 segundos
        setTimeout(() => this.conectarWebSocket(), 5000);
      }
    );
  }
  
  /**
   * Se suscribe a mensajes del chat
   */
  private suscribirMensajes(): void {
    this.suscripcionMensajes = this.rxStomp
      .watch(`/tema/chat/${this.idChat}`)
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (mensaje: any) => {
          const body = JSON.parse(mensaje.body);
          
          if (body.tipo === 'MENSAJE') {
            this.procesarMensajeNuevo(body);
          } else if (body.tipo === 'MARCADO_LEIDO') {
            this.marcarMensajesLeidos();
          } else if (body.tipo === 'CHAT_CERRADO') {
            this.mostrarChatCerrado();
          } else if (body.tipo === 'ERROR') {
            this.error = body.mensajeError;
          }
        }
      );
  }
  
  /**
   * Se suscribe a notificaciones de presencia (usuario escribiendo)
   */
  private suscribirPresencia(): void {
    this.suscripcionPresencia = this.rxStomp
      .watch(`/tema/presencia/${this.idChat}`)
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (notificacion: any) => {
          const body = JSON.parse(notificacion.body);
          
          if (body.tipo === 'ESCRIBIENDO') {
            this.usuariosEscribiendo.add(body.idUsuario);
          } else if (body.tipo === 'PARAR_ESCRIBIR') {
            this.usuariosEscribiendo.delete(body.idUsuario);
          }
        }
      );
  }
  
  /**
   * Procesa un nuevo mensaje recibido
   */
  private procesarMensajeNuevo(mensaje: any): void {
    const nuevoMensaje: Mensaje = {
      id: mensaje.idMensajeChat,
      idChat: mensaje.idChat,
      idUsuario: mensaje.idUsuario,
      nombreUsuario: mensaje.nombreUsuario,
      contenido: mensaje.contenido,
      timestamp: mensaje.timestamp || Date.now(),
      leido: false,
      estado: 'ENVIADO'
    };
    
    this.mensajes.push(nuevoMensaje);
    this.desplazarAlFinal();
    
    // Si el mensaje es de otro usuario, marcar como leído
    if (mensaje.idUsuario !== this.idUsuarioActual) {
      this.marcarChatComoLeido();
    }
  }
  
  /**
   * Envía un nuevo mensaje
   */
  enviarMensaje(): void {
    if (!this.mensajeNuevo.trim() || !this.conectado) {
      return;
    }
    
    // Crear mensaje local optimista
    const mensajeLocal: Mensaje = {
      idChat: this.idChat,
      idUsuario: this.idUsuarioActual,
      nombreUsuario: this.nombreUsuarioActual,
      contenido: this.mensajeNuevo,
      timestamp: Date.now(),
      leido: true,
      estado: 'ENVIANDO'
    };
    
    // Agregar a la lista inmediatamente (optimistic update)
    this.mensajes.push(mensajeLocal);
    this.desplazarAlFinal();
    
    // Notificar que dejó de escribir
    this.notificarParoEscritura();
    
    // Enviar al servidor
    const contenido = this.mensajeNuevo;
    this.mensajeNuevo = '';
    
    this.rxStomp.publish({
      destination: `/aplicacion/chat/${this.idChat}/mensaje`,
      body: JSON.stringify({
        idChat: this.idChat,
        idUsuario: this.idUsuarioActual,
        nombreUsuario: this.nombreUsuarioActual,
        contenido: contenido,
        timestamp: Date.now()
      })
    });
  }
  
  /**
   * Notifica que el usuario está escribiendo
   */
  notificarEscribiendo(): void {
    if (!this.conectado) return;
    
    // Limpiar timeout anterior
    if (this.timeoutEscritura) {
      clearTimeout(this.timeoutEscritura);
    }
    
    // Enviar notificación de escritura
    this.rxStomp.publish({
      destination: `/aplicacion/chat/${this.idChat}/escribiendo`,
      body: JSON.stringify({
        idChat: this.idChat,
        idUsuario: this.idUsuarioActual,
        nombreUsuario: this.nombreUsuarioActual
      })
    });
    
    // Enviar notificación de paro después de 2 segundos sin escribir
    this.timeoutEscritura = setTimeout(() => {
      this.notificarParoEscritura();
    }, 2000);
  }
  
  /**
   * Notifica que el usuario paró de escribir
   */
  private notificarParoEscritura(): void {
    if (!this.conectado) return;
    
    this.rxStomp.publish({
      destination: `/aplicacion/chat/${this.idChat}/dejo-de-escribir`,
      body: JSON.stringify({
        idChat: this.idChat,
        idUsuario: this.idUsuarioActual,
        nombreUsuario: this.nombreUsuarioActual
      })
    });
  }
  
  /**
   * Marca el chat como leído
   */
  private marcarChatComoLeido(): void {
    if (!this.conectado) return;
    
    this.rxStomp.publish({
      destination: `/aplicacion/chat/${this.idChat}/marcar-leido`,
      body: JSON.stringify({
        idChat: this.idChat,
        idUsuario: this.idUsuarioActual
      })
    });
  }
  
  /**
   * Marca todos los mensajes como leídos localmente
   */
  private marcarMensajesLeidos(): void {
    this.mensajes.forEach(msg => msg.leido = true);
  }
  
  /**
   * Cierra el chat
   */
  cerrarChat(): void {
    if (confirm('¿Estás seguro que deseas cerrar este chat?')) {
      this.rxStomp.publish({
        destination: `/aplicacion/chat/${this.idChat}/cerrar`,
        body: JSON.stringify({
          idChat: this.idChat,
          idUsuario: this.idUsuarioActual
        })
      });
    }
  }
  
  /**
   * Muestra que el chat fue cerrado
   */
  private mostrarChatCerrado(): void {
    this.error = 'Este chat ha sido cerrado';
    this.desconectarWebSocket();
  }
  
  /**
   * Desplaza el contenedor de mensajes al final
   */
  private desplazarAlFinal(): void {
    setTimeout(() => {
      if (this.contenedorMensajes) {
        this.contenedorMensajes.nativeElement.scrollTop = 
          this.contenedorMensajes.nativeElement.scrollHeight;
      }
    }, 0);
  }
  
  /**
   * Obtiene la URL del WebSocket (http → ws, https → wss)
   */
  private obtenerUrlWebSocket(): string {
    const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocolo}://${window.location.host}/api`;
  }
  
  /**
   * Desconecta WebSocket al destruir el componente
   */
  private desconectarWebSocket(): void {
    if (this.rxStomp && this.rxStomp.connected) {
      this.rxStomp.deactivate().then(() => {
        this.conectado = false;
        console.log('WebSocket desconectado');
      });
    }
  }
  
  /**
   * Formatea una fecha en formato legible
   */
  formatearFecha(timestamp: number): string {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    
    // Si es del mismo día, mostrar solo la hora
    if (fecha.toDateString() === ahora.toDateString()) {
      return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es de ayer
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    if (fecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    }
    
    // Mostrar fecha completa
    return fecha.toLocaleDateString('es-CO');
  }
  
  /**
   * Comprueba si el usuario está escribiendo
   */
  hayUsuariosEscribiendo(): boolean {
    return this.usuariosEscribiendo.size > 0;
  }
  
  /**
   * Obtiene los nombres de usuarios escribiendo
   */
  obtenerNombresEscribiendo(): string {
    return 'Alguien está escribiendo...';
  }
  
  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
    this.desconectarWebSocket();
    
    if (this.suscripcionMensajes) {
      this.suscripcionMensajes.unsubscribe();
    }
    
    if (this.suscripcionPresencia) {
      this.suscripcionPresencia.unsubscribe();
    }
    
    if (this.timeoutEscritura) {
      clearTimeout(this.timeoutEscritura);
    }
  }
}
