export const environment = {
  // ===== CONFIGURACIÓN BÁSICA =====
  production: true,
  produccion: true, // Mantener compatibilidad
  nombreApp: 'InnoAd',
  version: '2.0.0',
  
  // ===== CONFIGURACIÓN DE API =====
  // URLs apuntan al backend en AZURE (plan de emergencia)
  api: {
    // Gateway principal (mismo host para todo)
    gateway: 'https://TU_AZURE_BACKEND_URL/api',

    // Microservicios individuales
    services: {
      auth: 'https://TU_AZURE_BACKEND_URL/api/auth',
      users: 'https://TU_AZURE_BACKEND_URL/api/users',
      campaigns: 'https://TU_AZURE_BACKEND_URL/api/campaigns',
      contents: 'https://TU_AZURE_BACKEND_URL/api/contents',
      screens: 'https://TU_AZURE_BACKEND_URL/api/screens',
      analytics: 'https://TU_AZURE_BACKEND_URL/api/analytics',
      notifications: 'https://TU_AZURE_BACKEND_URL/api/notifications',
      system: 'https://TU_AZURE_BACKEND_URL/api/system'
    },

    // URLs base para producción
    baseUrl: 'https://TU_AZURE_BACKEND_URL/api',
    authUrl: 'https://TU_AZURE_BACKEND_URL/api/auth',
    uploadUrl: 'https://TU_AZURE_BACKEND_URL/api/upload',
    wsUrl: 'wss://TU_AZURE_BACKEND_URL/ws',
    
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
  // Disable offline auth in production by default
  offlineAuth: {
    enabled: false,
    users: []
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
    remoteEndpoint: 'https://TU_AZURE_BACKEND_URL/api/logs',
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
      performance: 'https://TU_AZURE_BACKEND_URL/api/monitoring/performance',
      errors: 'https://TU_AZURE_BACKEND_URL/api/monitoring/errors',
      activity: 'https://TU_AZURE_BACKEND_URL/api/monitoring/activity'
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
  urlApi: 'https://TU_AZURE_BACKEND_URL/api',
  urlWebSocket: 'wss://TU_AZURE_BACKEND_URL/ws',
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
