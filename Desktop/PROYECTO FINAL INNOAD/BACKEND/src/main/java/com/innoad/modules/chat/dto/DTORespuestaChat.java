package com.innoad.modules.chat.dto;

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
public class DTORespuestaChat {
    
    private Boolean exito;
    private String mensaje;
    private Object datos;
    private String codigo;
    
    public static DTORespuestaChat exitoso(Object datos, String mensaje) {
        return DTORespuestaChat.builder()
                .exito(true)
                .mensaje(mensaje)
                .datos(datos)
                .codigo("200")
                .build();
    }
    
    public static DTORespuestaChat exitoso(Object datos) {
        return exitoso(datos, "Operación exitosa");
    }
    
    public static DTORespuestaChat error(String mensaje, String codigo) {
        return DTORespuestaChat.builder()
                .exito(false)
                .mensaje(mensaje)
                .codigo(codigo)
                .build();
    }
    
    public static DTORespuestaChat error(String mensaje) {
        return error(mensaje, "500");
    }
}
