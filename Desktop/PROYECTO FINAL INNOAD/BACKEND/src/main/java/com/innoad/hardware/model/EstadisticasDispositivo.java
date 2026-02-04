package com.innoad.hardware.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "estadisticas_dispositivo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasDispositivo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dispositivo_id", nullable = false)
    private Long dispositivoId;
    
    @Column(name = "temperatura_promedio")
    private Double temperaturaPromedio;
    
    @Column(name = "humedad_promedio")
    private Double humedadPromedio;
    
    @Column(name = "tiempo_activo_minutos")
    private Integer tiempoActivoMinutos;
    
    @Column(name = "tasa_error")
    private Double tasaError;
    
    @Column(name = "ancho_banda_usado_mb")
    private Double anchoBandaUsadoMb;
    
    @Column(name = "fecha_reporte")
    private LocalDateTime fechaReporte;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
