import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '@core/servicios/admin.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-modo-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mantenimiento-container">
      <div class="mantenimiento-card">
        <h1>Modo Mantenimiento</h1>
        
        <div class="status-section">
          <div [class.active]="modoActivo" class="status-badge">
            {{ modoActivo ? 'ACTIVO' : 'INACTIVO' }}
          </div>
        </div>

        <div class="toggle-section">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              [(ngModel)]="modoActivo"
              (change)="guardarEstado()"
              [disabled]="cargando"
              class="toggle-input"
            />
            <span class="toggle-text">
              {{ modoActivo ? 'Desactivar mantenimiento' : 'Activar mantenimiento' }}
            </span>
          </label>
        </div>

        <div class="info-section">
          <p><strong>Última actualización:</strong> {{ ultimaActualizacion | date:'medium' }}</p>
          <p class="info-text">
            Cuando está activo, todos los usuarios (excepto administradores) 
            verán una página de mantenimiento y no podrán acceder a la aplicación.
          </p>
        </div>

        <div class="button-group">
          <button 
            (click)="guardarEstado()"
            [disabled]="cargando"
            class="btn btn-primary"
          >
            {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <button 
            (click)="recargarEstado()"
            [disabled]="cargando"
            class="btn btn-secondary"
          >
            Recargar
          </button>
        </div>

        <div>
          <a routerLink="/admin" class="btn btn-volver">
            Volver al Panel
          </a>
        </div>

        <div *ngIf="mensaje" [class.error]="tipoMensaje === 'error'" [class.success]="tipoMensaje === 'success'" class="mensaje">
          {{ mensaje }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mantenimiento-container {
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mantenimiento-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 3rem;
      max-width: 500px;
      width: 100%;
    }

    h1 {
      margin: 0 0 2rem 0;
      color: #333;
      text-align: center;
      font-size: 1.8rem;
    }

    .status-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: bold;
      font-size: 1rem;
      background-color: #e0e0e0;
      color: #333;
      transition: all 0.3s ease;
    }

    .status-badge.active {
      background-color: #ff4444;
      color: white;
    }

    .toggle-section {
      margin-bottom: 2rem;
      text-align: center;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
    }

    .toggle-input {
      width: 20px;
      height: 20px;
      margin-right: 0.75rem;
      cursor: pointer;
    }

    .toggle-input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .toggle-text {
      font-size: 1.1rem;
      color: #333;
      font-weight: 500;
    }

    .info-section {
      background-color: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .info-section p {
      margin: 0.5rem 0;
      color: #666;
      font-size: 0.95rem;
    }

    .info-text {
      font-style: italic;
      margin-top: 1rem !important;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background-color: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #d0d0d0;
    }

    .btn-volver {
      display: block;
      width: 100%;
      padding: 0.75rem 1.5rem;
      background-color: #00d4ff;
      color: #0f172a;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.3s ease;
    }

    .btn-volver:hover {
      background-color: #00b8d4;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .mensaje {
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    .mensaje.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .mensaje.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 600px) {
      .mantenimiento-card {
        padding: 2rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .button-group {
        flex-direction: column;
      }
    }
  `]
})
export class ModoMantenimientoComponent implements OnInit, OnDestroy {
  modoActivo = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';
  ultimaActualizacion = new Date();
  
  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.recargarEstado();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  recargarEstado() {
    this.cargando = true;
    this.adminService.obtenerEstadoMantenimiento()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estado) => {
          this.modoActivo = estado.activo;
          this.ultimaActualizacion = new Date(estado.ultimaActualizacion);
          this.cargando = false;
          this.mostrarMensaje('Estado cargado correctamente', 'success', 2000);
        },
        error: (err) => {
          console.error('Error al cargar estado:', err);
          this.cargando = false;
          this.mostrarMensaje('Error al cargar el estado', 'error', 3000);
        }
      });
  }

  guardarEstado() {
    this.cargando = true;
    const nuevoEstado = {
      activo: this.modoActivo,
      ultimaActualizacion: new Date()
    };

    this.adminService.actualizarEstadoMantenimiento(nuevoEstado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          this.ultimaActualizacion = new Date(respuesta.ultimaActualizacion);
          this.cargando = false;
          const mensaje = this.modoActivo 
            ? 'Modo mantenimiento ACTIVADO' 
            : 'Modo mantenimiento DESACTIVADO';
          this.mostrarMensaje(mensaje, 'success', 3000);
        },
        error: (err) => {
          console.error('Error al guardar estado:', err);
          this.cargando = false;
          this.mostrarMensaje('Error al guardar los cambios', 'error', 3000);
        }
      });
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'error', duracion: number) {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
    }, duracion);
  }
}
