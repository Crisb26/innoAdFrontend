import { Component, inject, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicioContenidos } from '@core/servicios/contenidos.servicio';
import { Contenido, SolicitudSubirContenido, SolicitudActualizarContenido } from '@core/modelos';

@Component({
  selector: 'app-formulario-contenido',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./formulario-contenido.component.scss'],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="enviar()" class="formulario-contenido">
      <div class="grupo-formulario">
        <label>Nombre del Contenido</label>
        <input 
          type="text" 
          formControlName="nombre"
          class="entrada-formulario"
          placeholder="Ej: Banner Principal Verano"
        >
        @if (formulario.get('nombre')?.invalid && formulario.get('nombre')?.touched) {
          <span class="error-validacion">El nombre es requerido</span>
        }
      </div>

      <div class="grupo-formulario">
        <label>Descripción</label>
        <textarea 
          formControlName="descripcion"
          class="entrada-formulario textarea"
          placeholder="Describe el contenido..."
          rows="4"
        ></textarea>
      </div>

      <div class="grupo-formulario">
        <label>Tipo de Contenido</label>
        <select formControlName="tipo" class="entrada-formulario" (change)="cambiarTipo()">
          <option value="">Selecciona un tipo</option>
          <option value="imagen">Imagen (JPG, PNG, GIF)</option>
          <option value="video">Video (MP4, WebM)</option>
          <option value="texto">Texto Plano</option>
          <option value="html">Contenido HTML</option>
        </select>
        @if (formulario.get('tipo')?.invalid && formulario.get('tipo')?.touched) {
          <span class="error-validacion">Selecciona un tipo</span>
        }
      </div>

      @if (formulario.get('tipo')?.value === 'imagen' || formulario.get('tipo')?.value === 'video') {
        <div class="grupo-formulario">
          <label>Archivo</label>
          @if (!esNuevo) {
            <p class="info-archivo">Archivo actual: {{ contenido?.nombre }}</p>
          }
          <div class="area-carga" [class.dragover]="dragover()" 
               (dragover)="handleDragOver($event)" 
               (dragleave)="dragover.set(false)"
               (drop)="handleDrop($event)">
            <input 
              type="file" 
              #archivoInput
              (change)="archivoSeleccionado($event)"
              [accept]="obtenerTiposAceptados()"
              class="entrada-archivo"
            >
            <div class="contenido-carga">
              <span class="icono-carga">upload</span>
              <p>Arrastra archivo aquí o <span class="enlace">selecciona</span></p>
              <p class="texto-pequeno">Máximo 500MB</p>
            </div>
          </div>
          @if (archivo()) {
            <div class="preview-archivo">
              <span>Archivo seleccionado: {{ archivo()?.name }}</span>
              <span class="tamaño">{{ (archivo()?.size || 0) / 1024 / 1024 | number:'1.2-2' }}MB</span>
            </div>
          }
        </div>
      }

      @if (formulario.get('tipo')?.value === 'texto') {
        <div class="grupo-formulario">
          <label>Contenido de Texto</label>
          <textarea 
            formControlName="contenidoTexto"
            class="entrada-formulario textarea"
            placeholder="Ingresa el contenido de texto..."
            rows="6"
          ></textarea>
        </div>
      }

      @if (formulario.get('tipo')?.value === 'html') {
        <div class="grupo-formulario">
          <label>Código HTML</label>
          <textarea 
            formControlName="contenidoHTML"
            class="entrada-formulario textarea codigo"
            placeholder="&lt;div&gt;...&lt;/div&gt;"
            rows="8"
          ></textarea>
          <p class="info-html">Asegúrate de que el HTML sea válido y seguro</p>
        </div>
      }

      @if (formulario.get('tipo')?.value === 'video' || formulario.get('tipo')?.value === 'imagen') {
        <div class="grupo-formulario">
          <label>Duración (segundos)</label>
          <input 
            type="number" 
            formControlName="duracion"
            class="entrada-formulario"
            min="1"
            placeholder="Duración en segundos"
          >
        </div>
      }

      <div class="grupo-formulario">
        <label>Etiquetas (separadas por comas)</label>
        <input 
          type="text" 
          formControlName="etiquetas"
          class="entrada-formulario"
          placeholder="promocion, verano, ofertas"
        >
      </div>

      @if (progreso() > 0 && progreso() < 100) {
        <div class="contenedor-progreso">
          <div class="barra-progreso">
            <div class="progreso-lleno" [style.width.%]="progreso()"></div>
          </div>
          <span class="texto-progreso">{{ progreso() }}%</span>
        </div>
      }

      <div class="acciones-formulario">
        <button type="button" class="boton-secundario" (click)="cancelar()">
          Cancelar
        </button>
        <button 
          type="submit" 
          class="boton-primario"
          [disabled]="!formulario.valid || enviando()"
        >
          @if (enviando()) {
            Guardando...
          } @else {
            {{ esNuevo ? 'Crear Contenido' : 'Actualizar Contenido' }}
          }
        </button>
      </div>
    </form>
  `
})
export class FormularioContenidoComponent implements OnInit {
  private readonly servicio = inject(ServicioContenidos);
  private readonly fb = inject(FormBuilder);

  @Input() esNuevo: boolean = true;
  @Input() contenido?: Contenido;
  @Output() guardar = new EventEmitter<Contenido>();
  @Output() cerrar = new EventEmitter<void>();

  formulario!: FormGroup;
  archivo = signal<File | null>(null);
  dragover = signal(false);
  progreso = signal(0);
  enviando = signal(false);

  ngOnInit() {
    this.inicializarFormulario();
  }

  private inicializarFormulario() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      tipo: ['', [Validators.required]],
      duracion: [30],
      etiquetas: [''],
      contenidoTexto: [''],
      contenidoHTML: ['']
    });

    if (!this.esNuevo && this.contenido) {
      this.formulario.patchValue({
        nombre: this.contenido.nombre,
        descripcion: this.contenido.descripcion,
        tipo: this.contenido.tipo,
        duracion: this.contenido.duracion,
        etiquetas: this.contenido.etiquetas?.join(', ') || ''
      });
    }
  }

  cambiarTipo() {
    const tipo = this.formulario.get('tipo')?.value;
    this.archivo.set(null);
  }

  obtenerTiposAceptados(): string {
    const tipo = this.formulario.get('tipo')?.value;
    if (tipo === 'imagen') return 'image/*';
    if (tipo === 'video') return 'video/*';
    return '';
  }

  archivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivo.set(input.files[0]);
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragover.set(true);
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.dragover.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.archivo.set(event.dataTransfer.files[0]);
    }
  }

  enviar() {
    if (!this.formulario.valid) return;

    this.enviando.set(true);

    if (this.esNuevo && this.archivo()) {
      const solicitud: SolicitudSubirContenido = {
        archivo: this.archivo()!,
        nombre: this.formulario.get('nombre')?.value,
        descripcion: this.formulario.get('descripcion')?.value,
        tipo: this.formulario.get('tipo')?.value,
        etiquetas: this.formulario.get('etiquetas')?.value?.split(',').map((e: string) => e.trim()) || [],
        categoria: 'general',
        visibilidad: 'privado',
        duracion: this.formulario.get('duracion')?.value || 30
      };

      this.servicio.subir(solicitud).subscribe({
        next: (evento) => {
          if (evento.type === 4) {
            this.enviando.set(false);
            this.guardar.emit(evento.body);
          }
        },
        error: (error) => {
          console.error('Error subiendo contenido', error);
          this.enviando.set(false);
        }
      });
    } else if (!this.esNuevo && this.contenido) {
      const solicitud: SolicitudActualizarContenido = {
        id: this.contenido.id,
        nombre: this.formulario.get('nombre')?.value,
        descripcion: this.formulario.get('descripcion')?.value,
        etiquetas: this.formulario.get('etiquetas')?.value?.split(',').map((e: string) => e.trim()) || []
      };

      this.servicio.actualizar(solicitud).subscribe({
        next: (contenido) => {
          this.enviando.set(false);
          this.guardar.emit(contenido);
        },
        error: (error) => {
          console.error('Error actualizando contenido', error);
          this.enviando.set(false);
        }
      });
    }
  }

  cancelar() {
    this.cerrar.emit();
  }
}
