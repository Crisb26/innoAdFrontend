package com.innoad.modules.screens.controller;

import com.innoad.dto.solicitud.SolicitudPantalla;
import com.innoad.dto.respuesta.RespuestaAPI;
import com.innoad.dto.respuesta.RespuestaPantalla;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.screens.service.ServicioPantalla;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para gestionar pantallas (Raspberry Pi)
 */
@RestController
@RequestMapping("/api/v1/pantallas")
@RequiredArgsConstructor
@Tag(name = "Pantallas", description = "Gestión de pantallas Raspberry Pi")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"})
public class ControladorPantalla {

    private final ServicioPantalla servicioPantalla;

    /**
     * Crea una nueva pantalla
     */
    @PostMapping
    @Operation(summary = "Crear pantalla", description = "Crea una nueva pantalla para el usuario autenticado")
    public ResponseEntity<RespuestaAPI<RespuestaPantalla>> crearPantalla(
            @Valid @RequestBody SolicitudPantalla solicitud,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaPantalla pantalla = servicioPantalla.crearPantalla(solicitud, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(true)
                            .mensaje("Pantalla creada exitosamente")
                            .datos(pantalla)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(false)
                            .mensaje("Error al crear pantalla: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Obtiene todas las pantallas del usuario autenticado
     */
    @GetMapping
    @Operation(summary = "Listar pantallas", description = "Obtiene todas las pantallas del usuario")
    public ResponseEntity<RespuestaAPI<List<RespuestaPantalla>>> obtenerPantallas(
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            List<RespuestaPantalla> pantallas = servicioPantalla.obtenerPantallasPorUsuario(usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaPantalla>>builder()
                            .exitoso(true)
                            .mensaje("Pantallas obtenidas exitosamente")
                            .datos(pantallas)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaPantalla>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener pantallas: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Obtiene una pantalla por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener pantalla", description = "Obtiene una pantalla por su ID")
    public ResponseEntity<RespuestaAPI<RespuestaPantalla>> obtenerPantalla(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaPantalla pantalla = servicioPantalla.obtenerPantalla(id, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(true)
                            .mensaje("Pantalla obtenida exitosamente")
                            .datos(pantalla)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener pantalla: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Actualiza una pantalla existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar pantalla", description = "Actualiza una pantalla existente")
    public ResponseEntity<RespuestaAPI<RespuestaPantalla>> actualizarPantalla(
            @PathVariable Long id,
            @Valid @RequestBody SolicitudPantalla solicitud,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaPantalla pantalla = servicioPantalla.actualizarPantalla(id, solicitud, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(true)
                            .mensaje("Pantalla actualizada exitosamente")
                            .datos(pantalla)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(false)
                            .mensaje("Error al actualizar pantalla: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Elimina una pantalla
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar pantalla", description = "Elimina una pantalla")
    public ResponseEntity<RespuestaAPI<Void>> eliminarPantalla(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            servicioPantalla.eliminarPantalla(id, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Pantalla eliminada exitosamente")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error al eliminar pantalla: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Activa una pantalla
     */
    @PostMapping("/{id}/activar")
    @Operation(summary = "Activar pantalla", description = "Activa una pantalla")
    public ResponseEntity<RespuestaAPI<RespuestaPantalla>> activarPantalla(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaPantalla pantalla = servicioPantalla.activarPantalla(id, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(true)
                            .mensaje("Pantalla activada exitosamente")
                            .datos(pantalla)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(false)
                            .mensaje("Error al activar pantalla: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Desactiva una pantalla
     */
    @PostMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar pantalla", description = "Desactiva una pantalla")
    public ResponseEntity<RespuestaAPI<RespuestaPantalla>> desactivarPantalla(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaPantalla pantalla = servicioPantalla.desactivarPantalla(id, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(true)
                            .mensaje("Pantalla desactivada exitosamente")
                            .datos(pantalla)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaPantalla>builder()
                            .exitoso(false)
                            .mensaje("Error al desactivar pantalla: " + e.getMessage())
                            .build());
        }
    }
}
