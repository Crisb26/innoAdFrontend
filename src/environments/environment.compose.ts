export const environment = {
  production: true,
  // Conservamos compatibilidad con código que lea 'produccion'
  produccion: true,

  nombreApp: 'InnoAd',
  version: '2.0.0',

  // ===== CONFIGURACIÓN PARA DOCKER COMPOSE =====
  // Nginx actúa como reverse proxy hacia los servicios del backend
  // Preparado para múltiples servicios backend
  api: {
    // Gateway principal (Nginx hace proxy a los servicios)
    gateway: '/api',
    
    // Microservicios (todos a través de Nginx reverse proxy)
    services: {
      auth: '/api/auth',
      users: '/api/users',
      campaigns: '/api/campaigns',
      contents: '/api/contents',
      screens: '/api/screens',
      analytics: '/api/analytics',
      notifications: '/api/notifications',
      system: '/api/system'
    },
    
    // URLs legacy
    baseUrl: '/api',
    authUrl: '/api/auth',
    uploadUrl: '/api/upload',
    wsUrl: '/ws',
    
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    
    customHeaders: {
      'X-App-Version': '2.0.0',
      'X-Client-Type': 'web',
      'X-Platform': 'angular'
    }
  },

  // Compose usa Nginx como reverse proxy al backend (service name: backend)
  // Por eso las URLs son relativas al mismo dominio
  urlApi: '/api',
  urlWebSocket: '/ws',

  // ===== CONFIGURACIÓN DE AUTENTICACIÓN OFFLINE (Compose / local deploy)
  offlineAuth: {
    enabled: true,
    users: [
      { nombreUsuario: 'admin', email: 'admin@local', contrasena: 'admin123', rol: 'Administrador', nombreCompleto: 'Administrador Local' },
      { nombreUsuario: 'usuario', email: 'user@local', contrasena: 'user123', rol: 'Usuario', nombreCompleto: 'Usuario Local' }
    ]
  },

  // Resto de opciones tal cual prod
  tiempoExpiracionToken: 3600000,
  tiempoActualizacionDatos: 30000,
  paginacionPorDefecto: 10,
  tamañoMaximoArchivo: 10485760,
  formatosImagenPermitidos: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  formatosVideoPermitidos: ['video/mp4', 'video/webm', 'video/ogg'],
  cloudinary: {
    cloudName: 'innoad-cloud',
    uploadPreset: 'innoad-uploads'
  },
  mapbox: {
    accessToken: 'TU_TOKEN_DE_MAPBOX_AQUI',
    estiloMapa: 'mapbox://styles/mapbox/dark-v11'
  },
  configuracionChat: {
    mensajesMaximos: 100,
    tiempoEsperaRespuesta: 30000,
    reintentos: 3
  }
};
