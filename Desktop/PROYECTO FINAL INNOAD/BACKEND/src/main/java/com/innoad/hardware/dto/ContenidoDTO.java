package com.innoad.hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenidoDTO {
    private Long id;
    private String tipo;
    private String url;
    private String nombre;
    private String titulo;
    private String descripcion;
    private Long tamanio;
    private String hash;
    private LocalDateTime fechaCreacion;
    private List<Long> dispositivos;
    private String estado;
    private Integer progreso;
}
