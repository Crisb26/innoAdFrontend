package com.innoad.modules.ubicaciones.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PisoDTO {
    private Long id;
    private Long lugarId;
    private Integer numero;
    private Boolean disponible;
    private BigDecimal costoPorDia;
}
