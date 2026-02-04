package com.innoad.modules.ubicaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "pisos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Piso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lugar_id", nullable = false)
    private Lugar lugar;
    
    @Column(nullable = false)
    private Integer numero;
    
    @Column
    private Boolean disponible = true;
    
    @Column
    private BigDecimal costoPorDia;
}
