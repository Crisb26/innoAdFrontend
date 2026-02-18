package com.innoad.modules.pagos.controller;

import com.innoad.modules.pagos.domain.CarritoItem;
import com.innoad.modules.pagos.service.CarritoService;
import com.innoad.modules.publicaciones.domain.Publicacion;
import com.innoad.modules.publicaciones.repository.PublicacionRepository;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/carrito")
@RequiredArgsConstructor
@Slf4j
public class CarritoController {

    private final CarritoService carritoService;
    private final PublicacionRepository publicacionRepository;

    /**
     * Obtener carrito del usuario actual
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerCarrito(
            @AuthenticationPrincipal Usuario usuario) {

        Map<String, Object> response = new HashMap<>();

        try {
            List<CarritoItem> items = carritoService.obtenerCarrito(usuario);

            response.put("exito", true);
            response.put("mensaje", "Carrito obtenido");
            response.put("data", items.stream().map(this::convertirADTO).collect(Collectors.toList()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al obtener carrito");
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Agregar publicación al carrito
     */
    @PostMapping("/agregar")
    public ResponseEntity<Map<String, Object>> agregarAlCarrito(
            @AuthenticationPrincipal Usuario usuario,
            @RequestBody AgregarAlCarritoRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            Publicacion publicacion = publicacionRepository.findById(request.getPublicacionId())
                    .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

            CarritoItem item = carritoService.agregarAlCarrito(
                    usuario,
                    publicacion,
                    request.getCantidad()
            );

            response.put("exito", true);
            response.put("mensaje", "Publicación agregada al carrito");
            response.put("data", convertirADTO(item));

            log.info("Publicación agregada al carrito: usuario={}, publicacion={}, cantidad={}",
                    usuario.getId(), publicacion.getId(), request.getCantidad());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al agregar publicación: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Actualizar cantidad de item en el carrito
     */
    @PutMapping("/{itemId}/cantidad")
    public ResponseEntity<Map<String, Object>> actualizarCantidad(
            @PathVariable Long itemId,
            @RequestBody ActualizarCantidadRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            CarritoItem item = carritoService.actualizarCantidad(itemId, request.getCantidad());

            response.put("exito", true);
            response.put("mensaje", "Cantidad actualizada");
            response.put("data", convertirADTO(item));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al actualizar cantidad: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Eliminar item del carrito
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> eliminarItem(
            @PathVariable Long itemId) {

        Map<String, Object> response = new HashMap<>();

        try {
            carritoService.eliminarDelCarrito(itemId);

            response.put("exito", true);
            response.put("mensaje", "Item eliminado del carrito");
            response.put("data", null);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al eliminar item: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Vaciar carrito completo
     */
    @DeleteMapping("/vaciar")
    public ResponseEntity<Map<String, Object>> vaciarCarrito(
            @AuthenticationPrincipal Usuario usuario) {

        Map<String, Object> response = new HashMap<>();

        try {
            carritoService.vaciarCarrito(usuario);

            response.put("exito", true);
            response.put("mensaje", "Carrito vaciado");
            response.put("data", null);

            log.info("Carrito vaciado para usuario {}", usuario.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al vaciar carrito: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Obtener totales del carrito
     */
    @GetMapping("/totales")
    public ResponseEntity<Map<String, Object>> obtenerTotales(
            @AuthenticationPrincipal Usuario usuario) {

        Map<String, Object> response = new HashMap<>();

        try {
            BigDecimal subtotal = carritoService.calcularTotal(usuario);
            BigDecimal iva = carritoService.calcularIVA(usuario);
            BigDecimal total = carritoService.calcularTotalConIVA(usuario);

            Map<String, Object> totales = new HashMap<>();
            totales.put("subtotal", subtotal);
            totales.put("iva", iva);
            totales.put("total", total);

            response.put("exito", true);
            response.put("mensaje", "Totales calculados");
            response.put("data", totales);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al calcular totales: " + e.getMessage());
            response.put("data", null);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Convertir CarritoItem a DTO
     */
    private Map<String, Object> convertirADTO(CarritoItem item) {
        return Map.of(
                "id", item.getId(),
                "usuarioId", item.getUsuario().getId(),
                "publicacionId", item.getPublicacion().getId(),
                "publicacionTitulo", item.getPublicacion().getTitulo(),
                "publicacionImagen", item.getPublicacion().getImagenUrl(),
                "cantidad", item.getCantidad(),
                "precioUnitarioCOP", item.getPrecioUnitarioCOP(),
                "subtotal", item.getSubtotal(),
                "fechaAgregado", item.getFechaAgregado()
        );
    }

    /**
     * Request DTOs
     */
    @lombok.Data
    public static class AgregarAlCarritoRequest {
        private Long publicacionId;
        private Integer cantidad;
    }

    @lombok.Data
    public static class ActualizarCantidadRequest {
        private Integer cantidad;
    }
}
