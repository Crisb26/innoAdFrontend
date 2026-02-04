package com.innoad.modules.pantallas.servicio;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.pantallas.dominio.Pantalla;
import com.innoad.modules.pantallas.dto.PantallaDTO;
import com.innoad.modules.pantallas.repositorio.RepositorioPantallas;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioPantallas {
    
    private final RepositorioPantallas repositorioPantallas;
    private final RepositorioUsuario repositorioUsuario;
    
    /**
     * Crear nueva pantalla
     */
    public PantallaDTO crearPantalla(PantallaDTO dto, String usuarioUsername) {
        log.info("Creando pantalla: {} para usuario: {}", dto.getCodigo(), usuarioUsername);
        
        // Validar usuario
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Validar código único
        if (repositorioPantallas.findByCodigo(dto.getCodigo()).isPresent()) {
            throw new IllegalArgumentException("El código de pantalla ya existe");
        }
        
        Pantalla pantalla = Pantalla.builder()
            .codigo(dto.getCodigo())
            .nombre(dto.getNombre())
            .descripcion(dto.getDescripcion())
            .ubicacion(dto.getUbicacion())
            .resolucion(dto.getResolucion() != null ? dto.getResolucion() : "1920x1080")
            .usuario(usuario)
            .estado(Pantalla.EstadoPantalla.INACTIVA)
            .conectada(false)
            .build();
        
        Pantalla guardada = repositorioPantallas.save(pantalla);
        log.info("Pantalla creada exitosamente: {}", guardada.getId());
        
        return PantallaDTO.fromEntity(guardada);
    }
    
    /**
     * Obtener pantalla por ID
     */
    @Transactional(readOnly = true)
    public PantallaDTO obtenerPantalla(Long id, String usuarioUsername) {
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Pantalla pantalla = repositorioPantallas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
        
        return PantallaDTO.fromEntity(pantalla);
    }
    
    /**
     * Listar pantallas del usuario
     */
    @Transactional(readOnly = true)
    public Page<PantallaDTO> listarPantallas(String usuarioUsername, Pageable pageable) {
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioPantallas.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId(), pageable)
            .map(PantallaDTO::fromEntity);
    }
    
    /**
     * Buscar pantalla por nombre
     */
    @Transactional(readOnly = true)
    public Page<PantallaDTO> buscarPorNombre(String usuarioUsername, String nombre, Pageable pageable) {
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioPantallas.findByUsuarioIdAndNombreContainingIgnoreCaseOrderByFechaCreacionDesc(usuario.getId(), nombre, pageable)
            .map(PantallaDTO::fromEntity);
    }
    
    /**
     * Actualizar pantalla
     */
    public PantallaDTO actualizarPantalla(Long id, PantallaDTO dto, String usuarioUsername) {
        log.info("Actualizando pantalla: {}", id);
        
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Pantalla pantalla = repositorioPantallas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
        
        pantalla.setNombre(dto.getNombre());
        pantalla.setDescripcion(dto.getDescripcion());
        pantalla.setUbicacion(dto.getUbicacion());
        if (dto.getResolucion() != null) {
            pantalla.setResolucion(dto.getResolucion());
        }
        
        Pantalla actualizada = repositorioPantallas.save(pantalla);
        log.info("Pantalla actualizada: {}", actualizada.getId());
        
        return PantallaDTO.fromEntity(actualizada);
    }
    
    /**
     * Cambiar estado de pantalla
     */
    public PantallaDTO cambiarEstado(Long id, String nuevoEstado, String usuarioUsername) {
        log.info("Cambiando estado de pantalla {} a: {}", id, nuevoEstado);
        
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Pantalla pantalla = repositorioPantallas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
        
        Pantalla.EstadoPantalla estadoEnum = Pantalla.EstadoPantalla.valueOf(nuevoEstado.toUpperCase());
        pantalla.setEstado(estadoEnum);
        
        Pantalla actualizada = repositorioPantallas.save(pantalla);
        log.info("Estado de pantalla cambiado a: {}", estadoEnum);
        
        return PantallaDTO.fromEntity(actualizada);
    }
    
    /**
     * Actualizar estado de conexión
     */
    public void actualizarConexion(String codigo, Boolean conectada, String ipAddress) {
        Pantalla pantalla = repositorioPantallas.findByCodigo(codigo)
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
        
        pantalla.setConectada(conectada);
        pantalla.setUltimaConexion(LocalDateTime.now());
        if (ipAddress != null) {
            pantalla.setIpAddress(ipAddress);
        }
        
        repositorioPantallas.save(pantalla);
        log.info("Conexión de pantalla {} actualizada: {}", codigo, conectada);
    }
    
    /**
     * Eliminar pantalla
     */
    public void eliminarPantalla(Long id, String usuarioUsername) {
        log.info("Eliminando pantalla: {}", id);
        
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Pantalla pantalla = repositorioPantallas.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada"));
        
        repositorioPantallas.delete(pantalla);
        log.info("Pantalla eliminada: {}", id);
    }
    
    /**
     * Obtener pantallas conectadas
     */
    @Transactional(readOnly = true)
    public List<PantallaDTO> getPantallasConectadas(String usuarioUsername) {
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return repositorioPantallas.findPantallasConectadas(usuario.getId())
            .stream()
            .map(PantallaDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    /**
     * Listar por estado
     */
    @Transactional(readOnly = true)
    public Page<PantallaDTO> listarPorEstado(String usuarioUsername, String estado, Pageable pageable) {
        Usuario usuario = repositorioUsuario.findByNombreUsuario(usuarioUsername)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Pantalla.EstadoPantalla estadoEnum = Pantalla.EstadoPantalla.valueOf(estado.toUpperCase());
        
        return repositorioPantallas.findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuario.getId(), estadoEnum, pageable)
            .map(PantallaDTO::fromEntity);
    }
    
    /**
     * Obtener pantalla por código (para Raspberry Pi)
     */
    @Transactional(readOnly = true)
    public PantallaDTO obtenerPantallaPorCodigo(String codigo) {
        log.info("Obteniendo pantalla por código: {}", codigo);
        
        Pantalla pantalla = repositorioPantallas.findByCodigo(codigo)
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada con código: " + codigo));
        
        return PantallaDTO.fromEntity(pantalla);
    }
    
    /**
     * Obtener contenido/campaña de una pantalla por código (para Raspberry Pi)
     */
    @Transactional(readOnly = true)
    public Object obtenerContenidoPantalla(String codigo) {
        log.info("Obteniendo contenido de pantalla: {}", codigo);
        
        Pantalla pantalla = repositorioPantallas.findByCodigo(codigo)
            .orElseThrow(() -> new IllegalArgumentException("Pantalla no encontrada con código: " + codigo));
        
        // Retornar datos de la campaña actual o estructura de contenido
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("pantalla", PantallaDTO.fromEntity(pantalla));
        respuesta.put("campanaActual", pantalla.getCampanaActual() != null ? 
            Map.of(
                "id", pantalla.getCampanaActual().getId(),
                "nombre", pantalla.getCampanaActual().getNombre(),
                "estado", pantalla.getCampanaActual().getEstado()
            ) : null
        );
        respuesta.put("estado", pantalla.getEstado());
        respuesta.put("conectada", pantalla.getConectada());
        respuesta.put("ultimaActualizacion", pantalla.getFechaActualizacion());
        
        return respuesta;
    }
}
