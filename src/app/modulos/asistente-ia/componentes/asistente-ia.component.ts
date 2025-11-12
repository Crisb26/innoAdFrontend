 import { Component, inject, OnInit, OnDestroy, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AsistenteIAServicio, 
  MensajeChat, 
  EstadoAsistente, 
  AccionSugerida,
  ConfiguracionAsistente 
} from '@core/servicios/asistente-ia.servicio';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./asistente-ia.component.scss'],
  template: `
    <!-- Botón flotante del asistente -->
    @if (!estadoAsistente().activo) {
      <div class="boton-asistente" 
           (click)="toggleAsistente()"
           [attr.data-animacion]="estadoAsistente().animacion">
        <div class="avatar-mini">
          <div class="cara-avatar">
            <div class="ojos">
              <div class="ojo"></div>
              <div class="ojo"></div>
            </div>
            <div class="boca" [attr.data-emocion]="estadoAsistente().emocion"></div>
          </div>
          <div class="pulso-energia" [style.opacity]="estadoAsistente().nivelEnergia / 100"></div>
        </div>
        <div class="tooltip-asistente">
          <span>¡Hola! Soy InnoBot 🤖</span>
          <div class="flecha-tooltip"></div>
        </div>
      </div>
    }

    <!-- Panel completo del asistente -->
    @if (estadoAsistente().activo) {
      <div class="panel-asistente">
        <!-- Header del asistente -->
        <div class="header-asistente">
          <div class="info-asistente">
            <div class="avatar-principal" [attr.data-animacion]="estadoAsistente().animacion">
              <div class="cara-principal">
                <div class="ojos-principales">
                  <div class="ojo-principal" 
                       [class.parpadeando]="estadoAsistente().animacion === 'idle'">
                    <div class="pupila"></div>
                  </div>
                  <div class="ojo-principal"
                       [class.parpadeando]="estadoAsistente().animacion === 'idle'">
                    <div class="pupila"></div>
                  </div>
                </div>
                <div class="boca-principal" 
                     [attr.data-emocion]="estadoAsistente().emocion"
                     [attr.data-animacion]="estadoAsistente().animacion">
                </div>
                <div class="mejillas" 
                     [class.sonriendo]="estadoAsistente().emocion === 'feliz'">
                </div>
              </div>
              
              <!-- Efectos especiales -->
              <div class="efectos-avatar">
                @if (estadoAsistente().animacion === 'pensando') {
                  <div class="puntos-pensamiento">
                    <div class="punto"></div>
                    <div class="punto"></div>
                    <div class="punto"></div>
                  </div>
                }
                
                @if (estadoAsistente().animacion === 'celebrando') {
                  <div class="particulas-celebracion">
                    @for (particula of particulasCelebracion; track particula.id) {
                      <div class="particula" 
                           [style.left.px]="particula.x"
                           [style.top.px]="particula.y"
                           [style.background]="particula.color">
                      </div>
                    }
                  </div>
                }

                @if (estadoAsistente().escuchando) {
                  <div class="ondas-sonido">
                    <div class="onda"></div>
                    <div class="onda"></div>
                    <div class="onda"></div>
                  </div>
                }
              </div>

              <!-- Indicador de energía -->
              <div class="barra-energia">
                <div class="energia-fill" 
                     [style.width.%]="estadoAsistente().nivelEnergia"
                     [attr.data-nivel]="obtenerNivelEnergia()">
                </div>
              </div>
            </div>

            <div class="datos-asistente">
              <div class="nombre-asistente">{{ configuracion().nombre }}</div>
              <div class="estado-asistente">
                @switch (estadoAsistente().animacion) {
                  @case ('idle') { 
                    <span>😌 Esperando...</span>
                  }
                  @case ('hablando') { 
                    <span>💬 Respondiendo...</span>
                  }
                  @case ('escuchando') { 
                    <span>👂 Escuchando...</span>
                  }
                  @case ('pensando') { 
                    <span>🤔 Procesando...</span>
                  }
                  @case ('celebrando') { 
                    <span>🎉 ¡Genial!</span>
                  }
                  @case ('confundido') { 
                    <span>😕 Hmm...</span>
                  }
                }
              </div>
              <div class="personalidad">
                Modo: {{ configuracion().personalidad }}
              </div>
            </div>
          </div>

          <div class="controles-asistente">
            <!-- Control de voz -->
            <button class="btn-control voz" 
                    [class.activo]="estadoAsistente().escuchando"
                    (click)="toggleVoz()"
                    [disabled]="!soportaVoz">
              <span class="icono">{{ estadoAsistente().escuchando ? '🔴' : '🎤' }}</span>
              <div class="tooltip">{{ estadoAsistente().escuchando ? 'Detener' : 'Hablar' }}</div>
            </button>

            <!-- Configuración -->
            <button class="btn-control config" 
                    (click)="toggleConfiguracion()">
              <span class="icono">⚙️</span>
              <div class="tooltip">Configuración</div>
            </button>

            <!-- Minimizar/Cerrar -->
            <button class="btn-control cerrar" 
                    (click)="toggleAsistente()">
              <span class="icono">✕</span>
              <div class="tooltip">Cerrar</div>
            </button>
          </div>
        </div>

        <!-- Área de chat -->
        <div class="area-chat" #areaChat>
          <div class="historial-chat">
            @for (mensaje of historialChat(); track mensaje.id) {
              <div class="mensaje" [attr.data-tipo]="mensaje.tipo">
                @if (mensaje.tipo === 'usuario') {
                  <div class="contenido-mensaje usuario">
                    <div class="avatar-usuario">👤</div>
                    <div class="texto-mensaje">{{ mensaje.contenido }}</div>
                    <div class="timestamp">{{ formatearTiempo(mensaje.timestamp) }}</div>
                  </div>
                } @else if (mensaje.tipo === 'asistente') {
                  <div class="contenido-mensaje asistente">
                    <div class="avatar-asistente-mini">🤖</div>
                    <div class="texto-mensaje">
                      <div class="texto-principal" [innerHTML]="formatearMensaje(mensaje.contenido)"></div>
                      
                      @if (mensaje.metadata && mensaje.metadata.accionSugerida) {
                        <div class="accion-sugerida">
                          <button class="btn-accion-sugerida" 
                                  (click)="ejecutarAccion(mensaje.metadata.accionSugerida)">
                            <span class="icono">{{ mensaje.metadata.accionSugerida.icono }}</span>
                            <span class="texto">{{ mensaje.metadata.accionSugerida.titulo }}</span>
                          </button>
                        </div>
                      }

                      @if (mensaje.metadata && mensaje.metadata.confianza !== undefined && mensaje.metadata.confianza !== null) {
                        <div class="metadata-mensaje">
                          <div class="confianza" [attr.data-nivel]="obtenerNivelConfianza(mensaje.metadata.confianza)">
                            Confianza: {{ (mensaje.metadata.confianza * 100).toFixed(0) }}%
                          </div>
                        </div>
                      }
                    </div>
                    <div class="timestamp">{{ formatearTiempo(mensaje.timestamp) }}</div>
                  </div>
                }
              </div>
            }

            <!-- Indicador de escritura -->
            @if (estadoAsistente().escribiendo) {
              <div class="mensaje escribiendo">
                <div class="contenido-mensaje asistente">
                  <div class="avatar-asistente-mini">🤖</div>
                  <div class="indicador-escritura">
                    <div class="punto-escritura"></div>
                    <div class="punto-escritura"></div>
                    <div class="punto-escritura"></div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Sugerencias rápidas -->
          @if (sugerenciasActivas().length > 0 && !estadoAsistente().escribiendo) {
            <div class="sugerencias-rapidas">
              <div class="titulo-sugerencias">💡 Sugerencias:</div>
              <div class="lista-sugerencias">
                @for (sugerencia of sugerenciasActivas(); track sugerencia.id) {
                  <button class="chip-sugerencia" 
                          (click)="ejecutarAccion(sugerencia)">
                    <span class="icono">{{ sugerencia.icono }}</span>
                    <span class="texto">{{ sugerencia.titulo }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Input de mensaje -->
        <div class="input-mensaje">
          <div class="contenedor-input">
            <input 
              type="text" 
              [(ngModel)]="mensajeActual"
              (keyup.enter)="enviarMensaje()"
              placeholder="Escribe tu mensaje o pregunta..."
              class="campo-mensaje"
              [disabled]="estadoAsistente().escribiendo"
              #inputMensaje>
            
            <div class="controles-input">
              <button class="btn-enviar" 
                      (click)="enviarMensaje()"
                      [disabled]="!mensajeActual.trim() || estadoAsistente().escribiendo">
                @if (estadoAsistente().escribiendo) {
                  <div class="loader-mini"></div>
                } @else {
                  <span class="icono">🚀</span>
                }
              </button>
            </div>
          </div>

          <!-- Accesos rápidos -->
          <div class="accesos-rapidos">
            <button class="btn-rapido" (click)="enviarMensajeRapido('ayuda')">
              ❓ Ayuda
            </button>
            <button class="btn-rapido" (click)="enviarMensajeRapido('tutorial')">
              🎓 Tutorial
            </button>
            <button class="btn-rapido" (click)="enviarMensajeRapido('optimizar')">
              🚀 Optimizar
            </button>
            <button class="btn-rapido" (click)="limpiarChat()">
              🗑️ Limpiar
            </button>
          </div>
        </div>

        <!-- Panel de configuración -->
        @if (mostrarConfiguracion()) {
          <div class="panel-configuracion">
            <div class="header-config">
              <h3>⚙️ Configuración del Asistente</h3>
              <button class="btn-cerrar-config" (click)="toggleConfiguracion()">✕</button>
            </div>
            
            <div class="opciones-config">
              <div class="grupo-config">
                <label>Nombre del asistente:</label>
                <input type="text" 
                       [(ngModel)]="configuracionTemporal.nombre"
                       (change)="actualizarConfiguracion()"
                       class="input-config">
              </div>

              <div class="grupo-config">
                <label>Personalidad:</label>
                <select [(ngModel)]="configuracionTemporal.personalidad"
                        (change)="actualizarConfiguracion()"
                        class="select-config">
                  <option value="profesional">🎯 Profesional</option>
                  <option value="amigable">😊 Amigable</option>
                  <option value="gracioso">😄 Gracioso</option>
                  <option value="tecnico">🤓 Técnico</option>
                </select>
              </div>

              <div class="grupo-config">
                <label>Velocidad de habla:</label>
                <input type="range" 
                       min="0.5" 
                       max="2" 
                       step="0.1"
                       [(ngModel)]="configuracionTemporal.velocidadHabla"
                       (change)="actualizarConfiguracion()"
                       class="range-config">
                <span>{{ configuracionTemporal.velocidadHabla }}x</span>
              </div>

              <div class="grupo-config checkbox">
                <label>
                  <input type="checkbox" 
                         [(ngModel)]="configuracionTemporal.usarVoz"
                         (change)="actualizarConfiguracion()">
                  <span class="checkmark"></span>
                  Usar síntesis de voz
                </label>
              </div>

              <div class="grupo-config checkbox">
                <label>
                  <input type="checkbox" 
                         [(ngModel)]="configuracionTemporal.mostrarSugerencias"
                         (change)="actualizarConfiguracion()">
                  <span class="checkmark"></span>
                  Mostrar sugerencias inteligentes
                </label>
              </div>

              <div class="grupo-config checkbox">
                <label>
                  <input type="checkbox" 
                         [(ngModel)]="configuracionTemporal.modoTutorial"
                         (change)="actualizarConfiguracion()">
                  <span class="checkmark"></span>
                  Modo tutorial interactivo
                </label>
              </div>
            </div>

            <!-- Estadísticas del asistente -->
            <div class="estadisticas-asistente">
              <h4>📊 Estadísticas</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="numero">{{ historialChat().length }}</span>
                  <span class="label">Mensajes</span>
                </div>
                <div class="stat-item">
                  <span class="numero">{{ capacidades().length }}</span>
                  <span class="label">Capacidades</span>
                </div>
                <div class="stat-item">
                  <span class="numero">{{ sugerenciasActivas().length }}</span>
                  <span class="label">Sugerencias</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class AsistenteIAComponent implements OnInit, OnDestroy {
  private readonly asistenteService = inject(AsistenteIAServicio);
  
  protected readonly estadoAsistente = this.asistenteService.estadoAsistente;
  protected readonly configuracion = this.asistenteService.configuracion;
  protected readonly historialChat = this.asistenteService.historialChat;
  protected readonly sugerenciasActivas = this.asistenteService.sugerenciasActivas;
  protected readonly capacidades = this.asistenteService.capacidades;

  protected readonly mostrarConfiguracion = signal(false);
  protected mensajeActual = '';
  protected configuracionTemporal: ConfiguracionAsistente = {
    nombre: 'InnoBot',
    personalidad: 'amigable',
    velocidadHabla: 1.0,
    usarVoz: true,
    mostrarSugerencias: true,
    modoTutorial: false,
    temaAvatar: 'robot',
    idioma: 'es'
  };

  protected soportaVoz = false;
  protected particulasCelebracion: Array<{ id: number, x: number, y: number, color: string }> = [];

  private subscriptions: Subscription[] = [];

  constructor() {
    // Efecto para generar partículas de celebración
    effect(() => {
      if (this.estadoAsistente().animacion === 'celebrando') {
        this.generarParticulasCelebracion();
      }
    });
  }

  ngOnInit(): void {
    this.configuracionTemporal = { ...this.configuracion() };
    this.verificarSoporteVoz();
    this.suscribirEventos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private verificarSoporteVoz(): void {
    this.soportaVoz = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  private suscribirEventos(): void {
    // Suscribirse a nuevos mensajes
    this.subscriptions.push(
      this.asistenteService.nuevoMensaje$.subscribe(mensaje => {
        this.scrollToBottom();
      })
    );

    // Suscribirse a cambios de estado
    this.subscriptions.push(
      this.asistenteService.estadoCambiado$.subscribe(estado => {
        // Lógica adicional si es necesaria
      })
    );
  }

  protected toggleAsistente(): void {
    this.asistenteService.toggleAsistente();
  }

  protected toggleVoz(): void {
    if (this.estadoAsistente().escuchando) {
      this.asistenteService.detenerEscucha();
    } else {
      this.asistenteService.iniciarEscucha();
    }
  }

  protected toggleConfiguracion(): void {
    this.mostrarConfiguracion.set(!this.mostrarConfiguracion());
  }

  protected enviarMensaje(): void {
    if (this.mensajeActual.trim()) {
      this.asistenteService.enviarMensaje(this.mensajeActual.trim());
      this.mensajeActual = '';
    }
  }

  protected enviarMensajeRapido(tipo: string): void {
    const mensajes = {
      ayuda: '¿Puedes ayudarme a usar InnoAd?',
      tutorial: 'Quiero aprender a crear una campaña',
      optimizar: '¿Cómo puedo optimizar mis campañas?'
    };

    const mensaje = mensajes[tipo as keyof typeof mensajes];
    if (mensaje) {
      this.asistenteService.enviarMensaje(mensaje);
    }
  }

  protected limpiarChat(): void {
    this.asistenteService.limpiarChat();
  }

  protected ejecutarAccion(accion: AccionSugerida): void {
    this.asistenteService.ejecutarAccion(accion);
  }

  protected actualizarConfiguracion(): void {
    this.asistenteService.actualizarConfiguracion(this.configuracionTemporal);
  }

  protected formatearTiempo(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  }

  protected formatearMensaje(contenido: string): string {
    // Convertir enlaces en HTML
    const conEnlaces = contenido.replace(
      /https?:\/\/[^\s]+/g,
      '<a href="$&" target="_blank" class="enlace-mensaje">$&</a>'
    );

    // Convertir saltos de línea
    return conEnlaces.replace(/\n/g, '<br>');
  }

  protected obtenerNivelEnergia(): string {
    const energia = this.estadoAsistente().nivelEnergia;
    if (energia < 30) return 'bajo';
    if (energia < 70) return 'medio';
    return 'alto';
  }

  protected obtenerNivelConfianza(confianza: number): string {
    if (confianza < 0.5) return 'baja';
    if (confianza < 0.8) return 'media';
    return 'alta';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const areaChat = document.querySelector('.historial-chat');
      if (areaChat) {
        areaChat.scrollTop = areaChat.scrollHeight;
      }
    }, 100);
  }

  private generarParticulasCelebracion(): void {
    const particulas = [];
    for (let i = 0; i < 10; i++) {
      particulas.push({
        id: i,
        x: Math.random() * 60,
        y: Math.random() * 60,
        color: ['#00d4ff', '#ff6b9d', '#f59e0b', '#22c55e'][Math.floor(Math.random() * 4)]
      });
    }
    this.particulasCelebracion = particulas;

    // Limpiar partículas después de la animación
    setTimeout(() => {
      this.particulasCelebracion = [];
    }, 2000);
  }
}
