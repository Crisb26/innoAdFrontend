import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ServicioMantenimiento } from '@core/servicios/mantenimiento.servicio';

@Component({
  selector: 'app-control-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="contenedor-mantenimiento-admin">
      <!-- Header del Control -->
      <div class="header-mantenimiento">
        <div class="titulo-seccion">
          <h2>🔧 Control de Mantenimiento</h2>
          <div class="estado-actual" [class.activo]="modoActivo()">
            <span class="indicador"></span>
            Estado: {{ modoActivo() ? 'MANTENIMIENTO ACTIVO' : 'Sistema Normal' }}
          </div>
        </div>
      </div>

      <!-- Card Principal -->
      <div class="tarjeta-control">
        <div class="info-estado">
          <div class="icono-estado" [class.mantenimiento-activo]="modoActivo()">
            {{ modoActivo() ? '⚠️' : '✅' }}
          </div>
          <div class="texto-estado">
            @if (modoActivo()) {
              <h3>Modo Mantenimiento Activado</h3>
              <p>El sistema está en mantenimiento. Solo administradores pueden acceder.</p>
              <p class="tiempo-estimado">Los usuarios ven la página de mantenimiento.</p>
            } @else {
              <h3>Sistema Funcionando Normal</h3>
              <p>Todos los usuarios pueden acceder al sistema sin problemas.</p>
              <p class="consejo">Usa el modo mantenimiento para actualizaciones importantes.</p>
            }
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="acciones-control">
          @if (modoActivo()) {
            <button 
              class="boton-desactivar"
              (click)="abrirModal('desactivar')"
              [disabled]="cargando()">
              <span class="icono-boton">🔓</span>
              Desactivar Mantenimiento
            </button>
          } @else {
            <button 
              class="boton-activar"
              (click)="abrirModal('activar')"
              [disabled]="cargando()">
              <span class="icono-boton">🔧</span>
              Activar Mantenimiento
            </button>
          }
        </div>
      </div>

      <!-- Estado de Carga -->
      @if (cargando()) {
        <div class="cargando-estado">
          <div class="loader-mantenimiento"></div>
          <p>{{ modoActivo() ? 'Desactivando...' : 'Activando...' }} modo mantenimiento</p>
        </div>
      }

      <!-- Mensajes -->
      @if (mensajeError()) {
        <div class="alerta-error">
          <span class="icono-alerta">❌</span>
          {{ mensajeError() }}
        </div>
      }

      @if (mensajeExito()) {
        <div class="alerta-exito">
          <span class="icono-alerta">✅</span>
          {{ mensajeExito() }}
        </div>
      }
    </div>

    <!-- Modal de Confirmación -->
    @if (mostrarModal()) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              {{ tipoAccion() === 'activar' ? '🔧 Activar' : '🔓 Desactivar' }} 
              Modo Mantenimiento
            </h2>
            <button class="btn-cerrar" (click)="cerrarModal()">✕</button>
          </div>

          <form [formGroup]="formulario" (ngSubmit)="ejecutarAccion()" class="modal-form">
            <!-- Código de Seguridad -->
            <div class="grupo-campo">
              <label class="etiqueta-campo">Código de Seguridad *</label>
              <input 
                type="password"
                formControlName="codigoSeguridad"
                class="input-innoad"
                placeholder="Ingresa el código de seguridad"
                required>
              @if (formulario.get('codigoSeguridad')?.errors?.['required'] && formulario.get('codigoSeguridad')?.touched) {
                <div class="error-campo">El código de seguridad es requerido</div>
              }
            </div>

            <!-- Campos adicionales para activar -->
            @if (tipoAccion() === 'activar') {
              <div class="grupo-campo">
                <label class="etiqueta-campo">Mensaje Personalizado (Opcional)</label>
                <textarea 
                  formControlName="mensaje"
                  class="input-innoad"
                  rows="3"
                  placeholder="Mensaje que verán los usuarios durante el mantenimiento"></textarea>
                <div class="ayuda-campo">Si no especificas un mensaje, se usará el predeterminado</div>
              </div>

              <div class="grupo-campo">
                <label class="etiqueta-campo">Fecha Fin Estimada (Opcional)</label>
                <input 
                  type="datetime-local"
                  formControlName="fechaFinEstimada"
                  class="input-innoad">
                <div class="ayuda-campo">Fecha estimada de fin del mantenimiento</div>
              </div>
            }

            <!-- Botones del Modal -->
            <div class="modal-acciones">
              <button type="button" class="boton-cancelar" (click)="cerrarModal()">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="boton-confirmar"
                [class.btn-desactivar]="tipoAccion() === 'desactivar'"
                [class.btn-activar]="tipoAccion() === 'activar'"
                [disabled]="formulario.invalid || procesando()">
                @if (procesando()) {
                  <span class="loader-pequeño"></span>
                } @else {
                  {{ tipoAccion() === 'activar' ? 'Activar Mantenimiento' : 'Desactivar Mantenimiento' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .contenedor-mantenimiento-admin {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header-mantenimiento {
      margin-bottom: 2rem;
    }

    .titulo-seccion h2 {
      color: var(--color-texto);
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .estado-actual {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      background: var(--fondo-medio, #1e293b);
      border: 2px solid var(--color-exito, #10b981);
    }

    .estado-actual.activo {
      border-color: var(--color-error, #ef4444);
      background: rgba(239, 68, 68, 0.1);
    }

    .indicador {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-exito, #10b981);
      animation: pulso 2s infinite;
    }

    .estado-actual.activo .indicador {
      background: var(--color-error, #ef4444);
    }

    @keyframes pulso {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .tarjeta-control {
      background: var(--fondo-medio, #1e293b);
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-estado {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .icono-estado {
      font-size: 4rem;
      filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
    }

    .icono-estado.mantenimiento-activo {
      filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
    }

    .texto-estado h3 {
      color: var(--color-texto, #ffffff);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .texto-estado p {
      color: var(--color-texto-claro, #b4b8d0);
      margin-bottom: 0.5rem;
    }

    .tiempo-estimado, .consejo {
      font-size: 0.9rem;
      font-style: italic;
    }

    .acciones-control {
      display: flex;
      justify-content: center;
    }

    .boton-activar, .boton-desactivar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .boton-activar {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .boton-activar:hover {
      background: linear-gradient(135deg, #d97706, #b45309);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
    }

    .boton-desactivar {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .boton-desactivar:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }

    .boton-activar:disabled, .boton-desactivar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .cargando-estado {
      text-align: center;
      padding: 2rem;
      color: var(--color-texto-claro, #b4b8d0);
    }

    .loader-mantenimiento {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid var(--color-primario, #00d4ff);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alerta-error, .alerta-exito {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .alerta-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .alerta-exito {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    .modal-content {
      background: var(--fondo-oscuro, #0f172a);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header h2 {
      color: var(--color-texto, #ffffff);
      margin: 0;
      flex: 1;
    }

    .btn-cerrar {
      background: none;
      border: none;
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
    }

    .btn-cerrar:hover {
      color: var(--color-error, #ef4444);
    }

    .modal-form {
      padding: 1.5rem;
    }

    .grupo-campo {
      margin-bottom: 1.5rem;
    }

    .etiqueta-campo {
      display: block;
      color: var(--color-texto, #ffffff);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .input-innoad {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: var(--fondo-medio, #1e293b);
      color: var(--color-texto, #ffffff);
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .input-innoad:focus {
      border-color: var(--color-primario, #00d4ff);
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }

    .error-campo {
      color: var(--color-error, #ef4444);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .ayuda-campo {
      color: var(--color-texto-gris, #6b7280);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .modal-acciones {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .boton-cancelar {
      padding: 0.75rem 1.5rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: transparent;
      color: var(--color-texto-claro, #b4b8d0);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .boton-cancelar:hover {
      border-color: rgba(255, 255, 255, 0.4);
      color: var(--color-texto, #ffffff);
    }

    .boton-confirmar {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .boton-confirmar.btn-activar {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .boton-confirmar.btn-desactivar {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .boton-confirmar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loader-pequeño {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contenedor-mantenimiento-admin {
        padding: 1rem;
      }

      .info-estado {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .modal-content {
        width: 95%;
      }

      .modal-acciones {
        flex-direction: column;
      }
    }
  `]
})
export class ControlMantenimientoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicioMantenimiento = inject(ServicioMantenimiento);

  protected readonly modoActivo = signal(false);
  protected readonly cargando = signal(false);
  protected readonly procesando = signal(false);
  protected readonly mostrarModal = signal(false);
  protected readonly tipoAccion = signal<'activar' | 'desactivar'>('activar');
  protected readonly mensajeError = signal('');
  protected readonly mensajeExito = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    codigoSeguridad: ['', [Validators.required]],
    mensaje: [''],
    fechaFinEstimada: ['']
  });

  ngOnInit(): void {
    this.cargarEstado();
  }

  cargarEstado(): void {
    this.cargando.set(true);
    this.servicioMantenimiento.obtenerEstado().subscribe({
      next: (response) => {
        this.modoActivo.set(response.datos);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al obtener estado:', error);
        this.mensajeError.set('Error al obtener el estado del mantenimiento');
        this.cargando.set(false);
      }
    });
  }

  abrirModal(tipo: 'activar' | 'desactivar'): void {
    this.tipoAccion.set(tipo);
    this.formulario.reset();
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.formulario.reset();
    this.procesando.set(false);
  }

  ejecutarAccion(): void {
    if (this.formulario.invalid) return;

    const codigoSeguridad = this.formulario.value.codigoSeguridad!;
    this.procesando.set(true);
    this.mensajeError.set('');

    if (this.tipoAccion() === 'activar') {
      const solicitud = {
        codigoSeguridad,
        mensaje: this.formulario.value.mensaje || undefined,
        fechaFinEstimada: this.formulario.value.fechaFinEstimada || undefined
      };

      this.servicioMantenimiento.activarMantenimiento(solicitud).subscribe({
        next: () => {
          this.modoActivo.set(true);
          this.mensajeExito.set('Modo mantenimiento activado correctamente');
          this.cerrarModal();
          setTimeout(() => this.mensajeExito.set(''), 5000);
        },
        error: (error) => {
          this.mensajeError.set(error.error?.mensaje || 'Error al activar mantenimiento');
          this.procesando.set(false);
        }
      });
    } else {
      this.servicioMantenimiento.desactivarMantenimiento(codigoSeguridad).subscribe({
        next: () => {
          this.modoActivo.set(false);
          this.mensajeExito.set('Modo mantenimiento desactivado correctamente');
          this.cerrarModal();
          setTimeout(() => this.mensajeExito.set(''), 5000);
        },
        error: (error) => {
          this.mensajeError.set(error.error?.mensaje || 'Error al desactivar mantenimiento');
          this.procesando.set(false);
        }
      });
    }
  }
}