package com.innoad.modules.content.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Servicio para gestionar el almacenamiento de archivos (imágenes, videos, etc.)
 * En producción, se recomienda usar un servicio de almacenamiento en la nube como AWS S3, Cloudinary, etc.
 */
@Service
@Slf4j
public class ServicioAlmacenamiento {

    @Value("${innoad.storage.directory:uploads}")
    private String directorioAlmacenamiento;

    @Value("${innoad.storage.base-url:http://localhost:8081/uploads}")
    private String urlBase;

    /**
     * Almacena un archivo y retorna la URL pública
     */
    public String almacenarArchivo(MultipartFile archivo) throws IOException {
        // Validar que el archivo no esté vacío
        if (archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        // Crear directorio si no existe
        Path directorio = Paths.get(directorioAlmacenamiento);
        if (!Files.exists(directorio)) {
            Files.createDirectories(directorio);
            log.info("Directorio de almacenamiento creado: {}", directorio.toAbsolutePath());
        }

        // Generar nombre único para el archivo
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        String nombreUnico = UUID.randomUUID().toString() + extension;

        // Guardar el archivo
        Path rutaDestino = directorio.resolve(nombreUnico);
        Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

        log.info("Archivo almacenado: {} -> {}", nombreOriginal, nombreUnico);

        // Retornar URL pública
        return urlBase + "/" + nombreUnico;
    }

    /**
     * Elimina un archivo del almacenamiento
     */
    public void eliminarArchivo(String url) {
        try {
            // Extraer nombre del archivo de la URL
            String nombreArchivo = url.substring(url.lastIndexOf("/") + 1);
            Path rutaArchivo = Paths.get(directorioAlmacenamiento).resolve(nombreArchivo);

            if (Files.exists(rutaArchivo)) {
                Files.delete(rutaArchivo);
                log.info("Archivo eliminado: {}", nombreArchivo);
            } else {
                log.warn("Archivo no encontrado para eliminar: {}", nombreArchivo);
            }
        } catch (Exception e) {
            log.error("Error al eliminar archivo: {}", url, e);
        }
    }

    /**
     * Valida que el archivo sea una imagen
     */
    public boolean esImagen(MultipartFile archivo) {
        String tipoMime = archivo.getContentType();
        return tipoMime != null && tipoMime.startsWith("image/");
    }

    /**
     * Valida que el archivo sea un video
     */
    public boolean esVideo(MultipartFile archivo) {
        String tipoMime = archivo.getContentType();
        return tipoMime != null && tipoMime.startsWith("video/");
    }

    /**
     * Valida el tamaño del archivo (en MB)
     */
    public boolean validarTamano(MultipartFile archivo, long tamanoMaximoMB) {
        long tamanoBytes = archivo.getSize();
        long tamanoMaximoBytes = tamanoMaximoMB * 1024 * 1024;
        return tamanoBytes <= tamanoMaximoBytes;
    }

    /**
     * Obtiene el tipo MIME del archivo
     */
    public String obtenerTipoMime(MultipartFile archivo) {
        return archivo.getContentType();
    }

    /**
     * Obtiene el tamaño del archivo en bytes
     */
    public long obtenerTamano(MultipartFile archivo) {
        return archivo.getSize();
    }
}
