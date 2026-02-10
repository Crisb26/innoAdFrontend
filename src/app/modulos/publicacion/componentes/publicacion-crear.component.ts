import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicacionServicio } from '../../../core/servicios/publicacion.servicio';
import { UbicacionServicio, SeleccionUbicacion } from '../../../core/servicios/ubicacion.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';
import { AyudaService } from '../../../core/servicios/ayuda.servicio';

@Component({
  selector: 'app-publicacion-crear',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-crear.component.html',
  styleUrls: ['./publicacion-crear.component.scss']
})
export class PublicacionCrearComponent implements OnInit, OnDestroy {
  formulario = {
    titulo: '',
    descripcion: '',
    duracionDias: 30,
    tipoContenido: ''
  };

  previewArchivo: string | null = null;
  ubicacionesSeleccionadas: SeleccionUbicacion[] = [];
  costoTotal = 0;
  costoPromedioPorDia = 0;
  isDragging = false;

  private destroy$ = new Subject<void>();

  constructor(
    private publicacionServicio: PublicacionServicio,
    private ubicacionServicio: UbicacionServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  private readonly ayuda = inject(AyudaService);

  ngOnInit(): void {
    // Verificar que es usuario
    if (!this.permisosServicio.esUsuario()) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    // Recuperar ubicaciones del estado de navegación si existen
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state;
      this.ubicacionesSeleccionadas = state.ubicacionesSeleccionadas || [];
      this.formulario.duracionDias = state.duracionDias || 30;
      this.costoTotal = state.costoEstimado || 0;
    }

    // Tour introductorio del flujo de creación de publicaciones
    setTimeout(() => {
      this.ayuda.startTourOnce('publicacion_crear', [
        { element: '.publicacion-crear-container .header h1', intro: 'Crea una nueva publicidad paso a paso.', position: 'bottom' },
        { element: '.formulario-principal .paso-seccion:nth-of-type(1)', intro: 'Completa la información básica: título, descripción y tipo de contenido.', position: 'right' },
        { element: '.upload-area', intro: 'Aquí subes el archivo (imagen o video) para tu publicidad.', position: 'right' },
        { element: '.panel-lateral .acciones .btn-enviar-aprobacion', intro: 'Envía para aprobación cuando todo esté listo.', position: 'left' }
      ], { showProgress: true, exitOnOverlayClick: true });
    }, 600);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  procesarArchivo(file: File): void {
    // Validaciones
    const esVideo = this.formulario.tipoContenido === 'VIDEO';
    const maxSize = esVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024; // 100MB para video, 20MB para imagen

    if (file.size > maxSize) {
      alert(`Archivo muy grande. Máximo: ${esVideo ? '100 MB' : '20 MB'}`);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewArchivo = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  actualizarCosto(): void {
    this.costoTotal = this.ubicacionServicio.calcularCostoTotal(
      this.formulario.duracionDias
    );
    this.costoPromedioPorDia = this.ubicacionesSeleccionadas.reduce(
      (total, ub) => total + ub.costoPorDia,
      0
    );
  }

  calcularTotalPisos(): number {
    return this.ubicacionesSeleccionadas.reduce(
      (total, ub) => total + ub.pisos.length,
      0
    );
  }

  irASeleccionarUbicaciones(): void {
    this.router.navigate(['/publicacion/seleccionar-ubicaciones'], {
      state: {
        ubicacionesPreseleccionadas: this.ubicacionesSeleccionadas,
        duracionDias: this.formulario.duracionDias
      }
    });
  }

  puedeEnviar(): boolean {
    return (
      this.formulario.titulo.length > 0 &&
      this.formulario.descripcion.length > 0 &&
      this.formulario.tipoContenido !== '' &&
      this.previewArchivo !== null &&
      this.ubicacionesSeleccionadas.length > 0
    );
  }

  guardarBorrador(): void {
    if (!this.formulario.titulo || !this.formulario.descripcion) {
      alert('Por favor completa al menos el título y la descripción');
      return;
    }

    // Crear objeto de borrador
    const borrador = {
      titulo: this.formulario.titulo,
      descripcion: this.formulario.descripcion,
      tipoContenido: this.formulario.tipoContenido || null,
      duracionDias: this.formulario.duracionDias,
      ubicaciones: this.ubicacionesSeleccionadas,
      costoTotal: this.costoTotal,
      estado: 'BORRADOR'
    };

    // Enviar al servicio
    this.publicacionServicio.guardarBorrador(borrador)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          alert('✓ Borrador guardado exitosamente');
          this.router.navigate(['/usuario/dashboard']);
        },
        error: (error) => {
          console.error('Error al guardar borrador:', error);
          alert('Error al guardar el borrador: ' + error.message);
        }
      });
  }

  enviarParaAprobacion(): void {
    if (!this.puedeEnviar()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Crear objeto de publicación
    const publicacion = {
      titulo: this.formulario.titulo,
      descripcion: this.formulario.descripcion,
      tipoContenido: this.formulario.tipoContenido,
      duracionDias: this.formulario.duracionDias,
      ubicaciones: this.ubicacionesSeleccionadas,
      costoTotal: this.costoTotal,
      estado: 'PENDIENTE'
    };

    // Enviar al servicio
    this.publicacionServicio.enviarParaAprobacion(publicacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          alert('✓ Publicidad enviada para revisión. Te notificaremos pronto.');
          this.router.navigate(['/usuario/dashboard']);
        },
        error: (error) => {
          alert('Error al enviar la publicidad: ' + error.message);
        }
      });
  }

  volver(): void {
    if (confirm('¿Descartar cambios?')) {
      this.router.navigate(['/usuario/dashboard']);
    }
  }
}
