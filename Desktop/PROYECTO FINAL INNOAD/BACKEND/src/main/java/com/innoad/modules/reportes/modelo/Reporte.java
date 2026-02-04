package com.innoad.modules.reportes.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "reportes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reporte {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(nullable = false)
    private String tipo; // CAMPANA, CONTENIDO, ANALYTICS, USUARIOS
    
    @Column(nullable = false)
    private String periodo; // DIARIO, SEMANAL, MENSUAL, PERSONALIZADO
    
    @Column(nullable = false)
    private LocalDateTime fechaGeneracion;
    
    @Column(nullable = false)
    private String generadoPor; // Usuario que generó el reporte
    
    @Column(nullable = false)
    private String estado; // PENDIENTE, PROCESANDO, COMPLETADO, ERROR
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String datos; // JSON con los datos del reporte
    
    @Column
    private Double costoGeneracion; // Costo en tokens o recursos
    
    @Column
    private Integer tokensUsados;
    
    @Column
    private String urlDescarga; // URL para descargar PDF/Excel
    
    @Column
    private Boolean disponible;
    
    @Column
    private LocalDateTime fechaExpiracion;
    
    public String obtenerResumen() {
        return String.format("Reporte %s generado el %s por %s", titulo, fechaGeneracion, generadoPor);
    }
}
