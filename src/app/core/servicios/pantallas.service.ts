import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private apiUrl = `${environment.api.baseUrl}/v1/pantallas`;
  
  // BehaviorSubject para mantener lista en tiempo real
  private pantallasSubject = new BehaviorSubject<RespuestaPantalla[]>([]);
  pantallas$ = this.pantallasSubject.asObservable();

  // Subject para cambios en pantalla seleccionada
  private pantallaSeleccionadaSubject = new BehaviorSubject<RespuestaPantalla | null>(null);
  pantallaSeleccionada$ = this.pantallaSeleccionadaSubject.asObservable();

  // Pantallas de demo para modo offline
  private pantallasMock: RespuestaPantalla[] = [
    {
      id: 1,
      nombre: 'Pantalla Entrada Principal',
      descripcion: 'Pantalla ubicada en la entrada principal del edificio',
      codigoIdentificacion: 'PANT-001',
      estado: 'ACTIVA',
      ubicacion: 'Vestíbulo Principal',
      resolucion: '1920x1080',
      orientacion: 'HORIZONTAL',
      usuarioId: 1,
      nombreUsuario: 'Admin',
      fechaRegistro: new Date().toISOString(),
      ultimaConexion: new Date().toISOString(),
      ultimaSincronizacion: new Date().toISOString(),
      direccionIp: '192.168.1.100',
      versionSoftware: '2.0.0',
      informacionSistema: 'Linux Ubuntu 22.04',
      notas: 'Pantalla de bienvenida',
      estaConectada: true,
      cantidadContenidos: 5
    },
    {
      id: 2,
      nombre: 'Pantalla Sala de Espera',
      descripcion: 'Pantalla vertical en la sala de espera',
      codigoIdentificacion: 'PANT-002',
      estado: 'ACTIVA',
      ubicacion: 'Sala de Espera A',
      resolucion: '1080x1920',
      orientacion: 'VERTICAL',
      usuarioId: 1,
      nombreUsuario: 'Admin',
      fechaRegistro: new Date().toISOString(),
      ultimaConexion: new Date().toISOString(),
      ultimaSincronizacion: new Date().toISOString(),
      direccionIp: '192.168.1.101',
      versionSoftware: '2.0.0',
      informacionSistema: 'Linux Ubuntu 22.04',
      notas: 'Pantalla para publicaciones verticales',
      estaConectada: true,
      cantidadContenidos: 3
    },
    {
      id: 3,
      nombre: 'Pantalla Pasillo Centro',
      descripcion: 'Pantalla en el pasillo central del edificio',
      codigoIdentificacion: 'PANT-003',
      estado: 'INACTIVA',
      ubicacion: 'Pasillo Central',
      resolucion: '1920x1080',
      orientacion: 'HORIZONTAL',
      usuarioId: 1,
      nombreUsuario: 'Admin',
      fechaRegistro: new Date().toISOString(),
      ultimaConexion: new Date(Date.now() - 3600000).toISOString(),
      ultimaSincronizacion: new Date(Date.now() - 7200000).toISOString(),
      direccionIp: '192.168.1.102',
      versionSoftware: '1.9.8',
      informacionSistema: 'Linux CentOS 7',
      notas: 'Pantalla en mantenimiento',
      estaConectada: false,
      cantidadContenidos: 2
    }
  ];

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
        } else {
          // Si no hay respuesta válida, cargar mock
          this.cargarPantallasMock();
        }
      },
      error => {
        console.warn('Error al cargar pantallas desde API, usando datos mock:', error);
        this.cargarPantallasMock();
      }
    );
  }

  /**
   * Carga pantallas mock para desarrollo/demostración
   */
  private cargarPantallasMock(): void {
    this.pantallasSubject.next(this.pantallasMock);
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
  crearPantalla(solicitud: SolicitudPantalla): Observable<any> {
    return this.http.post<any>(this.apiUrl, solicitud).pipe(
      map(response => {
        // Normalizar respuesta: el backend usa 'success', nosotros usamos 'exitoso'
        return {
          exitoso: response.success || response.exitoso || false,
          mensaje: response.message || response.mensaje || '',
          datos: response.data || response.datos || null
        };
      })
    );
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
  actualizarPantalla(id: number, solicitud: SolicitudPantalla): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, solicitud).pipe(
      map(response => ({
        exitoso: response.success || response.exitoso || false,
        mensaje: response.message || response.mensaje || '',
        datos: response.data || response.datos || null
      }))
    );
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
  eliminarPantalla(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => ({
        exitoso: response.success || response.exitoso || false,
        mensaje: response.message || response.mensaje || '',
        datos: response.data || response.datos || null
      }))
    );
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
      error => {
        // En modo offline, eliminar del mock local
        console.warn('Error al eliminar pantalla, removiendo del mock local:', error);
        const pantallasActuales = this.pantallasSubject.value;
        const pantallasFiltradas = pantallasActuales.filter(p => p.id !== id);
        this.pantallasSubject.next(pantallasFiltradas);
        this.pantallaSeleccionadaSubject.next(null);
      }
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
