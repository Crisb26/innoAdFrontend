import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DispositivoServicio, Dispositivo, AlertaDispositivo } from '../../../core/servicios/dispositivo.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-tecnico-dispositivos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dispositivos-container">
      <header class="header">
        <h1>📡 Monitoreo de Dispositivos IoT</h1>
        <div class="header-acciones">
          <button class="btn-prueba" (click)="forzarPrueba()">⚡ Forzar Prueba</button>
          <button class="btn-registrar" (click)="abrirRegistro()">+ Registrar Dispositivo</button>
        </div>
      </header>

      <!-- Resumen rápido -->
      <div class="resumen-estado">
        <div class="estado-card activos">
          <span class="numero">{{ estadoGeneral?.activosCount }}</span>
          <span class="label">Activos</span>
        </div>
        <div class="estado-card inactivos">
          <span class="numero">{{ estadoGeneral?.inactivosCount }}</span>
          <span class="label">Inactivos</span>
        </div>
        <div class="estado-card errores">
          <span class="numero">{{ estadoGeneral?.errorCount }}</span>
          <span class="label">Errores</span>
        </div>
        <div class="estado-card uptime">
          <span class="numero">{{ estadoGeneral?.uptimePromedio | number:'1.0' }}%</span>
          <span class="label">Uptime Promedio</span>
        </div>
      </div>

      <!-- Alertas pendientes -->
      <div *ngIf="alertasPendientes.length > 0" class="alertas-seccion">
        <h2>⚠️ Alertas Activas</h2>
        <div class="alertas-list">
          <div *ngFor="let alerta of alertasPendientes" class="alerta-item" [class.critica]="alerta.tipo === 'DESCONEXION'">
            <span class="icon">🔴</span>
            <div class="alerta-contenido">
              <strong>{{ alerta.dispositivoNombre }}</strong>
              <p>{{ alerta.mensaje }}</p>
              <small>{{ alerta.timestamp | date:'short' }}</small>
            </div>
            <button class="btn-resolver" (click)="resolverAlerta(alerta.id)">Resolver</button>
          </div>
        </div>
      </div>

      <!-- Tabla de dispositivos -->
      <div class="dispositivos-seccion">
        <h2>Dispositivos Registrados</h2>
        
        <div *ngIf="dispositivos.length === 0" class="sin-dispositivos">
          <p>No hay dispositivos registrados aún</p>
        </div>

        <div class="tabla-dispositivos">
          <div class="tabla-header">
            <div class="col-estado">Estado</div>
            <div class="col-nombre">Dispositivo</div>
            <div class="col-ubicacion">Ubicación</div>
            <div class="col-emitiendo">Emitiendo</div>
            <div class="col-uptime">Uptime</div>
            <div class="col-ultima-respuesta">Última Respuesta</div>
            <div class="col-acciones">Acciones</div>
          </div>

          <div *ngFor="let dispositivo of dispositivos" class="tabla-fila" [class.inactivo]="dispositivo.estado === 'INACTIVO'">
            <div class="col-estado">
              <span class="badge" [class]="'estado-' + dispositivo.estado.toLowerCase()">
                {{ estadoIcono(dispositivo.estado) }} {{ dispositivo.estado }}
              </span>
            </div>
            <div class="col-nombre">
              <strong>{{ dispositivo.nombre }}</strong>
              <small>#{{ dispositivo.codigo }}</small>
            </div>
            <div class="col-ubicacion">
              <span>{{ dispositivo.ubicacion.ciudad }}</span><br>
              <small>{{ dispositivo.ubicacion.lugar }}</small>
            </div>
            <div class="col-emitiendo">
              <span *ngIf="dispositivo.emitiendo" class="emitiendo-badge">
                📺 {{ dispositivo.publicacionActual?.cliente }}
              </span>
              <span *ngIf="!dispositivo.emitiendo" class="sin-emitir">—</span>
            </div>
            <div class="col-uptime">
              {{ dispositivo.estadisticas.uptime | number:'1.0' }}%
            </div>
            <div class="col-ultima-respuesta">
              {{ dispositivo.ultimaRespuesta | date:'short' || 'Nunca' }}
            </div>
            <div class="col-acciones">
              <button class="btn-ver" (click)="verDetalles(dispositivo)">👁️ Ver</button>
              <button class="btn-prueba-rápida" (click)="forzarPrueba(dispositivo.id)">⚡</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalles -->
      <div *ngIf="dispositivoSeleccionado" class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-contenido" (click)="$event.stopPropagation()">
          <button class="btn-cerrar-modal" (click)="cerrarModal()">×</button>

          <h2>{{ dispositivoSeleccionado.nombre }}</h2>
          
          <div class="modal-body">
            <div class="seccion-info">
              <h3>Información</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Código:</label>
                  <span>{{ dispositivoSeleccionado.codigo }}</span>
                </div>
                <div class="info-item">
                  <label>Ciudad:</label>
                  <span>{{ dispositivoSeleccionado.ubicacion.ciudad }}</span>
                </div>
                <div class="info-item">
                  <label>Ubicación:</label>
                  <span>{{ dispositivoSeleccionado.ubicacion.lugar }}</span>
                </div>
                <div class="info-item">
                  <label>Estado:</label>
                  <span [class]="'estado-' + dispositivoSeleccionado.estado.toLowerCase()">
                    {{ dispositivoSeleccionado.estado }}
                  </span>
                </div>
              </div>
            </div>

            <div class="seccion-estadisticas">
              <h3>Estadísticas</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <label>Uptime:</label>
                  <span class="stat-valor">{{ dispositivoSeleccionado.estadisticas.uptime | number:'1.0' }}%</span>
                </div>
                <div class="stat-item">
                  <label>Errores Totales:</label>
                  <span class="stat-valor">{{ dispositivoSeleccionado.estadisticas.errorCount }}</span>
                </div>
                <div class="stat-item">
                  <label>Última Respuesta:</label>
                  <span class="stat-valor">{{ dispositivoSeleccionado.ultimaRespuesta | date:'short' || 'N/A' }}</span>
                </div>
                <div class="stat-item" *ngIf="dispositivoSeleccionado.errorMessage">
                  <label>Último Error:</label>
                  <span class="stat-valor error">{{ dispositivoSeleccionado.errorMessage }}</span>
                </div>
              </div>
            </div>

            <div class="seccion-emisión" *ngIf="dispositivoSeleccionado.emitiendo">
              <h3>🎬 Emitiendo Ahora</h3>
              <div class="emision-info">
                <p><strong>Cliente:</strong> {{ dispositivoSeleccionado.publicacionActual?.cliente }}</p>
                <p><strong>Publicación:</strong> {{ dispositivoSeleccionado.publicacionActual?.titulo }}</p>
              </div>
            </div>

            <div class="acciones-modal">
              <button class="btn-prueba-completa" (click)="forzarPrueba(dispositivoSeleccionado!.id); cerrarModal()">
                ⚡ Prueba Inmediata
              </button>
              <button class="btn-eliminar" (click)="eliminarDispositivo(dispositivoSeleccionado!.id); cerrarModal()">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dispositivos-container {
      padding: 2rem;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      color: white;
    }

    .header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .header-acciones {
      display: flex;
      gap: 1rem;
    }

    .btn-prueba,
    .btn-registrar {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-prueba {
      background: #ff6b6b;
      color: white;
    }

    .btn-prueba:hover {
      background: #e63946;
    }

    .btn-registrar {
      background: #51cf66;
      color: white;
    }

    .btn-registrar:hover {
      background: #37b24d;
    }

    .resumen-estado {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .estado-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .estado-card .numero {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .estado-card.activos .numero {
      color: #51cf66;
    }

    .estado-card.inactivos .numero {
      color: #ff6b6b;
    }

    .estado-card.errores .numero {
      color: #ff922b;
    }

    .estado-card.uptime .numero {
      color: #4dabf7;
    }

    .estado-card .label {
      font-size: 0.85rem;
      color: #666;
    }

    .alertas-seccion {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .alertas-seccion h2 {
      margin-top: 0;
      color: #ff6b6b;
    }

    .alertas-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alerta-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f0f0f0;
      border-radius: 6px;
      border-left: 4px solid #ff922b;
    }

    .alerta-item.critica {
      border-left-color: #ff6b6b;
      background: #fff5f5;
    }

    .alerta-item .icon {
      font-size: 1.5rem;
    }

    .alerta-contenido {
      flex: 1;
    }

    .alerta-contenido strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .alerta-contenido p {
      margin: 0.25rem 0;
      color: #666;
    }

    .alerta-contenido small {
      color: #999;
    }

    .btn-resolver {
      padding: 0.5rem 1rem;
      background: #51cf66;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-resolver:hover {
      background: #37b24d;
    }

    .dispositivos-seccion {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .dispositivos-seccion h2 {
      margin-top: 0;
      color: #1a1a2e;
    }

    .sin-dispositivos {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .tabla-dispositivos {
      overflow-x: auto;
    }

    .tabla-header,
    .tabla-fila {
      display: grid;
      grid-template-columns: 120px 1fr 150px 150px 100px 150px 120px;
      gap: 1rem;
      padding: 1rem;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
    }

    .tabla-header {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .tabla-fila:hover {
      background: #f9f9f9;
    }

    .tabla-fila.inactivo {
      opacity: 0.6;
    }

    .col-estado {
      display: flex;
      justify-content: center;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .badge.estado-activo {
      background: #d4edda;
      color: #155724;
    }

    .badge.estado-inactivo {
      background: #f8d7da;
      color: #721c24;
    }

    .badge.estado-error {
      background: #ffe5e5;
      color: #c92a2a;
    }

    .col-nombre strong {
      display: block;
    }

    .col-nombre small {
      color: #999;
      font-size: 0.85rem;
    }

    .col-ubicacion {
      font-size: 0.9rem;
    }

    .col-ubicacion small {
      color: #999;
    }

    .emitiendo-badge {
      background: #c0eb75;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .sin-emitir {
      color: #ccc;
    }

    .col-acciones {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-ver,
    .btn-prueba-rápida {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .btn-ver {
      background: #4dabf7;
      color: white;
    }

    .btn-ver:hover {
      background: #1c92e0;
    }

    .btn-prueba-rápida {
      background: #fcc419;
      color: black;
      padding: 0.5rem;
    }

    .btn-prueba-rápida:hover {
      background: #fab005;
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
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .btn-cerrar-modal {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #f0f0f0;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-contenido h2 {
      color: #1a1a2e;
      margin-top: 0;
    }

    .modal-body {
      margin-bottom: 2rem;
    }

    .seccion-info,
    .seccion-estadisticas,
    .seccion-emisión {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .seccion-info h3,
    .seccion-estadisticas h3,
    .seccion-emisión h3 {
      color: #1a1a2e;
      margin-top: 0;
    }

    .info-grid,
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .info-item,
    .stat-item {
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .info-item label,
    .stat-item label {
      display: block;
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    .info-item span,
    .stat-valor {
      display: block;
      color: #333;
      font-weight: 500;
    }

    .stat-valor.error {
      color: #ff6b6b;
    }

    .emision-info {
      background: #d4edda;
      padding: 1rem;
      border-radius: 6px;
    }

    .emision-info p {
      margin: 0.5rem 0;
    }

    .acciones-modal {
      display: flex;
      gap: 1rem;
    }

    .btn-prueba-completa,
    .btn-eliminar {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-prueba-completa {
      background: #fcc419;
      color: black;
    }

    .btn-prueba-completa:hover {
      background: #fab005;
    }

    .btn-eliminar {
      background: #ff6b6b;
      color: white;
    }

    .btn-eliminar:hover {
      background: #e63946;
    }
  `]
})
export class TecnicoDispositivosComponent implements OnInit, OnDestroy {
  dispositivos: Dispositivo[] = [];
  alertasPendientes: AlertaDispositivo[] = [];
  dispositivoSeleccionado: Dispositivo | null = null;
  estadoGeneral: any = {
    totalDispositivos: 0,
    activosCount: 0,
    inactivosCount: 0,
    errorCount: 0,
    uptimePromedio: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private dispositivoServicio: DispositivoServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.permisosServicio.esTecnico()) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    this.cargarDispositivos();
    this.cargarAlertas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDispositivos(): void {
    this.dispositivoServicio.obtenerDispositivos$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(dispositivos => {
        this.dispositivos = dispositivos;
        this.actualizarEstadoGeneral();
      });
  }

  cargarAlertas(): void {
    this.dispositivoServicio.obtenerAlertas$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alertas => {
        this.alertasPendientes = alertas.filter(a => !a.resuelta);
      });
  }

  actualizarEstadoGeneral(): void {
    this.dispositivoServicio.obtenerEstadoGeneral()
      .pipe(takeUntil(this.destroy$))
      .subscribe(estado => {
        this.estadoGeneral = estado;
      });
  }

  forzarPrueba(id?: number): void {
    if (id) {
      this.dispositivoServicio.forzarPruebaSalud(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cargarDispositivos();
          this.cargarAlertas();
        });
    } else {
      this.dispositivoServicio.realizarPruebasSalud()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cargarDispositivos();
          this.cargarAlertas();
        });
    }
  }

  verDetalles(dispositivo: Dispositivo): void {
    this.dispositivoSeleccionado = dispositivo;
  }

  cerrarModal(): void {
    this.dispositivoSeleccionado = null;
  }

  resolverAlerta(alertaId: number): void {
    this.dispositivoServicio.marcarAlertaResuelta(alertaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarAlertas();
      });
  }

  eliminarDispositivo(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este dispositivo?')) {
      this.dispositivoServicio.eliminarDispositivo(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cargarDispositivos();
        });
    }
  }

  abrirRegistro(): void {
    // TODO: Implementar modal de registro
    alert('Modal de registro de dispositivos (en desarrollo)');
  }

  estadoIcono(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return '✅';
      case 'INACTIVO':
        return '❌';
      case 'ERROR':
        return '⚠️';
      default:
        return '❓';
    }
  }
}
