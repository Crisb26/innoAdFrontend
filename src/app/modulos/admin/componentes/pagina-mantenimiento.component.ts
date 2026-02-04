import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import NotifyX from 'notifyx';
import { environment } from '../../../../environments/environment';

interface EstadoMantenimiento {
  id: number;
  activo: boolean;
  mensaje: string;
  inicio: string;
  fin: string;
  usuarioActivador: string;
}

@Component({
  selector: 'app-pagina-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./pagina-mantenimiento.component.scss'],
  template: `
    <div class="contenedor-mantenimiento-admin">
      <div class="header-seccion">
        <h1>⚙️ Gestión de Modo Mantenimiento</h1>
        <p>Controla el estado de mantenimiento del sistema</p>
      </div>

      <div class="grid-contenido">
        <!-- Card de Estado Actual -->
        <div class="card estado-actual">
          <div class="card-header">
            <h2>Estado Actual del Sistema</h2>
            <div class="badge-estado" [class.activo]="estadoMantenimiento()?.activo">
              @if (estadoMantenimiento()?.activo) {
                <span class="punto-rojo"></span>
                EN MANTENIMIENTO
              } @else {
                <span class="punto-verde"></span>
                OPERATIVO
              }
            </div>
          </div>

          <div class="card-body">
            @if (estadoMantenimiento()?.activo) {
              <div class="info-mantenimiento-activo">
                <div class="info-item">
                  <label>Mensaje Actual:</label>
                  <p>{{ estadoMantenimiento()?.mensaje || 'Sin mensaje' }}</p>
                </div>

                @if (estadoMantenimiento()?.usuarioActivador) {
                  <div class="info-item">
                    <label>Activado Por:</label>
                    <p>{{ estadoMantenimiento()?.usuarioActivador }}</p>
                  </div>
                }

                @if (estadoMantenimiento()?.inicio) {
                  <div class="info-item">
                    <label>Inicio:</label>
                    <p>{{ estadoMantenimiento()?.inicio | date: 'short' }}</p>
                  </div>
                }
              </div>

              <button 
                (click)="desactivarMantenimiento()"
                [disabled]="cargando()"
                class="boton boton-peligro boton-completo"
              >
                @if (cargando()) {
                  <span class="spinner"></span>
                  Desactivando...
                } @else {
                  🟢 Desactivar Mantenimiento
                }
              </button>
            } @else {
              <p class="texto-centrado">El sistema está operativo</p>
              <button 
                (click)="abrirFormularioActivacion()"
                class="boton boton-primario boton-completo"
              >
                ⚠️ Activar Modo Mantenimiento
              </button>
            }
          </div>
        </div>

        <!-- Card de Activar Mantenimiento -->
        @if (mostrarFormulario()) {
          <div class="card formulario-mantenimiento">
            <div class="card-header">
              <h2>Activar Modo Mantenimiento</h2>
            </div>

            <div class="card-body">
              <div class="grupo-formulario">
                <label>Mensaje de Mantenimiento</label>
                <textarea
                  [(ngModel)]="nuevoMensaje"
                  placeholder="Ej: Realizando actualizaciones de seguridad. Vuelve a intentar en 2 horas."
                  class="textarea-mensaje"
                  rows="5"
                  [disabled]="cargando()"
                ></textarea>
              </div>

              <div class="grupo-formulario">
                <label>
                  <input type="checkbox" [(ngModel)]="confirmarActivacion">
                  Entiendo que el sistema no estará disponible para los usuarios
                </label>
              </div>

              <div class="acciones-formulario">
                <button 
                  (click)="cerrarFormulario()"
                  [disabled]="cargando()"
                  class="boton boton-secundario"
                >
                  Cancelar
                </button>
                <button 
                  (click)="activarMantenimiento()"
                  [disabled]="!nuevoMensaje || !confirmarActivacion || cargando()"
                  class="boton boton-peligro"
                >
                  @if (cargando()) {
                    <span class="spinner"></span>
                    Activando...
                  } @else {
                    🔧 Activar Mantenimiento
                  }
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Card de Información -->
        <div class="card informacion">
          <div class="card-header">
            <h2>📋 Información Importante</h2>
          </div>

          <div class="card-body">
            <div class="item-info">
              <strong>Acceso para Administradores:</strong>
              <p>Los administradores con la contraseña pueden acceder incluso en mantenimiento</p>
            </div>

            <div class="item-info">
              <strong>Mensaje Personalizado:</strong>
              <p>Los usuarios verán el mensaje que especifiques en la página de mantenimiento</p>
            </div>

            <div class="item-info">
              <strong>APIs Deshabilitadas:</strong>
              <p>Todas las APIs retornarán error 503 cuando el mantenimiento esté activo</p>
            </div>

            <div class="item-info">
              <strong>Notificaciones:</strong>
              <p>Se enviará un email a todos los usuarios cuando se active/desactive</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaginaMantenimientoComponent implements OnInit {
  private http = inject(HttpClient);

  estadoMantenimiento = signal<EstadoMantenimiento | null>(null);
  mostrarFormulario = signal(false);
  cargando = signal(false);
  nuevoMensaje = '';
  confirmarActivacion = false;

  private apiUrl = `${environment.api.baseUrl}/mantenimiento`;

  ngOnInit() {
    this.cargarEstado();
  }

  cargarEstado() {
    this.http.get<EstadoMantenimiento>(`${this.apiUrl}/estado`)
      .subscribe({
        next: (data) => {
          this.estadoMantenimiento.set(data);
        },
        error: (err) => {
          console.error('Error al cargar estado:', err);
          NotifyX.error('Error al cargar el estado del mantenimiento');
        }
      });
  }

  abrirFormularioActivacion() {
    this.mostrarFormulario.set(true);
    this.nuevoMensaje = '';
    this.confirmarActivacion = false;
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.nuevoMensaje = '';
    this.confirmarActivacion = false;
  }

  activarMantenimiento() {
    if (!this.nuevoMensaje.trim()) {
      NotifyX.error('Debe ingresar un mensaje');
      return;
    }

    this.cargando.set(true);

    const payload = {
      mensaje: this.nuevoMensaje,
      usuarioActivador: 'Admin'
    };

    this.http.post<EstadoMantenimiento>(`${this.apiUrl}/activar`, payload)
      .subscribe({
        next: (data) => {
          this.estadoMantenimiento.set(data);
          NotifyX.success('Modo mantenimiento activado', { duration: 2000 });
          this.cerrarFormulario();
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error:', err);
          NotifyX.error('Error al activar mantenimiento');
          this.cargando.set(false);
        }
      });
  }

  desactivarMantenimiento() {
    if (!confirm('¿Desactivar modo mantenimiento?')) {
      return;
    }

    this.cargando.set(true);

    this.http.post<EstadoMantenimiento>(`${this.apiUrl}/desactivar`, {})
      .subscribe({
        next: (data) => {
          this.estadoMantenimiento.set(data);
          NotifyX.success('Modo mantenimiento desactivado', { duration: 2000 });
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error:', err);
          NotifyX.error('Error al desactivar mantenimiento');
          this.cargando.set(false);
        }
      });
  }
}
