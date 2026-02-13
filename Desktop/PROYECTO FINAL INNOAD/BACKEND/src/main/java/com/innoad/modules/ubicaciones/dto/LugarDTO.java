package com.innoad.modules.ubicaciones.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LugarDTO {
    private Long id;
    private Long ciudadId;
    private String nombre;
    private Integer pisos;
    private BigDecimal costoBase;
    private Boolean disponible;
    private String descripcion;
}
