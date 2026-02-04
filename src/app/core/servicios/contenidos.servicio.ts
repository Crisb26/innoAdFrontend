import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  Contenido, 
  SolicitudSubirContenido, 
  SolicitudActualizarContenido,
  FiltroContenidos,
  ProgresoSubida,
  ResultadoValidacionContenido,
  RespuestaPaginada,
  RespuestaAPI
} from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioContenidos {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/contenidos`;
  
  obtenerTodos(filtro: FiltroContenidos): Observable<RespuestaPaginada<Contenido>> {
    let params = new HttpParams()
      .set('pagina', filtro.pagina.toString())
      .set('tamaño', filtro.tamaño.toString());
    
    if (filtro.tipo) params = params.set('tipo', filtro.tipo);
    if (filtro.categoria) params = params.set('categoria', filtro.categoria);
    if (filtro.busqueda) params = params.set('busqueda', filtro.busqueda);
    
    return this.http.get<RespuestaAPI<RespuestaPaginada<Contenido>>>(this.API_URL, { params })
      .pipe(map(r => r.datos!));
  }
  
  obtenerPorId(id: string): Observable<Contenido> {
    return this.http.get<RespuestaAPI<Contenido>>(`${this.API_URL}/${id}`)
      .pipe(map(r => r.datos!));
  }
  
  subir(solicitud: SolicitudSubirContenido): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('archivo', solicitud.archivo);
    formData.append('nombre', solicitud.nombre);
    formData.append('descripcion', solicitud.descripcion);
    formData.append('tipo', solicitud.tipo);
    formData.append('etiquetas', JSON.stringify(solicitud.etiquetas));
    
    return this.http.post(`${this.API_URL}/subir`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
  
  actualizar(solicitud: SolicitudActualizarContenido): Observable<Contenido> {
    return this.http.put<RespuestaAPI<Contenido>>(`${this.API_URL}/${solicitud.id}`, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
  
  validar(archivo: File): Observable<ResultadoValidacionContenido> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.http.post<RespuestaAPI<ResultadoValidacionContenido>>(`${this.API_URL}/validar`, formData)
      .pipe(map(r => r.datos!));
  }
}
