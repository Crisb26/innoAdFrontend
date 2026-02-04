package com.innoad.hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasDispositivoDTO {
    private Long dispositivoId;
    private Integer comandosEnviados;
    private Integer comandosExitosos;
    private Integer comandosFallidos;
    private Double tasaExito;
    private Long tiempoPromedioRespuesta;
    private Integer tiempoActividad;
    private Integer confiabilidad;
    private Integer comandosEjecutados;
    private Double anchoDeBanda;
    private Integer usoCPU;
    private Integer usoMemoria;
    private Double temperatura;
    
    public void setAnchoDeBanda(double valor) {
        this.anchoDeBanda = valor;
    }
}
