import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioMantenimientoAvanzado } from '@core/servicios/mantenimiento-avanzado.servicio';
import { EventoMantenimiento } from '@modulos/mantenimiento/modelos/mantenimiento.modelo';

@Component({
  selector: 'app-historial-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="historial-container">
      <h1>[]œ Historial de Mantenimiento</h1>

      @if (cargando()) {
        <div class="loader">Cargando historial...</div>
      } @else if (eventos().length === 0) {
        <div class="sin-eventos">No hay eventos registrados</div>
      } @else {
        <div class="timeline">
          @for (evento of eventos(); track evento.id) {
            <div class="evento-item" [class]="evento.impacto.toLowerCase()">
              <div class="timeline-marker"></div>
              <div class="evento-contenido">
                <div class="evento-header">
                  <span class="tipo-evento">{{ evento.tipo }}</span>
                  <span class="fecha">{{ evento.fecha | date: 'medium' }}</span>
                </div>
                <p class="descripcion">{{ evento.descripcion }}</p>
                <div class="evento-meta">
                  <span class="usuario">[]¤ {{ evento.usuario }}</span>
                  @if (evento.dispositivo) {
                    <span class="dispositivo">[]± {{ evento.dispositivo }}</span>
                  }
                  <span class="impacto" [class]="evento.impacto.toLowerCase()">
                    {{ evento.impacto }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .historial-container {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 2rem;
    }

    .loader, .sin-eventos {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      color: #999;
    }

    .timeline {
      position: relative;
      padding: 2rem 0;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ddd;
    }

    .evento-item {
      position: relative;
      margin-bottom: 2rem;
      padding-left: 60px;
    }

    .timeline-marker {
      position: absolute;
      left: 8px;
      top: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      border: 3px solid #667eea;
      z-index: 1;
    }

    .evento-item.alto .timeline-marker {
      border-color: #ff6b6b;
      background: #ffebee;
    }

    .evento-item.medio .timeline-marker {
      border-color: #ffa500;
      background: #fff3e0;
    }

    .evento-item.bajo .timeline-marker {
      border-color: #28a745;
      background: #e8f5e9;
    }

    .evento-contenido {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .evento-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .tipo-evento {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #e8eaf6;
      color: #667eea;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .fecha {
      font-size: 0.85rem;
      color: #999;
    }

    .descripcion {
      margin: 0.5rem 0 0 0;
      color: #333;
    }

    .evento-meta {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: #666;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .impacto {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      background: #e0e0e0;
      font-weight: 600;
    }

    .impacto.alto {
      background: #ffebee;
      color: #c62828;
    }

    .impacto.medio {
      background: #fff3e0;
      color: #e65100;
    }

    .impacto.bajo {
      background: #e8f5e9;
      color: #2e7d32;
    }

    @media (max-width: 768px) {
      .historial-container {
        padding: 1rem;
      }

      .timeline::before {
        left: 12px;
      }

      .timeline-marker {
        left: 2px;
      }

      .evento-item {
        padding-left: 40px;
      }

      .evento-meta {
        flex-direction: column;
      }
    }
  `]
})
export class HistorialMantenimientoComponent implements OnInit {
  private readonly servicioMantenimiento = inject(ServicioMantenimientoAvanzado);

  public readonly cargando = signal(false);
  public readonly eventos = signal<EventoMantenimiento[]>([]);

  ngOnInit(): void {
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    this.cargando.set(true);
    this.servicioMantenimiento.obtenerHistorial({ pagina: 1, tamaÃ±o: 50 }).subscribe({
      next: (respuesta) => {
        if (respuesta.exito && respuesta.datos) {
          this.eventos.set(respuesta.datos);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }
}

import { signal } from '@angular/core';
