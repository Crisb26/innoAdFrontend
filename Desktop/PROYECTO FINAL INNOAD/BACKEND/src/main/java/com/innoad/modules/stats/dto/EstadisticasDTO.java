package com.innoad.modules.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasDTO {
    
    private Long totalCampanas;
    private Long campanasActivas;
    private Long totalPublicaciones;
    private Long publicacionesAprobadas;
    private Double costoTotalInvertido;
    private Double impressiones;
    private Double clics;
    private Double tasaConversion;
    private Double roi;
    private Double ingresoGenerado;
    private Long totalUsuarios;
    private Long usuariosActivos;
    private Integer tasaRetencion;
    private String periodoReporte;
    
    public Double calcularCPC() {
        if (clics == 0) return 0D;
        return costoTotalInvertido / clics;
    }
    
    public Double calcularCPM() {
        if (impressiones == 0) return 0D;
        return (costoTotalInvertido / impressiones) * 1000;
    }
}
