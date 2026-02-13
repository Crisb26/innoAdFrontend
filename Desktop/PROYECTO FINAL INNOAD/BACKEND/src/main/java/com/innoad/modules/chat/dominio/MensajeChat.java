package com.innoad.modules.chat.dominio;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensaje_chat", indexes = {
        @Index(name = "idx_mensaje_chat_id_chat", columnList = "id_chat_usuario"),
        @Index(name = "idx_mensaje_chat_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MensajeChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_chat_usuario", nullable = false)
    private ChatUsuario chat;

    @ManyToOne
    @JoinColumn(name = "id_usuario_remitente", nullable = false)
    private Usuario usuarioRemitente;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean leido = false;

    @Column
    private LocalDateTime fechaLectura;

    @PreUpdate
    protected void onUpdate() {
        if (this.leido && this.fechaLectura == null) {
            this.fechaLectura = LocalDateTime.now();
        }
    }
}
