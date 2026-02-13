package com.innoad.modules.ubicaciones.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CiudadDTO {
    private Long id;
    private String nombre;
    private String codigo;
    private Integer cantidadLugares;
    private Boolean activa;
}
