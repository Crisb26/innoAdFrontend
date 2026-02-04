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
public class DTOSolicitudChatTecnico {
    
    private Long id;
    private Long idUsuario;
    private String nombreUsuario;
    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaAsignacion;
    private Long idTecnicoAsignado;
    private String nombreTecnicoAsignado;
    private LocalDateTime fechaActualizacion;
    private Integer diasTranscurridos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Crear {
        private Long idUsuario;
        private String descripcion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Asignar {
        private Long idTecnico;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CambiarEstado {
        private String nuevoEstado;
        private String descripcion;
    }
}
