import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicacionServicio } from '../../../core/servicios/publicacion.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

interface PublicacionCard {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO' | 'FINALIZADO';
  ubicaciones: number;
  costoTotal: number;
  fechaCreacion: string;
  progreso: number; // 0-100
}

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuario-dashboard.component.html',
  styleUrls: ['./usuario-dashboard.component.scss']
})
export class UsuarioDashboardComponent implements OnInit, OnDestroy {
  publicidades: any[] = [];
  saldoPendiente: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private publicacionServicio: PublicacionServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que es usuario
    if (!this.permisosServicio.esUsuario()) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    this.cargarPublicidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPublicidades(): void {
    // Cargar publicaciones reales del backend
    this.publicacionServicio.obtenerMisPublicaciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (publicidades) => {
          this.publicidades = publicidades.map(p => ({
            id: p.id,
            titulo: p.titulo,
            descripcion: p.descripcion,
            estado: p.estado,
            ubicaciones: p.ubicaciones.length,
            costoTotal: p.costo || 0,
            fechaCreacion: p.fechaCreacion.toString(),
            progreso: this.calcularProgreso(p.estado)
          }));
          this.calcularSaldo();
        },
        error: (error) => {
          console.error('Error al cargar publicidades:', error);
          // Fallback a datos de simulación
          this.cargarPublicidadesSimuladas();
        }
      });
  }

  private calcularProgreso(estado: string): number {
    const progresoPorEstado: Record<string, number> = {
      'PENDIENTE': 20,
      'APROBADO': 50,
      'PUBLICADO': 100,
      'RECHAZADO': 0,
      'FINALIZADO': 100
    };
    return progresoPorEstado[estado] || 0;
  }

  private cargarPublicidadesSimuladas(): void {
    // Datos de simulación para cuando no hay conexión
    this.publicidades = [
      {
        id: 1,
        titulo: 'Gran Promoción de Verano',
        descripcion: 'Descuentos hasta 50% en todos los productos',
        estado: 'PUBLICADO',
        ubicaciones: 5,
        costoTotal: 2500,
        fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        progreso: 100
      },
      {
        id: 2,
        titulo: 'Nuevo Catálogo de Productos',
        descripcion: 'Mira nuestra nueva colección de primavera',
        estado: 'APROBADO',
        ubicaciones: 3,
        costoTotal: 1500,
        fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        progreso: 50
      },
      {
        id: 3,
        titulo: 'Evento Especial Este Fin de Semana',
        descripcion: 'No te pierdas nuestro evento con ofertas exclusivas',
        estado: 'PENDIENTE',
        ubicaciones: 2,
        costoTotal: 800,
        fechaCreacion: new Date().toISOString(),
        progreso: 20
      }
    ];

    this.calcularSaldo();
  }

  calcularSaldo(): void {
    this.saldoPendiente = this.publicidades
      .filter(p => p.estado === 'APROBADO' || p.estado === 'PUBLICADO')
      .reduce((total, p) => total + p.costoTotal, 0);
  }

  contar(estado: string): number {
    return this.publicidades.filter(p => p.estado === estado as any).length;
  }

  calcularCostoTotal(): number {
    return this.publicidades.reduce((total, p) => total + p.costoTotal, 0);
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: '⏳ En Revisión',
      APROBADO: '✅ Aprobado',
      RECHAZADO: '❌ Rechazado',
      PUBLICADO: '📡 En Transmisión',
      FINALIZADO: '✓ Finalizado'
    };
    return labels[estado] || estado;
  }

  irACrearPublicidad(): void {
    // Navegar a la pantalla de crear publicación
    this.router.navigate(['/publicacion/seleccionar-ubicaciones']);
  }

  irAMisPublicidades(): void {
    // Recargar publicidades y navegar
    this.cargarPublicidades();
    this.router.navigate(['/usuario/mis-publicidades']);
  }

  irAEstadisticas(): void {
    this.router.navigate(['/usuario/estadisticas']);
  }

  irAFacturacion(): void {
    this.router.navigate(['/usuario/facturacion']);
  }

  verDetalles(publicidadId: number): void {
    // Obtener detalles del backend y navegar
    this.publicacionServicio.obtenerPublicacion(publicidadId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/usuario/publicidades', publicidadId]);
        },
        error: (error) => {
          console.error('Error al obtener publicación:', error);
          alert('No se pudo cargar la publicación');
        }
      });
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}
