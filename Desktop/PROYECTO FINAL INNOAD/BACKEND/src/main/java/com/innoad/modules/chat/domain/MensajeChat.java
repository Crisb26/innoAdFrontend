package com.innoad.modules.chat.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad que representa un mensaje dentro de un chat
 */
@Entity
@Table(name = "mensajes_chat")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emisor_id", nullable = false)
    private Usuario emisor;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMensaje tipo;

    @Column(name = "archivo_url", length = 500)
    private String archivoUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean leido = false;

    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;

    @PrePersist
    protected void onCreate() {
        fechaEnvio = LocalDateTime.now();
        if (tipo == null) {
            tipo = TipoMensaje.TEXTO;
        }
    }

    /**
     * Tipos de mensaje posibles
     */
    public enum TipoMensaje {
        TEXTO,     // Mensaje de texto simple
        IMAGEN,    // Mensaje con imagen adjunta
        AUDIO,     // Mensaje de audio
        ARCHIVO,   // Archivo adjunto
        SISTEMA    // Mensaje automático del sistema
    }

    /**
     * Marcar mensaje como leído
     */
    public void marcarComoLeido() {
        this.leido = true;
        this.fechaLectura = LocalDateTime.now();
    }

    /**
     * Verificar si el mensaje es una respuesta de soporte
     */
    public boolean esDeEquipoSoporte() {
        return emisor.esTecnico() || emisor.esAdministrador();
    }

    /**
     * Verificar si el mensaje es del usuario final
     */
    public boolean esDelUsuario() {
        return emisor.esUsuario();
    }
}
