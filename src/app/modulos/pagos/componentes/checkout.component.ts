import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { ServicioPagos } from '@core/servicios/pagos.servicio';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavegacionAutenticadaComponent],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-checkout">
      <div class="header-checkout">
        <h1>Planes y Pagos</h1>
        <p>Selecciona un plan para potenciar tu negocio</p>
      </div>
      
      <div class="planes-grid">
        <!-- Plan Básico -->
        <div class="tarjeta-plan" [class.seleccionado]="planSeleccionado() === 'basico'">
          <div class="plan-header">
            <h2>Plan Básico</h2>
            <div class="precio">
              <span class="currency">$</span>
              <span class="cantidad">9.99</span>
              <span class="periodo">/mes</span>
            </div>
          </div>
          
          <ul class="caracteristicas">
            <li>✓ Hasta 3 pantallas</li>
            <li>✓ 5 campañas activas</li>
            <li>✓ 1GB almacenamiento</li>
            <li>✓ Reportes básicos</li>
            <li>✗ API integrada</li>
            <li>✗ Soporte prioritario</li>
          </ul>
          
          <button class="boton-plan" (click)="seleccionarPlan('basico', 9.99)">
            @if (planSeleccionado() === 'basico') {
              Seleccionado
            } @else {
              Seleccionar
            }
          </button>
        </div>
        
        <!-- Plan Profesional -->
        <div class="tarjeta-plan destacado" [class.seleccionado]="planSeleccionado() === 'profesional'">
          <div class="badge-popular">RECOMENDADO</div>
          <div class="plan-header">
            <h2>Plan Profesional</h2>
            <div class="precio">
              <span class="currency">$</span>
              <span class="cantidad">29.99</span>
              <span class="periodo">/mes</span>
            </div>
          </div>
          
          <ul class="caracteristicas">
            <li>✓ Hasta 10 pantallas</li>
            <li>✓ 25 campañas activas</li>
            <li>✓ 50GB almacenamiento</li>
            <li>✓ Reportes avanzados</li>
            <li>✓ API integrada</li>
            <li>✓ Soporte por email</li>
          </ul>
          
          <button class="boton-plan primario" (click)="seleccionarPlan('profesional', 29.99)">
            @if (planSeleccionado() === 'profesional') {
              Seleccionado
            } @else {
              Seleccionar
            }
          </button>
        </div>
        
        <!-- Plan Empresarial -->
        <div class="tarjeta-plan" [class.seleccionado]="planSeleccionado() === 'empresarial'">
          <div class="plan-header">
            <h2>Plan Empresarial</h2>
            <div class="precio">
              <span class="currency">$</span>
              <span class="cantidad">99.99</span>
              <span class="periodo">/mes</span>
            </div>
          </div>
          
          <ul class="caracteristicas">
            <li>✓ Pantallas ilimitadas</li>
            <li>✓ Campañas ilimitadas</li>
            <li>✓ Almacenamiento ilimitado</li>
            <li>✓ Reportes personalizados</li>
            <li>✓ API avanzada</li>
            <li>✓ Soporte prioritario 24/7</li>
          </ul>
          
          <button class="boton-plan" (click)="seleccionarPlan('empresarial', 99.99)">
            @if (planSeleccionado() === 'empresarial') {
              Seleccionado
            } @else {
              Seleccionar
            }
          </button>
        </div>
      </div>
      
      <!-- Formulario de Checkout -->
      @if (planSeleccionado()) {
        <div class="formulario-checkout">
          <div class="resumen-plan">
            <h3>Resumen de tu compra</h3>
            <div class="detalle-plan">
              <span class="label">Plan:</span>
              <span class="valor">{{ planNombres[planSeleccionado()!] }}</span>
            </div>
            <div class="detalle-plan">
              <span class="label">Monto:</span>
              <span class="valor">{{ montoPlan() }}</span>
            </div>
            <div class="detalle-plan">
              <span class="label">Período:</span>
              <span class="valor">1 mes</span>
            </div>
          </div>
          
          <form [formGroup]="formularioCheckout" (ngSubmit)="procesarPago()" class="form-datos">
            <div class="campo-form">
              <label>Email</label>
              <input 
                type="email"
                formControlName="email"
                placeholder="tu-email@ejemplo.com"
                class="input-form"
              >
            </div>
            
            <div class="campo-form">
              <label>Nombre Completo</label>
              <input 
                type="text"
                formControlName="nombre"
                placeholder="Juan Pérez"
                class="input-form"
              >
            </div>
            
            <button 
              type="submit"
              class="boton-procesar"
              [disabled]="procesando() || !formularioCheckout.valid"
            >
              @if (procesando()) {
                Procesando...
              } @else {
                Ir a Mercado Pago
              }
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor-checkout {
      max-width: 1400px;
      margin: 40px auto;
      padding: 0 20px;
    }
    
    .header-checkout {
      text-align: center;
      margin-bottom: 50px;
      
      h1 {
        font-size: 2.5em;
        color: #fff;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #00d4ff, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      p {
        color: #94a3b8;
        font-size: 1.1em;
      }
    }
    
    .planes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }
    
    .tarjeta-plan {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 2px solid #334155;
      border-radius: 12px;
      padding: 30px;
      position: relative;
      transition: all 0.3s;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
        border-color: #00d4ff;
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
      }
      
      &.seleccionado {
        border-color: #00d4ff;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
      }
      
      &.destacado {
        transform: scale(1.05);
        border-color: #8b5cf6;
      }
      
      .badge-popular {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #8b5cf6, #00d4ff);
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 600;
      }
      
      .plan-header {
        margin-bottom: 30px;
        
        h2 {
          color: #fff;
          font-size: 1.5em;
          margin-bottom: 10px;
        }
        
        .precio {
          display: flex;
          align-items: baseline;
          gap: 5px;
          
          .currency {
            font-size: 0.8em;
            color: #94a3b8;
          }
          
          .cantidad {
            font-size: 2.5em;
            color: #00d4ff;
            font-weight: 700;
          }
          
          .periodo {
            color: #64748b;
            font-size: 0.9em;
          }
        }
      }
      
      .caracteristicas {
        list-style: none;
        padding: 0;
        margin: 0 0 30px 0;
        
        li {
          color: #cbd5e1;
          padding: 10px 0;
          border-bottom: 1px solid #334155;
          font-size: 0.95em;
          
          &:last-child {
            border-bottom: none;
          }
        }
      }
      
      .boton-plan {
        width: 100%;
        padding: 12px;
        border: 2px solid #334155;
        background: transparent;
        color: #00d4ff;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        
        &:hover {
          border-color: #00d4ff;
          background: rgba(0, 212, 255, 0.1);
        }
        
        &.primario {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          color: #fff;
          border-color: transparent;
        }
      }
    }
    
    .formulario-checkout {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 40px;
      max-width: 600px;
      margin: 0 auto;
      
      .resumen-plan {
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 1px solid #334155;
        
        h3 {
          color: #fff;
          margin-bottom: 20px;
          font-size: 1.2em;
        }
        
        .detalle-plan {
          display: flex;
          justify-content: space-between;
          color: #cbd5e1;
          padding: 10px 0;
          
          .label {
            color: #94a3b8;
          }
          
          .valor {
            font-weight: 600;
            color: #00d4ff;
          }
        }
      }
      
      .form-datos {
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        .campo-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          label {
            color: #94a3b8;
            font-weight: 600;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .input-form {
            padding: 12px;
            background: #0f172a;
            border: 2px solid #334155;
            border-radius: 8px;
            color: #fff;
            font-size: 1em;
            
            &:focus {
              outline: none;
              border-color: #00d4ff;
              box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
            }
          }
        }
        
        .boton-procesar {
          padding: 14px;
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1em;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  `]
})
export class CheckoutComponent {
  private readonly servicioPagos = inject(ServicioPagos);
  private readonly fb = inject(FormBuilder);
  
  planSeleccionado = signal<string | null>(null);
  montoPlan = signal(0);
  procesando = signal(false);
  
  planNombres: { [key: string]: string } = {
    'basico': 'Plan Básico - $9.99/mes',
    'profesional': 'Plan Profesional - $29.99/mes',
    'empresarial': 'Plan Empresarial - $99.99/mes'
  };
  
  formularioCheckout = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.minLength(3)]]
  });
  
  seleccionarPlan(plan: string, monto: number) {
    this.planSeleccionado.set(plan);
    this.montoPlan.set(monto);
  }
  
  procesarPago() {
    if (!this.formularioCheckout.valid || !this.planSeleccionado()) return;
    
    this.procesando.set(true);
    
    const datos = {
      monto: this.montoPlan(),
      descripcion: this.planNombres[this.planSeleccionado()!],
      email: this.formularioCheckout.get('email')?.value || '',
      nombre: this.formularioCheckout.get('nombre')?.value || '',
      tipoPago: 'PLAN_MENSUAL'
    };
    
    this.servicioPagos.crearPago(datos).subscribe({
      next: (respuesta: any) => {
        this.procesando.set(false);
        if (respuesta.exitoso && respuesta.datos?.preferenceId) {
          NotifyX.success('Redirigiendo a Mercado Pago...', {
            duration: 2000,
            dismissible: true
          });
          // Redirigir a Mercado Pago
          setTimeout(() => {
            this.servicioPagos.redirigirAMercadoPago(respuesta.datos.preferenceId);
          }, 500);
        } else {
          NotifyX.error('Error al crear el pago', { duration: 3000, dismissible: true });
        }
      },
      error: (error: any) => {
        this.procesando.set(false);
        NotifyX.error('Error procesando el pago', { duration: 3000, dismissible: true });
        console.error('Error:', error);
      }
    });
  }
}
