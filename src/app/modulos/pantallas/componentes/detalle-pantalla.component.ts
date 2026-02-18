import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-pantalla',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-contenido detalle-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Detalles de la Pantalla</h2>
          <button class="btn-cerrar" (click)="cerrar()">×</button>
        </div>
        <div class="modal-body detalle-body">
          <div class="info-section">
            <h3>Información General</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nombre</span>
                <span class="valor">Pantalla Entrada</span>
              </div>
              <div class="info-item">
                <span class="label">Ubicación</span>
                <span class="valor">Recepción</span>
              </div>
              <div class="info-item">
                <span class="label">Resolución</span>
                <span class="valor">1920x1080</span>
              </div>
              <div class="info-item">
                <span class="label">Orientación</span>
                <span class="valor orientacion-horizontal">[]� Horizontal</span>
              </div>
              <div class="info-item">
                <span class="label">Tipo de Pantalla</span>
                <span class="valor">LED</span>
              </div>
              <div class="info-item">
                <span class="label">Estado</span>
                <span class="valor estado activa">Activa</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h3>Contenidos Asignados</h3>
            <div class="contenidos-list">
              <div class="contenido-item">
                <span>Video Promocional 1</span>
                <span class="duracion">3:45</span>
              </div>
              <div class="contenido-item">
                <span>Banner Especial</span>
                <span class="duracion">5:00</span>
              </div>
              <div class="contenido-item">
                <span>Mensaje Bienvenida</span>
                <span class="duracion">1:30</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Última Actividad</h3>
            <div class="actividad">
              <p>Última conexión: Hace 2 minutos</p>
              <p>Reproducción activa: Video Promocional 1</p>
              <p>Rendimiento: 98% CPU, 64% RAM</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="boton-secundario" (click)="cerrar()">Cerrar</button>
            <button class="boton-primario">Editar Pantalla</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./detalle-pantalla.component.scss']
})
export class DetallePantallaComponent {
  @Input() alCerrar?: () => void;

  cerrar() {
    if (this.alCerrar) {
      this.alCerrar();
    }
  }
}
