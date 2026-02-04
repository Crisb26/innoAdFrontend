package com.innoad.modules.contenidos.controller;

import com.innoad.modules.contenidos.dto.ContenidoDTO;
import com.innoad.modules.contenidos.servicio.ServicioContenidos;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/contenidos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "📁 Contenidos", description = "Gestión de contenidos multimedia")
@SecurityRequirement(name = "BearerAuth")
public class ControladorContenidos {
    
    private final ServicioContenidos servicioContenidos;
    
    /**
     * Cargar nuevo contenido (archivo)
     */
    @PostMapping("/cargar")
    @Operation(summary = "Cargar contenido multimedia")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cargarContenido(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("nombre") String nombre,
            @RequestParam("campanaId") Long campanaId,
            @RequestParam("tipo") String tipo,
            @RequestParam(value = "duracion", defaultValue = "10") Integer duracion,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            Authentication authentication
    ) {
        try {
            ContenidoDTO dto = ContenidoDTO.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .tipo(Enum.valueOf(com.innoad.modules.contenidos.dominio.Contenido.TipoContenido.class, tipo.toUpperCase()))
                .duracionSegundos(duracion)
                .campanaId(campanaId)
                .build();
            
            ContenidoDTO creado = servicioContenidos.cargarContenido(archivo, dto, authentication.getName());
            log.info("Contenido cargado: {}", creado.getId());
            
            return buildSuccessResponse(HttpStatus.CREATED, "Contenido cargado exitosamente", creado);
        } catch (IOException e) {
            log.error("Error al cargar contenido", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar el archivo: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error al cargar contenido", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtener contenido por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener contenido por ID")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerContenido(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            ContenidoDTO contenido = servicioContenidos.obtenerContenido(id, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Contenido obtenido", contenido);
        } catch (Exception e) {
            log.error("Error al obtener contenido", e);
            return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
    
    /**
     * Listar contenidos del usuario
     */
    @GetMapping
    @Operation(summary = "Listar contenidos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listarContenidos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long campanaId,
            @RequestParam(required = false) String nombre,
            Authentication authentication
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
            Page<ContenidoDTO> result;
            
            if (campanaId != null) {
                result = servicioContenidos.listarPorCampana(authentication.getName(), campanaId, pageable);
            } else if (nombre != null && !nombre.isBlank()) {
                result = servicioContenidos.buscarPorNombre(authentication.getName(), nombre, pageable);
            } else {
                result = servicioContenidos.listarContenidos(authentication.getName(), pageable);
            }
            
            return buildPaginatedResponse(result, page, size);
        } catch (Exception e) {
            log.error("Error al listar contenidos", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Actualizar contenido
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar contenido")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> actualizarContenido(
            @PathVariable Long id,
            @Valid @RequestBody ContenidoDTO dto,
            Authentication authentication
    ) {
        try {
            ContenidoDTO actualizado = servicioContenidos.actualizarContenido(id, dto, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Contenido actualizado", actualizado);
        } catch (Exception e) {
            log.error("Error al actualizar contenido", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Publicar contenido
     */
    @PatchMapping("/{id}/publicar")
    @Operation(summary = "Publicar contenido")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> publicarContenido(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            ContenidoDTO actualizado = servicioContenidos.publicarContenido(id, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Contenido publicado", actualizado);
        } catch (Exception e) {
            log.error("Error al publicar contenido", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Archivar contenido
     */
    @PatchMapping("/{id}/archivar")
    @Operation(summary = "Archivar contenido")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> archivarContenido(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            ContenidoDTO actualizado = servicioContenidos.archivarContenido(id, authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Contenido archivado", actualizado);
        } catch (Exception e) {
            log.error("Error al archivar contenido", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Eliminar contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar contenido")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> eliminarContenido(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            servicioContenidos.eliminarContenido(id, authentication.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contenido eliminado");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error al eliminar contenido", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error al eliminar: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error al eliminar contenido", e);
            return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Registrar reproducción
     */
    @PostMapping("/{id}/reproducir")
    @Operation(summary = "Registrar reproducción de contenido")
    public ResponseEntity<?> registrarReproduccion(@PathVariable Long id) {
        try {
            servicioContenidos.registrarReproduccion(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reproducción registrada");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al registrar reproducción", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
    
    /**
     * Obtener contenidos más reproducidos
     */
    @GetMapping("/mas-reproducidos")
    @Operation(summary = "Obtener contenidos más reproducidos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getContenidosMasReproducidos(Authentication authentication) {
        try {
            var contenidos = servicioContenidos.getContenidosMasReproducidos(authentication.getName());
            return buildSuccessResponse(HttpStatus.OK, "Contenidos más reproducidos", contenidos);
        } catch (Exception e) {
            log.error("Error al obtener contenidos más reproducidos", e);
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
    
    private ResponseEntity<?> buildPaginatedResponse(Page<?> page, int pageNum, int size) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Contenidos listados");
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
