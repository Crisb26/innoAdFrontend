import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-formulario-campana',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-contenido" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nueva Campaña</h2>
          <button class="btn-cerrar" (click)="cerrar()">×</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-body">
          <div class="campo">
            <label>Nombre de la Campaña</label>
            <input 
              type="text" 
              formControlName="nombre"
              placeholder="Ej: Black Friday 2024"
              class="entrada"
            >
          </div>
          <div class="campo">
            <label>Descripción</label>
            <textarea 
              formControlName="descripcion"
              placeholder="Detalles de la campaña"
              rows="3"
              class="entrada"
            ></textarea>
          </div>
          <div class="fila-dos">
            <div class="campo">
              <label>Fecha de Inicio</label>
              <input 
                type="datetime-local" 
                formControlName="fechaInicio"
                class="entrada"
              >
            </div>
            <div class="campo">
              <label>Fecha de Fin</label>
              <input 
                type="datetime-local" 
                formControlName="fechaFin"
                class="entrada"
              >
            </div>
          </div>
          <div class="campo">
            <label>Pantallas Asignadas</label>
            <select formControlName="pantallasAsignadas" class="entrada">
              <option value="">Seleccionar cantidad</option>
              <option value="1">1 pantalla</option>
              <option value="3">3 pantallas</option>
              <option value="5">5 pantallas</option>
              <option value="8">8 pantallas</option>
              <option value="10">10+ pantallas</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="boton-secundario" (click)="cerrar()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="boton-primario"
              [disabled]="!form.valid"
            >
              Crear Campaña
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./formulario-campana.component.scss']
})
export class FormularioCampanaComponent {
  fb = new FormBuilder();
  
  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    pantallasAsignadas: ['', Validators.required]
  });

  guardar() {
    if (this.form.valid) {
      console.log('Guardar campaña:', this.form.value);
    }
  }

  cerrar() {
    console.log('Cerrar formulario');
  }
}
