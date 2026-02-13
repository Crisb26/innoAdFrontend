package com.innoad.modules.ia.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DTORegistroEmailIA {
    
    private Long id;
    private Long idUsuario;
    private String nombreUsuario;
    private String direccionDestinatario;
    private String asunto;
    private String contenido;
    private String estado;
    private String mensajeError;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEnvio;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Crear {
        private Long idUsuario;
        private String direccionDestinatario;
        private String asunto;
        private String contenido;
    }
}
