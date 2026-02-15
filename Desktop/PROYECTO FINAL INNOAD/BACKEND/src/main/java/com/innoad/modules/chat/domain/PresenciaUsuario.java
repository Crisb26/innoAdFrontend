package com.innoad.modules.chat.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad que rastrea la presencia online de usuarios en tiempo real
 */
@Entity
@Table(name = "presencia_usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenciaUsuario {

    @Id
    private Long usuarioId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @MapsId
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPresencia estado;

    @Column(name = "ultima_actividad")
    private LocalDateTime ultimaActividad;

    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion;

    /**
     * Estados de presencia posibles
     */
    public enum EstadoPresencia {
        ONLINE,   // Conectado actualmente
        AUSENTE,  // No ha tenido actividad recientemente
        OFFLINE   // Desconectado
    }

    /**
     * Actualizar presencia a online
     */
    public void conectar() {
        this.estado = EstadoPresencia.ONLINE;
        this.ultimaConexion = LocalDateTime.now();
        this.ultimaActividad = LocalDateTime.now();
    }

    /**
     * Registrar actividad del usuario
     */
    public void registrarActividad() {
        this.ultimaActividad = LocalDateTime.now();
        if (this.estado != EstadoPresencia.ONLINE) {
            this.estado = EstadoPresencia.ONLINE;
        }
    }

    /**
     * Desconectar usuario
     */
    public void desconectar() {
        this.estado = EstadoPresencia.OFFLINE;
    }

    /**
     * Verificar si usuario está online
     */
    public boolean estaOnline() {
        return estado == EstadoPresencia.ONLINE;
    }

    /**
     * Verificar si usuario está ausente
     */
    public boolean estaAusente() {
        return estado == EstadoPresencia.AUSENTE;
    }

    /**
     * Obtener tiempo desde última actividad (en minutos)
     */
    public long obtenerMinutosInactividad() {
        if (ultimaActividad == null) {
            return Long.MAX_VALUE;
        }
        return java.time.temporal.ChronoUnit.MINUTES.between(ultimaActividad, LocalDateTime.now());
    }
}
