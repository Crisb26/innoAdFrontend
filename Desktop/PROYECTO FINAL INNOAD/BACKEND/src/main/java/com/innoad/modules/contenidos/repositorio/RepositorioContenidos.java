package com.innoad.modules.contenidos.repositorio;

import com.innoad.modules.contenidos.dominio.Contenido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioContenidos extends JpaRepository<Contenido, Long> {
    
    @Query("SELECT c FROM Contenido c WHERE c.id = :id AND c.usuario.id = :usuarioId")
    Optional<Contenido> findByIdAndUsuarioId(@Param("id") Long id, @Param("usuarioId") Long usuarioId);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId ORDER BY c.fechaCreacion DESC")
    Page<Contenido> findByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId AND c.campana.id = :campanaId ORDER BY c.fechaCreacion DESC")
    Page<Contenido> findByCampanaId(@Param("usuarioId") Long usuarioId, @Param("campanaId") Long campanaId, Pageable pageable);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId AND LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) ORDER BY c.fechaCreacion DESC")
    Page<Contenido> buscarPorNombre(@Param("usuarioId") Long usuarioId, @Param("nombre") String nombre, Pageable pageable);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId AND c.tipo = :tipo ORDER BY c.fechaCreacion DESC")
    Page<Contenido> buscarPorTipo(@Param("usuarioId") Long usuarioId, @Param("tipo") Contenido.TipoContenido tipo, Pageable pageable);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId AND c.estado = :estado ORDER BY c.fechaCreacion DESC")
    Page<Contenido> buscarPorEstado(@Param("usuarioId") Long usuarioId, @Param("estado") Contenido.EstadoContenido estado, Pageable pageable);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId AND c.estado = 'ACTIVO' ORDER BY c.vecesReproducido DESC")
    List<Contenido> findContenidosMasReproducidos(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(c) FROM Contenido c WHERE c.usuario.id = :usuarioId AND c.campana.id = :campanaId")
    long countByCampanaId(@Param("usuarioId") Long usuarioId, @Param("campanaId") Long campanaId);
    
    @Query("SELECT c FROM Contenido c WHERE c.usuario.id = :usuarioId AND c.fechaCreacion >= :fechaInicio AND c.fechaCreacion <= :fechaFin")
    List<Contenido> findByFechaRango(@Param("usuarioId") Long usuarioId, @Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT SUM(c.tamaño) FROM Contenido c WHERE c.usuario.id = :usuarioId")
    Long getTamañoTotalContenidos(@Param("usuarioId") Long usuarioId);
}
