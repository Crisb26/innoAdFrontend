import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioMantenimientoAvanzado } from '@core/servicios/mantenimiento-avanzado.servicio';
import { TipoAlerta, EstadoAlerta } from '@modulos/mantenimiento/modelos/mantenimiento.modelo';

@Component({
  selector: 'app-mantenimiento-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="mantenimiento-container">
      <!-- Header -->
      <div class="header-mantenimiento">
        <div class="titulo-seccion">
          <h1>🔧 Panel de Mantenimiento</h1>
          <p>Gestiona alertas, dispositivos y estado del sistema</p>
        </div>

        <!-- Estado y Controles -->
        <div class="controles-mantenimiento">
          <div class="indicador-estado" [class.activo]="modoActivo()">
            <span class="punto-estado"></span>
            <span class="texto-estado">
              {{ modoActivo() ? 'Modo Mantenimiento ACTIVO' : 'Modo Desactivado' }}
            </span>
          </div>

          <button 
            (click)="alternarModoMantenimiento()"
            [class.activo]="modoActivo()"
            class="btn-modo-mantenimiento">
            {{ modoActivo() ? '⏸ Desactivar' : '▶ Activar Demonio' }}
          </button>
        </div>
      </div>

      <!-- Dashboard de Alertas Rápidas -->
      <div class="dashboard-alertas">
        <div class="card-alerta critica">
          <div class="numero">{{ alertasCriticas() }}</div>
          <div class="label">Alertas Críticas</div>
        </div>
        <div class="card-alerta advertencia">
          <div class="numero">{{ alertasAdvertencia() }}</div>
          <div class="label">Advertencias</div>
        </div>
        <div class="card-alerta dispositivos">
          <div class="numero">{{ dispositivosConectados() }}/{{ totalDispositivos() }}</div>
          <div class="label">Dispositivos Activos</div>
        </div>
        <div class="card-alerta salud">
          <div class="numero">{{ saludSistema() }}%</div>
          <div class="label">Salud del Sistema</div>
        </div>
      </div>

      <!-- Sección de Alertas Activas -->
      <div class="seccion-alertas">
        <h2>⚠️ Alertas Activas</h2>
        
        @if (cargando()) {
          <div class="loader">Cargando alertas...</div>
        } @else if (alertasActivas().length === 0) {
          <div class="sin-alertas">
            <p>✓ No hay alertas activas</p>
          </div>
        } @else {
          <div class="lista-alertas">
            @for (alerta of alertasActivas(); track alerta.id) {
              <div class="item-alerta" [class]="alerta.tipo.toLowerCase()">
                <div class="cabecera-alerta">
                  <span class="badge-tipo">{{ alerta.tipo }}</span>
                  <span class="titulo">{{ alerta.titulo }}</span>
                  <span class="fecha">{{ alerta.fechaCreacion | date: 'short' }}</span>
                </div>
                <p class="descripcion">{{ alerta.descripcion }}</p>
                @if (alerta.detalles?.impacto) {
                  <p class="impacto">Impacto: {{ alerta.detalles.impacto }}</p>
                }
                <div class="acciones-alerta">
                  <button (click)="resolverAlerta(alerta)" class="btn-resolver">
                    ✓ Resolver
                  </button>
                  <button (click)="verDetalles(alerta)" class="btn-detalles">
                    🔍 Detalles
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Sección Rápida de Dispositivos -->
      <div class="seccion-dispositivos">
        <div class="header-seccion">
          <h2>📡 Dispositivos Conectados</h2>
          <a routerLink="/mantenimiento/raspberrypi" class="btn-ver-todos">
            Ver Todo →
          </a>
        </div>

        @if (dispositivos().length === 0) {
          <div class="sin-dispositivos">
            <p>No hay dispositivos Raspberry Pi configurados</p>
            <a routerLink="/mantenimiento/raspberrypi" class="btn-agregar">
              + Agregar Dispositivo
            </a>
          </div>
        } @else {
          <div class="grid-dispositivos">
            @for (dispositivo of dispositivos().slice(0, 3); track dispositivo.id) {
              <div class="card-dispositivo">
                <div class="estado" [class]="dispositivo.estadoConexion.toLowerCase()">
                  {{ dispositivo.estadoConexion }}
                </div>
                <h3>{{ dispositivo.nombre }}</h3>
                <p class="ip">{{ dispositivo.ipAddress }}:{{ dispositivo.puerto }}</p>
                <p class="ubicacion">📍 {{ dispositivo.ubicacion }}</p>
                <div class="fecha-actividad">
                  Última actividad: {{ dispositivo.ultimaActividad | date: 'short' }}
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Sección de Salud del Sistema -->
      @if (estadoSistema()) {
        <div class="seccion-salud">
          <h2>📊 Estado del Sistema</h2>
          <div class="metricas-sistema">
            <div class="metrica">
              <label>CPU</label>
              <div class="barra-progreso">
                <div class="progreso" [style.width.%]="estadoSistema()!.porcentajeUso.cpu"></div>
              </div>
              <span>{{ estadoSistema()?.porcentajeUso.cpu }}%</span>
            </div>
            <div class="metrica">
              <label>Memoria</label>
              <div class="barra-progreso">
                <div class="progreso" [style.width.%]="estadoSistema()!.porcentajeUso.memoria"></div>
              </div>
              <span>{{ estadoSistema()?.porcentajeUso.memoria }}%</span>
            </div>
            <div class="metrica">
              <label>Almacenamiento</label>
              <div class="barra-progreso">
                <div class="progreso" [style.width.%]="estadoSistema()!.porcentajeUso.almacenamiento"></div>
              </div>
              <span>{{ estadoSistema()?.porcentajeUso.almacenamiento }}%</span>
            </div>
          </div>
        </div>
      }

      <!-- Links de Navegación -->
      <div class="navegacion-mantenimiento">
        <a routerLink="/mantenimiento/configuracion" class="btn-nav">⚙️ Configuración</a>
        <a routerLink="/mantenimiento/alertas" class="btn-nav">🔔 Centro de Alertas</a>
        <a routerLink="/mantenimiento/raspberrypi" class="btn-nav">🍓 Gestión Raspberry</a>
        <a routerLink="/mantenimiento/historial" class="btn-nav">📜 Historial</a>
      </div>
    </div>
  `,
  styles: [`
    .mantenimiento-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-mantenimiento {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .titulo-seccion h1 {
      font-size: 2.5rem;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .titulo-seccion p {
      color: #666;
      margin: 0.5rem 0 0 0;
    }

    .controles-mantenimiento {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .indicador-estado {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      background: #f0f0f0;
      font-weight: 500;
    }

    .indicador-estado.activo {
      background: #d4edda;
      color: #155724;
    }

    .punto-estado {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ccc;
      animation: parpadear 1.5s infinite;
    }

    .indicador-estado.activo .punto-estado {
      background: #28a745;
    }

    @keyframes parpadear {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .btn-modo-mantenimiento {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      background: #f0f0f0;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-modo-mantenimiento.activo {
      background: #ff6b6b;
      color: white;
    }

    .btn-modo-mantenimiento:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .dashboard-alertas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card-alerta {
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      background: white;
      border: 2px solid #e0e0e0;
      transition: all 0.3s;
    }

    .card-alerta:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .card-alerta.critica { border-color: #ff6b6b; }
    .card-alerta.advertencia { border-color: #ffa500; }
    .card-alerta.dispositivos { border-color: #667eea; }
    .card-alerta.salud { border-color: #28a745; }

    .card-alerta .numero {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .card-alerta.critica .numero { color: #ff6b6b; }
    .card-alerta.advertencia .numero { color: #ffa500; }
    .card-alerta.dispositivos .numero { color: #667eea; }
    .card-alerta.salud .numero { color: #28a745; }

    .card-alerta .label {
      color: #666;
      font-size: 0.9rem;
    }

    .seccion-alertas, .seccion-dispositivos, .seccion-salud {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .sin-alertas, .sin-dispositivos {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .sin-dispositivos .btn-agregar {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
    }

    .sin-dispositivos .btn-agregar:hover {
      background: #764ba2;
    }

    .lista-alertas {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-alerta {
      padding: 1.5rem;
      border-left: 4px solid #ccc;
      border-radius: 6px;
      background: #f9f9f9;
    }

    .item-alerta.critica { border-left-color: #ff6b6b; background: #ffe0e0; }
    .item-alerta.advertencia { border-left-color: #ffa500; background: #fff0e0; }
    .item-alerta.info { border-left-color: #667eea; background: #e8eaf6; }
    .item-alerta.exito { border-left-color: #28a745; background: #e8f5e9; }

    .cabecera-alerta {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .badge-tipo {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: white;
    }

    .item-alerta.critica .badge-tipo { background: #ff6b6b; color: white; }
    .item-alerta.advertencia .badge-tipo { background: #ffa500; color: white; }
    .item-alerta.info .badge-tipo { background: #667eea; color: white; }
    .item-alerta.exito .badge-tipo { background: #28a745; color: white; }

    .titulo {
      font-weight: 600;
      flex: 1;
    }

    .fecha {
      font-size: 0.85rem;
      color: #666;
    }

    .descripcion {
      margin: 0.5rem 0;
      color: #333;
    }

    .impacto {
      font-size: 0.9rem;
      color: #666;
      margin: 0.5rem 0;
    }

    .acciones-alerta {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-resolver, .btn-detalles {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s;
    }

    .btn-resolver {
      background: #28a745;
      color: white;
    }

    .btn-resolver:hover {
      background: #218838;
    }

    .btn-detalles {
      background: #667eea;
      color: white;
    }

    .btn-detalles:hover {
      background: #764ba2;
    }

    .header-seccion {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-ver-todos {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-ver-todos:hover {
      color: #764ba2;
    }

    .grid-dispositivos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .card-dispositivo {
      padding: 1.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      transition: all 0.3s;
    }

    .card-dispositivo:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .card-dispositivo .estado {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .card-dispositivo .estado.conectado { background: #d4edda; color: #155724; }
    .card-dispositivo .estado.desconectado { background: #f8d7da; color: #721c24; }
    .card-dispositivo .estado.inactivo { background: #fff3cd; color: #856404; }

    .card-dispositivo h3 {
      margin: 0.5rem 0;
      font-size: 1.2rem;
    }

    .card-dispositivo .ip {
      margin: 0.25rem 0;
      color: #666;
      font-family: monospace;
    }

    .card-dispositivo .ubicacion {
      margin: 0.25rem 0;
      color: #666;
    }

    .card-dispositivo .fecha-actividad {
      font-size: 0.85rem;
      color: #999;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .metricas-sistema {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .metrica {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .metrica label {
      font-weight: 600;
      color: #333;
    }

    .barra-progreso {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progreso {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s;
    }

    .metrica span {
      font-size: 0.9rem;
      color: #666;
    }

    .navegacion-mantenimiento {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .btn-nav {
      padding: 1rem;
      background: white;
      border: 2px solid #667eea;
      border-radius: 8px;
      color: #667eea;
      text-decoration: none;
      text-align: center;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-nav:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .loader {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    @media (max-width: 768px) {
      .header-mantenimiento {
        flex-direction: column;
        align-items: stretch;
      }

      .controles-mantenimiento {
        flex-direction: column;
      }

      .dashboard-alertas {
        grid-template-columns: 1fr 1fr;
      }

      .grid-dispositivos {
        grid-template-columns: 1fr;
      }

      .navegacion-mantenimiento {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class MantenimientoPanelComponent implements OnInit {
  private readonly servicioMantenimiento = inject(ServicioMantenimientoAvanzado);

  // Signals públicos del servicio
  public readonly modoActivo = this.servicioMantenimiento.modoMantenimientoActivo;
  public readonly alertasCriticas = this.servicioMantenimiento.alertasCriticas;
  public readonly alertasAdvertencia = this.servicioMantenimiento.alertasAdvertencia;
  public readonly dispositivosConectados = this.servicioMantenimiento.dispositivosConectados;
  public readonly saludSistema = this.servicioMantenimiento.saludSistema;
  public readonly estadoSistema = this.servicioMantenimiento.estadoSistema;
  public readonly dispositivos = this.servicioMantenimiento.dispositivos;
  public readonly cargando = this.servicioMantenimiento.cargando;

  public readonly alertasActivas = computed(() => 
    this.servicioMantenimiento.alertas().filter(a => a.estado === EstadoAlerta.ACTIVA)
  );

  public readonly totalDispositivos = computed(() => 
    this.servicioMantenimiento.dispositivos().length
  );

  ngOnInit(): void {
    // Cargar configuración inicial
    this.servicioMantenimiento.cargarConfiguracionMantenimiento().subscribe();
    
    // Solicitar permisos para notificaciones
    this.servicioMantenimiento.solicitarPermisosNotificaciones();
  }

  /**
   * Alterna el modo de mantenimiento
   */
  public alternarModoMantenimiento(): void {
    const estadoActual = this.modoActivo();
    this.servicioMantenimiento.cambiarModoMantenimiento(!estadoActual).subscribe({
      next: () => {
        console.log('Modo mantenimiento actualizado');
      },
      error: (err) => {
        console.error('Error al cambiar modo:', err);
      }
    });
  }

  /**
   * Resuelve una alerta
   */
  public resolverAlerta(alerta: any): void {
    this.servicioMantenimiento.resolverAlerta(
      alerta.id,
      'Resuelta desde el panel de mantenimiento'
    ).subscribe({
      next: () => {
        console.log('Alerta resuelta');
      },
      error: (err) => {
        console.error('Error al resolver alerta:', err);
      }
    });
  }

  /**
   * Muestra detalles de una alerta
   */
  public verDetalles(alerta: any): void {
    console.log('Detalles de alerta:', alerta);
    alert(`${alerta.titulo}\n\n${alerta.descripcion}\n\nOrigen: ${alerta.origen}`);
  }
}
