/**
 * []� COMPONENTE PRINCIPAL - CHAT ASISTENTE IA
 * Interfaz conversacional premium con animaciones y efectos
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioAgenteIA, MensajeIA, RespuestaIA } from '../servicios/agente-ia.service';
import { EstiloService } from '@core/servicios/estilo.service';
import { AnimacionDirective, HoverEfectoDirective, TransicionDirective } from '@core/directivas/animacion.directive';
import { coloresInnoAd } from '@core/config/colores.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asistente-ia-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimacionDirective, HoverEfectoDirective, TransicionDirective],
  template: `
    <div class="container-asistente" appAnimacion="fadeIn">
      <!-- Header -->
      <div class="header-asistente" appTransicion="normal">
        <div class="header-content">
          <h1 appAnimacion="slideInLeft">
            <span class="icon-ia">[]�</span>
            InnoAd Assistant
          </h1>
          <p class="subtitle">Tu asistente IA inteligente</p>
        </div>
        <div class="header-actions">
          <button 
            class="btn-info" 
            (click)="toggleSugerencias()"
            appHoverEfecto="lift">
            []� Sugerencias
          </button>
          <button 
            class="btn-danger" 
            (click)="limpiarChat()"
            appHoverEfecto="lift">
            []�[] Limpiar
          </button>
        </div>
      </div>

      <!-- Área de Chat -->
      <div class="chat-container" #chatContainer>
        <div class="chat-messages">
          <!-- Mensaje vacío inicial -->
          <div *ngIf="historial.length === 0" class="mensaje-vacio" appAnimacion="slideInUp">
            <div class="icono-vacio">[]�</div>
            <h2>Bienvenido al Asistente IA</h2>
            <p>Haz preguntas sobre campañas, análisis, pagos y más</p>
          </div>

          <!-- Mensajes del chat -->
          <div 
            *ngFor="let mensaje of historial; let i = index" 
            [ngClass]="{ 'mensaje-usuario': mensaje.esUsuario, 'mensaje-ia': !mensaje.esUsuario }"
            class="mensaje"
            appAnimacion="slideInUp"
            [retraso]="i * 50">

            <!-- Mensaje del Usuario -->
            <div *ngIf="mensaje.esUsuario" class="user-message">
              <div class="message-bubble usuario-bubble" appHoverEfecto="glow">
                {{ mensaje.contenido }}
              </div>
              <span class="timestamp">{{ formatearHora(mensaje.timestamp) }}</span>
            </div>

            <!-- Mensaje de IA -->
            <div *ngIf="!mensaje.esUsuario" class="ia-message">
              <div class="avatar-ia">[]�</div>
              <div class="message-content">
                <div 
                  class="message-bubble ia-bubble"
                  appTransicion="normal"
                  appHoverEfecto="glow">
                  {{ mensaje.contenido }}
                  
                  <!-- Indicador de tipo de respuesta -->
                  <div *ngIf="mensaje.datosAdicionales" class="respuesta-meta">
                    <span class="badge" [ngClass]="'badge-' + mensaje.tipoRespuesta">
                      {{ mensaje.tipoRespuesta }}
                    </span>
                    <span class="confianza" *ngIf="mensaje.datosAdicionales.confianza">
                      Confianza: {{ (mensaje.datosAdicionales.confianza * 100) | number: '1.0-0' }}%
                    </span>
                  </div>
                </div>

                <!-- Sugerencias -->
                <div *ngIf="mensaje.datosAdicionales?.sugerencias?.length" class="sugerencias-rapidas">
                  <span class="label-sugerencias">Preguntas relacionadas:</span>
                  <button 
                    *ngFor="let sugerencia of mensaje.datosAdicionales.sugerencias"
                    class="sugerencia-btn"
                    (click)="enviarPregunta(sugerencia)"
                    appHoverEfecto="scale">
                    {{ sugerencia }}
                  </button>
                </div>
              </div>

              <span class="timestamp">{{ formatearHora(mensaje.timestamp) }}</span>
            </div>
          </div>

          <!-- Indicador de cargando -->
          <div *ngIf="cargando" class="mensaje-cargando" appAnimacion="pulse">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Procesando tu pregunta...</p>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="alert-error" appAnimacion="slideInDown">
            <span>[]</span>
            {{ error }}
            <button (click)="cerrarError()" class="btn-close">✕</button>
          </div>
        </div>
      </div>

      <!-- Panel de Sugerencias -->
      <div *ngIf="mostrarSugerencias" class="sugerencias-panel" appAnimacion="slideInUp">
        <div class="sugerencias-header">
          <h3>Preguntas sugeridas</h3>
          <button (click)="toggleSugerencias()" class="btn-close">✕</button>
        </div>
        <div class="sugerencias-lista">
          <button 
            *ngFor="let sugerencia of sugerenciasGlobales"
            class="sugerencia-item"
            (click)="enviarPregunta(sugerencia)"
            appHoverEfecto="lift">
            {{ sugerencia }}
          </button>
        </div>
      </div>

      <!-- Input de Pregunta -->
      <div class="input-container" appTransicion="normal">
        <div class="input-wrapper">
          <input 
            #inputPregunta
            type="text"
            placeholder="Escribe tu pregunta aquí..."
            [(ngModel)]="pregunta"
            (keyup.enter)="enviarPregunta()"
            class="input-pregunta"
            maxlength="500"
            [disabled]="cargando">
          
          <button 
            class="btn-enviar"
            (click)="enviarPregunta()"
            [disabled]="cargando || !pregunta.trim()"
            appHoverEfecto="lift">
            <span *ngIf="!cargando">Enviar →</span>
            <span *ngIf="cargando" class="spinner-mini">⟳</span>
          </button>
        </div>

        <!-- Contador de caracteres -->
        <div class="char-counter">
          {{ pregunta.length }} / 500
        </div>
      </div>

      <!-- Estadísticas Footer -->
      <div *ngIf="metricas$ | async as metricas" class="stats-footer">
        <div class="stat">
          <span class="stat-label">Preguntas:</span>
          <span class="stat-value">{{ metricas.preguntasProcessadas }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Tiempo:</span>
          <span class="stat-value">{{ metricas.tiempoPromedio }}ms</span>
        </div>
        <div class="stat">
          <span class="stat-label">Confianza:</span>
          <span class="stat-value">{{ metricas.confianzaPromedia * 100 | number: '1.0-0' }}%</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./asistente-ia-chat.component.scss'],
})
export class AsistenteIAChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('inputPregunta') inputPregunta!: ElementRef;

  pregunta = '';
  historial: MensajeIA[] = [];
  cargando = false;
  error = '';
  mostrarSugerencias = false;
  sugerenciasGlobales: string[] = [];
  metricas$ = this.servicioIA.metrics$;

  private destroy$ = new Subject<void>();

  constructor(
    private servicioIA: ServicioAgenteIA,
    private estiloService: EstiloService
  ) {}

  ngOnInit(): void {
    // Inicializar sesión
    this.servicioIA.inicializarSesion('usuario-actual', 'usuario');

    // Suscribirse al historial
    this.servicioIA.historial$.pipe(takeUntil(this.destroy$)).subscribe((historial) => {
      this.historial = historial;
    });

    // Suscribirse al estado de cargando
    this.servicioIA.cargando$.pipe(takeUntil(this.destroy$)).subscribe((cargando) => {
      this.cargando = cargando;
    });

    // Suscribirse a errores
    this.servicioIA.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.error = error;
    });

    // Cargar sugerencias iniciales
    this.cargarSugerencias();
  }

  ngAfterViewChecked(): void {
    // Auto-scroll al último mensaje
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  enviarPregunta(preguntaPersonalizada?: string): void {
    const preguntaFinal = preguntaPersonalizada || this.pregunta;

    if (!preguntaFinal.trim()) {
      return;
    }

    this.servicioIA.enviarPregunta(preguntaFinal).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.pregunta = '';
        if (this.inputPregunta) {
          this.inputPregunta.nativeElement.focus();
        }
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }

  cargarSugerencias(): void {
    this.servicioIA.obtenerSugerencias().pipe(takeUntil(this.destroy$)).subscribe({
      next: (sugerencias) => {
        this.sugerenciasGlobales = sugerencias;
      },
      error: (err) => {
        console.error('Error al cargar sugerencias:', err);
      },
    });
  }

  toggleSugerencias(): void {
    this.mostrarSugerencias = !this.mostrarSugerencias;
  }

  limpiarChat(): void {
    if (confirm('¿Deseas limpiar toda la conversación?')) {
      this.servicioIA.limpiarHistorial();
      this.pregunta = '';
      this.error = '';
    }
  }

  cerrarError(): void {
    this.error = '';
  }

  formatearHora(date: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(date).getTime();

    if (diferencia < 60000) {
      return 'Ahora';
    } else if (diferencia < 3600000) {
      return `Hace ${Math.floor(diferencia / 60000)} min`;
    } else if (diferencia < 86400000) {
      return `Hace ${Math.floor(diferencia / 3600000)} h`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }
}
