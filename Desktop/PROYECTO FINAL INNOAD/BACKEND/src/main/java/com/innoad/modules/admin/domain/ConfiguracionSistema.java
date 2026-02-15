package com.innoad.modules.admin.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que almacena la configuración general del sistema InnoAd.
 * Incluye configuración de modo mantenimiento y otros parámetros globales.
 */
@Entity
@Table(name = "configuracion_sistema")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionSistema {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String clave; // Nombre de la configuración
    
    @Column(columnDefinition = "TEXT")
    private String valor; // Valor de la configuración
    
    @Column(length = 500)
    private String descripcion;
    
    @Column
    private LocalDateTime fechaActualizacion;
    
    @Column
    private Long usuarioActualizacionId; // ID del usuario que actualizó
    
    // Configuraciones específicas para modo mantenimiento
    @Builder.Default
    @Column
    private Boolean modoMantenimientoActivo = false;
    
    @Column(length = 20)
    private String codigoSeguridadMantenimiento;
    
    @Column(length = 150)
    private String emailRecuperacionCodigo;
    
    @Column
    private LocalDateTime fechaInicioMantenimiento;
    
    @Column
    private LocalDateTime fechaFinEstimadaMantenimiento;
    
    @Column(columnDefinition = "TEXT")
    private String mensajeMantenimiento;
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    /**
     * Constructor para crear configuraciones básicas
     */
    public ConfiguracionSistema(String clave, String valor, String descripcion) {
        this.clave = clave;
        this.valor = valor;
        this.descripcion = descripcion;
        this.fechaActualizacion = LocalDateTime.now();
    }
}

