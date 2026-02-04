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
public class DTOMensajeChat {
    
    private Long id;
    private Long idChat;
    private Long idUsuarioRemitente;
    private String nombreUsuarioRemitente;
    private String contenido;
    private LocalDateTime fechaCreacion;
    private Boolean leido;
    private LocalDateTime fechaLectura;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Crear {
        private Long idChat;
        private Long idUsuarioRemitente;
        private String contenido;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Marcar {
        private Boolean leido;
    }
}
