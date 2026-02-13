package com.innoad.modules.reportes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO para transferencia de datos de reportes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteDTO {

    private Long id;
    private String titulo;
    private String tipo;
    private String periodo;
    private LocalDateTime fechaGeneracion;
    private String generadoPor;
    private String estado;
    private Map<String, Object> datos;
    private Double costoGeneracion;
    private Integer tokensUsados;
    private String urlDescarga;
    private Boolean disponible;
    private LocalDateTime fechaVencimiento;
    
    public String obtenerResumen() {
        return String.format("Reporte %s - %s (%s)", titulo, tipo, periodo);
    }
}
