package com.innoad.modules.ia.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "registro_email_ia", indexes = {
        @Index(name = "idx_registro_email_usuario", columnList = "id_usuario"),
        @Index(name = "idx_registro_email_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroEmailIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String direccionDestinatario;

    @Column(nullable = false)
    private String asunto;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(nullable = false)
    private String estado; // ENVIADO, FALLIDO, PENDIENTE

    @Column(columnDefinition = "TEXT")
    private String mensajeError;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column
    private LocalDateTime fechaEnvio;
}
