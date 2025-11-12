import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

/**
 * Servicio centralizado para gestionar URLs de microservicios
 * 
 * Este servicio actúa como un API Gateway en el frontend,
 * facilitando la futura migración a arquitectura de microservicios.
 * 
 * Beneficios:
 * - Punto único para cambiar URLs de servicios
 * - Facilita testing con mocks
 * - Preparado para service discovery
 * - Soporte para circuit breaker pattern
 */
@Injectable({
  providedIn: 'root'
})
export class ApiGatewayService {
  
  /**
   * Obtiene la URL base del gateway principal
   */
  getGatewayUrl(): string {
    return environment.api?.gateway || environment.api.baseUrl;
  }

  /**
   * Obtiene la URL de un microservicio específico
   * @param serviceName Nombre del microservicio
   * @returns URL completa del servicio
   */
  getServiceUrl(serviceName: keyof typeof environment.api.services): string {
    const serviceUrl = environment.api?.services?.[serviceName];
    
    if (!serviceUrl) {
      console.warn(`⚠️ Servicio "${serviceName}" no configurado, usando gateway por defecto`);
      return this.getGatewayUrl();
    }
    
    return serviceUrl;
  }

  /**
   * Construye la URL completa para un endpoint
   * @param serviceName Nombre del servicio
   * @param endpoint Path del endpoint (ej: '/login', '/users/123')
   * @returns URL completa
   */
  buildUrl(serviceName: keyof typeof environment.api.services, endpoint: string): string {
    const baseUrl = this.getServiceUrl(serviceName);
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Si la URL del servicio ya incluye el endpoint base, no duplicar
    if (baseUrl.endsWith(cleanEndpoint)) {
      return baseUrl;
    }
    
    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * URLs específicas para cada dominio de negocio
   */
  
  // === AUTENTICACIÓN ===
  getAuthUrl(endpoint: string = ''): string {
    return this.buildUrl('auth', endpoint);
  }

  // === USUARIOS ===
  getUsersUrl(endpoint: string = ''): string {
    return this.buildUrl('users', endpoint);
  }

  // === CAMPAÑAS ===
  getCampaignsUrl(endpoint: string = ''): string {
    return this.buildUrl('campaigns', endpoint);
  }

  // === CONTENIDOS ===
  getContentsUrl(endpoint: string = ''): string {
    return this.buildUrl('contents', endpoint);
  }

  // === PANTALLAS ===
  getScreensUrl(endpoint: string = ''): string {
    return this.buildUrl('screens', endpoint);
  }

  // === ANALYTICS ===
  getAnalyticsUrl(endpoint: string = ''): string {
    return this.buildUrl('analytics', endpoint);
  }

  // === NOTIFICACIONES ===
  getNotificationsUrl(endpoint: string = ''): string {
    return this.buildUrl('notifications', endpoint);
  }

  // === SISTEMA ===
  getSystemUrl(endpoint: string = ''): string {
    return this.buildUrl('system', endpoint);
  }

  /**
   * Obtiene la URL de WebSocket
   */
  getWebSocketUrl(): string {
    return environment.api.wsUrl || environment.urlWebSocket;
  }

  /**
   * Verifica si un servicio está configurado
   */
  isServiceConfigured(serviceName: keyof typeof environment.api.services): boolean {
    return !!environment.api?.services?.[serviceName];
  }

  /**
   * Obtiene todos los servicios configurados
   */
  getConfiguredServices(): string[] {
    return Object.keys(environment.api?.services || {});
  }

  /**
   * Para debugging: muestra la configuración actual
   */
  logConfiguration(): void {
    console.group('🔧 Configuración de API Gateway');
    console.log('Gateway Principal:', this.getGatewayUrl());
    console.log('Servicios Configurados:', this.getConfiguredServices());
    console.table(environment.api?.services || {});
    console.groupEnd();
  }
}
