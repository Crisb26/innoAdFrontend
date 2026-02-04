package com.innoad.modules.publicaciones.servicio;

import com.innoad.modules.publicaciones.model.Publicacion;
import com.innoad.modules.publicaciones.repository.PublicacionRepository;
import com.innoad.modules.publicaciones.dto.PublicacionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PublicacionServicio {
    
    @Autowired
    private PublicacionRepository publicacionRepository;
    
    /**
     * Crea una nueva publicación
     */
    public PublicacionDTO crearPublicacion(PublicacionDTO dto) {
        log.info("Creando nueva publicación: {}", dto.getTitulo());
        
        Publicacion publicacion = new Publicacion();
        publicacion.setTitulo(dto.getTitulo());
        publicacion.setDescripcion(dto.getDescripcion());
        publicacion.setTipoContenido(Publicacion.TipoContenido.valueOf(dto.getTipoContenido()));
        publicacion.setArchivoUrl(dto.getArchivoUrl());
        publicacion.setDuracionDias(dto.getDuracionDias());
        publicacion.setUsuarioId(dto.getUsuarioId());
        publicacion.setCostoTotal(dto.getCostoTotal());
        publicacion.setUbicacionesJson(dto.getUbicacionesJson());
        publicacion.setEstado(Publicacion.EstadoPublicacion.PENDIENTE);
        publicacion.setFechaCreacion(LocalDateTime.now());
        
        Publicacion saved = publicacionRepository.save(publicacion);
        return convertirADTO(saved);
    }
    
    /**
     * Obtiene publicaciones del usuario
     */
    public List<PublicacionDTO> obtenerPublicacionesUsuario(Long usuarioId) {
        log.info("Obteniendo publicaciones del usuario: {}", usuarioId);
        return publicacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene una publicación por ID
     */
    public PublicacionDTO obtenerPublicacionPorId(Long id) {
        log.info("Obteniendo publicación con ID: {}", id);
        return publicacionRepository.findById(id)
            .map(this::convertirADTO)
            .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
    }
    
    /**
     * Obtiene publicaciones pendientes de aprobación
     */
    public List<PublicacionDTO> obtenerPublicacionesPendientes() {
        log.info("Obteniendo publicaciones pendientes");
        return publicacionRepository.findPublicacionesPendientes(Publicacion.EstadoPublicacion.PENDIENTE)
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Aprueba una publicación
     */
    public PublicacionDTO aprobarPublicacion(Long id) {
        log.info("Aprobando publicación con ID: {}", id);
        
        Publicacion publicacion = publicacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        
        publicacion.setEstado(Publicacion.EstadoPublicacion.APROBADO);
        publicacion.setFechaAprobacion(LocalDateTime.now());
        
        Publicacion saved = publicacionRepository.save(publicacion);
        return convertirADTO(saved);
    }
    
    /**
     * Rechaza una publicación
     */
    public PublicacionDTO rechazarPublicacion(Long id, String motivo) {
        log.info("Rechazando publicación con ID: {}", id);
        
        Publicacion publicacion = publicacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        
        publicacion.setEstado(Publicacion.EstadoPublicacion.RECHAZADO);
        publicacion.setFechaRechazo(LocalDateTime.now());
        publicacion.setMotivoRechazo(motivo);
        
        Publicacion saved = publicacionRepository.save(publicacion);
        return convertirADTO(saved);
    }
    
    /**
     * Publica una publicación aprobada
     */
    public PublicacionDTO publicarPublicacion(Long id) {
        log.info("Publicando con ID: {}", id);
        
        Publicacion publicacion = publicacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        
        if (!publicacion.getEstado().equals(Publicacion.EstadoPublicacion.APROBADO)) {
            throw new RuntimeException("Solo se pueden publicar publicaciones aprobadas");
        }
        
        publicacion.setEstado(Publicacion.EstadoPublicacion.PUBLICADO);
        publicacion.setFechaPublicacion(LocalDateTime.now());
        
        Publicacion saved = publicacionRepository.save(publicacion);
        return convertirADTO(saved);
    }
    
    /**
     * Obtiene publicaciones publicadas (para feed público)
     */
    public List<PublicacionDTO> obtenerPublicacionesPublicadas() {
        log.info("Obteniendo publicaciones publicadas");
        return publicacionRepository.findByEstado(Publicacion.EstadoPublicacion.PUBLICADO)
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    // CONVERSIÓN
    private PublicacionDTO convertirADTO(Publicacion publicacion) {
        PublicacionDTO dto = new PublicacionDTO();
        dto.setId(publicacion.getId());
        dto.setTitulo(publicacion.getTitulo());
        dto.setDescripcion(publicacion.getDescripcion());
        dto.setTipoContenido(publicacion.getTipoContenido().toString());
        dto.setArchivoUrl(publicacion.getArchivoUrl());
        dto.setDuracionDias(publicacion.getDuracionDias());
        dto.setEstado(publicacion.getEstado().toString());
        dto.setUsuarioId(publicacion.getUsuarioId());
        dto.setCostoTotal(publicacion.getCostoTotal());
        dto.setUbicacionesJson(publicacion.getUbicacionesJson());
        dto.setFechaCreacion(publicacion.getFechaCreacion());
        dto.setFechaAprobacion(publicacion.getFechaAprobacion());
        dto.setFechaRechazo(publicacion.getFechaRechazo());
        dto.setMotivoRechazo(publicacion.getMotivoRechazo());
        dto.setFechaPublicacion(publicacion.getFechaPublicacion());
        dto.setFechaFinalizacion(publicacion.getFechaFinalizacion());
        return dto;
    }
}
