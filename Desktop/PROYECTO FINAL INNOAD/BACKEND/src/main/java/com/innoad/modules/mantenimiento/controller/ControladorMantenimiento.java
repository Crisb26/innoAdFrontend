package com.innoad.modules.mantenimiento.controller;

import com.innoad.modules.mantenimiento.dto.MantenimientoDTO;
import com.innoad.modules.mantenimiento.servicio.ServicioMantenimiento;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mantenimiento")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "🔧 Mantenimiento", description = "Gestión del sistema de mantenimiento")
@SecurityRequirement(name = "BearerAuth")
public class ControladorMantenimiento {
    
    private final ServicioMantenimiento servicioMantenimiento;
    
    /**
     * Obtener estado actual de mantenimiento (público)
     */
    @GetMapping("/estado")
    @Operation(summary = "Obtener estado actual de mantenimiento")
    public ResponseEntity<?> getEstadoMantenimiento() {
        try {
            var estado = servicioMantenimiento.getMantenimientoActual();
            if (estado == null) {
                return buildSuccessResponse(HttpStatus.OK, "Sistema operacional", null);
            }
            
            // No devolver la contraseña en la respuesta
            estado.setPassword(null);
            return buildSuccessResponse(HttpStatus.OK, "Sistema en mantenimiento", estado);
        } catch (Exception e) {
            log.error("Error al obtener estado de mantenimiento", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Activar mantenimiento (solo ADMIN)
     */
    @PostMapping("/activar")
    @Operation(summary = "Activar modo mantenimiento")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activarMantenimiento(
            @Valid @RequestBody MantenimientoDTO dto,
            Authentication authentication
    ) {
        try {
            log.info("Intento de activar mantenimiento por: {}", authentication.getName());
            
            MantenimientoDTO resultado = servicioMantenimiento.activarMantenimiento(dto, authentication.getName());
            resultado.setPassword(null); // No devolver la contraseña
            
            return buildSuccessResponse(HttpStatus.CREATED, "Mantenimiento activado", resultado);
        } catch (Exception e) {
            log.error("Error al activar mantenimiento", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Desactivar mantenimiento (solo ADMIN)
     */
    @PostMapping("/desactivar")
    @Operation(summary = "Desactivar modo mantenimiento")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> desactivarMantenimiento(Authentication authentication) {
        try {
            log.info("Intento de desactivar mantenimiento por: {}", authentication.getName());
            
            servicioMantenimiento.desactivarMantenimiento(authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Mantenimiento desactivado");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al desactivar mantenimiento", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Actualizar configuración de mantenimiento (solo ADMIN)
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar configuración de mantenimiento")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarMantenimiento(
            @PathVariable Long id,
            @Valid @RequestBody MantenimientoDTO dto,
            Authentication authentication
    ) {
        try {
            MantenimientoDTO resultado = servicioMantenimiento.actualizar(id, dto, authentication.getName());
            resultado.setPassword(null);
            
            return buildSuccessResponse(HttpStatus.OK, "Mantenimiento actualizado", resultado);
        } catch (Exception e) {
            log.error("Error al actualizar mantenimiento", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Verificar contraseña de acceso (público durante mantenimiento)
     */
    @PostMapping("/verificar-acceso")
    @Operation(summary = "Verificar contraseña de acceso durante mantenimiento")
    public ResponseEntity<?> verificarAcceso(@RequestBody Map<String, String> body) {
        try {
            String password = body.get("password");
            if (password == null || password.isEmpty()) {
                return buildErrorResponse(HttpStatus.BAD_REQUEST, "Contraseña requerida");
            }
            
            boolean valida = servicioMantenimiento.verificarContraseña(password);
            
            if (valida) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Acceso concedido");
                response.put("autorizado", true);
                return ResponseEntity.ok(response);
            } else {
                return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
            }
        } catch (Exception e) {
            log.error("Error al verificar acceso", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Obtener último mantenimiento (solo ADMIN)
     */
    @GetMapping("/ultimo")
    @Operation(summary = "Obtener información del último mantenimiento")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUltimoMantenimiento() {
        try {
            var ultimo = servicioMantenimiento.getUltimo();
            if (ultimo == null) {
                return buildSuccessResponse(HttpStatus.OK, "No hay mantenimientos registrados", null);
            }
            
            ultimo.setPassword(null);
            return buildSuccessResponse(HttpStatus.OK, "Último mantenimiento", ultimo);
        } catch (Exception e) {
            log.error("Error al obtener último mantenimiento", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
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
}
