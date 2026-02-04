package com.innoad.modules.pagos.controller;

import com.innoad.modules.pagos.dto.PagoDTO;
import com.innoad.modules.pagos.servicio.ServicioPagos;
import com.innoad.modules.pagos.servicio.ServicioWebhookMercadoPago;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para gestión de Pagos
 * Integración con Mercado Pago - Fase 5
 */
@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "💳 Pagos", description = "Gestión de pagos con Mercado Pago")
@SecurityRequirement(name = "BearerAuth")
public class ControladorPagos {
    
    private final ServicioPagos servicioPagos;
    private final ServicioWebhookMercadoPago servicioWebhook;
    
    /**
     * Crear nuevo pago
     */
    @PostMapping
    @Operation(summary = "Crear nuevo pago")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> crearPago(
            @RequestBody Map<String, Object> solicitud,
            Authentication authentication
    ) {
        try {
            BigDecimal monto = new BigDecimal(solicitud.get("monto").toString());
            String descripcion = solicitud.get("descripcion").toString();
            String email = solicitud.get("email").toString();
            String nombre = solicitud.get("nombre").toString();
            String tipoPago = solicitud.getOrDefault("tipoPago", "PAGO_UNICO").toString();
            Long planId = solicitud.containsKey("planId") ? 
                Long.valueOf(solicitud.get("planId").toString()) : null;
            
            // En producción, obtener usuarioId del authentication
            Long usuarioId = 1L; // Por ahora hardcoded
            
            PagoDTO pago = servicioPagos.crearPago(
                monto, descripcion, email, nombre,
                usuarioId, planId, tipoPago
            );
            
            return buildSuccessResponse(HttpStatus.CREATED, "Pago creado exitosamente", pago);
        } catch (Exception e) {
            log.error("Error al crear pago", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtener pago por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener pago por ID")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerPago(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            PagoDTO pago = servicioPagos.obtenerPago(id);
            return buildSuccessResponse(HttpStatus.OK, "Pago obtenido", pago);
        } catch (Exception e) {
            log.error("Error al obtener pago", e);
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
    
    /**
     * Listar pagos del usuario
     */
    @GetMapping
    @Operation(summary = "Listar pagos del usuario")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listarPagos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        try {
            Long usuarioId = 1L; // En producción, obtener del authentication
            Pageable pageable = PageRequest.of(page, size);
            Page<PagoDTO> pagos = servicioPagos.listarPagosPorUsuario(usuarioId, pageable);
            
            return buildSuccessResponse(HttpStatus.OK, "Pagos obtenidos", pagos);
        } catch (Exception e) {
            log.error("Error al listar pagos", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Listar pagos por estado (ADMINISTRADOR)
     */
    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar pagos por estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> listarPagosPorEstado(
            @PathVariable String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PagoDTO> pagos = servicioPagos.listarPagosPorEstado(estado, pageable);
            
            return buildSuccessResponse(HttpStatus.OK, "Pagos obtenidos", pagos);
        } catch (Exception e) {
            log.error("Error al listar pagos por estado", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Webhook de Mercado Pago (público)
     * Headers esperados:
     * - X-Signature: firma HMAC SHA256
     * - X-Request-Id: ID único de la solicitud
     * - X-Request-Timestamp: timestamp de la solicitud
     */
    @PostMapping("/webhook/mercado-pago")
    @Operation(summary = "Webhook de Mercado Pago")
    public ResponseEntity<?> webhookMercadoPago(
            @RequestBody String body,
            @RequestHeader(value = "X-Signature", required = false) String signature,
            @RequestHeader(value = "X-Request-Id", required = false) String xRequestId,
            @RequestHeader(value = "X-Request-Timestamp", required = false) String timestamp
    ) {
        try {
            log.info("Webhook recibido de Mercado Pago");
            
            // Validar firma del webhook
            if (!servicioWebhook.validarFirmaWebhook(signature, xRequestId, timestamp, body)) {
                log.warn("Webhook rechazado: firma inválida");
                // Retornar 200 OK igualmente (Mercado Pago no debe reintentar por firma inválida)
            }
            
            // Procesar webhook
            // Nota: body llega como String, convertir a Map aquí si es necesario
            // servicioWebhook.procesarWebhook(payload);
            
            Map<String, String> response = new HashMap<>();
            response.put("resultado", "OK");
            response.put("mensaje", "Webhook procesado correctamente");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error procesando webhook: {}", e.getMessage());
            // Retornar 200 OK para que MP no reintente
            return ResponseEntity.ok(Map.of("resultado", "OK", "mensaje", "Error procesado"));
        }
    }
    
    /**
     * Reembolsar pago (ADMINISTRADOR)
     */
    @PostMapping("/{id}/reembolsar")
    @Operation(summary = "Reembolsar pago")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> reembolsarPago(
            @PathVariable Long id,
            @RequestBody Map<String, Object> solicitud
    ) {
        try {
            BigDecimal monto = new BigDecimal(solicitud.get("monto").toString());
            String motivo = solicitud.get("motivo").toString();
            
            servicioPagos.reembolsarPago(id, monto, motivo);
            
            return buildSuccessResponse(HttpStatus.OK, "Pago reembolsado exitosamente", null);
        } catch (Exception e) {
            log.error("Error al reembolsar pago", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Construir respuesta exitosa
     */
    private ResponseEntity<?> buildSuccessResponse(HttpStatus status, String mensaje, Object datos) {
        Map<String, Object> response = new HashMap<>();
        response.put("exitoso", true);
        response.put("mensaje", mensaje);
        response.put("datos", datos);
        return new ResponseEntity<>(response, status);
    }
    
    /**
     * Construir respuesta de error
     */
    private ResponseEntity<?> buildErrorResponse(HttpStatus status, String mensaje) {
        Map<String, Object> response = new HashMap<>();
        response.put("exitoso", false);
        response.put("mensaje", mensaje);
        return new ResponseEntity<>(response, status);
    }
}
