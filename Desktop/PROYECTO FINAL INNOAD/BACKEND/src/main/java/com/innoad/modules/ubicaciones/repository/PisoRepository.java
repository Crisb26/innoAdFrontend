package com.innoad.modules.ubicaciones.repository;

import com.innoad.modules.ubicaciones.model.Piso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PisoRepository extends JpaRepository<Piso, Long> {
    List<Piso> findByLugarIdAndDisponibleTrue(Long lugarId);
    List<Piso> findByLugarId(Long lugarId);
}
