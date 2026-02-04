package com.innoad.modules.chat.dto;

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
public class DTOChatUsuario {
    
    private Long id;
    private Long idUsuarioTecnico;
    private String nombreTecnico;
    private Long idUsuarioSolicitante;
    private String nombreSolicitante;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaCierre;
    private Long mensajesNoLeidos;
    private String ultimoMensaje;
    private LocalDateTime fechaUltimoMensaje;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Crear {
        private Long idUsuarioTecnico;
        private Long idUsuarioSolicitante;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Actualizar {
        private Boolean activo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Cerrar {
        private String motivo;
    }
}
