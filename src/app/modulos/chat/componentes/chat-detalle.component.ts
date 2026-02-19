import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatServicio, Chat, Mensaje } from '../../../core/servicios/chat.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-chat-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-detalle-container">
      <!-- Header -->
      <header class="chat-detalle-header" *ngIf="chatActual">
        <button class="btn-volver" (click)="volver()">‚Üê Volver</button>
        
        <div class="chat-header-info">
          <h2>{{ obtenerNombreParticipante() }}</h2>
          <small class="estado-badge" [class.cerrado]="chatActual.estado === 'CERRADO'">
            {{ chatActual.estado === 'CERRADO' ? '[]í Cerrado' : '‚úì Activo' }}
          </small>
        </div>

        <div class="chat-header-acciones">
          <button *ngIf="puedoCerrar()" 
                  class="btn-cerrar-chat"
                  (click)="cerrarChat()">
            []í Cerrar Chat
          </button>
          <button *ngIf="chatActual.estado === 'CERRADO' && puedoCerrar()" 
                  class="btn-reabrir-chat"
                  (click)="reabrirChat()">
            []ì Reabrir
          </button>
        </div>
      </header>

      <!-- Area de mensajes -->
      <div class="mensajes-area" #mensajesArea>
        <div *ngIf="mensajes.length === 0" class="sin-mensajes">
          <p>No hay mensajes a√∫n</p>
        </div>

        <div *ngFor="let mensaje of mensajes" 
             class="mensaje"
             [class.mio]="esmiMensaje(mensaje)">
          
          <div class="mensaje-contenido">
            <div class="mensaje-texto">{{ mensaje.contenido }}</div>
            <small class="mensaje-timestamp">
              {{ mensaje.timestamp | date:'short' }}
            </small>
          </div>
        </div>
      </div>

      <!-- Input de mensaje -->
      <footer class="chat-footer" *ngIf="chatActual">
        <div *ngIf="chatActual.estado === 'CERRADO' && !esAdmin" class="chat-cerrado-info">
          <p>[][] Este chat ha sido cerrado. Puedes ver el historial pero no puedes enviar nuevos mensajes.</p>
        </div>

        <div *ngIf="puedoEscribir()" class="input-area">
          <input type="text"
                 [(ngModel)]="mensajeNuevo"
                 (keyup.enter)="enviarMensaje()"
                 placeholder="Escribe tu mensaje..."
                 class="input-mensaje">
          
          <button (click)="enviarMensaje()" 
                  [disabled]="!mensajeNuevo.trim()"
                  class="btn-enviar">
            []§
          </button>
        </div>

        <div *ngIf="!puedoEscribir() && chatActual.estado !== 'CERRADO'" class="sin-permiso">
          <p>No tienes permiso para escribir en este chat</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .chat-detalle-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .chat-detalle-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-volver {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.5rem;
      color: #1a5490;
      transition: color 0.3s ease;
    }

    .btn-volver:hover {
      color: #0d3a6e;
    }

    .chat-header-info {
      flex: 1;
    }

    .chat-header-info h2 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .estado-badge {
      color: #666;
      font-size: 0.85rem;
      margin-left: 0.5rem;
    }

    .estado-badge.cerrado {
      color: #ff6b6b;
      font-weight: bold;
    }

    .chat-header-acciones {
      display: flex;
      gap: 0.5rem;
    }

    .btn-cerrar-chat,
    .btn-reabrir-chat {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .btn-cerrar-chat {
      background: #ff6b6b;
      color: white;
    }

    .btn-cerrar-chat:hover {
      background: #e63946;
    }

    .btn-reabrir-chat {
      background: #51cf66;
      color: white;
    }

    .btn-reabrir-chat:hover {
      background: #37b24d;
    }

    .mensajes-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: #f9f9f9;
    }

    .sin-mensajes {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .mensaje {
      display: flex;
      margin-bottom: 0.5rem;
    }

    .mensaje.mio {
      justify-content: flex-end;
    }

    .mensaje-contenido {
      max-width: 60%;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: white;
      border: 1px solid #e0e0e0;
    }

    .mensaje.mio .mensaje-contenido {
      background: #1a5490;
      color: white;
      border: none;
    }

    .mensaje-texto {
      word-wrap: break-word;
      margin-bottom: 0.25rem;
    }

    .mensaje-timestamp {
      display: block;
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .chat-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      background: white;
    }

    .chat-cerrado-info {
      padding: 0.75rem 1rem;
      background: #fff3cd;
      border-left: 4px solid #ff6b6b;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .chat-cerrado-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .input-area {
      display: flex;
      gap: 0.5rem;
    }

    .input-mensaje {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .input-mensaje:focus {
      border-color: #1a5490;
    }

    .btn-enviar {
      padding: 0.75rem 1rem;
      background: #1a5490;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s ease;
    }

    .btn-enviar:hover:not(:disabled) {
      background: #0d3a6e;
    }

    .btn-enviar:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .sin-permiso {
      padding: 0.75rem 1rem;
      background: #f0f0f0;
      border-radius: 6px;
      text-align: center;
      color: #999;
    }

    .sin-permiso p {
      margin: 0;
      font-size: 0.9rem;
    }
  `]
})
export class ChatDetalleComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesArea') mensajesArea!: ElementRef;

  chatActual: Chat | null = null;
  mensajes: Mensaje[] = [];
  mensajeNuevo = '';
  miRol = '';
  miId = 0;
  private destroy$ = new Subject<void>();
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatServicio: ChatServicio,
    private permisosServicio: PermisosServicio
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const chatId = params['id'];
        this.cargarChat(chatId);
        this.cargarMensajes(chatId);
        this.marcarComoLeido(chatId);
      });

    // Simulaci√≥n: En producci√≥n, usar WebSocket para actualizaciones en tiempo real
    setInterval(() => {
      if (this.chatActual) {
        this.cargarMensajes(this.chatActual.id);
      }
    }, 3000);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollAlFinal();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarChat(chatId: number): void {
    this.chatServicio.obtenerChat(chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        this.chatActual = chat;
      });
  }

  cargarMensajes(chatId: number): void {
    this.chatServicio.obtenerMensajes(chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(mensajes => {
        this.mensajes = mensajes;
        this.shouldScroll = true;
      });
  }

  enviarMensaje(): void {
    if (!this.mensajeNuevo.trim() || !this.chatActual) return;

    const contenido = this.mensajeNuevo;
    this.mensajeNuevo = '';

    this.chatServicio.enviarMensaje(this.chatActual.id, contenido)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarMensajes(this.chatActual!.id);
      });
  }

  marcarComoLeido(chatId: number): void {
    this.chatServicio.marcarComoLeido(chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  cerrarChat(): void {
    if (!this.chatActual) return;

    this.chatServicio.cerrarChat(this.chatActual.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        this.chatActual = chat;
      });
  }

  reabrirChat(): void {
    if (!this.chatActual) return;

    this.chatServicio.reabrirChat(this.chatActual.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        this.chatActual = chat;
      });
  }

  volver(): void {
    this.router.navigate(['/chat']);
  }

  puedoEscribir(): boolean {
    if (!this.chatActual) return false;
    const miRol = this.permisosServicio.obtenerRoles$();
    // Simulaci√≥n: en producci√≥n, usar el servicio de chat
    return this.chatActual.estado === 'ACTIVO';
  }

  puedoCerrar(): boolean {
    if (!this.chatActual) return false;
    return this.permisosServicio.esAdmin();
  }

  esmiMensaje(mensaje: Mensaje): boolean {
    return mensaje.remitente.rol === this.miRol;
  }

  obtenerNombreParticipante(): string {
    if (!this.chatActual) return '';
    const esAdmin = this.permisosServicio.esAdmin();
    if (esAdmin || this.chatActual.participante1.rol === 'ADMIN') {
      return this.chatActual.participante2.nombre;
    }
    return this.chatActual.participante1.nombre;
  }

  private scrollAlFinal(): void {
    try {
      this.mensajesArea.nativeElement.scrollTop = 
        this.mensajesArea.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
