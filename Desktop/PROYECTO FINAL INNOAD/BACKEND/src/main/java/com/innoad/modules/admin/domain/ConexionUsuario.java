package com.innoad.modules.admin.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "conexiones_usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConexionUsuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String usuarioId;
    
    @Column(nullable = false)
    private String nombreUsuario;
    
    @Column(nullable = false)
    private String ipAddress;
    
    @Column(nullable = false)
    private String navegador;
    
    @Column(nullable = false)
    private String sistemaOperativo;
    
    @Column(nullable = false)
    private LocalDateTime fechaConexion;
    
    @Column
    private LocalDateTime fechaDesconexion;
    
    @Column(nullable = false)
    private boolean conectadoActualmente;
    
    @Column
    private Long tiempoConexionSegundos;
    
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime fechaRegistro = LocalDateTime.now();
    
    @Column(nullable = false)
    @Builder.Default
    private String estado = "ACTIVO";
    
    // Para saber la fecha del día del registro (para limpiar cada medianoche)
    @Column(nullable = false)
    private String fechaRegistroDia;
}
