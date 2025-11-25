export const environment = {
  // ===== CONFIGURACIÓN BÁSICA =====
  production: true,
  produccion: true, // Mantener compatibilidad
  nombreApp: 'InnoAd',
  version: '2.0.0',
  
  // ===== CONFIGURACIÓN DE API =====
  // IMPORTANTE: Actualizar estas URLs con la URL de Railway después del despliegue
  // Ejemplo: https://innoad-backend-production.up.railway.app
  api: {
    // Gateway principal - ACTUALIZAR CON URL DE RAILWAY
    gateway: 'https://innoad-backend-production.up.railway.app/api',
    
    // Microservicios individuales
    services: {
      auth: 'https://innoad-backend-production.up.railway.app/api/auth',
      users: 'https://innoad-backend-production.up.railway.app/api/users',
      campaigns: 'https://innoad-backend-production.up.railway.app/api/campaigns',
      contents: 'https://innoad-backend-production.up.railway.app/api/contents',
      screens: 'https://innoad-backend-production.up.railway.app/api/screens',
      analytics: 'https://innoad-backend-production.up.railway.app/api/analytics',
      notifications: 'https://innoad-backend-production.up.railway.app/api/notifications',
      system: 'https://innoad-backend-production.up.railway.app/api/system'
    },
    
    // URLs base para producción
    baseUrl: 'https://innoad-backend-production.up.railway.app/api',
    authUrl: 'https://innoad-backend-production.up.railway.app/api/auth',
    uploadUrl: 'https://innoad-backend-production.up.railway.app/api/upload',
    wsUrl: 'wss://innoad-backend-production.up.railway.app/ws',
    
    // Configuración de timeout y reintentos
    timeout: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    
    // Headers personalizados
    customHeaders: {
      'X-App-Version': '2.0.0',
      'X-Client-Type': 'web',
      'X-Platform': 'angular'
    }
  },
  
  // ===== CONFIGURACIÓN DE AUTENTICACIÓN =====
  auth: {
    // Tiempos de expiración en producción
    tokenExpiration: 8 * 60 * 60 * 1000, // 8 horas
    refreshTokenExpiration: 30 * 24 * 60 * 60 * 1000, // 30 días
    sessionWarningTime: 15 * 60 * 1000, // 15 minutos antes de expirar
    
    // Configuración de seguridad más estricta
    autoLogoutOnExpiry: true,
    refreshTokenOnActivity: true,
    maxLoginAttempts: 3, // Más restrictivo en producción
    lockoutDuration: 30 * 60 * 1000, // 30 minutos
    
    // Configuración de sesiones
    maxConcurrentSessions: 2, // Menos sesiones en producción
    kickOtherSessions: true,
    trackDeviceFingerprint: true,
    
    // Configuración de 2FA habilitada en producción
    twoFactorEnabled: true,
    backupCodesEnabled: true
  },
  
  // ===== CONFIGURACIÓN DE CACHE =====
  cache: {
    defaultTTL: 15 * 60 * 1000, // 15 minutos (más tiempo en prod)
    maxEntries: 200,
    cleanupInterval: 30 * 60 * 1000, // 30 minutos
    strategies: {
      users: 30 * 60 * 1000, // 30 minutos
      campaigns: 10 * 60 * 1000, // 10 minutos
      content: 60 * 60 * 1000, // 1 hora
      screens: 15 * 60 * 1000, // 15 minutos
      stats: 5 * 60 * 1000 // 5 minutos
    }
  },
  
  // ===== CONFIGURACIÓN DE LOGS =====
  logging: {
    level: 'warn', // Solo warnings y errores en producción
    enableConsole: false, // Deshabilitado en producción
    enableRemote: true,
    remoteEndpoint: 'https://api.innoad.com/api/logs',
    maxLocalLogs: 500,
    flushInterval: 30000 // 30 segundos
  },
  
  // ===== CONFIGURACIÓN DE NOTIFICACIONES =====
  notifications: {
    enablePush: true,
    enableEmail: true,
    enableInApp: true,
    defaultDuration: 7000, // 7 segundos
    positions: 'top-right',
    maxVisible: 3
  },
  
  // ===== CONFIGURACIÓN DE ARCHIVOS =====
  uploads: {
    maxFileSize: 50 * 1024 * 1024, // 50MB en producción
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
    simultaneousUploads: 2
  },
  
  // ===== SERVICIOS EXTERNOS =====
  external: {
    cloudinary: {
      cloudName: 'innoad-cloud',
      uploadPreset: 'innoad-uploads-prod',
      folder: 'production'
    },
    mapbox: {
      accessToken: 'pk.eyJ1IjoiaW5ub2FkIiwiYSI6ImNsemE0ZjVoNzBmem4yanF4cXV5a2J6N3cifQ.TOKEN_REAL_AQUI',
      style: 'mapbox://styles/mapbox/dark-v11',
      defaultZoom: 10
    },
    analytics: {
      enabled: true,
      trackingId: 'GA-XXXXXXXXX',
      anonymizeIp: true
    }
  },
  
  // ===== CONFIGURACIÓN DE UI =====
  ui: {
    theme: 'cyberpunk',
    animations: true,
    darkMode: true,
    sidebarCollapsed: false,
    pagination: {
      defaultSize: 20,
      sizeOptions: [10, 20, 50, 100]
    },
    tables: {
      defaultSort: 'desc',
      stickyHeaders: true,
      virtualScroll: true
    }
  },
  
  // ===== CONFIGURACIÓN DE MONITOREO =====
  monitoring: {
    enablePerformance: true,
    enableErrorTracking: true,
    enableUserActivity: true,
    sampleRate: 0.1, // 10% en producción
    endpoints: {
      performance: 'https://api.innoad.com/api/monitoring/performance',
      errors: 'https://api.innoad.com/api/monitoring/errors',
      activity: 'https://api.innoad.com/api/monitoring/activity'
    }
  },
  
  // ===== CONFIGURACIÓN DE DESARROLLO =====
  development: {
    enableMocks: false,
    enableDebugTools: false,
    enableReduxDevTools: false,
    mockDelay: 0,
    debugLevel: 'error'
  },
  
  // ===== CONFIGURACIÓN ESPECÍFICA DE INNOAD =====
  innoad: {
    // Configuración de campañas
    campaigns: {
      autoStart: true,
      defaultDuration: 30000, // 30 segundos por contenido
      maxConcurrent: 50, // Más campañas concurrentes en prod
      enableScheduling: true
    },
    
    // Configuración de pantallas
    screens: {
      heartbeatInterval: 15000, // 15 segundos (más frecuente)
      offlineThreshold: 30000, // 30 segundos
      enableRemoteControl: true,
      autoReconnect: true
    },
    
    // Configuración de contenidos
    content: {
      enablePreview: true,
      thumbnailSize: 150,
      enableVersioning: true,
      autoOptimize: true
    },
    
    // Configuración de chat IA
    chat: {
      maxMessages: 50, // Menos mensajes en producción
      responseTimeout: 20000, // Más rápido
      retries: 2,
      enableTyping: true,
      enableVoice: true
    }
  },
  
  // ===== CONFIGURACIÓN LEGACY (MANTENER COMPATIBILIDAD) =====
  urlApi: 'https://api.innoad.com/api',
  urlWebSocket: 'wss://api.innoad.com/ws',
  tiempoExpiracionToken: 3600000,
  tiempoActualizacionDatos: 30000,
  paginacionPorDefecto: 10,
  tamañoMaximoArchivo: 52428800, // 50MB
  formatosImagenPermitidos: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  formatosVideoPermitidos: ['video/mp4', 'video/webm', 'video/ogg'],
  cloudinary: {
    cloudName: 'innoad-cloud',
    uploadPreset: 'innoad-uploads-prod'
  },
  mapbox: {
    accessToken: 'pk.eyJ1IjoiaW5ub2FkIiwiYSI6ImNsemE0ZjVoNzBmem4yanF4cXV5a2J6N3cifQ.TOKEN_REAL_AQUI',
    estiloMapa: 'mapbox://styles/mapbox/dark-v11'
  },
  configuracionChat: {
    mensajesMaximos: 50,
    tiempoEsperaRespuesta: 20000,
    reintentos: 2
  }
};
