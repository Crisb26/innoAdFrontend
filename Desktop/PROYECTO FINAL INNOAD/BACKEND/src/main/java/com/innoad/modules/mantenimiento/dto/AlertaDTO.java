package com.innoad.modules.mantenimiento.dto;

import com.innoad.modules.mantenimiento.dominio.TipoAlerta;
import com.innoad.modules.mantenimiento.dominio.EstadoAlerta;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaDTO {
    private Long id;
    private TipoAlerta tipo;
    private String titulo;
    private String descripcion;
    private EstadoAlerta estado;
    private String origen;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaResolucion;
    private String usuarioResolucion;
    private String descripcionResolucion;
    private Map<String, Object> detalles;
    private Integer prioridad; // 1-5, donde 5 es máxima prioridad
    private String dispositivoId;
    private String usuarioId;
    private Boolean notificadoAUsuario;
    private LocalDateTime fechaNotificacion;
}
