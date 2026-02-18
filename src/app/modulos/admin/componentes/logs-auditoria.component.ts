import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogsAuditoriaService, LogAuditoria, FiltrosLogs, EstadisticasLogs } from '@core/servicios/logs-auditoria.servicio';

@Component({
  selector: 'app-logs-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./logs-auditoria.component.scss'],
  template: `
    <div class="logs-container">
      <!-- Header -->
      <div class="header-section">
        <div class="titulo-seccion">
          <h2>[]� Logs de Auditoría</h2>
          <p>Registro completo de actividades del sistema</p>
        </div>
        <div class="acciones-header">
          <button class="btn-futurista" (click)="exportarLogs()">
            <span class="icono">[]�</span>
            Exportar
          </button>
          <button class="btn-futurista" (click)="refrescarLogs()">
            <span class="icono">[]�</span>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="grid-estadisticas">
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon"></div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.totalLogs || 0 }}</div>
            <div class="stat-label">Total Logs</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon"></div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.logsHoy || 0 }}</div>
            <div class="stat-label">Hoy</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon error"></div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.erroresRecientes || 0 }}</div>
            <div class="stat-label">Errores Recientes</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon"></div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.accionesAdmin || 0 }}</div>
            <div class="stat-label">Acciones Admin</div>
          </div>
        </div>
      </div>

      <!-- Filtros Avanzados -->
      <div class="tarjeta-cristal filtros-section">
        <div class="filtros-header">
          <h3>Filtros de Búsqueda</h3>
          <button class="btn-limpiar" (click)="limpiarFiltros()">Limpiar Filtros</button>
        </div>
        
        <div class="filtros-grid">
          <div class="campo-filtro">
            <label>Tipo de Log:</label>
            <select [(ngModel)]="filtros.tipo" (change)="aplicarFiltros()" class="select-futurista">
              <option value="">Todos</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="security">Seguridad</option>
            </select>
          </div>

          <div class="campo-filtro">
            <label>Usuario:</label>
            <select [(ngModel)]="filtros.usuario" (change)="aplicarFiltros()" class="select-futurista">
              <option value="">Todos los usuarios</option>
              @for (usuario of usuariosActivos(); track usuario.id) {
                <option [value]="usuario.id">{{ usuario.nombre }}</option>
              }
            </select>
          </div>

          <div class="campo-filtro">
            <label>Acción:</label>
            <select [(ngModel)]="filtros.accion" (change)="aplicarFiltros()" class="select-futurista">
              <option value="">Todas las acciones</option>
              @for (accion of accionesDisponibles(); track accion) {
                <option [value]="accion">{{ accion }}</option>
              }
            </select>
          </div>

          <div class="campo-filtro">
            <label>Desde:</label>
            <input 
              type="datetime-local" 
              [(ngModel)]="fechaDesde" 
              (change)="actualizarFechaFiltro('desde')"
              class="input-fecha"
            >
          </div>

          <div class="campo-filtro">
            <label>Hasta:</label>
            <input 
              type="datetime-local" 
              [(ngModel)]="fechaHasta" 
              (change)="actualizarFechaFiltro('hasta')"
              class="input-fecha"
            >
          </div>

          <div class="campo-filtro">
            <label>IP Address:</label>
            <input 
              type="text" 
              [(ngModel)]="filtros.ip" 
              (input)="aplicarFiltroConDelay()"
              placeholder="192.168.1.1"
              class="input-futurista"
            >
          </div>
        </div>
      </div>

      <!-- Lista de Logs -->
      <div class="tarjeta-cristal logs-section">
        <div class="logs-header">
          <h3>Registro de Actividades</h3>
          <div class="logs-info">
            <span>Total: {{ totalLogs() }}</span>
            @if (filtrosActivos()) {
              <span class="filtros-activos">Filtros aplicados</span>
            }
          </div>
        </div>

        @if (cargando()) {
          <div class="loading-state">
            <div class="loader"></div>
            <p>Cargando logs...</p>
          </div>
        } @else if (logs().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">[]�</div>
            <h3>No se encontraron registros</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        } @else {
          <div class="logs-timeline">
            @for (log of logs(); track log.id) {
              <div class="log-item" [attr.data-tipo]="log.tipo">
                <div class="log-timestamp">
                  <div class="fecha">{{ formatearFecha(log.fecha) }}</div>
                  <div class="hora">{{ formatearHora(log.fecha) }}</div>
                </div>

                <div class="log-indicator">
                  <div class="log-icon" [attr.data-tipo]="log.tipo">
                    @switch (log.tipo) {
                      @case ('info') { <span></span> }
                      @case ('warning') { <span></span> }
                      @case ('error') { <span></span> }
                      @case ('security') { <span></span> }
                    }
                  </div>
                </div>

                <div class="log-content">
                  <div class="log-header">
                    <div class="log-accion">{{ log.accion }}</div>
                    <div class="log-tipo-badge" [attr.data-tipo]="log.tipo">
                      {{ log.tipo.toUpperCase() }}
                    </div>
                  </div>

                  <div class="log-descripcion">{{ log.descripcion }}</div>

                  <div class="log-metadata">
                    <div class="metadata-item">
                      @if (log.usuario) {
                        <span class="metadata-label">Usuario:</span>
                        <span class="metadata-value">{{ log.usuario.nombre }} ({{ log.usuario.email }})</span>
                      } @else {
                        <span class="metadata-label">Sistema</span>
                      }
                    </div>
                    
                    <div class="metadata-item">
                      <span class="metadata-label">IP:</span>
                      <span class="metadata-value">{{ log.ip }}</span>
                    </div>

                    @if (log.recurso) {
                      <div class="metadata-item">
                        <span class="metadata-label">Recurso:</span>
                        <span class="metadata-value">{{ log.recurso }}</span>
                      </div>
                    }

                    @if (log.parametros && this.obtenerCantidadParametros(log.parametros) > 0) {
                      <div class="metadata-item">
                        <span class="metadata-label">Parámetros:</span>
                        <button 
                          class="btn-expandir" 
                          (click)="toggleParametros(log.id)"
                          [class.expandido]="parametrosExpandidos().has(log.id)"
                        >
                          Ver detalles {{ parametrosExpandidos().has(log.id) ? '▲' : '▼' }}
                        </button>
                      </div>
                    }
                  </div>

                  @if (log.parametros && parametrosExpandidos().has(log.id)) {
                    <div class="parametros-expandidos">
                      <pre>{{ formatearJSON(log.parametros) }}</pre>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Paginación -->
          @if (totalPaginas() > 1) {
            <div class="paginacion">
              <button 
                class="btn-pagina" 
                (click)="cambiarPagina(paginaActual() - 1)"
                [disabled]="paginaActual() === 1"
              >
                ← Anterior
              </button>
              
              <div class="numeros-pagina">
                @for (pagina of obtenerPaginas(); track pagina) {
                  <button 
                    class="btn-numero-pagina" 
                    [class.activa]="pagina === paginaActual()"
                    (click)="cambiarPagina(pagina)"
                  >
                    {{ pagina }}
                  </button>
                }
              </div>
              
              <button 
                class="btn-pagina" 
                (click)="cambiarPagina(paginaActual() + 1)"
                [disabled]="paginaActual() === totalPaginas()"
              >
                Siguiente →
              </button>
            </div>
          }
        }
      </div>

      <!-- Modal de Mantenimiento de Logs -->
      @if (modalMantenimiento()) {
        <div class="modal-overlay" (click)="cerrarModalMantenimiento()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>[]� Mantenimiento de Logs</h3>
              <button class="btn-cerrar" (click)="cerrarModalMantenimiento()">✕</button>
            </div>
            <div class="modal-body">
              <div class="campo-form">
                <label for="diasAntiguedad">Eliminar logs anteriores a:</label>
                <select id="diasAntiguedad" [(ngModel)]="diasLimpieza" class="select-futurista">
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                  <option value="180">6 meses</option>
                  <option value="365">1 año</option>
                </select>
              </div>
              <div class="advertencia">
                <strong>[][] Esta acción no se puede deshacer.</strong><br>
                Se eliminarán permanentemente los logs seleccionados.
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secundario" (click)="cerrarModalMantenimiento()">
                Cancelar
              </button>
              <button class="btn-peligro" (click)="limpiarLogsAntiguos()">
                Eliminar Logs
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class LogsAuditoriaComponent implements OnInit {
  private readonly logsService = inject(LogsAuditoriaService);

  protected readonly logs = signal<LogAuditoria[]>([]);
  protected readonly estadisticas = signal<EstadisticasLogs | null>(null);
  protected readonly usuariosActivos = signal<Array<{ id: number, nombre: string, email: string }>>([]);
  protected readonly accionesDisponibles = signal<string[]>([]);
  protected readonly cargando = signal(true);
  protected readonly totalLogs = signal(0);
  protected readonly paginaActual = signal(1);
  protected readonly totalPaginas = signal(1);
  protected readonly parametrosExpandidos = signal(new Set<number>());
  
  // Modal
  protected readonly modalMantenimiento = signal(false);
  protected diasLimpieza = 90;

  // Filtros
  protected filtros: FiltrosLogs = {
    pagina: 1,
    limite: 50
  };

  protected fechaDesde = '';
  protected fechaHasta = '';
  private filtroTimeout: any;

  ngOnInit(): void {
    this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    try {
      this.cargando.set(true);
      
      const [logsData, stats, usuarios, acciones] = await Promise.all([
        this.logsService.obtenerLogs(this.filtros).toPromise(),
        this.logsService.obtenerEstadisticas().toPromise(),
        this.logsService.obtenerUsuariosConActividad().toPromise(),
        this.logsService.obtenerAccionesDisponibles().toPromise()
      ]);

      this.logs.set(logsData?.logs || []);
      this.totalLogs.set(logsData?.total || 0);
      this.estadisticas.set(stats || null);
      this.usuariosActivos.set(usuarios || []);
      this.accionesDisponibles.set(acciones || []);
      
      this.calcularTotalPaginas();
      
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  private calcularTotalPaginas(): void {
    const limite = this.filtros.limite || 50;
    const total = Math.ceil(this.totalLogs() / limite);
    this.totalPaginas.set(Math.max(1, total));
  }

  protected refrescarLogs(): void {
    this.cargarDatos();
  }

  protected aplicarFiltros(): void {
    this.filtros.pagina = 1;
    this.paginaActual.set(1);
    this.cargarDatos();
  }

  protected aplicarFiltroConDelay(): void {
    clearTimeout(this.filtroTimeout);
    this.filtroTimeout = setTimeout(() => {
      this.aplicarFiltros();
    }, 500);
  }

  protected limpiarFiltros(): void {
    this.filtros = { pagina: 1, limite: 50 };
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargarDatos();
  }

  protected actualizarFechaFiltro(tipo: 'desde' | 'hasta'): void {
    if (tipo === 'desde' && this.fechaDesde) {
      this.filtros.desde = new Date(this.fechaDesde);
    } else if (tipo === 'hasta' && this.fechaHasta) {
      this.filtros.hasta = new Date(this.fechaHasta);
    }
    this.aplicarFiltros();
  }

  protected filtrosActivos(): boolean {
    return !!(this.filtros.tipo || this.filtros.usuario || this.filtros.accion || 
              this.filtros.ip || this.filtros.desde || this.filtros.hasta);
  }

  protected cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
      this.filtros.pagina = pagina;
      this.cargarDatos();
    }
  }

  protected obtenerPaginas(): number[] {
    const actual = this.paginaActual();
    const total = this.totalPaginas();
    const paginas: number[] = [];

    // Mostrar hasta 5 páginas alrededor de la actual
    let inicio = Math.max(1, actual - 2);
    let fin = Math.min(total, actual + 2);

    // Ajustar si estamos cerca del inicio o fin
    if (fin - inicio < 4) {
      if (inicio === 1) {
        fin = Math.min(total, inicio + 4);
      } else {
        inicio = Math.max(1, fin - 4);
      }
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  protected toggleParametros(logId: number): void {
    const expandidos = this.parametrosExpandidos();
    if (expandidos.has(logId)) {
      expandidos.delete(logId);
    } else {
      expandidos.add(logId);
    }
    this.parametrosExpandidos.set(new Set(expandidos));
  }

  protected formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(fecha));
  }

  protected formatearHora(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(fecha));
  }

  protected formatearJSON(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  protected exportarLogs(): void {
    this.logsService.exportarLogs(this.filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exportando logs:', error)
    });
  }

  protected abrirModalMantenimiento(): void {
    this.modalMantenimiento.set(true);
  }

  protected cerrarModalMantenimiento(): void {
    this.modalMantenimiento.set(false);
  }

  protected limpiarLogsAntiguos(): void {
    this.logsService.limpiarLogsAntiguos(this.diasLimpieza).subscribe({
      next: (resultado) => {
        console.log(`Logs limpiados: ${resultado.eliminados}`);
        this.cerrarModalMantenimiento();
        this.refrescarLogs();
      },
      error: (error) => console.error('Error limpiando logs:', error)
    });
  }

  /**
   * Obtener cantidad de parámetros de un objeto
   */
  protected obtenerCantidadParametros(obj: any): number {
    if (!obj || typeof obj !== 'object') return 0;
    return Object.keys(obj).length;
  }
}
