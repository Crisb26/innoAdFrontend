import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para solicitud de crear/actualizar contenido
 */
export interface SolicitudContenido {
  titulo: string;
  descripcion?: string;
  tipo: 'IMAGEN' | 'VIDEO' | 'TEXTO' | 'HTML';
  url: string;
  pantallaId: number;
  duracion?: number;
  activo?: boolean;
}

/**
 * Interfaz para respuesta de contenido
 */
export interface RespuestaContenido {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'IMAGEN' | 'VIDEO' | 'TEXTO' | 'HTML';
  url: string;
  pantallaId: number;
  pantallaNombre: string;
  usuarioId: number;
  duracion: number;
  activo: boolean;
  fechaRegistro: string;
  fechaModificacion: string;
  tamaño: number;
  resolucionOptima: string;
}

/**
 * Interfaz genérica para respuestas del API
 */
export interface RespuestaAPI<T> {
  exitoso: boolean;
  mensaje: string;
  datos?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ContenidosService {
  private apiUrl = `${environment.apiUrl}/api/v1/contenidos`;
  
  // BehaviorSubject para mantener lista en tiempo real
  private contenidosSubject = new BehaviorSubject<RespuestaContenido[]>([]);
  contenidos$ = this.contenidosSubject.asObservable();

  // Subject para cambios en contenido seleccionado
  private contenidoSeleccionadoSubject = new BehaviorSubject<RespuestaContenido | null>(null);
  contenidoSeleccionado$ = this.contenidoSeleccionadoSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarContenidos();
  }

  /**
   * Obtiene todos los contenidos del usuario
   */
  obtenerContenidos(): Observable<RespuestaAPI<RespuestaContenido[]>> {
    return this.http.get<RespuestaAPI<RespuestaContenido[]>>(this.apiUrl);
  }

  /**
   * Obtiene contenidos por pantalla
   */
  obtenerContenidosPorPantalla(pantallaId: number): Observable<RespuestaAPI<RespuestaContenido[]>> {
    return this.http.get<RespuestaAPI<RespuestaContenido[]>>(`${this.apiUrl}/pantalla/${pantallaId}`);
  }

  /**
   * Carga contenidos y actualiza el BehaviorSubject
   */
  cargarContenidos(): void {
    this.obtenerContenidos().subscribe(
      response => {
        if (response.exitoso && response.datos) {
          this.contenidosSubject.next(response.datos);
        }
      },
      error => console.error('Error al cargar contenidos:', error)
    );
  }

  /**
   * Obtiene un contenido por ID
   */
  obtenerContenido(id: number): Observable<RespuestaAPI<RespuestaContenido>> {
    return this.http.get<RespuestaAPI<RespuestaContenido>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene contenido y lo selecciona
   */
  obtenerYSeleccionar(id: number): void {
    this.obtenerContenido(id).subscribe(
      response => {
        if (response.exitoso && response.datos) {
          this.contenidoSeleccionadoSubject.next(response.datos);
        }
      },
      error => console.error('Error al obtener contenido:', error)
    );
  }

  /**
   * Crea un nuevo contenido
   */
  crearContenido(solicitud: SolicitudContenido): Observable<RespuestaAPI<RespuestaContenido>> {
    return this.http.post<RespuestaAPI<RespuestaContenido>>(this.apiUrl, solicitud);
  }

  /**
   * Crea contenido y actualiza lista
   */
  crearYActualizar(solicitud: SolicitudContenido): void {
    this.crearContenido(solicitud).subscribe(
      response => {
        if (response.exitoso) {
          this.cargarContenidos();
          this.contenidoSeleccionadoSubject.next(response.datos || null);
        }
      },
      error => console.error('Error al crear contenido:', error)
    );
  }

  /**
   * Actualiza un contenido existente
   */
  actualizarContenido(id: number, solicitud: SolicitudContenido): Observable<RespuestaAPI<RespuestaContenido>> {
    return this.http.put<RespuestaAPI<RespuestaContenido>>(`${this.apiUrl}/${id}`, solicitud);
  }

  /**
   * Actualiza contenido y actualiza lista
   */
  actualizarYActualizar(id: number, solicitud: SolicitudContenido): void {
    this.actualizarContenido(id, solicitud).subscribe(
      response => {
        if (response.exitoso) {
          this.cargarContenidos();
          this.contenidoSeleccionadoSubject.next(response.datos || null);
        }
      },
      error => console.error('Error al actualizar contenido:', error)
    );
  }

  /**
   * Elimina un contenido
   */
  eliminarContenido(id: number): Observable<RespuestaAPI<void>> {
    return this.http.delete<RespuestaAPI<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina contenido y actualiza lista
   */
  eliminarYActualizar(id: number): void {
    this.eliminarContenido(id).subscribe(
      response => {
        if (response.exitoso) {
          this.cargarContenidos();
          this.contenidoSeleccionadoSubject.next(null);
        }
      },
      error => console.error('Error al eliminar contenido:', error)
    );
  }

  /**
   * Sube un archivo de contenido
   */
  subirArchivo(archivo: File, pantallaId: number): Observable<RespuestaAPI<any>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('pantallaId', pantallaId.toString());
    
    return this.http.post<RespuestaAPI<any>>(`${this.apiUrl}/subir`, formData);
  }

  /**
   * Obtiene contenidos del BehaviorSubject
   */
  getContenidosActuales(): RespuestaContenido[] {
    return this.contenidosSubject.value;
  }

  /**
   * Obtiene contenido seleccionado actual
   */
  getContenidoSeleccionado(): RespuestaContenido | null {
    return this.contenidoSeleccionadoSubject.value;
  }

  /**
   * Establece contenido seleccionado
   */
  establecerContenidoSeleccionado(contenido: RespuestaContenido | null): void {
    this.contenidoSeleccionadoSubject.next(contenido);
  }

  /**
   * Activa/desactiva un contenido
   */
  toggleActivo(id: number, activo: boolean): Observable<RespuestaAPI<RespuestaContenido>> {
    return this.http.patch<RespuestaAPI<RespuestaContenido>>(
      `${this.apiUrl}/${id}/activo`,
      { activo }
    );
  }
}
