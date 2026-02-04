package com.innoad.hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensoresDTO {
    private Long dispositivoId;
    private Double temperatura;
    private Double humedad;
    private Double presion;
    private Integer luminosidad;
    private String estado;
}
