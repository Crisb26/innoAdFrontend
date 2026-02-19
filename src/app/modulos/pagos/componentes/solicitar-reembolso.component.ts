import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '../../../shared/componentes/navegacion-autenticada.component';
import { ServicioPagos } from '@core/servicios/pagos.servicio';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-solicitar-reembolso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavegacionAutenticadaComponent],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-reembolso">
      <div class="header-reembolso">
        <h1>Solicitar Reembolso</h1>
        <p>Completa el formulario para solicitar la devolución de tu pago</p>
      </div>
      
      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Procesando solicitud...</p>
        </div>
      } @else if (pagoDetalles()) {
        <form [formGroup]="formulario" (ngSubmit)="enviarSolicitud()" class="formulario-reembolso">
          
          <div class="seccion-detalles">
            <h2>Detalles del Pago Original</h2>
            
            <div class="campo-lectura">
              <label>Referencia:</label>
              <span>{{ pagoDetalles()!.referencia }}</span>
            </div>
            
            <div class="campo-lectura">
              <label>Plan:</label>
              <span>{{ pagoDetalles()!.planNombre }}</span>
            </div>
            
            <div class="campo-lectura">
              <label>Monto Original:</label>
              <span class="monto">\${{ pagoDetalles()!.monto }}</span>
            </div>
            
            <div class="campo-lectura">
              <label>Disponible para Reembolsar:</label>
              <span class="monto-disponible">\${{ montoDisponible() }}</span>
            </div>
          </div>
          
          <div class="seccion-reembolso">
            <h2>Detalles del Reembolso</h2>
            
            <div class="form-group">
              <label for="monto">Monto a Reembolsar *</label>
              <input 
                type="number" 
                id="monto" 
                formControlName="monto"
                placeholder="Ingresa el monto"
                min="0"
                [max]="montoDisponible()"
                step="0.01"
                class="input-text"
              >
              @if (formulario.get('monto')?.hasError('required') && formulario.get('monto')?.touched) {
                <span class="error">El monto es requerido</span>
              }
              @if (formulario.get('monto')?.hasError('min') && formulario.get('monto')?.touched) {
                <span class="error">El monto debe ser mayor a 0</span>
              }
              @if (formulario.get('monto')?.hasError('max') && formulario.get('monto')?.touched) {
                <span class="error">No hay suficientes fondos disponibles para reembolsar</span>
              }
            </div>
            
            <div class="form-group">
              <label for="motivo">Motivo del Reembolso *</label>
              <select id="motivo" formControlName="motivo" class="input-select">
                <option value="">-- Selecciona un motivo --</option>
                <option value="PAGO_DUPLICADO">Pago Duplicado</option>
                <option value="PRODUCTO_NO_CONFORME">Producto No Conforme</option>
                <option value="SERVICIO_NO_ENTREGADO">Servicio No Entregado</option>
                <option value="CAMBIO_DECISION">Cambio de Decisión</option>
                <option value="ERROR_CARGAR">Error al Cargar</option>
                <option value="OTRO">Otro</option>
              </select>
              @if (formulario.get('motivo')?.hasError('required') && formulario.get('motivo')?.touched) {
                <span class="error">Debes seleccionar un motivo</span>
              }
            </div>
            
            <div class="form-group">
              <label for="descripcion">Descripción Adicional (Opcional)</label>
              <textarea 
                id="descripcion" 
                formControlName="descripcion"
                placeholder="Proporciona detalles adicionales sobre tu solicitud..."
                rows="4"
                class="input-textarea"
              ></textarea>
              <span class="ayuda">Máximo 500 caracteres</span>
            </div>
          </div>
          
          <div class="seccion-terminos">
            <div class="checkbox">
              <input 
                type="checkbox" 
                id="terminos" 
                formControlName="terminos"
              >
              <label for="terminos">
                Declaro que la información proporcionada es correcta y aceptó los términos de reembolso *
              </label>
            </div>
            @if (formulario.get('terminos')?.hasError('required') && formulario.get('terminos')?.touched) {
              <span class="error">Debes aceptar los términos</span>
            }
          </div>
          
          <div class="acciones">
            <button type="button" routerLink="/pagos/historial" class="boton-secundario">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="boton-primario"
              [disabled]="!formulario.valid || cargando()"
            >
              @if (cargando()) {
                Enviando...
              } @else {
                Solicitar Reembolso
              }
            </button>
          </div>
        </form>
      } @else {
        <div class="sin-pago">
          <h2>Pago no encontrado</h2>
          <p>No pudimos encontrar el pago que intentas reembolsar</p>
          <a routerLink="/pagos/historial" class="boton-primario">
            Volver al Historial
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor-reembolso {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
      min-height: calc(100vh - 60px);
      background: #f5f5f5;
    }
    
    .header-reembolso {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .header-reembolso h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .header-reembolso p {
      color: #666;
      font-size: 1rem;
    }
    
    .formulario-reembolso {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .seccion-detalles,
    .seccion-reembolso,
    .seccion-terminos {
      margin-bottom: 2rem;
    }
    
    .seccion-detalles h2,
    .seccion-reembolso h2 {
      font-size: 1.3rem;
      color: #333;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .campo-lectura {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .campo-lectura label {
      font-weight: 600;
      color: #555;
    }
    
    .campo-lectura span {
      color: #333;
      font-weight: 500;
    }
    
    .monto {
      color: #27ae60;
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .monto-disponible {
      color: #f39c12;
      font-weight: bold;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }
    
    .input-text,
    .input-select,
    .input-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .input-text:focus,
    .input-select:focus,
    .input-textarea:focus {
      outline: none;
      border-color: #2196F3;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }
    
    .input-textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    .ayuda {
      display: block;
      font-size: 0.85rem;
      color: #999;
      margin-top: 0.25rem;
    }
    
    .error {
      display: block;
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
    
    .checkbox {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    
    .checkbox input[type="checkbox"] {
      margin-top: 0.25rem;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .checkbox label {
      margin: 0;
      cursor: pointer;
      font-weight: normal;
      color: #555;
      line-height: 1.4;
    }
    
    .acciones {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      margin-top: 2rem;
    }
    
    .boton-primario,
    .boton-secundario {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .boton-primario {
      background: #2196F3;
      color: white;
    }
    
    .boton-primario:hover:not(:disabled) {
      background: #1976D2;
      transform: translateY(-2px);
    }
    
    .boton-primario:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .boton-secundario {
      background: white;
      color: #2196F3;
      border: 2px solid #2196F3;
    }
    
    .boton-secundario:hover {
      background: #f0f8ff;
    }
    
    .sin-pago {
      text-align: center;
      padding: 3rem 1rem;
    }
    
    .sin-pago h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .sin-pago p {
      color: #666;
      margin-bottom: 1.5rem;
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
  `]
})
export class SolicitarReembolsoComponent {
  private fb = inject(FormBuilder);
  private servicioPagos = inject(ServicioPagos);
  private route = inject(ActivatedRoute);
  
  pagoId = signal<number | null>(null);
  pagoDetalles = signal<any>(null);
  cargando = signal(false);
  montoDisponible = signal(0);
  
  formulario = this.fb.group({
    monto: ['', [Validators.required, Validators.min(0.01)]],
    motivo: ['', Validators.required],
    descripcion: ['', Validators.maxLength(500)],
    terminos: [false, Validators.required]
  });
  
  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['pagoId']) {
        this.pagoId.set(parseInt(params['pagoId']));
        this.cargarDetallesPago();
      }
    });
  }
  
  cargarDetallesPago() {
    if (!this.pagoId()) return;
    
    this.cargando.set(true);
    this.servicioPagos.obtenerPago(this.pagoId()!).subscribe({
      next: (pago: any) => {
        this.pagoDetalles.set(pago.datos);
        this.montoDisponible.set(parseFloat(pago.datos.monto));
        this.cargando.set(false);
      },
      error: () => {
        NotifyX.error('Error al cargar el pago');
        this.cargando.set(false);
      }
    });
  }
  
  enviarSolicitud() {
    if (!this.formulario.valid || !this.pagoId()) return;
    
    this.cargando.set(true);
    
    const solicitud = {
      pagoId: this.pagoId(),
      monto: this.formulario.get('monto')?.value,
      motivo: this.formulario.get('motivo')?.value,
      descripcion: this.formulario.get('descripcion')?.value
    };
    
    this.servicioPagos.solicitarReembolso(solicitud).subscribe({
      next: () => {
        NotifyX.success('Reembolso solicitado correctamente. Será revisado pronto.');
        this.cargando.set(false);
        // Redirigir después de 2 segundos
        setTimeout(() => {
          // this.router.navigate(['/pagos/historial']);
        }, 2000);
      },
      error: (error) => {
        NotifyX.error(error?.error?.mensaje || 'Error al solicitar reembolso');
        this.cargando.set(false);
      }
    });
  }
}
