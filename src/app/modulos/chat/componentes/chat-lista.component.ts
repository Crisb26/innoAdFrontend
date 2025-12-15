import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatServicio, Chat } from '../../../core/servicios/chat.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-chat-lista',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chat-lista-container">
      <header class="chat-header">
        <h1>Mensajes</h1>
        <button class="btn-nuevo-chat" (click)="abrirNuevoChat()">
          {{ esAdmin ? '+ Nuevo Cliente' : '+ Soporte' }}
        </button>
      </header>

      <div class="chat-lista">
        <div *ngIf="chats.length === 0" class="sin-chats">
          <p>{{ esAdmin ? 'No tienes clientes para chatear' : 'No tienes conversaciones de soporte' }}</p>
        </div>

        <div *ngFor="let chat of chats" 
             class="chat-item" 
             [class.activo]="chatActualId === chat.id"
             (click)="seleccionarChat(chat)">
          
          <div class="chat-avatar">
            {{ obtenerIniciales(chat) }}
          </div>

          <div class="chat-info">
            <div class="chat-nombre">
              {{ obtenerNombreParticipante(chat) }}
            </div>
            <div class="chat-preview">
              {{ chat.ultimoMensaje?.contenido || 'Sin mensajes' }}
            </div>
          </div>

          <div class="chat-meta">
            <span *ngIf="chat.noLeidosCount > 0" class="badge-no-leido">
              {{ chat.noLeidosCount }}
            </span>
            <span class="chat-estado" [class.cerrado]="chat.estado === 'CERRADO'">
              {{ chat.estado === 'CERRADO' ? 'Cerrado' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Modal para nuevo chat -->
      <div *ngIf="mostrarNuevoChat" class="modal-overlay" (click)="cerrarNuevoChat()">
        <div class="modal-contenido" (click)="$event.stopPropagation()">
          <h2>{{ esAdmin ? 'Seleccionar Cliente' : 'Solicitar Soporte' }}</h2>
          
          <div *ngIf="esAdmin" class="lista-clientes">
            <input type="text" 
                   placeholder="Buscar cliente..." 
                   [(ngModel)]="filtroCliente"
                   class="input-busqueda">
            
            <div class="clientes-disponibles">
              <div *ngFor="let cliente of clientesFiltrados" 
                   class="cliente-item"
                   (click)="iniciarChatCliente(cliente)">
                <strong>{{ cliente.nombre }}</strong>
                <small>{{ cliente.email }}</small>
              </div>
            </div>
          </div>

          <div *ngIf="!esAdmin" class="soporte-info">
            <p>Se enviará una solicitud de soporte a un técnico disponible.</p>
            <button class="btn-enviar" (click)="iniciarSoporte()">
              Enviar Solicitud
            </button>
          </div>

          <button class="btn-cerrar" (click)="cerrarNuevoChat()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-lista-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .chat-header {
      padding: 1.5rem;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h1 {
      margin: 0;
      color: #1a5490;
      font-size: 1.5rem;
    }

    .btn-nuevo-chat {
      padding: 0.5rem 1rem;
      background: #1a5490;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }

    .btn-nuevo-chat:hover {
      background: #0d3a6e;
    }

    .chat-lista {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .sin-chats {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .chat-item {
      padding: 1rem;
      background: white;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .chat-item:hover,
    .chat-item.activo {
      background: #f0f8ff;
    }

    .chat-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #1a5490;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .chat-info {
      flex: 1;
      min-width: 0;
    }

    .chat-nombre {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .chat-preview {
      color: #999;
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .badge-no-leido {
      background: #ff6b6b;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .chat-estado {
      color: #999;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .chat-estado.cerrado {
      color: #ff6b6b;
      font-weight: bold;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-contenido {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      max-height: 500px;
      overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .modal-contenido h2 {
      color: #1a5490;
      margin-top: 0;
    }

    .input-busqueda {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .clientes-disponibles {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .cliente-item {
      padding: 0.75rem;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .cliente-item:hover {
      background: #f0f8ff;
    }

    .cliente-item strong {
      display: block;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .cliente-item small {
      color: #999;
    }

    .soporte-info {
      padding: 1rem;
      background: #f0f8ff;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .soporte-info p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .btn-enviar,
    .btn-cerrar {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      margin-right: 0.5rem;
    }

    .btn-enviar {
      background: #1a5490;
      color: white;
    }

    .btn-enviar:hover {
      background: #0d3a6e;
    }

    .btn-cerrar {
      background: #f0f0f0;
      color: #333;
    }

    .btn-cerrar:hover {
      background: #e0e0e0;
    }
  `]
})
export class ChatListaComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  chatActualId: number | null = null;
  mostrarNuevoChat = false;
  filtroCliente = '';
  clientesFiltrados: any[] = [];
  esAdmin = false;
  clientesDisponibles: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private chatServicio: ChatServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.permisosServicio.esAdmin();
    this.cargarChats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarChats(): void {
    this.chatServicio.obtenerChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(chats => {
        this.chats = chats;
      });
  }

  seleccionarChat(chat: Chat): void {
    this.chatActualId = chat.id;
    this.router.navigate(['/chat', chat.id]);
  }

  abrirNuevoChat(): void {
    this.mostrarNuevoChat = true;
    if (this.esAdmin) {
      this.cargarClientesDisponibles();
    }
  }

  cerrarNuevoChat(): void {
    this.mostrarNuevoChat = false;
    this.filtroCliente = '';
  }

  cargarClientesDisponibles(): void {
    // TODO: Obtener lista de clientes disponibles
    // Simulación por ahora
    this.clientesDisponibles = [
      { id: 1, nombre: 'Cliente 1', email: 'cliente1@example.com' },
      { id: 2, nombre: 'Cliente 2', email: 'cliente2@example.com' },
    ];
    this.clientesFiltrados = this.clientesDisponibles;
  }

  get clientesFiltrados$(): any[] {
    return this.clientesDisponibles.filter(c =>
      c.nombre.toLowerCase().includes(this.filtroCliente.toLowerCase()) ||
      c.email.toLowerCase().includes(this.filtroCliente.toLowerCase())
    );
  }

  iniciarChatCliente(cliente: any): void {
    this.chatServicio.iniciarChatConCliente(cliente.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        this.seleccionarChat(chat);
        this.cerrarNuevoChat();
      });
  }

  iniciarSoporte(): void {
    this.chatServicio.iniciarSoporteConTecnico()
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        this.seleccionarChat(chat);
        this.cerrarNuevoChat();
      });
  }

  obtenerNombreParticipante(chat: Chat): string {
    // Mostrar el nombre del otro participante
    const miRol = this.esAdmin ? 'ADMIN' : 'USUARIO';
    if (chat.participante1.rol === miRol) {
      return chat.participante2.nombre;
    }
    return chat.participante1.nombre;
  }

  obtenerIniciales(chat: Chat): string {
    const nombre = this.obtenerNombreParticipante(chat);
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
