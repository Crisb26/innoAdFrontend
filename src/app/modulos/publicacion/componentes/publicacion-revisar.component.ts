import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicacionServicio, Publicacion } from '../../../core/servicios/publicacion.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-publicacion-revisar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="publicaciones-container">
      <header class="header">
        <h1>Revisar Publicaciones</h1>
        <button class="btn-recargar" (click)="recargar()">[]� Actualizar</button>
      </header>

      <!-- Alerta de nuevas publicaciones -->
      <div *ngIf="publicacionesPendientes.length > 0" class="alerta-banner">
        <span class="icon">[][]</span>
        <span class="mensaje">
          Se acaba de detectar {{ publicacionesPendientes.length }} 
          {{ publicacionesPendientes.length === 1 ? 'publicación' : 'publicaciones' }} 
          nueva{{ publicacionesPendientes.length === 1 ? '' : 's' }}, favor verificar
        </span>
        <span class="close" (click)="cerrarAlerta()">×</span>
      </div>

      <div class="contenido">
        <!-- Vista Grid -->
        <div class="publicaciones-grid">
          <div *ngIf="publicacionesPendientes.length === 0" class="sin-publicaciones">
            <p>✓ No hay publicaciones pendientes de revisión</p>
          </div>

          <div *ngFor="let pub of publicacionesPendientes" 
               class="publicacion-card"
               (click)="seleccionar(pub)">
            
            <!-- Thumbnail -->
            <div class="publicacion-thumbnail">
              <img [src]="pub.contenido.url" 
                   [alt]="pub.titulo"
                   (error)="$event.target.src = '/assets/imagenes/placeholder.jpg'">
              <span class="tipo-badge">
                {{ pub.contenido.tipo === 'VIDEO' ? '▶[]' : '[]�[]' }}
              </span>
            </div>

            <!-- Info -->
            <div class="publicacion-info">
              <h3>{{ pub.titulo }}</h3>
              <p class="usuario">Publicado por: <strong>{{ pub.usuarioNombre }}</strong></p>
              <p class="fecha">{{ pub.fechaCreacion | date:'medium' }}</p>
              
              <div class="ubicaciones">
                <small *ngFor="let ub of pub.ubicaciones | slice:0:2">
                  []� {{ ub.ciudad }} - {{ ub.ubicacion }}
                </small>
                <small *ngIf="pub.ubicaciones.length > 2" class="mas">
                  +{{ pub.ubicaciones.length - 2 }} más
                </small>
              </div>
            </div>

            <!-- Acciones rápidas -->
            <div class="acciones-rapidas">
              <button class="btn-aprobar" (click)="aprobar(pub); $event.stopPropagation()">
                ✓ Aprobar
              </button>
              <button class="btn-rechazar" (click)="rechazar(pub); $event.stopPropagation()">
                ✗ Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalles -->
      <div *ngIf="publicacionSeleccionada" class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-contenido" (click)="$event.stopPropagation()">
          <button class="btn-cerrar-modal" (click)="cerrarModal()">×</button>

          <div class="modal-body">
            <!-- Preview media -->
            <div class="media-preview">
              <img *ngIf="publicacionSeleccionada.contenido.tipo === 'IMAGEN'"
                   [src]="publicacionSeleccionada.contenido.url"
                   [alt]="publicacionSeleccionada.titulo">
              <video *ngIf="publicacionSeleccionada.contenido.tipo === 'VIDEO'"
                     [src]="publicacionSeleccionada.contenido.url"
                     controls>
              </video>
            </div>

            <!-- Detalles -->
            <div class="detalles">
              <h2>{{ publicacionSeleccionada.titulo }}</h2>
              <p class="descripcion">{{ publicacionSeleccionada.descripcion }}</p>

              <div class="info-grid">
                <div class="info-item">
                  <label>Cliente:</label>
                  <span>{{ publicacionSeleccionada.usuarioNombre }}</span>
                </div>
                <div class="info-item">
                  <label>Costo:</label>
                  <span>{{ publicacionSeleccionada.costo | number:'1.2' }}</span>
                </div>
                <div class="info-item">
                  <label>Duración:</label>
                  <span>{{ publicacionSeleccionada.duracionDias }} días</span>
                </div>
                <div class="info-item">
                  <label>Ubicaciones:</label>
                  <span>{{ publicacionSeleccionada.ubicaciones.length }}</span>
                </div>
              </div>

              <div class="ubicaciones-detalle">
                <h3>Ubicaciones Seleccionadas:</h3>
                <ul>
                  <li *ngFor="let ub of publicacionSeleccionada.ubicaciones">
                    []� {{ ub.ciudad }} - {{ ub.ubicacion }}
                  </li>
                </ul>
              </div>

              <!-- Formularios de decisión -->
              <div class="acciones">
                <div class="accion-aprobacion">
                  <h3>✓ Aprobar</h3>
                  <input type="text" 
                         placeholder="Notas (opcional)"
                         [(ngModel)]="notasAprobacion"
                         class="input-notas">
                  <button (click)="confirmarAprobacion()" class="btn-confirmar">
                    Aprobar Publicación
                  </button>
                </div>

                <div class="separador"></div>

                <div class="accion-rechazo">
                  <h3>✗ Rechazar</h3>
                  <textarea placeholder="Motivo del rechazo (requerido)"
                            [(ngModel)]="motivoRechazo"
                            class="input-motivo"></textarea>
                  <button (click)="confirmarRechazo()" 
                          [disabled]="!motivoRechazo.trim()"
                          class="btn-confirmar rechazar">
                    Rechazar Publicación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .publicaciones-container {
      padding: 2rem;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: #1a5490;
    }

    .btn-recargar {
      padding: 0.5rem 1rem;
      background: #1a5490;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }

    .btn-recargar:hover {
      background: #0d3a6e;
    }

    .alerta-banner {
      background: #fff3cd;
      border-left: 4px solid #ff6b6b;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .alerta-banner .icon {
      font-size: 1.5rem;
    }

    .alerta-banner .mensaje {
      flex: 1;
      color: #333;
      font-weight: 500;
    }

    .alerta-banner .close {
      cursor: pointer;
      font-size: 1.5rem;
      color: #999;
      transition: color 0.3s ease;
    }

    .alerta-banner .close:hover {
      color: #333;
    }

    .contenido {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .publicaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .sin-publicaciones {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #999;
      font-size: 1.1rem;
    }

    .publicacion-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .publicacion-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .publicacion-thumbnail {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 aspect ratio */
      overflow: hidden;
      background: #f0f0f0;
    }

    .publicacion-thumbnail img,
    .publicacion-thumbnail video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tipo-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 1rem;
    }

    .publicacion-info {
      padding: 1rem;
    }

    .publicacion-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }

    .usuario {
      margin: 0.5rem 0;
      font-size: 0.85rem;
      color: #666;
    }

    .fecha {
      margin: 0.5rem 0 1rem 0;
      font-size: 0.75rem;
      color: #999;
    }

    .ubicaciones {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .ubicaciones small {
      font-size: 0.75rem;
      color: #666;
    }

    .ubicaciones .mas {
      font-style: italic;
      color: #999;
    }

    .acciones-rapidas {
      display: flex;
      gap: 0.5rem;
      border-top: 1px solid #f0f0f0;
      padding-top: 1rem;
    }

    .btn-aprobar,
    .btn-rechazar {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-aprobar {
      background: #51cf66;
      color: white;
    }

    .btn-aprobar:hover {
      background: #37b24d;
    }

    .btn-rechazar {
      background: #ff6b6b;
      color: white;
    }

    .btn-rechazar:hover {
      background: #e63946;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-contenido {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .btn-cerrar-modal {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #f0f0f0;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 10;
    }

    .modal-body {
      padding: 2rem;
    }

    .media-preview {
      width: 100%;
      margin-bottom: 2rem;
      border-radius: 8px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .media-preview img,
    .media-preview video {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: contain;
    }

    .detalles h2 {
      color: #1a5490;
      margin-top: 0;
    }

    .descripcion {
      color: #666;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-item {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .info-item label {
      display: block;
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .info-item span {
      display: block;
      color: #333;
      font-weight: 500;
    }

    .ubicaciones-detalle {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f0f8ff;
      border-radius: 6px;
    }

    .ubicaciones-detalle h3 {
      margin-top: 0;
      color: #1a5490;
    }

    .ubicaciones-detalle ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #666;
    }

    .ubicaciones-detalle li {
      margin-bottom: 0.5rem;
    }

    .acciones {
      border-top: 2px solid #e0e0e0;
      padding-top: 2rem;
    }

    .accion-aprobacion,
    .accion-rechazo {
      margin-bottom: 2rem;
    }

    .accion-aprobacion h3,
    .accion-rechazo h3 {
      color: #1a5490;
      margin-top: 0;
    }

    .input-notas,
    .input-motivo {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin: 1rem 0;
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
    }

    .input-notas {
      height: 50px;
    }

    .input-motivo {
      min-height: 100px;
    }

    .btn-confirmar {
      width: 100%;
      padding: 0.75rem;
      background: #51cf66;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .btn-confirmar:hover:not(:disabled) {
      background: #37b24d;
    }

    .btn-confirmar.rechazar {
      background: #ff6b6b;
    }

    .btn-confirmar.rechazar:hover:not(:disabled) {
      background: #e63946;
    }

    .btn-confirmar:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .separador {
      height: 2px;
      background: #e0e0e0;
      margin: 2rem 0;
    }
  `]
})
export class PublicacionRevisarComponent implements OnInit, OnDestroy {
  publicacionesPendientes: Publicacion[] = [];
  publicacionSeleccionada: Publicacion | null = null;
  notasAprobacion = '';
  motivoRechazo = '';
  mostrarAlerta = true;

  private destroy$ = new Subject<void>();

  constructor(
    private publicacionServicio: PublicacionServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar permisos
    if (!this.permisosServicio.tienePermiso('contenidos.aprobar')) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    this.cargarPublicaciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPublicaciones(): void {
    this.publicacionServicio.obtenerPublicacionesPendientes$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(publicaciones => {
        this.publicacionesPendientes = publicaciones;
      });
  }

  recargar(): void {
    this.publicacionServicio.cargarPublicacionesPendientes();
  }

  cerrarAlerta(): void {
    this.mostrarAlerta = false;
  }

  seleccionar(pub: Publicacion): void {
    this.publicacionSeleccionada = pub;
    this.notasAprobacion = '';
    this.motivoRechazo = '';
  }

  cerrarModal(): void {
    this.publicacionSeleccionada = null;
  }

  aprobar(pub: Publicacion): void {
    this.seleccionar(pub);
    // Esperar un poco para que se renderice el modal
    setTimeout(() => {
      const element = document.querySelector('.accion-aprobacion .input-notas');
      if (element) (element as HTMLElement).focus();
    });
  }

  rechazar(pub: Publicacion): void {
    this.seleccionar(pub);
    setTimeout(() => {
      const element = document.querySelector('.accion-rechazo .input-motivo');
      if (element) (element as HTMLElement).focus();
    });
  }

  confirmarAprobacion(): void {
    if (!this.publicacionSeleccionada) return;

    this.publicacionServicio.aprobarPublicacion(
      this.publicacionSeleccionada.id,
      this.notasAprobacion || undefined
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cerrarModal();
        this.cargarPublicaciones();
      });
  }

  confirmarRechazo(): void {
    if (!this.publicacionSeleccionada || !this.motivoRechazo.trim()) return;

    this.publicacionServicio.rechazarPublicacion(
      this.publicacionSeleccionada.id,
      this.motivoRechazo
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cerrarModal();
        this.cargarPublicaciones();
      });
  }
}
