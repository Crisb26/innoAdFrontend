import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para solicitud de crear/actualizar pantalla
 */
export interface SolicitudPantalla {
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  resolucion?: string;
  orientacion: 'HORIZONTAL' | 'VERTICAL';
  notas?: string;
}

/**
 * Interfaz para respuesta de pantalla
 */
export interface RespuestaPantalla {
  id: number;
  nombre: string;
  descripcion: string;
  codigoIdentificacion: string;
  estado: string;
  ubicacion: string;
  resolucion: string;
  orientacion: 'HORIZONTAL' | 'VERTICAL';
  usuarioId: number;
  nombreUsuario: string;
  fechaRegistro: string;
  ultimaConexion: string;
  ultimaSincronizacion: string;
  direccionIp: string;
  versionSoftware: string;
  informacionSistema: string;
  notas: string;
  estaConectada: boolean;
  cantidadContenidos: number;
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
export class PantallasService {
  private apiUrl = `${environment.apiUrl}/api/v1/pantallas`;
  
  // BehaviorSubject para mantener lista en tiempo real
  private pantallasSubject = new BehaviorSubject<RespuestaPantalla[]>([]);
  pantallas$ = this.pantallasSubject.asObservable();

  // Subject para cambios en pantalla seleccionada
  private pantallaSeleccionadaSubject = new BehaviorSubject<RespuestaPantalla | null>(null);
  pantallaSeleccionada$ = this.pantallaSeleccionadaSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarPantallas();
  }

  /**
   * Obtiene todas las pantallas del usuario
   */
  obtenerPantallas(): Observable<RespuestaAPI<RespuestaPantalla[]>> {
    return this.http.get<RespuestaAPI<RespuestaPantalla[]>>(this.apiUrl);
  }

  /**
   * Carga pantallas y actualiza el BehaviorSubject
   */
  cargarPantallas(): void {
    this.obtenerPantallas().subscribe(
      response => {
        if (response.exitoso && response.datos) {
          this.pantallasSubject.next(response.datos);
        }
      },
      error => console.error('Error al cargar pantallas:', error)
    );
  }

  /**
   * Obtiene una pantalla por ID
   */
  obtenerPantalla(id: number): Observable<RespuestaAPI<RespuestaPantalla>> {
    return this.http.get<RespuestaAPI<RespuestaPantalla>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene pantalla y la selecciona
   */
  obtenerYSeleccionar(id: number): void {
    this.obtenerPantalla(id).subscribe(
      response => {
        if (response.exitoso && response.datos) {
          this.pantallaSeleccionadaSubject.next(response.datos);
        }
      },
      error => console.error('Error al obtener pantalla:', error)
    );
  }

  /**
   * Crea una nueva pantalla
   */
  crearPantalla(solicitud: SolicitudPantalla): Observable<RespuestaAPI<RespuestaPantalla>> {
    return this.http.post<RespuestaAPI<RespuestaPantalla>>(this.apiUrl, solicitud);
  }

  /**
   * Crea pantalla y actualiza lista
   */
  crearYActualizar(solicitud: SolicitudPantalla): void {
    this.crearPantalla(solicitud).subscribe(
      response => {
        if (response.exitoso) {
          this.cargarPantallas();
          this.pantallaSeleccionadaSubject.next(response.datos || null);
        }
      },
      error => console.error('Error al crear pantalla:', error)
    );
  }

  /**
   * Actualiza una pantalla existente
   */
  actualizarPantalla(id: number, solicitud: SolicitudPantalla): Observable<RespuestaAPI<RespuestaPantalla>> {
    return this.http.put<RespuestaAPI<RespuestaPantalla>>(`${this.apiUrl}/${id}`, solicitud);
  }

  /**
   * Actualiza pantalla y actualiza lista
   */
  actualizarYActualizar(id: number, solicitud: SolicitudPantalla): void {
    this.actualizarPantalla(id, solicitud).subscribe(
      response => {
        if (response.exitoso) {
          this.cargarPantallas();
          this.pantallaSeleccionadaSubject.next(response.datos || null);
        }
      },
      error => console.error('Error al actualizar pantalla:', error)
    );
  }

  /**
   * Elimina una pantalla
   */
  eliminarPantalla(id: number): Observable<RespuestaAPI<void>> {
    return this.http.delete<RespuestaAPI<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina pantalla y actualiza lista
   */
  eliminarYActualizar(id: number): void {
    this.eliminarPantalla(id).subscribe(
      response => {
        if (response.exitoso) {
          this.cargarPantallas();
          this.pantallaSeleccionadaSubject.next(null);
        }
      },
      error => console.error('Error al eliminar pantalla:', error)
    );
  }

  /**
   * Obtiene pantallas del BehaviorSubject
   */
  getPantallasActuales(): RespuestaPantalla[] {
    return this.pantallasSubject.value;
  }

  /**
   * Obtiene pantalla seleccionada actual
   */
  getPantallaSeleccionada(): RespuestaPantalla | null {
    return this.pantallaSeleccionadaSubject.value;
  }

  /**
   * Establece pantalla seleccionada
   */
  establecerPantallaSeleccionada(pantalla: RespuestaPantalla | null): void {
    this.pantallaSeleccionadaSubject.next(pantalla);
  }
}
