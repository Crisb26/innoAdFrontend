import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicioMantenimientoAvanzado } from '@core/servicios/mantenimiento-avanzado.servicio';
import { Alerta, EstadoAlerta } from '@modulos/mantenimiento/modelos/mantenimiento.modelo';

@Component({
  selector: 'app-alertas-sistema',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="alertas-container">
      <h1>🔔 Centro de Alertas</h1>

      <div class="filtros">
        <button 
          (click)="filtroEstado = null"
          [class.activo]="filtroEstado === null"
          class="btn-filtro">
          Todas
        </button>
        <button 
          (click)="filtroEstado = 'ACTIVA'"
          [class.activo]="filtroEstado === 'ACTIVA'"
          class="btn-filtro">
          Activas
        </button>
        <button 
          (click)="filtroEstado = 'RESUELTA'"
          [class.activo]="filtroEstado === 'RESUELTA'"
          class="btn-filtro">
          Resueltas
        </button>
      </div>

      @if (cargando()) {
        <div class="loader">Cargando alertas...</div>
      } @else if (alertasFiltradas().length === 0) {
        <div class="sin-alertas">✓ No hay alertas</div>
      } @else {
        <div class="lista-alertas">
          @for (alerta of alertasFiltradas(); track alerta.id) {
            <div class="alerta-item" [class]="alerta.tipo.toLowerCase()">
              <div class="alerta-header">
                <span class="tipo-badge">{{ alerta.tipo }}</span>
                <span class="titulo">{{ alerta.titulo }}</span>
                <span class="fecha">{{ alerta.fechaCreacion | date: 'short' }}</span>
              </div>
              <p class="descripcion">{{ alerta.descripcion }}</p>
              <div class="alerta-footer">
                <span class="origen">🔗 {{ alerta.origen }}</span>
                <span class="estado" [class]="alerta.estado.toLowerCase()">{{ alerta.estado }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .alertas-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 2rem;
    }

    .filtros {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn-filtro {
      padding: 0.75rem 1.5rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-filtro.activo {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }

    .loader, .sin-alertas {
      text-align: center;
      padding: 2rem;
      color: #999;
      background: white;
      border-radius: 12px;
    }

    .lista-alertas {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alerta-item {
      padding: 1.5rem;
      border-left: 4px solid #ccc;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .alerta-item.critica { border-left-color: #ff6b6b; background: #ffe0e0; }
    .alerta-item.advertencia { border-left-color: #ffa500; background: #fff0e0; }
    .alerta-item.info { border-left-color: #667eea; background: #e8eaf6; }
    .alerta-item.exito { border-left-color: #28a745; background: #e8f5e9; }

    .alerta-header {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .tipo-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      background: white;
    }

    .alerta-item.critica .tipo-badge { background: #ff6b6b; color: white; }
    .alerta-item.advertencia .tipo-badge { background: #ffa500; color: white; }
    .alerta-item.info .tipo-badge { background: #667eea; color: white; }
    .alerta-item.exito .tipo-badge { background: #28a745; color: white; }

    .titulo {
      font-weight: 600;
      flex: 1;
    }

    .fecha {
      font-size: 0.85rem;
      color: #666;
    }

    .descripcion {
      margin: 0.5rem 0;
      color: #333;
    }

    .alerta-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .origen {
      color: #666;
    }

    .estado {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 500;
      background: white;
    }

    .estado.activa { background: #ffebee; color: #c62828; }
    .estado.resuelta { background: #e8f5e9; color: #2e7d32; }
    .estado.ignorada { background: #f3e5f5; color: #6a1b9a; }
    .estado.escalada { background: #fff3e0; color: #e65100; }
  `]
})
export class AlertasSistemaComponent implements OnInit {
  private readonly servicioMantenimiento = inject(ServicioMantenimientoAvanzado);

  public readonly cargando = this.servicioMantenimiento.cargando;
  public readonly alertas = this.servicioMantenimiento.alertas;

  public filtroEstado: string | null = null;

  get alertasFiltradas(): Alerta[] {
    if (!this.filtroEstado) {
      return this.alertas();
    }
    return this.alertas().filter(a => a.estado === this.filtroEstado);
  }

  ngOnInit(): void {
    this.servicioMantenimiento.obtenerAlertas().subscribe();
  }
}
