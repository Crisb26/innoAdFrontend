package com.innoad.modules.publicaciones.service;

import com.innoad.modules.publicaciones.domain.Publicacion;
import com.innoad.modules.publicaciones.repository.PublicacionRepository;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicacionService {

    private final PublicacionRepository publicacionRepository;

    @Value("${innoad.upload.dir:uploads/publicaciones}")
    private String uploadDir;

    /**
     * Crear publicación con imagen
     */
    @Transactional
    public Publicacion crearPublicacion(Usuario usuario, String titulo, String descripcion,
                                        String ubicacion, Double precioCOP, String formato,
                                        MultipartFile imagen) throws IOException {

        // Guardar imagen
        String imagenUrl = guardarImagen(imagen);

        Publicacion publicacion = Publicacion.builder()
                .titulo(titulo)
                .descripcion(descripcion)
                .ubicacion(ubicacion)
                .precioCOP(precioCOP)
                .formato(Publicacion.TipoFormato.valueOf(formato.toUpperCase()))
                .imagenUrl(imagenUrl)
                .usuario(usuario)
                .estado(Publicacion.EstadoPublicacion.PENDIENTE_REVISION)
                .build();

        Publicacion saved = publicacionRepository.save(publicacion);
        log.info("Publicación creada: {} por usuario {}", saved.getId(), usuario.getId());
        return saved;
    }

    /**
     * Obtener publicaciones del usuario
     */
    public Page<Publicacion> obtenerPublicacionesUsuario(Usuario usuario, Pageable pageable) {
        return publicacionRepository.findByUsuario(usuario, pageable);
    }

    /**
     * Obtener publicaciones pendientes de revisión (para técnico)
     */
    public List<Publicacion> obtenerPendientesRevision() {
        return publicacionRepository.findByEstado(Publicacion.EstadoPublicacion.PENDIENTE_REVISION);
    }

    /**
     * Aprobar publicación (solo TECNICO/ADMIN)
     */
    @Transactional
    public Publicacion aprobarPublicacion(Long id) {
        Publicacion pub = publicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        pub.setEstado(Publicacion.EstadoPublicacion.APROBADA);
        Publicacion updated = publicacionRepository.save(pub);
        log.info("Publicación aprobada: {}", id);
        return updated;
    }

    /**
     * Rechazar publicación (solo TECNICO/ADMIN)
     */
    @Transactional
    public Publicacion rechazarPublicacion(Long id) {
        Publicacion pub = publicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        pub.setEstado(Publicacion.EstadoPublicacion.RECHAZADA);
        Publicacion updated = publicacionRepository.save(pub);
        log.info("Publicación rechazada: {}", id);
        return updated;
    }

    /**
     * Activar publicación (cambiar estado a ACTIVA)
     */
    @Transactional
    public Publicacion activarPublicacion(Long id, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        Publicacion pub = publicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

        if (pub.getEstado() != Publicacion.EstadoPublicacion.APROBADA) {
            throw new RuntimeException("Solo se pueden activar publicaciones aprobadas");
        }

        pub.setEstado(Publicacion.EstadoPublicacion.ACTIVA);
        pub.setFechaInicio(fechaInicio);
        pub.setFechaFin(fechaFin);

        Publicacion updated = publicacionRepository.save(pub);
        log.info("Publicación activada: {}", id);
        return updated;
    }

    /**
     * Pausar publicación
     */
    @Transactional
    public Publicacion pausarPublicacion(Long id) {
        Publicacion pub = publicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        pub.setEstado(Publicacion.EstadoPublicacion.PAUSADA);
        Publicacion updated = publicacionRepository.save(pub);
        log.info("Publicación pausada: {}", id);
        return updated;
    }

    /**
     * Eliminar publicación
     */
    @Transactional
    public void eliminarPublicacion(Long id) {
        Publicacion pub = publicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));

        // Eliminar imagen del servidor
        try {
            eliminarImagen(pub.getImagenUrl());
        } catch (IOException e) {
            log.warn("No se pudo eliminar imagen: {}", pub.getImagenUrl());
        }

        publicacionRepository.delete(pub);
        log.info("Publicación eliminada: {}", id);
    }

    /**
     * Guardar imagen en el servidor
     */
    private String guardarImagen(MultipartFile archivo) throws IOException {
        if (archivo.isEmpty()) {
            throw new RuntimeException("Archivo vacío");
        }

        // Validar tipo de archivo
        String contentType = archivo.getContentType();
        if (!isImagenValida(contentType)) {
            throw new RuntimeException("Tipo de archivo no permitido: " + contentType);
        }

        // Validar tamaño (máximo 10MB)
        if (archivo.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("Archivo muy grande. Máximo 10MB");
        }

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // Generar nombre único
        String nombreArchivo = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
        Path filePath = uploadPath.resolve(nombreArchivo);

        // Guardar archivo
        Files.write(filePath, archivo.getBytes());

        log.info("Imagen guardada: {}", nombreArchivo);
        return "/uploads/publicaciones/" + nombreArchivo;
    }

    /**
     * Eliminar imagen
     */
    private void eliminarImagen(String imagenUrl) throws IOException {
        if (imagenUrl == null || imagenUrl.isEmpty()) {
            return;
        }

        // Extraer nombre del archivo de la URL
        String nombreArchivo = imagenUrl.substring(imagenUrl.lastIndexOf("/") + 1);
        Path filePath = Paths.get(uploadDir, nombreArchivo);

        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("Imagen eliminada: {}", nombreArchivo);
        }
    }

    /**
     * Validar si es imagen
     */
    private boolean isImagenValida(String contentType) {
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/gif") ||
            contentType.equals("image/webp")
        );
    }
}
