package com.innoad.modules.pagos.controller;

import com.innoad.modules.pagos.domain.Pago;
import com.innoad.modules.pagos.service.PagoService;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
@Slf4j
public class PagoController {

    private final PagoService pagoService;

    /**
     * Procesar pago desde el carrito
     */
    @PostMapping("/procesar")
    public ResponseEntity<Map<String, Object>> procesarPago(
            @AuthenticationPrincipal Usuario usuario,
            @RequestBody ProcesarPagoRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            Pago pago = pagoService.procesarPago(
                    usuario,
                    request.getMetodoPago(),
                    request.getReferencia()
            );

            response.put("exito", true);
            response.put("mensaje", "Pago procesado exitosamente");
            response.put("data", convertirADTO(pago));

            log.info("Pago procesado: usuario={}, monto={}", usuario.getId(), pago.getMontoCOP());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al procesar pago: " + e.getMessage());
            response.put("data", null);

            log.error("Error procesando pago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Obtener historial de pagos del usuario actual
     */
    @GetMapping("/historial")
    public ResponseEntity<Map<String, Object>> obtenerHistorial(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> response = new HashMap<>();

        try {
            Pageable pageable = PageRequest.of(
                    page,
                    size,
                    Sort.by("fechaCreacion").descending()
            );

            Page<Pago> pagos = pagoService.obtenerHistorialPagos(usuario, pageable);

            response.put("exito", true);
            response.put("mensaje", "Historial de pagos obtenido");
            response.put("data", pagos.stream().map(this::convertirADTO).toList());
            response.put("paginacion", Map.of(
                    "page", pagos.getNumber(),
                    "size", pagos.getSize(),
                    "total", pagos.getTotalElements(),
                    "pages", pagos.getTotalPages()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al obtener historial");
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener pagos pendientes de verificación (ADMIN/TECNICO)
     */
    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<Map<String, Object>> obtenerPagosPendientes() {

        Map<String, Object> response = new HashMap<>();

        try {
            List<Pago> pagos = pagoService.obtenerPagosPendientes();

            response.put("exito", true);
            response.put("mensaje", "Pagos pendientes obtenidos");
            response.put("data", pagos.stream().map(this::convertirADTO).toList());
            response.put("total", pagos.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al obtener pagos pendientes");
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Verificar pago manual (ADMIN/TECNICO)
     */
    @PostMapping("/{pagoId}/verificar")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<Map<String, Object>> verificarPago(
            @PathVariable Long pagoId,
            @RequestBody VerificarPagoRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            Pago pago = pagoService.verificarPago(pagoId, request.getAprobado());

            response.put("exito", true);
            response.put("mensaje", request.getAprobado() ? "Pago verificado y aprobado" : "Pago rechazado");
            response.put("data", convertirADTO(pago));

            log.info("Pago verificado: id={}, aprobado={}", pagoId, request.getAprobado());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al verificar pago: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Procesar reembolso (ADMIN/TECNICO)
     */
    @PostMapping("/{pagoId}/reembolso")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<Map<String, Object>> procesarReembolso(
            @PathVariable Long pagoId,
            @RequestBody ReembolsoRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            Pago pago = pagoService.reembolsarPago(pagoId, request.getRazon());

            response.put("exito", true);
            response.put("mensaje", "Reembolso procesado exitosamente");
            response.put("data", convertirADTO(pago));

            log.info("Reembolso procesado: pagoId={}, razon={}", pagoId, request.getRazon());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al procesar reembolso: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Obtener estadísticas de pagos (ADMIN/TECNICO)
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {

        Map<String, Object> response = new HashMap<>();

        try {
            PagoService.PagoEstadisticas estadisticas = pagoService.obtenerEstadisticas();

            response.put("exito", true);
            response.put("mensaje", "Estadísticas obtenidas");
            response.put("data", estadisticas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al obtener estadísticas");
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener detalles de un pago
     */
    @GetMapping("/{pagoId}")
    public ResponseEntity<Map<String, Object>> obtenerPago(
            @PathVariable Long pagoId,
            @AuthenticationPrincipal Usuario usuario) {

        Map<String, Object> response = new HashMap<>();

        try {
            Pago pago = pagoService.obtenerPago(pagoId)
                    .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

            // Verificar que el usuario es propietario o es admin/técnico
            boolean esOwner = pago.getUsuario().getId().equals(usuario.getId());
            boolean esAdmin = usuario.getRol() != null && (
                    usuario.getRol().toString().equals("ADMIN") ||
                    usuario.getRol().toString().equals("TECNICO")
            );

            if (!esOwner && !esAdmin) {
                response.put("exito", false);
                response.put("mensaje", "No autorizado para ver este pago");
                response.put("data", null);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            response.put("exito", true);
            response.put("mensaje", "Pago obtenido");
            response.put("data", convertirADTO(pago));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al obtener pago: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Convertir Pago a DTO
     */
    private Map<String, Object> convertirADTO(Pago pago) {
        return Map.of(
                "id", pago.getId(),
                "usuarioId", pago.getUsuario().getId(),
                "usuarioNombre", pago.getUsuario().getNombre() + " " + pago.getUsuario().getApellido(),
                "montoCOP", pago.getMontoCOP(),
                "estado", pago.getEstado().toString(),
                "metodoPago", pago.getMetodoPago(),
                "referencia", pago.getReferencia(),
                "fechaCreacion", pago.getFechaCreacion(),
                "fechaProcesamiento", pago.getFechaProcesamiento()
        );
    }

    /**
     * Request DTOs
     */
    @lombok.Data
    public static class ProcesarPagoRequest {
        private String metodoPago;      // tarjeta, transferencia, nequi, contra
        private String referencia;      // Para pago manual
    }

    @lombok.Data
    public static class VerificarPagoRequest {
        private Boolean aprobado;
    }

    @lombok.Data
    public static class ReembolsoRequest {
        private String razon;
    }
}
