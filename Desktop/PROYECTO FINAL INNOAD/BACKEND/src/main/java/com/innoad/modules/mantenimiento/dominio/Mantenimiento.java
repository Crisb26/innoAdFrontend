package com.innoad.modules.mantenimiento.dominio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "mantenimiento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mantenimiento implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EstadoMantenimiento estado = EstadoMantenimiento.INACTIVO; // ACTIVO, INACTIVO
    
    @Column(nullable = false)
    private String motivo;
    
    @Column(length = 1000)
    private String mensaje; // Mensaje visible a los usuarios
    
    @Column(nullable = false)
    private String passwordHash; // Contraseña hasheada para acceso
    
    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;
    
    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;
    
    @Column(name = "permite_lectura")
    @Builder.Default
    private Boolean permiteLectura = false; // ¿Permite solo lectura?
    
    @Column(name = "bloquea_graficos")
    @Builder.Default
    private Boolean bloqueaGraficos = true;
    
    @Column(name = "bloquea_publicacion")
    @Builder.Default
    private Boolean bloqueaPublicacion = true;
    
    @Column(name = "bloquea_descarga")
    @Builder.Default
    private Boolean bloqueaDescarga = true;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "creado_por")
    private String creadoPor; // Email del admin que creó
    
    public enum EstadoMantenimiento {
        ACTIVO("Sistema en mantenimiento"),
        INACTIVO("Sistema operacional");
        
        public final String descripcion;
        
        EstadoMantenimiento(String descripcion) {
            this.descripcion = descripcion;
        }
    }
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoMantenimiento.INACTIVO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
