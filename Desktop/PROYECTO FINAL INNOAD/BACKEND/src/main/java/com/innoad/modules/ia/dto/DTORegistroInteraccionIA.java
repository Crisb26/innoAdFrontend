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
public class DTORegistroInteraccionIA {
    
    private Long id;
    private Long idUsuario;
    private String nombreUsuario;
    private String pregunta;
    private String respuesta;
    private String estado;
    private Integer tokensUtilizados;
    private Float tiempoRespuesta;
    private String mensajeError;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCompletacion;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Crear {
        private Long idUsuario;
        private String pregunta;
    }
}
