import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import NotifyX from 'notifyx';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  permisos: string[];
  estado: 'activo' | 'inactivo';
}

const COLORES_DISPONIBLES = [
  '#00D4FF', '#FF6B9D', '#FFC93D', '#6BCB77', '#4D96FF',
  '#FF8787', '#A78BFA', '#F97316', '#06B6D4', '#EC4899'
];

const ICONOS_DISPONIBLES = ['⚙️', '👨‍💼', '📊', '👤', '🔐', '📱', '💼', '🎯', '🚀', '✨'];

const PERMISOS_DISPONIBLES = [
  'CREAR_CAMPANAS', 'EDITAR_CAMPANAS', 'ELIMINAR_CAMPANAS',
  'CREAR_CONTENIDOS', 'EDITAR_CONTENIDOS', 'ELIMINAR_CONTENIDOS',
  'CREAR_PANTALLAS', 'EDITAR_PANTALLAS', 'ELIMINAR_PANTALLAS',
  'VER_REPORTES', 'DESCARGAR_REPORTES',
  'GESTIONAR_USUARIOS', 'CREAR_USUARIOS', 'ELIMINAR_USUARIOS',
  'CREAR_ROLES', 'EDITAR_ROLES', 'ELIMINAR_ROLES',
  'VER_LOGS', 'GESTIONAR_SISTEMA', 'MODO_MANTENIMIENTO'
];

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="contenedor-roles">
      <div class="header-roles">
        <div>
          <h2>Gestión de Roles</h2>
          <p>Crea y administra los roles del sistema</p>
        </div>
        <button class="boton-primario" (click)="abrirNuevoRol()">
          <span class="icono">+</span> Nuevo Rol
        </button>
      </div>

      @if (cargando()) {
        <div class="loader">
          <div class="spinner"></div>
          <p>Cargando roles...</p>
        </div>
      } @else if (roles().length === 0) {
        <div class="sin-datos">
          <p>No hay roles creados aún</p>
          <button class="boton-secundario" (click)="abrirNuevoRol()">
            Crear primer rol
          </button>
        </div>
      } @else {
        <div class="grid-roles">
          @for (rol of roles(); track rol.id) {
            <div class="tarjeta-rol">
              <div class="header-tarjeta" [style.background]="rol.color">
                <div class="icono-rol">{{ rol.icono }}</div>
                <button class="btn-menu" (click)="abrirMenu($event, rol)">⋮</button>
              </div>
              
              <div class="contenido-rol">
                <h3>{{ rol.nombre }}</h3>
                <p class="descripcion">{{ rol.descripcion }}</p>
                
                <div class="permisos-preview">
                  <strong>Permisos:</strong>
                  <div class="lista-permisos">
                    @for (permiso of rol.permisos.slice(0, 3); track permiso) {
                      <span class="badge-permiso">{{ permiso }}</span>
                    }
                    @if (rol.permisos.length > 3) {
                      <span class="badge-mas">+{{ rol.permisos.length - 3 }} más</span>
                    }
                  </div>
                </div>
                
                <div class="estado-rol">
                  <span [ngClass]="rol.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'">
                    {{ rol.estado | uppercase }}
                  </span>
                </div>
              </div>
              
              <div class="acciones-rol">
                <button class="boton-accion" (click)="editarRol(rol)">Editar</button>
                <button class="boton-accion btn-eliminar" (click)="eliminarRol(rol)">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }

      @if (mostrarFormulario()) {
        <div class="modal-overlay" (click)="cerrarFormulario()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ rolEnEdicion() ? 'Editar Rol' : 'Crear Nuevo Rol' }}</h2>
              <button class="btn-cerrar" (click)="cerrarFormulario()">×</button>
            </div>

            <form [formGroup]="formulario" (ngSubmit)="guardarRol()" class="modal-body">
              <div class="campo">
                <label>Nombre del Rol</label>
                <input 
                  type="text"
                  formControlName="nombre"
                  placeholder="Ej: Gerente de Campañas"
                  class="entrada"
                >
              </div>

              <div class="campo">
                <label>Descripción</label>
                <textarea
                  formControlName="descripcion"
                  placeholder="Describe las responsabilidades de este rol"
                  rows="3"
                  class="entrada"
                ></textarea>
              </div>

              <div class="fila-dos">
                <div class="campo">
                  <label>Color</label>
                  <div class="selector-colores">
                    @for (color of coloresDisponibles; track color) {
                      <button
                        type="button"
                        class="color-option"
                        [style.background]="color"
                        [class.seleccionado]="formulario.get('color')?.value === color"
                        (click)="formulario.get('color')?.setValue(color)"
                        title="{{ color }}"
                      ></button>
                    }
                  </div>
                </div>

                <div class="campo">
                  <label>Icono</label>
                  <div class="selector-iconos">
                    @for (icono of iconosDisponibles; track icono) {
                      <button
                        type="button"
                        class="icono-option"
                        [class.seleccionado]="formulario.get('icono')?.value === icono"
                        (click)="formulario.get('icono')?.setValue(icono)"
                      >
                        {{ icono }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="campo">
                <label>Permisos</label>
                <div class="lista-permisos-checkbox">
                  @for (permiso of permisosDisponibles; track permiso) {
                    <label class="checkbox-permiso">
                      <input
                        type="checkbox"
                        [checked]="permisoSeleccionado(formulario.get('permisos')?.value, permiso)"
                        (change)="togglePermiso(permiso)"
                      >
                      {{ permiso }}
                    </label>
                  }
                </div>
              </div>

              <div class="campo">
                <label>Estado</label>
                <select formControlName="estado" class="entrada">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div class="modal-footer">
                <button type="button" class="boton-secundario" (click)="cerrarFormulario()">
                  Cancelar
                </button>
                <button type="submit" class="boton-primario" [disabled]="!formulario.valid">
                  {{ rolEnEdicion() ? 'Actualizar' : 'Crear' }} Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./gestion-roles.component.scss']
})
export class GestionRolesComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  roles = signal<Rol[]>([]);
  cargando = signal(false);
  mostrarFormulario = signal(false);
  rolEnEdicion = signal<Rol | null>(null);
  
  coloresDisponibles = COLORES_DISPONIBLES;
  iconosDisponibles = ICONOS_DISPONIBLES;
  permisosDisponibles = PERMISOS_DISPONIBLES;
  
  formulario!: FormGroup;

  ngOnInit() {
    this.cargarRoles();
    this.inicializarFormulario();
  }

  private inicializarFormulario() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripción: [''],
      color: [COLORES_DISPONIBLES[0], Validators.required],
      icono: [ICONOS_DISPONIBLES[0], Validators.required],
      permisos: [[], Validators.required],
      estado: ['activo', Validators.required]
    });
  }

  cargarRoles() {
    this.cargando.set(true);
    // Simular carga de datos
    setTimeout(() => {
      const rolesIniciales: Rol[] = [
        {
          id: '1',
          nombre: 'Administrador',
          descripcion: 'Control total del sistema',
          color: '#FF6B9D',
          icono: '⚙️',
          permisos: PERMISOS_DISPONIBLES,
          estado: 'activo'
        },
        {
          id: '2',
          nombre: 'Gerente',
          descripcion: 'Gestión de campañas y reportes',
          color: '#00D4FF',
          icono: '👨‍💼',
          permisos: [
            'CREAR_CAMPANAS', 'EDITAR_CAMPANAS',
            'VER_REPORTES', 'DESCARGAR_REPORTES'
          ],
          estado: 'activo'
        },
        {
          id: '3',
          nombre: 'Operador',
          descripcion: 'Manejo de contenidos y pantallas',
          color: '#FFC93D',
          icono: '📱',
          permisos: [
            'CREAR_CONTENIDOS', 'EDITAR_CONTENIDOS',
            'CREAR_PANTALLAS', 'EDITAR_PANTALLAS'
          ],
          estado: 'activo'
        }
      ];
      this.roles.set(rolesIniciales);
      this.cargando.set(false);
    }, 500);
  }

  abrirNuevoRol() {
    this.rolEnEdicion.set(null);
    this.inicializarFormulario();
    this.mostrarFormulario.set(true);
  }

  editarRol(rol: Rol) {
    this.rolEnEdicion.set(rol);
    this.formulario.patchValue({
      nombre: rol.nombre,
      descripción: rol.descripcion,
      color: rol.color,
      icono: rol.icono,
      permisos: rol.permisos,
      estado: rol.estado
    });
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.rolEnEdicion.set(null);
  }

  togglePermiso(permiso: string) {
    const permisos = this.formulario.get('permisos')?.value || [];
    const index = permisos.indexOf(permiso);
    
    if (index >= 0) {
      permisos.splice(index, 1);
    } else {
      permisos.push(permiso);
    }
    
    this.formulario.get('permisos')?.setValue(permisos);
  }

  permisoSeleccionado(permisos: string[], permiso: string): boolean {
    return permisos && permisos.includes(permiso);
  }

  guardarRol() {
    if (!this.formulario.valid) return;

    const rolDatos: Rol = {
      id: this.rolEnEdicion()?.id || Date.now().toString(),
      ...this.formulario.value
    };

    if (this.rolEnEdicion()) {
      // Actualizar rol existente
      this.roles.update(r => 
        r.map(rol => rol.id === rolDatos.id ? rolDatos : rol)
      );
      NotifyX.success('Rol actualizado exitosamente', {
        duration: 3000,
        dismissible: true
      });
    } else {
      // Crear nuevo rol
      this.roles.update(r => [...r, rolDatos]);
      NotifyX.success('Rol creado exitosamente', {
        duration: 3000,
        dismissible: true
      });
    }

    this.cerrarFormulario();
  }

  eliminarRol(rol: Rol) {
    if (confirm(`¿Estás seguro de eliminar el rol "${rol.nombre}"?`)) {
      this.roles.update(r => r.filter(item => item.id !== rol.id));
      NotifyX.success('Rol eliminado exitosamente', {
        duration: 3000,
        dismissible: true
      });
    }
  }

  abrirMenu(event: Event, rol: Rol) {
    event.stopPropagation();
    // Aquí irían más opciones de menú si es necesario
  }
}
