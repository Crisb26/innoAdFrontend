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
    gateway: '/api/v1',
    
    // Microservicios (todos a través de Nginx reverse proxy)
    services: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      campaigns: '/api/v1/campaigns',
      contents: '/api/v1/contents',
      screens: '/api/v1/screens',
      analytics: '/api/v1/analytics',
      notifications: '/api/v1/notifications',
      system: '/api/v1/system'
    },
    
    // URLs legacy
    baseUrl: '/api/v1',
    authUrl: '/api/v1/auth',
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

  // ===== CONFIGURACIÓN DE AUTENTICACIÓN =====
  auth: {
    // Tiempos de expiración en desarrollo
    tokenExpiration: 8 * 60 * 60 * 1000, // 8 horas
    refreshTokenExpiration: 30 * 24 * 60 * 60 * 1000, // 30 días
    sessionWarningTime: 15 * 60 * 1000, // 15 minutos antes de expirar
    
    // Configuración de seguridad normal para desarrollo
    autoLogoutOnExpiry: true,
    refreshTokenOnActivity: true,
    maxLoginAttempts: 5,
    lockoutDuration: 10 * 60 * 1000, // 10 minutos
    
    // Configuración de sesiones
    maxConcurrentSessions: 10,
    kickOtherSessions: false,
    trackDeviceFingerprint: false,
    
    // 2FA disabled en desarrollo
    twoFactorEnabled: false,
    backupCodesEnabled: false
  },

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
