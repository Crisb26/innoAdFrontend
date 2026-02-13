package com.innoad.modules.campanas.servicio;

import com.innoad.modules.campanas.dominio.Campana;
import com.innoad.modules.campanas.dto.CampanaDTO;
import com.innoad.modules.campanas.repositorio.RepositorioCampanas;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioCampanas {
    
    private final RepositorioCampanas repositorioCampanas;
    private final RepositorioUsuario repositorioUsuario;
    
    /**
     * Crear una nueva campaña
     */
    public CampanaDTO crearCampana(CampanaDTO dto, String usuarioUsername) {
        log.info("Creando campaña: {} para usuario: {}", dto.getNombre(), usuarioUsername);
        
        // Validar usuario
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Validar fechas
        if (dto.getFechaInicio().isAfter(dto.getFechaFin())) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        
        if (dto.getFechaInicio().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser en el pasado");
        }
        
        // Crear entidad
        Campana campana = Campana.builder()
            .nombre(dto.getNombre())
            .descripcion(dto.getDescripcion())
            .fechaInicio(dto.getFechaInicio())
            .fechaFin(dto.getFechaFin())
            .pantallasAsignadas(dto.getPantallasAsignadas())
            .presupuesto(dto.getPresupuesto() != null ? dto.getPresupuesto() : 0.0)
            .usuario(usuario)
            .estado(Campana.EstadoCampana.BORRADORA)
            .build();
        
        Campana guardada = repositorioCampanas.save(campana);
        log.info("Campaña creada exitosamente: {}", guardada.getId());
        
        return CampanaDTO.fromEntity(guardada);
    }
    
    /**
     * Obtener campaña por ID (con seguridad - solo del usuario propietario)
     */
    @Transactional(readOnly = true)
    public CampanaDTO obtenerCampana(Long id, String usuarioUsername) {
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Campana campana = repositorioCampanas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        return CampanaDTO.fromEntity(campana);
    }
    
    /**
     * Listar campañas del usuario actual
     */
    @Transactional(readOnly = true)
    public Page<CampanaDTO> listarCampanas(String usuarioUsername, Pageable pageable) {
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioCampanas.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId(), pageable)
            .map(CampanaDTO::fromEntity);
    }
    
    /**
     * Listar campañas por estado
     */
    @Transactional(readOnly = true)
    public Page<CampanaDTO> listarPorEstado(String usuarioUsername, String estado, Pageable pageable) {
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Campana.EstadoCampana estadoEnum = Campana.EstadoCampana.valueOf(estado.toUpperCase());
        
        return repositorioCampanas.findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuario.getId(), estadoEnum, pageable)
            .map(CampanaDTO::fromEntity);
    }
    
    /**
     * Buscar campaña por nombre
     */
    @Transactional(readOnly = true)
    public Page<CampanaDTO> buscarPorNombre(String usuarioUsername, String nombre, Pageable pageable) {
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioCampanas.findByUsuarioIdAndNombreContainingIgnoreCaseOrderByFechaCreacionDesc(
            usuario.getId(), nombre, pageable)
            .map(CampanaDTO::fromEntity);
    }
    
    /**
     * Actualizar campaña
     */
    public CampanaDTO actualizarCampana(Long id, CampanaDTO dto, String usuarioUsername) {
        log.info("Actualizando campaña: {}", id);
        
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Campana campana = repositorioCampanas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        // Validar que no esté finalizada
        if (campana.getEstado() == Campana.EstadoCampana.FINALIZADA) {
            throw new IllegalArgumentException("No se puede modificar una campaña finalizada");
        }
        
        // Actualizar campos
        campana.setNombre(dto.getNombre());
        campana.setDescripcion(dto.getDescripcion());
        campana.setPresupuesto(dto.getPresupuesto());
        campana.setPantallasAsignadas(dto.getPantallasAsignadas());
        
        // Solo actualizar fechas si la campaña aún no inició
        if (campana.getFechaInicio().isAfter(LocalDateTime.now())) {
            if (dto.getFechaInicio().isAfter(dto.getFechaFin())) {
                throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            campana.setFechaInicio(dto.getFechaInicio());
            campana.setFechaFin(dto.getFechaFin());
        }
        
        Campana actualizada = repositorioCampanas.save(campana);
        log.info("Campaña actualizada: {}", actualizada.getId());
        
        return CampanaDTO.fromEntity(actualizada);
    }
    
    /**
     * Cambiar estado de campaña
     */
    public CampanaDTO cambiarEstado(Long id, String nuevoEstado, String usuarioUsername) {
        log.info("Cambiando estado de campaña {} a: {}", id, nuevoEstado);
        
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Campana campana = repositorioCampanas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        Campana.EstadoCampana estadoEnum = Campana.EstadoCampana.valueOf(nuevoEstado.toUpperCase());
        campana.setEstado(estadoEnum);
        
        Campana actualizada = repositorioCampanas.save(campana);
        log.info("Estado de campaña cambiado a: {}", estadoEnum);
        
        return CampanaDTO.fromEntity(actualizada);
    }
    
    /**
     * Eliminar campaña
     */
    public void eliminarCampana(Long id, String usuarioUsername) {
        log.info("Eliminando campaña: {}", id);
        
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Campana campana = repositorioCampanas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        // Solo permitir eliminar si está en estado BORRADORA
        if (campana.getEstado() != Campana.EstadoCampana.BORRADORA) {
            throw new IllegalArgumentException("Solo se pueden eliminar campañas en estado BORRADORA");
        }
        
        repositorioCampanas.delete(campana);
        log.info("Campaña eliminada: {}", id);
    }
    
    /**
     * Obtener campañas activas del usuario
     */
    @Transactional(readOnly = true)
    public List<CampanaDTO> getCampanasActivas(String usuarioUsername) {
        Usuario usuario = repositorioUsuario.findByEmail(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioCampanas.findCampanasActivasDelUsuario(usuario.getId())
            .stream()
            .map(CampanaDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
