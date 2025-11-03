export const environment = {
  produccion: false,
  nombreApp: 'InnoAd',
  version: '2.0.0',
  urlApi: 'http://localhost:8080/api/v1',
  urlWebSocket: 'ws://localhost:8080/ws',
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
