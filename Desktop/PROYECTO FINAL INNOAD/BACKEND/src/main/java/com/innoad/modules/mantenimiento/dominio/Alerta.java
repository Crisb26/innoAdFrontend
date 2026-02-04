package com.innoad.modules.mantenimiento.dominio;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "alertas_sistema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alerta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAlerta tipo;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoAlerta estado;

    @Column(nullable = false)
    private String origen; // Sistema, RaspberryPi, BaseDatos, Seguridad, etc

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaResolucion;

    @Column(length = 100)
    private String usuarioResolucion;

    @Column(columnDefinition = "TEXT")
    private String descripcionResolucion;

    @Column(columnDefinition = "jsonb")
    private String detalles; // JSON string con información adicional

    @Column(nullable = false)
    private Integer prioridad = 3; // 1-5

    private String dispositivoId;

    @Column(length = 100)
    private String usuarioId;

    @Column(nullable = false)
    private Boolean notificadoAUsuario = false;

    private LocalDateTime fechaNotificacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoAlerta.ACTIVA;
        if (this.prioridad == null) {
            this.prioridad = 3;
        }
    }

    public void resolver(String usuarioId, String descripcion) {
        this.estado = EstadoAlerta.RESUELTA;
        this.fechaResolucion = LocalDateTime.now();
        this.usuarioResolucion = usuarioId;
        this.descripcionResolucion = descripcion;
    }

    public void escalar() {
        this.estado = EstadoAlerta.ESCALADA;
        this.prioridad = Math.min(5, this.prioridad + 1);
    }

    public void ignorar() {
        this.estado = EstadoAlerta.IGNORADA;
    }
}
