package com.innoad.modules.ubicaciones.repository;

import com.innoad.modules.ubicaciones.model.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudad, Long> {
    List<Ciudad> findByActivaTrue();
    Optional<Ciudad> findByNombre(String nombre);
}
