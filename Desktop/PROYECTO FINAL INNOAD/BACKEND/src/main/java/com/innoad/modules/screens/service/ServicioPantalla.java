package com.innoad.modules.screens.service;

import com.innoad.dto.solicitud.SolicitudPantalla;
import com.innoad.dto.respuesta.RespuestaPantalla;
import com.innoad.modules.screens.domain.Pantalla;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.service.ServicioJWT;
import com.innoad.modules.content.repository.RepositorioContenido;
import com.innoad.modules.screens.repository.RepositorioPantalla;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar pantallas (Raspberry Pi)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioPantalla {

    private final RepositorioPantalla repositorioPantalla;
    private final RepositorioContenido repositorioContenido;
    private final ServicioJWT servicioJWT;

    /**
     * Crea una nueva pantalla
     */
    @Transactional
    public RespuestaPantalla crearPantalla(SolicitudPantalla solicitud, Usuario usuario) {
        // Crear la pantalla
        Pantalla pantalla = Pantalla.builder()
                .nombre(solicitud.getNombre())
                .descripcion(solicitud.getDescripcion())
                .codigoIdentificacion(generarCodigoUnico())
                .estado("INACTIVA")
                .ubicacion(solicitud.getUbicacion())
                .resolucion(solicitud.getResolucion() != null ? solicitud.getResolucion() : "1920x1080")
                .orientacion(solicitud.getOrientacion() != null ? solicitud.getOrientacion() : "HORIZONTAL")
                .usuario(usuario)
                .notas(solicitud.getNotas())
                .fechaRegistro(LocalDateTime.now())
                .build();

        // Generar token de autenticación para la pantalla
        pantalla.setTokenAutenticacion(generarTokenPantalla(pantalla));

        Pantalla pantallaGuardada = repositorioPantalla.save(pantalla);
        log.info("Pantalla creada: {} - Usuario: {}", pantallaGuardada.getNombre(), usuario.getNombreUsuario());

        return convertirARespuesta(pantallaGuardada);
    }

    /**
     * Actualiza una pantalla existente
     */
    @Transactional
    public RespuestaPantalla actualizarPantalla(Long pantallaId, SolicitudPantalla solicitud, Usuario usuario) {
        Pantalla pantalla = obtenerPantallaPorId(pantallaId);

        // Verificar que el usuario sea el propietario
        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para actualizar esta pantalla");
        }

        // Actualizar campos
        pantalla.setNombre(solicitud.getNombre());
        pantalla.setDescripcion(solicitud.getDescripcion());
        pantalla.setUbicacion(solicitud.getUbicacion());

        if (solicitud.getResolucion() != null) {
            pantalla.setResolucion(solicitud.getResolucion());
        }

        if (solicitud.getOrientacion() != null) {
            pantalla.setOrientacion(solicitud.getOrientacion());
        }

        pantalla.setNotas(solicitud.getNotas());

        Pantalla pantallaActualizada = repositorioPantalla.save(pantalla);
        log.info("Pantalla actualizada: {} - Usuario: {}", pantallaActualizada.getNombre(), usuario.getNombreUsuario());

        return convertirARespuesta(pantallaActualizada);
    }

    /**
     * Obtiene todas las pantallas de un usuario
     */
    @Transactional(readOnly = true)
    public List<RespuestaPantalla> obtenerPantallasPorUsuario(Usuario usuario) {
        List<Pantalla> pantallas;

        if (usuario.esAdministrador()) {
            pantallas = repositorioPantalla.findAll();
        } else {
            pantallas = repositorioPantalla.findByUsuario(usuario);
        }

        return pantallas.stream()
                .map(this::convertirARespuesta)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una pantalla por ID
     */
    @Transactional(readOnly = true)
    public RespuestaPantalla obtenerPantalla(Long pantallaId, Usuario usuario) {
        Pantalla pantalla = obtenerPantallaPorId(pantallaId);

        // Verificar permisos
        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para ver esta pantalla");
        }

        return convertirARespuesta(pantalla);
    }

    /**
     * Elimina una pantalla
     */
    @Transactional
    public void eliminarPantalla(Long pantallaId, Usuario usuario) {
        Pantalla pantalla = obtenerPantallaPorId(pantallaId);

        // Verificar permisos
        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para eliminar esta pantalla");
        }

        repositorioPantalla.delete(pantalla);
        log.info("Pantalla eliminada: {} - Usuario: {}", pantalla.getNombre(), usuario.getNombreUsuario());
    }

    /**
     * Activa una pantalla
     */
    @Transactional
    public RespuestaPantalla activarPantalla(Long pantallaId, Usuario usuario) {
        Pantalla pantalla = obtenerPantallaPorId(pantallaId);

        // Verificar permisos
        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para activar esta pantalla");
        }

        pantalla.setEstado("ACTIVA");
        Pantalla pantallaActualizada = repositorioPantalla.save(pantalla);

        log.info("Pantalla activada: {}", pantalla.getNombre());
        return convertirARespuesta(pantallaActualizada);
    }

    /**
     * Desactiva una pantalla
     */
    @Transactional
    public RespuestaPantalla desactivarPantalla(Long pantallaId, Usuario usuario) {
        Pantalla pantalla = obtenerPantallaPorId(pantallaId);

        // Verificar permisos
        if (!pantalla.getUsuario().getId().equals(usuario.getId()) && !usuario.esAdministrador()) {
            throw new IllegalArgumentException("No tienes permiso para desactivar esta pantalla");
        }

        pantalla.setEstado("INACTIVA");
        Pantalla pantallaActualizada = repositorioPantalla.save(pantalla);

        log.info("Pantalla desactivada: {}", pantalla.getNombre());
        return convertirARespuesta(pantallaActualizada);
    }

    /**
     * Registra la conexión de una pantalla (usado por Raspberry Pi)
     */
    @Transactional
    public void registrarConexion(String codigoIdentificacion, String direccionIp, String versionSoftware, String informacionSistema) {
        Pantalla pantalla = repositorioPantalla.findByCodigoIdentificacion(codigoIdentificacion)
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));

        pantalla.actualizarConexion();
        pantalla.setDireccionIp(direccionIp);
        pantalla.setVersionSoftware(versionSoftware);
        pantalla.setInformacionSistema(informacionSistema);

        repositorioPantalla.save(pantalla);
        log.debug("Conexión registrada - Pantalla: {} - IP: {}", codigoIdentificacion, direccionIp);
    }

    /**
     * Registra la sincronización de una pantalla
     */
    @Transactional
    public void registrarSincronizacion(String codigoIdentificacion) {
        Pantalla pantalla = repositorioPantalla.findByCodigoIdentificacion(codigoIdentificacion)
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));

        pantalla.actualizarSincronizacion();
        repositorioPantalla.save(pantalla);
        log.debug("Sincronización registrada - Pantalla: {}", codigoIdentificacion);
    }

    /**
     * Obtiene pantalla por código de identificación (para Raspberry Pi)
     */
    @Transactional(readOnly = true)
    public Pantalla obtenerPorCodigoIdentificacion(String codigoIdentificacion) {
        return repositorioPantalla.findByCodigoIdentificacion(codigoIdentificacion)
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
    }

    // Métodos auxiliares

    private Pantalla obtenerPantallaPorId(Long pantallaId) {
        return repositorioPantalla.findById(pantallaId)
                .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
    }

    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = "PI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (repositorioPantalla.existsByCodigoIdentificacion(codigo));
        return codigo;
    }

    private String generarTokenPantalla(Pantalla pantalla) {
        // Generar un token simple para la pantalla (en producción usar JWT)
        return "PANTALLA-" + UUID.randomUUID().toString();
    }

    private RespuestaPantalla convertirARespuesta(Pantalla pantalla) {
        long cantidadContenidos = repositorioContenido.contarContenidosActivosByPantallaId(pantalla.getId());

        return RespuestaPantalla.builder()
                .id(pantalla.getId())
                .nombre(pantalla.getNombre())
                .descripcion(pantalla.getDescripcion())
                .codigoIdentificacion(pantalla.getCodigoIdentificacion())
                .estado(pantalla.getEstado())
                .ubicacion(pantalla.getUbicacion())
                .resolucion(pantalla.getResolucion())
                .orientacion(pantalla.getOrientacion())
                .usuarioId(pantalla.getUsuario().getId())
                .nombreUsuario(pantalla.getUsuario().getNombreUsuario())
                .fechaRegistro(pantalla.getFechaRegistro())
                .ultimaConexion(pantalla.getUltimaConexion())
                .ultimaSincronizacion(pantalla.getUltimaSincronizacion())
                .direccionIp(pantalla.getDireccionIp())
                .versionSoftware(pantalla.getVersionSoftware())
                .informacionSistema(pantalla.getInformacionSistema())
                .notas(pantalla.getNotas())
                .estaConectada(pantalla.estaConectada())
                .cantidadContenidos((int) cantidadContenidos)
                .build();
    }
}
