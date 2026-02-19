package com.innoad.modules.pagos.domain;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.publicaciones.domain.Publicacion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carrito_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicacion_id", nullable = false)
    private Publicacion publicacion;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private BigDecimal precioUnitarioCOP;

    @Column(name = "fecha_agregado")
    private LocalDateTime fechaAgregado;

    @PrePersist
    protected void onCreate() {
        fechaAgregado = LocalDateTime.now();
        if (cantidad == null) {
            cantidad = 1;
        }
    }

    public BigDecimal getSubtotal() {
        return precioUnitarioCOP.multiply(new BigDecimal(cantidad));
    }
}
