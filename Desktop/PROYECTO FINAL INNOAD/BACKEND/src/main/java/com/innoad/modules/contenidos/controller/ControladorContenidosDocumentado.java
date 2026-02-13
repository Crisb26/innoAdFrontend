package com.innoad.modules.contenidos.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/contenidos")
@RequiredArgsConstructor
@Tag(name = "📄 Contenidos", description = "Gestión de contenidos: textos, imágenes, videos, PDFs")
@SecurityRequirement(name = "BearerAuth")
public class ControladorContenidosDocumentado {
    
    @GetMapping
    @Operation(
        summary = "Listar contenidos",
        description = "Obtiene todos los contenidos creados con opciones de filtrado por tipo"
    )
    @ApiResponse(responseCode = "200", description = "Lista de contenidos")
    public ResponseEntity<?> listarContenidos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok("Contenidos listados");
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener contenido",
        description = "Obtiene los detalles de un contenido específico"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Contenido encontrado"),
        @ApiResponse(responseCode = "404", description = "Contenido no encontrado")
    })
    public ResponseEntity<?> obtenerContenido(@PathVariable Long id) {
        return ResponseEntity.ok("Contenido");
    }
    
    @PostMapping
    @Operation(
        summary = "Crear contenido",
        description = "Crea un nuevo contenido (texto, imagen, video, PDF, etc)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Contenido creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<?> crearContenido(@RequestBody Object solicitud) {
        return ResponseEntity.status(201).body("Contenido creado");
    }
    
    @PutMapping("/{id}")
    @Operation(
        summary = "Actualizar contenido",
        description = "Actualiza un contenido existente"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Contenido actualizado"),
        @ApiResponse(responseCode = "404", description = "Contenido no encontrado"),
        @ApiResponse(responseCode = "409", description = "Conflicto de versión")
    })
    public ResponseEntity<?> actualizarContenido(
            @PathVariable Long id,
            @RequestBody Object solicitud
    ) {
        return ResponseEntity.ok("Contenido actualizado");
    }
    
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Eliminar contenido",
        description = "Elimina un contenido. Si está en uso en campañas, genera advertencia."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Contenido eliminado"),
        @ApiResponse(responseCode = "404", description = "Contenido no encontrado"),
        @ApiResponse(responseCode = "409", description = "Contenido en uso en campañas")
    })
    public ResponseEntity<?> eliminarContenido(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/subir-archivo")
    @Operation(
        summary = "Subir archivo",
        description = "Sube un archivo asociado al contenido (imagen, video, PDF max 100MB)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Archivo subido"),
        @ApiResponse(responseCode = "413", description = "Archivo muy grande"),
        @ApiResponse(responseCode = "415", description = "Tipo de archivo no permitido")
    })
    public ResponseEntity<?> subirArchivo(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo
    ) {
        return ResponseEntity.ok("Archivo subido");
    }
    
    @GetMapping("/{id}/descargar")
    @Operation(
        summary = "Descargar contenido",
        description = "Descarga el archivo del contenido"
    )
    @ApiResponse(responseCode = "200", description = "Archivo para descargar")
    public ResponseEntity<?> descargarContenido(@PathVariable Long id) {
        return ResponseEntity.ok("Archivo");
    }
    
    @PostMapping("/{id}/previsualizar")
    @Operation(
        summary = "Previsualizar contenido",
        description = "Genera una previsualización del contenido (thumbnail para imágenes, preview para videos)"
    )
    @ApiResponse(responseCode = "200", description = "Previsualización generada")
    public ResponseEntity<?> previsualizarContenido(@PathVariable Long id) {
        return ResponseEntity.ok("Previsualización");
    }
    
    @GetMapping("/tipo/{tipo}")
    @Operation(
        summary = "Contenidos por tipo",
        description = "Filtra contenidos por tipo: IMAGEN, VIDEO, PDF, TEXTO, AUDIO"
    )
    @ApiResponse(responseCode = "200", description = "Contenidos del tipo especificado")
    public ResponseEntity<?> contenidosPorTipo(
            @PathVariable String tipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok("Contenidos");
    }
    
    @PostMapping("/buscar")
    @Operation(
        summary = "Buscar contenidos",
        description = "Busca contenidos por título, descripción o tags"
    )
    @ApiResponse(responseCode = "200", description = "Resultados de búsqueda")
    public ResponseEntity<?> buscarContenidos(
            @RequestParam String termino,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok("Resultados");
    }
    
    @GetMapping("/{id}/uso-en-campanas")
    @Operation(
        summary = "Campañas que usan este contenido",
        description = "Obtiene las campañas que utilizan este contenido"
    )
    @ApiResponse(responseCode = "200", description = "Campañas")
    public ResponseEntity<?> obtenerUsoEnCampanas(@PathVariable Long id) {
        return ResponseEntity.ok("Campañas");
    }
}
