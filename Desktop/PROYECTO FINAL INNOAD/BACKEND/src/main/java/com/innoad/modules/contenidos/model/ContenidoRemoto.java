package com.innoad.modules.contenidos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contenido_remoto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenidoRemoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descripcion;
    private String tipo;
    private String url;
    private Long tamanio;
    private String duracion;
    private String formato;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String estado;
    private Integer progreso;
    
    @Transient
    private List<Long> dispositivos;
    
    @Transient
    private java.util.Map<String, Object> programacion;
    
    public Long getTamaño() {
        return this.tamanio;
    }
}
