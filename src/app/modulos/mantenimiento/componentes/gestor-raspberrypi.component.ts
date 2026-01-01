import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioMantenimientoAvanzado } from '@core/servicios/mantenimiento-avanzado.servicio';
import { ConfiguracionRaspberryPi } from '@modulos/mantenimiento/modelos/mantenimiento.modelo';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-gestor-raspberrypi',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="raspberrypi-container">
      <div class="header">
        <h1>🍓 Gestión de Raspberry Pi</h1>
        <button (click)="abrirFormularioNuevo()" class="btn-agregar">+ Agregar Dispositivo</button>
      </div>

      @if (mostrarFormulario()) {
        <div class="modal-formulario">
          <form (ngSubmit)="guardarDispositivo()">
            <h2>{{ editandoId() ? 'Editar' : 'Nuevo' }} Dispositivo</h2>
            
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="dispositivoFormulario.nombre" name="nombre" required>
            </div>

            <div class="form-group">
              <label>IP Address</label>
              <input [(ngModel)]="dispositivoFormulario.ipAddress" name="ip" required>
            </div>

            <div class="form-group">
              <label>Puerto</label>
              <input type="number" [(ngModel)]="dispositivoFormulario.puerto" name="puerto" required>
            </div>

            <div class="form-group">
              <label>Token</label>
              <input [(ngModel)]="dispositivoFormulario.token" name="token" type="password" required>
            </div>

            <div class="form-group">
              <label>Ubicación</label>
              <input [(ngModel)]="dispositivoFormulario.ubicacion" name="ubicacion">
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="dispositivoFormulario.descripcion" name="descripcion" rows="3"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-guardar">💾 Guardar</button>
              <button type="button" (click)="cerrarFormulario()" class="btn-cancelar">✕ Cancelar</button>
            </div>
          </form>
        </div>
      }

      @if (cargando()) {
        <div class="loader">Cargando dispositivos...</div>
      } @else if (dispositivos().length === 0) {
        <div class="sin-dispositivos">
          <p>No hay dispositivos Raspberry Pi configurados</p>
        </div>
      } @else {
        <div class="grid-dispositivos">
          @for (dispositivo of dispositivos(); track dispositivo.id) {
            <div class="tarjeta-dispositivo" [class]="dispositivo.estadoConexion.toLowerCase()">
              <div class="encabezado">
                <h3>{{ dispositivo.nombre }}</h3>
                <span class="estado-badge">{{ dispositivo.estadoConexion }}</span>
              </div>

              <div class="info-dispositivo">
                <p><strong>IP:</strong> {{ dispositivo.ipAddress }}:{{ dispositivo.puerto }}</p>
                <p><strong>Ubicación:</strong> {{ dispositivo.ubicacion }}</p>
                <p><strong>Firmware:</strong> v{{ dispositivo.versionFirmware }}</p>
                <p><strong>Última Actividad:</strong> {{ dispositivo.ultimaActividad | date: 'short' }}</p>
              </div>

              @if (dispositivo.sensores && dispositivo.sensores.length > 0) {
                <div class="sensores">
                  <p><strong>Sensores Activos: {{ dispositivo.sensores.length }}</strong></p>
                  <div class="lista-sensores">
                    @for (sensor of dispositivo.sensores; track sensor.id) {
                      <span class="sensor-chip">{{ sensor.nombre }}: {{ sensor.ultimaLectura }}{{ sensor.unidad }}</span>
                    }
                  </div>
                </div>
              }

              <div class="acciones">
                <button (click)="editarDispositivo(dispositivo)" class="btn-editar">✏️ Editar</button>
                <button (click)="eliminarDispositivo(dispositivo.id)" class="btn-eliminar">🗑️ Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .raspberrypi-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    .btn-agregar {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-agregar:hover {
      background: #764ba2;
    }

    .modal-formulario {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-formulario form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-guardar, .btn-cancelar {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-guardar {
      background: #667eea;
      color: white;
    }

    .btn-cancelar {
      background: #f0f0f0;
      color: #333;
    }

    .loader, .sin-dispositivos {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      color: #999;
    }

    .grid-dispositivos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .tarjeta-dispositivo {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      border-left: 4px solid #ccc;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .tarjeta-dispositivo:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .tarjeta-dispositivo.conectado { border-left-color: #28a745; }
    .tarjeta-dispositivo.desconectado { border-left-color: #ff6b6b; }
    .tarjeta-dispositivo.inactivo { border-left-color: #ffa500; }

    .encabezado {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    h3 {
      margin: 0;
      font-size: 1.2rem;
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #f0f0f0;
    }

    .tarjeta-dispositivo.conectado .estado-badge { background: #d4edda; color: #155724; }
    .tarjeta-dispositivo.desconectado .estado-badge { background: #f8d7da; color: #721c24; }
    .tarjeta-dispositivo.inactivo .estado-badge { background: #fff3cd; color: #856404; }

    .info-dispositivo p {
      margin: 0.5rem 0;
      color: #666;
      font-size: 0.95rem;
    }

    .sensores {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .lista-sensores {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .sensor-chip {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #e8eaf6;
      border-radius: 20px;
      font-size: 0.8rem;
      color: #667eea;
    }

    .acciones {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-editar, .btn-eliminar {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-editar {
      background: #667eea;
      color: white;
    }

    .btn-eliminar {
      background: #ff6b6b;
      color: white;
    }

    @media (max-width: 768px) {
      .grid-dispositivos {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class GestorRaspberryPiComponent implements OnInit {
  private readonly servicioMantenimiento = inject(ServicioMantenimientoAvanzado);

  public readonly dispositivos = this.servicioMantenimiento.dispositivos;
  public readonly cargando = this.servicioMantenimiento.cargando;

  public mostrarFormulario = signal(false);
  public editandoId = signal<number | null>(null);

  public dispositivoFormulario: Partial<ConfiguracionRaspberryPi> = {
    nombre: '',
    ipAddress: '',
    puerto: 5000,
    token: '',
    ubicacion: '',
    descripcion: ''
  };

  ngOnInit(): void {
    this.servicioMantenimiento.obtenerDispositivos().subscribe();
  }

  public abrirFormularioNuevo(): void {
    this.editandoId.set(null);
    this.dispositivoFormulario = {
      nombre: '',
      ipAddress: '',
      puerto: 5000,
      token: '',
      ubicacion: '',
      descripcion: ''
    };
    this.mostrarFormulario.set(true);
  }

  public editarDispositivo(dispositivo: ConfiguracionRaspberryPi): void {
    this.editandoId.set(dispositivo.id);
    this.dispositivoFormulario = { ...dispositivo };
    this.mostrarFormulario.set(true);
  }

  public cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
  }

  public guardarDispositivo(): void {
    if (this.editandoId()) {
      this.servicioMantenimiento.actualizarDispositivo(
        this.editandoId()!,
        this.dispositivoFormulario
      ).subscribe(() => {
        NotifyX.success('Dispositivo actualizado', { duration: 3000, dismissible: true });
        this.cerrarFormulario();
      });
    } else {
      this.servicioMantenimiento.agregarDispositivo(this.dispositivoFormulario).subscribe(() => {
        NotifyX.success('Dispositivo agregado', { duration: 3000, dismissible: true });
        this.cerrarFormulario();
      });
    }
  }

  public eliminarDispositivo(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este dispositivo?')) {
      this.servicioMantenimiento.eliminarDispositivo(id).subscribe(() => {
        NotifyX.success('Dispositivo eliminado', { duration: 3000, dismissible: true });
      });
    }
  }
}
