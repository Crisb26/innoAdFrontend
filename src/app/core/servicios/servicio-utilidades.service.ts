import { Injectable } from '@angular/core';

/**
 * Servicio auxiliar para utilidades comunes de Angular
 */
@Injectable({
  providedIn: 'root'
})
export class ServicioUtilidades {
  
  /**
   * Compara dos objetos por su propiedad 'id'
   * Usado en selects con ngValue
   */
  compararPorId(obj1: any, obj2: any): boolean {
    if (!obj1 || !obj2) {
      return obj1 === obj2;
    }
    return obj1.id === obj2.id;
  }
  
  /**
   * Convierte un objeto a query string
   */
  objetoAQueryString(obj: any): string {
    return Object.keys(obj)
      .filter(key => obj[key] !== null && obj[key] !== undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  }
  
  /**
   * Pausa la ejecución por un tiempo determinado
   */
  async esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Detecta si el navegador soporta WebSocket
   */
  soportaWebSocket(): boolean {
    return 'WebSocket' in window || 'MozWebSocket' in window;
  }
  
  /**
   * Obtiene la URL base de la API
   */
  obtenerUrlBaseAPI(): string {
    const protocolo = window.location.protocol;
    const host = window.location.host;
    return `${protocolo}//${host}/api`;
  }
  
  /**
   * Obtiene la URL del WebSocket
   */
  obtenerUrlWebSocket(): string {
    const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    return `${protocolo}://${host}/api`;
  }
}
