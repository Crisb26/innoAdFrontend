import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ServicioMantenimiento } from '@core/servicios/mantenimiento.servicio';

@Component({
  selector: 'app-control-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./control-mantenimiento.component.scss'],
  template: `
    <div class="contenedor-mantenimiento-admin">
      <!-- Header del Control -->
      <div class="header-mantenimiento">
        <div class="titulo-seccion">
          <h2>🎛️ Control de Mantenimiento</h2>
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
            {{ modoActivo() ? '' : '' }}
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
              <span class="icono-boton"></span>
              Desactivar Mantenimiento
            </button>
          } @else {
            <button 
              class="boton-activar"
              (click)="abrirModal('activar')"
              [disabled]="cargando()">
              <span class="icono-boton"></span>
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
          <span class="icono-alerta"></span>
          {{ mensajeError() }}
        </div>
      }

      @if (mensajeExito()) {
        <div class="alerta-exito">
          <span class="icono-alerta"></span>
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
              {{ tipoAccion() === 'activar' ? 'Activar' : 'Desactivar' }} 
              Modo Mantenimiento
            </h2>
            <button class="btn-cerrar" (click)="cerrarModal()"></button>
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
                <label class="etiqueta-campo">Tipo de Mantenimiento *</label>
                <select 
                  formControlName="tipoMantenimiento"
                  class="input-innoad"
                  required>
                  <option value="" disabled selected>Selecciona un tipo...</option>
                  <option value="PROGRAMADO">[]� Programado (Mantenimiento Planeado)</option>
                  <option value="EMERGENCIA">[]� Emergencia (Urgente)</option>
                  <option value="CRITICA">[][] Crítica (Problema Grave)</option>
                </select>
                @if (formulario.get('tipoMantenimiento')?.errors?.['required'] && formulario.get('tipoMantenimiento')?.touched) {
                  <div class="error-campo">El tipo de mantenimiento es requerido</div>
                }
                <div class="ayuda-campo">Define la severidad y naturaleza del mantenimiento</div>
              </div>

              <div class="grupo-campo">
                <label class="etiqueta-campo">Roles Afectados (Verán la página de mantenimiento) *</label>
                <div class="checkbox-group">
                  <label class="checkbox-custom">
                    <input 
                      type="checkbox"
                      value="VISITANTE"
                      (change)="actualizarRolesAfectados('VISITANTE', $event)">
                    <span class="checkbox-label">[]� Visitante</span>
                  </label>
                  <label class="checkbox-custom">
                    <input 
                      type="checkbox"
                      value="USUARIO"
                      (change)="actualizarRolesAfectados('USUARIO', $event)">
                    <span class="checkbox-label">[]� Usuario</span>
                  </label>
                  <label class="checkbox-custom">
                    <input 
                      type="checkbox"
                      value="TECNICO"
                      (change)="actualizarRolesAfectados('TECNICO', $event)">
                    <span class="checkbox-label">[]� Técnico</span>
                  </label>
                  <label class="checkbox-custom disabled">
                    <input 
                      type="checkbox"
                      checked
                      disabled>
                    <span class="checkbox-label">[]�‍[]� Admin (Siempre puede acceder)</span>
                  </label>
                  <label class="checkbox-custom disabled">
                    <input 
                      type="checkbox"
                      checked
                      disabled>
                    <span class="checkbox-label">[]�‍[]� Desarrollador (Siempre puede acceder)</span>
                  </label>
                </div>
                <div class="ayuda-campo">Los administradores y desarrolladores siempre pueden entrar, incluso durante mantenimiento</div>
              </div>

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
                <label class="etiqueta-campo">URL de Contacto de Soporte (Opcional)</label>
                <input 
                  type="url"
                  formControlName="urlContactoSoporte"
                  class="input-innoad"
                  placeholder="https://soporte.ejemplo.com">
                <div class="ayuda-campo">Link de soporte que verán los usuarios</div>
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
  `
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
  protected readonly rolesAfectados = signal<string[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    codigoSeguridad: ['', [Validators.required]],
    tipoMantenimiento: ['', [Validators.required]],
    mensaje: [''],
    fechaFinEstimada: [''],
    urlContactoSoporte: ['']
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
    this.rolesAfectados.set([]);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.formulario.reset();
    this.procesando.set(false);
    this.rolesAfectados.set([]);
  }

  actualizarRolesAfectados(rol: string, event: any): void {
    const isChecked = event.target.checked;
    const rolesActuales = [...this.rolesAfectados()];
    
    if (isChecked) {
      if (!rolesActuales.includes(rol)) {
        rolesActuales.push(rol);
      }
    } else {
      const index = rolesActuales.indexOf(rol);
      if (index > -1) {
        rolesActuales.splice(index, 1);
      }
    }
    
    this.rolesAfectados.set(rolesActuales);
  }

  ejecutarAccion(): void {
    if (this.formulario.invalid) return;

    const codigoSeguridad = this.formulario.value.codigoSeguridad!;
    this.procesando.set(true);
    this.mensajeError.set('');

    if (this.tipoAccion() === 'activar') {
      const solicitud = {
        codigoSeguridad,
        tipoMantenimiento: this.formulario.value.tipoMantenimiento,
        rolesAfectados: this.rolesAfectados(),
        rolesExcluidos: [], // Los desarrolladores siempre se excluyen
        mensaje: this.formulario.value.mensaje || undefined,
        fechaFinEstimada: this.formulario.value.fechaFinEstimada || undefined,
        urlContactoSoporte: this.formulario.value.urlContactoSoporte || undefined
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
