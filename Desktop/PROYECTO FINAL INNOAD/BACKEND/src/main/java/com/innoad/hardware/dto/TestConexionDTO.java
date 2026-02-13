package com.innoad.hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestConexionDTO {
    private String ipDestino;
    private Integer puerto;
    private Integer timeout;
    private Boolean conectado;
    private Integer latencia;
    private List<String> mensajes;
}
