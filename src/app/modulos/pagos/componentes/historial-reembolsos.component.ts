import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { ServicioPagos } from '@core/servicios/pagos.servicio';

@Component({
  selector: 'app-historial-reembolsos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-historial">
      <div class="header-historial">
        <h1>Historial de Reembolsos</h1>
        <p>Visualiza el estado de tus solicitudes de reembolso</p>
      </div>
      
      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Cargando historial...</p>
        </div>
      } @else if (reembolsos().length === 0) {
        <div class="sin-reembolsos">
          <h2>Sin reembolsos</h2>
          <p>No tienes solicitudes de reembolso registradas</p>
          <a routerLink="/pagos" class="boton-primario">
            Ver Planes
          </a>
        </div>
      } @else {
        <div class="tabla-responsiva">
          <table class="tabla-reembolsos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pago Original</th>
                <th>Monto</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (reembolso of reembolsos(); track reembolso.id) {
                <tr [class]="getClaseEstado(reembolso.estado)">
                  <td>
                    <span class="id-reembolso">#{{ reembolso.id }}</span>
                  </td>
                  <td>{{ reembolso.pagoId }}</td>
                  <td class="monto">
                    \${{ reembolso.montoReembolso | number: '1.2-2' }}
                  </td>
                  <td>
                    <span class="motivo-badge">{{ formatearMotivo(reembolso.motivo) }}</span>
                  </td>
                  <td>
                    <span [class]="'badge-' + reembolso.estado.toLowerCase()">
                      {{ formatearEstado(reembolso.estado) }}
                    </span>
                  </td>
                  <td>{{ reembolso.fechaSolicitud | date:'short' }}</td>
                  <td class="acciones">
                    <a [routerLink]="'/pagos/reembolsos/' + reembolso.id" class="enlace-detalle">
                      Ver Detalle
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      min-height: calc(100vh - 60px);
      background: #f5f5f5;
    }
    
    .header-historial {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .header-historial h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .header-historial p {
      color: #666;
      font-size: 1rem;
    }
    
    .tabla-responsiva {
      overflow-x: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    
    .tabla-reembolsos {
      width: 100%;
      border-collapse: collapse;
    }
    
    .tabla-reembolsos thead {
      background: #f8f9fa;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .tabla-reembolsos th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }
    
    .tabla-reembolsos td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      color: #555;
    }
    
    .tabla-reembolsos tr:hover {
      background: #f9f9f9;
    }
    
    .id-reembolso {
      font-weight: 600;
      color: #2196F3;
    }
    
    .monto {
      font-weight: 600;
      color: #27ae60;
      font-size: 1.05rem;
    }
    
    .motivo-badge {
      background: #e3f2fd;
      color: #1976D2;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .badge-pendiente {
      background: #fff3cd;
      color: #856404;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .badge-procesando {
      background: #cfe8fc;
      color: #084298;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .badge-aprobado {
      background: #d1e7dd;
      color: #0f5132;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .badge-completado {
      background: #d1e7dd;
      color: #0f5132;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .badge-rechazado {
      background: #f8d7da;
      color: #842029;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .acciones {
      text-align: center;
    }
    
    .enlace-detalle {
      color: #2196F3;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }
    
    .enlace-detalle:hover {
      color: #1976D2;
      text-decoration: underline;
    }
    
    .sin-reembolsos {
      text-align: center;
      padding: 3rem 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .sin-reembolsos h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .sin-reembolsos p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    
    .boton-primario {
      display: inline-block;
      background: #2196F3;
      color: white;
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .boton-primario:hover {
      background: #1976D2;
    }
    
    .paginacion {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 0;
    }
    
    .boton-paginacion {
      background: white;
      color: #2196F3;
      border: 2px solid #2196F3;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .boton-paginacion:hover:not(:disabled) {
      background: #2196F3;
      color: white;
    }
    
    .boton-paginacion:disabled {
      border-color: #ccc;
      color: #ccc;
      cursor: not-allowed;
    }
    
    .info-pagina {
      color: #666;
      font-weight: 600;
    }
    
    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      gap: 1rem;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f0f0f0;
      border-top: 4px solid #2196F3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .pendiente {
      background: #fffbea;
    }
    
    .aprobado {
      background: #f0f9ff;
    }
    
    .rechazado {
      background: #fef2f2;
    }
  `]
})
export class HistorialReembolsosComponent implements OnInit {
  private servicioPagos = inject(ServicioPagos);
  
  reembolsos = signal<any[]>([]);
  cargando = signal(false);
  paginaActual = signal(0);
  tamanioPagina = 10;
  
  ngOnInit() {
    this.cargarReembolsos();
  }
  
  cargarReembolsos() {
    this.cargando.set(true);
    this.servicioPagos.listarReembolsos(this.paginaActual(), this.tamanioPagina).subscribe({
      next: (respuesta: any) => {
        this.reembolsos.set(respuesta.datos?.content || []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }
  
  irPaginaAnterior() {
    if (this.paginaActual() > 0) {
      this.paginaActual.set(this.paginaActual() - 1);
      this.cargarReembolsos();
    }
  }
  
  irPaginaSiguiente() {
    this.paginaActual.set(this.paginaActual() + 1);
    this.cargarReembolsos();
  }
  
  formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'PROCESANDO': 'Procesando',
      'APROBADO': 'Aprobado',
      'COMPLETADO': 'Completado',
      'RECHAZADO': 'Rechazado',
      'CANCELADO': 'Cancelado'
    };
    return estados[estado] || estado;
  }
  
  formatearMotivo(motivo: string): string {
    const motivos: { [key: string]: string } = {
      'PAGO_DUPLICADO': 'Pago Duplicado',
      'PRODUCTO_NO_CONFORME': 'Producto No Conforme',
      'SERVICIO_NO_ENTREGADO': 'Servicio No Entregado',
      'CAMBIO_DECISION': 'Cambio de Decisión',
      'ERROR_CARGAR': 'Error al Cargar',
      'OTRO': 'Otro'
    };
    return motivos[motivo] || motivo;
  }
  
  getClaseEstado(estado: string): string {
    const estadoLower = estado.toLowerCase();
    return estadoLower === 'pendiente' || estadoLower === 'procesando' ? 'pendiente' :
           estadoLower === 'aprobado' || estadoLower === 'completado' ? 'aprobado' :
           'rechazado';
  }
}
