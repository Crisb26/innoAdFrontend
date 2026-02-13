package com.innoad.modules.publicaciones.controller;

import com.innoad.modules.publicaciones.servicio.PublicacionServicio;
import com.innoad.modules.publicaciones.dto.PublicacionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/publicaciones")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@Slf4j
public class PublicacionController {
    
    @Autowired
    private PublicacionServicio publicacionServicio;
    
    /**
     * POST /api/publicaciones - Crear nueva publicación
     */
    @PostMapping
    public ResponseEntity<?> crearPublicacion(@RequestBody PublicacionDTO dto) {
        try {
            log.info("POST: Creando publicación - {}", dto.getTitulo());
            PublicacionDTO created = publicacionServicio.crearPublicacion(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Error al crear publicación", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * POST /api/publicaciones/borrador - Guardar publicación como borrador
     */
    @PostMapping("/borrador")
    public ResponseEntity<?> guardarBorrador(@RequestBody PublicacionDTO dto) {
        try {
            log.info("POST: Guardando publicación como borrador - {}", dto.getTitulo());
            dto.setEstado("BORRADOR");
            PublicacionDTO created = publicacionServicio.crearPublicacion(dto);
            return ResponseEntity.ok(Map.of(
                "mensaje", "Publicación guardada como borrador exitosamente",
                "publicacionId", created.getId(),
                "estado", "BORRADOR"
            ));
        } catch (Exception e) {
            log.error("Error al guardar borrador", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * POST /api/publicaciones/mis - Obtener mis publicaciones (del usuario autenticado)
     */
    @GetMapping("/mis")
    public ResponseEntity<?> obtenerMisPublicaciones() {
        try {
            log.info("GET: Obteniendo mis publicaciones");
            // Nota: En producción, obtener usuarioId del JWT token
            // Por ahora, se puede pasar como parámetro o desde contexto de seguridad
            List<PublicacionDTO> mis = publicacionServicio.obtenerPublicacionesPublicadas();
            return ResponseEntity.ok(mis);
        } catch (Exception e) {
            log.error("Error al obtener mis publicaciones", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/publicaciones/usuario/{usuarioId} - Obtener publicaciones del usuario
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerPublicacionesUsuario(@PathVariable Long usuarioId) {
        try {
            log.info("GET: Obteniendo publicaciones del usuario - {}", usuarioId);
            List<PublicacionDTO> publicaciones = publicacionServicio.obtenerPublicacionesUsuario(usuarioId);
            return ResponseEntity.ok(publicaciones);
        } catch (Exception e) {
            log.error("Error al obtener publicaciones del usuario", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/publicaciones/{id} - Obtener publicación por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPublicacionPorId(@PathVariable Long id) {
        try {
            log.info("GET: Obteniendo publicación - {}", id);
            PublicacionDTO publicacion = publicacionServicio.obtenerPublicacionPorId(id);
            return ResponseEntity.ok(publicacion);
        } catch (Exception e) {
            log.error("Error al obtener publicación", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/publicaciones/pendientes - Obtener publicaciones pendientes (TECNICO)
     */
    @GetMapping("/pendientes/lista")
    public ResponseEntity<?> obtenerPublicacionesPendientes() {
        try {
            log.info("GET: Obteniendo publicaciones pendientes");
            List<PublicacionDTO> pendientes = publicacionServicio.obtenerPublicacionesPendientes();
            return ResponseEntity.ok(pendientes);
        } catch (Exception e) {
            log.error("Error al obtener publicaciones pendientes", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/publicaciones/{id}/aprobar - Aprobar publicación
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarPublicacion(@PathVariable Long id) {
        try {
            log.info("PUT: Aprobando publicación - {}", id);
            PublicacionDTO aprobada = publicacionServicio.aprobarPublicacion(id);
            return ResponseEntity.ok(aprobada);
        } catch (Exception e) {
            log.error("Error al aprobar publicación", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/publicaciones/{id}/rechazar - Rechazar publicación
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarPublicacion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            log.info("PUT: Rechazando publicación - {}", id);
            String motivo = body.getOrDefault("motivo", "");
            PublicacionDTO rechazada = publicacionServicio.rechazarPublicacion(id, motivo);
            return ResponseEntity.ok(rechazada);
        } catch (Exception e) {
            log.error("Error al rechazar publicación", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * PUT /api/publicaciones/{id}/publicar - Publicar publicación aprobada
     */
    @PutMapping("/{id}/publicar")
    public ResponseEntity<?> publicarPublicacion(@PathVariable Long id) {
        try {
            log.info("PUT: Publicando - {}", id);
            PublicacionDTO publicada = publicacionServicio.publicarPublicacion(id);
            return ResponseEntity.ok(publicada);
        } catch (Exception e) {
            log.error("Error al publicar", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /api/publicaciones/publicadas/feed - Obtener feed de publicaciones
     */
    @GetMapping("/publicadas/feed")
    public ResponseEntity<?> obtenerFeed() {
        try {
            log.info("GET: Obteniendo feed de publicaciones");
            List<PublicacionDTO> feed = publicacionServicio.obtenerPublicacionesPublicadas();
            return ResponseEntity.ok(feed);
        } catch (Exception e) {
            log.error("Error al obtener feed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
