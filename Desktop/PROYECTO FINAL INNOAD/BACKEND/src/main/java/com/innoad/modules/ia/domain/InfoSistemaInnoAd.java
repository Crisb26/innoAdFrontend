package com.innoad.modules.ia.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "info_sistema_innoad")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfoSistemaInnoAd {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clave; // nombreEmpresa, misionEmpresa, visionEmpresa, etc

    @Column(columnDefinition = "TEXT")
    private String valor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
