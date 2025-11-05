import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicar-contenido',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="contenedor-publicacion">
      <div class="encabezado-seccion">
        <h1>📢 Publicar Contenido</h1>
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
              <option value="imagen">📷 Imagen</option>
              <option value="video">🎥 Video</option>
              <option value="texto">📝 Texto</option>
              <option value="html">🌐 HTML/Web</option>
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
                    <div class="icono-carga">📁</div>
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
  `,
  styles: [`
    .contenedor-publicacion {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .encabezado-seccion {
      text-align: center;
      margin-bottom: 2rem;
    }

    .encabezado-seccion h1 {
      font-size: 2.5rem;
      color: #00d9ff;
      margin-bottom: 0.5rem;
    }

    .encabezado-seccion p {
      color: #b4b8d0;
      font-size: 1.1rem;
    }

    .tarjeta-publicacion {
      background: rgba(26, 31, 58, 0.9);
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid rgba(0, 217, 255, 0.2);
      margin-bottom: 2rem;
    }

    .formulario-publicacion {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .grupo-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .grupo-input label {
      color: #b4b8d0;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .textarea-innoad {
      min-height: 100px;
      resize: vertical;
    }

    .zona-carga {
      border: 2px dashed rgba(0, 217, 255, 0.3);
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .zona-carga:hover {
      border-color: rgba(0, 217, 255, 0.6);
      background: rgba(0, 217, 255, 0.05);
    }

    .zona-carga.cargando {
      border-color: rgba(0, 217, 255, 0.5);
      background: rgba(0, 217, 255, 0.1);
      cursor: wait;
    }

    .contenido-zona-carga {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .icono-carga {
      font-size: 3rem;
    }

    .icono-exito-grande {
      font-size: 3rem;
      color: #00d975;
    }

    .input-file-oculto {
      display: none;
    }

    .btn-eliminar {
      background: rgba(255, 68, 68, 0.2);
      color: #ff4444;
      border: 1px solid #ff4444;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-eliminar:hover {
      background: rgba(255, 68, 68, 0.3);
    }

    .texto-small {
      font-size: 0.85rem;
      color: #8b8fa3;
    }

    .loader {
      border: 3px solid rgba(0, 217, 255, 0.3);
      border-top-color: #00d9ff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: girar 0.8s linear infinite;
    }

    .grupo-botones {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .boton-secundario {
      flex: 1;
      padding: 1rem;
      border: 1px solid rgba(0, 217, 255, 0.3);
      background: transparent;
      color: #00d9ff;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .boton-secundario:hover {
      background: rgba(0, 217, 255, 0.1);
    }

    .boton-primario {
      flex: 2;
    }

    .tarjeta-vista-previa {
      background: rgba(26, 31, 58, 0.9);
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid rgba(0, 217, 255, 0.2);
    }

    .tarjeta-vista-previa h3 {
      color: #00d9ff;
      margin-bottom: 1rem;
    }

    .contenedor-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(10, 14, 39, 0.5);
      border-radius: 8px;
      padding: 1rem;
      min-height: 200px;
    }

    .imagen-preview, .video-preview {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
    }

    .alerta {
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alerta-error {
      background: rgba(255, 68, 68, 0.1);
      border: 1px solid rgba(255, 68, 68, 0.3);
      color: #ff4444;
    }

    .alerta-exito {
      background: rgba(0, 217, 117, 0.1);
      border: 1px solid rgba(0, 217, 117, 0.3);
      color: #00d975;
    }

    .icono-exito {
      font-size: 1.2rem;
    }

    .texto-error {
      color: #ff4444;
      font-size: 0.8rem;
    }

    .loader-pequeño {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }

    @keyframes girar {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .contenedor-publicacion {
        padding: 1rem;
      }

      .grupo-botones {
        flex-direction: column;
      }
    }
  `]
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

      setTimeout(() => {
        this.router.navigate(['/contenidos']);
      }, 2000);
    }, 1500);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
