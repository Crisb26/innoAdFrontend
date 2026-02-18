import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { SolicitudActualizarPerfil, Usuario } from '@core/modelos/usuario.modelo';
import { environment } from '@environments/environment';
import { firstValueFrom } from 'rxjs';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Editar Mi Perfil</h2>
          <button class="btn-close" (click)="cerrarModal()"></button>
        </div>

        <form [formGroup]="formularioPerfil" (ngSubmit)="guardarCambios()">
          <div class="modal-body">
            <!-- Foto de Perfil -->
            <div class="form-section">
              <div class="avatar-section">
                <div class="avatar-preview">
                  @if (avatarPreview()) {
                    <img [src]="avatarPreview()" alt="Avatar" />
                  } @else {
                    <div class="avatar-placeholder">
                      {{ inicialUsuario() }}
                    </div>
                  }
                </div>
                <div class="avatar-controls">
                  <label class="btn-secondary">
                    []� Cambiar Foto
                    <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden />
                  </label>
                  @if (avatarPreview()) {
                    <button type="button" class="btn-danger-outline" (click)="eliminarFoto()">
                      []�[] Eliminar
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Información Personal (No Editable) -->
            <div class="form-section">
              <h3>[]� Información Personal</h3>
              <div class="info-readonly">
                <div class="info-item">
                  <label>Nombre Completo:</label>
                  <span>{{ usuario()?.nombreCompleto }}</span>
                </div>
                <div class="info-item">
                  <label>Usuario:</label>
                  <span>{{ usuario()?.nombreUsuario }}</span>
                </div>
                @if (usuario()?.cedula) {
                  <div class="info-item">
                    <label>Cédula:</label>
                    <span>{{ usuario()?.cedula }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Información de Contacto (Editable) -->
            <div class="form-section">
              <h3>[]� Información de Contacto</h3>
              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  placeholder="correo@ejemplo.com"
                  [class.error]="formularioPerfil.get('email')?.invalid && formularioPerfil.get('email')?.touched"
                />
                @if (formularioPerfil.get('email')?.hasError('required') && formularioPerfil.get('email')?.touched) {
                  <span class="error-message">El correo es requerido</span>
                }
                @if (formularioPerfil.get('email')?.hasError('email') && formularioPerfil.get('email')?.touched) {
                  <span class="error-message">Ingrese un correo válido</span>
                }
              </div>

              <div class="form-group">
                <label for="telefono">Número de Celular</label>
                <input 
                  type="tel" 
                  id="telefono" 
                  formControlName="telefono"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div class="form-group">
                <label for="direccion">Dirección</label>
                <textarea 
                  id="direccion" 
                  formControlName="direccion"
                  placeholder="Ingrese su dirección"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- Mensajes -->
            @if (mensajeError()) {
              <div class="alert alert-error">
                {{ mensajeError() }}
              </div>
            }
            @if (mensajeExito()) {
              <div class="alert alert-success">
                {{ mensajeExito() }}
              </div>
            }
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="cerrarModal()" [disabled]="guardando()">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" [disabled]="!formularioPerfil.valid || guardando()">
              @if (guardando()) {
                <span class="spinner"></span> Guardando...
              } @else {
                []� Guardar Cambios
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./editar-perfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly http = inject(HttpClient);

  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly guardando = signal(false);
  protected readonly mensajeError = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected formularioPerfil: FormGroup;
  private archivoSeleccionado: File | null = null;

  constructor() {
    this.formularioPerfil = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
    });
  }

  ngOnInit(): void {
    const usuarioActual = this.servicioAuth.usuarioActual();
    if (usuarioActual) {
      this.usuario.set(usuarioActual);
      this.formularioPerfil.patchValue({
        email: usuarioActual.email || '',
        telefono: usuarioActual.telefono || '',
        direccion: usuarioActual.direccion || '',
      });
      if (usuarioActual.avatarUrl) {
        this.avatarPreview.set(usuarioActual.avatarUrl);
      }
    }
  }

  protected inicialUsuario(): string {
    const nombre = this.usuario()?.nombreCompleto || this.usuario()?.nombreUsuario || 'U';
    return nombre.charAt(0).toUpperCase();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.mensajeError.set('La imagen no debe superar los 5MB');
        NotifyX.error('La imagen no debe superar los 5MB', {
          duration: 3000,
          dismissible: true
        });
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.mensajeError.set('Solo se permiten archivos de imagen');
        NotifyX.error('Solo se permiten archivos de imagen', {
          duration: 3000,
          dismissible: true
        });
        return;
      }

      this.archivoSeleccionado = file;
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
        NotifyX.success('Imagen de perfil cargada', {
          duration: 3000,
          dismissible: true
        });
      };
      reader.readAsDataURL(file);
      
      this.mensajeError.set(null);
    }
  }

  protected eliminarFoto(): void {
    this.avatarPreview.set(null);
    this.archivoSeleccionado = null;
  }

  protected async guardarCambios(): Promise<void> {
    if (!this.formularioPerfil.valid) {
      this.formularioPerfil.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    try {
      const datosActualizados: SolicitudActualizarPerfil = {
        email: this.formularioPerfil.value.email,
        telefono: this.formularioPerfil.value.telefono || undefined,
        direccion: this.formularioPerfil.value.direccion || undefined,
      };

      // Manejar avatar (foto de perfil)
      const previewActual = this.avatarPreview();
      if (previewActual) {
        // Hay imagen (nueva o existente)
        datosActualizados.avatarUrl = previewActual;
      } else {
        // Imagen fue eliminada
        datosActualizados.avatarUrl = '';
      }

      // Actualizar perfil en el backend
      const usuarioActualizado = await firstValueFrom(
        this.http.put<Usuario>(`${environment.api.baseUrl}/auth/perfil`, datosActualizados)
      );
      
      // Actualizar el usuario actual en el servicio
      this.servicioAuth.actualizarUsuarioActual(usuarioActualizado);
      
      NotifyX.success('[] Guardó los cambios', {
        duration: 3000,
        dismissible: true
      });
      
      this.mensajeExito.set('[] Guardó los cambios');
      
      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        this.cerrarModal();
      }, 1500);

    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      this.mensajeError.set(error.message || 'Error al actualizar el perfil');
    } finally {
      this.guardando.set(false);
    }
  }

  protected cerrarModal(): void {
    this.cerrar.emit();
  }
}
