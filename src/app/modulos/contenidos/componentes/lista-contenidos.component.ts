import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { ServicioContenidos } from '@core/servicios/contenidos.servicio';
import { Contenido, FiltroContenidos, RespuestaPaginada } from '@core/modelos';

@Component({
  selector: 'app-lista-contenidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavegacionAutenticadaComponent],
  styleUrls: ['./lista-contenidos.component.scss'],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-contenidos">
      <div class="header-contenidos">
        <div class="seccion-titulo">
          <h1>Biblioteca de Contenidos</h1>
          <p>Gestiona todos tus contenidos: imágenes, videos y más</p>
        </div>
        <button class="boton-primario" (click)="abrirNuevoContenido()">
          <span class="icono">+</span>
          Nuevo Contenido
        </button>
      </div>

      <div class="seccion-filtros">
        <div class="buscador">
          <input 
            type="text" 
            placeholder="Buscar contenido..." 
            [(ngModel)]="filtro.busqueda"
            (input)="aplicarFiltros()"
            class="entrada-busqueda"
          >
        </div>

        <div class="filtros-tipo">
          <button 
            class="filtro-boton" 
            [class.activo]="filtroTipo === 'todos'"
            (click)="filtroTipo = 'todos'; aplicarFiltros()"
          >
            Todos
          </button>
          <button 
            class="filtro-boton" 
            [class.activo]="filtroTipo === 'imagen'"
            (click)="filtroTipo = 'imagen'; aplicarFiltros()"
          >
            Imágenes
          </button>
          <button 
            class="filtro-boton" 
            [class.activo]="filtroTipo === 'video'"
            (click)="filtroTipo = 'video'; aplicarFiltros()"
          >
            Videos
          </button>
          <button 
            class="filtro-boton" 
            [class.activo]="filtroTipo === 'texto'"
            (click)="filtroTipo = 'texto'; aplicarFiltros()"
          >
            Texto
          </button>
          <button 
            class="filtro-boton" 
            [class.activo]="filtroTipo === 'html'"
            (click)="filtroTipo = 'html'; aplicarFiltros()"
          >
            HTML
          </button>
        </div>
      </div>

      @if (cargando()) {
        <div class="loader-contenedor">
          <div class="spinner"></div>
          <p>Cargando contenidos...</p>
        </div>
      } @else if (contenidos().length === 0) {
        <div class="sin-contenidos">
          <div class="icono-vacio"></div>
          <h2>No hay contenidos</h2>
          <p>Comienza creando tu primer contenido</p>
          <button class="boton-secundario" (click)="abrirNuevoContenido()">
            <span class="icono">+</span>
            Crear Contenido
          </button>
        </div>
      } @else {
        <div class="grid-contenidos">
          @for (contenido of contenidos(); track contenido.id) {
            <div class="tarjeta-contenido" (click)="abrirEdicion(contenido)">
              <div class="preview-contenido">
                @if (contenido.tipo === 'imagen') {
                  <img [src]="contenido.url" [alt]="contenido.nombre" class="imagen-preview">
                }
                @if (contenido.tipo === 'video') {
                  <div class="video-preview">
                    <div class="icono-video">play</div>
                  </div>
                }
                @if (contenido.tipo === 'texto' || contenido.tipo === 'html') {
                  <div class="texto-preview">
                    <span class="icono-tipo">{{ contenido.tipo === 'html' ? 'code' : 'note' }}</span>
                  </div>
                }
                
                <div class="badges-contenido">
                  <span class="badge-tipo">{{ contenido.tipo | uppercase }}</span>
                  @if (contenido.estado === 'activo') {
                    <span class="badge-estado activo">Activo</span>
                  } @else {
                    <span class="badge-estado inactivo">Inactivo</span>
                  }
                </div>
              </div>

              <div class="info-contenido">
                <h3>{{ contenido.nombre }}</h3>
                <p class="descripcion">{{ contenido.descripcion | slice:0:60 }}...</p>
                
                <div class="meta-contenido">
                  <span class="meta">Duración: {{ contenido.duracion | number:'2.0-0' }}s</span>
                  <span class="meta">{{ contenido.fechaCreacion | date:'short' }}</span>
                </div>

                <div class="acciones-contenido">
                  <button 
                    class="boton-accion editar" 
                    (click)="abrirEdicion(contenido); $event.stopPropagation()"
                    title="Editar contenido"
                  >
                    Edit
                  </button>
                  <button 
                    class="boton-accion eliminar" 
                    (click)="confirmarEliminar(contenido); $event.stopPropagation()"
                    title="Eliminar contenido"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="paginacion">
          <button 
            class="boton-paginacion" 
            [disabled]="!tienePaginaAnterior()"
            (click)="irPaginaAnterior()"
          >
            Anterior
          </button>
          <span class="info-pagina">
            Página {{ filtro.pagina }} de {{ totalPaginas() }}
          </span>
          <button 
            class="boton-paginacion" 
            [disabled]="!tienePaginaSiguiente()"
            (click)="irPaginaSiguiente()"
          >
            Siguiente
          </button>
        </div>
      }

      @if (mostrarModalNuevo()) {
        <div class="modal-overlay" (click)="cerrarNuevoContenido()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Nuevo Contenido</h2>
              <button class="cerrar-modal" (click)="cerrarNuevoContenido()">x</button>
            </div>
            <app-formulario-contenido 
              [esNuevo]="true"
              (guardar)="guardarNuevoContenido($event)"
              (cerrar)="cerrarNuevoContenido()"
            ></app-formulario-contenido>
          </div>
        </div>
      }

      @if (mostrarModalEdicion()) {
        <div class="modal-overlay" (click)="cerrarEdicion()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Editar Contenido</h2>
              <button class="cerrar-modal" (click)="cerrarEdicion()">x</button>
            </div>
            <app-formulario-contenido 
              [esNuevo]="false"
              [contenido]="contenidoEnEdicion()"
              (guardar)="guardarEdicion($event)"
              (cerrar)="cerrarEdicion()"
            ></app-formulario-contenido>
          </div>
        </div>
      }

      @if (mostrarConfirmacion()) {
        <div class="modal-overlay" (click)="cancelarEliminar()">
          <div class="modal-confirmacion" (click)="$event.stopPropagation()">
            <div class="icono-warning">!</div>
            <h2>Eliminar Contenido</h2>
            <p>¿Estás seguro de que deseas eliminar "{{ contenidoAEliminar()?.nombre }}"?</p>
            <p class="texto-advertencia">Esta acción no se puede deshacer.</p>
            <div class="acciones-confirmacion">
              <button class="boton-cancelar" (click)="cancelarEliminar()">Cancelar</button>
              <button class="boton-eliminar" (click)="eliminarContenido()">Eliminar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ListaContenidosComponent implements OnInit {
  private readonly servicioContenidos = inject(ServicioContenidos);

  contenidos = signal<Contenido[]>([]);
  cargando = signal(false);
  filtro = { pagina: 1, tamaño: 12, busqueda: '' };
  filtroTipo: string = 'todos';
  totalPaginas = signal(1);
  totalElementos = signal(0);

  mostrarModalNuevo = signal(false);
  mostrarModalEdicion = signal(false);
  mostrarConfirmacion = signal(false);
  contenidoEnEdicion = signal<Contenido | null>(null);
  contenidoAEliminar = signal<Contenido | null>(null);

  ngOnInit() {
    this.cargarContenidos();
  }

  cargarContenidos() {
    this.cargando.set(true);
    const filtro: FiltroContenidos = {
      pagina: this.filtro.pagina,
      tamaño: this.filtro.tamaño,
      busqueda: this.filtro.busqueda,
      tipo: this.filtroTipo === 'todos' ? undefined : this.filtroTipo,
      categoria: undefined
    };

    this.servicioContenidos.obtenerTodos(filtro).subscribe({
      next: (respuesta: RespuestaPaginada<Contenido>) => {
        this.contenidos.set(respuesta.contenido || []);
        this.totalPaginas.set(respuesta.totalPaginas || 1);
        this.totalElementos.set(respuesta.totalElementos || 0);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando contenidos', error);
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros() {
    this.filtro.pagina = 1;
    this.cargarContenidos();
  }

  tienePaginaAnterior(): boolean {
    return this.filtro.pagina > 1;
  }

  tienePaginaSiguiente(): boolean {
    return this.filtro.pagina < this.totalPaginas();
  }

  irPaginaAnterior() {
    if (this.tienePaginaAnterior()) {
      this.filtro.pagina--;
      this.cargarContenidos();
    }
  }

  irPaginaSiguiente() {
    if (this.tienePaginaSiguiente()) {
      this.filtro.pagina++;
      this.cargarContenidos();
    }
  }

  abrirNuevoContenido() {
    this.mostrarModalNuevo.set(true);
  }

  cerrarNuevoContenido() {
    this.mostrarModalNuevo.set(false);
  }

  guardarNuevoContenido(contenido: Contenido) {
    this.cargarContenidos();
    this.cerrarNuevoContenido();
  }

  abrirEdicion(contenido: Contenido) {
    this.contenidoEnEdicion.set(contenido);
    this.mostrarModalEdicion.set(true);
  }

  cerrarEdicion() {
    this.contenidoEnEdicion.set(null);
    this.mostrarModalEdicion.set(false);
  }

  guardarEdicion(contenido: Contenido) {
    this.cargarContenidos();
    this.cerrarEdicion();
  }

  confirmarEliminar(contenido: Contenido) {
    this.contenidoAEliminar.set(contenido);
    this.mostrarConfirmacion.set(true);
  }

  cancelarEliminar() {
    this.contenidoAEliminar.set(null);
    this.mostrarConfirmacion.set(false);
  }

  eliminarContenido() {
    const contenido = this.contenidoAEliminar();
    if (contenido) {
      this.servicioContenidos.eliminar(contenido.id).subscribe({
        next: () => {
          this.cargarContenidos();
          this.cancelarEliminar();
        },
        error: (error) => console.error('Error eliminando contenido', error)
      });
    }
  }
}
