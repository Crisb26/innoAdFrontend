import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioMantenimiento, EstadoMantenimiento } from './servicios/mantenimiento.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.scss']
})
export class MantenimientoComponent implements OnInit, OnDestroy {
  estadoMantenimiento: EstadoMantenimiento | null = null;
  password: string = '';
  autorizado: boolean = false;
  cargando: boolean = true;
  intentosFallidos: number = 0;
  bloqueado: boolean = false;
  mensaje: string = '';

  private destroy$ = new Subject<void>();
  private desbloqueoTimeout: any;

  constructor(
    private servicioMantenimiento: ServicioMantenimiento,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarEstado();
  }

  ngOnDestroy(): void {
    if (this.desbloqueoTimeout) {
      clearTimeout(this.desbloqueoTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  verificarEstado(): void {
    this.servicioMantenimiento
      .obtenerEstado()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          if (!respuesta.activo) {
            this.router.navigate(['/dashboard']);
          } else {
            this.estadoMantenimiento = respuesta;
            this.cargando = false;
          }
        },
        error: (error) => {
          console.error('Error al verificar estado de mantenimiento:', error);
          this.cargando = false;
        }
      });
  }

  verificarContrasena(): void {
    if (this.bloqueado) return;

    this.servicioMantenimiento
      .verificarContrasena(this.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.autorizado) {
            this.autorizado = true;
            this.mensaje = 'Acceso concedido. Redirigiendo...';
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          } else {
            this.intentosFallidos++;
            this.password = '';
            if (this.intentosFallidos >= 3) {
              this.bloquearIntento();
            } else {
              this.mensaje = `Contrasena incorrecta. Intentos restantes: ${3 - this.intentosFallidos}`;
            }
          }
        },
        error: (error) => {
          console.error('Error al verificar contrasena:', error);
          this.mensaje = 'Error al procesar solicitud. Intenta más tarde.';
        }
      });
  }

  private bloquearIntento(): void {
    this.bloqueado = true;
    this.mensaje = 'Demasiados intentos fallidos. Bloqueado por 5 minutos.';
    this.desbloqueoTimeout = setTimeout(() => {
      this.bloqueado = false;
      this.intentosFallidos = 0;
      this.mensaje = '';
      this.password = '';
    }, 300000); // 5 minutos
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }

  get porcentajeProgreso(): number {
    if (!this.estadoMantenimiento?.data) return 0;
    
    const inicio = new Date(this.estadoMantenimiento.data.fechaInicio).getTime();
    const fin = new Date(this.estadoMantenimiento.data.fechaFin).getTime();
    const ahora = Date.now();
    
    const duracion = fin - inicio;
    const transcurrido = ahora - inicio;
    
    return Math.min(100, Math.max(0, (transcurrido / duracion) * 100));
  }

  get tiempoRestante(): string {
    if (!this.estadoMantenimiento?.data) return '';
    
    const fin = new Date(this.estadoMantenimiento.data.fechaFin).getTime();
    const ahora = Date.now();
    const diferencia = fin - ahora;
    
    if (diferencia <= 0) return 'Completado';
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  }
}
