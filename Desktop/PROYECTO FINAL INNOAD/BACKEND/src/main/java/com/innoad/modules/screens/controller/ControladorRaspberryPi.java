package com.innoad.modules.screens.controller;

import com.innoad.dto.respuesta.RespuestaAPI;
import com.innoad.dto.respuesta.RespuestaContenido;
import com.innoad.modules.content.service.ServicioContenido;
import com.innoad.modules.screens.service.ServicioPantalla;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador especial para Raspberry Pi
 * Este endpoint es usado por las pantallas para sincronizar contenidos
 */
@RestController
@RequestMapping("/api/v1/raspberry")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Raspberry Pi", description = "API para sincronización de pantallas Raspberry Pi")
@CrossOrigin(origins = "*") // Permitir acceso desde cualquier Raspberry Pi
public class ControladorRaspberryPi {

    private final ServicioContenido servicioContenido;
    private final ServicioPantalla servicioPantalla;

    /**
     * Sincroniza contenidos para una pantalla específica
     * Este endpoint es llamado por la Raspberry Pi para obtener los contenidos que debe mostrar
     */
    @GetMapping("/sincronizar/{codigoIdentificacion}")
    @Operation(summary = "Sincronizar contenidos",
               description = "Obtiene los contenidos activos para una pantalla específica")
    public ResponseEntity<RespuestaAPI<List<RespuestaContenido>>> sincronizarContenidos(
            @PathVariable String codigoIdentificacion,
            @RequestParam(required = false) String direccionIp,
            @RequestParam(required = false) String versionSoftware,
            @RequestParam(required = false) String informacionSistema
    ) {
        try {
            log.info("Sincronización solicitada - Pantalla: {} - IP: {}", codigoIdentificacion, direccionIp);

            // Registrar conexión
            if (direccionIp != null) {
                servicioPantalla.registrarConexion(codigoIdentificacion, direccionIp, versionSoftware, informacionSistema);
            }

            // Obtener contenidos activos
            List<RespuestaContenido> contenidos = servicioContenido.obtenerContenidosActivosParaPantalla(codigoIdentificacion);

            // Registrar sincronización
            servicioPantalla.registrarSincronizacion(codigoIdentificacion);

            log.info("Sincronización exitosa - Pantalla: {} - Contenidos: {}", codigoIdentificacion, contenidos.size());

            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaContenido>>builder()
                            .exitoso(true)
                            .mensaje("Contenidos sincronizados exitosamente")
                            .datos(contenidos)
                            .build()
            );
        } catch (Exception e) {
            log.error("Error en sincronización - Pantalla: {} - Error: {}", codigoIdentificacion, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaContenido>>builder()
                            .exitoso(false)
                            .mensaje("Error al sincronizar: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Registra la reproducción de un contenido
     * Llamado por la Raspberry Pi cada vez que muestra un contenido
     */
    @PostMapping("/reproduccion/{contenidoId}")
    @Operation(summary = "Registrar reproducción",
               description = "Registra que un contenido fue reproducido")
    public ResponseEntity<RespuestaAPI<Void>> registrarReproduccion(
            @PathVariable Long contenidoId,
            @RequestParam String codigoIdentificacion
            
    ) {
        try {
            log.debug("Reproducción registrada - Contenido: {} - Pantalla: {}", contenidoId, codigoIdentificacion);

            servicioContenido.registrarReproduccion(contenidoId);

            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Reproducción registrada")
                            .build()
            );
        } catch (Exception e) {
            log.error("Error al registrar reproducción - Contenido: {} - Error: {}", contenidoId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error al registrar reproducción: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Heartbeat - Ping para verificar que la pantalla está conectada
     */
    @PostMapping("/heartbeat/{codigoIdentificacion}")
    @Operation(summary = "Heartbeat",
               description = "Ping de la pantalla para mantener estado de conexión")
    public ResponseEntity<RespuestaAPI<Map<String, Object>>> heartbeat(
            @PathVariable String codigoIdentificacion,
            @RequestParam(required = false) String direccionIp,
            @RequestParam(required = false) String versionSoftware,
            @RequestParam(required = false) String informacionSistema
    ) {
        try {
            servicioPantalla.registrarConexion(codigoIdentificacion, direccionIp, versionSoftware, informacionSistema);

            // Obtener información de la pantalla
            var pantalla = servicioPantalla.obtenerPorCodigoIdentificacion(codigoIdentificacion);

            return ResponseEntity.ok(
                    RespuestaAPI.<Map<String, Object>>builder()
                            .exitoso(true)
                            .mensaje("Heartbeat recibido")
                            .datos(Map.of(
                                    "pantalla", pantalla.getNombre(),
                                    "estado", pantalla.getEstado(),
                                    "estaActiva", pantalla.estaActiva()
                            ))
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Map<String, Object>>builder()
                            .exitoso(false)
                            .mensaje("Error en heartbeat: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Endpoint de salud para verificar que el servidor está funcionando
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Verifica que el servidor está funcionando")
    public ResponseEntity<RespuestaAPI<Map<String, String>>> health() {
        return ResponseEntity.ok(
                RespuestaAPI.<Map<String, String>>builder()
                        .exitoso(true)
                        .mensaje("Servidor funcionando correctamente")
                        .datos(Map.of(
                                "status", "UP",
                                "service", "InnoAd Backend",
                                "version", "2.0.0"
                        ))
                        .build()
        );
    }

    /**
     * Obtiene información de configuración para la pantalla
     */
    @GetMapping("/configuracion/{codigoIdentificacion}")
    @Operation(summary = "Obtener configuración",
               description = "Obtiene la configuración de una pantalla")
    public ResponseEntity<RespuestaAPI<Map<String, Object>>> obtenerConfiguracion(
            @PathVariable String codigoIdentificacion
    ) {
        try {
            var pantalla = servicioPantalla.obtenerPorCodigoIdentificacion(codigoIdentificacion);

            return ResponseEntity.ok(
                    RespuestaAPI.<Map<String, Object>>builder()
                            .exitoso(true)
                            .mensaje("Configuración obtenida")
                            .datos(Map.of(
                                    "nombre", pantalla.getNombre(),
                                    "resolucion", pantalla.getResolucion(),
                                    "orientacion", pantalla.getOrientacion(),
                                    "estado", pantalla.getEstado(),
                                    "ubicacion", pantalla.getUbicacion() != null ? pantalla.getUbicacion() : "No especificada"
                            ))
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Map<String, Object>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener configuración: " + e.getMessage())
                            .build());
        }
    }
}
