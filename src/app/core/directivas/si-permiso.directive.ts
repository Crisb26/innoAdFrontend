import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';
import { tienePermiso, Rol, Permiso } from '../config/roles.config';

/**
 * Directiva *appSiPermiso
 * Muestra/oculta elementos según los permisos del usuario
 * 
 * Uso:
 * <button *appSiPermiso="'CREAR_CAMPANA'">Crear</button>
 * <div *appSiPermiso="['EDITAR_CONTENIDO', 'ELIMINAR_CONTENIDO']; else sinPermisos">Acceso permitido</div>
 * <ng-template #sinPermisos>Sin acceso</ng-template>
 */
@Directive({
  selector: '[appSiPermiso]',
  standalone: true
})
export class SiPermisoDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private servicioAutenticacion = inject(ServicioAutenticacion);

  private permisos: string[] = [];
  private requiereAlgunos = false; // true si requiere ALGUNO, false si requiere TODOS

  constructor() {
    // Usar effect para reactividad cuando cambia el usuario
    effect(() => {
      const usuario = this.servicioAutenticacion.usuarioActual();
      this._actualizarVista();
    });
  }

  /**
   * Establece el permiso o permisos requeridos
   * @param permiso string o array de strings con nombres de permisos
   */
  @Input()
  set appSiPermiso(permiso: string | string[]) {
    this.permisos = Array.isArray(permiso) ? permiso : [permiso];
    this._actualizarVista();
  }

  /**
   * Define si requiere ALGUNO o TODOS los permisos (default: TODOS)
   * @param valor 'alguno' para requireAll, 'todos' para requireAll
   */
  @Input()
  set appSiPermisoRequerimiento(valor: 'alguno' | 'todos') {
    this.requiereAlgunos = valor === 'alguno';
    this._actualizarVista();
  }

  /**
   * Actualiza la vista según si tiene permisos
   */
  private _actualizarVista(): void {
    const usuario = this.servicioAutenticacion.usuarioActual();
    
    if (!usuario || !usuario.rol) {
      this.viewContainer.clear();
      return;
    }

    const rolUsuario = usuario.rol as any;
    const rolNombre = (typeof rolUsuario === 'string' ? rolUsuario : rolUsuario.nombre) as Rol;

    let tieneAcceso = false;

    if (this.requiereAlgunos) {
      // Requiere ALGUNO de los permisos
      tieneAcceso = this.permisos.some(p => 
        tienePermiso(rolNombre, p as Permiso)
      );
    } else {
      // Requiere TODOS los permisos
      tieneAcceso = this.permisos.every(p => 
        tienePermiso(rolNombre, p as Permiso)
      );
    }

    if (tieneAcceso) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
