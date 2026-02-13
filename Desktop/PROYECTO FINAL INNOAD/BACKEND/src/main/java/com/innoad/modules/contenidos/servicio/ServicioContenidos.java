package com.innoad.modules.contenidos.servicio;

import com.innoad.modules.campanas.repositorio.RepositorioCampanas;
import com.innoad.modules.contenidos.dominio.Contenido;
import com.innoad.modules.contenidos.dto.ContenidoDTO;
import com.innoad.modules.contenidos.repositorio.RepositorioContenidos;
import com.innoad.modules.auth.repository.RepositorioUsuario;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioContenidos {
    
    private final RepositorioContenidos repositorioContenidos;
    private final RepositorioCampanas repositorioCampanas;
    private final RepositorioUsuario repositorioUsuario;
    
    @Value("${app.archivos.directorio:uploads/contenidos}")
    private String directorioArchivos;
    
    @Value("${app.archivos.url-base:http://localhost:8080/archivos}")
    private String urlBase;
    
    /**
     * Cargar archivo y crear contenido
     */
    public ContenidoDTO cargarContenido(
            MultipartFile archivo,
            ContenidoDTO dto,
            String usuarioEmail
    ) throws IOException {
        validarArchivo(archivo, dto.getTipo());
        
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        var campana = repositorioCampanas.findByIdAndUsuarioId(dto.getCampanaId(), usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        // Guardar archivo
        String nombreOriginal = archivo.getOriginalFilename();
        String nombreUnico = generarNombreUnico(nombreOriginal);
        Path rutaCompleta = guardarArchivo(archivo, nombreUnico);
        
        // Crear entidad
        Contenido contenido = Contenido.builder()
            .nombre(dto.getNombre())
            .descripcion(dto.getDescripcion())
            .tipo(dto.getTipo())
            .nombreArchivo(nombreUnico)
            .rutaArchivo(rutaCompleta.toString())
            .tamaño(archivo.getSize())
            .mimeType(archivo.getContentType())
            .urlPublica(urlBase + "/" + nombreUnico)
            .estado(Contenido.EstadoContenido.BORRADOR)
            .duracionSegundos(dto.getDuracionSegundos())
            .campana(campana)
            .usuario(usuario)
            .vecesReproducido(0L)
            .build();
        
        contenido = repositorioContenidos.save(contenido);
        log.info("Contenido creado: {} por {}", contenido.getId(), usuarioEmail);
        
        return ContenidoDTO.fromEntity(contenido);
    }
    
    /**
     * Obtener contenido por ID
     */
    @Transactional(readOnly = true)
    public ContenidoDTO obtenerContenido(Long id, String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        var contenido = repositorioContenidos.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Contenido no encontrado"));
        
        return ContenidoDTO.fromEntity(contenido);
    }
    
    /**
     * Listar contenidos del usuario
     */
    @Transactional(readOnly = true)
    public Page<ContenidoDTO> listarContenidos(String usuarioEmail, Pageable pageable) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioContenidos.findByUsuarioId(usuario.getId(), pageable)
            .map(ContenidoDTO::fromEntity);
    }
    
    /**
     * Listar contenidos de una campaña
     */
    @Transactional(readOnly = true)
    public Page<ContenidoDTO> listarPorCampana(
            String usuarioEmail,
            Long campanaId,
            Pageable pageable
    ) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Validar que la campaña pertenece al usuario
        repositorioCampanas.findByIdAndUsuarioId(campanaId, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        return repositorioContenidos.findByCampanaId(usuario.getId(), campanaId, pageable)
            .map(ContenidoDTO::fromEntity);
    }
    
    /**
     * Buscar contenidos por nombre
     */
    @Transactional(readOnly = true)
    public Page<ContenidoDTO> buscarPorNombre(
            String usuarioEmail,
            String nombre,
            Pageable pageable
    ) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioContenidos.buscarPorNombre(usuario.getId(), nombre, pageable)
            .map(ContenidoDTO::fromEntity);
    }
    
    /**
     * Actualizar contenido
     */
    public ContenidoDTO actualizarContenido(
            Long id,
            ContenidoDTO dto,
            String usuarioEmail
    ) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        var contenido = repositorioContenidos.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Contenido no encontrado"));
        
        contenido.setNombre(dto.getNombre());
        contenido.setDescripcion(dto.getDescripcion());
        contenido.setDuracionSegundos(dto.getDuracionSegundos());
        
        contenido = repositorioContenidos.save(contenido);
        log.info("Contenido actualizado: {} por {}", id, usuarioEmail);
        
        return ContenidoDTO.fromEntity(contenido);
    }
    
    /**
     * Publicar/Activar contenido
     */
    public ContenidoDTO publicarContenido(Long id, String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        var contenido = repositorioContenidos.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Contenido no encontrado"));
        
        contenido.setEstado(Contenido.EstadoContenido.ACTIVO);
        contenido = repositorioContenidos.save(contenido);
        log.info("Contenido publicado: {} por {}", id, usuarioEmail);
        
        return ContenidoDTO.fromEntity(contenido);
    }
    
    /**
     * Archivar contenido
     */
    public ContenidoDTO archivarContenido(Long id, String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        var contenido = repositorioContenidos.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Contenido no encontrado"));
        
        contenido.setEstado(Contenido.EstadoContenido.ARCHIVADO);
        contenido = repositorioContenidos.save(contenido);
        log.info("Contenido archivado: {} por {}", id, usuarioEmail);
        
        return ContenidoDTO.fromEntity(contenido);
    }
    
    /**
     * Eliminar contenido (también elimina archivo)
     */
    public void eliminarContenido(Long id, String usuarioEmail) throws IOException {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        var contenido = repositorioContenidos.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Contenido no encontrado"));
        
        // Eliminar archivo físico
        try {
            Files.deleteIfExists(Paths.get(contenido.getRutaArchivo()));
        } catch (IOException e) {
            log.warn("No se pudo eliminar archivo: {}", contenido.getRutaArchivo(), e);
        }
        
        repositorioContenidos.delete(contenido);
        log.info("Contenido eliminado: {} por {}", id, usuarioEmail);
    }
    
    /**
     * Registrar reproducción
     */
    public void registrarReproduccion(Long id) {
        repositorioContenidos.findById(id).ifPresent(contenido -> {
            contenido.setVecesReproducido(contenido.getVecesReproducido() + 1);
            repositorioContenidos.save(contenido);
        });
    }
    
    /**
     * Obtener contenidos más reproducidos
     */
    @Transactional(readOnly = true)
    public List<ContenidoDTO> getContenidosMasReproducidos(String usuarioEmail) {
        var usuario = repositorioUsuario.findByEmail(usuarioEmail)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioContenidos.findContenidosMasReproducidos(usuario.getId())
            .stream()
            .map(ContenidoDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    // Métodos auxiliares
    
    private void validarArchivo(MultipartFile archivo, Contenido.TipoContenido tipo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }
        
        long maxSize = 104857600; // 100MB
        if (archivo.getSize() > maxSize) {
            throw new IllegalArgumentException("El archivo excede el tamaño máximo permitido (100MB)");
        }
        
        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith(tipo.mimeTypePrefix)) {
            throw new IllegalArgumentException("Tipo de archivo no permitido para este tipo de contenido");
        }
    }
    
    private String generarNombreUnico(String nombreOriginal) {
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        return UUID.randomUUID().toString() + extension;
    }
    
    private Path guardarArchivo(MultipartFile archivo, String nombreUnico) throws IOException {
        Path directorio = Paths.get(directorioArchivos);
        Files.createDirectories(directorio);
        
        Path rutaCompleta = directorio.resolve(nombreUnico);
        Files.write(rutaCompleta, archivo.getBytes());
        
        return rutaCompleta;
    }
}
