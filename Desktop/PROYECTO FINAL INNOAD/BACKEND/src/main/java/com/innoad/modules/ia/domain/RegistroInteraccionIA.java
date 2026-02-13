package com.innoad.modules.ia.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "registro_interaccion_ia", indexes = {
        @Index(name = "idx_interaccion_usuario", columnList = "id_usuario"),
        @Index(name = "idx_interaccion_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroInteraccionIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String pregunta;

    @Column(columnDefinition = "TEXT")
    private String respuesta;

    @Column(nullable = false)
    private String estado; // COMPLETADA, FALLIDA, PROCESANDO

    @Column
    private Integer tokensUtilizados;

    @Column
    private Float tiempoRespuesta; // en segundos

    @Column(columnDefinition = "TEXT")
    private String mensajeError;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column
    private LocalDateTime fechaCompletacion;
}
