import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoreoSistemaService, EstadoSistema, EstadisticasRendimiento, ConfiguracionSistema } from '@core/servicios/monitoreo-sistema.servicio';
import { interval, Subscription, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-monitoreo-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./monitoreo-sistema.component.scss'],
  template: `
    <div class="monitoreo-container">
      <!-- Header -->
      <div class="header-section">
        <div class="titulo-seccion">
          <h2>📡 Monitoreo del Sistema</h2>
          <p>Estado en tiempo real de la infraestructura</p>
        </div>
        <div class="controles-header">
          <div class="estado-conexion" [attr.data-estado]="estadoConexion()">
            <div class="indicador-pulso"></div>
            {{ estadoConexion() === 'conectado' ? 'En línea' : 'Desconectado' }}
          </div>
          <button class="btn-futurista" (click)="toggleMonitoreo()">
            @if (monitoreando()) {
              <span class="icono">⏸️</span> Pausar
            } @else {
              <span class="icono">▶️</span> Reanudar
            }
          </button>
        </div>
      </div>

      <!-- Estado General del Sistema -->
      <div class="grid-estado-general">
        <div class="tarjeta-cristal estado-principal">
          <div class="estado-header">
            <h3>Estado General</h3>
            <div class="estado-indicador" [attr.data-estado]="estadoGeneral()">
              <div class="pulso"></div>
              {{ obtenerTextoEstado(estadoGeneral()) }}
            </div>
          </div>
          
          <div class="metricas-principales">
            @if (estadoSistema(); as estado) {
              <div class="metrica-item">
                <div class="metrica-icon">⚡</div>
                <div class="metrica-info">
                  <div class="metrica-label">CPU</div>
                  <div class="metrica-valor" [attr.data-nivel]="obtenerNivelMetrica(estado.cpu.porcentajeUso)">
                    {{ estado.cpu.porcentajeUso }}%
                  </div>
                </div>
                <div class="metrica-barra">
                  <div class="barra-progreso" 
                       [style.width.%]="estado.cpu.porcentajeUso"
                       [attr.data-nivel]="obtenerNivelMetrica(estado.cpu.porcentajeUso)">
                  </div>
                </div>
              </div>

              <div class="metrica-item">
                <div class="metrica-icon">💾</div>
                <div class="metrica-info">
                  <div class="metrica-label">RAM</div>
                  <div class="metrica-valor" [attr.data-nivel]="obtenerNivelMetrica(estado.memoria.porcentajeUso)">
                    {{ estado.memoria.porcentajeUso }}%
                  </div>
                </div>
                <div class="metrica-barra">
                  <div class="barra-progreso" 
                       [style.width.%]="estado.memoria.porcentajeUso"
                       [attr.data-nivel]="obtenerNivelMetrica(estado.memoria.porcentajeUso)">
                  </div>
                </div>
              </div>

              <div class="metrica-item">
                <div class="metrica-icon">💾</div>
                <div class="metrica-info">
                  <div class="metrica-label">Disco</div>
                  <div class="metrica-valor" [attr.data-nivel]="obtenerNivelMetrica(estado.disco.porcentajeUso)">
                    {{ estado.disco.porcentajeUso }}%
                  </div>
                </div>
                <div class="metrica-barra">
                  <div class="barra-progreso" 
                       [style.width.%]="estado.disco.porcentajeUso"
                       [attr.data-nivel]="obtenerNivelMetrica(estado.disco.porcentajeUso)">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="tarjeta-cristal servicios-estado">
          <h3>Estado de Servicios</h3>
          @if (estadoSistema()?.servicios; as servicios) {
            <div class="lista-servicios">
              @for (servicio of servicios; track servicio.nombre) {
                <div class="servicio-item">
                  <div class="servicio-info">
                    <div class="servicio-nombre">{{ servicio.nombre }}</div>
                    @if (servicio.puerto) {
                      <div class="servicio-puerto">Puerto: {{ servicio.puerto }}</div>
                    }
                  </div>
                  <div class="servicio-estado" [attr.data-estado]="servicio.estado">
                    @switch (servicio.estado) {
                      @case ('activo') { 
                        <span class="estado-icon"></span>
                        <span>Activo</span>
                      }
                      @case ('inactivo') { 
                        <span class="estado-icon"></span>
                        <span>Inactivo</span>
                      }
                      @case ('error') { 
                        <span class="estado-icon"></span>
                        <span>Error</span>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Gráficos de Rendimiento -->
      <div class="tarjeta-cristal graficos-rendimiento">
        <div class="graficos-header">
          <h3>📊 Rendimiento en Tiempo Real</h3>
          <div class="controles-grafico">
            <select [(ngModel)]="periodoGrafico" (change)="actualizarGraficos()" class="select-futurista">
              <option value="5m">Últimos 5 min</option>
              <option value="15m">Últimos 15 min</option>
              <option value="1h">Última hora</option>
              <option value="6h">Últimas 6 horas</option>
            </select>
          </div>
        </div>

        <div class="grid-graficos">
          <!-- Gráfico de CPU -->
          <div class="grafico-container">
            <div class="grafico-titulo">CPU (%)</div>
            <div class="grafico-area" #graficoCpu>
              @if (datosRendimiento(); as datos) {
                <svg viewBox="0 0 400 100" class="grafico-svg">
                  <defs>
                    <linearGradient id="gradienteCpu" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8" />
                      <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path [attr.d]="generarPathGrafico(datos.cpu)" 
                        fill="url(#gradienteCpu)" 
                        stroke="#00d4ff" 
                        stroke-width="2"/>
                </svg>
              }
            </div>
          </div>

          <!-- Gráfico de Memoria -->
          <div class="grafico-container">
            <div class="grafico-titulo">Memoria (%)</div>
            <div class="grafico-area" #graficoMemoria>
              @if (datosRendimiento(); as datos) {
                <svg viewBox="0 0 400 100" class="grafico-svg">
                  <defs>
                    <linearGradient id="gradienteMemoria" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.8" />
                      <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path [attr.d]="generarPathGrafico(datos.memoria)" 
                        fill="url(#gradienteMemoria)" 
                        stroke="#22c55e" 
                        stroke-width="2"/>
                </svg>
              }
            </div>
          </div>

          <!-- Gráfico de Red -->
          <div class="grafico-container">
            <div class="grafico-titulo">Red (MB/s)</div>
            <div class="grafico-area" #graficoRed>
              @if (datosRendimiento(); as datos) {
                <svg viewBox="0 0 400 100" class="grafico-svg">
                  <defs>
                    <linearGradient id="gradienteDisco" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.8" />
                      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path [attr.d]="generarPathGrafico(datos.disco)" 
                        fill="url(#gradienteDisco)" 
                        stroke="#f59e0b" 
                        stroke-width="2"/>
                </svg>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Logs del Sistema y Alertas -->
      <div class="grid-logs-alertas">
        <div class="tarjeta-cristal logs-sistema">
          <div class="logs-header">
            <h3>Logs del Sistema</h3>
            <button class="btn-secundario" (click)="limpiarLogs()">Limpiar</button>
          </div>
          <div class="logs-contenido">
            @if (logsSistema().length === 0) {
              <div class="empty-state-mini">
                <div class="empty-icon">📋</div>
                <p>Sin logs recientes</p>
              </div>
            } @else {
              @for (log of logsSistema(); track log.timestamp) {
                <div class="log-entry" [attr.data-nivel]="log.nivel">
                  <div class="log-timestamp">{{ formatearTimestamp(log.timestamp) }}</div>
                  <div class="log-mensaje">{{ log.mensaje }}</div>
                </div>
              }
            }
          </div>
        </div>

        <div class="tarjeta-cristal alertas-sistema">
          <div class="alertas-header">
            <h3>Alertas</h3>
            @if (alertasActivas().length > 0) {
              <div class="contador-alertas">{{ alertasActivas().length }}</div>
            }
          </div>
          <div class="alertas-contenido">
            @if (alertasActivas().length === 0) {
              <div class="empty-state-mini success">
                <div class="empty-icon">✓</div>
                <p>Sistema funcionando correctamente</p>
              </div>
            } @else {
              @for (alerta of alertasActivas(); track alerta.id) {
                <div class="alerta-item" [attr.data-tipo]="alerta.tipo">
                  <div class="alerta-icon">
                    @switch (alerta.tipo) {
                      @case ('critical') { 🔴 }
                      @case ('warning') { 🟡 }
                      @case ('info') { 🔵 }
                    }
                  </div>
                  <div class="alerta-contenido">
                    <div class="alerta-titulo">{{ alerta.titulo }}</div>
                    <div class="alerta-descripcion">{{ alerta.descripcion }}</div>
                    <div class="alerta-tiempo">{{ formatearTiempoRelativo(alerta.timestamp) }}</div>
                  </div>
                  <button class="btn-descartar" (click)="descartarAlerta(alerta.id)">✕</button>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Panel de Configuración -->
      <div class="tarjeta-cristal configuracion-panel">
        <div class="config-header">
          <h3>Configuración del Sistema</h3>
          <button class="btn-futurista" (click)="toggleConfiguracion()">
            {{ panelConfigAbierto() ? 'Cerrar' : 'Configurar' }}
          </button>
        </div>

        @if (panelConfigAbierto()) {
          <div class="config-contenido">
            @if (configuracion(); as config) {
              <div class="config-grid">
                <div class="config-grupo">
                  <h4>Monitoreo</h4>
                  <div class="config-item">
                    <label for="intervaloMonitoreo">Intervalo de actualización:</label>
                    <select id="intervaloMonitoreo" [(ngModel)]="config.monitoreo.intervaloActualizacion" 
                            (change)="actualizarConfiguracion()" class="select-futurista">
                      <option value="5000">5 segundos</option>
                      <option value="10000">10 segundos</option>
                      <option value="30000">30 segundos</option>
                      <option value="60000">1 minuto</option>
                    </select>
                  </div>
                  
                  <div class="config-item">
                    <label>
                      <input type="checkbox" 
                             [(ngModel)]="config.monitoreo.alertasHabilitadas"
                             (change)="actualizarConfiguracion()"
                             class="checkbox-futurista">
                      Alertas automáticas habilitadas
                    </label>
                  </div>
                </div>

                <div class="config-grupo">
                  <h4>Umbrales de Alerta</h4>
                  <div class="config-item">
                    <label for="umbralCpu">CPU (%):</label>
                    <input type="number" id="umbralCpu" 
                           [(ngModel)]="config.alertas.umbralCpu"
                           (change)="actualizarConfiguracion()"
                           min="0" max="100" class="input-futurista">
                  </div>
                  
                  <div class="config-item">
                    <label for="umbralMemoria">Memoria (%):</label>
                    <input type="number" id="umbralMemoria" 
                           [(ngModel)]="config.alertas.umbralMemoria"
                           (change)="actualizarConfiguracion()"
                           min="0" max="100" class="input-futurista">
                  </div>
                  
                  <div class="config-item">
                    <label for="umbralDisco">Disco (%):</label>
                    <input type="number" id="umbralDisco" 
                           [(ngModel)]="config.alertas.umbralDisco"
                           (change)="actualizarConfiguracion()"
                           min="0" max="100" class="input-futurista">
                  </div>
                </div>

                <div class="config-grupo">
                  <h4>Respaldos</h4>
                  <div class="config-item">
                    <label>
                      <input type="checkbox" 
                             [(ngModel)]="config.respaldos.automaticos"
                             (change)="actualizarConfiguracion()"
                             class="checkbox-futurista">
                      Respaldos automáticos
                    </label>
                  </div>
                  
                  <div class="config-item">
                    <label for="frecuenciaRespaldos">Frecuencia:</label>
                    <select id="frecuenciaRespaldos" [(ngModel)]="config.respaldos.frecuencia" 
                            (change)="actualizarConfiguracion()" class="select-futurista">
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>

                  <div class="config-acciones">
                    <button class="btn-futurista" (click)="crearRespaldoManual()">
                      []� Crear Respaldo
                    </button>
                    <button class="btn-secundario" (click)="verHistorialRespaldos()">
                      []� Ver Historial
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class MonitoreoSistemaComponent implements OnInit, OnDestroy {
  private readonly monitoreoService = inject(MonitoreoSistemaService);
  
  // Señales para el estado del componente
  protected readonly estadoSistema = signal<EstadoSistema | null>(null);
  protected readonly datosRendimiento = signal<EstadisticasRendimiento | null>(null);
  protected readonly configuracion = signal<ConfiguracionSistema | null>(null);
  protected readonly monitoreando = signal(true);
  protected readonly estadoConexion = signal<'conectado' | 'desconectado'>('conectado');
  protected readonly panelConfigAbierto = signal(false);
  
  // Logs y alertas
  protected readonly logsSistema = signal<Array<{
    timestamp: Date;
    nivel: 'info' | 'warning' | 'error';
    mensaje: string;
  }>>([]);
  
  protected readonly alertasActivas = signal<Array<{
    id: number;
    tipo: 'critical' | 'warning' | 'info';
    titulo: string;
    descripcion: string;
    timestamp: Date;
  }>>([]);

  // Configuración de gráficos
  protected periodoGrafico: 'hora' | 'dia' | 'semana' | 'mes' = 'hora';
  
  private monitoreoSubscription?: Subscription;

  ngOnInit(): void {
    this.cargarConfiguracion();
    this.iniciarMonitoreo();
  }

  ngOnDestroy(): void {
    this.detenerMonitoreo();
  }

  private async cargarConfiguracion(): Promise<void> {
    try {
      const config = await this.monitoreoService.obtenerConfiguracion().toPromise();
      this.configuracion.set(config || null);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  }

  private iniciarMonitoreo(): void {
    if (!this.monitoreando()) return;

    const intervalo = this.configuracion()?.monitoreo.intervaloActualizacion || 10000;
    
    this.monitoreoSubscription = interval(intervalo).pipe(
      startWith(0),
      switchMap(() => this.monitoreoService.obtenerEstadoSistema())
    ).subscribe({
      next: (estado) => {
        this.estadoSistema.set(estado);
        this.estadoConexion.set('conectado');
        this.verificarAlertas(estado);
        this.agregarLogSistema('info', 'Estado del sistema actualizado');
      },
      error: (error) => {
        console.error('Error obteniendo estado:', error);
        this.estadoConexion.set('desconectado');
        this.agregarLogSistema('error', 'Error conectando con el servidor de monitoreo');
      }
    });

    // Cargar datos de rendimiento
    this.actualizarGraficos();
  }

  private detenerMonitoreo(): void {
    this.monitoreoSubscription?.unsubscribe();
  }

  protected toggleMonitoreo(): void {
    if (this.monitoreando()) {
      this.detenerMonitoreo();
      this.monitoreando.set(false);
      this.agregarLogSistema('warning', 'Monitoreo pausado manualmente');
    } else {
      this.monitoreando.set(true);
      this.iniciarMonitoreo();
      this.agregarLogSistema('info', 'Monitoreo reanudado');
    }
  }

  protected toggleConfiguracion(): void {
    this.panelConfigAbierto.set(!this.panelConfigAbierto());
  }

  protected estadoGeneral(): 'saludable' | 'advertencia' | 'critico' {
    const estado = this.estadoSistema();
    if (!estado) return 'critico';

    const cpu = estado.cpu.porcentajeUso;
    const memoria = estado.memoria.porcentajeUso;
    const disco = estado.disco.porcentajeUso;

    if (cpu > 90 || memoria > 90 || disco > 95) {
      return 'critico';
    }

    if (cpu > 70 || memoria > 80 || disco > 85) {
      return 'advertencia';
    }

    return 'saludable';
  }

  protected obtenerTextoEstado(estado: string): string {
    switch (estado) {
      case 'saludable': return 'Sistema Saludable';
      case 'advertencia': return 'Requiere Atención';
      case 'critico': return 'Estado Crítico';
      default: return 'Desconocido';
    }
  }

  protected obtenerNivelMetrica(valor: number): 'bajo' | 'medio' | 'alto' {
    if (valor < 50) return 'bajo';
    if (valor < 80) return 'medio';
    return 'alto';
  }

  protected actualizarGraficos(): void {
    this.monitoreoService.obtenerEstadisticasRendimiento(this.periodoGrafico).subscribe({
      next: (datos) => this.datosRendimiento.set(datos),
      error: (error) => console.error('Error cargando gráficos:', error)
    });
  }

  protected generarPathGrafico(datos: { timestamp: Date; valor: number }[]): string {
    if (!datos || datos.length === 0) return '';

    const width = 400;
    const height = 100;
    const padding = 10;
    
    const valores = datos.map(d => d.valor);
    const maxVal = Math.max(...valores, 100);
    const minVal = Math.min(...valores, 0);
    const range = maxVal - minVal || 1;

    const points = valores.map((valor, index) => {
      const x = (index / (valores.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((valor - minVal) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    // Crear área cerrada
    const path = `M${padding},${height - padding} L${points.join(' L')} L${width - padding},${height - padding} Z`;
    
    return path;
  }

  protected actualizarConfiguracion(): void {
    const config = this.configuracion();
    if (config) {
      this.monitoreoService.actualizarConfiguracion(config).subscribe({
        next: () => {
          this.agregarLogSistema('info', 'Configuración actualizada');
          // Reiniciar monitoreo con nueva configuración
          if (this.monitoreando()) {
            this.detenerMonitoreo();
            this.iniciarMonitoreo();
          }
        },
        error: (error) => {
          console.error('Error actualizando configuración:', error);
          this.agregarLogSistema('error', 'Error actualizando configuración');
        }
      });
    }
  }

  protected crearRespaldoManual(): void {
    this.monitoreoService.crearRespaldo().subscribe({
      next: (resultado) => {
        this.agregarLogSistema('info', `Respaldo creado: ${resultado.archivoRespaldo}`);
      },
      error: (error) => {
        console.error('Error creando respaldo:', error);
        this.agregarLogSistema('error', 'Error creando respaldo manual');
      }
    });
  }

  protected verHistorialRespaldos(): void {
    // Implementar navegación a historial de respaldos
    console.log('Ver historial de respaldos');
  }

  protected limpiarLogs(): void {
    this.logsSistema.set([]);
  }

  protected descartarAlerta(alertaId: number): void {
    const alertasActuales = this.alertasActivas();
    const alertasFiltradas = alertasActuales.filter(a => a.id !== alertaId);
    this.alertasActivas.set(alertasFiltradas);
  }

  protected formatearTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  }

  protected formatearTiempoRelativo(timestamp: Date): string {
    const ahora = new Date();
    const fecha = new Date(timestamp);
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'hace un momento';
  }

  private verificarAlertas(estado: EstadoSistema): void {
    const config = this.configuracion();
    if (!config?.alertas || !config.monitoreo.alertasHabilitadas) return;

    const alertasNuevas: Array<{
      id: number;
      tipo: 'critical' | 'warning' | 'info';
      titulo: string;
      descripcion: string;
      timestamp: Date;
    }> = [];

    // Verificar CPU
    if (estado.cpu.porcentajeUso > config.alertas.umbralCpu) {
      alertasNuevas.push({
        id: Date.now() + 1,
        tipo: estado.cpu.porcentajeUso > 90 ? 'critical' : 'warning',
        titulo: 'Uso alto de CPU',
        descripcion: `El uso de CPU ha alcanzado ${estado.cpu.porcentajeUso}%`,
        timestamp: new Date()
      });
    }

    // Verificar Memoria
    if (estado.memoria.porcentajeUso > config.alertas.umbralMemoria) {
      alertasNuevas.push({
        id: Date.now() + 2,
        tipo: estado.memoria.porcentajeUso > 95 ? 'critical' : 'warning',
        titulo: 'Uso alto de memoria',
        descripcion: `El uso de memoria ha alcanzado ${estado.memoria.porcentajeUso}%`,
        timestamp: new Date()
      });
    }

    // Verificar Disco
    if (estado.disco.porcentajeUso > config.alertas.umbralDisco) {
      alertasNuevas.push({
        id: Date.now() + 3,
        tipo: estado.disco.porcentajeUso > 95 ? 'critical' : 'warning',
        titulo: 'Espacio en disco bajo',
        descripcion: `El uso de disco ha alcanzado ${estado.disco.porcentajeUso}%`,
        timestamp: new Date()
      });
    }

    if (alertasNuevas.length > 0) {
      const alertasExistentes = this.alertasActivas();
      this.alertasActivas.set([...alertasExistentes, ...alertasNuevas]);
    }
  }

  private agregarLogSistema(nivel: 'info' | 'warning' | 'error', mensaje: string): void {
    const logsActuales = this.logsSistema();
    const nuevoLog = {
      timestamp: new Date(),
      nivel,
      mensaje
    };
    
    // Mantener solo los últimos 50 logs
    const logsActualizados = [nuevoLog, ...logsActuales].slice(0, 50);
    this.logsSistema.set(logsActualizados);
  }
}
