import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicacionServicio } from '../../../core/servicios/publicacion.servicio';
import { UbicacionServicio, SeleccionUbicacion } from '../../../core/servicios/ubicacion.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-publicacion-crear',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="publicacion-crear-container">
      <header class="header">
        <button class="btn-volver" (click)="volver()">← Volver</button>
        <h1>✏️ Crear Nueva Publicidad</h1>
      </header>

      <div class="contenido">
        <!-- Formulario principal -->
        <div class="formulario-principal">
          <!-- Paso 1: Información básica -->
          <div class="paso-seccion">
            <div class="paso-numero">1</div>
            <div class="paso-contenido">
              <h2>Información de la Publicidad</h2>

              <div class="form-group">
                <label>Título de la Publicidad *</label>
                <input type="text"
                       [(ngModel)]="formulario.titulo"
                       placeholder="Ej: Promoción de Primavera"
                       maxlength="100">
                <small>{{ formulario.titulo.length }}/100</small>
              </div>

              <div class="form-group">
                <label>Descripción *</label>
                <textarea [(ngModel)]="formulario.descripcion"
                          placeholder="Describe tu publicidad..."
                          rows="4"
                          maxlength="500"></textarea>
                <small>{{ formulario.descripcion.length }}/500</small>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Duración (días) *</label>
                  <input type="number"
                         [(ngModel)]="formulario.duracionDias"
                         min="1"
                         max="365"
                         (change)="actualizarCosto()">
                </div>
                <div class="form-group">
                  <label>Tipo de Contenido *</label>
                  <select [(ngModel)]="formulario.tipoContenido">
                    <option value="">Seleccionar</option>
                    <option value="VIDEO">Video</option>
                    <option value="IMAGEN">Imagen</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 2: Contenido -->
          <div class="paso-seccion">
            <div class="paso-numero">2</div>
            <div class="paso-contenido">
              <h2>Contenido de la Publicidad</h2>

              <div class="form-group">
                <label>
                  {{ formulario.tipoContenido === 'VIDEO' ? '🎬 Video' : '🖼️ Imagen' }} *
                </label>
                <div class="upload-area"
                     [class.dragging]="isDragging"
                     (drop)="onDrop($event)"
                     (dragover)="onDragOver($event)"
                     (dragleave)="onDragLeave($event)">
                  <input type="file"
                         #fileInput
                         hidden
                         [accept]="formulario.tipoContenido === 'VIDEO' ? 'video/*' : 'image/*'"
                         (change)="onFileSelected($event)">
                  
                  <div class="upload-content" (click)="fileInput.click()">
                    <span class="upload-icon">
                      {{ formulario.tipoContenido === 'VIDEO' ? '📹' : '🖼️' }}
                    </span>
                    <p>Arrastra tu archivo aquí o haz clic para seleccionar</p>
                    <small>
                      {{ formulario.tipoContenido === 'VIDEO' 
                        ? 'Máximo 100 MB • Formatos: MP4, WebM, Ogg' 
                        : 'Máximo 20 MB • Formatos: JPG, PNG, WebP' }}
                    </small>
                  </div>

                  <div *ngIf="previewArchivo" class="preview">
                    <div *ngIf="formulario.tipoContenido === 'VIDEO'" class="preview-video">
                      <video [src]="previewArchivo" controls></video>
                    </div>
                    <div *ngIf="formulario.tipoContenido === 'IMAGEN'" class="preview-imagen">
                      <img [src]="previewArchivo" alt="preview">
                    </div>
                    <button class="btn-cambiar-archivo" (click)="fileInput.click()">
                      Cambiar archivo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 3: Ubicaciones -->
          <div class="paso-seccion">
            <div class="paso-numero">3</div>
            <div class="paso-contenido">
              <h2>Ubicaciones de Transmisión</h2>

              <div *ngIf="ubicacionesSeleccionadas.length === 0" class="sin-ubicaciones">
                <p>No hay ubicaciones seleccionadas aún</p>
                <button class="btn-link" (click)="irASeleccionarUbicaciones()">
                  + Seleccionar ubicaciones
                </button>
              </div>

              <div *ngIf="ubicacionesSeleccionadas.length > 0" class="ubicaciones-lista">
                <div class="ubicaciones-header">
                  <span>{{ ubicacionesSeleccionadas.length }} ubicación(es) seleccionada(s)</span>
                  <button class="btn-link" (click)="irASeleccionarUbicaciones()">
                    ✏️ Modificar
                  </button>
                </div>

                <div class="ubicaciones-grid">
                  <div *ngFor="let ubicacion of ubicacionesSeleccionadas" class="ubicacion-card">
                    <h4>{{ ubicacion.ciudadNombre }}</h4>
                    <p class="lugar-nombre">{{ ubicacion.lugarNombre }}</p>
                    <p class="pisos-info">
                      📍 {{ ubicacion.pisos.length }} piso(s)
                    </p>
                    <p class="costo-info">${{ ubicacion.costoPorDia | number:'1.2' }}/día</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel lateral: Resumen y costos -->
        <div class="panel-lateral">
          <div class="resumen-card">
            <h2>📊 Resumen</h2>

            <!-- Estado del formulario -->
            <div class="validacion-section">
              <div class="item-validacion" [class.ok]="formulario.titulo.length > 0">
                <span class="icono">{{ formulario.titulo.length > 0 ? '✓' : '○' }}</span>
                <span>Título completado</span>
              </div>
              <div class="item-validacion" [class.ok]="formulario.descripcion.length > 0">
                <span class="icono">{{ formulario.descripcion.length > 0 ? '✓' : '○' }}</span>
                <span>Descripción completada</span>
              </div>
              <div class="item-validacion" [class.ok]="formulario.tipoContenido !== ''">
                <span class="icono">{{ formulario.tipoContenido !== '' ? '✓' : '○' }}</span>
                <span>Contenido seleccionado</span>
              </div>
              <div class="item-validacion" [class.ok]="previewArchivo !== null">
                <span class="icono">{{ previewArchivo !== null ? '✓' : '○' }}</span>
                <span>Archivo cargado</span>
              </div>
              <div class="item-validacion" [class.ok]="ubicacionesSeleccionadas.length > 0">
                <span class="icono">{{ ubicacionesSeleccionadas.length > 0 ? '✓' : '○' }}</span>
                <span>Ubicaciones seleccionadas</span>
              </div>
            </div>

            <!-- Detalles de duración -->
            <div class="duracion-section">
              <h3>Duración</h3>
              <p class="duracion-valor">{{ formulario.duracionDias }} días</p>
            </div>

            <!-- Cálculo de costos -->
            <div class="costos-section" *ngIf="ubicacionesSeleccionadas.length > 0">
              <h3>Cálculo de Costos</h3>
              
              <div class="costo-item">
                <span>Ubicaciones:</span>
                <span class="valor">{{ ubicacionesSeleccionadas.length }}</span>
              </div>
              
              <div class="costo-item">
                <span>Pisos Totales:</span>
                <span class="valor">{{ calcularTotalPisos() }}</span>
              </div>
              
              <div class="costo-item">
                <span>Costo por día:</span>
                <span class="valor">${{ costoPromedioPorDia | number:'1.2' }}</span>
              </div>
              
              <div class="costo-total">
                <span>Costo Total:</span>
                <span class="precio">${{ costoTotal | number:'1.2' }}</span>
              </div>

              <small class="nota-costo">
                *Se cobrará al aprobar la publicidad
              </small>
            </div>

            <!-- Botones de acción -->
            <div class="acciones">
              <button class="btn-guardar-borrador"
                      [disabled]="!formulario.titulo || !formulario.descripcion"
                      (click)="guardarBorrador()">
                💾 Guardar Borrador
              </button>
              <button class="btn-enviar-aprobacion"
                      [disabled]="!puedeEnviar()"
                      (click)="enviarParaAprobacion()">
                ✓ Enviar para Aprobación
              </button>
            </div>

            <small class="info-aprobacion">
              Una vez enviado, el equipo técnico revisará tu publicidad en las próximas 24 horas.
            </small>
          </div>

          <!-- Info útil -->
          <div class="info-card">
            <h3>💡 Consejos</h3>
            <ul>
              <li>Usa títulos claros y atractivos</li>
              <li>Descripciones detalladas tienen mayor aprobación</li>
              <li>Videos en HD se aprueban más rápido</li>
              <li>Múltiples ubicaciones = mayor alcance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .publicacion-crear-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .header {
      background: white;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-volver {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      color: #1a5490;
      transition: color 0.3s ease;
    }

    .btn-volver:hover {
      color: #0d3a6e;
    }

    .header h1 {
      margin: 0;
      color: #1a5490;
      flex: 1;
    }

    .contenido {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .contenido {
        grid-template-columns: 1fr;
      }
    }

    .paso-seccion {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1.5rem;
    }

    .paso-numero {
      min-width: 50px;
      width: 50px;
      height: 50px;
      background: #1a5490;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .paso-contenido {
      flex: 1;
    }

    .paso-contenido h2 {
      margin: 0 0 1.5rem 0;
      color: #1a5490;
      font-size: 1.25rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #1a5490;
    }

    .form-group small {
      display: block;
      margin-top: 0.25rem;
      color: #999;
      font-size: 0.85rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .upload-area {
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f9f9f9;
    }

    .upload-area:hover {
      border-color: #1a5490;
      background: #f0f8ff;
    }

    .upload-area.dragging {
      border-color: #1a5490;
      background: #e3f2fd;
    }

    .upload-content {
      cursor: pointer;
    }

    .upload-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .upload-content p {
      margin: 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .upload-content small {
      display: block;
      color: #999;
      font-size: 0.85rem;
    }

    .preview {
      margin-top: 1.5rem;
      position: relative;
    }

    .preview-video,
    .preview-imagen {
      max-height: 300px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .preview-video video,
    .preview-imagen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .btn-cambiar-archivo {
      padding: 0.5rem 1rem;
      background: #1a5490;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .btn-cambiar-archivo:hover {
      background: #0d3a6e;
    }

    .sin-ubicaciones {
      text-align: center;
      padding: 2rem;
      background: #f9f9f9;
      border-radius: 8px;
      color: #999;
    }

    .sin-ubicaciones p {
      margin: 0 0 1rem 0;
    }

    .btn-link {
      background: none;
      border: none;
      color: #1a5490;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .btn-link:hover {
      color: #0d3a6e;
      text-decoration: underline;
    }

    .ubicaciones-lista {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .ubicaciones-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .ubicaciones-header span {
      color: #333;
      font-weight: 600;
    }

    .ubicaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .ubicacion-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #1a5490;
    }

    .ubicacion-card h4 {
      margin: 0 0 0.5rem 0;
      color: #1a5490;
      font-size: 0.95rem;
    }

    .lugar-nombre {
      margin: 0.25rem 0;
      color: #333;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .pisos-info,
    .costo-info {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.85rem;
    }

    .panel-lateral {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .resumen-card,
    .info-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .resumen-card h2,
    .info-card h3 {
      color: #1a5490;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }

    .validacion-section {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .item-validacion {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: #999;
      font-size: 0.9rem;
    }

    .item-validacion.ok {
      color: #51cf66;
      font-weight: 600;
    }

    .item-validacion .icono {
      font-weight: 700;
      font-size: 1.1rem;
    }

    .duracion-section,
    .costos-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .duracion-section h3,
    .costos-section h3 {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-size: 0.95rem;
    }

    .duracion-valor {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a5490;
    }

    .costo-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .costo-item .valor {
      font-weight: 600;
      color: #333;
    }

    .costo-total {
      display: flex;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 2px solid #ddd;
      font-weight: 600;
      font-size: 1.1rem;
      color: #1a5490;
    }

    .costo-total .precio {
      font-size: 1.25rem;
      color: #51cf66;
    }

    .nota-costo {
      display: block;
      margin-top: 0.75rem;
      color: #999;
      font-size: 0.75rem;
    }

    .acciones {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .btn-guardar-borrador,
    .btn-enviar-aprobacion {
      padding: 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .btn-guardar-borrador {
      background: #f0f0f0;
      color: #333;
    }

    .btn-guardar-borrador:hover:not(:disabled) {
      background: #e0e0e0;
    }

    .btn-enviar-aprobacion {
      background: #1a5490;
      color: white;
    }

    .btn-enviar-aprobacion:hover:not(:disabled) {
      background: #0d3a6e;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(26, 84, 144, 0.3);
    }

    .btn-guardar-borrador:disabled,
    .btn-enviar-aprobacion:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .info-aprobacion {
      display: block;
      text-align: center;
      color: #999;
      font-size: 0.8rem;
    }

    .info-card {
      background: #f0f8ff;
      border-left: 4px solid #1a5490;
    }

    .info-card ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .info-card li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class PublicacionCrearComponent implements OnInit, OnDestroy {
  formulario = {
    titulo: '',
    descripcion: '',
    duracionDias: 30,
    tipoContenido: ''
  };

  previewArchivo: string | null = null;
  ubicacionesSeleccionadas: SeleccionUbicacion[] = [];
  costoTotal = 0;
  costoPromedioPorDia = 0;
  isDragging = false;

  private destroy$ = new Subject<void>();

  constructor(
    private publicacionServicio: PublicacionServicio,
    private ubicacionServicio: UbicacionServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que es usuario
    if (!this.permisosServicio.esUsuario()) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    // Recuperar ubicaciones del estado de navegación si existen
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state;
      this.ubicacionesSeleccionadas = state.ubicacionesSeleccionadas || [];
      this.formulario.duracionDias = state.duracionDias || 30;
      this.costoTotal = state.costoEstimado || 0;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  procesarArchivo(file: File): void {
    // Validaciones
    const esVideo = this.formulario.tipoContenido === 'VIDEO';
    const maxSize = esVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024; // 100MB para video, 20MB para imagen

    if (file.size > maxSize) {
      alert(`Archivo muy grande. Máximo: ${esVideo ? '100 MB' : '20 MB'}`);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewArchivo = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  actualizarCosto(): void {
    this.costoTotal = this.ubicacionServicio.calcularCostoTotal(
      this.formulario.duracionDias
    );
    this.costoPromedioPorDia = this.ubicacionesSeleccionadas.reduce(
      (total, ub) => total + ub.costoPorDia,
      0
    );
  }

  calcularTotalPisos(): number {
    return this.ubicacionesSeleccionadas.reduce(
      (total, ub) => total + ub.pisos.length,
      0
    );
  }

  irASeleccionarUbicaciones(): void {
    this.router.navigate(['/publicacion/seleccionar-ubicaciones'], {
      state: {
        ubicacionesPreseleccionadas: this.ubicacionesSeleccionadas,
        duracionDias: this.formulario.duracionDias
      }
    });
  }

  puedeEnviar(): boolean {
    return (
      this.formulario.titulo.length > 0 &&
      this.formulario.descripcion.length > 0 &&
      this.formulario.tipoContenido !== '' &&
      this.previewArchivo !== null &&
      this.ubicacionesSeleccionadas.length > 0
    );
  }

  guardarBorrador(): void {
    if (!this.formulario.titulo || !this.formulario.descripcion) {
      alert('Por favor completa al menos el título y la descripción');
      return;
    }

    alert('✓ Borrador guardado exitosamente');
    // En un caso real, enviaría al servidor
  }

  enviarParaAprobacion(): void {
    if (!this.puedeEnviar()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Crear objeto de publicación
    const publicacion = {
      titulo: this.formulario.titulo,
      descripcion: this.formulario.descripcion,
      tipoContenido: this.formulario.tipoContenido,
      duracionDias: this.formulario.duracionDias,
      ubicaciones: this.ubicacionesSeleccionadas,
      costoTotal: this.costoTotal,
      estado: 'PENDIENTE'
    };

    // Enviar al servicio
    this.publicacionServicio.enviarParaAprobacion(publicacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          alert('✓ Publicidad enviada para revisión. Te notificaremos pronto.');
          this.router.navigate(['/usuario/dashboard']);
        },
        error: (error) => {
          alert('Error al enviar la publicidad: ' + error.message);
        }
      });
  }

  volver(): void {
    if (confirm('¿Descartar cambios?')) {
      this.router.navigate(['/usuario/dashboard']);
    }
  }
}
