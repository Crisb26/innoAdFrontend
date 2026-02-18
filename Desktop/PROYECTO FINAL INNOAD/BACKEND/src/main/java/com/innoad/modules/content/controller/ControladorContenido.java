package com.innoad.modules.content.controller;

import com.innoad.dto.solicitud.SolicitudContenido;
import com.innoad.dto.respuesta.RespuestaAPI;
import com.innoad.dto.respuesta.RespuestaContenido;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.content.service.ServicioContenido;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controlador para gestionar contenidos publicitarios
 */
@RestController
@RequestMapping("/api/v1/contenidos")
@RequiredArgsConstructor
@Tag(name = "Contenidos", description = "Gestión de contenidos publicitarios")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"})
public class ControladorContenido {

    private final ServicioContenido servicioContenido;

    /**
     * Crea un nuevo contenido sin archivo
     */
    @PostMapping
    @Operation(summary = "Crear contenido", description = "Crea un nuevo contenido publicitario")
    public ResponseEntity<RespuestaAPI<RespuestaContenido>> crearContenido(
            @Valid @RequestBody SolicitudContenido solicitud,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaContenido contenido = servicioContenido.crearContenido(solicitud, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(true)
                            .mensaje("Contenido creado exitosamente")
                            .datos(contenido)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(false)
                            .mensaje("Error al crear contenido: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Crea un nuevo contenido con archivo (imagen o video)
     */
    @PostMapping("/con-archivo")
    @Operation(summary = "Crear contenido con archivo", description = "Crea un contenido con imagen o video")
    public ResponseEntity<RespuestaAPI<RespuestaContenido>> crearContenidoConArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("titulo") String titulo,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam("tipo") String tipo,
            @RequestParam("duracionSegundos") Integer duracionSegundos,
            @RequestParam("pantallaId") Long pantallaId,
            @RequestParam(value = "orden", required = false, defaultValue = "0") Integer orden,
            @RequestParam(value = "prioridad", required = false, defaultValue = "NORMAL") String prioridad,
            @RequestParam(value = "estado", required = false, defaultValue = "BORRADOR") String estado,
            @RequestParam(value = "tags", required = false) String tags,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            // Crear solicitud
            SolicitudContenido solicitud = SolicitudContenido.builder()
                    .titulo(titulo)
                    .descripcion(descripcion)
                    .tipo(tipo)
                    .duracionSegundos(duracionSegundos)
                    .pantallaId(pantallaId)
                    .orden(orden)
                    .prioridad(prioridad)
                    .estado(estado)
                    .tags(tags)
                    .build();

            RespuestaContenido contenido = servicioContenido.crearContenidoConArchivo(solicitud, archivo, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(true)
                            .mensaje("Contenido creado exitosamente")
                            .datos(contenido)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(false)
                            .mensaje("Error al crear contenido: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Obtiene todos los contenidos del usuario autenticado
     */
    @GetMapping
    @Operation(summary = "Listar contenidos", description = "Obtiene todos los contenidos del usuario")
    public ResponseEntity<RespuestaAPI<List<RespuestaContenido>>> obtenerContenidos(
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            List<RespuestaContenido> contenidos = servicioContenido.obtenerContenidosPorUsuario(usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaContenido>>builder()
                            .exitoso(true)
                            .mensaje("Contenidos obtenidos exitosamente")
                            .datos(contenidos)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaContenido>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener contenidos: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Obtiene contenidos de una pantalla específica
     */
    @GetMapping("/pantalla/{pantallaId}")
    @Operation(summary = "Listar contenidos por pantalla", description = "Obtiene contenidos de una pantalla")
    public ResponseEntity<RespuestaAPI<List<RespuestaContenido>>> obtenerContenidosPorPantalla(
            @PathVariable Long pantallaId,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            List<RespuestaContenido> contenidos = servicioContenido.obtenerContenidosPorPantalla(pantallaId, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaContenido>>builder()
                            .exitoso(true)
                            .mensaje("Contenidos obtenidos exitosamente")
                            .datos(contenidos)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaContenido>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener contenidos: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Obtiene un contenido por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener contenido", description = "Obtiene un contenido por su ID")
    public ResponseEntity<RespuestaAPI<RespuestaContenido>> obtenerContenido(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaContenido contenido = servicioContenido.obtenerContenido(id, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(true)
                            .mensaje("Contenido obtenido exitosamente")
                            .datos(contenido)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener contenido: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Actualiza un contenido existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar contenido", description = "Actualiza un contenido existente")
    public ResponseEntity<RespuestaAPI<RespuestaContenido>> actualizarContenido(
            @PathVariable Long id,
            @Valid @RequestBody SolicitudContenido solicitud,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaContenido contenido = servicioContenido.actualizarContenido(id, solicitud, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(true)
                            .mensaje("Contenido actualizado exitosamente")
                            .datos(contenido)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(false)
                            .mensaje("Error al actualizar contenido: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Elimina un contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar contenido", description = "Elimina un contenido")
    public ResponseEntity<RespuestaAPI<Void>> eliminarContenido(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            servicioContenido.eliminarContenido(id, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Contenido eliminado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error al eliminar contenido: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Cambia el estado de un contenido
     */
    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado", description = "Cambia el estado de un contenido")
    public ResponseEntity<RespuestaAPI<RespuestaContenido>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            @AuthenticationPrincipal Usuario usuario
    ) {
        try {
            RespuestaContenido contenido = servicioContenido.cambiarEstado(id, estado, usuario);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(true)
                            .mensaje("Estado cambiado exitosamente")
                            .datos(contenido)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaContenido>builder()
                            .exitoso(false)
                            .mensaje("Error al cambiar estado: " + e.getMessage())
                            .build());
        }
    }
}
