package com.innoad.modules.campanas.controller;

import com.innoad.modules.campanas.dto.CampanaDTO;
import com.innoad.modules.campanas.servicio.ServicioCampanas;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/campanas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "📢 Campañas", description = "Gestión de campañas publicitarias")
@SecurityRequirement(name = "BearerAuth")
public class ControladorCampanas {
    
    private final ServicioCampanas servicioCampanas;
    
    /**
     * Crear nueva campaña
     */
    @PostMapping
    @Operation(
        summary = "Crear nueva campaña",
        description = "Crea una nueva campaña publicitaria con los datos proporcionados"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Campaña creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> crearCampana(
            @Valid @RequestBody CampanaDTO dto,
            Authentication authentication
    ) {
        try {
            log.info("Crear campaña: {}", dto.getNombre());
            CampanaDTO creada = servicioCampanas.crearCampana(dto, authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Campaña creada exitosamente");
            response.put("data", creada);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error al crear campaña", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtener campaña por ID
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener campaña por ID",
        description = "Retorna los detalles completos de una campaña específica"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Campaña encontrada"),
        @ApiResponse(responseCode = "404", description = "Campaña no encontrada"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            CampanaDTO campana = servicioCampanas.obtenerCampana(id, authentication.getName());
            return buildSuccessResponse("Campaña obtenida", campana);
        } catch (Exception e) {
            log.error("Error al obtener campaña", e);
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
    
    /**
     * Listar campañas del usuario
     */
    @GetMapping
    @Operation(
        summary = "Listar campañas",
        description = "Obtiene todas las campañas del usuario autenticado con paginación"
    )
    @ApiResponse(responseCode = "200", description = "Lista de campañas obtenida")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listarCampanas(
            @Parameter(description = "Página (comienza en 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Cantidad por página") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Filtro por estado") @RequestParam(required = false) String estado,
            @Parameter(description = "Buscar por nombre") @RequestParam(required = false) String nombre,
            Authentication authentication
    ) {
        try {
            log.info("Listar campañas - página: {}, tamaño: {}", page, size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
            Page<CampanaDTO> result;
            
            if (nombre != null && !nombre.isBlank()) {
                result = servicioCampanas.buscarPorNombre(authentication.getName(), nombre, pageable);
            } else if (estado != null && !estado.isBlank()) {
                result = servicioCampanas.listarPorEstado(authentication.getName(), estado, pageable);
            } else {
                result = servicioCampanas.listarCampanas(authentication.getName(), pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Campañas listadas");
            response.put("data", result.getContent());
            response.put("pagination", Map.of(
                "page", page,
                "size", size,
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al listar campañas", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Actualizar campaña
     */
    @PutMapping("/{id}")
    @Operation(
        summary = "Actualizar campaña",
        description = "Modifica los datos de una campaña existente"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Campaña actualizada"),
        @ApiResponse(responseCode = "404", description = "Campaña no encontrada"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> actualizarCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id,
            @Valid @RequestBody CampanaDTO dto,
            Authentication authentication
    ) {
        try {
            log.info("Actualizar campaña: {}", id);
            CampanaDTO actualizada = servicioCampanas.actualizarCampana(id, dto, authentication.getName());
            return buildSuccessResponse("Campaña actualizada", actualizada);
        } catch (Exception e) {
            log.error("Error al actualizar campaña", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Cambiar estado de campaña
     */
    @PatchMapping("/{id}/estado")
    @Operation(
        summary = "Cambiar estado de campaña",
        description = "Cambia el estado de una campaña (ACTIVA, PAUSADA, FINALIZADA, etc)"
    )
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cambiarEstado(
            @Parameter(description = "ID de la campaña") @PathVariable Long id,
            @Parameter(description = "Nuevo estado") @RequestParam String nuevoEstado,
            Authentication authentication
    ) {
        try {
            log.info("Cambiar estado campaña {} a: {}", id, nuevoEstado);
            CampanaDTO actualizada = servicioCampanas.cambiarEstado(id, nuevoEstado, authentication.getName());
            return buildSuccessResponse("Estado actualizado", actualizada);
        } catch (Exception e) {
            log.error("Error al cambiar estado", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Eliminar campaña
     */
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar campaña",
        description = "Elimina una campaña de forma permanente (solo borrador)"
    )
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> eliminarCampana(
            @Parameter(description = "ID de la campaña") @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            log.info("Eliminar campaña: {}", id);
            servicioCampanas.eliminarCampana(id, authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Campaña eliminada");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al eliminar campaña", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtener campañas activas
     */
    @GetMapping("/activas/lista")
    @Operation(summary = "Obtener campañas activas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCampanasActivas(Authentication authentication) {
        try {
            var campanas = servicioCampanas.getCampanasActivas(authentication.getName());
            return buildSuccessResponse("Campañas activas obtenidas", campanas);
        } catch (Exception e) {
            log.error("Error al obtener campañas activas", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    // Métodos auxiliares para respuestas consistentes
    private ResponseEntity<?> buildSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
    
    private ResponseEntity<?> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("error", status.getReasonPhrase());
        return ResponseEntity.status(status).body(response);
    }
}
