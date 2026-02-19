package com.innoad.modules.chat.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa un chat entre usuarios y técnicos en InnoAd
 */
@Entity
@Table(name = "chats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TipoChat tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoChat estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Usuario admin;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_transferencia")
    private LocalDateTime fechaTransferencia;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MensajeChat> mensajes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoChat.ACTIVO;
        }
    }

    /**
     * Tipos de chat posibles
     */
    public enum TipoChat {
        USUARIO_TECNICO,  // Chat normal con técnico
        TECNICO_ADMIN,    // Chat para escalar a admin
        USUARIO_ADMIN     // Chat directo con admin
    }

    /**
     * Estados del chat
     */
    public enum EstadoChat {
        ACTIVO,       // Chat abierto y activo
        TRANSFERIDO,  // Chat transferido a admin
        CERRADO       // Chat cerrado
    }

    /**
     * Verificar si el chat está activo
     */
    public boolean estaActivo() {
        return estado == EstadoChat.ACTIVO;
    }

    /**
     * Verificar si el chat fue transferido
     */
    public boolean fueTransferido() {
        return estado == EstadoChat.TRANSFERIDO && admin != null;
    }

    /**
     * Obtener el interlocutor para el usuario actual
     */
    public Usuario obtenerInterlocutor(Usuario usuarioActual) {
        if (usuarioActual.getId().equals(usuario.getId())) {
            // Usuario pregunta: su interlocutor es técnico o admin
            return estado == EstadoChat.TRANSFERIDO ? admin : tecnico;
        } else {
            // Técnico/Admin contesta: su interlocutor es el usuario
            return usuario;
        }
    }
}
