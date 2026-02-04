package com.innoad.modules.mantenimiento.controlador;

import com.innoad.modules.mantenimiento.dominio.EstadoAlerta;
import com.innoad.modules.mantenimiento.dominio.TipoAlerta;
import com.innoad.modules.mantenimiento.dto.AlertaDTO;
import com.innoad.modules.mantenimiento.servicio.ServicioAlerta;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mantenimiento/alertas")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ControladorAlerta {

    private final ServicioAlerta servicioAlerta;

    /**
     * Obtiene todas las alertas activas
     */
    @GetMapping("/activas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<List<AlertaDTO>> obtenerAlertasActivas() {
        return ResponseEntity.ok(servicioAlerta.obtenerAlertasActivas());
    }

    /**
     * Obtiene alertas críticas
     */
    @GetMapping("/criticas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<List<AlertaDTO>> obtenerAlertasCriticas() {
        return ResponseEntity.ok(servicioAlerta.obtenerAlertasCriticas());
    }

    /**
     * Obtiene alertas con paginación
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<Page<AlertaDTO>> obtenerAlertas(
        @RequestParam(required = false) EstadoAlerta estado,
        @RequestParam(required = false) TipoAlerta tipo,
        Pageable pageable
    ) {
        Page<AlertaDTO> alertas;
        if (estado != null) {
            alertas = servicioAlerta.obtenerAlertas(estado, pageable);
        } else if (tipo != null) {
            alertas = servicioAlerta.obtenerAlertas(tipo, pageable);
        } else {
            alertas = servicioAlerta.obtenerAlertas(EstadoAlerta.ACTIVA, pageable);
        }
        return ResponseEntity.ok(alertas);
    }

    /**
     * Obtiene una alerta por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<AlertaDTO> obtenerAlerta(@PathVariable Long id) {
        return ResponseEntity.ok(servicioAlerta.obtenerAlerta(id));
    }

    /**
     * Crea una nueva alerta
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<AlertaDTO> crearAlerta(
        @RequestParam TipoAlerta tipo,
        @RequestParam String titulo,
        @RequestParam(required = false) String descripcion,
        @RequestParam String origen,
        @RequestParam(defaultValue = "3") Integer prioridad,
        @RequestParam(required = false) String dispositivoId,
        @RequestBody(required = false) Map<String, Object> detalles
    ) {
        AlertaDTO alerta = servicioAlerta.crearAlerta(
            tipo, titulo, descripcion, origen, prioridad, dispositivoId, detalles
        ).getId() != null ? servicioAlerta.obtenerAlerta(
            servicioAlerta.crearAlerta(tipo, titulo, descripcion, origen, prioridad, dispositivoId, detalles).getId()
        ) : null;
        return ResponseEntity.ok(alerta);
    }

    /**
     * Resuelve una alerta
     */
    @PutMapping("/{id}/resolver")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<AlertaDTO> resolverAlerta(
        @PathVariable Long id,
        @RequestParam String usuarioId,
        @RequestParam(required = false) String descripcion
    ) {
        return ResponseEntity.ok(servicioAlerta.resolverAlerta(id, usuarioId, descripcion));
    }

    /**
     * Escala una alerta
     */
    @PutMapping("/{id}/escalar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<AlertaDTO> escalarAlerta(@PathVariable Long id) {
        return ResponseEntity.ok(servicioAlerta.escalarAlerta(id));
    }

    /**
     * Ignora una alerta
     */
    @PutMapping("/{id}/ignorar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<AlertaDTO> ignorarAlerta(@PathVariable Long id) {
        return ResponseEntity.ok(servicioAlerta.ignorarAlerta(id));
    }

    /**
     * Obtiene estadísticas
     */
    @GetMapping("/estadisticas/general")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<Map<String, Long>> obtenerEstadisticas() {
        return ResponseEntity.ok(servicioAlerta.obtenerEstadisticas());
    }

    /**
     * Obtiene alertas por rango de fechas
     */
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    public ResponseEntity<List<AlertaDTO>> obtenerAlertas(
        @RequestParam LocalDateTime inicio,
        @RequestParam LocalDateTime fin
    ) {
        return ResponseEntity.ok(servicioAlerta.obtenerAlertas(inicio, fin));
    }
}
