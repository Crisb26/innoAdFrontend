import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuariosAdminService, UsuarioAdmin, EstadisticasUsuarios } from '@core/servicios/usuarios-admin.servicio';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="gestion-usuarios-container">
      <!-- Header -->
      <div class="header-section">
        <div class="titulo-seccion">
          <h2>👥 Gestión de Usuarios</h2>
          <p>Administra todos los usuarios del sistema</p>
        </div>
        <div class="acciones-header">
          <button class="btn-futurista" (click)="refrescarDatos()">
            <span class="icono">🔄</span>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="grid-estadisticas">
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.totalUsuarios || 0 }}</div>
            <div class="stat-label">Total Usuarios</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon activo">🟢</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.usuariosActivos || 0 }}</div>
            <div class="stat-label">Usuarios Activos</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.usuariosVerificados || 0 }}</div>
            <div class="stat-label">Verificados</div>
          </div>
        </div>
        <div class="tarjeta-cristal stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-info">
            <div class="stat-numero">{{ estadisticas()?.administradores || 0 }}</div>
            <div class="stat-label">Administradores</div>
          </div>
        </div>
      </div>

      <!-- Búsqueda y Filtros -->
      <div class="tarjeta-cristal filtros-section">
        <div class="filtros-content">
          <div class="busqueda-container">
            <input 
              type="text" 
              [(ngModel)]="terminoBusqueda"
              (input)="buscarUsuarios()"
              placeholder="Buscar usuarios por nombre, email o usuario..."
              class="input-busqueda"
            >
            <span class="icono-busqueda">🔍</span>
          </div>
          <div class="filtros-adicionales">
            <select [(ngModel)]="filtroRol" (change)="aplicarFiltros()" class="select-futurista">
              <option value="">Todos los roles</option>
              <option value="Usuario">Usuario</option>
              <option value="Técnico">Técnico</option>
              <option value="Developer">Developer</option>
              <option value="Administrador">Administrador</option>
            </select>
            <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" class="select-futurista">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="verificado">Verificados</option>
              <option value="no-verificado">No Verificados</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de Usuarios -->
      <div class="tarjeta-cristal usuarios-section">
        @if (cargando()) {
          <div class="loading-state">
            <div class="loader"></div>
            <p>Cargando usuarios...</p>
          </div>
        } @else if (usuariosFiltrados().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No se encontraron usuarios</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        } @else {
          <div class="tabla-usuarios">
            <div class="tabla-header">
              <div class="col-usuario">Usuario</div>
              <div class="col-rol">Rol</div>
              <div class="col-estado">Estado</div>
              <div class="col-actividad">Última Actividad</div>
              <div class="col-acciones">Acciones</div>
            </div>
            
            @for (usuario of usuariosFiltrados(); track usuario.id) {
              <div class="tabla-fila" [class.inactivo]="!usuario.activo">
                <div class="col-usuario">
                  <div class="usuario-info">
                    <div class="avatar-usuario">
                      {{ obtenerIniciales(usuario.nombreCompleto) }}
                    </div>
                    <div class="datos-usuario">
                      <div class="nombre">{{ usuario.nombreCompleto }}</div>
                      <div class="email">{{ usuario.email }}</div>
                      <div class="username">&#64;{{ usuario.nombreUsuario }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-rol">
                  <div class="badge-rol" [attr.data-rol]="usuario.rol.nombre.toLowerCase()">
                    {{ usuario.rol.nombre }}
                  </div>
                </div>
                
                <div class="col-estado">
                  <div class="estado-badges">
                    <span class="badge" [class.activo]="usuario.activo" [class.inactivo]="!usuario.activo">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                    <span class="badge" [class.verificado]="usuario.verificado" [class.no-verificado]="!usuario.verificado">
                      {{ usuario.verificado ? 'Verificado' : 'Pendiente' }}
                    </span>
                  </div>
                </div>
                
                <div class="col-actividad">
                  <div class="actividad-info">
                    <div class="fecha-acceso">
                      {{ formatearFecha(usuario.ultimoAcceso) }}
                    </div>
                    <div class="estadisticas-mini">
                      <span>{{ usuario.totalCampanas }} campañas</span>
                      <span>{{ usuario.totalContenidos }} contenidos</span>
                    </div>
                  </div>
                </div>
                
                <div class="col-acciones">
                  <div class="acciones-usuario">
                    <button 
                      class="btn-accion tooltip-container" 
                      (click)="toggleActivarUsuario(usuario)"
                      [class.activar]="!usuario.activo"
                      [class.desactivar]="usuario.activo"
                    >
                      <span class="icono">{{ usuario.activo ? '⏸️' : '▶️' }}</span>
                      <span class="tooltip">{{ usuario.activo ? 'Desactivar' : 'Activar' }}</span>
                    </button>
                    
                    @if (!usuario.verificado) {
                      <button 
                        class="btn-accion verificar tooltip-container" 
                        (click)="verificarUsuario(usuario)"
                      >
                        <span class="icono">✅</span>
                        <span class="tooltip">Verificar</span>
                      </button>
                    }
                    
                    <button 
                      class="btn-accion editar tooltip-container" 
                      (click)="abrirModalEdicion(usuario)"
                    >
                      <span class="icono">✏️</span>
                      <span class="tooltip">Editar Rol</span>
                    </button>
                    
                    <button 
                      class="btn-accion eliminar tooltip-container" 
                      (click)="confirmarEliminar(usuario)"
                    >
                      <span class="icono">🗑️</span>
                      <span class="tooltip">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Modal de Edición de Rol -->
      @if (modalEdicion()) {
        <div class="modal-overlay" (click)="cerrarModalEdicion()">
          <div class="modal-contenido" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Cambiar Rol de Usuario</h3>
              <button class="btn-cerrar" (click)="cerrarModalEdicion()">✕</button>
            </div>
            <div class="modal-body">
              <div class="usuario-seleccionado">
                <div class="avatar-usuario">
                  {{ obtenerIniciales(usuarioSeleccionado()?.nombreCompleto || '') }}
                </div>
                <div>
                  <div class="nombre">{{ usuarioSeleccionado()?.nombreCompleto }}</div>
                  <div class="email">{{ usuarioSeleccionado()?.email }}</div>
                </div>
              </div>
              
              <div class="campo-form">
                <label>Rol Actual: <strong>{{ usuarioSeleccionado()?.rol?.nombre || 'Sin rol' }}</strong></label>
              </div>
              
              <div class="campo-form">
                <label for="nuevoRol">Nuevo Rol:</label>
                <select id="nuevoRol" [(ngModel)]="nuevoRol" class="select-futurista">
                  <option value="Usuario">Usuario</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Developer">Developer</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secundario" (click)="cerrarModalEdicion()">
                Cancelar
              </button>
              <button 
                class="btn-futurista" 
                (click)="cambiarRol()"
                [disabled]="!nuevoRol || nuevoRol === (usuarioSeleccionado()?.rol?.nombre || '')"
              >
                Cambiar Rol
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de Confirmación de Eliminación -->
      @if (modalEliminar()) {
        <div class="modal-overlay" (click)="cerrarModalEliminar()">
          <div class="modal-contenido modal-peligro" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>⚠️ Confirmar Eliminación</h3>
              <button class="btn-cerrar" (click)="cerrarModalEliminar()">✕</button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas eliminar al usuario?</p>
              <div class="usuario-a-eliminar">
                <strong>{{ usuarioAEliminar()?.nombreCompleto }}</strong><br>
                <span>{{ usuarioAEliminar()?.email }}</span>
              </div>
              <div class="advertencia">
                <strong>Esta acción no se puede deshacer.</strong>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secundario" (click)="cerrarModalEliminar()">
                Cancelar
              </button>
              <button class="btn-peligro" (click)="eliminarUsuario()">
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .gestion-usuarios-container {
      padding: var(--espacio-xl);
      max-width: 1600px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--espacio-xl);
    }

    .titulo-seccion h2 {
      background: var(--gradiente-principal);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }

    .grid-estadisticas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--espacio-lg);
      margin-bottom: var(--espacio-xl);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--espacio-lg);
      padding: var(--espacio-lg);
    }

    .stat-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
    }

    .stat-icon.activo {
      animation: brillar 2s ease-in-out infinite alternate;
    }

    .stat-numero {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-primario);
    }

    .stat-label {
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .filtros-section {
      padding: var(--espacio-lg);
      margin-bottom: var(--espacio-lg);
    }

    .filtros-content {
      display: flex;
      gap: var(--espacio-lg);
      align-items: center;
      flex-wrap: wrap;
    }

    .busqueda-container {
      position: relative;
      flex: 1;
      min-width: 300px;
    }

    .input-busqueda {
      width: 100%;
      padding: var(--espacio-sm) var(--espacio-lg);
      padding-right: 3rem;
      background: var(--cristal-claro);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radio-md);
      color: var(--color-texto);
      font-size: 1rem;
      transition: var(--transicion-suave);
    }

    .input-busqueda:focus {
      outline: none;
      border-color: var(--color-primario);
      box-shadow: var(--sombra-neon-cyan);
    }

    .icono-busqueda {
      position: absolute;
      right: var(--espacio-sm);
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-texto-claro);
    }

    .filtros-adicionales {
      display: flex;
      gap: var(--espacio-md);
    }

    .select-futurista {
      padding: var(--espacio-sm) var(--espacio-md);
      background: var(--cristal-claro);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radio-md);
      color: var(--color-texto);
      min-width: 150px;
    }

    .usuarios-section {
      padding: 0;
      overflow: hidden;
    }

    .tabla-usuarios {
      width: 100%;
    }

    .tabla-header, .tabla-fila {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
      gap: var(--espacio-md);
      padding: var(--espacio-md) var(--espacio-lg);
      align-items: center;
    }

    .tabla-header {
      background: rgba(0, 212, 255, 0.1);
      border-bottom: 1px solid rgba(0, 212, 255, 0.3);
      font-weight: 600;
      color: var(--color-primario);
    }

    .tabla-fila {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: var(--transicion-suave);
    }

    .tabla-fila:hover {
      background: var(--cristal-hover);
    }

    .tabla-fila.inactivo {
      opacity: 0.6;
    }

    .usuario-info {
      display: flex;
      align-items: center;
      gap: var(--espacio-md);
    }

    .avatar-usuario {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--gradiente-principal);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .datos-usuario {
      flex: 1;
    }

    .nombre {
      font-weight: 600;
      color: var(--color-texto);
    }

    .email {
      font-size: 0.9rem;
      color: var(--color-texto-claro);
    }

    .username {
      font-size: 0.8rem;
      color: var(--color-texto-medio);
    }

    .badge-rol {
      padding: var(--espacio-xs) var(--espacio-sm);
      border-radius: var(--radio-sm);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-rol[data-rol="usuario"] {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }

    .badge-rol[data-rol="técnico"] {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .badge-rol[data-rol="developer"] {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .badge-rol[data-rol="administrador"] {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .estado-badges {
      display: flex;
      flex-direction: column;
      gap: var(--espacio-xs);
    }

    .badge {
      padding: 2px var(--espacio-xs);
      border-radius: var(--radio-sm);
      font-size: 0.75rem;
      text-align: center;
    }

    .badge.activo {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .badge.inactivo {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .badge.verificado {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
    }

    .badge.no-verificado {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .actividad-info {
      text-align: center;
    }

    .fecha-acceso {
      font-size: 0.9rem;
      color: var(--color-texto-claro);
    }

    .estadisticas-mini {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: var(--espacio-xs);
    }

    .estadisticas-mini span {
      font-size: 0.75rem;
      color: var(--color-texto-medio);
    }

    .acciones-usuario {
      display: flex;
      gap: var(--espacio-xs);
      justify-content: center;
    }

    .btn-accion {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--cristal-claro);
      color: var(--color-texto-claro);
      cursor: pointer;
      transition: var(--transicion-suave);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-accion:hover {
      background: var(--cristal-hover);
      transform: scale(1.1);
    }

    .btn-accion.activar:hover {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .btn-accion.desactivar:hover {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .btn-accion.verificar:hover {
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
    }

    .btn-accion.editar:hover {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }

    .btn-accion.eliminar:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .tooltip-container {
      position: relative;
    }

    .tooltip {
      position: absolute;
      bottom: 120%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--fondo-oscuro);
      color: var(--color-texto);
      padding: var(--espacio-xs) var(--espacio-sm);
      border-radius: var(--radio-sm);
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      border: 1px solid var(--color-primario);
      z-index: 1000;
    }

    .tooltip-container:hover .tooltip {
      opacity: 1;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: var(--espacio-2xl);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--espacio-lg);
      opacity: 0.5;
    }

    .modal-peligro .modal-header h3 {
      color: #ef4444;
    }

    .usuario-a-eliminar {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radio-md);
      padding: var(--espacio-md);
      margin: var(--espacio-md) 0;
    }

    .advertencia {
      color: #ef4444;
      text-align: center;
      margin-top: var(--espacio-md);
    }

    .btn-peligro {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: var(--espacio-sm) var(--espacio-lg);
      border-radius: var(--radio-md);
      font-weight: 600;
      cursor: pointer;
      transition: var(--transicion-suave);
    }

    .btn-peligro:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
    }

    .btn-secundario {
      background: var(--cristal-claro);
      color: var(--color-texto-claro);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: var(--espacio-sm) var(--espacio-lg);
      border-radius: var(--radio-md);
      cursor: pointer;
      transition: var(--transicion-suave);
    }

    .btn-secundario:hover {
      background: var(--cristal-hover);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .tabla-header, .tabla-fila {
        grid-template-columns: 1fr;
        gap: var(--espacio-sm);
      }

      .col-usuario {
        order: 1;
      }

      .col-rol, .col-estado {
        order: 2;
        display: flex;
        justify-content: space-between;
      }

      .col-actividad {
        order: 3;
      }

      .col-acciones {
        order: 4;
      }

      .filtros-content {
        flex-direction: column;
        align-items: stretch;
      }

      .busqueda-container {
        min-width: auto;
      }
    }
  `]
})
export class GestionUsuariosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosAdminService);

  protected readonly usuarios = signal<UsuarioAdmin[]>([]);
  protected readonly usuariosFiltrados = signal<UsuarioAdmin[]>([]);
  protected readonly estadisticas = signal<EstadisticasUsuarios | null>(null);
  protected readonly cargando = signal(true);
  
  // Filtros
  protected terminoBusqueda = '';
  protected filtroRol = '';
  protected filtroEstado = '';

  // Modales
  protected readonly modalEdicion = signal(false);
  protected readonly modalEliminar = signal(false);
  protected readonly usuarioSeleccionado = signal<UsuarioAdmin | null>(null);
  protected readonly usuarioAEliminar = signal<UsuarioAdmin | null>(null);
  protected nuevoRol = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    try {
      this.cargando.set(true);
      
      const [usuarios, stats] = await Promise.all([
        this.usuariosService.obtenerUsuarios().toPromise(),
        this.usuariosService.obtenerEstadisticas().toPromise()
      ]);

      this.usuarios.set(usuarios || []);
      this.estadisticas.set(stats || null);
      this.aplicarFiltros();
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  protected refrescarDatos(): void {
    this.cargarDatos();
  }

  protected buscarUsuarios(): void {
    if (this.terminoBusqueda.length >= 2) {
      this.usuariosService.buscarUsuarios(this.terminoBusqueda).subscribe({
        next: (usuarios) => {
          this.usuarios.set(usuarios);
          this.aplicarFiltros();
        },
        error: (error) => console.error('Error en búsqueda:', error)
      });
    } else if (this.terminoBusqueda.length === 0) {
      this.cargarDatos();
    }
  }

  protected aplicarFiltros(): void {
    let usuariosFiltrados = [...this.usuarios()];

    // Filtrar por rol
    if (this.filtroRol) {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.rol.nombre === this.filtroRol);
    }

    // Filtrar por estado
    if (this.filtroEstado) {
      switch (this.filtroEstado) {
        case 'activo':
          usuariosFiltrados = usuariosFiltrados.filter(u => u.activo);
          break;
        case 'inactivo':
          usuariosFiltrados = usuariosFiltrados.filter(u => !u.activo);
          break;
        case 'verificado':
          usuariosFiltrados = usuariosFiltrados.filter(u => u.verificado);
          break;
        case 'no-verificado':
          usuariosFiltrados = usuariosFiltrados.filter(u => !u.verificado);
          break;
      }
    }

    this.usuariosFiltrados.set(usuariosFiltrados);
  }

  protected obtenerIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  protected formatearFecha(fecha?: Date): string {
    if (!fecha) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  }

  protected toggleActivarUsuario(usuario: UsuarioAdmin): void {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    const servicio = usuario.activo 
      ? this.usuariosService.desactivarUsuario(usuario.id)
      : this.usuariosService.activarUsuario(usuario.id);

    servicio.subscribe({
      next: () => {
        usuario.activo = !usuario.activo;
        this.usuarios.update(usuarios => [...usuarios]);
        this.aplicarFiltros();
      },
      error: (error) => console.error(`Error al ${accion} usuario:`, error)
    });
  }

  protected verificarUsuario(usuario: UsuarioAdmin): void {
    this.usuariosService.verificarUsuario(usuario.id).subscribe({
      next: () => {
        usuario.verificado = true;
        this.usuarios.update(usuarios => [...usuarios]);
        this.aplicarFiltros();
      },
      error: (error) => console.error('Error al verificar usuario:', error)
    });
  }

  protected abrirModalEdicion(usuario: UsuarioAdmin): void {
    this.usuarioSeleccionado.set(usuario);
    this.nuevoRol = usuario.rol.nombre;
    this.modalEdicion.set(true);
  }

  protected cerrarModalEdicion(): void {
    this.modalEdicion.set(false);
    this.usuarioSeleccionado.set(null);
    this.nuevoRol = '';
  }

  protected cambiarRol(): void {
    const usuario = this.usuarioSeleccionado();
    if (!usuario || !this.nuevoRol) return;

    this.usuariosService.cambiarRol(usuario.id, this.nuevoRol).subscribe({
      next: () => {
        usuario.rol.nombre = this.nuevoRol;
        this.usuarios.update(usuarios => [...usuarios]);
        this.aplicarFiltros();
        this.cerrarModalEdicion();
      },
      error: (error) => console.error('Error al cambiar rol:', error)
    });
  }

  protected confirmarEliminar(usuario: UsuarioAdmin): void {
    this.usuarioAEliminar.set(usuario);
    this.modalEliminar.set(true);
  }

  protected cerrarModalEliminar(): void {
    this.modalEliminar.set(false);
    this.usuarioAEliminar.set(null);
  }

  protected eliminarUsuario(): void {
    const usuario = this.usuarioAEliminar();
    if (!usuario) return;

    this.usuariosService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(usuarios => usuarios.filter(u => u.id !== usuario.id));
        this.aplicarFiltros();
        this.cerrarModalEliminar();
      },
      error: (error) => console.error('Error al eliminar usuario:', error)
    });
  }
}