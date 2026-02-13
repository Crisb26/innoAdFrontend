package com.innoad.modules.campanas.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campanas")
@RequiredArgsConstructor
@Tag(name = "📢 Campañas", description = "Gestión de campañas publicitarias")
@SecurityRequirement(name = "BearerAuth")
public class ControladorCampanasDocumentado {
    
    @GetMapping
    @Operation(
        summary = "Listar campañas",
        description = "Obtiene todas las campañas del usuario autenticado con paginación y filtros"
    )
    @ApiResponse(responseCode = "200", description = "Lista de campañas obtenida")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listarCampanas(
            @Parameter(description = "Página (comienza en 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad por página") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filtro por estado (ACTIVO, PAUSADO, FINALIZADO)") @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok("Campañas listadas");
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener campaña por ID",
        description = "Retorna los detalles completos de una campaña específica"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Campaña encontrada"),
        @ApiResponse(responseCode = "404", description = "Campaña no encontrada")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id
    ) {
        return ResponseEntity.ok("Campaña obtenida");
    }
    
    @PostMapping
    @Operation(
        summary = "Crear nueva campaña",
        description = "Crea una nueva campaña publicitaria con los datos proporcionados"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Campaña creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> crearCampana(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Datos de la nueva campaña",
                required = true
            ) @RequestBody Object request
    ) {
        return ResponseEntity.status(201).body("Campaña creada");
    }
    
    @PutMapping("/{id}")
    @Operation(
        summary = "Actualizar campaña",
        description = "Modifica los datos de una campaña existente"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Campaña actualizada"),
        @ApiResponse(responseCode = "404", description = "Campaña no encontrada")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> actualizarCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id,
            @RequestBody Object request
    ) {
        return ResponseEntity.ok("Campaña actualizada");
    }
    
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar campaña",
        description = "Elimina una campaña de forma permanente"
    )
    @ApiResponse(responseCode = "204", description = "Campaña eliminada exitosamente")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> eliminarCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id
    ) {
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/pausar")
    @Operation(
        summary = "Pausar campaña",
        description = "Pausa una campaña activa sin eliminarla"
    )
    @ApiResponse(responseCode = "200", description = "Campaña pausada")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> pausarCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id
    ) {
        return ResponseEntity.ok("Campaña pausada");
    }
    
    @GetMapping("/{id}/estadisticas")
    @Operation(
        summary = "Obtener estadísticas de campaña",
        description = "Retorna métricas de rendimiento: impresiones, clics, conversiones, CTR, etc"
    )
    @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerEstadisticas(
            @Parameter(description = "ID de la campaña") @PathVariable Long id
    ) {
        return ResponseEntity.ok("Estadísticas de campaña");
    }
}
