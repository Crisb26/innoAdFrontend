import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ConexionUsuario {
  id: number;
  usuarioId: string;
  nombreUsuario: string;
  ipAddress: string;
  navegador: string;
  sistemaOperativo: string;
  fechaConexion: string;
  fechaDesconexion: string;
  conectadoActualmente: boolean;
  tiempoConexionSegundos: number;
  tiempoConexionFormato: string;
  estado: string;
}

interface EstadisticasConexiones {
  usuariosConectadosAhora: number;
  capacidadMaximaResistida: number;
  porcentajeCapacidad: number;
  estadoCapacidad: string;
  conexionesActivas: ConexionUsuario[];
}

@Component({
  selector: 'app-monitoreo-conexiones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitoreo-conexiones">
      <div class="header">
        <h2>[]ä Monitoreo de Conexiones en Tiempo Real</h2>
        <div class="indicador-actualizacion" [class.actualizado]="actualizado">
          []Ñ Actualizado: {{ ultimaActualizacion | date:'HH:mm:ss' }}
        </div>
      </div>

      <div class="estadisticas-grid">
        <div class="tarjeta-estadistica">
          <div class="numero">{{ estadisticas?.usuariosConectadosAhora || 0 }}</div>
          <div class="etiqueta">Usuarios Conectados Ahora</div>
        </div>

        <div class="tarjeta-estadistica">
          <div class="numero">{{ estadisticas?.porcentajeCapacidad || 0 }}%</div>
          <div class="etiqueta">Capacidad Usada</div>
          <div class="barra-progreso">
            <div class="barra-interior" [style.width]="(estadisticas?.porcentajeCapacidad || 0) + '%'"
                 [class]="'estado-' + (estadisticas?.estadoCapacidad?.toLowerCase() || 'bajo')"></div>
          </div>
        </div>

        <div class="tarjeta-estadistica">
          <div class="numero">{{ estadisticas?.capacidadMaximaResistida || 8000 }}</div>
          <div class="etiqueta">Capacidad M√°xima</div>
        </div>

        <div class="tarjeta-estadistica" [class]="'estado-' + (estadisticas?.estadoCapacidad?.toLowerCase() || 'bajo')">
          <div class="etiqueta">Estado del Sistema</div>
          <div class="estado">{{ estadisticas?.estadoCapacidad || 'BAJO' }}</div>
        </div>
      </div>

      <div class="seccion-conexiones">
        <h3>[]• Conexiones Activas en Tiempo Real</h3>
        
        <div class="tabla-conexiones">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>IP Address</th>
                <th>Sistema Operativo</th>
                <th>Navegador</th>
                <th>Conectado desde</th>
                <th>Tiempo Conectado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let conexion of estadisticas?.conexionesActivas" class="fila-activa">
                <td class="usuario-nombre">{{ conexion.nombreUsuario }}</td>
                <td class="ip-address">{{ conexion.ipAddress }}</td>
                <td class="sistema-operativo">
                  <span [class.icono]="true">
                    {{ obtenerId(conexion.sistemaOperativo) }} {{ conexion.sistemaOperativo }}
                  </span>
                </td>
                <td class="navegador">{{ extraerNavegador(conexion.navegador) }}</td>
                <td class="fecha-conexion">{{ conexion.fechaConexion | date:'HH:mm:ss' }}</td>
                <td class="tiempo-conexion">{{ conexion.tiempoConexionFormato || 'Reciente' }}</td>
                <td>
                  <span class="estado-activo">‚óè Activo</span>
                </td>
              </tr>
              <tr *ngIf="!estadisticas?.conexionesActivas || estadisticas.conexionesActivas.length === 0">
                <td colspan="7" class="sin-datos">No hay conexiones activas en este momento</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="seccion-advertencias" *ngIf="mostrarAdvertencia()">
        <div class="advertencia" [class.critica]="estadisticas?.porcentajeCapacidad! > 95">
          [][] 
          <span *ngIf="estadisticas?.porcentajeCapacidad! > 95">
            ALERTA CR√çTICA: Sistema al {{ estadisticas?.porcentajeCapacidad }}% de capacidad
          </span>
          <span *ngIf="estadisticas?.porcentajeCapacidad! > 80 && estadisticas?.porcentajeCapacidad! <= 95">
            ADVERTENCIA: Sistema al {{ estadisticas?.porcentajeCapacidad }}% de capacidad
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monitoreo-conexiones {
      padding: 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .indicador-actualizacion {
      font-size: 12px;
      color: #999;
      padding: 8px 12px;
      background: #f0f0f0;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .indicador-actualizacion.actualizado {
      background: #d4edda;
      color: #155724;
    }

    .estadisticas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .tarjeta-estadistica {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .tarjeta-estadistica.estado-bajo {
      border-left: 4px solid #28a745;
    }

    .tarjeta-estadistica.estado-medio {
      border-left: 4px solid #ffc107;
    }

    .tarjeta-estadistica.estado-alto {
      border-left: 4px solid #fd7e14;
    }

    .tarjeta-estadistica.estado-critico {
      border-left: 4px solid #dc3545;
      background: #ffe6e6;
    }

    .numero {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .etiqueta {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .barra-progreso {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 10px;
    }

    .barra-interior {
      height: 100%;
      transition: width 0.3s;
    }

    .barra-interior.estado-bajo {
      background: #28a745;
    }

    .barra-interior.estado-medio {
      background: #ffc107;
    }

    .barra-interior.estado-alto {
      background: #fd7e14;
    }

    .barra-interior.estado-critico {
      background: #dc3545;
    }

    .estado {
      font-size: 20px;
      font-weight: bold;
      margin-top: 10px;
      color: #dc3545;
    }

    .seccion-conexiones {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .seccion-conexiones h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    .tabla-conexiones {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background: #f5f5f5;
    }

    .fila-activa {
      background: #f0f8ff;
    }

    .usuario-nombre {
      font-weight: 600;
      color: #007bff;
    }

    .ip-address {
      font-family: monospace;
      color: #666;
    }

    .sistema-operativo {
      color: #555;
    }

    .navegador {
      color: #555;
    }

    .fecha-conexion {
      color: #888;
      font-size: 12px;
    }

    .tiempo-conexion {
      color: #28a745;
      font-weight: 500;
    }

    .estado-activo {
      color: #28a745;
      font-weight: 600;
    }

    .sin-datos {
      text-align: center;
      color: #999;
      padding: 30px !important;
      font-style: italic;
    }

    .seccion-advertencias {
      margin-top: 20px;
    }

    .advertencia {
      padding: 15px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      color: #856404;
      font-weight: 500;
    }

    .advertencia.critica {
      background: #f8d7da;
      border-color: #dc3545;
      color: #721c24;
    }

    .icono {
      margin-right: 5px;
    }
  `]
})
export class MonitoreoConexionesComponent implements OnInit, OnDestroy {
  estadisticas: EstadisticasConexiones | null = null;
  ultimaActualizacion = new Date();
  actualizado = false;

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarEstadisticas();
    // Actualizar cada 3 segundos
    interval(3000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarEstadisticas());
  }

  cargarEstadisticas() {
    this.http.get<EstadisticasConexiones>('/api/admin/monitoreo/estadisticas')
      .subscribe({
        next: (data) => {
          this.estadisticas = data;
          this.ultimaActualizacion = new Date();
          this.actualizado = true;
          setTimeout(() => this.actualizado = false, 500);
        },
        error: (e) => console.error('Error cargando estad√≠sticas:', e)
      });
  }

  extraerNavegador(userAgent: string): string {
    if (!userAgent) return 'Desconocido';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Otro';
  }

  obtenerId(so: string): string {
    const iconos: { [key: string]: string } = {
      'Windows': '[]ü',
      'macOS': '[]é',
      'Linux': '[]ß',
      'Android': '[]ñ',
      'iOS': '[]é',
      'Desconocido': '‚ùì'
    };
    return iconos[so] || '‚ùì';
  }

  mostrarAdvertencia(): boolean {
    return (this.estadisticas?.porcentajeCapacidad || 0) > 80;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
