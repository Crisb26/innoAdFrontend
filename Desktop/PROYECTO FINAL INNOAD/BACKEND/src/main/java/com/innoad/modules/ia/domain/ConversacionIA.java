package com.innoad.modules.ia.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad que almacena las conversaciones con el agente de IA.
 * Permite mantener un historial de interacciones para análisis y mejora continua.
 */
@Entity
@Table(name = "conversaciones_ia")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversacionIA {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensajeUsuario;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String respuestaIA;
    
    @Column(length = 100)
    private String contexto; // Ej: "creacion_publicidad", "consulta_general", "analisis_campana"
    
    @Column
    private LocalDateTime fechaConversacion;
    
    @Column
    private Integer tokensUsados;
    
    @Column
    private Double costoAproximado;
    
    @Column
    private Integer tiempoRespuestaMs; // Tiempo de respuesta en milisegundos
    
    @Column(length = 50)
    private String modeloUtilizado;
    
    @Column
    private Integer calificacion; // 1-5 estrellas
    
    @Column(columnDefinition = "TEXT")
    private String retroalimentacion; // Comentarios del usuario
    
    @Builder.Default
    @Column
    private Boolean exitoso = true; // Si la respuesta fue satisfactoria
    
    @Column(columnDefinition = "TEXT")
    private String mensajeError; // En caso de error
    
    @PrePersist
    protected void onCreate() {
        fechaConversacion = LocalDateTime.now();
    }
}

