import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { FormularioPantallaComponent } from './formulario-pantalla.component';
import { DetallePantallaComponent } from './detalle-pantalla.component';
import { PantallasService, RespuestaPantalla } from '../../../core/servicios/pantallas.service';
import { AyudaService } from '../../../core/servicios/ayuda.servicio';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-lista-pantallas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavegacionAutenticadaComponent, FormularioPantallaComponent, DetallePantallaComponent],
  styleUrls: ['./lista-pantallas.component.scss'],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-pantallas">
      <div class="header-pantallas">
        <div>
          <h1>Gestión de Pantallas</h1>
          <p>Administra y monitorea todas tus pantallas digitales</p>
        </div>
        <button class="boton-primario" (click)="abrirFormulario(null)">
          Nueva Pantalla
        </button>
      </div>

      <div class="seccion-filtros">
        <input 
          type="text" 
          placeholder="Buscar pantalla..."
          [(ngModel)]="busqueda"
          class="entrada-busqueda"
        >
        <div class="filtros">
          <button 
            [class.activo]="estadoFiltro === 'todos'"
            (click)="estadoFiltro = 'todos'"
          >
            Todas
          </button>
          <button 
            [class.activo]="estadoFiltro === 'ACTIVA'"
            (click)="estadoFiltro = 'ACTIVA'"
          >
            Activas
          </button>
          <button 
            [class.activo]="estadoFiltro === 'INACTIVA'"
            (click)="estadoFiltro = 'INACTIVA'"
          >
            Inactivas
          </button>
        </div>
      </div>

      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Cargando pantallas...</p>
        </div>
      } @else if (pantallasFiltradasUnicaBusqueda().length === 0) {
        <div class="sin-datos">
          <h2>No hay pantallas</h2>
          <p>Registra tu primera pantalla digital</p>
          <button class="boton-secundario" (click)="abrirFormulario(null)">
            Crear Pantalla
          </button>
        </div>
      } @else {
        <div class="tabla-pantallas">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Resolución</th>
                <th>Orientación</th>
                <th>Estado</th>
                <th>Contenidos</th>
                <th>Última Conexión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (pantalla of pantallasFiltradasUnicaBusqueda(); track pantalla.id) {
                <tr>
                  <td><strong>{{ pantalla.nombre }}</strong></td>
                  <td>{{ pantalla.ubicacion }}</td>
                  <td>{{ pantalla.resolucion }}</td>
                  <td>
                    <span class="orientacion-badge" [ngClass]="pantalla.orientacion.toLowerCase()">
                      @if (pantalla.orientacion === 'HORIZONTAL') {
                        ↔ Horizontal
                      } @else {
                        ↕ Vertical
                      }
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="pantalla.estado.toLowerCase()">
                      {{ pantalla.estado | uppercase }}
                    </span>
                  </td>
                  <td><span class="contador">{{ pantalla.cantidadContenidos }}</span></td>
                  <td>{{ pantalla.ultimaConexion | date:'short' }}</td>
                  <td class="acciones">
                    <button class="btn-ver" (click)="verDetalle(pantalla)">Ver</button>
                    <button class="btn-editar" (click)="abrirFormulario(pantalla)">Editar</button>
                    <button class="btn-eliminar" (click)="eliminar(pantalla.id)">Eliminar</button>
                    
                    <div class="control-remoto">
                      <button class="btn-control encender" (click)="encenderPantalla(pantalla.id)" title="Encender Pantalla">
                        🔌 Encender
                      </button>
                      <button class="btn-control apagar" (click)="apagarPantalla(pantalla.id)" title="Apagar Pantalla">
                        ⚫ Apagar
                      </button>
                      <button class="btn-control reiniciar" (click)="reiniciarPantalla(pantalla.id)" title="Reiniciar Pantalla">
                        🔄 Reiniciar
                      </button>
                      <button class="btn-control estado" (click)="verEstadoPantalla(pantalla.id)" title="Ver Estado">
                        📊 Estado
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (mostrarFormulario()) {
      <app-formulario-pantalla 
        [pantalla]="pantallaEnEdicion()"
        (guardarExitoso)="cerrarFormulario()"
      ></app-formulario-pantalla>
    }
    @if (mostrarDetalle()) {
      <app-detalle-pantalla [alCerrar]="cerrarDetalle.bind(this)"></app-detalle-pantalla>
    }
    
    @if (mostrarConfirmacionEliminar()) {
      <div class="modal-overlay" (click)="cancelarEliminar()">
        <div class="modal-confirmacion" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
            <button class="btn-cerrar" (click)="cancelarEliminar()">×</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar esta pantalla?</p>
            <p class="advertencia">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="boton-secundario" (click)="cancelarEliminar()">Cancelar</button>
            <button class="boton-peligro" (click)="confirmarEliminar()">Eliminar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ListaPantallasComponent implements OnInit {
  private readonly ayuda = inject(AyudaService);
  cargando = signal(false);
  mostrarFormulario = signal(false);
  mostrarDetalle = signal(false);
  mostrarConfirmacionEliminar = signal(false);
  pantallaIdAEliminar: number | null = null;
  busqueda = '';
  estadoFiltro = 'todos';
  pantallaEnEdicion = signal<RespuestaPantalla | null>(null);
  
  pantallas = signal<RespuestaPantalla[]>([]);

  constructor(private pantallasService: PantallasService) {
    // Suscribirse a cambios de pantallas
    this.pantallasService.pantallas$.subscribe(
      pantallas => this.pantallas.set(pantallas)
    );
  }

  ngOnInit() {
    this.cargando.set(true);
    this.pantallasService.cargarPantallas();
    setTimeout(() => this.cargando.set(false), 1000);
    // Mostrar ayuda introductoria del módulo Pantallas (una sola vez)
    setTimeout(() => {
      this.ayuda.startTourOnce('pantallas', [
        { element: '.header-pantallas .boton-primario', intro: 'Crea una nueva pantalla para transmitir contenidos.', position: 'left' },
        { element: '.entrada-busqueda', intro: 'Busca pantallas por nombre o ubicación.' , position: 'bottom'},
        { element: '.tabla-pantallas', intro: 'En la tabla puedes ver estado, contenidos y acciones disponibles.' , position: 'top'}
      ], { showProgress: true, exitOnOverlayClick: true });
    }, 600);
  }

  pantallasFiltradasUnicaBusqueda(): RespuestaPantalla[] {
    return this.pantallas().filter(p => 
      (this.estadoFiltro === 'todos' || p.estado === this.estadoFiltro) &&
      (p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
       p.ubicacion.toLowerCase().includes(this.busqueda.toLowerCase()))
    );
  }

  abrirFormulario(pantalla: RespuestaPantalla | null) {
    this.pantallaEnEdicion.set(pantalla);
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.pantallaEnEdicion.set(null);
  }

  verDetalle(pantalla: RespuestaPantalla) {
    this.pantallasService.establecerPantallaSeleccionada(pantalla);
    this.mostrarDetalle.set(true);
  }

  cerrarDetalle() {
    this.mostrarDetalle.set(false);
    this.pantallasService.establecerPantallaSeleccionada(null);
  }

  eliminar(id: number) {
    this.pantallaIdAEliminar = id;
    this.mostrarConfirmacionEliminar.set(true);
  }

  confirmarEliminar() {
    if (this.pantallaIdAEliminar !== null) {
      const idAEliminar = this.pantallaIdAEliminar;
      // Cerrar modal inmediatamente
      this.mostrarConfirmacionEliminar.set(false);
      this.pantallaIdAEliminar = null;
      
      // Ejecutar eliminación
      this.pantallasService.eliminarYActualizar(idAEliminar);
      
      // Mostrar notificación (el servicio manejará el error internamente)
      setTimeout(() => {
        NotifyX.success('✅ Pantalla eliminada exitosamente', {
          position: 'top-right',
          duration: 3000
        });
      }, 300);
    }
  }

  cancelarEliminar() {
    this.mostrarConfirmacionEliminar.set(false);
    this.pantallaIdAEliminar = null;
  }

  encenderPantalla(id: number) {
    console.log('🔌 Encender pantalla:', id);
    NotifyX.warning('⚙️ Función: Encender Pantalla - En desarrollo', {
      position: 'top-right',
      duration: 3000
    });
  }

  apagarPantalla(id: number) {
    console.log('⚫ Apagar pantalla:', id);
    NotifyX.warning('⚙️ Función: Apagar Pantalla - En desarrollo', {
      position: 'top-right',
      duration: 3000
    });
  }

  reiniciarPantalla(id: number) {
    console.log('🔄 Reiniciar pantalla:', id);
    NotifyX.warning('⚙️ Función: Reiniciar Pantalla - En desarrollo', {
      position: 'top-right',
      duration: 3000
    });
  }

  verEstadoPantalla(id: number) {
    console.log('📊 Ver estado pantalla:', id);
    NotifyX.info('📊 Mostrando estado de pantalla...', {
      position: 'top-right',
      duration: 3000
    });
  }
}
