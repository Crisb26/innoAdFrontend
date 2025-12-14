import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';
import { FormularioCampanaComponent } from './formulario-campana.component';

@Component({
  selector: 'app-lista-campanas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavegacionAutenticadaComponent, FormularioCampanaComponent],
  styleUrls: ['./lista-campanas.component.scss'],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-campanas">
      <div class="header-campanas">
        <div>
          <h1>Gestión de Campañas</h1>
          <p>Crea y administra tus campañas publicitarias digitales</p>
        </div>
        <button class="boton-primario" (click)="mostrarFormulario.set(true)">
          Nueva Campaña
        </button>
      </div>

      <div class="seccion-filtros">
        <input 
          type="text" 
          placeholder="Buscar campaña..."
          [(ngModel)]="busqueda"
          (input)="aplicarFiltros()"
          class="entrada-busqueda"
        >
        <div class="filtros">
          <button 
            [class.activo]="estadoFiltro === 'todas'"
            (click)="estadoFiltro = 'todas'; aplicarFiltros()"
          >
            Todas
          </button>
          <button 
            [class.activo]="estadoFiltro === 'activa'"
            (click)="estadoFiltro = 'activa'; aplicarFiltros()"
          >
            Activas
          </button>
          <button 
            [class.activo]="estadoFiltro === 'programada'"
            (click)="estadoFiltro = 'programada'; aplicarFiltros()"
          >
            Programadas
          </button>
          <button 
            [class.activo]="estadoFiltro === 'finalizada'"
            (click)="estadoFiltro = 'finalizada'; aplicarFiltros()"
          >
            Finalizadas
          </button>
        </div>
      </div>

      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Cargando campañas...</p>
        </div>
      } @else if (campanasFiltradas().length === 0) {
        <div class="sin-datos">
          <h2>No hay campañas</h2>
          <p>Crea tu primera campaña publicitaria</p>
          <button class="boton-secundario" (click)="mostrarFormulario.set(true)">
            Crear Campaña
          </button>
        </div>
      } @else {
        <div class="grid-campanas">
          @for (campana of campanasFiltradas(); track campana.id) {
            <div class="tarjeta-campana">
              <div class="header-tarjeta">
                <h3>{{ campana.nombre }}</h3>
                <span class="badge" [ngClass]="campana.estado">
                  {{ campana.estado | uppercase }}
                </span>
              </div>
              
              <p class="descripcion">{{ campana.descripcion }}</p>
              
              <div class="barra-progreso">
                <div class="progreso" [style.width.%]="calcularProgreso(campana)"></div>
              </div>
              
              <div class="info-fechas">
                <div class="fecha">
                  <span class="label">Inicio</span>
                  <span class="valor">{{ campana.fechaInicio | date:'short' }}</span>
                </div>
                <div class="fecha">
                  <span class="label">Fin</span>
                  <span class="valor">{{ campana.fechaFin | date:'short' }}</span>
                </div>
              </div>
              
              <div class="info-pantallas">
                <span class="icono">Pantallas</span>
                <span class="cantidad">{{ campana.pantallasAsignadas }}</span>
              </div>
              
              <div class="acciones-tarjeta">
                <button class="btn-accion" (click)="duplicar(campana)">Duplicar</button>
                <button class="btn-accion" (click)="editar(campana)">Editar</button>
                <button class="btn-accion btn-eliminar" (click)="eliminar(campana)">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (mostrarFormulario()) {
      <app-formulario-campana></app-formulario-campana>
    }
  `
})
export class ListaCampanasComponent implements OnInit {
  cargando = signal(false);
  mostrarFormulario = signal(false);
  busqueda = '';
  estadoFiltro = 'todas';
  
  campanas = signal([
    { 
      id: '1', 
      nombre: 'Black Friday 2024', 
      descripcion: 'Campaña de descuentos especiales para Black Friday',
      fechaInicio: new Date(Date.now() + 86400000), 
      fechaFin: new Date(Date.now() + 172800000), 
      estado: 'programada', 
      pantallasAsignadas: 5 
    },
    { 
      id: '2', 
      nombre: 'Verano 2024', 
      descripcion: 'Promoción de productos de verano',
      fechaInicio: new Date(), 
      fechaFin: new Date(Date.now() + 7776000000), 
      estado: 'activa', 
      pantallasAsignadas: 8 
    },
    { 
      id: '3', 
      nombre: 'Año Nuevo', 
      descripcion: 'Campaña especial de Año Nuevo',
      fechaInicio: new Date(Date.now() - 2592000000), 
      fechaFin: new Date(Date.now() - 86400000), 
      estado: 'finalizada', 
      pantallasAsignadas: 3 
    },
  ]);

  ngOnInit() {
    setTimeout(() => this.cargando.set(false), 500);
  }

  aplicarFiltros() {}

  campanasFiltradas() {
    return this.campanas().filter(c => 
      (this.estadoFiltro === 'todas' || c.estado === this.estadoFiltro) &&
      (c.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
       c.descripcion.toLowerCase().includes(this.busqueda.toLowerCase()))
    );
  }

  calcularProgreso(campana: any): number {
    const ahora = Date.now();
    const inicio = campana.fechaInicio.getTime();
    const fin = campana.fechaFin.getTime();
    
    if (ahora < inicio) return 0;
    if (ahora > fin) return 100;
    
    return ((ahora - inicio) / (fin - inicio)) * 100;
  }

  editar(campana: any) {
    this.mostrarFormulario.set(true);
  }

  duplicar(campana: any) {
    const nuevaCampana = { ...campana, id: Date.now().toString() };
    this.campanas.update(c => [...c, nuevaCampana]);
  }

  eliminar(campana: any) {
    if (confirm('¿Estás seguro de eliminar esta campaña?')) {
      this.campanas.update(c => c.filter(item => item.id !== campana.id));
    }
  }
}
