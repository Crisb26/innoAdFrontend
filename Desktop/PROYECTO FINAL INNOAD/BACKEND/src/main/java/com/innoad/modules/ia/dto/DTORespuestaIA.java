package com.innoad.modules.ia.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DTORespuestaIA {
    
    private Boolean exito;
    private String mensaje;
    private Object datos;
    private String codigo;
    
    public static DTORespuestaIA exitoso(Object datos, String mensaje) {
        return DTORespuestaIA.builder()
                .exito(true)
                .mensaje(mensaje)
                .datos(datos)
                .codigo("200")
                .build();
    }
    
    public static DTORespuestaIA exitoso(Object datos) {
        return exitoso(datos, "Operación exitosa");
    }
    
    public static DTORespuestaIA error(String mensaje, String codigo) {
        return DTORespuestaIA.builder()
                .exito(false)
                .mensaje(mensaje)
                .codigo(codigo)
                .build();
    }
    
    public static DTORespuestaIA error(String mensaje) {
        return error(mensaje, "500");
    }
}
