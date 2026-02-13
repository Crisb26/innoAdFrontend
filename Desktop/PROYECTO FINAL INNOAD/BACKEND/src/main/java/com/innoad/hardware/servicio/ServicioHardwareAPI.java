package com.innoad.hardware.servicio;

import com.innoad.hardware.dto.*;
import com.innoad.hardware.repository.DispositivoRepositorio;
import com.innoad.hardware.repository.ContenidoRepositorio;
import com.innoad.hardware.model.DispositivoIoT;
import com.innoad.modules.contenidos.model.ContenidoRemoto;
import com.innoad.hardware.model.EstadisticasDispositivo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔌 SERVICIO HARDWARE API
 * Gestión de dispositivos IoT, contenido remoto y comandos
 */
@Service
@Slf4j
@Transactional
public class ServicioHardwareAPI {

    @Autowired
    private DispositivoRepositorio dispositivoRepositorio;

    @Autowired
    private ContenidoRepositorio contenidoRepositorio;

    private final String DIRECTORIO_CONTENIDO = "contenido/remoto/";

    // ==================== DISPOSITIVOS ====================

    /**
     * Obtener lista de todos los dispositivos
     */
    public List<DispositivoDTO> obtenerDispositivos() {
        log.info("Obteniendo lista de dispositivos");
        return dispositivoRepositorio.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener dispositivo específico
     */
    public DispositivoDTO obtenerDispositivo(String dispositivoId) {
        log.info("Obteniendo dispositivo: {}", dispositivoId);
        return dispositivoRepositorio.findById(dispositivoId)
                .map(this::convertirADTO)
                .orElseThrow(() -> new RuntimeException("Dispositivo no encontrado: " + dispositivoId));
    }

    /**
     * Registrar nuevo dispositivo
     */
    public DispositivoDTO registrarDispositivo(DispositivoDTO dto) {
        log.info("Registrando nuevo dispositivo: {}", dto.getNombre());

        DispositivoIoT dispositivo = new DispositivoIoT();
        dispositivo.setNombre(dto.getNombre());
        dispositivo.setTipo(dto.getTipo());
        dispositivo.setUbicacion(dto.getUbicacion());
        dispositivo.setIpAddress(dto.getIpAddress());
        dispositivo.setMacAddress(dto.getMacAddress());
        dispositivo.setVersionSoftware(dto.getVersionSoftware());
        dispositivo.setEspecificaciones(dto.getEspecificaciones());
        dispositivo.setEstado("online");
        dispositivo.setUltimaConexion(LocalDateTime.now());

        DispositivoIoT guardado = dispositivoRepositorio.save(dispositivo);
        log.info("Dispositivo registrado con ID: {}", guardado.getId());

        return convertirADTO(guardado);
    }

    /**
     * Actualizar dispositivo
     */
    public DispositivoDTO actualizarDispositivo(String dispositivoId, DispositivoDTO dto) {
        log.info("Actualizando dispositivo: {}", dispositivoId);

        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow(() -> new RuntimeException("Dispositivo no encontrado"));

        if (dto.getNombre() != null) dispositivo.setNombre(dto.getNombre());
        if (dto.getUbicacion() != null) dispositivo.setUbicacion(dto.getUbicacion());
        if (dto.getEspecificaciones() != null) dispositivo.setEspecificaciones(dto.getEspecificaciones());

        DispositivoIoT actualizado = dispositivoRepositorio.save(dispositivo);
        return convertirADTO(actualizado);
    }

    /**
     * Eliminar dispositivo
     */
    public void eliminarDispositivo(String dispositivoId) {
        log.info("Eliminando dispositivo: {}", dispositivoId);
        dispositivoRepositorio.deleteById(dispositivoId);
    }

    /**
     * Actualizar estado de dispositivo
     */
    public void actualizarEstadoDispositivo(String dispositivoId, String estado) {
        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow();

        dispositivo.setEstado(estado);
        dispositivo.setUltimaConexion(LocalDateTime.now());
        dispositivoRepositorio.save(dispositivo);

        log.info("Estado actualizado para {}: {}", dispositivoId, estado);
    }

    /**
     * Actualizar sensores del dispositivo
     */
    public void actualizarSensores(String dispositivoId, SensoresDTO sensores) {
        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow();

        // Actualizar valores de sensores directamente en la entidad
        dispositivo.setTemperatura(sensores.getTemperatura());
        dispositivo.setHumedad(sensores.getHumedad());
        // Nota: presion no está en el modelo DispositivoIoT actual

        dispositivoRepositorio.save(dispositivo);
    }

    // ==================== COMANDOS ====================

    /**
     * Ejecutar comando en dispositivo
     */
    public ComandoDispositivoDTO ejecutarComando(String dispositivoId, ComandoDTO comando) {
        log.info("Ejecutando comando {} en dispositivo: {}", comando.getTipo(), dispositivoId);

        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow();

        ComandoDispositivoDTO respuesta = ComandoDispositivoDTO.builder()
                .dispositivoId(Long.valueOf(dispositivoId))
                .tipo(comando.getTipo())
                .descripcion(comando.getParametros() != null ? comando.getParametros().toString() : "")
                .timestamp(LocalDateTime.now())
                .build();

        // Simular ejecución según tipo de comando
        switch (comando.getTipo().toLowerCase()) {
            case "reproducir":
                respuesta.setRespuesta("Reproduciendo contenido");
                break;
            case "pausar":
                respuesta.setRespuesta("Contenido pausado");
                break;
            case "detener":
                respuesta.setRespuesta("Reproducción detenida");
                break;
            case "reiniciar":
                actualizarEstadoDispositivo(dispositivoId, "reiniciando");
                respuesta.setRespuesta("Dispositivo reiniciando...");
                break;
            case "actualizar":
                actualizarEstadoDispositivo(dispositivoId, "actualizando");
                respuesta.setRespuesta("Iniciando actualización de software");
                break;
            default:
                respuesta.setRespuesta("Comando ejecutado");
        }

        return respuesta;
    }

    /**
     * Reproducir contenido
     */
    public ComandoDispositivoDTO reproducirContenido(String dispositivoId, String contenidoId) {
        log.info("Reproduciendo contenido {} en dispositivo {}", contenidoId, dispositivoId);

        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("reproducir");
        // Parametros como JSON string
        comando.setParametros("{\"contenidoId\":\"" + contenidoId + "\"}");

        return ejecutarComando(dispositivoId, comando);
    }

    /**
     * Pausar dispositivo
     */
    public ComandoDispositivoDTO pausarDispositivo(String dispositivoId) {
        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("pausar");
        return ejecutarComando(dispositivoId, comando);
    }

    /**
     * Detener dispositivo
     */
    public ComandoDispositivoDTO detenerDispositivo(String dispositivoId) {
        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("detener");
        return ejecutarComando(dispositivoId, comando);
    }

    /**
     * Reiniciar dispositivo
     */
    public ComandoDispositivoDTO reiniciarDispositivo(String dispositivoId) {
        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("reiniciar");
        return ejecutarComando(dispositivoId, comando);
    }

    /**
     * Actualizar software
     */
    public ComandoDispositivoDTO actualizarSoftware(String dispositivoId) {
        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("actualizar");
        return ejecutarComando(dispositivoId, comando);
    }

    // ==================== CONTENIDO ====================

    /**
     * Obtener contenido disponible
     */
    public List<ContenidoDTO> obtenerContenido() {
        log.info("Obteniendo lista de contenido");
        return contenidoRepositorio.findAll()
                .stream()
                .map(this::convertirContenidoADTO)
                .collect(Collectors.toList());
    }

    /**
     * Subir nuevo contenido
     */
    public ContenidoDTO subirContenido(MultipartFile archivo, ContenidoDTO metadata) throws IOException {
        log.info("Subiendo contenido: {}", metadata.getTitulo());

        // Crear directorio si no existe
        Path directorio = Paths.get(DIRECTORIO_CONTENIDO);
        Files.createDirectories(directorio);

        // Guardar archivo
        String nombreArchivo = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
        Path rutaArchivo = directorio.resolve(nombreArchivo);
        Files.write(rutaArchivo, archivo.getBytes());

        // Crear registro en BD
        ContenidoRemoto contenido = new ContenidoRemoto();
        contenido.setTitulo(metadata.getTitulo());
        contenido.setDescripcion(metadata.getDescripcion());
        contenido.setTipo(metadata.getTipo());
        contenido.setUrl(rutaArchivo.toString());
        contenido.setTamanio(archivo.getSize());
        contenido.setFechaCreacion(LocalDateTime.now());
        contenido.setEstado("programado");
        contenido.setProgreso(0);

        ContenidoRemoto guardado = contenidoRepositorio.save(contenido);
        log.info("Contenido subido con ID: {}", guardado.getId());

        return convertirContenidoADTO(guardado);
    }

    /**
     * Asignar contenido a dispositivos
     */
    public ContenidoDTO asignarContenidoADispositivos(
            String contenidoId,
            List<String> dispositivoIds,
            Map<String, Object> programacion) {

        log.info("Asignando contenido {} a {} dispositivos", contenidoId, dispositivoIds.size());

        ContenidoRemoto contenido = contenidoRepositorio.findById(contenidoId)
                .orElseThrow();

        // Convertir List<String> a List<Long> para setDispositivos
        List<Long> dispositivoIdsLong = dispositivoIds.stream()
                .map(Long::parseLong)
                .collect(Collectors.toList());
        
        contenido.setDispositivos(dispositivoIdsLong);
        if (programacion != null && !programacion.isEmpty()) {
            contenido.setProgramacion(programacion);
        }
        contenido.setEstado("en_ejecucion");

        ContenidoRemoto actualizado = contenidoRepositorio.save(contenido);
        return convertirContenidoADTO(actualizado);
    }

    /**
     * Actualizar progreso de contenido
     */
    public void actualizarProgresoContenido(String contenidoId, int progreso) {
        ContenidoRemoto contenido = contenidoRepositorio.findById(contenidoId)
                .orElseThrow();

        contenido.setProgreso(Math.min(progreso, 100));

        if (progreso >= 100) {
            contenido.setEstado("completado");
        }

        contenidoRepositorio.save(contenido);
    }

    /**
     * Eliminar contenido
     */
    public void eliminarContenido(String contenidoId) throws IOException {
        log.info("Eliminando contenido: {}", contenidoId);

        ContenidoRemoto contenido = contenidoRepositorio.findById(contenidoId)
                .orElseThrow();

        // Eliminar archivo
        Files.deleteIfExists(Paths.get(contenido.getUrl()));

        // Eliminar registro
        contenidoRepositorio.deleteById(contenidoId);
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * Obtener estadísticas de dispositivo
     */
    public EstadisticasDispositivoDTO obtenerEstadisticas(String dispositivoId) {
        log.info("Obteniendo estadísticas de: {}", dispositivoId);

        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow();

        EstadisticasDispositivoDTO stats = new EstadisticasDispositivoDTO();
        stats.setDispositivoId(Long.valueOf(dispositivoId));

        // Simular métricas
        stats.setTiempoActividad(generateRandomInt(24, 168)); // 1-7 días
        stats.setConfiabilidad(generateRandomInt(95, 100));
        stats.setComandosEjecutados(generateRandomInt(50, 500));
        stats.setAnchoDeBanda(generateRandomDouble(50, 100));
        stats.setUsoCPU(generateRandomInt(10, 80));
        stats.setUsoMemoria(generateRandomInt(30, 90));
        stats.setTemperatura(generateRandomDouble(35, 65));

        return stats;
    }

    /**
     * Test de conexión
     */
    public TestConexionDTO testConexion(String dispositivoId) {
        log.info("Ejecutando test de conexión para: {}", dispositivoId);

        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow();

        TestConexionDTO resultado = new TestConexionDTO();

        if ("online".equals(dispositivo.getEstado())) {
            resultado.setConectado(true);
            resultado.setLatencia(generateRandomInt(10, 100));
            resultado.setMensajes(Arrays.asList(
                    "Ping exitoso",
                    "Dispositivo respondiendo",
                    "Conexión estable"
            ));
        } else {
            resultado.setConectado(false);
            resultado.setMensajes(Arrays.asList("Dispositivo no responde"));
        }

        return resultado;
    }

    /**
     * Sincronización de dispositivo
     */
    public SincronizacionDTO sincronizar(String dispositivoId) {
        log.info("Sincronizando dispositivo: {}", dispositivoId);

        DispositivoIoT dispositivo = dispositivoRepositorio.findById(dispositivoId)
                .orElseThrow();

        // Marcar como sincronizado
        dispositivo.setUltimaConexion(LocalDateTime.now());
        dispositivoRepositorio.save(dispositivo);

        SincronizacionDTO resultado = new SincronizacionDTO();
        resultado.setMensaje("Sincronización completada");
        resultado.setTimestamp(LocalDateTime.now());

        return resultado;
    }

    // ==================== HELPERS ====================

    /**
     * Convertir entidad a DTO
     */
    private DispositivoDTO convertirADTO(DispositivoIoT dispositivo) {
        DispositivoDTO dto = new DispositivoDTO();
        dto.setId(dispositivo.getId());
        dto.setNombre(dispositivo.getNombre());
        dto.setTipo(dispositivo.getTipo());
        dto.setEstado(dispositivo.getEstado());
        dto.setUbicacion(dispositivo.getUbicacion());
        dto.setIpAddress(dispositivo.getIpAddress());
        dto.setMacAddress(dispositivo.getMacAddress());
        dto.setUltimaConexion(dispositivo.getUltimaConexion());
        dto.setVersionSoftware(dispositivo.getVersionSoftware());
        dto.setEspecificaciones(dispositivo.getEspecificaciones());
        dto.setSensores(dispositivo.getSensores());
        return dto;
    }

    /**
     * Convertir contenido a DTO
     */
    private ContenidoDTO convertirContenidoADTO(ContenidoRemoto contenido) {
        ContenidoDTO dto = new ContenidoDTO();
        dto.setId(contenido.getId());
        dto.setTitulo(contenido.getTitulo());
        dto.setDescripcion(contenido.getDescripcion());
        dto.setTipo(contenido.getTipo());
        dto.setUrl(contenido.getUrl());
        dto.setTamanio(contenido.getTamanio());
        dto.setFechaCreacion(contenido.getFechaCreacion());
        dto.setDispositivos(contenido.getDispositivos());
        dto.setEstado(contenido.getEstado());
        dto.setProgreso(contenido.getProgreso());
        return dto;
    }

    private int generateRandomInt(int min, int max) {
        return new Random().nextInt((max - min) + 1) + min;
    }

    private double generateRandomDouble(double min, double max) {
        return Math.round((Math.random() * (max - min) + min) * 100.0) / 100.0;
    }
}
