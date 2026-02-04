import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { ServicioPagos } from '@core/servicios/pagos.servicio';

@Component({
  selector: 'app-historial-pagos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-historial">
      <div class="header-historial">
        <h1>Historial de Pagos</h1>
        <p>Visualiza y administra todos tus pagos</p>
      </div>
      
      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Cargando historial...</p>
        </div>
      } @else if (pagos().length === 0) {
        <div class="sin-pagos">
          <h2>Sin pagos aún</h2>
          <p>No tienes pagos registrados</p>
          <a routerLink="/pagos" class="boton-primario">
            Ver Planes
          </a>
        </div>
      } @else {
        <table class="tabla-pagos">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (pago of pagos(); track pago.id) {
              <tr [class.aprobado]="pago.estado === 'APROBADO'">
                <td>{{ pago.referencia }}</td>
                <td>{{ pago.planNombre }}</td>
                <td>{{ pago.monto }}</td>
                <td>
                  <span [class]="'badge-' + pago.estado.toLowerCase()">
                    {{ pago.estado }}
                  </span>
                </td>
                <td>{{ pago.fechaCreacion | date:'short' }}</td>
                <td>
                  <a [routerLink]="'/pagos/confirmacion/' + pago.id" class="enlace-detalle">
                    Ver Detalle
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
        
        <!-- Paginación -->
        <div class="paginacion">
          <button 
            [disabled]="paginaActual() === 0"
            (click)="irPaginaAnterior()"
            class="boton-paginacion"
          >
            ← Anterior
          </button>
          <span class="info-pagina">
            Página {{ paginaActual() + 1 }}
          </span>
          <button 
            (click)="irPaginaSiguiente()"
            class="boton-paginacion"
          >
            Siguiente →
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor-historial {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px;
    }
    
    .header-historial {
      text-align: center;
      margin-bottom: 40px;
      
      h1 {
        font-size: 2.2em;
        color: #fff;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      p {
        color: #94a3b8;
        font-size: 1.05em;
      }
    }
    
    .loader {
      text-align: center;
      padding: 60px 20px;
      
      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #334155;
        border-top-color: #00d4ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .sin-pagos {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 2px dashed #334155;
      border-radius: 12px;
      padding: 60px 20px;
      text-align: center;
      
      h2 {
        color: #fff;
        margin-bottom: 10px;
      }
      
      p {
        color: #94a3b8;
        margin-bottom: 20px;
      }
    }
    
    .tabla-pagos {
      width: 100%;
      border-collapse: collapse;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 30px;
      
      thead {
        background: rgba(0, 212, 255, 0.1);
        border-bottom: 2px solid #334155;
        
        th {
          padding: 16px;
          color: #94a3b8;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85em;
          letter-spacing: 0.5px;
        }
      }
      
      tbody {
        tr {
          border-bottom: 1px solid #334155;
          transition: background 0.3s;
          
          &:hover {
            background: rgba(0, 212, 255, 0.05);
          }
          
          &.aprobado {
            background: rgba(16, 185, 129, 0.05);
          }
          
          td {
            padding: 14px 16px;
            color: #cbd5e1;
            
            .badge-aprobado,
            .badge-pendiente,
            .badge-rechazado {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 0.85em;
              font-weight: 600;
            }
            
            .badge-aprobado {
              background: rgba(16, 185, 129, 0.2);
              color: #10b981;
            }
            
            .badge-pendiente {
              background: rgba(245, 158, 11, 0.2);
              color: #f59e0b;
            }
            
            .badge-rechazado {
              background: rgba(239, 68, 68, 0.2);
              color: #ef4444;
            }
            
            .enlace-detalle {
              color: #00d4ff;
              text-decoration: none;
              font-weight: 600;
              transition: all 0.3s;
              
              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
    
    .paginacion {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      padding: 20px;
      
      .boton-paginacion {
        padding: 10px 20px;
        background: linear-gradient(135deg, #00d4ff, #0099cc);
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
      
      .info-pagina {
        color: #94a3b8;
        font-weight: 600;
      }
    }
  `]
})
export class HistorialPagosComponent implements OnInit {
  private readonly servicioPagos = inject(ServicioPagos);
  
  pagos = signal<any[]>([]);
  cargando = signal(true);
  paginaActual = signal(0);
  
  ngOnInit() {
    this.cargarPagos();
  }
  
  cargarPagos() {
    this.cargando.set(true);
    this.servicioPagos.listarPagos(this.paginaActual(), 10).subscribe({
      next: (respuesta: any) => {
        if (respuesta.exitoso && respuesta.datos?.content) {
          this.pagos.set(respuesta.datos.content);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.pagos.set([]);
      }
    });
  }
  
  irPaginaSiguiente() {
    this.paginaActual.update(p => p + 1);
    this.cargarPagos();
  }
  
  irPaginaAnterior() {
    this.paginaActual.update(p => p - 1);
    this.cargarPagos();
  }
}
