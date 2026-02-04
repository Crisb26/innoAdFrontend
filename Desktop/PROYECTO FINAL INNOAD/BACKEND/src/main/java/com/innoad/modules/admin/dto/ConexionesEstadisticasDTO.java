package com.innoad.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConexionesEstadisticasDTO {
    
    private int usuariosConectadosAhora;
    private long capacidadMaximaResistida;
    private long porcentajeCapacidad;
    private List<ConexionUsuarioDTO> conexionesActivas;
    
    public String getEstadoCapacidad() {
        if (porcentajeCapacidad < 50) {
            return "BAJO";
        } else if (porcentajeCapacidad < 80) {
            return "MEDIO";
        } else if (porcentajeCapacidad < 95) {
            return "ALTO";
        } else {
            return "CRITICO";
        }
    }
}
