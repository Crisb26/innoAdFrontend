package com.innoad.modules.pantallas.controller;

import com.innoad.modules.pantallas.dto.PantallaDTO;
import com.innoad.modules.pantallas.servicio.ServicioPantallas;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/v1/pantallas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "📺 Pantallas", description = "Gestión de pantallas digitales")
@SecurityRequirement(name = "BearerAuth")
public class ControladorPantallas {
    
    private final ServicioPantallas servicioPantallas;
    
    /**
     * Crear nueva pantalla
     */
    @PostMapping
    @Operation(summary = "Crear nueva pantalla")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> crearPantalla(
            @Valid @RequestBody PantallaDTO dto,
            Authentication authentication
    ) {
        try {
            log.info("Crear pantalla: {}", dto.getCodigo());
            PantallaDTO creada = servicioPantallas.crearPantalla(dto, authentication.getName());
            return buildSuccessResponse(HttpStatus.CREATED, "Pantalla creada exitosamente", creada);
        } catch (Exception e) {
            log.error("Error al crear pantalla", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtener pantalla por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener pantalla por ID")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerPantalla(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            PantallaDTO pantalla = servicioPantallas.obtenerPantalla(id, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Pantalla obtenida", pantalla);
        } catch (Exception e) {
            log.error("Error al obtener pantalla", e);
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
    
    /**
     * Listar pantallas del usuario
     */
    @GetMapping
    @Operation(summary = "Listar pantallas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listarPantallas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String estado,
            Authentication authentication
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
            Page<PantallaDTO> result;
            
            if (nombre != null && !nombre.isBlank()) {
                result = servicioPantallas.buscarPorNombre(authentication.getName(), nombre, pageable);
            } else if (estado != null && !estado.isBlank()) {
                result = servicioPantallas.listarPorEstado(authentication.getName(), estado, pageable);
            } else {
                result = servicioPantallas.listarPantallas(authentication.getName(), pageable);
            }
            
            return buildPaginatedResponse(result, page, size);
        } catch (Exception e) {
            log.error("Error al listar pantallas", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Actualizar pantalla
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar pantalla")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> actualizarPantalla(
            @PathVariable Long id,
            @Valid @RequestBody PantallaDTO dto,
            Authentication authentication
    ) {
        try {
            PantallaDTO actualizada = servicioPantallas.actualizarPantalla(id, dto, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Pantalla actualizada", actualizada);
        } catch (Exception e) {
            log.error("Error al actualizar pantalla", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Cambiar estado de pantalla
     */
    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de pantalla")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado,
            Authentication authentication
    ) {
        try {
            PantallaDTO actualizada = servicioPantallas.cambiarEstado(id, nuevoEstado, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Estado actualizado", actualizada);
        } catch (Exception e) {
            log.error("Error al cambiar estado", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Eliminar pantalla
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar pantalla")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> eliminarPantalla(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            servicioPantallas.eliminarPantalla(id, authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pantalla eliminada");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al eliminar pantalla", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtener pantallas conectadas
     */
    @GetMapping("/conectadas/lista")
    @Operation(summary = "Obtener pantallas conectadas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPantallasConectadas(Authentication authentication) {
        try {
            var pantallas = servicioPantallas.getPantallasConectadas(authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Pantallas conectadas obtenidas", pantallas);
        } catch (Exception e) {
            log.error("Error al obtener pantallas conectadas", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Obtener pantalla por código (para Raspberry Pi)
     */
    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener pantalla por código")
    public ResponseEntity<?> obtenerPantallaPorCodigo(
            @PathVariable String codigo
    ) {
        try {
            log.info("Obteniendo pantalla con código: {}", codigo);
            PantallaDTO pantalla = servicioPantallas.obtenerPantallaPorCodigo(codigo);
            return buildSuccessResponse(HttpStatus.OK, "Pantalla obtenida", pantalla);
        } catch (Exception e) {
            log.error("Error al obtener pantalla por código", e);
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
    
    /**
     * Obtener contenido/feed de una pantalla por código (para Raspberry Pi)
     */
    @GetMapping("/codigo/{codigo}/contenido")
    @Operation(summary = "Obtener contenido/campaña de una pantalla")
    public ResponseEntity<?> obtenerContenidoPantalla(
            @PathVariable String codigo
    ) {
        try {
            log.info("Obteniendo contenido de pantalla: {}", codigo);
            Object contenido = servicioPantallas.obtenerContenidoPantalla(codigo);
            return buildSuccessResponse(HttpStatus.OK, "Contenido obtenido", contenido);
        } catch (Exception e) {
            log.error("Error al obtener contenido de pantalla", e);
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
    
    // Métodos auxiliares
    private ResponseEntity<?> buildSuccessResponse(HttpStatus status, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.status(status).body(response);
    }
    
    private ResponseEntity<?> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("error", status.getReasonPhrase());
        return ResponseEntity.status(status).body(response);
    }
    
    private ResponseEntity<?> buildPaginatedResponse(Page<?> page, int pageNum, int size) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Pantallas listadas");
        response.put("data", page.getContent());
        response.put("pagination", Map.of(
            "page", pageNum,
            "size", size,
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages()
        ));
        return ResponseEntity.ok(response);
    }
}
