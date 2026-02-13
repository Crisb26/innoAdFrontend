package com.innoad.dto.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para registros de auditoría
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaAuditoria {
    private Long id;
    private String accion;
    private String entidad;
    private Long entidadId;
    private String usuarioNombre;
    private Long usuarioId;
    private String detalles;
    private String direccionIP;
    private LocalDateTime fechaHora;
    private String resultado;
}
