package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.RegistroEmailIA;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositorioRegistroEmailIA extends JpaRepository<RegistroEmailIA, Long> {

    @Query("SELECT r FROM RegistroEmailIA r WHERE r.usuario.id = :usuarioId ORDER BY r.fechaCreacion DESC")
    Page<RegistroEmailIA> obtenerRegistrosPorUsuario(@Param("usuarioId") Long usuarioId, Pageable pageable);

    @Query("SELECT r FROM RegistroEmailIA r WHERE r.estado = :estado ORDER BY r.fechaCreacion DESC")
    List<RegistroEmailIA> obtenerRegistrosPorEstado(@Param("estado") String estado);
}
