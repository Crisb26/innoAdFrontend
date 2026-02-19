package com.innoad.modules.auth.domain;

import com.innoad.shared.dto.RolUsuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Entidad que representa un usuario en el sistema InnoAd.
 * Implementa UserDetails para integración con Spring Security.
 */
@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String apellido;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    @Column(unique = true, nullable = false, length = 150)
    private String email;
    
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 4, max = 50, message = "El nombre de usuario debe tener entre 4 y 50 caracteres")
    @Column(unique = true, nullable = false, length = 50)
    private String nombreUsuario;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    private String contrasena;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;
    
    @Column(length = 20)
    private String telefono;
    
    @Column(length = 200)
    private String direccion;
    
    @Column(length = 200)
    private String empresa;
    
    @Column(length = 100)
    private String cargo;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String fotoPerfil; // URL o Base64
    
    @Column(length = 20)
    private String cedula;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean verificado = false;
    
    @Column
    private LocalDateTime fechaRegistro;
    
    @Column
    private LocalDateTime ultimoAcceso;
    
    @Column
    private String tokenVerificacion;
    
    @Column
    private LocalDateTime tokenVerificacionExpiracion;
    
    @Column
    private String tokenRecuperacion;
    
    @Column
    private LocalDateTime tokenRecuperacionExpiracion;
    
    @Builder.Default
    @Column
    private Integer intentosFallidos = 0;
    
    @Column
    private LocalDateTime fechaBloqueo;
    
    @Column(columnDefinition = "TEXT")
    private String preferenciaNotificaciones; // JSON con preferencias
    
    // Métodos de UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }
    
    @Override
    public String getPassword() {
        return contrasena;
    }
    
    @Override
    public String getUsername() {
        return nombreUsuario;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return fechaBloqueo == null || LocalDateTime.now().isAfter(fechaBloqueo.plusHours(24));
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return activo;
    }
    
    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }
    
    /**
     * Método auxiliar para obtener el nombre completo del usuario
     */
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
    
    /**
     * Verifica si el usuario tiene un rol específico
     */
    public boolean tieneRol(RolUsuario rolAVerificar) {
        return this.rol == rolAVerificar;
    }
    
    /**
     * Verifica si el usuario es administrador
     */
    public boolean esAdministrador() {
        return this.rol == RolUsuario.ADMIN;
    }

    /**
     * Verifica si el usuario es técnico
     */
    public boolean esTecnico() {
        return this.rol == RolUsuario.TECNICO;
    }

    /**
     * Verifica si el usuario es usuario regular
     */
    public boolean esUsuario() {
        return this.rol == RolUsuario.USUARIO;
    }

    /**
     * Verifica si el usuario tiene permisos de acceso durante mantenimiento
     */
    public boolean puedeAccederEnMantenimiento() {
        return this.rol == RolUsuario.ADMIN ||
               this.rol == RolUsuario.TECNICO;
    }
}

