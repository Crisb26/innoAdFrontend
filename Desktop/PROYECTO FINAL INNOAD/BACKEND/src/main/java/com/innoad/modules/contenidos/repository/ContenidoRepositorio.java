package com.innoad.modules.contenidos.repository;

import com.innoad.modules.contenidos.model.ContenidoRemoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContenidoRepositorio extends JpaRepository<ContenidoRemoto, Long> {
    List<ContenidoRemoto> findByActivoTrue();
    List<ContenidoRepositorio> findByTipo(String tipo);
}
