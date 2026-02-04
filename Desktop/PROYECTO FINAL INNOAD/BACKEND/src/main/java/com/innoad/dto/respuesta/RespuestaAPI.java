package com.innoad.dto.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaAPI<T> {
    private boolean exitoso;
    private String mensaje;
    private T datos;
    @Builder.Default
    private Instant timestamp = Instant.now();
    @Builder.Default
    private List<String> errores = List.of();
}
