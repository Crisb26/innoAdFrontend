import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Mensaje {
  id: number;
  chatId: number;
  remitente: {
    id: number;
    nombre: string;
    rol: string;
  };
  contenido: string;
  timestamp: Date;
  leido: boolean;
}

export interface Chat {
  id: number;
  tipo: 'ADMIN_CLIENTE' | 'USUARIO_TECNICO';
  participante1: {
    id: number;
    nombre: string;
    rol: string;
  };
  participante2: {
    id: number;
    nombre: string;
    rol: string;
  };
  estado: 'ACTIVO' | 'CERRADO';
  ultimoMensaje?: Mensaje;
  noLeidosCount: number;
  createdAt: Date;
  closedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatServicio {
  private chatsActuales$ = new BehaviorSubject<Chat[]>([]);
  private chatActual$ = new BehaviorSubject<Chat | null>(null);
  private mensajes$ = new BehaviorSubject<Mensaje[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los chats del usuario actual
   */
  obtenerChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>('/api/chat/mis-chats')
      .pipe(
        tap(chats => this.chatsActuales$.next(chats))
      );
  }

  /**
   * Obtener un chat específico
   */
  obtenerChat(chatId: number): Observable<Chat> {
    return this.http.get<Chat>(`/api/chat/${chatId}`)
      .pipe(
        tap(chat => this.chatActual$.next(chat))
      );
  }

  /**
   * Obtener mensajes de un chat
   */
  obtenerMensajes(chatId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`/api/chat/${chatId}/mensajes`)
      .pipe(
        tap(mensajes => this.mensajes$.next(mensajes))
      );
  }

  /**
   * Enviar un mensaje en un chat
   */
  enviarMensaje(chatId: number, contenido: string): Observable<Mensaje> {
    return this.http.post<Mensaje>(`/api/chat/${chatId}/mensaje`, { contenido })
      .pipe(
        tap(mensaje => {
          const mensajesActuales = this.mensajes$.value;
          this.mensajes$.next([...mensajesActuales, mensaje]);
        })
      );
  }

  /**
   * Admin inicia chat con cliente
   * Solo admin puede iniciar, cliente solo puede responder
   */
  iniciarChatConCliente(clienteId: number): Observable<Chat> {
    return this.http.post<Chat>('/api/chat/iniciar-cliente', { clienteId })
      .pipe(
        tap(chat => {
          const chats = this.chatsActuales$.value;
          this.chatsActuales$.next([...chats, chat]);
        })
      );
  }

  /**
   * Usuario inicia chat de soporte con técnico
   * Solo usuario puede iniciar, técnico debe responder
   */
  iniciarSoporteConTecnico(): Observable<Chat> {
    return this.http.post<Chat>('/api/chat/iniciar-soporte', {})
      .pipe(
        tap(chat => {
          const chats = this.chatsActuales$.value;
          this.chatsActuales$.next([...chats, chat]);
        })
      );
  }

  /**
   * Cerrar un chat (solo quien lo abrió puede cerrarlo)
   * - Admin cierra su chat con cliente: cliente ve historial pero no puede responder
   * - Usuario cierra soporte: técnico ve pero no puede responder más
   */
  cerrarChat(chatId: number): Observable<Chat> {
    return this.http.post<Chat>(`/api/chat/${chatId}/cerrar`, {})
      .pipe(
        tap(chat => this.chatActual$.next(chat))
      );
  }

  /**
   * Reabrir un chat cerrado (solo quien lo cerró)
   */
  reabrirChat(chatId: number): Observable<Chat> {
    return this.http.post<Chat>(`/api/chat/${chatId}/reabrir`, {})
      .pipe(
        tap(chat => this.chatActual$.next(chat))
      );
  }

  /**
   * Marcar mensajes como leídos
   */
  marcarComoLeido(chatId: number): Observable<void> {
    return this.http.post<void>(`/api/chat/${chatId}/marcar-leido`, {});
  }

  /**
   * Obtener streams de cambios en tiempo real (WebSocket)
   */
  obtenerActualizacionesChat(chatId: number): Observable<any> {
    // TODO: Implementar WebSocket para actualizaciones en tiempo real
    return new Observable(observer => {
      // Simulación hasta que se implemente WebSocket
      observer.complete();
    });
  }

  /**
   * Obtener chats locales (del BehaviorSubject)
   */
  obtenerChatsLocales$(): Observable<Chat[]> {
    return this.chatsActuales$.asObservable();
  }

  /**
   * Obtener chat actual local
   */
  obtenerChatActual$(): Observable<Chat | null> {
    return this.chatActual$.asObservable();
  }

  /**
   * Obtener mensajes locales
   */
  obtenerMensajesLocales$(): Observable<Mensaje[]> {
    return this.mensajes$.asObservable();
  }

  /**
   * Verificar si el usuario actual puede escribir en el chat
   * Reglas:
   * - ADMIN_CLIENTE: Admin siempre puede. Cliente solo si admin abrió el chat y no lo cerró
   * - USUARIO_TECNICO: Ambos pueden si el chat está activo
   */
  puedoEscribir(chat: Chat, miRol: string): boolean {
    if (chat.estado === 'CERRADO') {
      // Si está cerrado, solo quien lo cerró puede reabrirlo
      return false;
    }

    if (chat.tipo === 'ADMIN_CLIENTE') {
      // Admin siempre puede escribir
      if (miRol === 'ADMIN') return true;
      
      // Cliente puede escribir si admin está activo
      return chat.estado === 'ACTIVO';
    }

    if (chat.tipo === 'USUARIO_TECNICO') {
      // Ambos pueden escribir si está activo
      return chat.estado === 'ACTIVO';
    }

    return false;
  }

  /**
   * Verificar si puedo cerrar este chat
   * Solo quien lo abrió puede cerrarlo
   */
  puedoCerrarChat(chat: Chat, misRoles: string[]): boolean {
    if (chat.tipo === 'ADMIN_CLIENTE') {
      // Solo admin puede cerrar
      return misRoles.includes('ADMIN');
    }

    if (chat.tipo === 'USUARIO_TECNICO') {
      // Solo usuario puede cerrar (quien lo inició)
      return misRoles.includes('USUARIO');
    }

    return false;
  }
}
