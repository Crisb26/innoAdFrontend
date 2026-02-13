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
public class SincronizacionDTO {
    private Long dispositivoId;
    private String estado;
    private Long archivosDescargados;
    private Long archivosPendientes;
    private Long ultimoSincronizado;
    private String mensaje;
    private LocalDateTime timestamp;
}
