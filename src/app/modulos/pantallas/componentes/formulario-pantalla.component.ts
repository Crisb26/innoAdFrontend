import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PantallasService, SolicitudPantalla, RespuestaPantalla } from '../../../core/servicios/pantallas.service';

@Component({
  selector: 'app-formulario-pantalla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-contenido" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ esEdicion ? 'Editar Pantalla' : 'Nueva Pantalla' }}</h2>
          <button class="btn-cerrar" (click)="cerrar()">×</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
          <div class="campo">
            <label>Nombre de la Pantalla</label>
            <input 
              type="text" 
              formControlName="nombre"
              placeholder="Ej: Pantalla Entrada"
              class="entrada"
            >
          </div>
          <div class="campo">
            <label>Ubicación</label>
            <input 
              type="text" 
              formControlName="ubicacion"
              placeholder="Ej: Recepción"
              class="entrada"
            >
          </div>
          <div class="fila-dos">
            <div class="campo">
              <label>Resolución</label>
              <select formControlName="resolucion" class="entrada">
                <option value="">Seleccionar</option>
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="1280x720">1280x720 (HD)</option>
                <option value="1024x768">1024x768 (XGA)</option>
                <option value="2560x1440">2560x1440 (2K)</option>
              </select>
            </div>
            <div class="campo">
              <label>Orientación de Pantalla</label>
              <select formControlName="orientacion" class="entrada">
                <option value="HORIZONTAL">📺 Horizontal (16:9) - Recomendado</option>
                <option value="VERTICAL">📱 Vertical (9:16) - Para publicaciones verticales</option>
              </select>
            </div>
          </div>
          <div class="campo">
            <label>Descripción</label>
            <textarea 
              formControlName="descripcion"
              placeholder="Detalles adicionales"
              rows="3"
              class="entrada"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="boton-secundario" (click)="cerrar()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="boton-primario"
              [disabled]="!form.valid || cargando()"
            >
              {{ cargando() ? 'Procesando...' : (esEdicion ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./formulario-pantalla.component.scss']
})
export class FormularioPantallaComponent {
  @Input() pantalla: RespuestaPantalla | null = null;
  @Output() guardarExitoso = new EventEmitter<void>();
  
  fb = new FormBuilder();
  esEdicion = false;
  cargando = signal(false);
  
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    ubicacion: [''],
    resolucion: [''],
    orientacion: ['HORIZONTAL', Validators.required],
    descripcion: ['']
  });

  constructor(private pantallasService: PantallasService) {
    // Si hay pantalla, cargar datos para edición
    if (this.pantalla) {
      this.esEdicion = true;
      this.form.patchValue({
        nombre: this.pantalla.nombre,
        ubicacion: this.pantalla.ubicacion,
        resolucion: this.pantalla.resolucion,
        orientacion: this.pantalla.orientacion,
        descripcion: this.pantalla.descripcion
      });
    }
  }

  guardar() {
    if (this.form.valid) {
      this.cargando.set(true);
      const solicitud: SolicitudPantalla = {
        nombre: this.form.get('nombre')?.value,
        ubicacion: this.form.get('ubicacion')?.value,
        resolucion: this.form.get('resolucion')?.value,
        orientacion: this.form.get('orientacion')?.value as 'HORIZONTAL' | 'VERTICAL',
        descripcion: this.form.get('descripcion')?.value
      };

      if (this.esEdicion && this.pantalla) {
        this.pantallasService.actualizarPantalla(this.pantalla.id, solicitud).subscribe({
          next: (response) => {
            this.cargando.set(false);
            if (response.exitoso) {
              this.pantallasService.cargarPantallas();
              this.guardarExitoso.emit();
            }
          },
          error: (error) => {
            this.cargando.set(false);
            console.error('Error al actualizar pantalla:', error);
          }
        });
      } else {
        this.pantallasService.crearPantalla(solicitud).subscribe({
          next: (response) => {
            this.cargando.set(false);
            if (response.exitoso) {
              this.pantallasService.cargarPantallas();
              this.guardarExitoso.emit();
            }
          },
          error: (error) => {
            this.cargando.set(false);
            console.error('Error al crear pantalla:', error);
          }
        });
      }
    }
  }

  cerrar() {
    this.guardarExitoso.emit();
  }
}
