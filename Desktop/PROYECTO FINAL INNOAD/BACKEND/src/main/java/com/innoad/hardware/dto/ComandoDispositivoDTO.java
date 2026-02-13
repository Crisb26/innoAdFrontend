package com.innoad.hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComandoDispositivoDTO {
    private Long dispositivoId;
    private String tipo;
    private String descripcion;
    private String parametros;
    private LocalDateTime timestamp;
    private String respuesta;
}
