package com.innoad.modules.publicaciones.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
@Slf4j
public class UploadController {
    
    private static final String UPLOAD_DIR = "uploads/";
    private static final long MAX_FILE_SIZE_VIDEO = 100 * 1024 * 1024; // 100 MB
    private static final long MAX_FILE_SIZE_IMAGEN = 20 * 1024 * 1024; // 20 MB
    
    public UploadController() {
        // Crear directorio si no existe
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
            log.info("Directorio de carga creado: {}", UPLOAD_DIR);
        }
    }
    
    /**
     * POST /api/upload - Cargar archivo
     * Query params: type (VIDEO | IMAGEN)
     */
    @PostMapping
    public ResponseEntity<?> subirArchivo(@RequestParam("file") MultipartFile file,
                                         @RequestParam("type") String fileType) {
        try {
            log.info("POST: Subiendo archivo - {} (tipo: {})", file.getOriginalFilename(), fileType);
            
            // Validar tipo
            if (!fileType.equals("VIDEO") && !fileType.equals("IMAGEN")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Tipo de archivo inválido. Usar VIDEO o IMAGEN"));
            }
            
            // Validar tamaño
            long maxSize = fileType.equals("VIDEO") ? MAX_FILE_SIZE_VIDEO : MAX_FILE_SIZE_IMAGEN;
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Archivo demasiado grande. Máximo: " + (maxSize / (1024 * 1024)) + " MB"));
            }
            
            // Validar extensión
            if (!validarExtension(file.getOriginalFilename(), fileType)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Extensión de archivo no permitida para tipo: " + fileType));
            }
            
            // Generar nombre único
            String nombreUnico = generarNombreUnico(file.getOriginalFilename(), fileType);
            Path rutaArchivo = Paths.get(UPLOAD_DIR, nombreUnico);
            
            // Guardar archivo
            Files.write(rutaArchivo, file.getBytes());
            
            // Respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filename", nombreUnico);
            response.put("originalName", file.getOriginalFilename());
            response.put("size", file.getSize());
            response.put("url", "/uploads/" + nombreUnico);
            
            log.info("Archivo subido exitosamente: {}", nombreUnico);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            log.error("Error al subir archivo", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al guardar archivo: " + e.getMessage()));
        }
    }
    
    /**
     * Valida que la extensión sea permitida para el tipo
     */
    private boolean validarExtension(String filename, String fileType) {
        String[] extensionesVideo = {"mp4", "avi", "mov", "mkv", "flv", "webm"};
        String[] extensionesImagen = {"jpg", "jpeg", "png", "gif", "webp", "bmp"};
        
        String extension = obtenerExtension(filename).toLowerCase();
        
        if (fileType.equals("VIDEO")) {
            for (String ext : extensionesVideo) {
                if (ext.equals(extension)) return true;
            }
        } else if (fileType.equals("IMAGEN")) {
            for (String ext : extensionesImagen) {
                if (ext.equals(extension)) return true;
            }
        }
        
        return false;
    }
    
    /**
     * Obtiene la extensión del archivo
     */
    private String obtenerExtension(String filename) {
        int lastDot = filename.lastIndexOf(".");
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
    
    /**
     * Genera un nombre único para evitar colisiones
     */
    private String generarNombreUnico(String originalFilename, String fileType) {
        String timestamp = LocalDateTime.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS"));
        String extension = obtenerExtension(originalFilename);
        return fileType.toLowerCase() + "_" + timestamp + "." + extension;
    }
}
