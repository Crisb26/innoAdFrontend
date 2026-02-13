package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.RegistroInteraccionIA;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositorioRegistroInteraccionIA extends JpaRepository<RegistroInteraccionIA, Long> {

    @Query("SELECT r FROM RegistroInteraccionIA r WHERE r.usuario.id = :usuarioId ORDER BY r.fechaCreacion DESC")
    Page<RegistroInteraccionIA> obtenerRegistrosPorUsuario(@Param("usuarioId") Long usuarioId, Pageable pageable);

    @Query("SELECT r FROM RegistroInteraccionIA r WHERE r.estado = :estado ORDER BY r.fechaCreacion DESC")
    List<RegistroInteraccionIA> obtenerRegistrosPorEstado(@Param("estado") String estado);

    @Query("SELECT COUNT(r) FROM RegistroInteraccionIA r WHERE r.usuario.id = :usuarioId AND r.estado = 'COMPLETADA'")
    long contarInteraccionesCompletadas(@Param("usuarioId") Long usuarioId);
}
