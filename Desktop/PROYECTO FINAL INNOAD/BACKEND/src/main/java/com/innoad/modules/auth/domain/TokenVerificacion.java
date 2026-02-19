package com.innoad.modules.auth.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad para tokens de verificación de email
 */
@Entity
@Table(name = "tokens_verificacion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime expiraEn;

    @Column(nullable = false)
    private LocalDateTime creadoEn;

    private LocalDateTime verificadoEn;

    @PrePersist
    protected void onCreate() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
        if (expiraEn == null) {
            // Token válido por 24 horas
            expiraEn = LocalDateTime.now().plusHours(24);
        }
    }

    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(expiraEn);
    }

    public boolean estaVerificado() {
        return verificadoEn != null;
    }
}
