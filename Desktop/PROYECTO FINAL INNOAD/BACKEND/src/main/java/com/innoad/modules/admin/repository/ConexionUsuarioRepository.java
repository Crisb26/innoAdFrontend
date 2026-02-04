package com.innoad.modules.admin.repository;

import com.innoad.modules.admin.domain.ConexionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConexionUsuarioRepository extends JpaRepository<ConexionUsuario, Long> {
    
    // Obtener todas las conexiones activas en tiempo real
    List<ConexionUsuario> findAllByConectadoActualmenteTrueOrderByFechaConexionDesc();
    
    // Obtener conexiones activas de hoy
    @Query("SELECT c FROM ConexionUsuario c WHERE c.conectadoActualmente = true AND DATE(c.fechaConexion) = :fecha")
    List<ConexionUsuario> findConexionesActivasHoy(@Param("fecha") LocalDate fecha);
    
    // Obtener el historial de conexiones de un usuario específico
    List<ConexionUsuario> findByUsuarioIdOrderByFechaConexionDesc(String usuarioId);
    
    // Obtener todas las conexiones del día (para el historial)
    @Query("SELECT c FROM ConexionUsuario c WHERE DATE(c.fechaConexion) = :fecha ORDER BY c.fechaConexion DESC")
    List<ConexionUsuario> findConexionesPorDia(@Param("fecha") LocalDate fecha);
    
    // Obtener conexión activa actual de un usuario
    @Query("SELECT c FROM ConexionUsuario c WHERE c.usuarioId = :usuarioId AND c.conectadoActualmente = true")
    Optional<ConexionUsuario> findConexionActivaActual(@Param("usuarioId") String usuarioId);
    
    // Contar conexiones activas en tiempo real
    @Query("SELECT COUNT(c) FROM ConexionUsuario c WHERE c.conectadoActualmente = true")
    long contarConexionesActivas();
    
    // Obtener máximo de conexiones simultáneas en un día
    @Query("SELECT MAX(CAST((SELECT COUNT(c2) FROM ConexionUsuario c2 WHERE c2.fechaConexion <= c.fechaConexion AND c2.fechaDesconexion >= c.fechaConexion) AS LONG)) FROM ConexionUsuario c WHERE DATE(c.fechaConexion) = :fecha")
    Long obtenerMaximoConexionesSiultaneas(@Param("fecha") LocalDate fecha);
}
