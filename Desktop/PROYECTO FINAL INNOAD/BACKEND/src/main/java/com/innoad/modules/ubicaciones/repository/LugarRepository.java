package com.innoad.modules.ubicaciones.repository;

import com.innoad.modules.ubicaciones.model.Lugar;
import com.innoad.modules.ubicaciones.model.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LugarRepository extends JpaRepository<Lugar, Long> {
    List<Lugar> findByCiudadIdAndDisponibleTrue(Long ciudadId);
    List<Lugar> findByCiudadId(Long ciudadId);
}
