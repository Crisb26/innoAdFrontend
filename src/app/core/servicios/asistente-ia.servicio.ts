import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { RespuestaAPI } from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioAsistenteIA {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/agente-ia`;
  private historialMensajes: string[] = [];

  inicializar(): void {
    console.log('InnoIA inicializado y listo');
  }

  enviarMensaje(mensaje: string): Observable<string> {
    this.historialMensajes.push(mensaje);

    return this.http.post<RespuestaAPI<any>>(`${this.API_URL}/consulta`, {
      mensaje,
      contexto: {
        historial: this.historialMensajes.slice(-5)
      }
    }).pipe(
      map(respuesta => {
        if (respuesta.exitoso && respuesta.datos) {
          return respuesta.datos.respuesta || respuesta.datos.mensaje || 'Entendido, ¿en qué más puedo ayudarte?';
        }
        return 'Entendido, ¿en qué más puedo ayudarte?';
      }),
      catchError(() => {
        return this.obtenerRespuestaLocal(mensaje);
      })
    );
  }

  private obtenerRespuestaLocal(mensaje: string): Observable<string> {
    const mensajeLower = mensaje.toLowerCase();
    let respuesta = '';

    if (mensajeLower.includes('campaña') || mensajeLower.includes('campana')) {
      respuesta = 'Para crear una campaña, ve al menú Campañas y haz clic en "Nueva Campaña". Necesitarás definir nombre, presupuesto, fechas y seleccionar las pantallas donde se mostrará tu contenido.';
    } else if (mensajeLower.includes('contenido') || mensajeLower.includes('subir')) {
      respuesta = 'Puedes subir contenido desde el módulo de Contenidos. Soportamos imágenes (JPG, PNG), videos (MP4, AVI) y documentos PDF. El tamaño máximo es de 10MB por archivo.';
    } else if (mensajeLower.includes('pantalla') || mensajeLower.includes('dispositivo')) {
      respuesta = 'Las pantallas se gestionan desde el módulo de Pantallas. Puedes ver el estado en tiempo real, asignar contenido, programar horarios y monitorear métricas de rendimiento.';
    } else if (mensajeLower.includes('estadística') || mensajeLower.includes('estadistica') || mensajeLower.includes('reporte')) {
      respuesta = 'En el módulo de Reportes encontrarás estadísticas detalladas sobre impresiones, alcance, rendimiento por campaña y métricas de engagement. Los datos se actualizan en tiempo real.';
    } else if (mensajeLower.includes('optimiz') || mensajeLower.includes('mejorar')) {
      respuesta = 'Tips de optimización: 1) Programa tus anuncios en horarios pico. 2) Usa contenido visual atractivo y de alta calidad. 3) Rota tus creatividades regularmente. 4) Analiza las métricas semanalmente. 5) Ajusta tu estrategia basándote en los datos.';
    } else if (mensajeLower.includes('ayuda') || mensajeLower.includes('hola') || mensajeLower.includes('gracias')) {
      respuesta = 'Estoy aquí para ayudarte con InnoAd. Puedo asistirte con campañas, contenidos, pantallas, estadísticas y optimización. ¿Qué necesitas?';
    } else if (mensajeLower.includes('horario') || mensajeLower.includes('programar')) {
      respuesta = 'Puedes programar horarios específicos para cada campaña. Ve a Campañas, selecciona una campaña existente o crea una nueva, y en la sección de "Programación" podrás definir días y horas exactas de emisión.';
    } else if (mensajeLower.includes('usuario') || mensajeLower.includes('perfil')) {
      respuesta = 'Puedes gestionar tu perfil desde el menú superior derecho. Allí podrás actualizar tu información, cambiar contraseña, configurar notificaciones y ver tu actividad reciente.';
    } else {
      respuesta = 'Entiendo tu consulta. ¿Puedes darme más detalles? Puedo ayudarte con: creación de campañas, gestión de contenidos, configuración de pantallas, análisis de estadísticas y optimización de resultados.';
    }

    return of(respuesta).pipe(delay(800));
  }

  limpiarHistorial(): void {
    this.historialMensajes = [];
  }
}
