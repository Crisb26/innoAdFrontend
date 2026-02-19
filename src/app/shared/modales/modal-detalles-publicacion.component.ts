import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PublicacionDetalles {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  ubicaciones: number;
  costoTotal: number;
  fechaCreacion: string;
  fechaPublicacion?: string;
  contenido?: string;
  imagenUrl?: string;
}

@Component({
  selector: 'app-modal-detalles-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Detalles de Publicación -->
    <div class="modal fade" [id]="'modal-' + publicacion?.id" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalles de Publicación</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" *ngIf="publicacion">
            <div class="publicacion-detalles">
              <!-- Imagen si existe -->
              <div *ngIf="publicacion.imagenUrl" class="imagen-container">
                <img [src]="publicacion.imagenUrl" alt="Publicación" class="img-fluid">
              </div>

              <!-- Información básica -->
              <div class="info-basica">
                <h3>{{ publicacion.titulo }}</h3>
                <p class="descripcion">{{ publicacion.descripcion }}</p>
              </div>

              <!-- Estado -->
              <div class="estado-container">
                <span [ngClass]="'estado-badge estado-' + (publicacion.estado | lowercase)">
                  {{ getEstadoLabel(publicacion.estado) }}
                </span>
              </div>

              <!-- Detalles -->
              <div class="detalles-grid">
                <div class="detalle">
                  <label>Ubicaciones:</label>
                  <strong>{{ publicacion.ubicaciones }}</strong>
                </div>
                <div class="detalle">
                  <label>Costo Total:</label>
                  <strong>{{ publicacion.costoTotal | number:'1.2-2' }}</strong>
                </div>
                <div class="detalle">
                  <label>Fecha Creación:</label>
                  <strong>{{ publicacion.fechaCreacion | date:'short' }}</strong>
                </div>
                <div class="detalle" *ngIf="publicacion.fechaPublicacion">
                  <label>Fecha Publicación:</label>
                  <strong>{{ publicacion.fechaPublicacion | date:'short' }}</strong>
                </div>
              </div>

              <!-- Contenido completo -->
              <div *ngIf="publicacion.contenido" class="contenido-container">
                <h6>Contenido:</h6>
                <div class="contenido">{{ publicacion.contenido }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button *ngIf="mostrarEditar && publicacion?.estado === 'BORRADOR'" 
                    type="button" class="btn btn-primary" (click)="onEditar()">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button *ngIf="mostrarEliminar && publicacion?.estado === 'BORRADOR'" 
                    type="button" class="btn btn-danger" (click)="onEliminar()">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .publicacion-detalles {
      padding: 20px 0;
    }

    .imagen-container {
      margin-bottom: 20px;
      text-align: center;
    }

    .imagen-container img {
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-basica h3 {
      font-weight: 600;
      margin-bottom: 10px;
      color: #333;
    }

    .descripcion {
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 15px;
    }

    .estado-container {
      margin: 15px 0;
    }

    .estado-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-block;
    }

    .estado-pendiente {
      background-color: #fff3cd;
      color: #856404;
    }

    .estado-aprobado {
      background-color: #d4edda;
      color: #155724;
    }

    .estado-rechazado {
      background-color: #f8d7da;
      color: #721c24;
    }

    .estado-publicado {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .estado-finalizado {
      background-color: #e2e3e5;
      color: #383d41;
    }

    .detalles-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .detalle label {
      display: block;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detalle strong {
      font-size: 1.1rem;
      color: #333;
    }

    .contenido-container {
      margin-top: 20px;
    }

    .contenido-container h6 {
      color: #333;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .contenido {
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 4px solid #007bff;
      border-radius: 4px;
      line-height: 1.6;
      color: #555;
    }

    @media (max-width: 576px) {
      .detalles-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ModalDetallesPublicacionComponent implements OnInit {
  @Input() publicacion: PublicacionDetalles | null = null;
  @Input() mostrarEditar: boolean = true;
  @Input() mostrarEliminar: boolean = true;
  
  @Output() editar = new EventEmitter<number>();
  @Output() eliminar = new EventEmitter<number>();

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': '⏳ En Revisión',
      'APROBADO': '[] Aprobado',
      'RECHAZADO': '[] Rechazado',
      'PUBLICADO': '[]� En Transmisión',
      'FINALIZADO': '✓ Finalizado',
      'BORRADOR': '[]� Borrador'
    };
    return labels[estado] || estado;
  }

  onEditar(): void {
    if (this.publicacion?.id) {
      this.editar.emit(this.publicacion.id);
    }
  }

  onEliminar(): void {
    if (this.publicacion?.id && confirm('¿Deseas eliminar esta publicación?')) {
      this.eliminar.emit(this.publicacion.id);
    }
  }
}
