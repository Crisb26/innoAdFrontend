import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioMantenimientoAvanzado } from '@core/servicios/mantenimiento-avanzado.servicio';
import { ConfiguracionMantenimiento, TipoAlerta } from '@modulos/mantenimiento/modelos/mantenimiento.modelo';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-configuracion-mantenimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="configuracion-container">
      <h1>⚙️ Configuración de Mantenimiento</h1>
      
      <div class="tarjeta-config">
        <h2>Parámetros del Demonio</h2>
        
        @if (configuracion()) {
          <form (ngSubmit)="guardarConfiguracion()">
            <div class="form-group">
              <label>Intervalo de Verificación (segundos)</label>
              <input 
                type="number" 
                [(ngModel)]="configuracion()!.intervaloVerificacion"
                name="intervalo"
                min="10"
                max="3600">
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="configuracion()!.notificacionesActivas"
                  name="notificaciones">
                Activar Notificaciones
              </label>
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="configuracion()!.registroAuditoriaActivo"
                  name="auditoria">
                Activar Registro de Auditoría
              </label>
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="configuracion()!.limpiezaAutomatica"
                  name="limpieza">
                Activar Limpieza Automática
              </label>
            </div>

            @if (configuracion()!.limpiezaAutomatica) {
              <div class="form-group">
                <label>Frecuencia de Limpieza</label>
                <select [(ngModel)]="configuracion()!.frecuenciaLimpieza" name="frecuencia">
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              <div class="form-group">
                <label>Hora de Limpieza (HH:mm)</label>
                <input 
                  type="time" 
                  [(ngModel)]="configuracion()!.horarioLimpieza"
                  name="horario">
              </div>
            }

            <div class="form-group">
              <label>Tamaño Máximo de Registros (MB)</label>
              <input 
                type="number" 
                [(ngModel)]="configuracion()!.tamanoMaximoRegistros"
                name="tamaño"
                min="100">
            </div>

            <button type="submit" class="btn-guardar">💾 Guardar Cambios</button>
          </form>
        }
      </div>

      <div class="tarjeta-config">
        <h2>Filtrado de Alertas</h2>
        
        @if (configuracion()) {
          <form (ngSubmit)="guardarConfiguracion()">
            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="configuracion()!.alertasCriticas"
                  name="criticas">
                Mostrar Alertas Críticas
              </label>
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="configuracion()!.alertasAdvertencia"
                  name="advertencias">
                Mostrar Advertencias
              </label>
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="configuracion()!.alertasInfo"
                  name="info">
                Mostrar Información
              </label>
            </div>

            <button type="submit" class="btn-guardar">💾 Guardar Cambios</button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .configuracion-container {
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

    .tarjeta-config {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    input[type="number"],
    input[type="time"],
    select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    .btn-guardar {
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-guardar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 768px) {
      .configuracion-container {
        padding: 1rem;
      }

      .tarjeta-config {
        padding: 1.5rem;
      }
    }
  `]
})
export class ConfiguracionMantenimientoComponent implements OnInit {
  private readonly servicioMantenimiento = inject(ServicioMantenimientoAvanzado);

  public readonly configuracion = this.servicioMantenimiento.configuracion;

  ngOnInit(): void {
    this.servicioMantenimiento.cargarConfiguracionMantenimiento().subscribe();
  }

  public guardarConfiguracion(): void {
    NotifyX.success('Configuración actualizada', {
      duration: 3000,
      dismissible: true
    });
  }
}
