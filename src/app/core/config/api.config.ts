/**
 * Configuración central de la API y endpoints
 */
export interface ApiConfig {
  baseUrl: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ApiEndpoints {
  // Autenticación
  auth: {
    login: string;
    register: string;
    refresh: string;
    logout: string;
    profile: string;
    resetPassword: string;
    confirmReset: string;
    changePassword: string;
  };

  // Usuarios
  users: {
    base: string;
    byId: (id: string) => string;
    list: string;
    get: string;
    create: string;
    update: string;
    delete: string;
    search: string;
    roles: string;
    permissions: string;
    bulk: string;
    export: string;
    import: string;
    invite: string;
    stats: string;
  };

  // Campañas
  campaigns: {
    base: string;
    byId: (id: string) => string;
    templates: string;
    clone: (id: string) => string;
    activate: (id: string) => string;
    deactivate: (id: string) => string;
    stats: (id: string) => string;
    schedule: (id: string) => string;
  };

  // Contenidos
  contents: {
    base: string;
    byId: (id: string) => string;
    upload: string;
    bulk: string;
    categories: string;
    tags: string;
    search: string;
    approve: (id: string) => string;
    versions: (id: string) => string;
  };

  // Pantallas
  screens: {
    base: string;
    byId: (id: string) => string;
    zones: string;
    status: string;
    assign: (id: string) => string;
    schedule: (id: string) => string;
    health: (id: string) => string;
  };

  // Estadísticas y Reportes
  analytics: {
    dashboard: string;
    campaigns: string;
    screens: string;
    users: string;
    realtime: string;
    export: string;
    custom: string;
  };

  // Sistema
  system: {
    health: string;
    logs: string;
    audit: string;
    notifications: string;
    settings: string;
    backup: string;
    maintenance: string;
  };

  // WebSocket endpoints
  websocket: {
    notifications: string;
    analytics: string;
    screens: string;
    chat: string;
  };
}

// Configuración por defecto
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api',
  version: 'v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Endpoints de la API
export const API_ENDPOINTS: ApiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register', 
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile',
    resetPassword: '/auth/recuperar-contrasena',
    confirmReset: '/auth/restablecer-contrasena',
    changePassword: '/auth/change-password'
  },

  users: {
    base: '/users',
    list: '/users',
    get: '/users',
    create: '/users',
    update: '/users',
    delete: '/users',
    byId: (id: string) => `/users/${id}`,
    search: '/users/search',
    roles: '/users/roles',
    permissions: '/users/permissions',
    bulk: '/users/bulk',
    export: '/users/export',
    import: '/users/import',
    invite: '/users/invite',
    stats: '/users/stats'
  },

  campaigns: {
    base: '/campaigns',
    byId: (id: string) => `/campaigns/${id}`,
    templates: '/campaigns/templates',
    clone: (id: string) => `/campaigns/${id}/clone`,
    activate: (id: string) => `/campaigns/${id}/activate`,
    deactivate: (id: string) => `/campaigns/${id}/deactivate`,
    stats: (id: string) => `/campaigns/${id}/stats`,
    schedule: (id: string) => `/campaigns/${id}/schedule`
  },

  contents: {
    base: '/contents',
    byId: (id: string) => `/contents/${id}`,
    upload: '/contents/upload',
    bulk: '/contents/bulk',
    categories: '/contents/categories',
    tags: '/contents/tags',
    search: '/contents/search',
    approve: (id: string) => `/contents/${id}/approve`,
    versions: (id: string) => `/contents/${id}/versions`
  },

  screens: {
    base: '/screens',
    byId: (id: string) => `/screens/${id}`,
    zones: '/screens/zones',
    status: '/screens/status',
    assign: (id: string) => `/screens/${id}/assign`,
    schedule: (id: string) => `/screens/${id}/schedule`,
    health: (id: string) => `/screens/${id}/health`
  },

  analytics: {
    dashboard: '/analytics/dashboard',
    campaigns: '/analytics/campaigns',
    screens: '/analytics/screens', 
    users: '/analytics/users',
    realtime: '/analytics/realtime',
    export: '/analytics/export',
    custom: '/analytics/custom'
  },

  system: {
    health: '/system/health',
    logs: '/system/logs',
    audit: '/system/audit',
    notifications: '/system/notifications',
    settings: '/system/settings',
    backup: '/system/backup',
    maintenance: '/system/maintenance'
  },

  websocket: {
    notifications: '/ws/notifications',
    analytics: '/ws/analytics',
    screens: '/ws/screens',
    chat: '/ws/chat'
  }
};

// Códigos de respuesta HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Headers personalizados
export const CUSTOM_HEADERS = {
  API_VERSION: 'X-API-Version',
  REQUEST_ID: 'X-Request-ID',
  CLIENT_VERSION: 'X-Client-Version',
  CORRELATION_ID: 'X-Correlation-ID'
} as const;