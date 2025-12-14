import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, catchError, switchMap, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface RaspberryPiStatus {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: 'activa' | 'inactiva' | 'error';
  ip?: string;
  temperatura?: number;
  cpu?: number;
  memoria?: number;
  contenido_actual?: string;
  uptime?: number;
  ultima_sincronizacion?: string;
}

export interface ComandoRaspberryPi {
  tipo: 'reproducir' | 'parar' | 'reiniciar' | 'recargar' | 'test' | 'actualizar';
  contenido_id?: string;
  parametros?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class ServicioRaspberryPi {
  private readonly API_URL = `${environment.urlApi}/pantallas`;
  private pantallasStatus$ = new BehaviorSubject<RaspberryPiStatus[]>([]);

  constructor(private http: HttpClient) {
    this.iniciarMonitoreo();
  }

  // Obtener todas las pantallas
  obtenerPantallas(filtro?: any): Observable<RaspberryPiStatus[]> {
    let params = new HttpParams();
    if (filtro) {
      Object.keys(filtro).forEach(key => {
        if (filtro[key]) {
          params = params.set(key, filtro[key]);
        }
      });
    }
    return this.http.get<any>(this.API_URL, { params })
      .pipe(
        map(response => response.data || []),
        retry(1),
        catchError(() => {
          console.error('Error obteniendo pantallas');
          return [];
        })
      );
  }

  // Obtener pantalla específica
  obtenerPantalla(id: string): Observable<RaspberryPiStatus> {
    return this.http.get<any>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => response.data),
        retry(1)
      );
  }

  // Enviar comando a pantalla
  enviarComando(id: string, comando: ComandoRaspberryPi): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/comando`, comando);
  }

  // Reproducir contenido
  reproducir(id: string, contenidoId: string): Observable<any> {
    return this.enviarComando(id, {
      tipo: 'reproducir',
      contenido_id: contenidoId
    });
  }

  // Parar reproducción
  parar(id: string): Observable<any> {
    return this.enviarComando(id, { tipo: 'parar' });
  }

  // Reiniciar pantalla
  reiniciar(id: string): Observable<any> {
    return this.enviarComando(id, { tipo: 'reiniciar' });
  }

  // Recargar contenidos
  recargar(id: string): Observable<any> {
    return this.enviarComando(id, { tipo: 'recargar' });
  }

  // Test de pantalla
  test(id: string): Observable<any> {
    return this.enviarComando(id, { tipo: 'test' });
  }

  // Operaciones en lote
  sincronizarTodas(): Observable<any> {
    return this.http.post(`${this.API_URL}/sincronizar`, {});
  }

  reiniciarTodas(): Observable<any> {
    return this.http.post(`${this.API_URL}/reiniciar`, {});
  }

  // Crear nueva pantalla
  crearPantalla(datos: Partial<RaspberryPiStatus>): Observable<RaspberryPiStatus> {
    return this.http.post<any>(this.API_URL, datos)
      .pipe(map(response => response.data));
  }

  // Actualizar pantalla
  actualizarPantalla(id: string, datos: Partial<RaspberryPiStatus>): Observable<RaspberryPiStatus> {
    return this.http.put<any>(`${this.API_URL}/${id}`, datos)
      .pipe(map(response => response.data));
  }

  // Eliminar pantalla
  eliminarPantalla(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  // Monitoreo de estado en tiempo real
  private iniciarMonitoreo() {
    interval(30000).pipe(
      switchMap(() => this.obtenerPantallas())
    ).subscribe(pantallas => {
      this.pantallasStatus$.next(pantallas);
    });
  }

  obtenerEstadoEnTiempoReal(): Observable<RaspberryPiStatus[]> {
    return this.pantallasStatus$.asObservable();
  }

  // Asignar contenido a pantalla
  asignarContenido(id: string, contenidoId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/asignar-contenido`, {
      contenido_id: contenidoId
    });
  }

  // Asignar campaña a pantalla
  asignarCampana(id: string, campanaId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/asignar-campana`, {
      campana_id: campanaId
    });
  }
}
