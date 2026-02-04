package com.innoad.modules.ia.repository;

import com.innoad.modules.ia.domain.HorarioAtencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioHorarioAtencion extends JpaRepository<HorarioAtencion, Long> {

    @Query("SELECT h FROM HorarioAtencion h WHERE h.diaSemana = :diaSemana AND h.activo = true")
    Optional<HorarioAtencion> obtenerHorarioPorDia(@Param("diaSemana") String diaSemana);

    @Query("SELECT h FROM HorarioAtencion h WHERE h.activo = true ORDER BY h.diaSemana ASC")
    List<HorarioAtencion> obtenerHorariosActivos();
}
