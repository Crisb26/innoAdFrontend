package com.innoad.modules.ia.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_configurado", indexes = {
        @Index(name = "idx_email_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailConfigurado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String direccionEmail;

    @Column(nullable = false)
    private String contrasenia; // Encriptada

    @Column(nullable = false)
    private String proveedorSMTP; // smtp.gmail.com, etc

    @Column(nullable = false)
    private Integer puertoSMTP = 587;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
