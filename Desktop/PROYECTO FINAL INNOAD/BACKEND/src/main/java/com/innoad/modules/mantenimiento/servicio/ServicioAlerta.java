package com.innoad.modules.mantenimiento.servicio;

import com.innoad.modules.mantenimiento.dominio.Alerta;
import com.innoad.modules.mantenimiento.dominio.EstadoAlerta;
import com.innoad.modules.mantenimiento.dominio.TipoAlerta;
import com.innoad.modules.mantenimiento.dto.AlertaDTO;
import com.innoad.modules.mantenimiento.repositorio.RepositorioAlerta;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ServicioAlerta {

    private final RepositorioAlerta repositorioAlerta;
    private final ObjectMapper objectMapper;

    /**
     * Crea una nueva alerta
     */
    public Alerta crearAlerta(
        TipoAlerta tipo,
        String titulo,
        String descripcion,
        String origen,
        Integer prioridad,
        String dispositivoId,
        Map<String, Object> detalles
    ) {
        try {
            Alerta alerta = Alerta.builder()
                .tipo(tipo)
                .titulo(titulo)
                .descripcion(descripcion)
                .origen(origen)
                .prioridad(prioridad != null ? prioridad : 3)
                .dispositivoId(dispositivoId)
                .detalles(detalles != null ? objectMapper.writeValueAsString(detalles) : null)
                .build();
            
            Alerta alertaGuardada = repositorioAlerta.save(alerta);
            log.info("Alerta creada: {} - {}", alertaGuardada.getId(), alertaGuardada.getTitulo());
            return alertaGuardada;
        } catch (Exception e) {
            log.error("Error creando alerta", e);
            throw new RuntimeException("Error al crear alerta", e);
        }
    }

    /**
     * Obtiene todas las alertas activas
     */
    public List<AlertaDTO> obtenerAlertasActivas() {
        return repositorioAlerta.findByEstadoOrderByFechaCreacionDesc(EstadoAlerta.ACTIVA)
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene alertas críticas
     */
    public List<AlertaDTO> obtenerAlertasCriticas() {
        return repositorioAlerta.findAlertasCriticasActivas()
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene alertas por estado
     */
    public Page<AlertaDTO> obtenerAlertas(EstadoAlerta estado, Pageable pageable) {
        return repositorioAlerta.findByEstado(estado, pageable)
            .map(this::convertirADTO);
    }

    /**
     * Obtiene alertas por tipo
     */
    public Page<AlertaDTO> obtenerAlertas(TipoAlerta tipo, Pageable pageable) {
        return repositorioAlerta.findByTipo(tipo, pageable)
            .map(this::convertirADTO);
    }

    /**
     * Obtiene una alerta por ID
     */
    public AlertaDTO obtenerAlerta(Long id) {
        return repositorioAlerta.findById(id)
            .map(this::convertirADTO)
            .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
    }

    /**
     * Resuelve una alerta
     */
    public AlertaDTO resolverAlerta(Long id, String usuarioId, String descripcion) {
        Alerta alerta = repositorioAlerta.findById(id)
            .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
        
        alerta.resolver(usuarioId, descripcion);
        Alerta alertaActualizada = repositorioAlerta.save(alerta);
        log.info("Alerta {} resuelta por {}", id, usuarioId);
        return convertirADTO(alertaActualizada);
    }

    /**
     * Escala una alerta
     */
    public AlertaDTO escalarAlerta(Long id) {
        Alerta alerta = repositorioAlerta.findById(id)
            .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
        
        alerta.escalar();
        Alerta alertaActualizada = repositorioAlerta.save(alerta);
        log.info("Alerta {} escalada a prioridad {}", id, alerta.getPrioridad());
        return convertirADTO(alertaActualizada);
    }

    /**
     * Ignora una alerta
     */
    public AlertaDTO ignorarAlerta(Long id) {
        Alerta alerta = repositorioAlerta.findById(id)
            .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
        
        alerta.ignorar();
        Alerta alertaActualizada = repositorioAlerta.save(alerta);
        return convertirADTO(alertaActualizada);
    }

    /**
     * Obtiene estadísticas de alertas
     */
    public Map<String, Long> obtenerEstadisticas() {
        return Map.ofEntries(
            Map.entry("total_activas", repositorioAlerta.countByEstado(EstadoAlerta.ACTIVA)),
            Map.entry("total_resueltas", repositorioAlerta.countByEstado(EstadoAlerta.RESUELTA)),
            Map.entry("criticas_activas", repositorioAlerta.countByTipoAndEstado(TipoAlerta.CRITICA, EstadoAlerta.ACTIVA)),
            Map.entry("advertencias_activas", repositorioAlerta.countByTipoAndEstado(TipoAlerta.ADVERTENCIA, EstadoAlerta.ACTIVA))
        );
    }

    /**
     * Obtiene alertas por rango de fechas
     */
    public List<AlertaDTO> obtenerAlertas(LocalDateTime inicio, LocalDateTime fin) {
        return repositorioAlerta.findAlertas(inicio, fin)
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    /**
     * Convierte entidad a DTO
     */
    private AlertaDTO convertirADTO(Alerta alerta) {
        try {
            Map<String, Object> detalles = null;
            if (alerta.getDetalles() != null) {
                detalles = objectMapper.readValue(alerta.getDetalles(), Map.class);
            }

            return AlertaDTO.builder()
                .id(alerta.getId())
                .tipo(alerta.getTipo())
                .titulo(alerta.getTitulo())
                .descripcion(alerta.getDescripcion())
                .estado(alerta.getEstado())
                .origen(alerta.getOrigen())
                .fechaCreacion(alerta.getFechaCreacion())
                .fechaResolucion(alerta.getFechaResolucion())
                .usuarioResolucion(alerta.getUsuarioResolucion())
                .descripcionResolucion(alerta.getDescripcionResolucion())
                .detalles(detalles)
                .prioridad(alerta.getPrioridad())
                .dispositivoId(alerta.getDispositivoId())
                .usuarioId(alerta.getUsuarioId())
                .notificadoAUsuario(alerta.getNotificadoAUsuario())
                .fechaNotificacion(alerta.getFechaNotificacion())
                .build();
        } catch (Exception e) {
            log.error("Error convirtiendo alerta a DTO", e);
            return null;
        }
    }
}
