package com.innoad.modules.ubicaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "lugares")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lugar {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ciudad_id", nullable = false)
    private Ciudad ciudad;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private Integer pisos = 1;
    
    @Column(nullable = false)
    private BigDecimal costoBase;
    
    @Column
    private Boolean disponible = true;
    
    @Column
    private String descripcion;
}
