package com.innoad.modules.publicaciones.controller;

import com.innoad.modules.publicaciones.domain.Publicacion;
import com.innoad.modules.publicaciones.service.PublicacionService;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controlador para Publicaciones
 * Maneja upload de imágenes, creación y gestión de publicaciones
 */
@RestController
@RequestMapping("/api/v1/publicaciones")
@RequiredArgsConstructor
@Slf4j
public class PublicacionController {

    private final PublicacionService publicacionService;

    /**
     * Crear publicación con imagen
     */
    @PostMapping("/crear")
    public ResponseEntity<Map<String, Object>> crearPublicacion(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam String titulo,
            @RequestParam String descripcion,
            @RequestParam String ubicacion,
            @RequestParam Double precioCOP,
            @RequestParam(defaultValue = "HORIZONTAL") String formato,
            @RequestParam MultipartFile imagen) {

        try {
            Publicacion pub = publicacionService.crearPublicacion(usuario, titulo, descripcion,
                    ubicacion, precioCOP, formato, imagen);

            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Publicación creada exitosamente",
                    "publicacionId", pub.getId(),
                    "estado", pub.getEstado().toString(),
                    "imagenUrl", pub.getImagenUrl()
            ));
        } catch (IOException e) {
            log.error("Error al guardar imagen", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", "Error al guardar imagen: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear publicación", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Obtener publicaciones del usuario actual
     */
    @GetMapping("/mis-publicaciones")
    public ResponseEntity<Map<String, Object>> obtenerMisPublicaciones(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Publicacion> publicaciones = publicacionService.obtenerPublicacionesUsuario(usuario, pageable);

            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "publicaciones", publicaciones.getContent(),
                    "totalPages", publicaciones.getTotalPages(),
                    "totalElements", publicaciones.getTotalElements(),
                    "currentPage", page
            ));
        } catch (Exception e) {
            log.error("Error al obtener publicaciones", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Obtener publicaciones pendientes de revisión (TECNICO/ADMIN)
     */
    @GetMapping("/pendientes-revision")
    public ResponseEntity<Map<String, Object>> obtenerPendientes(
            @AuthenticationPrincipal Usuario usuario) {

        // Validar que sea TECNICO o ADMIN
        if (!esAutorizado(usuario)) {
            return ResponseEntity.status(403)
                    .body(Map.of("exito", false, "error", "No autorizado"));
        }

        try {
            List<Publicacion> pendientes = publicacionService.obtenerPendientesRevision();

            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "cantidad", pendientes.size(),
                    "publicaciones", pendientes
            ));
        } catch (Exception e) {
            log.error("Error al obtener pendientes", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Aprobar publicación (TECNICO/ADMIN)
     */
    @PostMapping("/{id}/aprobar")
    public ResponseEntity<Map<String, Object>> aprobarPublicacion(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {

        if (!esAutorizado(usuario)) {
            return ResponseEntity.status(403)
                    .body(Map.of("exito", false, "error", "No autorizado"));
        }

        try {
            Publicacion pub = publicacionService.aprobarPublicacion(id);
            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Publicación aprobada",
                    "publicacion", pub
            ));
        } catch (Exception e) {
            log.error("Error al aprobar publicación", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Rechazar publicación (TECNICO/ADMIN)
     */
    @PostMapping("/{id}/rechazar")
    public ResponseEntity<Map<String, Object>> rechazarPublicacion(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {

        if (!esAutorizado(usuario)) {
            return ResponseEntity.status(403)
                    .body(Map.of("exito", false, "error", "No autorizado"));
        }

        try {
            Publicacion pub = publicacionService.rechazarPublicacion(id);
            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Publicación rechazada",
                    "publicacion", pub
            ));
        } catch (Exception e) {
            log.error("Error al rechazar publicación", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Activar publicación (cambiar a ACTIVA)
     */
    @PostMapping("/{id}/activar")
    public ResponseEntity<Map<String, Object>> activarPublicacion(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {

        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);

            Publicacion pub = publicacionService.activarPublicacion(id, inicio, fin);
            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Publicación activada",
                    "publicacion", pub
            ));
        } catch (Exception e) {
            log.error("Error al activar publicación", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Pausar publicación
     */
    @PostMapping("/{id}/pausar")
    public ResponseEntity<Map<String, Object>> pausarPublicacion(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {

        try {
            Publicacion pub = publicacionService.pausarPublicacion(id);
            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Publicación pausada",
                    "publicacion", pub
            ));
        } catch (Exception e) {
            log.error("Error al pausar publicación", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Eliminar publicación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarPublicacion(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id) {

        try {
            publicacionService.eliminarPublicacion(id);
            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Publicación eliminada"
            ));
        } catch (Exception e) {
            log.error("Error al eliminar publicación", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    private boolean esAutorizado(Usuario usuario) {
        String rol = usuario.getRol().toString();
        return rol.equals("ADMIN") || rol.equals("TECNICO");
    }
}
