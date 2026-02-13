package com.innoad.modules.pantallas.repositorio;

import com.innoad.modules.pantallas.dominio.Pantalla;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface RepositorioPantallas extends JpaRepository<Pantalla, Long> {
    
    // Búsquedas por usuario
    Page<Pantalla> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId, Pageable pageable);
    
    // Búsqueda por código (único)
    Optional<Pantalla> findByCodigo(String codigo);
    
    // Búsqueda por código y usuario
    Optional<Pantalla> findByCodigoAndUsuarioId(String codigo, Long usuarioId);
    
    // Búsqueda por ID y usuario (seguridad)
    Optional<Pantalla> findByIdAndUsuarioId(Long id, Long usuarioId);
    
    // Búsquedas por estado
    Page<Pantalla> findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(Long usuarioId, Pantalla.EstadoPantalla estado, Pageable pageable);
    
    // Pantallas conectadas
    List<Pantalla> findByUsuarioIdAndConectada(Long usuarioId, Boolean conectada);
    
    @Query("SELECT p FROM Pantalla p WHERE p.usuario.id = :usuarioId AND p.conectada = true ORDER BY p.ultimaConexion DESC")
    List<Pantalla> findPantallasConectadas(@Param("usuarioId") Long usuarioId);
    
    // Contar pantallas activas
    @Query("SELECT COUNT(p) FROM Pantalla p WHERE p.usuario.id = :usuarioId AND p.estado = 'ACTIVA'")
    long countPantallasActivas(@Param("usuarioId") Long usuarioId);
    
    // Búsqueda por nombre
    Page<Pantalla> findByUsuarioIdAndNombreContainingIgnoreCaseOrderByFechaCreacionDesc(Long usuarioId, String nombre, Pageable pageable);
}
