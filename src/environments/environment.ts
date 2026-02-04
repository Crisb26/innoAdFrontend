export const environment = {
  // ===== CONFIGURACIÓN BÁSICA =====
  production: false,
  produccion: false, // Mantener compatibilidad
  nombreApp: 'InnoAd',
  version: '2.0.0',
  
  // ===== CONFIGURACIÓN DE API =====
  // Preparado para migración a microservicios
  api: {
    // Gateway principal (API Gateway para microservicios)
    gateway: 'http://localhost:8080/api',
    
    // Microservicios individuales (para futura migración)
    // Mientras tanto, todas apuntan al gateway
    services: {
      auth: 'http://localhost:8080/api/auth',
      users: 'http://localhost:8080/api/users',
      campaigns: 'http://localhost:8080/api/campaigns',
      contents: 'http://localhost:8080/api/contents',
      screens: 'http://localhost:8080/api/screens',
      analytics: 'http://localhost:8080/api/analytics',
      notifications: 'http://localhost:8080/api/notifications',
      system: 'http://localhost:8080/api/system'
    },
    
    // URLs específicas
    baseUrl: 'http://localhost:8080/api',
    authUrl: 'http://localhost:8080/api/auth',
    uploadUrl: 'http://localhost:8080/api/upload',
    wsUrl: 'ws://localhost:8080/ws',
    
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
    // Tiempos de expiración
    tokenExpiration: 8 * 60 * 60 * 1000, // 8 horas
    refreshTokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7 días
    sessionWarningTime: 10 * 60 * 1000, // 10 minutos antes de expirar
    
    // Configuración de seguridad
    autoLogoutOnExpiry: true,
    refreshTokenOnActivity: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    
    // Configuración de sesiones
    maxConcurrentSessions: 3,
    kickOtherSessions: false,
    trackDeviceFingerprint: true,
    
    // Configuración de 2FA
    twoFactorEnabled: false,
    backupCodesEnabled: false
  },
  
  // ===== CONFIGURACIÓN DE CACHE =====
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxEntries: 100,
    cleanupInterval: 10 * 60 * 1000, // 10 minutos
    strategies: {
      users: 10 * 60 * 1000, // 10 minutos
      campaigns: 3 * 60 * 1000, // 3 minutos
      content: 15 * 60 * 1000, // 15 minutos
      screens: 5 * 60 * 1000, // 5 minutos
      stats: 2 * 60 * 1000 // 2 minutos
    }
  },
  
  // ===== CONFIGURACIÓN DE LOGS =====
  logging: {
    level: 'debug', // 'error', 'warn', 'info', 'debug'
    enableConsole: true,
    enableRemote: true,
    remoteEndpoint: '/api/logs',
    maxLocalLogs: 1000,
    flushInterval: 60000 // 1 minuto
  },
  
  // ===== CONFIGURACIÓN DE NOTIFICACIONES =====
  notifications: {
    enablePush: false,
    enableEmail: true,
    enableInApp: true,
    defaultDuration: 5000, // 5 segundos
    positions: 'top-right',
    maxVisible: 5
  },
  
  // ===== CONFIGURACIÓN DE ARCHIVOS =====
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    chunkSize: 1024 * 1024, // 1MB chunks
    simultaneousUploads: 3
  },
  
  // ===== SERVICIOS EXTERNOS =====
  external: {
    cloudinary: {
      cloudName: 'innoad-cloud',
      uploadPreset: 'innoad-uploads',
      folder: 'dev'
    },
    mapbox: {
      accessToken: 'TU_TOKEN_DE_MAPBOX_AQUI',
      style: 'mapbox://styles/mapbox/dark-v11',
      defaultZoom: 10
    },
    analytics: {
      enabled: false,
      trackingId: '',
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
    sampleRate: 1.0, // 100% en desarrollo
    endpoints: {
      performance: '/api/monitoring/performance',
      errors: '/api/monitoring/errors',
      activity: '/api/monitoring/activity'
    }
  },
  
  // ===== CONFIGURACIÓN DE DESARROLLO =====
  development: {
    enableMocks: false,
    enableDebugTools: true,
    enableReduxDevTools: true,
    mockDelay: 1000,
    debugLevel: 'verbose'
  },
  
  // ===== CONFIGURACIÓN ESPECÍFICA DE INNOAD =====
  innoad: {
    // Configuración de campañas
    campaigns: {
      autoStart: false,
      defaultDuration: 30000, // 30 segundos por contenido
      maxConcurrent: 10,
      enableScheduling: true
    },
    
    // Configuración de pantallas
    screens: {
      heartbeatInterval: 30000, // 30 segundos
      offlineThreshold: 60000, // 1 minuto
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
      maxMessages: 100,
      responseTimeout: 30000,
      retries: 3,
      enableTyping: true,
      enableVoice: false
    }
  },
  
  // ===== CONFIGURACIÓN LEGACY (MANTENER COMPATIBILIDAD) =====
  urlApi: '/api',
  urlWebSocket: '/ws',
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
