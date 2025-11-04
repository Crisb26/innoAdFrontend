export const environment = {
  // Convención Angular estándar
  production: false,
  // Conservamos la clave previa por compatibilidad (no usada directamente)
  produccion: false,

  // Identidad de la app
  nombreApp: 'InnoAd',
  version: '2.0.0',

  // Backend DEV (usar rutas relativas para que el proxy funcione)
  urlApi: '/api/v1',
  urlWebSocket: '/ws', // si no se usa, se deja sin consumir

  // Otros ajustes existentes (no impactan autenticación)
  tiempoExpiracionToken: 3600000, // 1 hora en milisegundos
  tiempoActualizacionDatos: 30000, // 30 segundos
  paginacionPorDefecto: 10,
  tamañoMaximoArchivo: 10485760, // 10MB en bytes
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
