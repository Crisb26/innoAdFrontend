import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import NotifyX from 'notifyx';
import 'notifyx/style.css';

@Component({
  selector: 'app-publicar-contenido',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./publicar-contenido.component.scss'],
  template: `
    <div class="contenedor-publicacion">
      <div class="encabezado-seccion">
        <h1>Publicar Contenido</h1>
        <p>Comparte tu contenido en las pantallas digitales</p>
      </div>

      <div class="tarjeta-publicacion">
        <form [formGroup]="formulario" (ngSubmit)="publicar()" class="formulario-publicacion">
          @if (mensajeError()) {
            <div class="alerta alerta-error">{{ mensajeError() }}</div>
          }

          @if (mensajeExito()) {
            <div class="alerta alerta-exito">
              <span class="icono-exito">✓</span>
              {{ mensajeExito() }}
            </div>
          }

          <!-- Tipo de Contenido -->
          <div class="grupo-input">
            <label for="tipo">Tipo de Contenido *</label>
            <select id="tipo" formControlName="tipo" class="input-innoad">
              <option value="">Seleccione un tipo</option>
              <option value="imagen">Imagen</option>
              <option value="video">Video</option>
              <option value="texto">Texto</option>
              <option value="html">HTML/Web</option>
            </select>
            @if (formulario.get('tipo')?.invalid && formulario.get('tipo')?.touched) {
              <span class="texto-error">Seleccione un tipo de contenido</span>
            }
          </div>

          <!-- Título -->
          <div class="grupo-input">
            <label for="titulo">Título *</label>
            <input
              id="titulo"
              type="text"
              formControlName="titulo"
              class="input-innoad"
              placeholder="Ej: Promoción de Verano 2024"
            />
            @if (formulario.get('titulo')?.invalid && formulario.get('titulo')?.touched) {
              <span class="texto-error">El título es requerido</span>
            }
          </div>

          <!-- Descripción -->
          <div class="grupo-input">
            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              formControlName="descripcion"
              class="input-innoad textarea-innoad"
              rows="3"
              placeholder="Describe tu contenido..."
            ></textarea>
          </div>

          <!-- Carga de Archivo -->
          @if (formulario.get('tipo')?.value === 'imagen' || formulario.get('tipo')?.value === 'video') {
            <div class="grupo-input">
              <label for="archivo">Archivo *</label>
              <div class="zona-carga" (click)="abrirSelectorArchivo()"
                   [class.cargando]="cargandoArchivo()">
                @if (!archivoSeleccionado() && !cargandoArchivo()) {
                  <div class="contenido-zona-carga">
                    <svg class="icono-carga" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <p>Haz clic para seleccionar un archivo</p>
                    <span class="texto-small">
                      @if (formulario.get('tipo')?.value === 'imagen') {
                        JPG, PNG, GIF, WEBP (Máx. 10MB)
                      } @else {
                        MP4, WEBM, OGG (Máx. 50MB)
                      }
                    </span>
                  </div>
                }
                @if (cargandoArchivo()) {
                  <div class="contenido-zona-carga">
                    <div class="loader"></div>
                    <p>Subiendo archivo...</p>
                    <span class="texto-small">{{ progresoSubida() }}%</span>
                  </div>
                }
                @if (archivoSeleccionado() && !cargandoArchivo()) {
                  <div class="contenido-zona-carga">
                    <div class="icono-exito-grande">✓</div>
                    <p>{{ nombreArchivo() }}</p>
                    <button type="button" class="btn-eliminar" (click)="eliminarArchivo($event)">
                      Eliminar
                    </button>
                  </div>
                }
              </div>
              <input
                #fileInput
                type="file"
                (change)="onFileSelected($event)"
                [accept]="obtenerTiposAceptados()"
                class="input-file-oculto"
              />
            </div>
          }

          <!-- URL para HTML -->
          @if (formulario.get('tipo')?.value === 'html') {
            <div class="grupo-input">
              <label for="url">URL del Sitio Web *</label>
              <input
                id="url"
                type="url"
                formControlName="archivoUrl"
                class="input-innoad"
                placeholder="https://ejemplo.com"
              />
            </div>
          }

          <!-- Texto Plano -->
          @if (formulario.get('tipo')?.value === 'texto') {
            <div class="grupo-input">
              <label for="textoContenido">Contenido de Texto *</label>
              <textarea
                id="textoContenido"
                formControlName="textoContenido"
                class="input-innoad textarea-innoad"
                rows="6"
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>
          }

          <!-- Duración -->
          <div class="grupo-input">
            <label for="duracion">Duración en Pantalla (segundos) *</label>
            <input
              id="duracion"
              type="number"
              formControlName="duracion"
              class="input-innoad"
              min="5"
              max="300"
              placeholder="30"
            />
            @if (formulario.get('duracion')?.invalid && formulario.get('duracion')?.touched) {
              <span class="texto-error">La duración debe ser entre 5 y 300 segundos</span>
            }
          </div>

          <!-- Prioridad -->
          <div class="grupo-input">
            <label for="prioridad">Prioridad</label>
            <select id="prioridad" formControlName="prioridad" class="input-innoad">
              <option value="1">Baja</option>
              <option value="5">Media</option>
              <option value="10">Alta</option>
            </select>
            <span class="texto-small">La prioridad alta aparecerá más frecuentemente</span>
          </div>

          <!-- Botones -->
          <div class="grupo-botones">
            <button
              type="button"
              class="boton-secundario"
              (click)="cancelar()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="boton-innoad boton-primario"
              [disabled]="formulario.invalid || cargando() || cargandoArchivo()"
            >
              @if (cargando()) {
                <span class="loader-pequeño"></span>
              } @else {
                Publicar Contenido
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Vista Previa -->
      @if (archivoSeleccionado()) {
        <div class="tarjeta-vista-previa">
          <h3>Vista Previa</h3>
          <div class="contenedor-preview">
            @if (formulario.get('tipo')?.value === 'imagen') {
              <img [src]="urlPreview()" alt="Preview" class="imagen-preview">
            }
            @if (formulario.get('tipo')?.value === 'video') {
              <video [src]="urlPreview()" controls class="video-preview"></video>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PublicarContenidoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly cargandoArchivo = signal(false);
  protected readonly mensajeError = signal('');
  protected readonly mensajeExito = signal('');
  protected readonly archivoSeleccionado = signal(false);
  protected readonly nombreArchivo = signal('');
  protected readonly urlPreview = signal('');
  protected readonly progresoSubida = signal(0);

  protected readonly formulario = this.fb.nonNullable.group({
    tipo: ['', [Validators.required]],
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    archivoUrl: [''],
    textoContenido: [''],
    duracion: [30, [Validators.required, Validators.min(5), Validators.max(300)]],
    prioridad: [5]
  });

  abrirSelectorArchivo(): void {
    if (this.cargandoArchivo()) return;
    const fileInput = document.querySelector('.input-file-oculto') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo y tamaño
    const tipo = this.formulario.get('tipo')?.value;
    const maxSize = tipo === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.mensajeError.set(`El archivo es demasiado grande. Máximo ${maxSize / 1024 / 1024}MB`);
      return;
    }

    this.nombreArchivo.set(file.name);
    this.archivoSeleccionado.set(true);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.urlPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simular subida (aquí integrarías con Cloudinary o tu CDN)
    this.simularSubidaArchivo(file);
  }

  private simularSubidaArchivo(file: File): void {
    this.cargandoArchivo.set(true);
    this.progresoSubida.set(0);

    // Simulación de progreso
    const interval = setInterval(() => {
      const progreso = this.progresoSubida();
      if (progreso < 100) {
        this.progresoSubida.set(progreso + 10);
      } else {
        clearInterval(interval);
        this.cargandoArchivo.set(false);
        // Aquí guardarías la URL real del archivo subido
        this.formulario.patchValue({
          archivoUrl: 'https://cdn.ejemplo.com/' + file.name
        });
      }
    }, 200);
  }

  eliminarArchivo(event: Event): void {
    event.stopPropagation();
    this.archivoSeleccionado.set(false);
    this.nombreArchivo.set('');
    this.urlPreview.set('');
    this.formulario.patchValue({ archivoUrl: '' });
  }

  obtenerTiposAceptados(): string {
    const tipo = this.formulario.get('tipo')?.value;
    if (tipo === 'imagen') {
      return 'image/jpeg,image/png,image/gif,image/webp';
    } else if (tipo === 'video') {
      return 'video/mp4,video/webm,video/ogg';
    }
    return '';
  }

  publicar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    // Aquí harías la llamada real al backend
    // Por ahora simulamos
    setTimeout(() => {
      this.cargando.set(false);
      this.mensajeExito.set('¡Contenido publicado exitosamente!');
      NotifyX.success('Publicación de contenido exitosa', {
        duration: 3000,
        dismissible: true
      });

      setTimeout(() => {
        this.router.navigate(['/contenidos']);
      }, 2000);
    }, 1500);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}

