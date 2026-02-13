package com.innoad.modules.chat.dominio;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_usuario", indexes = {
        @Index(name = "idx_chat_usuario_id_tecnico", columnList = "id_usuario_tecnico"),
        @Index(name = "idx_chat_usuario_id_solicitante", columnList = "id_usuario_solicitante"),
        @Index(name = "idx_chat_usuario_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario_tecnico", nullable = false)
    private Usuario usuarioTecnico;

    @ManyToOne
    @JoinColumn(name = "id_usuario_solicitante", nullable = false)
    private Usuario usuarioSolicitante;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column
    private LocalDateTime fechaCierre;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
