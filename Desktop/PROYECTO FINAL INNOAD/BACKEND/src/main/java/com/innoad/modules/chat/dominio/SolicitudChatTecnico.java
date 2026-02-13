package com.innoad.modules.chat.dominio;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud_chat_tecnico", indexes = {
        @Index(name = "idx_solicitud_chat_usuario", columnList = "id_usuario"),
        @Index(name = "idx_solicitud_chat_estado", columnList = "estado")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudChatTecnico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column
    private LocalDateTime fechaAsignacion;

    @ManyToOne
    @JoinColumn(name = "id_tecnico_asignado")
    private Usuario tecnicoAsignado;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public enum EstadoSolicitud {
        PENDIENTE, ASIGNADA, EN_PROGRESO, RESUELTA, CANCELADA
    }
}
