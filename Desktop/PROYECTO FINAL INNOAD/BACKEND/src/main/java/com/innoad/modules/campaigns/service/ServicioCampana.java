package com.innoad.modules.campaigns.service;

import com.innoad.modules.campaigns.domain.Campana;
import com.innoad.modules.campaigns.repository.RepositorioCampana;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar campañas publicitarias
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioCampana {

    private final RepositorioCampana repositorioCampana;

    /**
     * Crear una nueva campaña
     */
    @Transactional
    public Campana crearCampana(Campana campana, Usuario usuario) {
        campana.setUsuario(usuario);
        campana.setFechaCreacion(LocalDateTime.now());
        campana.setFechaActualizacion(LocalDateTime.now());

        Campana campanGuardada = repositorioCampana.save(campana);
        log.info("Campaña creada: {} - Usuario: {}", campanGuardada.getNombre(), usuario.getNombreUsuario());

        return campanGuardada;
    }

    /**
     * Obtener todas las campañas (con filtrado por rol)
     */
    @Transactional(readOnly = true)
    public List<Campana> obtenerCampanas(Usuario usuario) {
        if (usuario.esAdministrador() || usuario.esTecnico()) {
            // Admin y Técnico ven todas las campañas
            return repositorioCampana.findAll();
        } else {
            // Usuario solo ve sus propias campañas
            return repositorioCampana.findByUsuario(usuario);
        }
    }

    /**
     * Obtener campañas paginadas
     */
    @Transactional(readOnly = true)
    public Page<Campana> obtenerCampanasPaginadas(Usuario usuario, Pageable pageable) {
        if (usuario.esAdministrador() || usuario.esTecnico()) {
            return repositorioCampana.findAll(pageable);
        } else {
            return repositorioCampana.findByUsuario(usuario, pageable);
        }
    }

    /**
     * Obtener una campaña por ID
     */
    @Transactional(readOnly = true)
    public Campana obtenerCampanaPorId(Long id, Usuario usuario) {
        Campana campana = repositorioCampana.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));

        // Verificar permisos
        if (!usuario.esAdministrador() && !usuario.esTecnico() && !campana.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes permiso para ver esta campaña");
        }

        return campana;
    }

    /**
     * Actualizar una campaña
     */
    @Transactional
    public Campana actualizarCampana(Long id, Campana datos, Usuario usuario) {
        Campana campana = obtenerCampanaPorId(id, usuario);

        // Verificar permisos
        if (!usuario.esAdministrador() && !usuario.esTecnico() && !campana.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes permiso para actualizar esta campaña");
        }

        campana.setNombre(datos.getNombre());
        campana.setDescripcion(datos.getDescripcion());
        campana.setEstado(datos.getEstado());
        campana.setFechaInicio(datos.getFechaInicio());
        campana.setFechaFin(datos.getFechaFin());
        campana.setContenidoIds(datos.getContenidoIds());
        campana.setPantallaIds(datos.getPantallaIds());
        campana.setPrioridad(datos.getPrioridad());
        campana.setConfiguracion(datos.getConfiguracion());
        campana.setTags(datos.getTags());
        campana.setFechaActualizacion(LocalDateTime.now());

        Campana campanActualizada = repositorioCampana.save(campana);
        log.info("Campaña actualizada: {} - Usuario: {}", campanActualizada.getNombre(), usuario.getNombreUsuario());

        return campanActualizada;
    }

    /**
     * Duplicar una campaña
     */
    @Transactional
    public Campana duplicarCampana(Long id, String nuevoNombre, Usuario usuario) {
        Campana original = obtenerCampanaPorId(id, usuario);

        Campana copia = Campana.builder()
                .nombre(nuevoNombre != null ? nuevoNombre : original.getNombre() + " (Copia)")
                .descripcion(original.getDescripcion())
                .estado(Campana.EstadoCampana.BORRADOR)
                .usuario(usuario)
                .fechaInicio(original.getFechaInicio())
                .fechaFin(original.getFechaFin())
                .contenidoIds(new java.util.ArrayList<>(original.getContenidoIds()))
                .pantallaIds(new java.util.ArrayList<>(original.getPantallaIds()))
                .prioridad(original.getPrioridad())
                .configuracion(original.getConfiguracion())
                .tags(new java.util.ArrayList<>(original.getTags()))
                .build();

        Campana campanDuplicada = repositorioCampana.save(copia);
        log.info("Campaña duplicada: {} (Original: {}) - Usuario: {}",
                campanDuplicada.getNombre(), original.getNombre(), usuario.getNombreUsuario());

        return campanDuplicada;
    }

    /**
     * Eliminar una campaña
     */
    @Transactional
    public void eliminarCampana(Long id, Usuario usuario) {
        Campana campana = obtenerCampanaPorId(id, usuario);

        // Verificar permisos
        if (!usuario.esAdministrador() && !usuario.esTecnico() && !campana.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes permiso para eliminar esta campaña");
        }

        repositorioCampana.delete(campana);
        log.info("Campaña eliminada: {} - Usuario: {}", campana.getNombre(), usuario.getNombreUsuario());
    }

    /**
     * Cambiar estado de una campaña
     */
    @Transactional
    public Campana cambiarEstado(Long id, Campana.EstadoCampana nuevoEstado, Usuario usuario) {
        Campana campana = obtenerCampanaPorId(id, usuario);

        // Verificar permisos
        if (!usuario.esAdministrador() && !usuario.esTecnico() && !campana.getUsuario().getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("No tienes permiso para cambiar el estado de esta campaña");
        }

        campana.setEstado(nuevoEstado);
        campana.setFechaActualizacion(LocalDateTime.now());

        Campana campanActualizada = repositorioCampana.save(campana);
        log.info("Estado de campaña cambiado: {} -> {} - Usuario: {}",
                campanActualizada.getNombre(), nuevoEstado, usuario.getNombreUsuario());

        return campanActualizada;
    }

    /**
     * Obtener campañas por estado
     */
    @Transactional(readOnly = true)
    public List<Campana> obtenerCampanasPorEstado(Campana.EstadoCampana estado, Usuario usuario) {
        List<Campana> campanas = repositorioCampana.findByEstado(estado);

        // Filtrar por usuario si no es admin/técnico
        if (!usuario.esAdministrador() && !usuario.esTecnico()) {
            campanas = campanas.stream()
                    .filter(c -> c.getUsuario().getId().equals(usuario.getId()))
                    .collect(Collectors.toList());
        }

        return campanas;
    }

    /**
     * Obtener campañas que usan un contenido específico
     */
    @Transactional(readOnly = true)
    public List<Campana> obtenerCampanasPorContenido(Long contenidoId) {
        return repositorioCampana.findByContenidoId(contenidoId);
    }

    /**
     * Obtener campañas que usan una pantalla específica
     */
    @Transactional(readOnly = true)
    public List<Campana> obtenerCampanasPorPantalla(Long pantallaId) {
        return repositorioCampana.findByPantallaId(pantallaId);
    }
}
