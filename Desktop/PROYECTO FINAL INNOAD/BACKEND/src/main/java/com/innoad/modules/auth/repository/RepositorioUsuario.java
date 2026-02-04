package com.innoad.modules.auth.repository;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.shared.dto.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de usuarios en la base de datos.
 * Proporciona métodos para consultas personalizadas relacionadas con usuarios.
 */
@Repository
public interface RepositorioUsuario extends JpaRepository<Usuario, Long> {
    
    /**
     * Busca un usuario por su nombre de usuario
     */
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    
    /**
     * Busca un usuario por su email
     */
    Optional<Usuario> findByEmail(String email);
    
    /**
     * Busca un usuario por su token de verificación
     */
    Optional<Usuario> findByTokenVerificacion(String token);
    
    /**
     * Busca un usuario por su token de recuperación
     */
    Optional<Usuario> findByTokenRecuperacion(String token);
    
    /**
     * Verifica si existe un usuario con el nombre de usuario dado
     */
    boolean existsByNombreUsuario(String nombreUsuario);
    
    /**
     * Verifica si existe un usuario con el email dado
     */
    boolean existsByEmail(String email);
    
    /**
     * Busca todos los usuarios por rol
     */
    List<Usuario> findByRol(RolUsuario rol);
    
    /**
     * Busca usuarios activos
     */
    List<Usuario> findByActivoTrue();
    
    /**
     * Busca usuarios por estado de verificación
     */
    List<Usuario> findByVerificado(Boolean verificado);
    
    /**
     * Cuenta el número total de usuarios activos
     */
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.activo = true")
    Long contarUsuariosActivos();
    
    /**
     * Busca usuarios que se registraron después de una fecha
     */
    List<Usuario> findByFechaRegistroAfter(LocalDateTime fecha);
    
    /**
     * Busca usuarios por nombre o apellido (búsqueda parcial)
     */
    @Query("SELECT u FROM Usuario u WHERE " +
           "LOWER(u.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(u.apellido) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Usuario> buscarPorNombreOApellido(@Param("termino") String termino);
    
    /**
     * Obtiene usuarios con intentos fallidos de login mayores a un número dado
     */
    List<Usuario> findByIntentosFallidosGreaterThan(Integer intentos);
    
    /**
     * Busca usuarios bloqueados
     */
    @Query("SELECT u FROM Usuario u WHERE u.fechaBloqueo IS NOT NULL AND " +
           "u.fechaBloqueo > :hace24Horas")
    List<Usuario> encontrarUsuariosBloqueados(@Param("hace24Horas") LocalDateTime hace24Horas);
    
    /**
     * Obtiene los últimos usuarios registrados
     */
    @Query("SELECT u FROM Usuario u ORDER BY u.fechaRegistro DESC")
    List<Usuario> encontrarUltimosUsuarios();
    
    /**
     * Busca usuarios por rol y estado activo
     */
    List<Usuario> findByRolAndActivo(RolUsuario rol, Boolean activo);

    /**
     * Cuenta usuarios por rol
     */
    Long countByRol(RolUsuario rol);

    /**
     * Cuenta usuarios verificados
     */
    Long countByVerificado(Boolean verificado);

    /**
     * Cuenta usuarios inactivos
     */
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.activo = false")
    Long contarUsuariosInactivos();

    /**
     * Busca todos los usuarios ordenados por fecha de registro descendente
     */
    List<Usuario> findAllByOrderByFechaRegistroDesc();

    /**
     * Busca usuarios con búsqueda general
     */
    @Query("SELECT u FROM Usuario u WHERE " +
           "LOWER(u.nombreUsuario) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(u.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(u.apellido) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Usuario> buscarUsuarios(@Param("termino") String termino);
}
