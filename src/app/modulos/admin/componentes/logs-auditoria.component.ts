import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogsAuditoriaService, LogAuditoria, FiltrosLogs, EstadisticasLogs } from '@core/servicios/logs-auditoria.servicio';

@Component({
  selector: 'app-logs-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="logs-container">
      <!-- Header -->
      <div class="header-section">
        <div class="titulo-seccion">
          <h2>📋 Logs de Auditoría</h2>
          <p>Registro completo de actividades del sistema</p>
        </div>
        <div class="acciones-header">
          <button class="btn-futurista" (click)="exportarLogs()">
            <span class="icono">📥</span>
            Exportar
          </button>
          <button class="btn-futurista" (click)="refrescarLogs()">
            <span class="icono">🔄</span>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="grid-estadisticas">
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.totalLogs || 0 }}</div>
            <div class="stat-label">Total Logs</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.logsHoy || 0 }}</div>
            <div class="stat-label">Hoy</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon error">❌</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.erroresRecientes || 0 }}</div>
            <div class="stat-label">Errores Recientes</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.accionesAdmin || 0 }}</div>
            <div class="stat-label">Acciones Admin</div>
          </div>
        </div>
      </div>

      <!-- Filtros Avanzados -->
      <div class="tarjeta-cristal filtros-section">
        <div class="filtros-header">
          <h3>🔍 Filtros de Búsqueda</h3>
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
            <div class="empty-icon">📋</div>
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
                      @case ('info') { <span>ℹ️</span> }
                      @case ('warning') { <span>⚠️</span> }
                      @case ('error') { <span>❌</span> }
                      @case ('security') { <span>🛡️</span> }
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
              <h3>🧹 Mantenimiento de Logs</h3>
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
                <strong>⚠️ Esta acción no se puede deshacer.</strong><br>
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
  `,
  styles: [`
    .logs-container {
      padding: var(--espacio-xl);
      max-width: 1600px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--espacio-xl);
    }

    .titulo-seccion h2 {
      background: var(--gradiente-principal);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }

    .acciones-header {
      display: flex;
      gap: var(--espacio-md);
    }

    .grid-estadisticas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--espacio-lg);
      margin-bottom: var(--espacio-xl);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--espacio-lg);
      padding: var(--espacio-lg);
    }

    .stat-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
    }

    .stat-icon.error {
      filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
      animation: parpadear 2s ease-in-out infinite;
    }

    .stat-numero {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-primario);
    }

    .stat-label {
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .filtros-section {
      margin-bottom: var(--espacio-lg);
      padding: var(--espacio-lg);
    }

    .filtros-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--espacio-lg);
    }

    .filtros-header h3 {
      color: var(--color-primario);
      margin: 0;
    }

    .btn-limpiar {
      background: transparent;
      border: 1px solid var(--color-texto-claro);
      color: var(--color-texto-claro);
      padding: var(--espacio-xs) var(--espacio-sm);
      border-radius: var(--radio-sm);
      cursor: pointer;
      transition: var(--transicion-suave);
      font-size: 0.9rem;
    }

    .btn-limpiar:hover {
      background: var(--color-texto-claro);
      color: var(--fondo-oscuro);
    }

    .filtros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--espacio-md);
    }

    .campo-filtro {
      display: flex;
      flex-direction: column;
      gap: var(--espacio-xs);
    }

    .campo-filtro label {
      font-size: 0.9rem;
      color: var(--color-texto-claro);
      font-weight: 500;
    }

    .select-futurista, .input-futurista, .input-fecha {
      padding: var(--espacio-sm);
      background: var(--cristal-claro);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radio-md);
      color: var(--color-texto);
      font-size: 0.9rem;
      transition: var(--transicion-suave);
    }

    .select-futurista:focus, .input-futurista:focus, .input-fecha:focus {
      outline: none;
      border-color: var(--color-primario);
      box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
    }

    .logs-section {
      padding: var(--espacio-lg);
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--espacio-lg);
      padding-bottom: var(--espacio-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logs-header h3 {
      color: var(--color-texto);
      margin: 0;
    }

    .logs-info {
      display: flex;
      gap: var(--espacio-md);
      font-size: 0.9rem;
      color: var(--color-texto-claro);
    }

    .filtros-activos {
      background: rgba(0, 212, 255, 0.2);
      color: var(--color-primario);
      padding: var(--espacio-xs) var(--espacio-sm);
      border-radius: var(--radio-sm);
      font-size: 0.8rem;
    }

    .logs-timeline {
      position: relative;
    }

    .logs-timeline::before {
      content: '';
      position: absolute;
      left: 60px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gradiente-principal);
      border-radius: 1px;
    }

    .log-item {
      position: relative;
      display: grid;
      grid-template-columns: 120px 40px 1fr;
      gap: var(--espacio-md);
      margin-bottom: var(--espacio-lg);
      padding-bottom: var(--espacio-lg);
    }

    .log-item:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    .log-timestamp {
      text-align: right;
      padding-right: var(--espacio-sm);
    }

    .fecha {
      font-size: 0.8rem;
      color: var(--color-texto-claro);
    }

    .hora {
      font-size: 0.9rem;
      color: var(--color-texto);
      font-weight: 500;
    }

    .log-indicator {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: var(--espacio-xs);
    }

    .log-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .log-icon[data-tipo="info"] {
      background: rgba(0, 212, 255, 0.2);
      border: 2px solid #00d4ff;
    }

    .log-icon[data-tipo="warning"] {
      background: rgba(245, 158, 11, 0.2);
      border: 2px solid #f59e0b;
    }

    .log-icon[data-tipo="error"] {
      background: rgba(239, 68, 68, 0.2);
      border: 2px solid #ef4444;
    }

    .log-icon[data-tipo="security"] {
      background: rgba(139, 92, 246, 0.2);
      border: 2px solid #8b5cf6;
    }

    .log-content {
      background: var(--cristal-claro);
      border-radius: var(--radio-lg);
      padding: var(--espacio-md);
      border-left: 4px solid transparent;
      transition: var(--transicion-suave);
    }

    .log-item[data-tipo="info"] .log-content {
      border-left-color: #00d4ff;
    }

    .log-item[data-tipo="warning"] .log-content {
      border-left-color: #f59e0b;
    }

    .log-item[data-tipo="error"] .log-content {
      border-left-color: #ef4444;
    }

    .log-item[data-tipo="security"] .log-content {
      border-left-color: #8b5cf6;
    }

    .log-content:hover {
      background: var(--cristal-hover);
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--espacio-sm);
    }

    .log-accion {
      font-weight: 600;
      color: var(--color-texto);
      font-size: 1.1rem;
    }

    .log-tipo-badge {
      padding: 2px var(--espacio-xs);
      border-radius: var(--radio-sm);
      font-size: 0.7rem;
      font-weight: 600;
    }

    .log-tipo-badge[data-tipo="info"] {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
    }

    .log-tipo-badge[data-tipo="warning"] {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .log-tipo-badge[data-tipo="error"] {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .log-tipo-badge[data-tipo="security"] {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }

    .log-descripcion {
      color: var(--color-texto-claro);
      margin-bottom: var(--espacio-md);
      line-height: 1.4;
    }

    .log-metadata {
      display: flex;
      flex-wrap: wrap;
      gap: var(--espacio-md);
      font-size: 0.8rem;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: var(--espacio-xs);
    }

    .metadata-label {
      color: var(--color-texto-medio);
      font-weight: 500;
    }

    .metadata-value {
      color: var(--color-texto-claro);
    }

    .btn-expandir {
      background: transparent;
      border: 1px solid var(--color-primario);
      color: var(--color-primario);
      padding: 2px var(--espacio-xs);
      border-radius: var(--radio-sm);
      cursor: pointer;
      transition: var(--transicion-suave);
      font-size: 0.8rem;
    }

    .btn-expandir:hover {
      background: var(--color-primario);
      color: var(--fondo-oscuro);
    }

    .parametros-expandidos {
      margin-top: var(--espacio-md);
      padding: var(--espacio-md);
      background: var(--fondo-oscuro);
      border-radius: var(--radio-md);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .parametros-expandidos pre {
      color: var(--color-texto-claro);
      font-size: 0.8rem;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }

    .paginacion {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--espacio-md);
      margin-top: var(--espacio-xl);
      padding-top: var(--espacio-lg);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-pagina, .btn-numero-pagina {
      padding: var(--espacio-sm) var(--espacio-md);
      background: var(--cristal-claro);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--color-texto-claro);
      border-radius: var(--radio-md);
      cursor: pointer;
      transition: var(--transicion-suave);
    }

    .btn-pagina:hover:not(:disabled), .btn-numero-pagina:hover {
      background: var(--cristal-hover);
      border-color: var(--color-primario);
    }

    .btn-pagina:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-numero-pagina.activa {
      background: var(--color-primario);
      color: var(--fondo-oscuro);
      border-color: var(--color-primario);
    }

    .numeros-pagina {
      display: flex;
      gap: var(--espacio-xs);
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: var(--espacio-2xl);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--espacio-lg);
      opacity: 0.5;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .logs-timeline::before {
        left: 20px;
      }

      .log-item {
        grid-template-columns: 1fr;
        gap: var(--espacio-sm);
      }

      .log-timestamp {
        text-align: left;
        padding-right: 0;
      }

      .log-indicator {
        position: absolute;
        left: 0;
        top: 0;
      }

      .log-content {
        margin-left: 40px;
      }

      .filtros-grid {
        grid-template-columns: 1fr;
      }

      .acciones-header {
        flex-direction: column;
      }
    }
  `]
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