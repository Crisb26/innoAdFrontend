package com.innoad.modules.pantallas.dominio;

import jakarta.persistence.*;
import lombok.*;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.campanas.dominio.Campana;
import java.time.LocalDateTime;

@Entity
@Table(name = "pantallas", indexes = {
    @Index(name = "idx_pantallas_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_pantallas_codigo", columnList = "codigo"),
    @Index(name = "idx_pantallas_estado", columnList = "estado")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pantalla {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100, unique = true)
    private String codigo; // Identificador único de la pantalla
    
    @Column(nullable = false, length = 255)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false, length = 100)
    private String ubicacion;
    
    @Column(name = "resolucion", length = 50)
    private String resolucion; // Ej: 1920x1080
    
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EstadoPantalla estado;
    
    @Column(name = "conectada")
    private Boolean conectada;
    
    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id")
    private Campana campanaActual;
    
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "mac_address", length = 17)
    private String macAddress;
    
    @Column(name = "bateria_porcentaje")
    private Integer bateriaPortacentaje;
    
    @Column(name = "temperatura_cpu")
    private Double temperaturaCPU;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoPantalla.INACTIVA;
        }
        if (conectada == null) {
            conectada = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoPantalla {
        ACTIVA,
        INACTIVA,
        MANTENIMIENTO,
        DESCONECTADA,
        DEFECTUOSA
    }
}
