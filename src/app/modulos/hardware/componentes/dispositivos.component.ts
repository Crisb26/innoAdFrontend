import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DispositivoIoT,
  ServicioHardwareAPI,
  EstadisticasDispositivo,
  ContenidoRemoto,
} from '../servicios/hardware-api.service.ts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dispositivos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-dispositivos">
      <!-- Header -->
      <div class="header-dispositivos">
        <h1>🔌 Gestión de Dispositivos IoT</h1>
        <div class="acciones-header">
          <button class="btn-primario" (click)="abrirModalNuevoDispositivo()">+ Nuevo Dispositivo</button>
          <button class="btn-secundario" (click)="actualizarDispositivos()">🔄 Actualizar</button>
        </div>
      </div>

      <!-- Estado Conexión WebSocket -->
      <div class="estado-conexion" [class.conectado]="wsConectado">
        <span class="indicador" [class.online]="wsConectado"></span>
        {{ wsConectado ? 'Conectado en tiempo real' : 'Desconectado' }}
      </div>

      <!-- Grid de Dispositivos -->
      <div class="grid-dispositivos">
        <div *ngFor="let dispositivo of dispositivos" class="card-dispositivo" [class.offline]="dispositivo.estado === 'offline'">
          <!-- Encabezado tarjeta -->
          <div class="tarjeta-header">
            <div class="info-basica">
              <h3>{{ dispositivo.nombre }}</h3>
              <p class="ubicacion">📍 {{ dispositivo.ubicacion }}</p>
            </div>
            <div class="badge-estado" [class]="'estado-' + dispositivo.estado">
              {{ dispositivo.estado | uppercase }}
            </div>
          </div>

          <!-- Detalles técnicos -->
          <div class="detalles-tecnicos">
            <div class="detalle-item">
              <span class="etiqueta">Tipo:</span>
              <span class="valor">{{ dispositivo.tipo | titlecase }}</span>
            </div>
            <div class="detalle-item">
              <span class="etiqueta">IP:</span>
              <span class="valor">{{ dispositivo.ipAddress }}</span>
            </div>
            <div class="detalle-item">
              <span class="etiqueta">Software:</span>
              <span class="valor">v{{ dispositivo.versionSoftware }}</span>
            </div>
            <div class="detalle-item">
              <span class="etiqueta">Última conexión:</span>
              <span class="valor">{{ formatearFecha(dispositivo.ultimaConexion) }}</span>
            </div>
          </div>

          <!-- Sensores (si existen) -->
          <div *ngIf="dispositivo.sensores" class="sensores-info">
            <div class="sensor-item">
              <span>🌡️ Temp:</span>
              <strong>{{ dispositivo.sensores.temperatura }}°C</strong>
            </div>
            <div class="sensor-item">
              <span>💧 Humedad:</span>
              <strong>{{ dispositivo.sensores.humedad }}%</strong>
            </div>
            <div class="sensor-item">
              <span>⚖️ Presión:</span>
              <strong>{{ dispositivo.sensores.presion }} hPa</strong>
            </div>
          </div>

          <!-- Acciones -->
          <div class="acciones-dispositivo">
            <button class="btn-accion" (click)="abrirEstadisticas(dispositivo)" title="Ver estadísticas">
              📊
            </button>
            <button
              class="btn-accion"
              [disabled]="dispositivo.estado === 'offline'"
              (click)="reproducirContenido(dispositivo)"
              title="Reproducir contenido"
            >
              ▶️
            </button>
            <button
              class="btn-accion"
              [disabled]="dispositivo.estado === 'offline'"
              (click)="pausarDispositivo(dispositivo)"
              title="Pausar"
            >
              ⏸️
            </button>
            <button
              class="btn-accion"
              [disabled]="dispositivo.estado === 'offline'"
              (click)="detenerDispositivo(dispositivo)"
              title="Detener"
            >
              ⏹️
            </button>
            <button class="btn-accion" (click)="sincronizar(dispositivo)" title="Sincronizar">
              🔄
            </button>
            <button
              class="btn-accion"
              [disabled]="dispositivo.estado === 'offline'"
              (click)="reiniciarDispositivo(dispositivo)"
              title="Reiniciar"
            >
              🔌
            </button>
            <button class="btn-accion" (click)="editarDispositivo(dispositivo)" title="Editar">
              ✏️
            </button>
            <button class="btn-accion btn-peligro" (click)="eliminarDispositivo(dispositivo)" title="Eliminar">
              🗑️
            </button>
          </div>

          <!-- Barra de progreso de sincronización -->
          <div *ngIf="dispositivoEnProceso === dispositivo.id" class="progreso-sync">
            <div class="barra-progreso">
              <div class="relleno"></div>
            </div>
            <span class="texto-sync">Sincronizando...</span>
          </div>
        </div>
      </div>

      <!-- Modal Estadísticas -->
      <div *ngIf="mostrarEstadisticas" class="modal-overlay" (click)="cerrarEstadisticas()">
        <div class="modal-contenido" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📊 Estadísticas - {{ dispositivoSeleccionado?.nombre }}</h2>
            <button class="btn-cerrar" (click)="cerrarEstadisticas()">✕</button>
          </div>

          <div *ngIf="estadisticasActuales" class="modal-body">
            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-label">Tiempo de Actividad</span>
                <span class="stat-valor">{{ estadisticasActuales.tiempoActividad }}h</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Confiabilidad</span>
                <span class="stat-valor">{{ estadisticasActuales.confiabilidad }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Comandos Ejecutados</span>
                <span class="stat-valor">{{ estadisticasActuales.commandosEjecutados }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Ancho de Banda</span>
                <span class="stat-valor">{{ estadisticasActuales.anchodeBanda }} Mbps</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Uso CPU</span>
                <span class="stat-valor">{{ estadisticasActuales.usoCPU }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Uso Memoria</span>
                <span class="stat-valor">{{ estadisticasActuales.usoMemoria }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Temperatura</span>
                <span class="stat-valor">{{ estadisticasActuales.temperatura }}°C</span>
              </div>
              <div *ngIf="estadisticasActuales.ultimoError" class="stat-item error">
                <span class="stat-label">Último Error</span>
                <span class="stat-valor">{{ estadisticasActuales.ultimoError }}</span>
              </div>
            </div>

            <div class="acciones-modal">
              <button class="btn-secundario" (click)="testConexion(dispositivoSeleccionado!)">
                🧪 Test de Conexión
              </button>
              <button class="btn-primario" (click)="actualizarSoftware(dispositivoSeleccionado!)">
                ⬆️ Actualizar Software
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensajes de estado -->
      <div *ngIf="mensaje" class="mensaje-estado" [class]="'tipo-' + mensaje.tipo">
        {{ mensaje.texto }}
        <button class="btn-cerrar-mensaje" (click)="mensaje = null">✕</button>
      </div>
    </div>
  `,
  styles: [
    `
      .container-dispositivos {
        padding: 24px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        min-height: 100vh;
        color: #e2e8f0;
      }

      .header-dispositivos {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid #4f46e5;
      }

      .header-dispositivos h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #4f46e5, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .acciones-header {
        display: flex;
        gap: 12px;
      }

      .btn-primario,
      .btn-secundario {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-primario {
        background: linear-gradient(135deg, #4f46e5, #a855f7);
        color: white;
      }

      .btn-primario:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
      }

      .btn-secundario {
        background: transparent;
        border: 2px solid #4f46e5;
        color: #4f46e5;
      }

      .btn-secundario:hover {
        background: rgba(79, 70, 229, 0.1);
      }

      .estado-conexion {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #1e293b;
        border-left: 4px solid #ef4444;
        border-radius: 4px;
        margin-bottom: 24px;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .estado-conexion.conectado {
        border-left-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }

      .indicador {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ef4444;
        animation: pulse 2s infinite;
      }

      .indicador.online {
        background: #10b981;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .grid-dispositivos {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }

      .card-dispositivo {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid #334155;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .card-dispositivo:hover {
        border-color: #4f46e5;
        box-shadow: 0 12px 32px rgba(79, 70, 229, 0.3);
        transform: translateY(-4px);
      }

      .card-dispositivo.offline {
        opacity: 0.6;
        border-color: #ef4444;
      }

      .tarjeta-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
      }

      .info-basica h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 700;
        color: #e2e8f0;
      }

      .ubicacion {
        margin: 0;
        font-size: 13px;
        color: #94a3b8;
      }

      .badge-estado {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        min-width: 70px;
      }

      .estado-online {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }

      .estado-offline {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .estado-error {
        background: rgba(249, 115, 22, 0.2);
        color: #f97316;
      }

      .detalles-tecnicos {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #334155;
      }

      .detalle-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }

      .detalle-item .etiqueta {
        color: #94a3b8;
        font-weight: 600;
      }

      .detalle-item .valor {
        color: #e2e8f0;
        font-family: monospace;
      }

      .sensores-info {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(79, 70, 229, 0.1);
        border-radius: 8px;
      }

      .sensor-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }

      .sensor-item span {
        color: #94a3b8;
      }

      .sensor-item strong {
        color: #4f46e5;
        font-size: 14px;
      }

      .acciones-dispositivo {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .btn-accion {
        flex: 1;
        min-width: 40px;
        padding: 8px;
        background: #334155;
        border: 1px solid #475569;
        border-radius: 6px;
        color: #e2e8f0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .btn-accion:hover:not(:disabled) {
        background: #4f46e5;
        border-color: #4f46e5;
        transform: scale(1.05);
      }

      .btn-accion:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .btn-accion.btn-peligro:hover:not(:disabled) {
        background: #ef4444;
        border-color: #ef4444;
      }

      .progreso-sync {
        margin-top: 12px;
        padding: 8px;
        background: rgba(79, 70, 229, 0.1);
        border-radius: 6px;
      }

      .barra-progreso {
        height: 4px;
        background: #334155;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 4px;
      }

      .barra-progreso .relleno {
        height: 100%;
        background: linear-gradient(90deg, #4f46e5, #a855f7);
        animation: carga 2s infinite;
      }

      @keyframes carga {
        0% {
          width: 0%;
        }
        50% {
          width: 100%;
        }
        100% {
          width: 0%;
        }
      }

      .texto-sync {
        font-size: 12px;
        color: #94a3b8;
      }

      /* MODAL */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-contenido {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid #4f46e5;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          transform: translateY(-50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #334155;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 20px;
        color: #e2e8f0;
        background: linear-gradient(135deg, #4f46e5, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .btn-cerrar {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.3s ease;
      }

      .btn-cerrar:hover {
        color: #e2e8f0;
      }

      .modal-body {
        padding: 24px;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-item {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
      }

      .stat-item.error {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      .stat-label {
        display: block;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 8px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .stat-valor {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: #4f46e5;
      }

      .acciones-modal {
        display: flex;
        gap: 12px;
      }

      .acciones-modal button {
        flex: 1;
      }

      .mensaje-estado {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 20px;
        background: #0f172a;
        border-left: 4px solid #4f46e5;
        border-radius: 6px;
        color: #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.3s ease;
        z-index: 2000;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(400px);
        }
        to {
          transform: translateX(0);
        }
      }

      .mensaje-estado.tipo-exito {
        border-left-color: #10b981;
      }

      .mensaje-estado.tipo-error {
        border-left-color: #ef4444;
      }

      .btn-cerrar-mensaje {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 18px;
      }

      @media (max-width: 768px) {
        .grid-dispositivos {
          grid-template-columns: 1fr;
        }

        .header-dispositivos {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .modal-contenido {
          width: 95%;
        }

        .detalles-tecnicos {
          grid-template-columns: 1fr;
        }

        .stat-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DispositivosComponent implements OnInit, OnDestroy {
  dispositivos: DispositivoIoT[] = [];
  wsConectado = false;
  mostrarEstadisticas = false;
  dispositivoSeleccionado: DispositivoIoT | null = null;
  estadisticasActuales: EstadisticasDispositivo | null = null;
  dispositivoEnProceso: string | null = null;
  mensaje: { texto: string; tipo: 'exito' | 'error' } | null = null;

  private destroy$ = new Subject<void>();

  constructor(private hardwareService: ServicioHardwareAPI) {}

  ngOnInit(): void {
    this.actualizarDispositivos();

    this.hardwareService.dispositivos$.pipe(takeUntil(this.destroy$)).subscribe((dispositivos) => {
      this.dispositivos = dispositivos;
    });

    this.hardwareService.estadoConexion$.pipe(takeUntil(this.destroy$)).subscribe((conectado) => {
      this.wsConectado = conectado;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.hardwareService.desconectar();
  }

  actualizarDispositivos(): void {
    this.hardwareService.obtenerDispositivos().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.mostrarMensaje('Dispositivos actualizados', 'exito'),
      error: () => this.mostrarMensaje('Error al obtener dispositivos', 'error'),
    });
  }

  reproducirContenido(dispositivo: DispositivoIoT): void {
    // En un caso real, abrirías un selector de contenido
    const contenidoId = prompt('Ingresa el ID del contenido:');
    if (contenidoId) {
      this.dispositivoEnProceso = dispositivo.id;
      this.hardwareService.reproducirContenido(dispositivo.id, contenidoId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.mostrarMensaje(`Reproduciendo en ${dispositivo.nombre}`, 'exito');
          this.dispositivoEnProceso = null;
        },
        error: () => {
          this.mostrarMensaje('Error al reproducir contenido', 'error');
          this.dispositivoEnProceso = null;
        },
      });
    }
  }

  pausarDispositivo(dispositivo: DispositivoIoT): void {
    this.hardwareService.pausarDispositivo(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.mostrarMensaje(`Pausado ${dispositivo.nombre}`, 'exito'),
      error: () => this.mostrarMensaje('Error al pausar', 'error'),
    });
  }

  detenerDispositivo(dispositivo: DispositivoIoT): void {
    this.hardwareService.detenerDispositivo(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.mostrarMensaje(`Detenido ${dispositivo.nombre}`, 'exito'),
      error: () => this.mostrarMensaje('Error al detener', 'error'),
    });
  }

  reiniciarDispositivo(dispositivo: DispositivoIoT): void {
    if (confirm(`¿Reiniciar ${dispositivo.nombre}?`)) {
      this.dispositivoEnProceso = dispositivo.id;
      this.hardwareService.reiniciarDispositivo(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.mostrarMensaje(`${dispositivo.nombre} reiniciando...`, 'exito');
          this.dispositivoEnProceso = null;
        },
        error: () => {
          this.mostrarMensaje('Error al reiniciar', 'error');
          this.dispositivoEnProceso = null;
        },
      });
    }
  }

  sincronizar(dispositivo: DispositivoIoT): void {
    this.dispositivoEnProceso = dispositivo.id;
    this.hardwareService.sincronizar(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.mostrarMensaje(`${dispositivo.nombre} sincronizado`, 'exito');
        this.dispositivoEnProceso = null;
      },
      error: () => {
        this.mostrarMensaje('Error en sincronización', 'error');
        this.dispositivoEnProceso = null;
      },
    });
  }

  abrirEstadisticas(dispositivo: DispositivoIoT): void {
    this.dispositivoSeleccionado = dispositivo;
    this.mostrarEstadisticas = true;

    this.hardwareService.obtenerEstadisticas(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (stats) => {
        this.estadisticasActuales = stats;
      },
      error: () => this.mostrarMensaje('Error al obtener estadísticas', 'error'),
    });
  }

  cerrarEstadisticas(): void {
    this.mostrarEstadisticas = false;
  }

  testConexion(dispositivo: DispositivoIoT): void {
    this.hardwareService.testConexion(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resultado) => {
        const msg = resultado.conectado ? `Conectado - Latencia: ${resultado.latencia}ms` : 'No conectado';
        this.mostrarMensaje(msg, resultado.conectado ? 'exito' : 'error');
      },
      error: () => this.mostrarMensaje('Error en test de conexión', 'error'),
    });
  }

  actualizarSoftware(dispositivo: DispositivoIoT): void {
    if (confirm(`¿Actualizar software de ${dispositivo.nombre}?`)) {
      this.dispositivoEnProceso = dispositivo.id;
      this.hardwareService.actualizarSoftware(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.mostrarMensaje(`Actualización iniciada en ${dispositivo.nombre}`, 'exito');
          this.dispositivoEnProceso = null;
        },
        error: () => {
          this.mostrarMensaje('Error al actualizar software', 'error');
          this.dispositivoEnProceso = null;
        },
      });
    }
  }

  abrirModalNuevoDispositivo(): void {
    alert('Abre modal de nuevo dispositivo aquí');
  }

  editarDispositivo(dispositivo: DispositivoIoT): void {
    alert(`Editar: ${dispositivo.nombre}`);
  }

  eliminarDispositivo(dispositivo: DispositivoIoT): void {
    if (confirm(`¿Eliminar ${dispositivo.nombre}?`)) {
      this.hardwareService.eliminarDispositivo(dispositivo.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.mostrarMensaje(`${dispositivo.nombre} eliminado`, 'exito'),
        error: () => this.mostrarMensaje('Error al eliminar dispositivo', 'error'),
      });
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString();
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}
