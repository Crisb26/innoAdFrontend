package com.innoad.modules.screens.domain;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.content.domain.Contenido;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa una pantalla física (Raspberry Pi)
 * conectada al sistema para mostrar contenidos publicitarios.
 */
@Entity
@Table(name = "pantallas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pantalla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre descriptivo de la pantalla
     */
    @NotBlank(message = "El nombre de la pantalla es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    /**
     * Descripción o ubicación de la pantalla
     */
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    @Column(length = 500)
    private String descripcion;

    /**
     * Código único de identificación de la pantalla (para conectar Raspberry Pi)
     */
    @NotBlank(message = "El código de identificación es obligatorio")
    @Column(nullable = false, unique = true, length = 50)
    private String codigoIdentificacion;

    /**
     * Token de autenticación para la pantalla
     */
    @Column(length = 500)
    private String tokenAutenticacion;

    /**
     * Estado de la pantalla: ACTIVA, INACTIVA, MANTENIMIENTO, DESCONECTADA
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "INACTIVA";

    /**
     * Ubicación física de la pantalla
     */
    @Column(length = 200)
    private String ubicacion;

    /**
     * Resolución de la pantalla (ej: 1920x1080)
     */
    @Column(length = 20)
    private String resolucion;

    /**
     * Orientación: HORIZONTAL, VERTICAL
     */
    @Column(length = 20)
    @Builder.Default
    private String orientacion = "HORIZONTAL";

    /**
     * Usuario propietario de la pantalla
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /**
     * Fecha de registro de la pantalla
     */
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    /**
     * Última fecha de conexión
     */
    private LocalDateTime ultimaConexion;

    /**
     * Última fecha de sincronización de contenidos
     */
    private LocalDateTime ultimaSincronizacion;

    /**
     * Dirección IP de la Raspberry Pi
     */
    @Column(length = 45)
    private String direccionIp;

    /**
     * Versión del software instalado en la Raspberry Pi
     */
    @Column(length = 20)
    private String versionSoftware;

    /**
     * Información del sistema (Raspberry Pi Model, RAM, etc.)
     */
    @Column(length = 500)
    private String informacionSistema;

    /**
     * Contenidos asignados a esta pantalla
     */
    @OneToMany(mappedBy = "pantalla", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Contenido> contenidos = new ArrayList<>();

    /**
     * Notas adicionales
     */
    @Column(columnDefinition = "TEXT")
    private String notas;

    /**
     * Verifica si la pantalla está activa
     */
    public boolean estaActiva() {
        return "ACTIVA".equals(estado);
    }

    /**
     * Verifica si la pantalla está conectada (última conexión en los últimos 5 minutos)
     */
    public boolean estaConectada() {
        if (ultimaConexion == null) {
            return false;
        }
        return ultimaConexion.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    /**
     * Actualiza la última conexión
     */
    public void actualizarConexion() {
        this.ultimaConexion = LocalDateTime.now();
    }

    /**
     * Actualiza la última sincronización
     */
    public void actualizarSincronizacion() {
        this.ultimaSincronizacion = LocalDateTime.now();
    }
}
