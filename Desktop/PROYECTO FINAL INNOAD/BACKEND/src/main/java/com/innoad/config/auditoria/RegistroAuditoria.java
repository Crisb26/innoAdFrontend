package com.innoad.config.auditoria;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_accesos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroAuditoria {
    
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
    private String tipoAccion; // LOGIN, LOGOUT, ACCESO_RECURSO, MODIFICACION, ELIMINACION, etc
    
    @Column(nullable = false)
    private String recursoAccedido; // /api/admin, /api/campanas, etc
    
    @Column(nullable = false)
    private String metodo; // GET, POST, PUT, DELETE
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column
    private String resultado; // EXITOSO, FALLIDO, BLOQUEADO
    
    @Column
    private String detalles; // JSON con información adicional
    
    @Column
    private String navegador;
    
    @Column
    private String sistemaOperativo;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean esSospechoso = false;
    
    @Column
    private String razonSospechaActividad;
}
