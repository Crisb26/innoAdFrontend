package com.innoad.modules.pantallas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pantallas")
@RequiredArgsConstructor
@Tag(name = "📺 Pantallas", description = "Gestión de pantallas digitales y displays")
@SecurityRequirement(name = "BearerAuth")
public class ControladorPantallasDocumentado {
    
    @GetMapping
    @Operation(
        summary = "Listar pantallas",
        description = "Obtiene todas las pantallas registradas con estado, ubicación y contenido actual"
    )
    @ApiResponse(responseCode = "200", description = "Lista de pantallas")
    public ResponseEntity<?> listarPantallas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String ubicacion
    ) {
        return ResponseEntity.ok("Pantallas listadas");
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener detalle de pantalla",
        description = "Obtiene información detallada de una pantalla: estado, contenido, horarios, últimas actualizaciones"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Detalle de pantalla"),
        @ApiResponse(responseCode = "404", description = "Pantalla no encontrada")
    })
    public ResponseEntity<?> obtenerPantalla(@PathVariable Long id) {
        return ResponseEntity.ok("Pantalla");
    }
    
    @PostMapping
    @Operation(
        summary = "Registrar nueva pantalla",
        description = "Registra una nueva pantalla digital en el sistema"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Pantalla registrada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<?> registrarPantalla(@RequestBody Object solicitud) {
        return ResponseEntity.status(201).body("Pantalla registrada");
    }
    
    @PutMapping("/{id}")
    @Operation(
        summary = "Actualizar pantalla",
        description = "Actualiza la configuración de una pantalla (ubicación, nombre, resolución, etc)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pantalla actualizada"),
        @ApiResponse(responseCode = "404", description = "Pantalla no encontrada")
    })
    public ResponseEntity<?> actualizarPantalla(
            @PathVariable Long id,
            @RequestBody Object solicitud
    ) {
        return ResponseEntity.ok("Pantalla actualizada");
    }
    
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar pantalla",
        description = "Elimina una pantalla del sistema"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pantalla eliminada"),
        @ApiResponse(responseCode = "404", description = "Pantalla no encontrada")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarPantalla(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/asignar-contenido")
    @Operation(
        summary = "Asignar contenido a pantalla",
        description = "Asigna una campaña o contenido a una pantalla para reproducción"
    )
    @ApiResponse(responseCode = "200", description = "Contenido asignado")
    public ResponseEntity<?> asignarContenido(
            @PathVariable Long id,
            @RequestBody Object solicitud
    ) {
        return ResponseEntity.ok("Contenido asignado");
    }
    
    @PostMapping("/{id}/reproducer-ahora")
    @Operation(
        summary = "Reproducir contenido ahora",
        description = "Reproduce inmediatamente un contenido en la pantalla, interrumpiendo el actual"
    )
    @ApiResponse(responseCode = "200", description = "Reproducción iniciada")
    public ResponseEntity<?> reproducirAhora(
            @PathVariable Long id,
            @RequestParam Long contenidoId
    ) {
        return ResponseEntity.ok("Reproducción iniciada");
    }
    
    @PostMapping("/{id}/pausar")
    @Operation(
        summary = "Pausar pantalla",
        description = "Pausa la reproducción actual en la pantalla"
    )
    @ApiResponse(responseCode = "200", description = "Pantalla pausada")
    public ResponseEntity<?> pausarPantalla(@PathVariable Long id) {
        return ResponseEntity.ok("Pantalla pausada");
    }
    
    @PostMapping("/{id}/reanudar")
    @Operation(
        summary = "Reanudar pantalla",
        description = "Reanuda la reproducción pausada en la pantalla"
    )
    @ApiResponse(responseCode = "200", description = "Pantalla reanudada")
    public ResponseEntity<?> reanudarpantalla(@PathVariable Long id) {
        return ResponseEntity.ok("Pantalla reanudada");
    }
    
    @GetMapping("/{id}/estado")
    @Operation(
        summary = "Estado en tiempo real",
        description = "Obtiene estado actual: conectada, contenido reproduciendo, última actualización, CPU, memoria"
    )
    @ApiResponse(responseCode = "200", description = "Estado de la pantalla")
    public ResponseEntity<?> obtenerEstado(@PathVariable Long id) {
        return ResponseEntity.ok("Estado");
    }
    
    @GetMapping("/{id}/historial-reproducciones")
    @Operation(
        summary = "Historial de reproducciones",
        description = "Obtiene historial de contenidos reproducidos en la pantalla"
    )
    @ApiResponse(responseCode = "200", description = "Historial")
    public ResponseEntity<?> obtenerHistorialReproducciones(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok("Historial");
    }
    
    @GetMapping("/estado/online")
    @Operation(
        summary = "Pantallas conectadas",
        description = "Obtiene cantidad de pantallas conectadas en tiempo real"
    )
    @ApiResponse(responseCode = "200", description = "Pantallas online")
    public ResponseEntity<?> obtenerPantallasOnline() {
        return ResponseEntity.ok("Pantallas online");
    }
    
    @GetMapping("/estado/problema")
    @Operation(
        summary = "Pantallas con problema",
        description = "Obtiene pantallas con problemas: desconectadas, error de reproducción, sincronización fallida"
    )
    @ApiResponse(responseCode = "200", description = "Pantallas con problemas")
    public ResponseEntity<?> obtenerPantallasConProblema() {
        return ResponseEntity.ok("Pantallas con problema");
    }
    
    @PostMapping("/control-remoto/reiniciar-todas")
    @Operation(
        summary = "Reiniciar todas",
        description = "Reinicia todas las pantallas del sistema de forma remota (requiere confirmación)"
    )
    @ApiResponse(responseCode = "200", description = "Reinicio iniciado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reiniciarTodas() {
        return ResponseEntity.ok("Reinicio iniciado");
    }
}
