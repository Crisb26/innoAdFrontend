package com.innoad.modules.admin.domain;

import com.innoad.shared.dto.RolUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // ===== NUEVOS CAMPOS: Control de Roles =====

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_mantenimiento")
    private TipoMantenimiento tipoMantenimiento;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mantenimiento_roles_afectados",
                     joinColumns = @JoinColumn(name = "configuracion_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "rol")
    private List<RolUsuario> rolesAfectados = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mantenimiento_roles_excluidos",
                     joinColumns = @JoinColumn(name = "configuracion_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "rol")
    private List<RolUsuario> rolesExcluidos = new ArrayList<>();

    @Column(name = "url_contacto_soporte", length = 500)
    private String urlContactoSoporte;

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    // ===== MÉTODOS UTILITY =====

    /**
     * Verifica si el modo mantenimiento está activo y dentro del rango de tiempo
     */
    public boolean estaActivo() {
        if (!modoMantenimientoActivo) {
            return false;
        }

        // Verificar si ya pasó la fecha fin
        if (fechaFinEstimadaMantenimiento != null) {
            return LocalDateTime.now().isBefore(fechaFinEstimadaMantenimiento);
        }

        return true;
    }

    /**
     * Verifica si un usuario puede acceder durante el mantenimiento
     */
    public boolean puedeAcceder(RolUsuario rol) {
        if (!estaActivo()) {
            return true; // Acceso normal
        }

        // Si está en rolesExcluidos, puede acceder
        if (rolesExcluidos != null && rolesExcluidos.contains(rol)) {
            return true;
        }

        // Si está en rolesAfectados, NO puede acceder
        if (rolesAfectados != null && rolesAfectados.contains(rol)) {
            return false;
        }

        // Por defecto, puede acceder
        return true;
    }

    /**
     * Obtiene el tiempo restante en formato legible
     */
    public String getTiempoRestante() {
        if (!estaActivo()) {
            return "Mantenimiento finalizado";
        }

        if (fechaFinEstimadaMantenimiento == null) {
            return "Duración indefinida";
        }

        long minutos = java.time.temporal.ChronoUnit.MINUTES
                .between(LocalDateTime.now(), fechaFinEstimadaMantenimiento);

        if (minutos <= 0) {
            return "Finalizando...";
        }

        if (minutos < 60) {
            return minutos + " minutos";
        }

        long horas = minutos / 60;
        return horas + " hora" + (horas > 1 ? "s" : "");
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

