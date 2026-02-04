import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { ServicioPagos } from '@core/servicios/pagos.servicio';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-confirmacion-pago',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-confirmacion">
      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Verificando tu pago...</p>
        </div>
      } @else if (pago()) {
        @if (pago()!.estado === 'APROBADO') {
          <div class="confirmacion-exitosa">
            <div class="icono-exito">✓</div>
            <h1>¡Pago Exitoso!</h1>
            <p>Tu suscripción se ha activado correctamente</p>
            
            <div class="detalles-pago">
              <div class="detalle">
                <span class="label">Referencia:</span>
                <span class="valor">{{ pago()!.referencia }}</span>
              </div>
              <div class="detalle">
                <span class="label">Monto:</span>
                <span class="valor">{{ pago()!.monto }}</span>
              </div>
              <div class="detalle">
                <span class="label">Plan:</span>
                <span class="valor">{{ pago()!.planNombre }}</span>
              </div>
              <div class="detalle">
                <span class="label">Fecha:</span>
                <span class="valor">{{ pago()!.fechaPago | date:'short' }}</span>
              </div>
            </div>
            
            <div class="acciones">
              <a routerLink="/dashboard" class="boton-primario">
                Ir al Dashboard
              </a>
              <a routerLink="/pagos/historial" class="boton-secundario">
                Ver Historial
              </a>
            </div>
          </div>
        } @else {
          <div class="confirmacion-fallida">
            <div class="icono-error">✕</div>
            <h1>Pago Pendiente</h1>
            <p>Tu pago aún se está procesando. Por favor, espera o intenta más tarde.</p>
            
            <div class="detalles-pago">
              <div class="detalle">
                <span class="label">Estado:</span>
                <span class="valor estado">{{ pago()!.estado }}</span>
              </div>
              <div class="detalle">
                <span class="label">Referencia:</span>
                <span class="valor">{{ pago()!.referencia }}</span>
              </div>
            </div>
            
            <div class="acciones">
              <a routerLink="/pagos" class="boton-primario">
                Volver a Planes
              </a>
            </div>
          </div>
        }
      } @else {
        <div class="error-contenedor">
          <h1>Error al cargar el pago</h1>
          <p>No pudimos encontrar tu información de pago</p>
          <a routerLink="/pagos" class="boton-primario">
            Volver a Planes
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor-confirmacion {
      max-width: 600px;
      margin: 60px auto;
      padding: 0 20px;
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
      
      p {
        color: #94a3b8;
        font-size: 1.1em;
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .confirmacion-exitosa,
    .confirmacion-fallida,
    .error-contenedor {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 2px solid #334155;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      
      .icono-exito,
      .icono-error {
        font-size: 4em;
        margin-bottom: 20px;
      }
      
      .icono-exito {
        color: #10b981;
      }
      
      .icono-error {
        color: #ef4444;
      }
      
      h1 {
        color: #fff;
        font-size: 2em;
        margin-bottom: 10px;
      }
      
      > p {
        color: #94a3b8;
        margin-bottom: 30px;
        font-size: 1.05em;
      }
    }
    
    .detalles-pago {
      background: rgba(0, 212, 255, 0.05);
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
      
      .detalle {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #334155;
        
        &:last-child {
          border-bottom: none;
        }
        
        .label {
          color: #94a3b8;
          font-weight: 600;
        }
        
        .valor {
          color: #cbd5e1;
          font-weight: 500;
          
          &.estado {
            color: #00d4ff;
            font-weight: 600;
          }
        }
      }
    }
    
    .acciones {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      
      .boton-primario,
      .boton-secundario {
        flex: 1;
        padding: 14px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s;
        text-align: center;
        display: inline-block;
      }
      
      .boton-primario {
        background: linear-gradient(135deg, #00d4ff, #0099cc);
        color: #fff;
        border: none;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
        }
      }
      
      .boton-secundario {
        background: transparent;
        color: #00d4ff;
        border: 2px solid #00d4ff;
        
        &:hover {
          background: rgba(0, 212, 255, 0.1);
        }
      }
    }
  `]
})
export class ConfirmacionPagoComponent implements OnInit {
  private readonly servicioPagos = inject(ServicioPagos);
  private readonly route = inject(ActivatedRoute);
  
  pago = signal<any>(null);
  cargando = signal(true);
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarPago(parseInt(id));
      }
    });
  }
  
  cargarPago(id: number) {
    this.cargando.set(true);
    this.servicioPagos.obtenerPago(id).subscribe({
      next: (respuesta: any) => {
        if (respuesta.exitoso && respuesta.datos) {
          this.pago.set(respuesta.datos);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        NotifyX.error('Error al cargar la información del pago', {
          duration: 3000,
          dismissible: true
        });
      }
    });
  }
}
