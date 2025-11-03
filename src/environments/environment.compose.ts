export const environment = {
  production: true,
  // Conservamos compatibilidad con código que lea 'produccion'
  produccion: true,

  nombreApp: 'InnoAd',
  version: '2.0.0',

  // Compose usa Nginx como reverse proxy al backend (service name: backend)
  // Por eso las URLs son relativas al mismo dominio
  urlApi: '/api/v1',
  urlWebSocket: '/ws',

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
