import { Component, OnInit, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioAsistenteIA } from '@core/servicios/asistente-ia.servicio';
import { MensajeChat } from '@core/modelos';

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor-asistente">
      <div class="panel-asistente">
        <header class="encabezado-asistente">
          <div class="info-asistente">
            <div class="avatar-asistente">
              <svg viewBox="0 0 100 100" class="icono-ia">
                <circle cx="50" cy="50" r="45" class="avatar-circulo"/>
                <path d="M 30 40 Q 50 20 70 40" class="avatar-onda onda-1"/>
                <path d="M 30 50 Q 50 30 70 50" class="avatar-onda onda-2"/>
                <path d="M 30 60 Q 50 40 70 60" class="avatar-onda onda-3"/>
              </svg>
            </div>
            <div class="texto-info">
              <h2 class="nombre-asistente">InnoIA</h2>
              <p class="estado-asistente">
                <span class="indicador-activo"></span>
                {{ estadoAsistente() }}
              </p>
            </div>
          </div>
          <button (click)="cerrarAsistente()" class="boton-cerrar-asistente" title="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div class="area-mensajes" #areaMensajes>
          @if (mensajes().length === 0) {
            <div class="mensaje-bienvenida">
              <div class="icono-bienvenida">
                <svg viewBox="0 0 100 100" class="logo-bienvenida">
                  <circle cx="50" cy="50" r="40" class="circulo-logo"/>
                  <path d="M 30 45 Q 50 25 70 45" class="linea-logo"/>
                  <path d="M 30 55 Q 50 35 70 55" class="linea-logo"/>
                  <path d="M 30 65 Q 50 45 70 65" class="linea-logo"/>
                </svg>
              </div>
              <h3>Hola, soy InnoIA</h3>
              <p>Tu asistente inteligente para publicidad digital</p>
              <div class="sugerencias-rapidas">
                <button (click)="enviarSugerencia('¿Cómo crear una campaña?')" class="sugerencia">
                  ¿Cómo crear una campaña?
                </button>
                <button (click)="enviarSugerencia('¿Cómo subir contenido?')" class="sugerencia">
                  ¿Cómo subir contenido?
                </button>
                <button (click)="enviarSugerencia('Analizar mis estadísticas')" class="sugerencia">
                  Analizar mis estadísticas
                </button>
                <button (click)="enviarSugerencia('Tips de optimización')" class="sugerencia">
                  Tips de optimización
                </button>
              </div>
            </div>
          } @else {
            @for (mensaje of mensajes(); track mensaje.id) {
              <div class="mensaje" [class.mensaje-usuario]="mensaje.esUsuario" [class.mensaje-ia]="!mensaje.esUsuario">
                <div class="avatar-mensaje">
                  @if (mensaje.esUsuario) {
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M12 14c-6 0-8 3-8 6h16c0-3-2-6-8-6z"/>
                    </svg>
                  } @else {
                    <svg viewBox="0 0 32 32" class="icono-ia-pequeno">
                      <circle cx="16" cy="16" r="14" class="circulo-ia"/>
                      <path d="M 10 14 Q 16 8 22 14" class="onda-ia"/>
                      <path d="M 10 18 Q 16 12 22 18" class="onda-ia"/>
                    </svg>
                  }
                </div>
                <div class="contenido-mensaje">
                  <div class="texto-mensaje">{{ mensaje.texto }}</div>
                  <span class="hora-mensaje">{{ formatearHora(mensaje.fecha) }}</span>
                </div>
              </div>
            }
            @if (procesando()) {
              <div class="mensaje mensaje-ia">
                <div class="avatar-mensaje">
                  <svg viewBox="0 0 32 32" class="icono-ia-pequeno animado">
                    <circle cx="16" cy="16" r="14" class="circulo-ia"/>
                    <path d="M 10 14 Q 16 8 22 14" class="onda-ia"/>
                    <path d="M 10 18 Q 16 12 22 18" class="onda-ia"/>
                  </svg>
                </div>
                <div class="contenido-mensaje">
                  <div class="indicador-escribiendo">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <div class="area-entrada">
          <form (ngSubmit)="enviarMensaje()" class="formulario-mensaje">
            <input
              type="text"
              [(ngModel)]="mensajeActual"
              name="mensaje"
              placeholder="Escribe tu mensaje..."
              class="input-mensaje"
              [disabled]="procesando()"
              autocomplete="off"
            />
            <button type="submit" class="boton-enviar" [disabled]="!mensajeActual.trim() || procesando()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-asistente {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 600px;
      z-index: 1000;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .panel-asistente {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #ffffff;
    }

    .encabezado-asistente {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .info-asistente {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar-asistente {
      width: 48px;
      height: 48px;
    }

    .icono-ia {
      width: 100%;
      height: 100%;
    }

    .avatar-circulo {
      fill: rgba(255, 255, 255, 0.2);
      stroke: white;
      stroke-width: 2;
    }

    .avatar-onda {
      fill: none;
      stroke: white;
      stroke-width: 2;
      stroke-linecap: round;
    }

    .onda-1 {
      animation: onda 1.5s ease-in-out infinite;
    }

    .onda-2 {
      animation: onda 1.5s ease-in-out infinite 0.3s;
    }

    .onda-3 {
      animation: onda 1.5s ease-in-out infinite 0.6s;
    }

    @keyframes onda {
      0%, 100% {
        opacity: 0.3;
        transform: translateY(0);
      }
      50% {
        opacity: 1;
        transform: translateY(-2px);
      }
    }

    .texto-info {
      flex: 1;
    }

    .nombre-asistente {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .estado-asistente {
      font-size: 0.875rem;
      margin: 0.25rem 0 0;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .indicador-activo {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #00ff88;
      border-radius: 50%;
      animation: pulso 2s infinite;
    }

    @keyframes pulso {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.2);
      }
    }

    .boton-cerrar-asistente {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    }

    .boton-cerrar-asistente:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .area-mensajes {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: #f7fafc;
    }

    .mensaje-bienvenida {
      text-align: center;
      padding: 2rem 1rem;
    }

    .icono-bienvenida {
      display: inline-block;
      margin-bottom: 1.5rem;
    }

    .logo-bienvenida {
      width: 80px;
      height: 80px;
    }

    .circulo-logo {
      fill: none;
      stroke: #667eea;
      stroke-width: 3;
    }

    .linea-logo {
      fill: none;
      stroke: #764ba2;
      stroke-width: 2;
      stroke-linecap: round;
    }

    .mensaje-bienvenida h3 {
      font-size: 1.5rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .mensaje-bienvenida p {
      color: #718096;
      margin-bottom: 2rem;
    }

    .sugerencias-rapidas {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 300px;
      margin: 0 auto;
    }

    .sugerencia {
      background: white;
      border: 1px solid #e2e8f0;
      color: #4a5568;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.875rem;
    }

    .sugerencia:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .mensaje {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      animation: aparecerMensaje 0.3s ease-out;
    }

    @keyframes aparecerMensaje {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mensaje-usuario {
      flex-direction: row-reverse;
    }

    .avatar-mensaje {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .mensaje-usuario .avatar-mensaje {
      color: #667eea;
    }

    .icono-ia-pequeno {
      width: 100%;
      height: 100%;
    }

    .circulo-ia {
      fill: rgba(102, 126, 234, 0.1);
      stroke: #667eea;
      stroke-width: 2;
    }

    .onda-ia {
      fill: none;
      stroke: #667eea;
      stroke-width: 1.5;
      stroke-linecap: round;
    }

    .icono-ia-pequeno.animado .onda-ia {
      animation: ondaPequena 1s ease-in-out infinite;
    }

    @keyframes ondaPequena {
      0%, 100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }

    .contenido-mensaje {
      flex: 1;
      max-width: 70%;
    }

    .texto-mensaje {
      background: white;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      color: #2d3748;
      line-height: 1.5;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .mensaje-usuario .texto-mensaje {
      background: #667eea;
      color: white;
    }

    .hora-mensaje {
      display: block;
      font-size: 0.75rem;
      color: #a0aec0;
      margin-top: 0.25rem;
      padding: 0 0.5rem;
    }

    .indicador-escribiendo {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      display: flex;
      gap: 0.4rem;
      width: fit-content;
    }

    .indicador-escribiendo span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: escribiendo 1.4s infinite;
    }

    .indicador-escribiendo span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .indicador-escribiendo span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes escribiendo {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }

    .area-entrada {
      padding: 1rem;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .formulario-mensaje {
      display: flex;
      gap: 0.75rem;
    }

    .input-mensaje {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.3s;
    }

    .input-mensaje:focus {
      border-color: #667eea;
    }

    .input-mensaje:disabled {
      background: #f7fafc;
      cursor: not-allowed;
    }

    .boton-enviar {
      background: #667eea;
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .boton-enviar:hover:not(:disabled) {
      background: #764ba2;
      transform: scale(1.1);
    }

    .boton-enviar:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .contenedor-asistente {
        width: 100%;
        height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `]
})
export class AsistenteIAComponent implements OnInit, AfterViewChecked {
  @ViewChild('areaMensajes') private areaMensajes?: ElementRef;

  protected readonly mensajes = signal<MensajeChat[]>([]);
  protected readonly procesando = signal(false);
  protected readonly estadoAsistente = signal('En línea y lista para ayudar');
  protected mensajeActual = '';

  private scrollPendiente = false;
  private contadorMensajes = 0;

  constructor(private readonly servicioIA: ServicioAsistenteIA) {}

  ngOnInit(): void {
    this.servicioIA.inicializar();
  }

  ngAfterViewChecked(): void {
    if (this.scrollPendiente) {
      this.scrollAlFinal();
      this.scrollPendiente = false;
    }
  }

  protected enviarMensaje(): void {
    const texto = this.mensajeActual.trim();
    if (!texto || this.procesando()) return;

    const mensajeUsuario: MensajeChat = {
      id: ++this.contadorMensajes,
      texto,
      esUsuario: true,
      fecha: new Date()
    };

    this.mensajes.update(msgs => [...msgs, mensajeUsuario]);
    this.mensajeActual = '';
    this.scrollPendiente = true;
    this.procesando.set(true);
    this.estadoAsistente.set('Pensando...');

    this.servicioIA.enviarMensaje(texto).subscribe({
      next: (respuesta) => {
        const mensajeIA: MensajeChat = {
          id: ++this.contadorMensajes,
          texto: respuesta,
          esUsuario: false,
          fecha: new Date()
        };
        this.mensajes.update(msgs => [...msgs, mensajeIA]);
        this.scrollPendiente = true;
        this.procesando.set(false);
        this.estadoAsistente.set('En línea y lista para ayudar');
      },
      error: () => {
        const mensajeError: MensajeChat = {
          id: ++this.contadorMensajes,
          texto: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
          esUsuario: false,
          fecha: new Date()
        };
        this.mensajes.update(msgs => [...msgs, mensajeError]);
        this.scrollPendiente = true;
        this.procesando.set(false);
        this.estadoAsistente.set('En línea y lista para ayudar');
      }
    });
  }

  protected enviarSugerencia(texto: string): void {
    this.mensajeActual = texto;
    this.enviarMensaje();
  }

  protected formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  protected cerrarAsistente(): void {
    // Implementar lógica de cierre si es necesario
  }

  private scrollAlFinal(): void {
    if (this.areaMensajes) {
      const elemento = this.areaMensajes.nativeElement;
      elemento.scrollTop = elemento.scrollHeight;
    }
  }
}
