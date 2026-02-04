package com.innoad.modules.admin.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad para registrar acciones de auditoría en el sistema.
 * Permite rastrear cambios críticos y actividades de usuarios.
 */
@Entity
@Table(name = "auditoria")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(nullable = false, length = 50)
    private String entidad;

    @Column
    private Long entidadId;

    @Column(length = 100)
    private String usuarioNombre;

    @Column
    private Long usuarioId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String detalles;

    @Column(length = 45)
    private String direccionIP;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(length = 20)
    private String resultado;

    @PrePersist
    protected void onCreate() {
        if (fechaHora == null) {
            fechaHora = LocalDateTime.now();
        }
    }
}
