package com.innoad.modules.content.service;

import com.innoad.dto.solicitud.SolicitudContenido;
import com.innoad.dto.respuesta.RespuestaContenido;
import com.innoad.modules.content.domain.Contenido;
import com.innoad.modules.screens.domain.Pantalla;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.content.repository.RepositorioContenido;
import com.innoad.modules.screens.repository.RepositorioPantalla;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar contenidos publicitarios
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioContenido {

    private final RepositorioContenido repositorioContenido;
    private final RepositorioPantalla repositorioPantalla;
    private final ServicioAlmacenamiento servicioAlmacenamiento;

    /**
     * Crea un nuevo contenido
     */
    @Transactional
    public RespuestaContenido crearContenido(SolicitudContenido solicitud, Usuario usuario) {
        // Verificar que la pantalla existe y el usuario tiene acceso
        Pantalla pantalla = repositorioPantalla.findById(solicitud.getPantallaId())
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));

        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para agregar contenido a esta pantalla");
        }

        // Crear el contenido
        Contenido contenido = Contenido.builder()
                .titulo(solicitud.getTitulo())
                .descripcion(solicitud.getDescripcion())
                .tipo(solicitud.getTipo())
                .urlArchivo(solicitud.getUrlArchivo())
                .nombreArchivo(solicitud.getNombreArchivo())
                .tamanoArchivo(solicitud.getTamanoArchivo())
                .tipoMime(solicitud.getTipoMime())
                .contenidoTexto(solicitud.getContenidoTexto())
                .contenidoHtml(solicitud.getContenidoHtml())
                .duracionSegundos(solicitud.getDuracionSegundos())
                .orden(solicitud.getOrden() != null ? solicitud.getOrden() : 0)
                .prioridad(solicitud.getPrioridad() != null ? solicitud.getPrioridad() : "NORMAL")
                .estado(solicitud.getEstado() != null ? solicitud.getEstado() : "BORRADOR")
                .fechaInicio(solicitud.getFechaInicio())
                .fechaFin(solicitud.getFechaFin())
                .pantalla(pantalla)
                .usuario(usuario)
                .tags(solicitud.getTags())
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .vecesReproducido(0)
                .build();

        Contenido contenidoGuardado = repositorioContenido.save(contenido);
        log.info("Contenido creado: {} - Tipo: {} - Usuario: {}",
                contenidoGuardado.getTitulo(), contenidoGuardado.getTipo(), usuario.getNombreUsuario());

        return convertirARespuesta(contenidoGuardado);
    }

    /**
     * Crea un contenido con archivo (imagen o video)
     */
    @Transactional
    public RespuestaContenido crearContenidoConArchivo(
            SolicitudContenido solicitud,
            MultipartFile archivo,
            Usuario usuario) throws IOException {

        // Validar el archivo según el tipo
        if ("IMAGEN".equals(solicitud.getTipo())) {
            if (!servicioAlmacenamiento.esImagen(archivo)) {
                throw new IllegalArgumentException("El archivo debe ser una imagen");
            }
            if (!servicioAlmacenamiento.validarTamano(archivo, 10)) {
                throw new IllegalArgumentException("La imagen no puede exceder 10 MB");
            }
        } else if ("VIDEO".equals(solicitud.getTipo())) {
            if (!servicioAlmacenamiento.esVideo(archivo)) {
                throw new IllegalArgumentException("El archivo debe ser un video");
            }
            if (!servicioAlmacenamiento.validarTamano(archivo, 100)) {
                throw new IllegalArgumentException("El video no puede exceder 100 MB");
            }
        }

        // Almacenar el archivo
        String urlArchivo = servicioAlmacenamiento.almacenarArchivo(archivo);

        // Actualizar solicitud con información del archivo
        solicitud.setUrlArchivo(urlArchivo);
        solicitud.setNombreArchivo(archivo.getOriginalFilename());
        solicitud.setTamanoArchivo(servicioAlmacenamiento.obtenerTamano(archivo));
        solicitud.setTipoMime(servicioAlmacenamiento.obtenerTipoMime(archivo));

        return crearContenido(solicitud, usuario);
    }

    /**
     * Actualiza un contenido existente
     */
    @Transactional
    public RespuestaContenido actualizarContenido(Long contenidoId, SolicitudContenido solicitud, Usuario usuario) {
        Contenido contenido = obtenerContenidoPorId(contenidoId);

        // Verificar permisos
        if (!contenido.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para actualizar este contenido");
        }

        // Actualizar campos
        contenido.setTitulo(solicitud.getTitulo());
        contenido.setDescripcion(solicitud.getDescripcion());
        contenido.setContenidoTexto(solicitud.getContenidoTexto());
        contenido.setContenidoHtml(solicitud.getContenidoHtml());
        contenido.setDuracionSegundos(solicitud.getDuracionSegundos());

        if (solicitud.getOrden() != null) {
            contenido.setOrden(solicitud.getOrden());
        }

        if (solicitud.getPrioridad() != null) {
            contenido.setPrioridad(solicitud.getPrioridad());
        }

        if (solicitud.getEstado() != null) {
            contenido.setEstado(solicitud.getEstado());
        }

        contenido.setFechaInicio(solicitud.getFechaInicio());
        contenido.setFechaFin(solicitud.getFechaFin());
        contenido.setTags(solicitud.getTags());
        contenido.setFechaActualizacion(LocalDateTime.now());

        Contenido contenidoActualizado = repositorioContenido.save(contenido);
        log.info("Contenido actualizado: {} - Usuario: {}",
                contenidoActualizado.getTitulo(), usuario.getNombreUsuario());

        return convertirARespuesta(contenidoActualizado);
    }

    /**
     * Obtiene todos los contenidos de un usuario
     */
    @Transactional(readOnly = true)
    public List<RespuestaContenido> obtenerContenidosPorUsuario(Usuario usuario) {
        List<Contenido> contenidos;

        if (usuario.esAdministrador()) {
            contenidos = repositorioContenido.findAll();
        } else {
            contenidos = repositorioContenido.findByUsuario(usuario);
        }

        return contenidos.stream()
                .map(this::convertirARespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene contenidos de una pantalla
     */
    @Transactional(readOnly = true)
    public List<RespuestaContenido> obtenerContenidosPorPantalla(Long pantallaId, Usuario usuario) {
        // Verificar que la pantalla existe y el usuario tiene acceso
        Pantalla pantalla = repositorioPantalla.findById(pantallaId)
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));

        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para ver contenidos de esta pantalla");
        }

        List<Contenido> contenidos = repositorioContenido.findByPantallaId(pantallaId);

        return contenidos.stream()
                .map(this::convertirARespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un contenido por ID
     */
    @Transactional(readOnly = true)
    public RespuestaContenido obtenerContenido(Long contenidoId, Usuario usuario) {
        Contenido contenido = obtenerContenidoPorId(contenidoId);

        // Verificar permisos
        if (!contenido.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para ver este contenido");
        }

        return convertirARespuesta(contenido);
    }

    /**
     * Elimina un contenido
     */
    @Transactional
    public void eliminarContenido(Long contenidoId, Usuario usuario) {
        Contenido contenido = obtenerContenidoPorId(contenidoId);

        // Verificar permisos
        if (!contenido.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para eliminar este contenido");
        }

        // Eliminar archivo si existe
        if (contenido.getUrlArchivo() != null) {
            servicioAlmacenamiento.eliminarArchivo(contenido.getUrlArchivo());
        }

        repositorioContenido.delete(contenido);
        log.info("Contenido eliminado: {} - Usuario: {}", contenido.getTitulo(), usuario.getNombreUsuario());
    }

    /**
     * Obtiene contenidos activos de una pantalla (para Raspberry Pi)
     */
    @Transactional(readOnly = true)
    public List<RespuestaContenido> obtenerContenidosActivosParaPantalla(String codigoIdentificacion) {
        Pantalla pantalla = repositorioPantalla.findByCodigoIdentificacion(codigoIdentificacion)
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));

        List<Contenido> contenidos = repositorioContenido.findContenidosActivosByPantallaId(
                pantalla.getId(),
                LocalDateTime.now()
        );

        return contenidos.stream()
                .map(this::convertirARespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Registra la reproducción de un contenido
     */
    @Transactional
    public void registrarReproduccion(Long contenidoId) {
        Contenido contenido = obtenerContenidoPorId(contenidoId);
        contenido.incrementarReproducciones();
        repositorioContenido.save(contenido);
        log.debug("Reproducción registrada - Contenido: {}", contenido.getTitulo());
    }

    /**
     * Cambia el estado de un contenido
     */
    @Transactional
    public RespuestaContenido cambiarEstado(Long contenidoId, String nuevoEstado, Usuario usuario) {
        Contenido contenido = obtenerContenidoPorId(contenidoId);

        // Verificar permisos
        if (!contenido.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para cambiar el estado de este contenido");
        }

        contenido.setEstado(nuevoEstado);
        contenido.setFechaActualizacion(LocalDateTime.now());

        Contenido contenidoActualizado = repositorioContenido.save(contenido);
        log.info("Estado de contenido cambiado: {} -> {} - Usuario: {}",
                contenido.getTitulo(), nuevoEstado, usuario.getNombreUsuario());

        return convertirARespuesta(contenidoActualizado);
    }

    // Métodos auxiliares

    private Contenido obtenerContenidoPorId(Long contenidoId) {
        return repositorioContenido.findById(contenidoId)
                .orElseThrow(() -> new IllegalArgumentException("Contenido no encontrado"));
    }

    private RespuestaContenido convertirARespuesta(Contenido contenido) {
        return RespuestaContenido.builder()
                .id(contenido.getId())
                .titulo(contenido.getTitulo())
                .descripcion(contenido.getDescripcion())
                .tipo(contenido.getTipo())
                .urlArchivo(contenido.getUrlArchivo())
                .nombreArchivo(contenido.getNombreArchivo())
                .tamanoArchivo(contenido.getTamanoArchivo())
                .tipoMime(contenido.getTipoMime())
                .contenidoTexto(contenido.getContenidoTexto())
                .contenidoHtml(contenido.getContenidoHtml())
                .duracionSegundos(contenido.getDuracionSegundos())
                .orden(contenido.getOrden())
                .prioridad(contenido.getPrioridad())
                .estado(contenido.getEstado())
                .fechaInicio(contenido.getFechaInicio())
                .fechaFin(contenido.getFechaFin())
                .pantallaId(contenido.getPantalla().getId())
                .nombrePantalla(contenido.getPantalla().getNombre())
                .usuarioId(contenido.getUsuario().getId())
                .nombreUsuario(contenido.getUsuario().getNombreUsuario())
                .fechaCreacion(contenido.getFechaCreacion())
                .fechaActualizacion(contenido.getFechaActualizacion())
                .vecesReproducido(contenido.getVecesReproducido())
                .ultimaReproduccion(contenido.getUltimaReproduccion())
                .tags(contenido.getTags())
                .estaActivo(contenido.estaActivo())
                .enPeriodoPublicacion(contenido.enPeriodoPublicacion())
                .build();
    }
}
