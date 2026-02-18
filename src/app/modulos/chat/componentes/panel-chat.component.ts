import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import NotifyX from 'notifyx';

interface MensajeChat {
  id: number;
  idChat: number;
  idUsuarioRemitente: number;
  nombreUsuarioRemitente: string;
  contenido: string;
  fechaCreacion: Date;
  leido: boolean;
}

interface ChatUsuario {
  id: number;
  idUsuarioTecnico: number;
  nombreTecnico: string;
  idUsuarioSolicitante: number;
  nombreSolicitante: string;
  activo: boolean;
  mensajesNoLeidos: number;
}

@Component({
  selector: 'app-panel-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./panel-chat.component.scss'],
  template: `
    <div class="contenedor-chat">
      <!-- Header -->
      <div class="header-chat">
        <h1>[]� Centro de Mensajería</h1>
        <p>Comunicación directa con técnicos y soporte</p>
      </div>

      <!-- Container Principal -->
      <div class="chat-wrapper">
        <!-- Lista de Chats (Sidebar) -->
        <div class="sidebar-chats">
          <div class="buscar-chat">
            <input 
              type="text" 
              placeholder="Buscar chat..."
              [(ngModel)]="busquedaChat"
              class="input-buscar"
            />
          </div>

          <div class="lista-chats">
            @for (chat of chatsActivos(); track chat.id) {
              <div 
                class="item-chat"
                [class.activo]="chatSeleccionado()?.id === chat.id"
                (click)="seleccionarChat(chat)"
              >
                <div class="avatar-chat">
                  {{ (chatSeleccionado()?.id === chat.id ? 'T' : 'S') }}
                </div>
                <div class="info-chat">
                  <h4>{{ chatSeleccionado()?.id === chat.id ? chat.nombreTecnico : chat.nombreSolicitante }}</h4>
                  <p class="fecha-chat">{{ chat.activo ? 'Activo' : 'Cerrado' }}</p>
                </div>
                @if (chat.mensajesNoLeidos > 0) {
                  <div class="badge-noLeidos">{{ chat.mensajesNoLeidos }}</div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Área de Chat -->
        <div class="area-chat">
          @if (chatSeleccionado()) {
            <!-- Header del Chat -->
            <div class="header-chat-activo">
              <div class="info-usuario-chat">
                <div class="avatar-grande">T</div>
                <div class="datos-usuario">
                  <h3>{{ chatSeleccionado()?.nombreTecnico }}</h3>
                  <p class="estado">{{ chatSeleccionado()?.activo ? 'En línea' : 'Fuera de línea' }}</p>
                </div>
              </div>
              <button 
                class="btn-cerrar-chat"
                (click)="cerrarChat()"
                title="Cerrar chat"
              >
                ✕
              </button>
            </div>

            <!-- Mensajes -->
            <div class="contenedor-mensajes">
              <div #scrollContainer class="scroll-mensajes">
                @for (mensaje of mensajesChatActual(); track mensaje.id) {
                  <div 
                    class="mensaje"
                    [class.propio]="mensaje.idUsuarioRemitente === usuarioId()"
                  >
                    <div class="contenido-mensaje">
                      <span class="autor">{{ mensaje.nombreUsuarioRemitente }}</span>
                      <p>{{ mensaje.contenido }}</p>
                      <span class="hora">{{ mensaje.fechaCreacion | date:'short' }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Input de Mensaje -->
            <div class="input-mensaje">
              <textarea 
                [(ngModel)]="nuevoMensaje"
                (keyup.enter)="enviarMensaje()"
                placeholder="Escribe tu mensaje..."
                class="textarea-mensaje"
              ></textarea>
              <button 
                (click)="enviarMensaje()"
                [disabled]="cargandoMensaje() || !nuevoMensaje.trim()"
                class="btn-enviar"
              >
                {{ cargandoMensaje() ? '⏳' : '[]�' }}
              </button>
            </div>
          } @else {
            <div class="sin-chat">
              <p>Selecciona un chat para comenzar a conversar</p>
            </div>
          }
        </div>
      </div>

      <!-- Modal de Confirmación para Cerrar Chat -->
      @if (mostrarModalCerrar()) {
        <div class="modal-overlay" (click)="cancelarCierre()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>¿Cerrar Chat?</h2>
            <p>¿Estás seguro de que deseas cerrar este chat?</p>
            <div class="botones-modal">
              <button class="btn-cancelar" (click)="cancelarCierre()">Cancelar</button>
              <button class="btn-confirmar" (click)="confirmarCierre()">Cerrar Chat</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PanelChatComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  // Signals
  chatsActivos = signal<ChatUsuario[]>([]);
  chatSeleccionado = signal<ChatUsuario | null>(null);
  mensajesChatActual = signal<MensajeChat[]>([]);
  nuevoMensaje = signal('');
  cargandoMensaje = signal(false);
  busquedaChat = signal('');
  mostrarModalCerrar = signal(false);
  usuarioId = signal<number>(0);

  private readonly API_URL = '/api/chat';

  ngOnInit() {
    this.cargarChats();
    this.obtenerUsuarioActual();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarChats() {
    this.http.get<any>(`${this.API_URL}/usuario/${this.usuarioId()}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.exito) {
            this.chatsActivos.set(respuesta.datos);
          }
        },
        error: (err) => console.error('Error cargando chats:', err)
      });
  }

  seleccionarChat(chat: ChatUsuario) {
    this.chatSeleccionado.set(chat);
    this.cargarMensajes();
  }

  cargarMensajes() {
    if (!this.chatSeleccionado()) return;

    this.http.get<any>(`${this.API_URL}/${this.chatSeleccionado()?.id}/mensajes`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.exito) {
            this.mensajesChatActual.set(respuesta.datos.content || []);
          }
        },
        error: (err) => console.error('Error cargando mensajes:', err)
      });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje().trim() || !this.chatSeleccionado()) return;

    this.cargandoMensaje.set(true);

    this.http.post<any>(`${this.API_URL}/${this.chatSeleccionado()?.id}/mensaje`, 
      { contenido: this.nuevoMensaje() },
      { params: { idUsuario: this.usuarioId().toString() } }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.nuevoMensaje.set('');
          NotifyX.success('Mensaje enviado exitosamente', {
            duration: 3000,
            dismissible: true
          });
          this.cargarMensajes();
        }
      },
      error: (err) => {
        NotifyX.error('Error al enviar el mensaje', {
          duration: 3000,
          dismissible: true
        });
        console.error('Error enviando mensaje:', err);
      },
      complete: () => this.cargandoMensaje.set(false)
    });
  }

  cerrarChat() {
    this.mostrarModalCerrar.set(true);
  }

  cancelarCierre() {
    this.mostrarModalCerrar.set(false);
  }

  confirmarCierre() {
    if (!this.chatSeleccionado()) return;

    this.http.put<any>(`${this.API_URL}/${this.chatSeleccionado()?.id}/cerrar`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.exito) {
            this.chatSeleccionado.set(null);
            this.cargarChats();
            this.mostrarModalCerrar.set(false);
          }
        },
        error: (err) => console.error('Error cerrando chat:', err)
      });
  }

  private obtenerUsuarioActual() {
    // Obtener del localStorage o servicio de autenticación
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
      this.usuarioId.set(parseInt(usuarioId));
    }
  }
}
