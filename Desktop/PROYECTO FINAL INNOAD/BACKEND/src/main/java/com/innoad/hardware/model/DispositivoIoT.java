package com.innoad.hardware.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dispositivo_iot")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispositivoIoT {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo;
    private String estado;
    private String ubicacion;
    private Double temperatura;
    private Double humedad;
    private LocalDateTime ultimaSincronizacion;
    private String ip;
    private String macAddress;
    private Boolean conectado;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion;
    
    @Column(name = "version_software")
    private String versionSoftware;
    
    @Column(name = "especificaciones", columnDefinition = "TEXT")
    private String especificaciones;
    
    @Transient
    private List<String> sensores;
}
