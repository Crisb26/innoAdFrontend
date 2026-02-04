package com.innoad.modules.publicaciones.dto;

import com.innoad.modules.publicaciones.model.Publicacion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicacionDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String tipoContenido;
    private String archivoUrl;
    private Integer duracionDias;
    private String estado;
    private Long usuarioId;
    private BigDecimal costoTotal;
    private String ubicacionesJson;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaAprobacion;
    private LocalDateTime fechaRechazo;
    private String motivoRechazo;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaFinalizacion;
}
