package com.innoad.hardware.controlador;

import com.innoad.hardware.dto.*;
import com.innoad.hardware.servicio.ServicioHardwareAPI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 🔌 CONTROLADOR HARDWARE API
 * Endpoints REST para gestión de dispositivos IoT
 */
@RestController
@RequestMapping("/api/hardware")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ControladorHardwareAPI {

    @Autowired
    private ServicioHardwareAPI servicio;

    // ==================== DISPOSITIVOS ====================

    /**
     * GET: Obtener lista de dispositivos
     * @return Lista de todos los dispositivos registrados
     */
    @GetMapping("/dispositivos")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> obtenerDispositivos() {
        try {
            log.info("GET /api/hardware/dispositivos");
            List<DispositivoDTO> dispositivos = servicio.obtenerDispositivos();
            return ResponseEntity.ok(dispositivos);
        } catch (Exception e) {
            log.error("Error al obtener dispositivos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener dispositivos"));
        }
    }

    /**
     * GET: Obtener dispositivo específico
     * @param dispositivoId ID del dispositivo
     * @return Detalles del dispositivo
     */
    @GetMapping("/dispositivos/{dispositivoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> obtenerDispositivo(@PathVariable String dispositivoId) {
        try {
            log.info("GET /api/hardware/dispositivos/{}", dispositivoId);
            DispositivoDTO dispositivo = servicio.obtenerDispositivo(dispositivoId);
            return ResponseEntity.ok(dispositivo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dispositivo no encontrado"));
        }
    }

    /**
     * POST: Registrar nuevo dispositivo
     * @param dispositivo Datos del dispositivo
     * @return Dispositivo registrado
     */
    @PostMapping("/dispositivos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registrarDispositivo(@RequestBody DispositivoDTO dispositivo) {
        try {
            log.info("POST /api/hardware/dispositivos - Nuevo: {}", dispositivo.getNombre());
            DispositivoDTO registrado = servicio.registrarDispositivo(dispositivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(registrado);
        } catch (Exception e) {
            log.error("Error al registrar dispositivo", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al registrar dispositivo"));
        }
    }

    /**
     * PUT: Actualizar dispositivo
     * @param dispositivoId ID del dispositivo
     * @param dispositivo Datos a actualizar
     * @return Dispositivo actualizado
     */
    @PutMapping("/dispositivos/{dispositivoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarDispositivo(
            @PathVariable String dispositivoId,
            @RequestBody DispositivoDTO dispositivo) {
        try {
            log.info("PUT /api/hardware/dispositivos/{}", dispositivoId);
            DispositivoDTO actualizado = servicio.actualizarDispositivo(dispositivoId, dispositivo);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dispositivo no encontrado"));
        }
    }

    /**
     * DELETE: Eliminar dispositivo
     * @param dispositivoId ID del dispositivo
     * @return Confirmación
     */
    @DeleteMapping("/dispositivos/{dispositivoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarDispositivo(@PathVariable String dispositivoId) {
        try {
            log.info("DELETE /api/hardware/dispositivos/{}", dispositivoId);
            servicio.eliminarDispositivo(dispositivoId);
            return ResponseEntity.ok(Map.of("mensaje", "Dispositivo eliminado"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dispositivo no encontrado"));
        }
    }

    // ==================== COMANDOS ====================

    /**
     * POST: Ejecutar comando en dispositivo
     * @param dispositivoId ID del dispositivo
     * @param comando Comando a ejecutar
     * @return Respuesta del comando
     */
    @PostMapping("/dispositivos/{dispositivoId}/comando")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> ejecutarComando(
            @PathVariable String dispositivoId,
            @RequestBody ComandoDTO comando) {
        try {
            log.info("POST /api/hardware/dispositivos/{}/comando - Tipo: {}", dispositivoId, comando.getTipo());
            ComandoDispositivoDTO resultado = servicio.ejecutarComando(dispositivoId, comando);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Error al ejecutar comando", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al ejecutar comando"));
        }
    }

    /**
     * POST: Reproducir contenido en dispositivo
     * @param dispositivoId ID del dispositivo
     * @param payload {contenidoId: string}
     * @return Comando ejecutado
     */
    @PostMapping("/dispositivos/{dispositivoId}/reproducir")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> reproducir(
            @PathVariable String dispositivoId,
            @RequestBody Map<String, String> payload) {
        try {
            String contenidoId = payload.get("contenidoId");
            log.info("POST /api/hardware/dispositivos/{}/reproducir - Contenido: {}", dispositivoId, contenidoId);
            ComandoDispositivoDTO resultado = servicio.reproducirContenido(dispositivoId, contenidoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al reproducir"));
        }
    }

    /**
     * POST: Pausar dispositivo
     * @param dispositivoId ID del dispositivo
     * @return Comando ejecutado
     */
    @PostMapping("/dispositivos/{dispositivoId}/pausar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> pausar(@PathVariable String dispositivoId) {
        try {
            log.info("POST /api/hardware/dispositivos/{}/pausar", dispositivoId);
            ComandoDispositivoDTO resultado = servicio.pausarDispositivo(dispositivoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al pausar"));
        }
    }

    /**
     * POST: Detener dispositivo
     * @param dispositivoId ID del dispositivo
     * @return Comando ejecutado
     */
    @PostMapping("/dispositivos/{dispositivoId}/detener")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> detener(@PathVariable String dispositivoId) {
        try {
            log.info("POST /api/hardware/dispositivos/{}/detener", dispositivoId);
            ComandoDispositivoDTO resultado = servicio.detenerDispositivo(dispositivoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al detener"));
        }
    }

    /**
     * POST: Reiniciar dispositivo
     * @param dispositivoId ID del dispositivo
     * @return Comando ejecutado
     */
    @PostMapping("/dispositivos/{dispositivoId}/reiniciar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reiniciar(@PathVariable String dispositivoId) {
        try {
            log.info("POST /api/hardware/dispositivos/{}/reiniciar", dispositivoId);
            ComandoDispositivoDTO resultado = servicio.reiniciarDispositivo(dispositivoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al reiniciar"));
        }
    }

    /**
     * POST: Actualizar software
     * @param dispositivoId ID del dispositivo
     * @return Comando ejecutado
     */
    @PostMapping("/dispositivos/{dispositivoId}/actualizar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarSoftware(@PathVariable String dispositivoId) {
        try {
            log.info("POST /api/hardware/dispositivos/{}/actualizar", dispositivoId);
            ComandoDispositivoDTO resultado = servicio.actualizarSoftware(dispositivoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al actualizar"));
        }
    }

    // ==================== CONTENIDO ====================

    /**
     * GET: Obtener contenido disponible
     * @return Lista de contenido
     */
    @GetMapping("/contenido")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> obtenerContenido() {
        try {
            log.info("GET /api/hardware/contenido");
            List<ContenidoDTO> contenido = servicio.obtenerContenido();
            return ResponseEntity.ok(contenido);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener contenido"));
        }
    }

    /**
     * POST: Subir nuevo contenido
     * @param archivo Archivo a subir
     * @param titulo Título del contenido
     * @param descripcion Descripción del contenido
     * @param tipo Tipo (video/imagen/audio/presentacion)
     * @return Contenido subido
     */
    @PostMapping("/contenido")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> subirContenido(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("tipo") String tipo) {
        try {
            log.info("POST /api/hardware/contenido - Título: {}", titulo);

            ContenidoDTO metadata = new ContenidoDTO();
            metadata.setTitulo(titulo);
            metadata.setDescripcion(descripcion);
            metadata.setTipo(tipo);

            ContenidoDTO resultado = servicio.subirContenido(archivo, metadata);
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        } catch (IOException e) {
            log.error("Error al subir contenido", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al subir archivo"));
        }
    }

    /**
     * POST: Asignar contenido a dispositivos
     * @param contenidoId ID del contenido
     * @param payload {dispositivoIds: [], programacion: {}}
     * @return Contenido asignado
     */
    @PostMapping("/contenido/{contenidoId}/asignar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> asignarContenido(
            @PathVariable String contenidoId,
            @RequestBody Map<String, Object> payload) {
        try {
            log.info("POST /api/hardware/contenido/{}/asignar", contenidoId);

            @SuppressWarnings("unchecked")
            @SuppressWarnings("unchecked")
            List<String> dispositivoIds = (List<String>) payload.get("dispositivoIds");
            @SuppressWarnings("unchecked")
            Map<String, Object> programacion = (Map<String, Object>) payload.get("programacion");

            ContenidoDTO resultado = servicio.asignarContenidoADispositivos(String.valueOf(contenidoId), dispositivoIds, programacion);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error al asignar contenido"));
        }
    }

    /**
     * DELETE: Eliminar contenido
     * @param contenidoId ID del contenido
     * @return Confirmación
     */
    @DeleteMapping("/contenido/{contenidoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarContenido(@PathVariable String contenidoId) {
        try {
            log.info("DELETE /api/hardware/contenido/{}", contenidoId);
            servicio.eliminarContenido(contenidoId);
            return ResponseEntity.ok(Map.of("mensaje", "Contenido eliminado"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al eliminar contenido"));
        }
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * GET: Obtener estadísticas de dispositivo
     * @param dispositivoId ID del dispositivo
     * @return Estadísticas
     */
    @GetMapping("/dispositivos/{dispositivoId}/estadisticas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> obtenerEstadisticas(@PathVariable String dispositivoId) {
        try {
            log.info("GET /api/hardware/dispositivos/{}/estadisticas", dispositivoId);
            EstadisticasDispositivoDTO stats = servicio.obtenerEstadisticas(dispositivoId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dispositivo no encontrado"));
        }
    }

    /**
     * GET: Test de conexión
     * @param dispositivoId ID del dispositivo
     * @return Resultado del test
     */
    @GetMapping("/dispositivos/{dispositivoId}/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> testConexion(@PathVariable String dispositivoId) {
        try {
            log.info("GET /api/hardware/dispositivos/{}/test", dispositivoId);
            TestConexionDTO resultado = servicio.testConexion(dispositivoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dispositivo no encontrado"));
        }
    }

    /**
     * POST: Sincronizar dispositivo
     * @param dispositivoId ID del dispositivo
     * @return Resultado de sincronización
     */
    @PostMapping("/dispositivos/{dispositivoId}/sincronizar")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESIONAL')")
    public ResponseEntity<?> sincronizar(@PathVariable String dispositivoId) {
        try {
            log.info("POST /api/hardware/dispositivos/{}/sincronizar", dispositivoId);
            SincronizacionDTO resultado = servicio.sincronizar(dispositivoId);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dispositivo no encontrado"));
        }
    }

    // ==================== HEALTH CHECK ====================

    /**
     * GET: Health check
     * @return Estado del servicio
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "estado", "operativo",
                "servicio", "Hardware API",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
