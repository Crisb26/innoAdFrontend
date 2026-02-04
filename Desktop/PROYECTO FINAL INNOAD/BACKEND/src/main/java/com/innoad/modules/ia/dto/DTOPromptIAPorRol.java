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
public class DTOPromptIAPorRol {
    
    private Long id;
    private String rol;
    private String instruccion;
    private String contexto;
    private Integer tokenMaximo;
    private Float temperatura;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private Long idUsuarioCreador;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Crear {
        private String rol;
        private String instruccion;
        private String contexto;
        private Integer tokenMaximo;
        private Float temperatura;
        private Long idUsuarioCreador;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Actualizar {
        private String instruccion;
        private String contexto;
        private Integer tokenMaximo;
        private Float temperatura;
    }
}
