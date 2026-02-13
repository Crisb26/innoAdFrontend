package com.innoad.modules.publicaciones.repository;

import com.innoad.modules.publicaciones.model.Publicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {
    
    List<Publicacion> findByUsuarioId(Long usuarioId);
    
    List<Publicacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    
    List<Publicacion> findByEstado(Publicacion.EstadoPublicacion estado);
    
    List<Publicacion> findByEstadoOrderByFechaCreacionAsc(Publicacion.EstadoPublicacion estado);
    
    List<Publicacion> findByEstadoAndUsuarioId(Publicacion.EstadoPublicacion estado, Long usuarioId);
    
    @Query("SELECT p FROM Publicacion p WHERE p.estado = :estado ORDER BY p.fechaCreacion ASC")
    List<Publicacion> findPublicacionesPendientes(@Param("estado") Publicacion.EstadoPublicacion estado);
}
