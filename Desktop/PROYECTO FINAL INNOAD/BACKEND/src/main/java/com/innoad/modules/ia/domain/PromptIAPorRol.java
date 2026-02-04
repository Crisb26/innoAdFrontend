package com.innoad.modules.ia.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prompt_ia_por_rol", indexes = {
        @Index(name = "idx_prompt_rol", columnList = "rol"),
        @Index(name = "idx_prompt_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromptIAPorRol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String rol; // ROLE_ADMIN, ROLE_TECNICO, ROLE_DEVELOPER, ROLE_USUARIO

    @Column(columnDefinition = "TEXT", nullable = false)
    private String instruccion;

    @Column(columnDefinition = "TEXT")
    private String contexto;

    @Column(nullable = false)
    private Integer tokenMaximo = 2000;

    @Column(nullable = false)
    private Float temperatura = 0.7f;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_usuario_creador")
    private Usuario usuarioCreador;

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
